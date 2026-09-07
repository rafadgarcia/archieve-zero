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
  return source.replace(/\r/g,'').split(/\n\s*\n/).map(block=>{
    if (/^#{1,5} /.test(block)) {
      const level=Math.min(block.match(/^#+/)[0].length+1,6);
      return `<h${level}>${inline(block.replace(/^#+ /,''))}</h${level}>`;
    }
    if (block.split('\n').every(line=>line.startsWith('- '))) return `<ul>${block.split('\n').map(line=>`<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
    if (block.startsWith('> ')) return `<blockquote>${inline(block.replace(/^> /gm,''))}</blockquote>`;
    return `<p>${inline(block).replace(/\n/g,'<br>')}</p>`;
  }).join('');
}
