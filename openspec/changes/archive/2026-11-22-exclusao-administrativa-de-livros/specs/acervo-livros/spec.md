# Spec Delta

## ADDED Requirements

### Requirement: Exclusão lógica de exemplares é restrita ao Admin
O backend SHALL permitir que somente um operador autenticado com perfil `ADMIN` retire logicamente um exemplar disponível, exigindo justificativa não vazia após aparar espaços e com no máximo 500 caracteres. A operação SHALL manter o registro e o código do exemplar, registrar operador, justificativa e data/hora, e rejeitar novas exclusões do mesmo exemplar.

#### Scenario: Admin retira exemplar disponível
- **WHEN** um Admin solicita a exclusão de um exemplar disponível com justificativa válida
- **THEN** o exemplar deixa de aparecer nas consultas comuns do acervo e mantém seu registro, código e dados de auditoria

#### Scenario: Justificativa ausente ou inválida
- **WHEN** um Admin solicita a exclusão sem justificativa, com justificativa composta apenas por espaços ou acima de 500 caracteres
- **THEN** o backend rejeita a solicitação e não altera o exemplar

#### Scenario: Exemplar já retirado
- **WHEN** um Admin solicita novamente a exclusão de um exemplar já retirado
- **THEN** o backend informa que o exemplar não está disponível para exclusão e mantém os dados originais da retirada

#### Scenario: Exemplar emprestado
- **WHEN** um Admin solicita a exclusão de um exemplar com status `Emprestado`
- **THEN** o backend rejeita a solicitação e não altera o exemplar

#### Scenario: Multas pendentes do exemplar
- **WHEN** um Admin retira um exemplar que possui multas pendentes associadas a empréstimos anteriores
- **THEN** o backend altera essas multas para `Zerada`, registra operador, data/hora e justificativa da resolução, sem alterar multas `Paga` ou `Abonada`

#### Scenario: Funcionário ou requisição sem credencial
- **WHEN** um Funcionário ou uma requisição sem credencial válida solicita a exclusão
- **THEN** o backend rejeita a operação e não altera o exemplar

### Requirement: Exemplares retirados não são oferecidos para consulta ou empréstimo
O sistema SHALL excluir exemplares retirados dos resultados padrão do acervo e SHALL impedir que operações de empréstimo os aceitem, mesmo que seu status anterior fosse `Disponível`.

#### Scenario: Consulta padrão do acervo
- **WHEN** um operador consulta ou pesquisa o acervo
- **THEN** o sistema não retorna exemplares retirados

#### Scenario: Tentativa de emprestar exemplar retirado
- **WHEN** uma operação de empréstimo recebe o identificador de um exemplar retirado
- **THEN** o backend rejeita a operação sem criar empréstimo

### Requirement: Interface de exclusão de exemplares é exclusiva de Admin
A interface SHALL oferecer aos Admins um fluxo acessível para localizar exemplares disponíveis, informar justificativa e confirmar a retirada, sem substituir a autorização do backend.

#### Scenario: Admin confirma retirada
- **WHEN** um Admin localiza um exemplar disponível, informa justificativa válida e confirma a ação
- **THEN** a interface solicita confirmação, envia a operação e informa o resultado por mensagem textual

#### Scenario: Funcionário tenta acessar o fluxo
- **WHEN** um Funcionário acessa diretamente a opção ou endereço de exclusão
- **THEN** a interface bloqueia o fluxo administrativo e não envia uma operação de exclusão
