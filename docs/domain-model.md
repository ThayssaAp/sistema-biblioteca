# Modelo de Domínio — Biblioteca Comunitária

## 1. Operador
Representa Funcionário ou Admin autenticado no Sistema Balcão.

- Matrícula funcional única, nome, CPF, endereço, telefone, senha com hash e perfil `FUNCIONARIO` ou `ADMIN`.
- Funcionários consultam o acervo e cadastram livros e leitores, criam, consultam, renovam e devolvem empréstimos e consultam ou recebem pagamentos de multas.
- Admin possui todas as operações do Funcionário e pode gerenciar gêneros, retirar logicamente livros, administrar funcionários e consultar o dashboard.
- O backend valida o perfil em todas as operações administrativas.

## 2. Leitor
Representa o membro com acesso próprio ao Portal do Leitor.

- CPF único com 11 dígitos, nome, data de nascimento, endereço, telefone, e-mail opcional e senha com hash.
- O cadastro no balcão define uma senha temporária. No primeiro acesso, o leitor deve autenticá-la e substituí-la por uma senha própria.
- O login é realizado por CPF e senha; a sessão do leitor é separada da sessão dos operadores.
- O limite operacional é de até dois empréstimos ativos.
- Um novo empréstimo é bloqueado por empréstimo atrasado ou multa pendente.
- O portal permite consultar o acervo disponível e os próprios empréstimos, vencimentos, devoluções e multas.

## 3. Exemplar
Representa uma cópia física de uma obra.

- Código `#ADS0000`, gerado automaticamente e não reutilizado.
- Título obrigatório, ISBN opcional válido, ano opcional, gênero obrigatório, faixa etária obrigatória e status `Disponível`, `Emprestado` ou estado de retirada lógica.
- O status comum é `Disponível` ou `Emprestado`.
- Faixas aceitas: `Livre`, `10+`, `12+`, `14+`, `16+`, `18+` e `Não informada`; `Não informada` é tratada como `18+`.
- Apenas Admin pode retirar logicamente um exemplar disponível com justificativa, preservando o registro e a auditoria.
- Exemplares retirados deixam de aparecer nas consultas comuns e não podem ser emprestados.

## 4. Empréstimo
Representa a relação entre leitor, exemplar e operador.

- Código `#EMP000000`, único e sequencial.
- Datas de retirada, vencimento, devolução e renovação em timestamps.
- Status `Ativo` ou `Devolvido`.
- Operador responsável pela abertura, devolução ou renovação.
- Vencimento em sete dias corridos após a retirada ou renovação.
- Pode haver apenas uma renovação por empréstimo, realizada no balcão em empréstimo ativo e dentro do prazo.
- Renovação é bloqueada por multa pendente em outro empréstimo.
- Devolução encerra o empréstimo, registra operador e libera o exemplar.

## 5. Multa
Representa o valor decorrente da devolução atrasada de um empréstimo.

- R$ 10,00 por dia corrido iniciado de atraso, persistido em centavos (`1000` por dia).
- O próprio dia do vencimento não gera atraso e o prazo é considerado pelos timestamps em milissegundos.
- Status `Pendente`, `Paga`, `Abonada` ou `Zerada`.
- A devolução atrasada gera ou atualiza uma única multa vinculada ao empréstimo e ao leitor.
- Funcionário ou Admin pode registrar pagamento de multa `Pendente`, preservando o valor e registrando operador e data/hora.
- Multas `Paga`, `Abonada` ou `Zerada` não podem ser pagas novamente.
- Quando um Admin retira logicamente um exemplar com multas pendentes de empréstimos anteriores, o backend altera essas multas para `Zerada` sem alterar multas já pagas ou abonadas.

## 6. Gênero
Representa a classificação utilizada pelos exemplares.

- Nome obrigatório, aparado, com máximo de 80 caracteres e único sem distinção de caixa.
- Operadores autenticados podem consultar gêneros.
- Somente Admin pode criar, editar e excluir gêneros.
- Um gênero associado a exemplares não pode ser excluído.

## 7. Dashboard Administrativo
Disponível somente ao perfil `ADMIN`.

- Total de leitores cadastrados.
- Quantidade de leitores com empréstimos ativos.
- Quantidade de livros disponíveis e emprestados.
- Quantidade de empréstimos em atraso.
- Quantidade de multas pendentes.