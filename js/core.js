export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export function parseDocument(source) {
  const match = source.replace(/\r/g,'').match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (match) for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) meta[line.slice(0,colon).trim()] = line.slice(colon+1).trim();
  }
  return {meta,body:match ? source.replace(/\r/g,'').slice(match[0].length).trim() : source.trim()};
}

export function search(docs, query, filters = {}) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return docs.filter(doc => Object.entries(filters).every(([key,value])=> !value || doc[key]===value)
    && words.every(word=>normalize(Object.values(doc).join(' ')).includes(word)));
}

// Deliberately restricted Markdown: no raw HTML or executable URL protocols.
export function renderMarkdown(source) {
  const inline = text => escape(text.replace(/\[\[REDACTED:[\s\S]*?\]\]/g,'████████')
    .replace(/\[\[CORRUPTED:[\s\S]*?\]\]/g,'[DADOS CORROMPIDOS]'))
    .replace(/\[\[([A-Z]+-[\w?]+)\]\]/g,'<a href="#$1">$1 ↗</a>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noreferrer">$1 ↗</a>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>');
  const lines=source.replace(/\r/g,'').split('\n');
  const out=[]; let paragraph=[]; let list=[]; let quote=[];
  const flush=()=>{
    if(paragraph.length){out.push(`<p>${inline(paragraph.join('\n')).replace(/\n/g,'<br>')}</p>`); paragraph=[];}
    if(list.length){out.push(`<ul>${list.map(item=>`<li>${inline(item)}</li>`).join('')}</ul>`); list=[];}
    if(quote.length){out.push(`<blockquote>${inline(quote.join('\n')).replace(/\n/g,'<br>')}</blockquote>`); quote=[];}
  };
  for(const line of lines){
    if(!line.trim()){flush(); continue;}
    const heading=line.match(/^(#{1,5})\s+(.+)$/);
    if(heading){flush(); const level=Math.min(heading[1].length+1,6); out.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue;}
    if(line.startsWith('- ')){if(paragraph.length||quote.length)flush(); list.push(line.slice(2)); continue;}
    if(line.startsWith('> ')){if(paragraph.length||list.length)flush(); quote.push(line.slice(2)); continue;}
    if(list.length||quote.length)flush(); paragraph.push(line);
  }
  flush(); return out.join('');
}
