# Diretrizes para Agentes de IA

## 1. Princípios Gerais
- Siga as boas práticas de código limpo, legibilidade e simplicidade.
- Consulte sempre os documentos presentes na pasta `docs/` antes de tomar decisões estruturais.
- O desenvolvimento deve ser feito de forma estritamente incremental via OpenSpec.

## 2. Regras de Negócio e Domínio
- Respeite fielmente as regras de negócio descritas no `domain-model.md` e `project-overview.md`.
- Lógica de datas e multas:
  - Funcionamento: Segunda a Sexta, das 09h às 18h (horário fixo de Brasília).
  - Vencimento: 5º dia útil após o empréstimo, às 18h.
  - Multa: R$ 10,00 por dia útil iniciado de atraso. Fins de semana e o próprio dia do empréstimo não contam.
  - Feriados não são calculados automaticamente; exceções são resolvidas via abono manual pelo Admin.

## 3. Segurança e Controle de Acesso
- As permissões e perfis (Funcionário e Admin) devem ser validados rigorosamente no servidor/backend.
- Exclusão de livros, abono de multas e gerenciamento de gêneros são restritos ao Admin.
- Senhas devem ser armazenadas de forma segura (hash) e nunca em texto plano.

## 4. Padrões de Interface (UX/UI)
- Seguir as orientações de UX: uma tarefa por tela, cores com texto explicativo associado (acessibilidade), fontes `Inter` e `JetBrains Mono` para códigos (`#ADS0000`, `#EMP000000`).
- Foco em usabilidade e agilidade no atendimento de balcão.