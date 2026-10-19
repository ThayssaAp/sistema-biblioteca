# Domain Model — Biblioteca Comunitária

## 1. Visão Geral das Entidades

### Operador (Funcionário / Admin)
Representa os usuários que autenticam e operam o balcão.
- **Atributos:** Matrícula funcional (ID de acesso), Nome, CPF, Endereço, Telefone, Senha (criptografada) e Perfil (`FUNCIONARIO` ou `ADMIN`).

### Leitor
Representa a pessoa atendida no balcão que toma livros emprestados.
- **Atributos:** CPF (Identificador Único), Nome, Data de Nascimento (obrigatória para validação de faixa etária), Endereço, Telefone, E-mail (opcional).
- **Regras:**
  - Limite máximo de 2 livros emprestados simultaneamente.
  - Bloqueado para novos empréstimos se possuir livros atrasados ou multas pendentes.

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
  - Vencimento: 5 dias úteis às 18h.
  - Status: `Ativo`, `Devolvido`.
  - Operador Responsável.

### Multa
Registrada automaticamente quando ocorre devolução com atraso.
- **Atributos:**
  - Valor: R$ 10,00 por dia útil iniciado após a data/hora de vencimento.
  - Status: `Pendente`, `Paga`, `Abonada` (pelo Admin) ou `Zerada` (por exclusão do livro).