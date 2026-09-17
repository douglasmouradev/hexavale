# Hexavale

Calculadora de campo para manga e uva. O produtor usa o app no celular (PWA, dados no aparelho). O administrador envia os vídeos das propagandas pelo painel; o MySQL guarda o login e os arquivos.

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

O servidor cria o banco `hexa_manga` e as tabelas sozinho. O primeiro administrador usa o e-mail e a senha do `.env`.

Se preferir Docker para o banco: `docker compose up -d` e no `.env` use porta `3307`, usuário `hexa`, senha `hexa_manga`.

## Publicar (PWA + API no mesmo endereço)

```bash
npm run build
npm start
```

Isso sobe o app e a API na porta do `.env` (`PORT`, padrão 3001). No computador: http://127.0.0.1:3001

`npm start` recusa `JWT_SECRET` e `ADMIN_PASSWORD` de exemplo. Se o admin ainda estiver com a senha antiga de desenvolvimento, ela é trocada pela do `.env`.

Para o produtor instalar no celular, publique esse processo atrás de **HTTPS** (nginx, Cloudflare Tunnel, ou o host que vocês usarem). Sem HTTPS o Safari/Chrome não instala o PWA.

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
npm run build
npm run preview:all
```

Abra http://localhost:4173 (B) ou http://localhost:3001 (A) no Chrome. No computador isso já permite **Instalar Hexavale**. No iPhone, use o Safari: Compartilhar → Adicionar à Tela de Início.

O botão **Lançar itens de teste** só aparece no `npm run dev`.
