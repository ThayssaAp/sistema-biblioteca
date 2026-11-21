# Tasks

## 1. Modelo e autenticação de operadores

- [x] 1.1 Adicionar ao schema `user` os campos de ativação lógica, com default ativo e campos opcionais de desativação; validar XanoScript e confirmar compatibilidade dos registros existentes.
- [x] 1.2 Atualizar o login de operadores para rejeitar registros desativados com a mesma resposta genérica de credenciais inválidas; validar com operador ativo e desativado.
- [x] 1.3 Substituir a precondição fixa da API de alteração de perfil por validação `ADMIN`, perfil permitido e operador alvo existente; validar cenários Admin, Funcionário e perfil inválido.

## 2. Backend administrativo de funcionários

- [x] 2.1 Implementar API autenticada de cadastro de operador com matrícula única, CPF válido, campos obrigatórios, senha segura com hash e perfil válido; validar duplicidade, campos ausentes e senha fraca.
- [x] 2.2 Implementar API paginada de consulta por matrícula, nome e perfil, retornando somente dados públicos e exigindo `ADMIN`; validar filtros, paginação e acesso negado.
- [x] 2.3 Implementar alteração de perfil de outro operador com auditoria e exclusão de dados secretos; validar perfil válido, alvo inexistente e tentativa por Funcionário.
- [x] 2.4 Implementar desativação lógica por Admin, impedindo desativação da própria conta e bloqueando futuros logins; validar operador ativo, desativado e própria conta.
- [x] 2.5 Registrar eventos sanitizados para criação, alteração de perfil e desativação, sem senha, hash ou token; validar os eventos e o operador responsável.

## 3. Interface administrativa de funcionários

- [x] 3.1 Substituir o placeholder futuro no menu por uma opção funcional exclusiva de Admin e proteger o acesso direto por sessão e perfil; testar destinos e redirecionamento.
- [x] 3.2 Criar tela administrativa acessível para cadastrar funcionários, com CPF, matrícula, dados pessoais, senha inicial, perfil e mensagens textuais; testar validação e bloqueio de envio duplicado.
- [x] 3.3 Implementar consulta paginada e filtros por matrícula, nome e perfil, com atualização após operações; testar paginação, listas vazias e acesso negado.
- [x] 3.4 Implementar alteração de perfil e confirmação de desativação, impedindo ações sobre a própria conta na interface; testar estados de carregamento, sucesso e erro.
- [x] 3.5 Renderizar todas as respostas da API como texto, sem interpolar dados como HTML, e atualizar os testes de frontend relevantes.

## 4. Verificação integrada

- [x] 4.1 Validar todos os arquivos Xano alterados com o validador XanoScript e corrigir erros antes da integração.
- [x] 4.2 Executar a suíte completa de testes do frontend e os testes focados de backend/UI; registrar ausência de regressões.
- [x] 4.3 Atualizar README e documentos diretamente relacionados à área administrativa e executar revisão final do diff.
