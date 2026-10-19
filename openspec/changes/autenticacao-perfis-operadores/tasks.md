# Tasks

## 1. Backend Xano: identidade, autenticação e autorização

- [ ] 1.1 Conferir a branch/workspace Xano de destino, os registros da tabela `user` e os endpoints de demonstração; registrar o ponto de retorno e verificar que nenhum usuário de demonstração será convertido automaticamente.
- [ ] 1.2 Adaptar o schema de `user` para operadores com matrícula obrigatória e única, dados de domínio e perfis `FUNCIONARIO`/`ADMIN`; verificar criação válida, rejeição de matrícula duplicada e rejeição de perfil fora da lista permitida.
- [ ] 1.3 Adaptar `POST /auth/login` para matrícula e senha hash, mensagem genérica para falhas e resposta sem campos internos; verificar login válido, senha inválida, matrícula inexistente, campos ausentes e ausência de senha/hash/token fora do campo de credencial esperado.
- [ ] 1.4 Adaptar `GET /auth/me` e a função de controle de acesso para consultar identidade/perfil atuais no servidor; verificar token válido, token ausente/inválido, permissão concedida a `ADMIN` e negação sem efeitos para `FUNCIONARIO` em operação exclusiva.
- [ ] 1.5 Sanitizar o evento de login para registrar apenas dados públicos mínimos; verificar nos eventos persistidos que senha, hash e token não aparecem.
- [ ] 1.6 Desativar os endpoints públicos de cadastro e os fluxos de recuperação/login por e-mail do quick-start no ambiente da aplicação; verificar que essas rotas não criam usuário nem concedem acesso.

## 2. Interface: tela de login estática

- [ ] 2.1 Criar `frontend/login/index.html`, `styles.css`, `app.js` e `config.js` sem framework; verificar que a tela pode ser servida como arquivos estáticos e que a URL da API fica em configuração pública separada.
- [ ] 2.2 Implementar formulário de matrícula e senha com paleta do projeto, foco inicial, rótulos acessíveis, mensagens textuais e estados de carregamento/erro; verificar navegação e envio somente por teclado e inspeção visual em desktop e viewport estreita.
- [ ] 2.3 Integrar o formulário ao login Xano, apresentar falha genérica, bloquear envio duplicado e disponibilizar token/perfil após sucesso usando `sessionStorage`; verificar os estados de sucesso, falha e carregamento sem inserir resposta da API como HTML.
- [ ] 2.4 Validar o frontend isoladamente com casos de sucesso e erro da API; verificar que a senha não é persistida e que token/perfil ficam somente em `sessionStorage`, não em `localStorage`.

## 3. Integração e provisionamento inicial

- [ ] 3.1 Configurar a URL base do Xano e permitir por CORS a origem da interface implantada; verificar chamada de login real pelo navegador sem erro de origem cruzada.
- [ ] 3.2 Provisionar o primeiro Admin pelo processo administrativo do Xano e executar smoke test integrado; verificar login com matrícula, perfil `ADMIN`, consulta autenticada e rejeição de credenciais inválidas.
