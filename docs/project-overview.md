# Visão Geral do Projeto — Sistema de Biblioteca Comunitária

## 1. Visão Geral
Sistema de gestão para biblioteca comunitária abastecida por doações. O sistema combina atendimento de balcão operado pela equipe, um Portal do Leitor e um dashboard de acesso exclusivo do Admin.

## 2. Problema
A biblioteca comunitária necessita controlar empréstimos e acervo no balcão sem complexidade operacional, além de dar transparência e autonomia aos leitores sobre seus prazos e permitir que a administração acompanhe indicadores de uso da biblioteca.

## 3. Objetivos
- Prover uma interface rápida de balcão para operadores, garantindo rastreabilidade, empréstimos por 7 dias corridos e controle de atrasos e multas.
- Disponibilizar um portal para leitores cadastrados consultarem livros disponíveis e visualizarem seus empréstimos ativos, vencimentos e histórico, além de solicitarem renovações.
- Oferecer um dashboard simples e exclusivo do Admin com indicadores de leitores, acervo e atrasos/multas.

## 4. Público-alvo / Usuários
- **Funcionário:** Opera o balcão (cadastra livros e leitores, consulta acervo, realiza empréstimos, devoluções e solicitações de renovação).
- **Admin:** Possui todas as permissões do Funcionário + exclusão de livros (com justificativa), abono de multas, gerenciamento de gêneros e acesso exclusivo ao dashboard.
- **Leitor:** Possui uma conta separada das contas de Funcionário/Admin e acessa o Portal do Leitor para consultar livros disponíveis, visualizar os próprios empréstimos ativos, vencimentos e histórico, e solicitar renovações.

## 5. Escopo Expandido
- **Balcão:** Autenticação de operadores (matrícula/senha), cadastro/consulta de exemplares (`#ADS0000`), cadastro de leitores (CPF), empréstimos orientados (`#EMP000000`), devoluções, solicitações de renovação e cálculo de multas por dias corridos iniciados de atraso.
- **Contas:** As contas de leitores são separadas das contas de Funcionário/Admin. No cadastro do leitor, Funcionário/Admin define uma senha inicial genérica, igual para todos os leitores; a troca é obrigatória no primeiro acesso ao Portal do Leitor. Essa simplificação atende ao trabalho acadêmico, mas as senhas devem ser armazenadas com hash, nunca em texto puro.
- **Portal do Leitor:** Acesso restrito a leitores cadastrados, com autenticação por CPF e senha, consulta de livros disponíveis, visualização dos próprios empréstimos ativos, vencimentos e histórico, e solicitação de renovação (1 uso por empréstimo).
- **Dashboard do Admin:** Exibe somente o total de leitores cadastrados, a quantidade de leitores com livros emprestados, as quantidades de livros disponíveis e emprestados, e a quantidade de empréstimos em atraso e de multas. Não inclui rankings de popularidade nem painel de atrasos críticos.
- **Empréstimos e multas:** O empréstimo vence após 7 dias corridos (por exemplo, uma retirada na quarta-feira vence na quarta-feira seguinte). É permitida uma renovação por empréstimo, por mais 7 dias corridos, solicitada pelo Portal do Leitor ou pelo sistema do Funcionário. O leitor não pode renovar um empréstimo se tiver multa em outro livro. A multa é de R$ 10,00 por dia corrido iniciado de atraso, começando no dia seguinte ao vencimento.
- **Gerenciamento Admin:** Exclusão restrita de exemplares, abono de multas e edição de gêneros.

## 6. Fora do Escopo
- Localização física das estantes/prateleiras nos livros.
- Tratamento de livros danificados/perdidos no status formal do acervo.
- Fila física/reserva automatizada de exemplares ocupados.
- Notificações automáticas externas (SMS, e-mail real ou WhatsApp).
- Calendário dinâmico de feriados nacionais/municipais.
- Integração com APIs externas de ISBN ou pré-preenchimento bibliográfico.

## 7. Requisitos de UX e Interfaces
- **Paleta:** Fundo em tom de papel claro (`#F6F3EC`), superfícies brancas, verde-escuro (`#1F5C4D`) como tom principal, acompanhado de indicação textual para acessibilidade.
- **Tipografia:** Fonte `Inter` para texto geral e `JetBrains Mono` para códigos (`#ADS0000`, `#EMP000000`).
- **Estratégia:** Uma tarefa principal por tela; foco inicial via teclado para operação de balcão; layout responsivo para o Portal do Leitor e o dashboard administrativo.

## 8. Arquitetura Tecnológica
- **Backend / Banco de Dados:** Xano (APIs REST, endpoints de agregação/analytics e tabelas de banco).
- **Frontend / Interface Gráfica:** HTML5, CSS3 e JavaScript puro (Vanilla JS).
- **Abordagem de Desenvolvimento:** Entregas verticais completas por Change atômica (Backend + Frontend + Tests).