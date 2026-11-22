# Manual de Uso — Biblioteca Comunitária

## 1. Apresentação

**Nome do aplicativo:** Biblioteca Comunitária.

A Biblioteca Comunitária é uma aplicação web para gestão do acervo e do atendimento de uma biblioteca comunitária abastecida por doações. Ela centraliza o cadastro e a consulta de exemplares e leitores, o registro de empréstimos e devoluções no balcão, o controle de multas e a apresentação de indicadores administrativos.

O aplicativo resolve a necessidade de registrar e acompanhar movimentações do acervo, identificar exemplares disponíveis, controlar prazos de empréstimos e permitir que os leitores consultem suas informações de forma independente. O sistema atende:

- **Leitores de bibliotecas comunitárias**, que consultam o catálogo e acompanham seus empréstimos e multas;
- **Funcionários de balcão**, responsáveis pelo atendimento diário, cadastro e movimentações do acervo; e
- **Administradores de bibliotecas comunitárias**, responsáveis pelas permissões administrativas, configurações do acervo e acompanhamento dos indicadores.

## 2. Acesso ao aplicativo

### Execução local

Na pasta raiz do repositório, execute:

```bash
python3 -m http.server 8765 --directory frontend
```

Em seguida, abra:

[http://localhost:8765/index.html](http://localhost:8765/index.html)

A tela inicial oferece duas entradas:

- **Sou leitor:** abre o Portal do Leitor em `/portal-leitor/`.
- **Sou funcionário:** abre o login de funcionários e administradores em `/login/`.

### Estrutura de URLs

| Área | Caminho local |
|---|---|
| Seleção de acesso | `/index.html` |
| Login de Funcionário/Admin | `/login/index.html` |
| Menu do Sistema Balcão | `/menu/index.html` |
| Catálogo, cadastro e exclusão de livros | `/catalog/index.html` |
| Cadastro e consulta de leitores | `/leitores/cadastro.html` e `/leitores/consulta.html` |
| Empréstimos e multas | `/emprestimos/index.html?view=loans` e `/emprestimos/index.html?view=fines` |
| Gestão de funcionários | `/funcionarios/index.html` |
| Dashboard administrativo | `/dashboard/index.html` |
| Login do Portal do Leitor | `/portal-leitor/index.html` |
| Início do Portal do Leitor | `/portal-leitor/home.html` |
| Consulta de livros do leitor | `/portal-leitor/catalog.html` |
| Empréstimos do leitor | `/portal-leitor/meus-emprestimos.html` |
| Troca de senha inicial | `/portal-leitor/change-password.html` |

### Configuração das APIs Xano

A aplicação utiliza o Xano publicado em `https://x8ki-letl-twmt.n7.xano.io`.

A configuração dos operadores está em `frontend/login/config.js`:

- `apiBaseUrl`: `api:36IocL78` — autenticação e operações gerais dos operadores;
- `catalogApiBaseUrl`: `api:YkzkPhKI` — acervo, livros e gêneros;
- `operationsApiBaseUrl`: `api:cRqDiSEi` — empréstimos, devoluções e renovações; e
- `finesApiBaseUrl`: `api:cFQmxLRt` — consulta e pagamento de multas.

O Portal do Leitor usa `frontend/portal-leitor/config.js` e a API `api:leitores`.

Não é necessário alterar as configurações para uso local com o backend publicado, desde que as APIs continuem disponíveis e os identificadores não sejam modificados.

## 3. Perfis de usuários

### Leitor

O Leitor utiliza o Portal do Leitor com CPF e senha própria. Depois do cadastro realizado no balcão, troca obrigatoriamente a senha temporária no primeiro acesso.

O Leitor pode:

- consultar o catálogo e seus filtros;
- visualizar livros disponíveis, gêneros e classificações etárias; e
- visualizar seus próprios empréstimos, vencimentos, situação de atraso e multas.

O Portal é somente leitura. O Leitor não cria empréstimos, devolve exemplares, paga multas ou renova empréstimos.

### Funcionário (`FUNCIONARIO`)

O Funcionário realiza o atendimento diário no Sistema Balcão. Pode:

- consultar o acervo e cadastrar livros;
- cadastrar e consultar leitores;
- criar empréstimos selecionando leitor e exemplar disponível;
- consultar, devolver e renovar empréstimos;
- consultar multas e registrar pagamentos no balcão.

O Funcionário não acessa o dashboard, não administra funcionários nem executa exclusões de livros ou gerenciamento de gêneros.

### Administrador (`ADMIN`)

O Administrador possui integralmente as permissões do Funcionário e, além delas, pode:

- adicionar, editar e excluir gêneros;
- excluir logicamente livros disponíveis;
- cadastrar, consultar, alterar o perfil e desativar funcionários;
- consultar o dashboard administrativo.

Todas as operações administrativas devem ser validadas pelo backend. O cadastro inicial do primeiro Administrador é realizado diretamente no backend Xano.

## 4. Funcionalidades

### Sistema Balcão

- Autenticação de Funcionários e Administradores por matrícula e senha.
- Consulta do acervo por código, título, gênero e status.
- Cadastro de livros com título, ISBN opcional, ano opcional, gênero e faixa etária.
- Cadastro e consulta de leitores por CPF ou nome.
- Criação de empréstimos com seleção explícita de leitor e exemplar disponível.
- Geração automática de código `#EMP000000`.
- Consulta de empréstimos por código, leitor, exemplar e status.
- Devolução de empréstimos ativos e liberação do exemplar.
- Renovação única de empréstimo ativo, ainda dentro do prazo, por mais sete dias corridos.
- Bloqueio de operações por limite de dois empréstimos ativos, atraso, multa pendente ou faixa etária incompatível.
- Consulta de multas por leitor, empréstimo e status.
- Registro do pagamento de multa pendente por Funcionário ou Administrador.

### Portal do Leitor

- Login por CPF e senha.
- Fluxo obrigatório de troca da senha temporária no primeiro acesso.
- Consulta de livros disponíveis com filtros por título, gênero, status e faixa etária.
- Consulta dos próprios empréstimos ativos e encerrados.
- Visualização de datas de retirada e vencimento, devolução, atraso e situação da multa.
- Separação completa entre tokens de leitor e operadores.

### Área Administrativa

- Gestão de gêneros:
  - adicionar gênero;
  - editar o nome;
  - excluir gênero não associado a exemplares.
- Exclusão lógica de livros disponíveis, com justificativa obrigatória e auditoria.
- Gestão de funcionários:
  - cadastrar Funcionário ou Administrador;
  - pesquisar operadores;
  - alterar perfil;
  - desativar operador sem excluir seu histórico.
- Dashboard com os indicadores:
  - total de leitores;
  - leitores com empréstimos ativos;
  - livros disponíveis;
  - livros emprestados;
  - empréstimos em atraso; e
  - multas pendentes.

## 5. Manual de utilização

### Entrada inicial

1. Acesse `http://localhost:8765/index.html`.
2. Escolha “Sou leitor” para entrar no Portal ou “Sou funcionário” para entrar no Sistema Balcão.
3. O sistema preserva a sessão correspondente sem compartilhar credenciais entre os perfis.

### Jornada do Funcionário

#### 1. Entrar no Sistema Balcão

1. Selecione “Sou funcionário” na tela inicial.
2. Informe a matrícula e a senha cadastradas.
3. Confirme o acesso.

#### 2. Cadastrar um livro

1. No menu, escolha **Cadastrar livro**.
2. Informe título e gênero.
3. Selecione uma faixa etária.
4. Informe ISBN e ano apenas quando válidos e disponíveis.
5. Confirme o cadastro.

#### 3. Consultar o acervo

1. Escolha **Consultar livros** no menu.
2. Pesquise por código, título, gênero ou status.
3. Analise o resultado na tabela.

**Resultado esperado:** a consulta lista apenas os exemplares correspondentes aos filtros e mostra a situação atual.

#### 4. Cadastrar um leitor

1. Escolha **Cadastrar leitor** no menu.
2. Informe CPF válido, nome, data de nascimento, endereço e telefone.
3. Informe e-mail quando desejado.
4. Defina a senha temporária exigida pelo cadastro.
5. Confirme a operação.

#### 5. Consultar leitores

1. Escolha **Consultar leitores**.
2. Informe CPF ou parte do nome.
3. Confirme a busca.

**Resultado esperado:** a consulta retorna os leitores correspondentes, com dados cadastrais necessários ao atendimento.

#### 6. Registrar um empréstimo

1. Escolha **Empréstimos** no menu.
2. Na aba de criação, selecione o leitor pelo rótulo `Nome — CPF`.
3. Selecione o exemplar disponível pelo rótulo `#ADS0000 — título`.
4. Confirme o empréstimo.

**Resultado esperado:** o sistema gera um código `#EMP000000`, define o vencimento em sete dias corridos e altera o exemplar para `Emprestado`.

#### 7. Devolver ou renovar no balcão

1. Abra **Empréstimos** e localize o empréstimo pela tabela.
2. Selecione **Devolver** para encerrá-lo e liberar o exemplar.
3. Selecione **Renovar** somente quando o empréstimo estiver ativo, dentro do prazo e sem multa pendente em outro empréstimo.

**Resultado esperado:** a devolução encerra o empréstimo e pode gerar multa; a renovação estende o vencimento uma única vez por mais sete dias corridos.

#### 8. Consultar e receber multas

1. Escolha **Multas** no menu.
2. Filtre por leitor, empréstimo ou status.
3. Identifique uma multa `Pendente`.
4. Selecione **Registrar pagamento** e confirme.

**Resultado esperado:** a multa passa para `Paga`, com operador e data/hora registrados.

### Jornada do Administrador

#### 1. Gerenciar gêneros

1. Entre no menu com perfil `ADMIN`.
2. Escolha **Gêneros**.
3. Adicione um gênero válido, edite seu nome ou exclua apenas um gênero sem exemplares associados.

**Resultado esperado:** nomes são normalizados e duplicidades ou gêneros em uso são rejeitados.

#### 2. Excluir logicamente um livro

1. Abra **Exclusão de livro** na Área Administrativa.
2. Localize o exemplar disponível.
3. Informe uma justificativa válida.
4. Confirme a exclusão.

**Resultado esperado:** o livro permanece registrado para auditoria, mas deixa de aparecer nas consultas comuns e não pode ser emprestado. Multas pendentes associadas a empréstimos anteriores podem ser zeradas conforme a regra backend.

#### 3. Gerenciar funcionários

1. Escolha **Funcionários**.
2. Pesquise operadores ou cadastre um novo.
3. Informe matrícula, nome, CPF, endereço, telefone, senha inicial e perfil.
4. Altere o perfil ou desative uma conta conforme necessário.

**Resultado esperado:** somente o Administrador executa essas operações; contas desativadas não podem autenticar.

#### 4. Consultar o dashboard

1. Escolha **Dashboard** no menu administrativo.
2. Consulte os cartões de indicadores.

**Resultado esperado:** o dashboard apresenta somente contagens agregadas para leitores, acervo, atrasos e multas.

### Jornada do Leitor

#### 1. Primeiro acesso e troca de senha

1. Na tela inicial, escolha “Sou leitor”.
2. Informe CPF e senha temporária recebida no cadastro.
3. Quando solicitado, informe uma nova senha própria e sua confirmação.

**Resultado esperado:** a senha temporária é substituída por hash, o primeiro acesso é concluído e a sessão do Portal é liberada.

#### 2. Consultar livros

1. Na página inicial do Portal, escolha **Consultar livros**.
2. Filtre por título, gênero, status ou faixa etária.
3. Analise os resultados.

**Resultado esperado:** a consulta apresenta somente dados públicos e não permite alterações no catálogo.

#### 3. Consultar empréstimos e multas

1. Na página inicial, escolha **Meus empréstimos**.
2. Consulte retirada, vencimento, devolução e situação de atraso.
3. Verifique as informações da multa vinculada, quando existir.

**Resultado esperado:** o leitor visualiza apenas seus próprios registros. Renovações, devoluções e pagamentos não são oferecidos no Portal.

## 6. Exemplos de utilização

### Dados de demonstração

Exemplo fictício para treinamento:

- Leitor: João da Silva;
- CPF: `529.982.247-25`;
- Senha temporária: `Temp1234`;
- Livro: `O Pequeno Príncipe`;
- Gênero: `Literatura infantojuvenil`;
- Faixa etária: `Livre`;
- ISBN: `9788522001121`;
- Ano: `1943`;
- Funcionário: Maria Silva;
- Matrícula: `F001`.

Não use dados reais em ambientes de demonstração.

### Fluxo completo de cadastro

1. Maria faz login como Funcionária.
2. Cadastra `O Pequeno Príncipe` e confirma que ele aparece como disponível.
3. Cadastra João com CPF `52998224725` e senha temporária `Temp1234`.
4. João entra no Portal com o CPF mascarado ou apenas os 11 dígitos, realiza a troca de senha e acessa o catálogo.

**Resultado esperado:** o livro e o leitor ficam disponíveis para o atendimento de balcão.

### Registro de empréstimo

1. Maria abre **Empréstimos**.
2. Pesquisa João pelo nome ou CPF.
3. Seleciona João no campo de leitor.
4. Pesquisa `O Pequeno Príncipe` e seleciona o exemplar disponível.
5. Confirma o empréstimo.

**Resultado esperado:** um código como `#EMP000001` é exibido e o exemplar passa a estar emprestado.

### Devolução atrasada e pagamento da multa

Considere que o empréstimo venceu há três dias corridos:

1. Maria devolve o empréstimo no balcão.
2. O sistema encerra o empréstimo e libera o exemplar.
3. Uma multa de R$ 30,00 é gerada como `Pendente`.
4. Maria abre **Multas**, localiza a cobrança e registra o pagamento.

**Resultado esperado:** o status fica `Paga`, o valor permanece R$ 30,00 e a operação registra o operador e o momento da quitação.

### Renovação no balcão

1. Maria localiza um empréstimo ativo que ainda não venceu e ainda não foi renovado.
2. Confirma que o leitor não possui multa pendente em outro empréstimo.
3. Seleciona **Renovar**.

**Resultado esperado:** `renewal_count` passa de 0 para 1 e o vencimento avança por sete dias corridos.

### Consulta no Portal do Leitor

1. João faz login no Portal após trocar a senha.
2. Consulta os livros disponíveis.
3. Abre **Meus empréstimos**.

**Resultado esperado:** João visualiza o título, código do empréstimo, retirada, vencimento, situação de atraso e eventual multa, sem receber ações de renovação ou pagamento.

## 7. Limitações conhecidas

- A interface atual é uma aplicação web estática em HTML, CSS e JavaScript puro, conectada ao backend Xano. Não há deploy público configurado neste repositório.
- É necessário executar o servidor HTTP local para servir os arquivos; não basta abrir o HTML diretamente por `file://` em alguns navegadores.
- O Portal do Leitor permite consulta somente leitura. Ele não cria empréstimos, devoluções ou pagamentos de multas.
- As renovações de empréstimo são realizadas exclusivamente pelos operadores no Sistema Balcão.
- O prazo atual dos empréstimos é de sete dias corridos. Multas são calculadas em R$ 10,00 por dia corrido iniciado de atraso.
- O cadastro inicial do primeiro Administrador deve ser realizado diretamente no backend Xano; não existe jornada pública de auto-cadastro administrativo.
- Sessões dependem do armazenamento local do navegador e podem ser encerradas por expiração do token ou limpeza dos dados da página.
- Operações devem ser realizadas com o backend Xano publicado disponível. Falhas de rede podem impedir cadastro, consulta ou alteração de registros.
