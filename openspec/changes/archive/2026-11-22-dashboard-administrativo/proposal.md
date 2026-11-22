# Proposal

## Why

Administradores precisam acompanhar a operação da biblioteca sem consultar
planilhas ou navegar por várias telas. O Dashboard deve reunir em uma única
visão os indicadores de leitores, acervo, circulação e multas definidos pelo
domínio, substituindo o placeholder administrativo atual.

## What Changes

- Criar um endpoint agregado no Xano para fornecer indicadores da biblioteca.
- Restringir o endpoint exclusivamente ao perfil `ADMIN`.
- Exibir total de leitores, leitores com empréstimos ativos, livros disponíveis,
  livros emprestados, empréstimos em atraso e multas pendentes.
- Substituir o placeholder "Dashboard" no menu administrativo por uma tela
  funcional, acessível e responsiva.
- Não expor dados pessoais de leitores ou registros individuais.
- Tratar sessão expirada, acesso negado e erro de consulta com mensagens
  textuais.

## Capabilities

### New Capabilities

- `dashboard-administrativo`: consulta agregada e apresentação dos indicadores
  operacionais exclusivos do Admin.

### Modified Capabilities

- `navegacao-perfis`: o Dashboard deixa de ser um recurso "Em breve" e passa a
  ser uma rota funcional exclusiva de Admin.

## Impact

- Backend Xano: novo endpoint administrativo agregado no workspace.
- Banco Xano: consultas sobre `reader`, `loan`, `book` e `fine`; nenhuma
  alteração estrutural é inicialmente necessária.
- Frontend: nova view ou página dedicada de Dashboard, removendo o placeholder
  do menu.
- Segurança: autenticação por bearer token e validação definitiva de
  `required_role: "ADMIN"` no backend.
- Testes: testes de frontend para autenticação, perfil e renderização dos seis
  indicadores, além de testes de contrato do endpoint Xano.
