# Modelo de Domínio — Biblioteca Comunitária

## 1. Visão Geral das Entidades

### Operador (Funcionário / Admin)
Representa os usuários internos que autenticam e operam o sistema no atendimento de balcão e, no caso do Admin, no dashboard exclusivo.
- **Atributos:** Matrícula funcional (ID de acesso), Nome, CPF, Endereço, Telefone, Senha (criptografada) e Perfil (`FUNCIONARIO` ou `ADMIN`).

### Leitor
Representa o membro da comunidade atendido pela biblioteca.
- **Atributos:** CPF (Identificador Único), Nome, Data de Nascimento (obrigatória para validação de faixa etária), Endereço, Telefone, E-mail (opcional), Senha (criptografada para acesso ao Portal).
- **Regras:**
  - A conta do Leitor é separada das contas de Funcionário/Admin.
  - No cadastro, Funcionário/Admin define uma senha inicial genérica, igual para todos os leitores. A troca de senha é obrigatória no primeiro acesso ao Portal do Leitor. Essa é uma simplificação para o trabalho acadêmico; a senha deve ser armazenada com hash, nunca em texto puro.
  - Limite máximo de 2 livros emprestados simultaneamente.
  - Bloqueado para novos empréstimos se possuir livros atrasados ou multas pendentes.
  - Acessa o Portal do Leitor via CPF e senha; pode consultar livros disponíveis e visualizar os próprios empréstimos ativos, vencimentos e histórico.

### Exemplar (Livro)
Representa a cópia física de uma obra doada.
- **Atributos:**
  - ID do Livro: formato `#ADS0000` (gerado automaticamente, fixo, 4 dígitos, nunca reusado).
  - Nome (Obrigatório).
  - ISBN (10 a 13 caracteres, sem hífens, permissão de letras, validação de tamanho).
  - Ano da Obra Original (Opcional, 4 dígitos <= ano atual).
  - Gênero (Obrigatório, seleção em lista cadastrada).
  - Faixa Etária (Obrigatória: `Livre`, `10+`, `12+`, `14+`, `16+`, `18+`, `Não informada` -> tratada como `18+`).
  - Status: `Disponível` ou `Emprestado`.

### Empréstimo
Representa o vínculo temporário entre um Exemplar e um Leitor.
- **Atributos:**
  - Código do Empréstimo: formato `#EMP000000` (gerado automaticamente, 6 dígitos, sequencial).
  - Data e Hora do Empréstimo (Automáticas no fuso de Brasília).
  - Vencimento: 7 dias corridos após a data do empréstimo ou da renovação. por exemplo, um livro retirado na quarta deve ser devolvido até 23h59 da quarta-feira seguinte, a multa começa na quinta-feira.
  - Quantidade de Renovações: Número inteiro (padrão 0, máximo 1).
  - Status: `Ativo`, `Devolvido`.
  - Operador Responsável (Operador que abriu o empréstimo no balcão).
- **Regras de Renovação:**
  - Máximo de 1 renovação permitida por empréstimo.
  - Pode ser solicitada pelo Portal do Leitor ou pelo sistema do Funcionário.
  - Elegível apenas se o status for `Ativo` e dentro do prazo limite (sem atraso).
  - O leitor não pode renovar um empréstimo se tiver multa em outro livro.
  - Adiciona mais 7 dias corridos ao prazo a partir da renovação.

### Multa
Registrada automaticamente quando ocorre devolução com atraso.
- **Atributos:**
  - Valor: R$ 10,00 por dia corrido iniciado de atraso, começando no dia seguinte ao vencimento.
  - Status: `Pendente`, `Paga`, `Abonada` (pelo Admin) ou `Zerada` (por exclusão do livro).

---

## 2. Dashboard do Admin

Consultas agregadas no Xano para consumo exclusivo do perfil `ADMIN`. O dashboard deve ser simples e apresentar:

- Total de leitores cadastrados.
- Quantidade de leitores com livros emprestados.
- Quantidade de livros disponíveis e quantidade de livros emprestados.
- Quantidade de empréstimos em atraso e quantidade de multas pendentes.