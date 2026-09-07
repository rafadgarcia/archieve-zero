# Imagens por registro

Cada entrada em `docs/index.json` pode ter `attachments`, uma lista de objetos com `path`, `title` e `alt` (descrição acessível). Exemplo:

```json
{"path":"pessoas/jonas-steal.md","attachments":[{"path":"assets/jonas-steal/foto.jpeg","title":"Foto","alt":"Retrato de Jonas Steal"}]}
```

Usar pastas em `assets/<registro>/`, nomes minúsculos sem espaços e formatos JPEG, PNG ou WebP. A galeria é responsiva, mantém a proporção das imagens sem cortes, carrega sob demanda e abre o original na mesma guia. Use Voltar no navegador para retornar ao registro. Registros sem anexos não exibem uma galeria vazia. SVG e URLs externas não são aceitos neste recurso.

Primeiro conjunto: sete arquivos copiados sem alteração de `G:/Meu Drive/RPG/Sessões/novos-organizar/Jonas Steal`. Legendas derivadas dos nomes dos arquivos. As imagens não foram usadas para acrescentar alegações ao texto do dossiê; leitura/transcrição das evidências é uma etapa separada.

Inclua `assets/` entre as pastas do deploy. Não publicar imagens com segredos reais; os arquivos estáticos não têm proteção de acesso. Os originais do Drive permanecem intactos.
