// A native modal keeps focus inside the viewer and restores it on close.
export function setupLightbox(container) {
 const dialog=document.createElement('dialog');
 dialog.className='lightbox';
 dialog.setAttribute('aria-label','Visualizador de imagens');
 dialog.innerHTML=`<div class="viewer-bar"><div><strong id="viewer-title"></strong><div id="viewer-count" aria-live="polite"></div></div><div><button type="button" id="viewer-zoom" aria-pressed="false">＋ Ampliar</button><button type="button" id="viewer-close" aria-label="Fechar visualizador">✕</button></div></div><button type="button" class="viewer-prev" aria-label="Imagem anterior">←</button><div class="viewer-stage"><img alt=""><p class="viewer-error" hidden>Não foi possível carregar esta imagem.</p></div><button type="button" class="viewer-next" aria-label="Próxima imagem">→</button><p class="viewer-help">Use ← → para navegar · Esc para fechar</p>`;
 document.body.append(dialog);
 const stage=dialog.querySelector('.viewer-stage'), image=dialog.querySelector('img'), zoom=dialog.querySelector('#viewer-zoom');
 let items=[],index=0,opener;
 function show(){
  const item=items[index];
  stage.classList.remove('zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent='＋ Ampliar';
  stage.scrollTop=stage.scrollLeft=0;
  dialog.querySelector('.viewer-error').hidden=true;
  image.hidden=false;image.src=item.href;image.alt=item.querySelector('img').alt;
  dialog.querySelector('#viewer-title').textContent=item.closest('figure').querySelector('figcaption').firstChild.textContent.trim();
  dialog.querySelector('#viewer-count').textContent=`${index+1} / ${items.length}`;
  dialog.querySelector('.viewer-prev').disabled=items.length<2;
  dialog.querySelector('.viewer-next').disabled=items.length<2;
 }
 const move=step=>{index=(index+step+items.length)%items.length;show();};
 container.addEventListener('click',event=>{
  const link=event.target.closest('.attachment-grid a');if(!link)return;
  event.preventDefault();items=[...container.querySelectorAll('.attachment-grid a')];index=items.indexOf(link);opener=link;
  show();dialog.showModal();dialog.querySelector('#viewer-close').focus();
 });
 dialog.querySelector('#viewer-close').onclick=()=>dialog.close();
 dialog.querySelector('.viewer-prev').onclick=()=>move(-1);
 dialog.querySelector('.viewer-next').onclick=()=>move(1);
 zoom.onclick=()=>{const enlarged=stage.classList.toggle('zoomed');zoom.setAttribute('aria-pressed',String(enlarged));zoom.textContent=enlarged?'− Reduzir':'＋ Ampliar';};
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
 image.addEventListener('error',()=>{image.hidden=true;dialog.querySelector('.viewer-error').hidden=false;});
 window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
}
