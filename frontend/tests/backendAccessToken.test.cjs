const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),jwt=require('jsonwebtoken');
const m={exports:{}};vm.runInNewContext(`(function(require,module,exports){${ts.transpileModule(fs.readFileSync('src/server/backendAccessToken.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText}})`)(require,m,m.exports);
const {backendAccessToken}=m.exports,secret='fictional-test-secret',now=1800000000,identity={sub:'fictional',email:'fixture@example.invalid',name:'Fixture'};
test('Backend bearer renews near expiry and after expiry without carrying stale permissions',()=>{
 const first=backendAccessToken(identity,secret,now);assert.equal(backendAccessToken({...identity,accessToken:first},secret,now+10),first);
 for(const at of [now+86200,now+86500]) {const next=backendAccessToken({...identity,accessToken:first,role:'owner'},secret,at),claims=jwt.verify(next,secret,{clockTimestamp:at});assert.notEqual(next,first);assert.equal(claims.email,identity.email);assert.equal(claims.role,undefined);assert.equal(claims.exp,at+86400);}
});
test('Renewal uses authenticated identity, rejects missing identity, replaces invalid or foreign bearer',()=>{
 assert.throws(()=>backendAccessToken({},secret,now));
 for(const accessToken of ['invalid',jwt.sign({sub:'other',email:'other@example.invalid',iat:now},secret,{expiresIn:'24h'})])assert.equal(jwt.verify(backendAccessToken({...identity,accessToken},secret,now),secret,{clockTimestamp:now}).sub,identity.sub);
});
