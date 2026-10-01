# Hexavale

Calculadoras de campo da mangueira: safra, PBZ, calda orgânica e tratos culturais. O produtor usa o app no celular (PWA, dados no aparelho). O administrador envia os vídeos das propagandas pelo painel; o MySQL guarda o login e os arquivos.

## Subir o projeto (desenvolvimento)

1. Copie `.env.example` para `.env` e preencha a senha do MySQL.
2. Defina `JWT_SECRET` (16+ caracteres) e `ADMIN_PASSWORD` (12+ caracteres). Não deixe os valores de exemplo.
3. Rode o app e a API:

```bash
npm install
npm run dev:all
```

- Produtor: http://localhost:5173
- Admin (vídeos): http://localhost:5173/admin/login
- API: http://127.0.0.1:3001/api/health

O servidor cria o banco `hexa_manga` e as tabelas sozinho. Se existir `server/uploads/videos/hexavale-amostra.mp4` e ainda não houver vídeo, ele entra no ar automaticamente. O primeiro administrador usa o e-mail e a senha do `.env`.

Se preferir Docker para o banco: `docker compose up -d` e no `.env` use porta `3307`, usuário `hexa`, senha `hexa_manga`.

## Teste externo (build + API + túnel)

O Vite em modo `dev` pelo túnel costuma demorar demais. Use o build:

```bash
npm run demo
```

Em outro terminal (com `cloudflared` instalado):

```bash
npm run tunnel
```

Abra o link `*.trycloudflare.com`. App + anúncios + `/uploads` passam pela porta 4173 (preview) com a API na 3001.

## Publicar (PWA + API no mesmo endereço)

```bash
npm run build
npm start
```

Isso sobe o app e a API na porta do `.env` (`PORT`, padrão 3001). No computador: http://127.0.0.1:3001

`npm start` recusa `JWT_SECRET` e `ADMIN_PASSWORD` de exemplo. Se o admin ainda estiver com a senha antiga de desenvolvimento, ela é trocada pela do `.env`.

Para o produtor instalar no celular, publique esse processo atrás de **HTTPS** (nginx, Cloudflare Tunnel nomeado, ou o host que vocês usarem). Sem HTTPS o Safari/Chrome não instala o PWA. No mesmo domínio precisam existir:

- o app (`/`)
- a API (`/api/...`)
- os vídeos (`/uploads/videos/...`)

O caderno do produtor continua só no aparelho. Sem a API, o caderno funciona e o anúncio não aparece.

## Instalar no celular (teste local)

O PWA só registra depois do build (não no `npm run dev`).

Opção A — um endereço só (app + vídeos):

```bash
npm run build
npm start
```

Opção B — preview do Vite com a API ao lado:

```bash
npm run demo
```

Abra http://localhost:4173 (B) ou http://localhost:3001 (A) no Chrome. No computador isso já permite **Instalar Hexavale**. No iPhone, use o Safari: Compartilhar → Adicionar à Tela de Início.

O `npm start` escuta só em `127.0.0.1` (o túnel entra por ali). Para abrir na rede local, rode com `HOST=0.0.0.0`.
