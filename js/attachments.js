import {escape} from './core.js';
export function renderAttachments(items) {
 if(!Array.isArray(items)) return '';
 const valid=items.filter(item=>item && typeof item.path==='string' && /^assets\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(?:jpg|jpeg|png|webp)$/.test(item.path));
 if(!valid.length)return '';
 return `<section class="attachments" aria-label="Anexos visuais"><h3>Anexos visuais / ${valid.length}</h3><p>Selecione uma imagem para visualizar e ampliar na mesma guia, sem sair do registro.</p><div class="attachment-grid">${valid.map(item=>`<figure><a href="${escape(item.path)}" aria-haspopup="dialog" aria-label="${escape(item.title || 'Imagem')} — abrir visualizador"><img src="${escape(item.path)}" alt="${escape(item.alt || item.title || 'Anexo do registro')}" loading="lazy"></a><figcaption>${escape(item.title || 'Imagem')} <span>Ampliar</span></figcaption></figure>`).join('')}</div></section>`;
}
