const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
test('Rapid curation requires explicit confirmed choice; cancellation sends nothing',async()=>{
 let confirmed=false;const calls=[],messages=[];const m={exports:{}};
 const code=ts.transpileModule(fs.readFileSync('src/components/creator/PublicCurationReview.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(`(function(require,module,exports){${code}})`,{window:{confirm:()=>confirmed}})(name=>name==='react'?{useState:v=>[v,n=>messages.push(n)]}:name==='@apollo/client'?{gql:()=>'',useMutation:()=>[async args=>calls.push(args),{loading:false}]}:require(name),m,m.exports);
 const tree=m.exports.default({tracks:[{id:'t',title:'Fixture',updatedAt:'2026-10-07',status:'demo',visibility:'public'}],worlds:[],onSaved:async()=>{}});
 const walk=node=>Array.isArray(node)?node.flatMap(walk):node&&typeof node==='object'?[node,...walk(node.props?.children)]:[];
 const button=walk(tree).find(n=>n.type==='button'&&n.props.children==='Listed / link-only');
 assert.equal(calls.length,0);button.props.onClick();await Promise.resolve();assert.equal(calls.length,0);
 confirmed=true;button.props.onClick();await new Promise(resolve=>setImmediate(resolve));assert.equal(calls.length,1);assert.equal(calls[0].variables.choice,'listed');assert.equal(calls[0].variables.expectedUpdatedAt,'2026-10-07');assert.equal(calls[0].variables.confirmImpact,true);
});
