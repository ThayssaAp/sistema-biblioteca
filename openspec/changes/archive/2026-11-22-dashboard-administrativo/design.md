# Design

## Context

O projeto já possui as tabelas `reader`, `loan`, `book` e `fine`, além de
autenticação por perfil em `/auth/me`. O menu administrativo ainda apresenta o
Dashboard como placeholder. Consulte o `proposal.md` para a motivação e os
deltas de especificação para os contratos observáveis.

## Goals / Non-Goals

**Goals:**
- Entregar uma consulta agregada com os seis indicadores do domínio.
- Aplicar autorização `ADMIN` no backend e proteção equivalente na interface.
- Renderizar somente contagens, sem dados pessoais ou registros individuais.
- Reutilizar os padrões atuais de sessão, layout e testes Vanilla JS.

**Non-Goals:**
- Rankings de livros ou leitores.
- Histórico ou lista detalhada de atrasos.
- Filtros por período, unidade ou gênero.
- Exportação de dados.
- Alterar os cálculos de multa ou vencimento já definidos.

## Decisions

- Criar um endpoint autenticado `GET /admin/dashboard` no grupo `Authentication`
  ou em um grupo administrativo equivalente. O endpoint obterá o operador
  autenticado e executará `required_role: "ADMIN"` antes de qualquer consulta.
  Alternativa rejeitada: montar contagens no frontend, porque permitiria
  escapar da autorização e dependeria de endpoints que exponham dados brutos.
- Implementar os indicadores por consultas separadas e pequenas sobre as
  tabelas existentes:
  - leitores: contagem da tabela `reader`;
  - leitores com empréstimos ativos: contagem distinta de `reader_id` em
    `loan.status == "Ativo"`;
  - livros disponíveis: contagem de `book.status == "Disponível"` com
    `deleted_at == null`;
  - livros emprestados: contagem de `book.status == "Emprestado"` com
    `deleted_at == null`;
  - empréstimos em atraso: contagem de `loan.status == "Ativo"` com
    `due_at < now`;
  - multas pendentes: contagem de `fine.status == "Pendente"`.
  Alternativa rejeitada: retornar registros e agregar no navegador, pois
  aumentaria vazamento de dados e carga desnecessária.
- Definir a resposta como um objeto JSON com seis propriedades numéricas,
  permitindo que a interface detecte ausência de dados sem inferir informações
  pessoais.
- Criar uma página dedicada em `frontend/dashboard/`, composta por HTML, CSS e
  JavaScript, seguindo o padrão das telas administrativas existentes. O menu
  passará a apontar diretamente para essa página e não reutilizará o placeholder.
- Validar `/auth/me` ao carregar e bloquear imediatamente perfis diferentes de
  `ADMIN`. A validação do backend continua sendo a autoridade final; o controle
  visual não substituirá essa autorização.
- Renderizar respostas da API como texto e manter estados de carregamento,
  sucesso, erro e sessão expirada. Não usar interpolação de dados como HTML.

## Risks / Trade-offs

- [Consultas agregadas podem afetar o Free plan com muitas atualizações] →
  Usar consultas de contagem no backend e uma única requisição por carregamento.
- [Leitores com mais de um empréstimo ativo podem inflar contagens] →
  Contar identificadores distintos de `reader_id`, não linhas de empréstimo.
- [Exemplares retirados podem continuar com status `Disponível`] →
  Filtrar `deleted_at == null` nos indicadores de acervo.
- [O relógio ou o formato de timestamp pode divergir] →
  Comparar `due_at` com `now` no Xano e usar dados já persistidos em
  milissegundos, sem converter datas no frontend.
- [A tela pode parecer vazia antes da resposta] → Exibir estado de carregamento
  e estado vazio com zero para cada valor recebido.

## Migration Plan

1. Implementar e publicar o endpoint agregado no Xano.
2. Validar os seis cenários de contagem e os acessos por perfil.
3. Criar a página e os estilos do Dashboard no frontend.
4. Atualizar o menu, remover o estado "Em breve" e adicionar testes.
5. Executar a suíte completa de frontend e os testes focados do backend.
6. Revisar o diff e validar todos os arquivos Xano.

Rollback: remover o endpoint do menu e restaurar temporariamente o placeholder
sem alterar tabelas ou dados existentes.
