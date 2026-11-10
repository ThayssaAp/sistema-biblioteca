# Proposal

## Why

Atualmente a aplicação apresenta diretamente o login de operador, enquanto o acesso do leitor fica disponível por um link secundário. Uma tela inicial única torna explícita a separação entre os públicos e reduz o risco de cada tipo de usuário entrar no fluxo errado.

## What Changes

- Criar uma tela inicial pública da Biblioteca Comunitária com as opções “Sou leitor” e “Sou funcionário”.
- Encaminhar leitores para o Portal do Leitor e funcionários para o login de operadores, sem reutilizar campos, tokens ou sessões entre os fluxos.
- Manter os destinos atuais e suas regras de autenticação, alterando apenas a porta de entrada da aplicação.
- Garantir navegação por teclado, nomes acessíveis e indicação textual das duas opções.
- Cobrir a estrutura e os destinos da tela com testes automatizados do frontend.

## Capabilities

### New Capabilities

Nenhuma. A tela amplia a capacidade existente de navegação por perfis.

### Modified Capabilities

- `navegacao-perfis`: adicionar uma entrada pública que identifica o tipo de usuário e encaminha cada perfil ao fluxo de autenticação correspondente, mantendo as sessões separadas.

## Impact

- Frontend: nova tela inicial e possível atualização dos links de retorno em [`frontend/login/`](/Users/thayssaapolinario/Desktop/ImpactaADS/projetos/sistema-biblioteca/frontend/login/) e [`frontend/portal-leitor/`](/Users/thayssaapolinario/Desktop/ImpactaADS/projetos/sistema-biblioteca/frontend/portal-leitor/).
- Backend/Xano: nenhuma API ou permissão nova; os endpoints existentes continuam responsáveis pela autenticação.
- Testes: novo contrato de HTML/JavaScript para os dois caminhos e preservação dos testes dos logins existentes.
