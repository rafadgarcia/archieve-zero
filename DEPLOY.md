# Publicação separada na VM

Plano, não configuração aplicada. Reaproveitar o Caddy existente sem tocar nos blocos Vaultwarden, API ou paranormal. O Archive não precisa do PostgreSQL nem de outro processo Node em produção.

## Antes de publicar

1. Revisar os documentos: arquivos estáticos são públicos mesmo com censura visual.
2. Escolher branch/repositório e pipeline exclusivos. O workflow atual de main publica o Owlbear; não usá-lo implicitamente para este projeto.
3. Disponibilizar somente `index.html`, `css/`, `js/`, `docs/`, `assets/` em `/opt/archive/site` na VM. Não disponibilizar `.git`, documentação interna, arquivos de teste ou segredos.
4. Fazer backup de `/opt/proxy/compose.yaml` e `/opt/proxy/Caddyfile` antes da alteração assistida.

## Caddy e DNS

Adicionar ao serviço Caddy existente, em `volumes`, preservando os demais mounts:

```yaml
- /opt/archive/site:/srv/archive:ro
```

Adicionar um novo bloco, sem substituir o Caddyfile inteiro:

```caddyfile
archive.devwolf.com.br {
    root * /srv/archive
    encode gzip
    file_server
    header X-Content-Type-Options nosniff
    header Referrer-Policy no-referrer
}
```

Criar registro DNS `archive` apontando ao IPv4 público atual da VM, confirmar portas 80/443 e validar a emissão HTTPS. Não mudar DNS dos outros serviços. Não usar fallback geral para index.html: documentos ausentes devem retornar 404.

Na VM, após os arquivos e o mount existirem:

```sh
cd /opt/proxy
docker compose config --quiet
docker compose up -d caddy
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
curl -I https://archive.devwolf.com.br
curl -I https://archive.devwolf.com.br/docs/index.json
curl -I https://archive.devwolf.com.br/docs/ausente.md
```

Esperados: 200, 200, 404. Confirmar também que os três domínios preexistentes continuam respondendo. A recriação do container para adicionar mount pode causar interrupção breve de todos os sites; agendar a primeira mudança. Para rollback, restaurar os dois arquivos de configuração salvos e recriar/recarregar o Caddy; manter a última versão do diretório estático até validar a nova.

Automação futura: testes antes da cópia, deploy por release versionada, aprovação de produção e rollback. Não foi criado workflow de publicação nesta fase.

## Atualização manual na VM

O script `restart-archieve` atualiza o checkout, recusa sobrescrever alterações locais, executa `npm test` quando Node/npm estiverem disponíveis e recarrega o Caddy somente se ele estiver ativo. Como o Archive é estático, não há container do app para reiniciar; em uma VM sem Node, a atualização dos arquivos continua normalmente.

Na primeira instalação:

```sh
cd /opt/archieve-zero
chmod +x restart-archieve
```

Para atualizar:

```sh
cd /opt/archieve-zero
./restart-archieve
```

O script usa `master` por padrão. Para outro caminho do proxy, use `PROXY_DIR=/caminho/do/proxy ./restart-archieve`. O nome mantém `archieve` para coincidir com o repositório e o comando já adotados.
