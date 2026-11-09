# generos Specification

## Purpose

Permitir que a biblioteca mantenha uma lista consistente de gêneros para classificar exemplares e apoiar o atendimento de balcão, com alterações administrativas e consulta por operadores autenticados.

## Requirements

### Requirement: Operadores autenticados podem consultar gêneros
O sistema SHALL permitir que operadores autenticados com perfil `FUNCIONARIO` ou `ADMIN` consultem a lista de gêneros disponíveis, ordenada pelo nome.

#### Scenario: Consulta autenticada da lista
- **WHEN** um operador autenticado consulta os gêneros
- **THEN** o sistema retorna os gêneros disponíveis ordenados pelo nome

#### Scenario: Consulta sem credencial válida
- **WHEN** uma requisição de consulta não apresenta credencial válida
- **THEN** o sistema rejeita o acesso e não retorna gêneros

### Requirement: Apenas Admin pode criar gêneros
O backend SHALL permitir que somente operadores autenticados com perfil `ADMIN` criem gêneros com nome obrigatório, aparado e de até 80 caracteres.

#### Scenario: Admin cria gênero válido
- **WHEN** um Admin envia um nome válido com espaços nas extremidades
- **THEN** o sistema remove os espaços externos e cria o gênero

#### Scenario: Nome ausente, vazio ou longo demais
- **WHEN** um Admin envia nome ausente, composto apenas por espaços ou com mais de 80 caracteres
- **THEN** o sistema rejeita a criação sem alterar a lista

#### Scenario: Funcionário tenta criar gênero
- **WHEN** um operador com perfil `FUNCIONARIO` tenta criar um gênero
- **THEN** o backend rejeita a operação sem alterar a lista

#### Scenario: Requisição de criação sem credencial válida
- **WHEN** uma requisição de criação não apresenta credencial válida
- **THEN** o backend rejeita a operação sem alterar a lista

### Requirement: Nomes de gêneros são únicos sem distinção de maiúsculas
O sistema SHALL impedir gêneros com nomes duplicados após remover espaços nas extremidades e desconsiderar diferenças entre letras maiúsculas e minúsculas.

#### Scenario: Criação com nome duplicado
- **WHEN** um Admin tenta criar um gênero cujo nome já existe, ignorando espaços externos e caixa
- **THEN** o sistema rejeita a operação e mantém um único gênero com esse nome

#### Scenario: Renomeação para nome de outro gênero
- **WHEN** um Admin renomeia um gênero para o nome de outro gênero existente, ignorando espaços externos e caixa
- **THEN** o sistema rejeita a operação e mantém os nomes existentes

### Requirement: Apenas Admin pode renomear gêneros
O backend SHALL permitir que somente operadores autenticados com perfil `ADMIN` renomeiem gêneros existentes, aplicando as mesmas validações de nome da criação.

#### Scenario: Admin renomeia gênero
- **WHEN** um Admin renomeia um gênero com um nome válido e não utilizado
- **THEN** o sistema atualiza o nome do gênero

#### Scenario: Gênero não encontrado
- **WHEN** um Admin tenta renomear um gênero inexistente
- **THEN** o sistema informa que o gênero não foi encontrado e não altera a lista

#### Scenario: Funcionário tenta renomear gênero
- **WHEN** um operador com perfil `FUNCIONARIO` tenta renomear um gênero
- **THEN** o backend rejeita a operação sem alterar a lista

#### Scenario: Requisição de renomeação sem credencial válida
- **WHEN** uma requisição de renomeação não apresenta credencial válida
- **THEN** o backend rejeita a operação sem alterar a lista

### Requirement: Apenas Admin pode remover gêneros não utilizados
O backend SHALL permitir que somente operadores autenticados com perfil `ADMIN` removam gêneros que não estejam associados a exemplares.

#### Scenario: Admin remove gênero sem exemplares associados
- **WHEN** um Admin remove um gênero que não está associado a nenhum exemplar
- **THEN** o sistema remove o gênero da lista

#### Scenario: Remoção de gênero associado a exemplares
- **WHEN** um Admin tenta remover um gênero associado a um ou mais exemplares
- **THEN** o sistema rejeita a operação e mantém o gênero e os exemplares

#### Scenario: Gênero não encontrado para remoção
- **WHEN** um Admin tenta remover um gênero inexistente
- **THEN** o sistema informa que o gênero não foi encontrado e não altera a lista

#### Scenario: Funcionário tenta remover gênero
- **WHEN** um operador com perfil `FUNCIONARIO` tenta remover um gênero
- **THEN** o backend rejeita a operação sem alterar a lista

#### Scenario: Requisição de remoção sem credencial válida
- **WHEN** uma requisição de remoção não apresenta credencial válida
- **THEN** o backend rejeita a operação sem alterar a lista

### Requirement: Interface de gestão de gêneros é acessível e restrita visualmente a Admin
A interface SHALL oferecer a Admin controles acessíveis para criar, renomear e remover gêneros e SHALL ocultar esses controles de Funcionários, sem substituir a autorização do backend.

#### Scenario: Admin gerencia gêneros pela interface
- **WHEN** um Admin abre a gestão de gêneros
- **THEN** a interface permite criar, editar e solicitar remoção, informando sucesso ou erro por mensagens textuais

#### Scenario: Confirmação antes de remover
- **WHEN** um Admin solicita a remoção de um gênero pela interface
- **THEN** a interface solicita confirmação antes de enviar a operação

#### Scenario: Funcionário não vê controles de gestão
- **WHEN** um Funcionário acessa o acervo
- **THEN** a interface não apresenta controles de criação, renomeação ou remoção de gêneros

#### Scenario: Erro ao remover gênero em uso
- **WHEN** a API rejeita a remoção porque o gênero está associado a exemplares
- **THEN** a interface informa textualmente que o gênero não pode ser removido enquanto estiver em uso
