# Interface local

A interface é estática e consome a API publicada no Xano. Para iniciar a partir da raiz do repositório:

```bash
python3 -m http.server 8765 --directory frontend
```

Abra `http://127.0.0.1:8765/`. A raiz encaminha para a tela de login; após entrar, o sistema valida a sessão e abre o menu principal. Funcionários e Admins podem acessar cadastro/consulta de livros e leitores. A gestão de gêneros aparece apenas para Admin. Empréstimos e multas no balcão, exclusão de livros e dashboard são apresentados como **Em breve** e ainda não executam operações.

O Portal do Leitor está disponível em `portal-leitor/`. O leitor entra com CPF e senha temporária fornecida pela biblioteca; no primeiro acesso, precisa definir uma senha própria. Tokens de leitores usam chaves próprias em `sessionStorage` e não são aceitos no fluxo de operadores, assim como tokens de operadores não são aceitos no portal.

Para testar somente o visual e o fluxo de telas sem publicar as APIs do Xano, abra `portal-leitor/demo.html`. Essa demonstração usa a senha fictícia `Temp1234` e não salva nem envia credenciais. Para testar a consulta de livros com filtros e dados fictícios, abra `portal-leitor/catalog-demo.html`.
Para executar a jornada integrada com o Xano, abra `portal-leitor/jornada.html`. Ela exige as credenciais reais de um operador, grava o leitor, faz o primeiro login, troca a senha e consulta o acervo. Use preferencialmente um servidor HTTP local (`python3 -m http.server 8765 --directory frontend`) para evitar restrições do navegador ao abrir arquivos diretamente.
Se a jornada informar que um endpoint ainda não foi publicado, sincronize no grupo **Leitores** os scripts `auth_login_POST.xs`, `auth_change_password_POST.xs`, `auth_me_GET.xs`, `books_GET.xs` e `genres_GET.xs` antes de repetir o teste. O cadastro pode funcionar mesmo quando os endpoints novos ainda não foram publicados.

No Portal do Leitor, a tela `portal-leitor/catalog.html` permite consultar livros em modo somente leitura, filtrando por título, gênero, disponibilidade e classificação etária. A sessão expirada limpa as chaves do leitor e redireciona para o login. O leitor não pode cadastrar, editar, excluir, reservar ou solicitar empréstimos.

O servidor Python serve somente os arquivos estáticos e não inicia nem publica o backend.

As URLs públicas das APIs estão configuradas em `login/config.js`, `leitores/config.js` e `portal-leitor/config.js`. O `portal-leitor/config.js` aponta para o grupo de APIs dos leitores, que expõe autenticação, gêneros e livros com `auth = "reader"`. Tokens de operador e leitor são mantidos apenas em `sessionStorage`, em chaves separadas.
