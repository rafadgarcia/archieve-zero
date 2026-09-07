import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseDocument} from '../js/core.js';
const root=new URL('../docs/',import.meta.url);
const index=JSON.parse(await readFile(new URL('index.json',root),'utf8'));
const docs=await Promise.all(index.map(async entry=>parseDocument(await readFile(new URL(entry.path,root),'utf8'))));
test('campaign records have unique IDs and explicit source sections',()=>{
  assert.equal(new Set(docs.map(d=>d.meta.id)).size,docs.length);
  for(const doc of docs){
    assert.ok(doc.meta.fonte?.endsWith('.md'));
    assert.ok(doc.meta.secao);
    assert.ok(doc.meta.status);
    assert.ok(!doc.meta.integridade,'Do not fabricate integrity percentages');
    assert.ok(!doc.body.includes('Registro demonstrativo'));
  }
});
test('all cross-references resolve within the campaign catalog',()=>{
  const ids=new Set(docs.map(d=>d.meta.id));
  for(const doc of docs)for(const match of doc.body.matchAll(/\[\[([A-Z]+-[A-Z0-9]+)\]\]/g))assert.ok(ids.has(match[1]),match[1]);
});
test('critical uncertainties are preserved',()=>{
  const get=id=>docs.find(d=>d.meta.id===id);
  assert.match(get('ART-ESPADA').body,/Não é uma amostra confirmada de sangue/);
  assert.match(get('PESQ-CICLOS').meta.titulo,/17\?/);
  assert.equal(get('ORG-VERITUS').meta.status,'Em planejamento');
  assert.equal(get('PES-REINER').meta.status,'Destino incerto');
});
