# Design

## Context

O projeto mantém arquivos Xano duplicados em diretórios da raiz (`api/`, `addon/`, `ai/`, `function/`, `table/` e `workspace/`) e em `xano/`. As cópias não são idênticas: `xano/` já contém artefatos adicionais de leitores, multas, empréstimos e testes, enquanto a raiz possui alguns arquivos exclusivos e versões divergentes. A suíte Node também contém testes de leitores que assumem um ambiente DOM sem inicializá-lo.

## Goals / Non-Goals

**Goals:**

- Fazer `xano/` ser a única fonte versionada de artefatos Xano, preservando arquivos exclusivos necessários durante a mesclagem.
- Fazer a superfície Xano consolidada expressar exatamente o mesmo cálculo de atraso e multa.
- Tornar os testes existentes reproduzíveis no runner atual, sem alterar o comportamento funcional das telas.
- Atualizar a configuração e a documentação para uma regra única de 7 dias corridos e R$ 10,00 por dia corrido.

**Non-Goals:**

- Implementar pagamento ou abono administrativo de multas.
- Alterar o prazo funcional, o modelo de status ou os endpoints públicos além da correção de consistência.
- Adicionar dependências de navegador ou trocar o runner de testes.

## Decisions

### Fonte única de backend

`xano/` será o destino canônico para todos os diretórios backend atualmente presentes na raiz. A consolidação deverá identificar arquivos exclusivos e diferenças antes de qualquer remoção; arquivos raiz que não existirem em `xano/` serão incorporados somente quando representarem comportamento necessário ou mais completo. Depois da validação, os diretórios raiz backend serão removidos, deixando apenas `xano/`.

A alternativa de manter duas árvores sincronizadas foi descartada porque já produziu divergências e permite que uma publicação futura use a versão errada. A alternativa de apagar diretamente as cópias raiz foi descartada porque perderia endpoints e arquivos que só existem ali.

### Correção no destino consolidado

As correções funcionais serão feitas somente nos arquivos consolidados em `xano/`: o valor será calculado como `overdue_days * 1000` centavos e a diferença temporal será dividida por `86400000`, pois os timestamps usados pelo Xano são milissegundos. A alternativa de continuar corrigindo duas árvores foi descartada por manter a causa da divergência.

### Testes sem DOM implícito

Os testes de leitores serão ajustados para fornecer apenas os recursos de DOM necessários ao módulo ou para exercitar apenas a API testável quando a unidade não exigir DOM. Não será criado um `document` global artificial para mascarar dependências, pois isso poderia ocultar regressões de integração.

### Regra documentada

`openspec/config.yaml` e a documentação técnica serão alinhados à regra vigente nos specs consolidados: empréstimo de 7 dias corridos e multa de R$ 10,00 por dia corrido iniciado. A regra de 5 dias úteis será removida para não orientar mudanças futuras incorretas.

## Risks / Trade-offs

- [Risco] Arquivos exclusivos da raiz podem ser removidos durante a consolidação. -> Mitigação: inventariar e comparar cada arquivo antes da remoção; preservar no `xano/` qualquer artefato necessário.
- [Risco] A cópia atualmente publicada no Xano pode não corresponder ao arquivo local corrigido. -> Mitigação: validar sintaxe e tratar a publicação de `xano/` como etapa explícita de verificação.
- [Risco] Testes de leitores podem depender de detalhes de ambiente não visíveis no runner Node. -> Mitigação: executar os testes direcionados e a suíte completa após o ajuste, sem aceitar sucesso parcial.
- [Risco] Dados históricos gerados com R$ 1,00/dia podem estar incorretos. -> Mitigação: não alterar registros existentes automaticamente nesta change; documentar a correção de cálculo para novas devoluções.
