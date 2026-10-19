# Project Overview — Sistema de Biblioteca Comunitária

## 1. Visão Geral
Sistema de atendimento de balcão para gerenciamento de uma biblioteca comunitária abastecida por doações. O sistema permite o cadastro de livros (exemplares físicos), leitores e operadores, além do controle de empréstimos, devoluções, multas por atraso e gerenciamento do acervo.

## 2. Problema
A biblioteca necessita de uma solução extremamente simples, direta e funcional para operar o balcão do acervo comunitário, controlando empréstimos, devoluções e eventuais atrasos/multas sem complexidade de configurações de calendário ou regras personalizadas por leitor.

## 3. Objetivos
Prover uma interface rápida e eficiente para os operadores do balcão, garantindo rastreabilidade de todas as ações, controle rigoroso do prazo de 5 dias úteis e bloqueios automáticos baseados em pendências (atrasos, multas ou limites de empréstimo).

## 4. Público-alvo / Usuários
- **Funcionário:** Opera o balcão (cadastra livros e leitores, consulta acervo, realiza empréstimos e devoluções).
- **Admin:** Possui todas as permissões do Funcionário + exclusão de livros (com justificativa), abono de multas e gerenciamento da lista de gêneros.
- **Leitor:** Apenas cadastrado no sistema (não acessa o sistema diretamente).

## 5. Escopo Inicial (v1)
- Autenticação de operadores via matrícula e senha.
- Cadastro e consulta de exemplares com IDs sequenciais únicos (`#ADS0000`).
- Cadastro de leitores identificado unicamente pelo CPF.
- Fluxo de empréstimo em tela única guiada (livro + leitor) com validação de restrições (idade, limite de 2 livros, multas/atrasos).
- Fluxo de devolução com cálculo automático de multa por dias úteis iniciados.
- Gerenciamento restrito ao Admin: exclusão de exemplares, abono de multas e edição de gêneros.

## 6. Fora do Escopo (v1)
- Renovação de prazo de empréstimo.
- Tratamento ou estado de livro danificado/perdido no status.
- Acesso direto do leitor ao sistema (login, reserva ou consulta online).
- Calendário dinâmico de feriados e configuração de horários.
- Validação avançada de dígito verificador do ISBN e pré-preenchimento automático via API externa.

## 7. Requisitos de UX e Interfaces
- **Paleta:** Fundo em tom de papel claro (`#F6F3EC`), superfícies brancas, verde-escuro (`#1F5C4D`) como tom principal, acompanhado de indicação textual para acessibilidade.
- **Tipografia:** Fonte `Inter` para texto geral e `JetBrains Mono` para os códigos `#ADS0000` e `#EMP000000`.
- **Estratégia:** Uma tarefa principal por tela; foco inicial via teclado e atalhos rápidos.

## 8. Arquitetura tecnológica
- **Backend / Banco de Dados:** Xano (APIs REST e tabelas de banco).
- **Frontend / Interface Gráfica:** HTML5, CSS3 e JavaScript puro (Vanilla JS).
- **Abordagem de Desenvolvimento:** Entregas verticais completas. Cada Change deve entregar tanto a API/banco no backend quanto a tela e o fluxo de interface correspondentes em HTML/CSS/JS.