# Tasks

## 1. Consolidar backend em xano

- [x] 1.1 Inventariar arquivos exclusivos e divergentes em `api/`, `addon/`, `ai/`, `function/`, `table/` e `workspace/`, verificando quais precisam ser preservados em `xano/`.
- [x] 1.2 Mesclar os artefatos backend necessários em `xano/` e atualizar referências de caminho, verificando que nenhum endpoint, função, tabela, addon, artefato de IA ou workspace necessário foi perdido.
- [x] 1.3 Remover os diretórios backend duplicados da raiz somente após a mesclagem e verificar que a árvore raiz contém apenas `.gemini/`, `.github/`, `.vscode/`, `docs/`, `frontend/`, `openspec/`, `xano/`, `AGENTS.md` e `README.md`.

## 2. Alinhar cálculos Xano

- [x] 2.1 Corrigir a função consolidada de multa em `xano/function/` para multiplicar dias por `1000` centavos e verificar o resultado para zero, um e três dias.
- [x] 2.2 Corrigir o endpoint consolidado de devolução em `xano/api/` para usar `86400000` milissegundos por dia e verificar que o atraso não é inflado por conversão de unidade.
- [x] 2.3 Adicionar ou ajustar testes direcionados para zero, um e três dias de atraso e verificar os valores `0`, `1000` e `3000` centavos.

## 3. Alinhar regras e documentação

- [x] 3.1 Atualizar `openspec/config.yaml` para declarar 7 dias corridos e multa de R$ 10,00 por dia corrido, verificando que não reste a regra conflitante de 5 dias úteis.
- [x] 3.2 Atualizar `docs/emprestimos-multas.md` e demais referências para apontar o backend em `xano/`, documentar as unidades e confirmar que os exemplos correspondem ao contrato implementado.

## 4. Corrigir testes da interface

- [x] 4.1 Ajustar os testes de cadastro e consulta de leitores para fornecer apenas os recursos de DOM necessários ao módulo e verificar os dois testes que atualmente falham.
- [x] 4.2 Executar os testes direcionados de empréstimos, multas e leitores e verificar que todos passam sem alterar os contratos de autenticação ou armazenamento.

## 5. Verificação integrada

- [x] 5.1 Executar todos os testes JavaScript e `git diff --check`, verificando zero falhas e nenhum erro de whitespace.
- [x] 5.2 Validar os artefatos Xano em `xano/` e verificar que não restem referências funcionais aos diretórios backend removidos da raiz.

## Workflow follow-up

- Arquivar a change somente após revisão, validação estrita dos artefatos e sincronização dos specs consolidados.
