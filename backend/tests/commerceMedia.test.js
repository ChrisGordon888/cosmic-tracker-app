const {test}=require('node:test'),assert=require('node:assert/strict');
const media=require('../lib/commerceMedia'),{links}=require('../lib/commerceMediaLinks'),catalog=require('../lib/commerceCatalog');
test('media normalizes supported URLs and rejects scripts, host confusion and unsupported links',()=>{
 assert.equal(media.source('https://youtu.be/abcdefghijk?t=2').embed,'https://www.youtube-nocookie.com/embed/abcdefghijk');
 assert.match(media.source('https://www.youtube.com/playlist?list=PLabcdefghijk').embed,/videoseries/);
 assert.equal(media.source('https://instagram.com/reel/Abc123/').embed,null);
 for(const url of ['javascript:alert(1)','https://youtube.com.evil.com/watch?v=abcdefghijk','https://youtube.com/watch?v=bad','https://example.com/file'])assert.throws(()=>media.source(url));
});
test('drafts can be incomplete; publication requires source and description; ownership is never client supplied',()=>{
 const value=media.input({slug:'fixture',title:'Fixture',status:'draft',ownerId:'injected'});assert.equal(value.ownerId,undefined);assert.throws(()=>media.input({...value,status:'published'}));
 assert.equal(media.input({...value,status:'published',url:'https://youtu.be/abcdefghijk',description:'Process'}).status,'published');assert.throws(()=>media.input({...value,service:'made-up'}));
 const dto=media.presentation({...value,ownerId:'private',revision:10});assert.equal(dto.ownerId,undefined);assert.equal(dto.revision,undefined);
});
test('stale/private associations are omitted, public destinations retain World identity',()=>{
 const row={worldId:'private',trackId:'stale',offerSlug:'draft'};assert.deepEqual(links(row,{worlds:[],tracks:[]},[]),[]);
 assert.deepEqual(links({...row,worldId:'world'},{worlds:[{id:'world',title:'World',href:'/releases/same?world=world'}],tracks:[]},[]),[{label:'World',href:'/releases/same?world=world'}]);
});
test('Vocal Studio specification remains private and does not assert licenses or versions',()=>{
 const draft=require('../lib/vocalStudioDraft');assert.equal(draft.privateReview,true);assert.equal(draft.status,'draft');assert.match(draft.technical.plugins,/UNCONFIRMED/);assert.throws(()=>catalog.delivery(draft,{enabled:true}),/private review/);
 assert.throws(()=>catalog.offeringInput({...draft,technical:{walkthrough:'javascript:bad'}}));
 const preview=catalog.previewOffering(draft,null);assert.ok(preview.technical);assert.equal(preview.href,undefined);
});
