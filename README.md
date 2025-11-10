# Projeto CI/CD - Front-End  - Gabriel Pessoni | 4°DSM Fatec Franca


## Objetivo

Demonstrar um pipeline completo de CI/CD que integra GitHub, Render e Vercel para publicar automaticamente a aplicação front-end a cada nova versão versionada por tag.

## Fluxo de Deploy

1. Push de uma nova tag seguindo o padrão `v*.*.*` aciona o workflow `Release and Deploy Workflow`.
2. O GitHub Actions executa o build do front-end (`npm install` + `npm run build`) e dispara o deploy de produção na Vercel.
3. A API hospedada na Render é consumida automaticamente pela aplicação front-end assim que a nova versão entra no ar.

## Front-end

O front-end é uma aplicação Next.js que consome a API publicada na Render. O deploy é realizado pela Vercel via ação `amondnet/vercel-action@v25`, configurada em `.github/workflows/release.yml`. Esse workflow:

- é disparado apenas em pushes de tags (`v*.*.*`);
- checkouta o repositório (`actions/checkout@v3`);
- instala dependências (`npm install`);
- gera o build (`npm run build`);
- publica na Vercel utilizando `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`.

## URLs

- Front-end: https://projeto-ci-cd-front.vercel.app/
- Back-end: https://projeto-ci-cd-back.onrender.com/

## Como testar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`, consumindo os serviços externos configurados em `src/services`.

