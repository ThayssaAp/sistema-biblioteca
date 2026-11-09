# Interface local

A interface é estática e consome a API publicada no Xano. Para iniciar a partir da raiz do repositório:

```bash
python3 -m http.server 8765 --directory frontend
```

Abra `http://127.0.0.1:8765/`. A raiz encaminha para a tela de login; após autenticar, use **Abrir acervo** para acessar livros e gêneros. O servidor Python serve somente os arquivos estáticos e não inicia nem publica o backend.

As URLs públicas das APIs estão configuradas em `login/config.js`. `apiBaseUrl` aponta para o grupo de autenticação atual; `catalogApiBaseUrl` deve receber a URL base do grupo **Catalog** depois que a API de catálogo for publicada no Xano. Até essa URL ser preenchida, a tela do acervo informará que falta configuração. Tokens de operador são mantidos apenas em `sessionStorage` no navegador.
