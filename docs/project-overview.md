# Visão Geral do Projeto — Sistema de Biblioteca Comunitária

## 1. Visão Geral
O projeto é um sistema web completo para gestão de uma biblioteca comunitária. Ele reúne o Sistema Balcão, usado por Funcionários e Admins, o Portal do Leitor e a Área Administrativa. Todo o escopo abaixo corresponde a funcionalidades entregues no frontend e nas APIs Xano.

## 2. Público e perfis
- **Funcionário:** autentica no Sistema Balcão e pode consultar o acervo, cadastrar livros e leitores, consultar leitores, criar, consultar, renovar e encerrar empréstimos no balcão e consultar ou registrar o pagamento de multas.
- **Admin:** possui integralmente o acesso do Funcionário e, além disso, gerencia gêneros, exclui logicamente livros, cadastra, consulta, altera o perfil e desativa funcionários e visualiza o dashboard administrativo.
- **Leitor:** autentica no Portal do Leitor por CPF e senha própria. Pode consultar livros disponíveis, consultar os próprios empréstimos, vencimentos, situação de atraso e multas.

## 3. Sistema Balcão
- Consulta e cadastro de livros com código `#ADS0000` e seleção de gênero e faixa etária.
- Consulta e cadastro de leitores identificados por CPF.
- Criação de empréstimo no balcão com seleção de um leitor elegível e de um exemplar disponível, gerando o código `#EMP000000`.
- Consulta de empréstimos por código, leitor, exemplar e status.
- Devolução e renovação no balcão. Cada empréstimo pode ser renovado uma vez por mais sete dias corridos.
- Consulta de multas e registro de pagamento por Funcionário ou Admin.

## 4. Portal do Leitor
- Login por CPF e senha separados da autenticação dos operadores.
- Troca obrigatória da senha temporária no primeiro acesso.
- Permite consulta somente leitura de livros disponíveis e dos próprios empréstimos, vencimentos e multas.

## 5. Área Administrativa
A Área Administrativa é exclusiva do perfil `ADMIN`:
- adição, edição e exclusão de gêneros que não estejam associados a exemplares;
- exclusão lógica de livros disponíveis, com justificativa e auditoria;
- cadastro, consulta, alteração de perfil e desativação lógica de funcionários; e
- dashboard com total de leitores, leitores com empréstimos ativos, livros disponíveis, livros emprestados, empréstimos em atraso e multas pendentes.

## 6. Regras de empréstimos e multas
- O empréstimo vence sete dias corridos após a retirada ou a última renovação.
- Novos empréstimos exigem exemplar disponível e impedem limite acima de dois empréstimos ativos, atraso, multa pendente ou incompatibilidade de faixa etária.
- A renovação é única, só pode ocorrer no balcão, para empréstimo ativo e dentro do prazo, e é bloqueada por multa pendente em outro empréstimo.
- Devoluções encerram o empréstimo e liberam o exemplar.
- Multas são calculadas em R$ 10,00 por dia corrido iniciado de atraso, sem contar o próprio dia do vencimento. O valor é registrado em centavos e pagável no balcão por Funcionário ou Admin.

## 7. Segurança e UX
- Perfis e operações administrativas são validados no backend.
- Senhas de operadores e leitores são armazenadas com hash e não são retornadas pelas APIs.
- A interface usa HTML5, CSS3 e JavaScript puro, com estados textuais de carregamento, sucesso, vazio e erro.
- São usadas as fontes `Inter` e `JetBrains Mono` e rótulos textuais associados aos controles, preservando acessibilidade e operação por teclado.

## 8. Arquitetura
- Backend e banco de dados: Xano, com APIs REST e consultas agregadas.
- Frontend: páginas HTML e JavaScript integrado em `frontend/`.
- Timestamps operacionais são persistidos em milissegundos e valores financeiros em centavos.

## 9. Fora do escopo entregue
Não fazem parte do sistema: localização física de estantes, reserva ou fila de exemplares, notificações externas, integração com APIs externas de ISBN e calendário automático de feriados.