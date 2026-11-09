# Design

## Contexto

Veja [proposal.md](./proposal.md) para a motivação e [specs/navegacao-perfis/spec.md](./specs/navegacao-perfis/spec.md) para os contratos de comportamento. O frontend atual é estático, usa HTML/CSS/JavaScript puro e mantém token e operador em `sessionStorage`. O login consulta `/auth/me` para validar sessões; o acervo já separa ações de gênero por perfil. Cadastro e consulta de leitores são páginas independentes. Não há autenticação de leitores nem recursos de empréstimo, multas, exclusão de livros ou dashboard implementados.

## Objetivos / Não objetivos

**Objetivos:**

- Adicionar uma entrada central após o login, usando o perfil confirmado pelo backend.
- Agrupar os fluxos funcionais existentes de acervo e leitores e manter um caminho de retorno ao menu.
- Apresentar placeholders explícitos para recursos futuros, sem chamadas ou dados fictícios.
- Reutilizar sessão, estilos e padrões de acessibilidade já adotados.

**Não objetivos:**

- Criar endpoints, tabelas ou alterar autorização do backend.
- Implementar autenticação de leitores ou expor o Portal do Leitor a uma sessão de operador.
- Implementar empréstimos, multas, exclusão de livros ou métricas de dashboard.
- Reescrever os fluxos funcionais existentes de acervo e cadastro/consulta de leitores.

## Decisões

### Criar uma página central de menu e manter as telas de tarefa

Após login, a navegação abre uma página dedicada ao menu. Essa página funciona como ponto de entrada e agrupa itens por área, enquanto cadastro/consulta de acervo e leitores continuam em suas telas atuais. As telas existentes ganham navegação de retorno ao menu.

**Alternativa considerada:** concentrar todas as tarefas em uma única página com painéis. Foi descartada para manter a regra de uma tarefa principal por tela e evitar reescrever fluxos que já funcionam.

### Revalidar a sessão e usar o perfil retornado pela API

A página do menu exige o token existente e consulta `/auth/me` antes de apresentar opções. O perfil usado para mostrar áreas vem dessa resposta, não de parâmetros de URL nem de valores editáveis pelo navegador. As páginas de tarefa mantêm suas próprias verificações atuais; a autorização efetiva continua no backend.

**Alternativa considerada:** confiar no objeto `biblioteca.operator` persistido no navegador. Foi descartada porque dados locais podem estar desatualizados ou ser alterados e não devem determinar privilégios.

### Representar recursos indisponíveis como navegação informativa

Itens futuros abrem uma tela ou estado dedicado com texto “Em breve”, sem formulário de negócio, chamadas de API ou métricas inventadas. A ação de retorno leva ao menu.

**Alternativa considerada:** desabilitar ou ocultar todos os itens futuros. Foi descartada porque não comunica a estrutura planejada nem a indisponibilidade aos usuários.

### Separar o Portal do Leitor do menu de operadores

O menu desta change não mostra opções de leitor para `FUNCIONARIO` ou `ADMIN`. A navegação do leitor fica para uma change futura que implemente autenticação própria, e não reutiliza a sessão de operador.

**Alternativa considerada:** mostrar agora um link de Portal do Leitor na tela de operadores. Foi descartada para evitar sugerir um acesso que o projeto ainda não consegue autenticar nem proteger.

## Riscos / Trade-offs

- [O perfil pode mudar ou a sessão pode expirar depois que o menu carrega] → Validar `/auth/me` ao abrir o menu; preservar as verificações de sessão nas páginas de destino e encaminhar sessões inválidas para login.
- [A ocultação de itens é apenas uma regra de apresentação] → Manter a autorização no backend como controle efetivo, sem tratar o menu como barreira de segurança.
- [Links existentes podem retornar à página de login em vez do menu] → Atualizar a navegação de retorno nas telas integradas e cobrir os destinos nos testes de frontend.

## Plano de migração

Não há migração de dados nem publicação de backend. A entrega substitui o destino pós-login por uma página estática autenticada e acrescenta caminhos de navegação às telas atuais. O rollback consiste em restaurar o destino anterior pós-login e remover a página central e seus links, sem impacto nos dados ou APIs.
