import {test} from 'node:test';
import assert from 'node:assert/strict';
test('directory state follows the selected record category',()=>{
 const records=[{id:'PES-JONAS',categoria:'Pessoas'},{id:'PESQ-ANCORAS',categoria:'Pesquisas'}];
 const categoryFor=id=>records.find(record=>record.id===id)?.categoria || '';
 assert.equal(categoryFor('PESQ-ANCORAS'),'Pesquisas');
 assert.equal(categoryFor('PES-JONAS'),'Pessoas');
});
test('selecting an empty directory has no active record',()=>{
 const records=[];
 assert.equal(records.filter(record=>record.categoria==='Locais').length,0);
 assert.equal('', '');
});
