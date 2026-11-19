# Design

## Context

A aplicação possui dois fluxos de autenticação independentes: o login de operadores em `frontend/login/` e o Portal do Leitor em `frontend/portal-leitor/`. Atualmente cada fluxo pode ser acessado diretamente e o login de operador expõe um link secundário para leitores.

## Goals / Non-Goals

**Goals:**

- Criar uma porta de entrada pública, simples e responsiva.
- Reutilizar os destinos HTML existentes, sem duplicar autenticação.
- Manter tokens e armazenamento de sessão intocados.
- Oferecer semântica HTML, foco visível e textos claros para os dois públicos.

**Non-Goals:**

- Alterar endpoints Xano, regras de autorização ou modelo de usuários.
- Unificar as sessões de leitor e operador.
- Criar redirecionamento automático baseado em sessão ou perfil detectado.
- Implementar cadastro, recuperação de senha ou novos recursos do portal.

## Decisions

### Página estática como ponto de entrada

Adicionar uma página `frontend/index.html` com stylesheet próprio ou compartilhado conforme o padrão visual já usado no frontend. Links HTML sem lógica de autenticação serão usados para os dois destinos.

**Alternativa considerada:** implementar um roteador JavaScript. Foi descartado porque acrescentaria complexidade e estado a uma tela que só precisa encaminhar o usuário.

### Destinos existentes permanecem canônicos

“Sou leitor” apontará para `./portal-leitor/` e “Sou funcionário” apontará para `./login/`. Os links de retorno existentes podem apontar para `../` para manter uma única entrada principal.

**Alternativa considerada:** duplicar as telas de login dentro da raiz. Foi descartado para evitar divergência entre os fluxos e duplicação de regras.

### Sessões não são inspecionadas na entrada

A tela não carregará os scripts dos logins nem lerá `localStorage`. Isso garante que a seleção seja neutra e que cada fluxo continue responsável por validar, criar e limpar sua própria sessão.

### Testes de contrato do documento

Adicionar teste Node.js para verificar os dois links, os textos das opções e os atributos básicos de acessibilidade. Os testes existentes dos logins continuam sendo executados.

## Risks / Trade-offs

- [Risco] Links relativos podem quebrar quando a aplicação for hospedada em um subdiretório diferente → usar caminhos relativos à raiz atual e validar os destinos nos testes.
- [Risco] Usuários podem esperar retorno à tela inicial após cancelar o login → atualizar os links de retorno dos dois fluxos para a nova entrada, sem alterar a lógica de sessão.

## Migration Plan

1. Criar a página inicial e seu teste.
2. Ajustar links de retorno dos logins para `../`.
3. Executar a suíte frontend e validar os caminhos em servidor HTTP local.
4. Rollback: remover a página inicial e restaurar os links anteriores; nenhuma alteração de backend ou dado é necessária.
