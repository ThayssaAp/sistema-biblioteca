# Proposal

## Why

O backend está espalhado em diretórios duplicados na raiz (`api/`, `addon/`, `ai/`, `function/`, `table/` e `workspace/`) e em `xano/`, com arquivos divergentes entre as cópias. O fluxo de multas é um exemplo concreto: uma cópia calcula R$ 1,00 por dia e usa unidade de tempo incompatível, enquanto os contratos e testes exigem R$ 10,00 por dia; a configuração do OpenSpec também contradiz a regra adotada pelo domínio e a suíte completa não consegue executar dois testes de leitores por depender de um `document` inexistente no Node.

## What Changes

- Consolidar todo o backend exclusivamente sob `xano/`, mesclando previamente arquivos exclusivos ou mais atuais antes de remover as cópias backend da raiz.
- Atualizar referências, documentação e verificações para tratar `xano/` como a única fonte dos artefatos Xano.
- Garantir cálculo de R$ 10,00 por dia de atraso, armazenado em centavos, e cálculo consistente de dias a partir de timestamps em milissegundos.
- Atualizar a configuração do OpenSpec para refletir a regra vigente de 7 dias corridos e multa por dias corridos.
- Ajustar os testes de cadastro e consulta de leitores para executarem no ambiente de testes utilizado pelo projeto, sem depender de um `document` global ausente.
- Ampliar os testes de multa para cobrir a unidade monetária e as unidades de tempo nas duas superfícies relevantes.
- Atualizar a documentação técnica diretamente afetada pelas regras corrigidas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `multas`: corrigir o cálculo monetário e temporal da multa para cumprir os cenários existentes de R$ 10,00 por dia corrido.
- `emprestimos`: alinhar o cálculo de atraso e os contratos de vencimento durante a consolidação do backend em `xano/`.

## Impact

- Backend Xano: consolidação de APIs, funções, tabelas, addons, IA e workspace exclusivamente em `xano/`.
- Estrutura do repositório: remoção dos diretórios backend duplicados da raiz somente após mesclagem e validação.
- OpenSpec: regra de negócio em `openspec/config.yaml` e delta das capacidades de empréstimos e multas.
- Testes JavaScript: testes de leitores e testes direcionados de empréstimos/multas.
- Documentação: contrato técnico de empréstimos e multas, sem alteração de escopo funcional.
