# Interface local

A interface é estática e consome a API publicada no Xano. Para iniciar a partir da raiz do repositório:

```bash
python3 -m http.server 8765 --directory frontend
```

Abra `http://127.0.0.1:8765/`. A raiz encaminha para a tela de login; após entrar, o sistema valida a sessão e abre o menu principal. Funcionários e Admins podem acessar cadastro/consulta de livros e leitores. A gestão de gêneros aparece apenas para Admin. Empréstimos e multas no balcão, exclusão de livros e dashboard são apresentados como **Em breve** e ainda não executam operações.

O Portal do Leitor está disponível em `portal-leitor/`. O leitor entra com CPF e senha temporária fornecida pela biblioteca; no primeiro acesso, precisa definir uma senha própria. Tokens de leitores usam chaves próprias em `sessionStorage` e não são aceitos no fluxo de operadores, assim como tokens de operadores não são aceitos no portal.

Para testar somente o visual e o fluxo de telas sem publicar as APIs do Xano, abra `portal-leitor/demo.html`. Essa demonstração usa a senha fictícia `Temp1234` e não salva nem envia credenciais.

Na tela do acervo, as opções **Cadastrar livro** e **Consultar livros** abrem diretamente a tarefa selecionada. O acesso à aba **Gêneros** é validado novamente pelo perfil; um Funcionário que tente abrir esse endereço retorna à consulta do acervo.

O servidor Python serve somente os arquivos estáticos e não inicia nem publica o backend.

As URLs públicas das APIs estão configuradas em `login/config.js`, `leitores/config.js` e `portal-leitor/config.js`. `apiBaseUrl` aponta para os grupos de autenticação, leitores e Portal do Leitor; `catalogApiBaseUrl` deve receber a URL base do grupo **Catalog** depois que a API de catálogo for publicada no Xano. Até essa URL ser preenchida, a tela do acervo informará que falta configuração. Tokens de operador e leitor são mantidos apenas em `sessionStorage`, em chaves separadas.
