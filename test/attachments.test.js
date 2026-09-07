import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderAttachments} from '../js/attachments.js';
test('renders local attachments with captions and full-size links',()=>{
 const html=renderAttachments([{path:'assets/jonas/foto.jpeg',title:'Foto',alt:'Retrato'}]);
 assert.match(html,/href="assets\/jonas\/foto.jpeg"/);
 assert.match(html,/alt="Retrato"/);
 assert.match(html,/loading="lazy"/);
 assert.ok(!html.includes('target="_blank"'));
 assert.match(html,/mesma guia/);
});
test('rejects external URLs, traversal and executable image types',()=>{
 for(const path of ['https://example.com/a.jpg','../a.jpg','assets/../a.jpg','assets/a.svg'])
  assert.ok(!renderAttachments([{path,title:'X'}]).includes('<img'));
});
test('escapes captions and handles missing collections',()=>{
 assert.equal(renderAttachments(undefined),'');
 assert.ok(!renderAttachments([{path:'assets/a.jpg',title:'<script>x</script>'}]).includes('<script>'));
});
