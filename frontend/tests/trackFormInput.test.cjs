const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

const { ApolloServer } = require('../../backend/node_modules/apollo-server-express');
const typeDefs = require('../../backend/schemas');

const page = fs.readFileSync(
    path.join(__dirname, '../src/app/releases/[slug]/board/page.tsx'),
    'utf8'
);

function compile(source) {
    const exports = {};
    vm.runInNewContext(
        ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS },
        }).outputText,
        { exports }
    );
    return exports;
}

const { getEmptyTrackForm } = compile(
    'export ' +
    page.slice(
        page.indexOf('function getEmptyTrackForm'),
        page.indexOf('function getTrackFormFromReleaseTrack')
    )
);

const { getTrackInputFromForm, getTrackUpdateFromForms } = compile(
    fs.readFileSync(
        path.join(__dirname, '../src/lib/trackFormInput.ts'),
        'utf8'
    )
);

test(
    'Reproduces Apollo typename rejection, then saves actual Board visibility-only payload and refetches it',
    async () => {
        const base = {
            ...getEmptyTrackForm(),
            title: 'Fixture',
            playbackStatus: 'locked',
            realmFinderScores: {
                __typename: 'RealmFinderScores',
                realm303: 0,
                realm202: 80,
                realm101: 0,
                realm55: 0,
                realm44: 0,
                realm0: 0,
            },
        };

        // Only visibility changes; playback remains locked.
        const edited = { ...base, visibility: 'public' };

        let persisted = {
            id: 'fixture',
            visibility: 'private',
            isPublic: false,
            playbackStatus: 'locked',
        };

        const server = new ApolloServer({
            typeDefs,
            resolvers: {
                Mutation: {
                    updateReleaseTrack: (_, args) => {
                        persisted = { ...persisted, ...args.input };
                        return persisted;
                    },
                },
                Query: { getReleaseTrack: () => persisted },
            },
        });

        const query = page.match(
            /const UPDATE_RELEASE_TRACK = gql`([\s\S]*?)`;/
        )[1];

        // Validate the actual Board mutation document against the backend schema.
        const { buildASTSchema, parse, validate } = require('graphql');
        assert.deepEqual(validate(buildASTSchema(typeDefs), parse(query)), []);

        const mutation =
            'mutation($input:UpdateReleaseTrackInput!){updateReleaseTrack(id:"fixture",input:$input){id visibility isPublic playbackStatus}}';

        try {
            // Apollo should reject unsanitized __typename in the mutation input.
            const broken = await server.executeOperation({
                query: mutation,
                variables: {
                    input: {
                        ...getTrackInputFromForm(edited),
                        realmFinderScores: base.realmFinderScores,
                    },
                },
            });
            assert.match(broken.errors[0].message, /__typename/);
            assert.equal(broken.errors[0].extensions.code, 'BAD_USER_INPUT');
            assert.equal(persisted.visibility, 'private');

            // Visibility-only edits must not silently change playback access.
            const input = getTrackUpdateFromForms(edited, base);
            assert.deepEqual(JSON.parse(JSON.stringify(input)), {
                visibility: 'public',
                isPublic: true,
            });
            assert.equal(
                Object.prototype.hasOwnProperty.call(input, 'playbackStatus'),
                false
            );

            const saved = await server.executeOperation({
                query: mutation,
                variables: { input },
            });
            assert.equal(saved.errors, undefined);
            assert.equal(saved.data.updateReleaseTrack.visibility, 'public');
            assert.equal(saved.data.updateReleaseTrack.playbackStatus, 'locked');

            const reload = await server.executeOperation({
                query: '{getReleaseTrack(id:"fixture"){visibility playbackStatus}}',
            });
            assert.equal(reload.data.getReleaseTrack.visibility, 'public');
            assert.equal(reload.data.getReleaseTrack.playbackStatus, 'locked');

            // Sanitization removes Apollo metadata from the form's GraphQL payload.
            assert.equal(
                '__typename' in getTrackInputFromForm(edited).realmFinderScores,
                false
            );

            // Intentionally changing playback access must still produce a diff.
            const playbackChange = getTrackUpdateFromForms(
                { ...base, playbackStatus: 'playable' },
                base
            );
            assert.equal(playbackChange.playbackStatus, 'playable');

            // An unchanged form sends no update fields.
            assert.equal(Object.keys(getTrackUpdateFromForms(base, base)).length, 0);
        } finally {
            await server.stop();
        }
    }
);
