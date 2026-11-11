# Interface local

A interface é estática e consome a API publicada no Xano. Para iniciar a partir da raiz do repositório:

```bash
python3 -m http.server 8765 --directory frontend
```

Abra `http://127.0.0.1:8765/`. A raiz encaminha para a tela de login; após entrar, o sistema valida a sessão e abre o menu principal. Funcionários e Admins podem acessar cadastro/consulta de livros e leitores. A gestão de gêneros e a retirada justificada de exemplares disponíveis aparecem apenas para Admin. Empréstimos, multas e dashboard continuam como **Em breve**.

O Portal do Leitor não está disponível nesta etapa: leitores ainda não têm autenticação própria, e a sessão de operador não é aceita como sessão de leitor. O menu e as telas de tarefa encaminham para login quando a sessão do operador está ausente ou expirada.

Na tela do acervo, as opções **Cadastrar livro** e **Consultar livros** abrem diretamente a tarefa selecionada. O acesso às abas **Gêneros** e **Exclusão de livro** é validado novamente pelo perfil; um Funcionário que tente abrir uma delas retorna à consulta do acervo. A retirada é lógica, exige justificativa, preserva o código e o histórico e não aceita exemplares emprestados.

O servidor Python serve somente os arquivos estáticos e não inicia nem publica o backend.

As URLs públicas das APIs estão configuradas em `login/config.js`. `apiBaseUrl` aponta para o grupo de autenticação e `catalogApiBaseUrl` para o grupo **Catalog**. Tokens de operador são mantidos apenas em `sessionStorage` no navegador.
