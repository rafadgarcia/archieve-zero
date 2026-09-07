import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildGraph,diagnose,isUnlocked,recordState,renderMarkdown, search, parseDocument,unlockRecord} from '../js/core.js';
test('reads metadata separately from the body',()=>{
  assert.deepEqual(parseDocument('---\nid: ART-001\ntitulo: Câmera\n---\n# Registro'),{meta:{id:'ART-001',titulo:'Câmera'},body:'# Registro'});
});
test('search combines accent-insensitive full text and filters',()=>{
  const docs=[{id:'ART-001',titulo:'Câmera',categoria:'Artefatos',elemento:'Energia',status:'Confirmado',body:'Assinatura residual'}];
  assert.equal(search(docs,'camera residual',{categoria:'Artefatos'}).length,1);
  assert.equal(search(docs,'',{elemento:'Morte'}).length,0);
});
test('renders basic Markdown and wiki links',()=>{
  const html=renderMarkdown('# Registro\n\n**Forte** e [[ART-001]]\n\n- Evidência');
  assert.match(html,/<h2>Registro<\/h2>/);
  assert.match(html,/<strong>Forte<\/strong>/);
  assert.match(html,/href="#ART-001"/);
  assert.match(html,/<li>Evidência<\/li>/);
});
test('escapes raw HTML and never creates unsafe links',()=>{
  const html=renderMarkdown('<img src=x onerror=alert(1)>\n\n[link](javascript:alert)');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('href="javascript:'));
});
test('redaction removes source text from rendered markup',()=>{
  assert.ok(!renderMarkdown('[[REDACTED: segredo]]').includes('segredo'));
});
test('diagnoses paranormal markers without inventing missing values',()=>{
  const docs=[{body:'[[REDACTED: segredo]] [[CORRUPTED: ruído]]',fonte:'fonte.md',status:'Em análise'},{body:'texto',status:'Confirmado',instabilidade:'2'}];
  assert.deepEqual(recordState(docs[0]),{censored:true,corrupted:true,hasSource:true,hasStatus:true,instability:'Não informada'});
  assert.deepEqual(diagnose(docs),{total:2,sourced:1,censored:1,corrupted:1,withInstability:1,statuses:2});
});
test('narrative records require the configured code',()=>{
  const record={id:'OCO-001',lock:{code:'0427'}};
  assert.equal(isUnlocked(record.id,[]),false);
  assert.deepEqual(unlockRecord(record,'0000'),{ok:false,reason:'invalid'});
  assert.deepEqual(unlockRecord(record,'0427'),{ok:true,reason:'code'});
  assert.deepEqual(unlockRecord({id:'ART-001'},''),{ok:true,reason:'public'});
});
test('builds relations only from resolvable wiki links',()=>{
  assert.deepEqual(buildGraph([{id:'PES-1',body:'Veja [[ART-1]] e [[NAO-EXISTE]]'},{id:'ART-1',body:''}]),[{from:'PES-1',to:'ART-1'}]);
});
