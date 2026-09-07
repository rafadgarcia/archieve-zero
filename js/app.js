import {escape,parseDocument,renderMarkdown,search} from './core.js';
import {renderAttachments} from './attachments.js';
import {setupLightbox} from './lightbox.js';
const $=id=>document.getElementById(id);
setupLightbox($('document'));
let documents=[], category='';
const categories=['Artefatos','Criaturas','Pessoas','Locais','Ocorrências','Rituais','Organizações','Pesquisas'];
function displayResults(){
  const found=search(documents,$('query').value,{categoria:category,elemento:$('element').value,status:$('status').value});
  $('result-status').textContent=`${found.length} REGISTRO(S) / ${category || 'TODOS OS DIRETÓRIOS'}`;
  $('results').innerHTML=found.length ? found.map(d=>`<a class="result" href="#${d.id}" aria-current="${location.hash.slice(1)===d.id}"><span>${d.id}</span>${escape(d.titulo)}<span>${escape(d.elemento || 'Indeterminado')} ↗</span></a>`).join('') : '<p>Nenhum registro encontrado. Tente remover os filtros.</p>';
}
function syncDirectory(selectedCategory){
  category=selectedCategory || '';
  for(const item of $('categories').children)item.setAttribute('aria-pressed',String(item.dataset.category===category));
}
function openDocument(focus=false){
  const id=location.hash.slice(1);
  if(!id || id==='document') return;
  const doc=documents.find(d=>d.id===id);
  if(!doc){$('document').textContent='Registro não encontrado neste índice.';return;}
  syncDirectory(doc.categoria);
  const fields=['categoria','elemento','status','ameaca','instabilidade','classificacao','integridade','autor','data_registro','ultima_atualizacao'];
  $('document').innerHTML=`<div class="eyebrow">REGISTRO ${doc.id} / ACERVO DA CAMPANHA</div><div class="metadata">${fields.filter(k=>doc[k]).map(k=>`<span>${escape(k)}: ${escape(doc[k])}</span>`).join('')}</div>${renderMarkdown(doc.body)}<section aria-label="Proveniência"><h3>Fonte do registro</h3><p>${escape(doc.fonte || 'Não informada')}</p><p>${escape(doc.secao || '')}</p></section>`;
  $('document').insertAdjacentHTML('beforeend',renderAttachments(doc.attachments));
  displayResults();
  if(focus) $('document').focus();
}
$('categories').innerHTML=['Todos',...categories].map((name,i)=>`<button type="button" data-category="${i?name:''}" aria-pressed="${!i}">${String(i).padStart(2,'0')} / ${name}</button>`).join('');
$('categories').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  history.pushState(null,'',location.pathname+location.search);
  category=button.dataset.category;
  for(const item of $('categories').children)item.setAttribute('aria-pressed',String(item===button));
  $('document').innerHTML='<p>Selecione um registro para iniciar a leitura.</p>';
  displayResults();
});
// Keep hash navigation and directory navigation in one state flow.
$('document').addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(link && link.hash && link.hash !== '#document'){
    event.preventDefault();
    history.pushState(null,'',link.hash);
    openDocument(true);
  }
});
$('search-form').addEventListener('submit',event=>event.preventDefault());
$('search-form').addEventListener('input',displayResults);
$('search-form').addEventListener('reset',event=>{
  event.preventDefault();
  $('query').value='';$('element').value='';$('status').value='';
  displayResults();
});
window.addEventListener('hashchange',()=>openDocument(true));
async function load(){
  const response=await fetch('docs/index.json');if(!response.ok)throw Error('Índice indisponível');
  const entries=await response.json();
  if(!Array.isArray(entries))throw Error('Índice inválido');
  const settled=await Promise.allSettled(entries.map(async entry=>{
    if(!/^[a-z0-9/-]+\.md$/.test(entry.path)||entry.path.includes('..'))throw Error('Caminho inválido');
    const file=await fetch(`docs/${entry.path}`);if(!file.ok)throw Error('Documento indisponível');
    const {meta,body}=parseDocument(await file.text());
    if(!/^[A-Z]+-[A-Z0-9]+$/.test(meta.id)||!meta.titulo)throw Error('Metadados inválidos');
    return {...meta,body,attachments:entry.attachments};
  }));
  documents=settled.filter(r=>r.status==='fulfilled').map(r=>r.value);
  const failed=settled.length-documents.length;
  for(const [id,key] of [['element','elemento'],['status','status']])for(const value of [...new Set(documents.map(d=>d[key]).filter(Boolean))].sort()){
    const option=document.createElement('option');option.value=option.textContent=value;$(id).append(option);
  }
  $('integrity').textContent=failed?`ÍNDICE: ${failed} FALHA(S) DE LEITURA`:`ÍNDICE: ${documents.length} REGISTROS`;
  displayResults();openDocument();
}load().catch(()=>{$('result-status').textContent='Não foi possível carregar o acervo. Recarregue a página. Use um servidor HTTP, não file://.';$('integrity').textContent='ÍNDICE: INDISPONÍVEL';});
