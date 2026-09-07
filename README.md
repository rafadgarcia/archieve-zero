# Archive / Arquivo Paranormal

Projeto independente iniciado na worktree `c053`, baseado no escopo fornecido em `G:/Meu Drive/RPG/Arquivo Paranormal.md`. Endereço planejado: **https://archive.devwolf.com.br**. Não publicado por esta implementação.

## Executar

Requer Node 22 ou superior apenas para desenvolvimento; o site publicado é estático.

```sh
cd archive
npm test
npm start
```

Abra http://127.0.0.1:4174. Não abra por `file://`: a biblioteca usa fetch. Não há dependências para instalar, conta, API nem banco.

## Estrutura e funções

- `index.html`: interface semântica, filtros e leitor.
- `css/terminal.css`: tokens verde-fósforo, layout adaptativo e scanlines CRT permanentes. Sem flashes.
- `js/core.js`: `parseDocument` extrai metadados simples; `search` combina palavras e filtros, ignorando acentos; `renderMarkdown` gera HTML de um subconjunto seguro; `escape` escapa texto.
- `js/app.js`: carregamento paralelo do acervo, erro parcial, navegação por hash, filtros e metadados paranormais. Não usa a autenticação do Owlbear.
- `docs/index.json`: lista explícita dos documentos publicados.
- `docs/<categoria>/*.md`: conteúdo e metadados.
- `test/core.test.js`: testes de leitura, busca, renderização e segurança do HTML.
- `serve.mjs`: servidor local somente em loopback; não usar em produção.
- `DEPLOY.md`: integração planejada com a VM existente.

## Escrever documentos

Crie um `.md`, adicione seu caminho relativo a `docs/index.json` e use:

```md
---
id: ART-002
titulo: Novo artefato
categoria: Artefatos
elemento: Energia
status: Em investigação
integridade: 90%
tags: câmera, fragmento
---
# Novo artefato

Texto com **negrito** e referência [[ART-001]].
```

IDs únicos: letras maiúsculas, hífen e letras/números; caminhos com letras minúsculas sem acentos. Metadados são pares `chave: valor`, não YAML completo. Tags usam texto separado por vírgulas, não listas YAML nesta versão.

Markdown inicial: títulos (separados de outros blocos por linha em branco), parágrafos, negrito, código inline, listas simples `-`, citações `>`, links HTTP(S), referências `[[ID]]`, `[[REDACTED: texto]]` e `[[CORRUPTED: texto]]`. HTML é escapado. Tabelas, imagens, listas aninhadas, blocos de código e YAML completo ainda não estão implementados. Não se trata de um parser CommonMark completo.

O acervo atual tem doze registros adaptados das anotações em `G:/Meu Drive/RPG/Sessões`, com fonte e seção visíveis. Consulte `IMPORTACAO-CAMPANHA.md` para cobertura e pendências. Os seis exemplos fictícios iniciais foram retirados do site e preservados em `BaseProjeto/ArchiveDemo`.

## Segurança e limites

Todo arquivo publicado pode ser baixado diretamente, inclusive seu texto censurado original. Não publicar segredos, credenciais ou material que exija autenticação. Classificações e integridade são narrativas. Nenhum acesso a câmera, microfone ou backend é feito. O acervo é carregado integralmente para busca textual; avaliar indexação pré-processada quando crescer.

Não há alteração no workflow de produção, push, migração ou modificação nos serviços existentes. Esta worktree estava em detached HEAD: antes de publicar commits, escolher uma branch própria; não enviar diretamente à main do Owlbear.

## Fases

| Fase | Codex | Manual/assistido | Situação |
|---|---|---|---|
| V1 — Biblioteca | Leitor básico, categorias, busca textual, filtros, links, responsividade | Revisar exemplos e identidade | Implementada localmente; revisão visual mobile pendente |
| V1.5 — Atmosfera | Boot pulável, sons opt-in, volume, áudio e efeitos acessíveis | Aprovar sons/ritmo | Pendente; CRT estático já disponível |
| V2 — Paranormal | Instabilidade 0–4, diagnóstico, câmera narrativa, logs, anexos, parser ampliado | Fornecer capturas e conteúdo autoral | Pendente |
| V3 — Narrativa | Eventos roteirizados, desbloqueios locais, progressão | Definir segredos e códigos da campanha | Pendente; não equivale a autenticação |
| Publicação | Preparar pipeline isolado e testes HTTP | DNS, aprovação de acesso público e Caddy na VM | Guia preparado, não executado |
| V4 — Extras | Grafo, timeline, notas, backend/login se necessários | Decidir necessidade antes de ampliar arquitetura | Fora do início |

## Verificação

Execute `npm test` para os testes do leitor e do acervo (proveniência, referências e incertezas). Nenhuma verificação da nova URL em produção foi realizada. O teste visual inicial usava exemplos; o conteúdo atual tem IDs próprios da campanha.
