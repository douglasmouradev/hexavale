# Hexa Manga

Calculadora de campo para manga e uva. O produtor usa o app no celular (PWA, dados no aparelho). O administrador envia os vídeos das propagandas pelo painel; o MySQL guarda o login e os arquivos.

## Subir o projeto

1. Coloque a senha do MySQL em `.env` (`MYSQL_PASSWORD`).
2. Rode o app e a API:

```bash
npm install
npm run dev:all
```

- Produtor: http://localhost:5173
- Admin (vídeos): http://localhost:5173/admin/login
- API: http://127.0.0.1:3001/api/health

O servidor cria o banco `hexa_manga` e as tabelas sozinho.

Login inicial do admin:

- E-mail: `admin@hexamanga.local`
- Senha: `HexaAdmin123`

Se preferir Docker: `docker compose up -d` e no `.env` use porta `3307`, usuário `hexa`, senha `hexa_manga`.
