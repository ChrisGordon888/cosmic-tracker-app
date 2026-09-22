const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const mongoose = require('mongoose');
const { buildASTSchema, validateSchema, validate } = require('graphql');
const { ApolloServer } = require('apollo-server-express');
const Opportunity = require('../models/Opportunity');
const ReleaseWorld = require('../models/ReleaseWorld');
const resolvers = require('../resolvers');
const typeDefs = require('../schemas');

// Use the installed TypeScript compiler without introducing a test framework.
const ts = require('../../frontend/node_modules/typescript');
const source = fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/opportunityPriority.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(compiled, sandbox);
const { todaysOpportunities, opportunityReason, localOpportunityDate } = sandbox.exports;

// Load the actual client documents so selection-set/input drift cannot hide behind resolver-only tests.
const documentSource = fs.readFileSync(path.join(__dirname, '../../frontend/src/graphql/opportunities.ts'), 'utf8');
const documentCode = ts.transpileModule(documentSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const documentSandbox = { exports: {}, require: (name) => {
    assert.equal(name, '@apollo/client');
    return require('../../frontend/node_modules/@apollo/client');
} };
vm.runInNewContext(documentCode, documentSandbox);
const documents = documentSandbox.exports;

test('All four frontend opportunity documents validate against the backend schema', () => {
    const schema = buildASTSchema(typeDefs);
    for (const [name, document] of Object.entries(documents)) {
        assert.deepEqual(validate(schema, document).map((error) => error.message), [], name);
    }
});

function candidate(id, extra = {}) {
    return { id, status: 'open', traction: 'exploring', nextAction: 'Share a demo', followUpOn: null, createdAt: '2026-09-01T00:00:00.000Z', ...extra };
}

test('Today’s 3 handles dates, traction, stable ties and does not mutate input', () => {
    const items = [
        candidate('future', { followUpOn: '2026-09-23', traction: 'next-step-agreed' }),
        candidate('closed', { status: 'achieved' }),
        candidate('blank', { nextAction: '   ' }),
        candidate('undated', { traction: 'next-step-agreed' }),
        candidate('exploring', { followUpOn: '2026-09-01' }),
        candidate('interest', { followUpOn: '2026-09-20', traction: 'interest-expressed' }),
        candidate('agreed', { followUpOn: '2026-09-22', traction: 'next-step-agreed' }),
    ];
    const before = JSON.stringify(items);
    assert.equal(todaysOpportunities(items, '2026-09-22').map((item) => item.id).join(','), 'agreed,interest,exploring');
    assert.equal(JSON.stringify(items), before);
    assert.equal(todaysOpportunities([candidate('b'), candidate('a')], '2026-09-22').map((item) => item.id).join(','), 'a,b');
    assert.equal(todaysOpportunities([], '2026-09-22').length, 0);
    assert.equal(todaysOpportunities([items[0]], '2026-09-23').length, 1);
    assert.equal(opportunityReason(items[5], '2026-09-22'), 'Overdue by 2 days · Interest expressed');
    assert.equal(opportunityReason(candidate('dst', { followUpOn: '2026-03-07' }), '2026-03-09'), 'Overdue by 2 days · Exploring');
    assert.equal(localOpportunityDate(new Date(2026, 8, 22, 23, 59)), '2026-09-22');
});

test('GraphQL schema is valid and opportunity inputs cannot set ownership/publication/history', () => {
    const schema = buildASTSchema(typeDefs);
    assert.deepEqual(validateSchema(schema), []);
    const inputFields = schema.getType('OpportunityInput').getFields();
    for (const field of ['ownerId', 'isPublic', 'status', 'results']) assert.equal(inputFields[field], undefined);
});

test('Opportunity resolvers enforce ownership, validate inputs and atomically reject stale result writes', async () => {
    // In-memory model adapter tests resolver behavior without touching a real database.
    const records = new Map();
    const owner = { id: 'creator-a', role: 'creator', creatorStatus: 'active' };
    const other = { id: 'creator-b', role: 'owner', creatorStatus: 'active' };
    const context = { user: owner };
    const original = { create: Opportunity.create, find: Opportunity.find, findOne: Opportunity.findOne, update: Opportunity.findOneAndUpdate, release: ReleaseWorld.findOne };
    const hydrate = (record) => record ? Opportunity.hydrate(new Opportunity(record).toObject()) : null;
    const matches = (record, filter) => record && String(record._id) === String(filter._id) && record.ownerId === filter.ownerId;
    Opportunity.create = async (input) => {
        const doc = new Opportunity(input);
        doc.createdAt = new Date('2026-09-22T12:00:00Z'); doc.updatedAt = doc.createdAt;
        await doc.validate();
        records.set(String(doc._id), doc.toObject());
        return doc;
    };
    Opportunity.find = (filter) => ({ sort: async () => [...records.values()].filter((record) => record.ownerId === filter.ownerId).map(hydrate) });
    Opportunity.findOne = async (filter) => {
        const record = records.get(String(filter._id));
        return matches(record, filter) ? hydrate(record) : null;
    };
    Opportunity.findOneAndUpdate = async (filter, update, options) => {
        assert.equal(options.runValidators, true);
        assert.equal(options.timestamps, false);
        const record = records.get(String(filter._id));
        if (!matches(record, filter) || record.status !== filter.status || record.updatedAt.getTime() !== filter.updatedAt.getTime()) return null;
        const next = hydrate(record);
        Object.assign(next, update.$set);
        if (update.$push) next.results.push(update.$push.results);
        const validationError = next.validateSync();
        if (validationError) throw validationError;
        records.set(String(next._id), next.toObject());
        return hydrate(next.toObject());
    };
    ReleaseWorld.findOne = async (filter) => filter.ownerId === owner.id && String(filter._id) === '507f1f77bcf86cd799439011' ? { _id: filter._id } : null;
    const input = { title: 'Alex — collaboration', desiredOutcome: 'Agree a recording session', context: 'Alex asked for a demo', traction: 'interest-expressed', nextAction: 'Send demo', followUpOn: '2026-09-22' };
    const server = new ApolloServer({ typeDefs, resolvers, context: () => context });
    try {
        const empty = await server.executeOperation({ query: documents.MY_OPPORTUNITIES });
        assert.equal(empty.errors, undefined);
        assert.equal(empty.http.status || 200, 200);
        assert.deepEqual(empty.data.myOpportunities, []);
        const requestedInput = {
            title: 'First paid artist/song-development client',
            desiredOutcome: 'Earn my first $150 from a creator service',
            context: 'I have a large private song catalog and months of hook/topline/song-development practice; need to turn skill into an external offer',
            traction: 'exploring',
            nextAction: 'Define the $150 offer and identify 3 artists/producers I could send it to',
            followUpOn: '2026-09-24',
        };
        const created = await server.executeOperation({ query: documents.CREATE_OPPORTUNITY, variables: { input: requestedInput } });
        assert.equal(created.errors, undefined);
        assert.equal(created.http.status || 200, 200);
        for (const [field, value] of Object.entries(requestedInput)) assert.equal(created.data.createOpportunity[field], value);
        assert.equal(created.data.createOpportunity.releaseWorldId, null);
        assert.deepEqual(created.data.createOpportunity.results, []);
        const reloaded = await server.executeOperation({ query: documents.MY_OPPORTUNITIES });
        assert.equal(reloaded.errors, undefined);
        assert.equal(reloaded.data.myOpportunities[0].id, created.data.createOpportunity.id);
        await assert.rejects(resolvers.Query.myOpportunities(null, {}, { user: null }), /Unauthorized/);
        await assert.rejects(resolvers.Query.myOpportunities(null, {}, { user: { ...owner, creatorStatus: 'suspended' } }), /Creator access/);
        await assert.rejects(resolvers.Mutation.createOpportunity(null, { input: { ...input, nextAction: ' ' } }, context), /Next action/);
        await assert.rejects(resolvers.Mutation.createOpportunity(null, { input: { ...input, followUpOn: '2026-02-30' } }, context), /valid follow-up/);
        await assert.rejects(resolvers.Mutation.createOpportunity(null, { input: { ...input, traction: '__proto__' } }, context), /valid level/);
        await assert.rejects(resolvers.Mutation.createOpportunity(null, { input: { ...input, releaseWorldId: '507f1f77bcf86cd799439012' } }, context), /Release world not found/);
        const first = await resolvers.Mutation.createOpportunity(null, { input }, context);
        assert.equal(first.ownerId, owner.id);
        assert.equal(first.releaseWorldId, null);
        assert.equal((await resolvers.Query.myOpportunities(null, {}, { user: other })).length, 0);
        const args = { id: first.id, expectedUpdatedAt: first.updatedAt.toISOString(), input: { note: 'Sent demo; awaiting reply', classification: 'action-completed', nextAction: 'Ask about session dates', followUpOn: '2026-09-25' } };
        await assert.rejects(resolvers.Mutation.updateOpportunity(null, { ...args, input }, { user: other }), /not found/);
        await assert.rejects(resolvers.Mutation.recordOpportunityResult(null, args, { user: other }), /not found/);
        await assert.rejects(resolvers.Mutation.recordOpportunityResult(null, { ...args, input: { ...args.input, classification: '__proto__' } }, context), /valid result/);
        await assert.rejects(resolvers.Mutation.recordOpportunityResult(null, { ...args, input: { ...args.input, nextAction: '' } }, context), /Next action/);
        const concurrent = await Promise.allSettled([
            resolvers.Mutation.recordOpportunityResult(null, args, context),
            resolvers.Mutation.recordOpportunityResult(null, args, context),
        ]);
        assert.equal(concurrent.filter((result) => result.status === 'fulfilled').length, 1);
        const saved = await Opportunity.findOne({ _id: first.id, ownerId: owner.id });
        assert.equal(saved.results.length, 1);
        assert.equal(saved.results[0].action, 'Send demo');
        assert.equal(saved.nextAction, 'Ask about session dates');
        assert.equal(saved.followUpOn, '2026-09-25');
        assert.ok(saved.updatedAt > first.updatedAt);
        await assert.rejects(resolvers.Mutation.updateOpportunity(null, { id: first.id, expectedUpdatedAt: first.updatedAt.toISOString(), input }, context), /changed/);
        const closed = await resolvers.Mutation.recordOpportunityResult(null, { id: first.id, expectedUpdatedAt: saved.updatedAt.toISOString(), input: { note: 'Session agreed for Friday', classification: 'outcome-achieved' } }, context);
        assert.equal(closed.status, 'achieved');
        assert.equal(closed.nextAction, '');
        assert.equal(closed.followUpOn, null);
        assert.equal(closed.results.length, 2);
        assert.equal(resolvers.Opportunity.updatedAt(closed), closed.updatedAt.toISOString());
        assert.equal(resolvers.OpportunityResult.recordedAt(closed.results[0]), closed.results[0].recordedAt.toISOString());
        await assert.rejects(resolvers.Mutation.updateOpportunity(null, { id: first.id, expectedUpdatedAt: closed.updatedAt.toISOString(), input }, context), /already closed/);
        const linked = await resolvers.Mutation.createOpportunity(null, { input: { ...input, releaseWorldId: '507f1f77bcf86cd799439011' } }, context);
        assert.ok(linked.releaseWorldId instanceof mongoose.Types.ObjectId);
    } finally {
        await server.stop();
        Opportunity.create = original.create; Opportunity.find = original.find;
        Opportunity.findOne = original.findOne; Opportunity.findOneAndUpdate = original.update;
        ReleaseWorld.findOne = original.release;
    }
});
