# ProClinic Agenda - Sistema de Gestão para Clínicas Odontológicas

Este repositório contém o código-fonte do projeto **ProClinic Agenda**, desenvolvido pelo **Grupo 01** como parte dos requisitos para conclusão do treinamento técnico do **Programa Bolsa Futuro Digital**.

O programa é uma iniciativa do **SOFTEXPE** (Centro de Excelência em Tecnologia de Software de Pernambuco) , com recursos do Ministério da Ciência, Tecnologia e Inovação (MCTI) e coordenado pela Softex.

---

### Sobre o Projeto

O **ProClinic Agenda** foi idealizado para o cliente **Consultório Odontológico Crescer Ltda**
O objetivo principal é resolver a desorganização no agendamento e gestão de pacientes, oferecendo uma base inteligente que permite listar pacientes por especialidade, recorrência e faltas, otimizando o atendimento e a receita da clínica.

### Membros da Equipe (Grupo 01)

- 1 - Danilo Pedro da Silva Valério
- 2 - Winny Santos Alexandre Belo
- 3 - Emilly Oliveira Machado
- 4 - Gabriella Inocêncio Rodrigues de Almeida
- 5 - Guilherme Almeida Marques
- 6 - Luiz Vinicius Oliveira Fernandes
- 7 - Max da Silva Ribeiro

---

### 1. LEVANTAMENTO DE REQUISITOS

Abaixo estão listados os requisitos funcionais e não funcionais que descrevem o escopo detalhado do sistema.

#### 1.1. Requisitos Funcionais (RFs)

- **RF01 – Cadastro de Usuários**

  - **RF01.1 – Cadastro de Gerente:** O sistema deve permitir ao Gerente criar contas de usuários com perfil Gerente. Deve validar e-mail único e a conta deve ficar disponível imediatamente.
  - **RF01.2 – Cadastro de Recepcionista:** Permitir que o Gerente cadastre Recepcionistas no sistema, validando e-mail único.
  - **RF01.3 – Cadastro de Profissional:** Permitir o cadastro de profissionais com suas respectivas especialidades. O sistema deve exigir a seleção de especialidade e validar e-mail.
  - **RF01.4 – Cadastro de Paciente pela Recepção:** Permitir que a recepção cadastre novos pacientes de forma rápida, validando duplicidade de e-mail.
  - **RF01.5 – Auto Cadastro de Paciente:** Permitir que o paciente crie sua própria conta na interface pública, sendo definido automaticamente como “Cliente”.
  - **RF01.6 – Validação Global de E-mail:** Garantir que cada e-mail seja único para todos os perfis do sistema.

- **RF02 – Autenticação e Controle de Acesso**

  - **RF02.1 – Login de Usuários:** O sistema deve permitir que todos os usuários realizem login utilizando e-mail e senha. Apenas usuários ativos devem acessar.
  - **RF02.2 – Controle de Permissões por Perfil:** O sistema deve restringir funcionalidades com base no perfil do usuário.
  - **RF02.3 – Renovação de Sessão:** O sistema deve permitir que usuários mantenham sessão ativa por meio de renovação automática (refresh token).
  - **RF02.4 – Logout:** O sistema deve permitir que o usuário encerre sua sessão.

- **RF03 – Cadastro e Gerenciamento de Pacientes**

  - **RF03.1 – Cadastro Básico e Contato:** Registrar informações de identificação, contato e convênio do paciente, armazenando de forma segura.
  - **RF03.2 – Anamnese e Histórico Clínico:** Disponibilizar formulário para anamnese geral, registrar histórico, queixas e permitir assinatura do termo de consentimento.
  - **RF03.3 – Prontuário e Mídias:** Registrar sessões (procedimento, profissional e data) e permitir upload de arquivos como fotos e radiografias.
  - **RF03.4 – Preferências de Agendamento:** Registrar turno preferido e dias da semana de preferência do paciente para sugestão de horários.

- **RF04 – Gestão de Profissionais e Serviços**

  - **RF04.1 – Profissionais:** Registrar dados, associar especialidades (impedindo duplicidade) e definir permissões de acesso internas.
  - **RF04.2 – Horários e Disponibilidade:** Configurar expediente de trabalho e registrar bloqueios de agenda (férias, folgas).
  - **RF04.3 – Serviços:** Gerenciar catálogo de serviços, definindo duração estimada e vinculação com especialidades habilitadas.

- **RF05 – Agenda Digital**

  - **RF05.1 – Colunas de Atendimento:** Exibir colunas representando etapas (aguardando, em atendimento, finalizado) com atualização de status.
  - **RF05.2 – Visualização da Agenda:** Permitir visualização por profissional ou geral, com filtros funcionais.
  - **RF05.3 – Agendamento, Remarcação e Cancelamento:** Permitir criar, modificar e cancelar consultas, mantendo histórico.
  - **RF05.4 – Atualização de Status:** Atualizar status da consulta (agendado, falta, concluído).

- **RF06 – Lista de Espera**

  - **RF06.1 – Organização por Especialidade:** Organizar automaticamente pacientes em ordem cronológica conforme especialidade solicitada.
  - **RF06.2 – Inscrição na Lista:** Registrar paciente, data e especialidade imediatamente.
  - **RF06.3 – Chamada para Agendamento:** Permitir chamar paciente da lista para agendamento, removendo-o da lista.

- **RF07 – Gestão de Débitos**

  - **RF07.1 – Débitos do Paciente:** Exibir pendências financeiras e atualizar status quando quitados.

- **RF08 – Controle de Visibilidade de Serviços**

  - **RF08.1 – Configurar Serviços Visíveis:** Definir quais serviços ficam disponíveis no portal do paciente e quais são ocultos.

- **RF09 – Dashboard**

  - **RF09.1 – Painel Gerencial:** Exibir indicadores essenciais da clínica com dados atualizados.

- **RF10 – Ações de Marketing**

  - **RF10.1 – Registro de Ações:** Registrar contatos feitos com pacientes para fins de retorno com data e responsável.

- **RF11 – Busca Inteligente**

  - **RF11.1 – Busca Avançada:** Permitir busca com filtros por histórico, especialidade, faltas e recorrência em tempo real.

- **RF12 – Histórico de Alterações**

  - **RF12.1 – Histórico de Agendamentos:** Registrar mudanças em datas, horários e status identificando o usuário responsável.
  - **RF12.2 – Histórico Clínico:** Registrar alterações na anamnese e prontuários permitindo auditoria.

- **RF13 – Logs de Sistema**

  - **RF13.1 – Logs Administrativos:** Registrar ações de criação, edição e exclusão de entidades (data, hora, usuário).
  - **RF13.2 – Logs de Acesso:** Registrar tentativas de login (sucesso ou falha).

- **RF14 – Requisitos de Interface**
  - **RF14.1 a RF14.7:** Telas de Login, Cadastro Público, Cadastro Interno, Pacientes, Agenda, Lista de Espera, Dashboard e Serviços.

#### 1.2. Requisitos Não Funcionais (RNFs)

- **RNF01: Segurança** – Criptografia de senhas (bcrypt); autenticação (JWT); cookies HttpOnly para refresh token; HTTPS; headers de segurança (Helmet.js).
- **RNF02: Performance** – Resposta às requisições em até 2 segundos em condições normais.
- **RNF03: Disponibilidade** – Uptime mínimo de 95%.
- **RNF04: Escalabilidade** – Arquitetura modular (frontend e backend separados).
- **RNF05: Usabilidade** – Interface clara, intuitiva e responsiva (Mobile).
- **RNF06: Manutenibilidade** – Código organizado na arquitetura em camadas (Controller, Service, Repository, Utils).
- **RNF08: Portabilidade** – Compatível com navegadores modernos (Chrome, Firefox, Edge).
- **RNF09: Versionamento** – Uso do Git e GitHub com branches por feature.

---

### 2. MODELAGEM DE DADOS

O sistema utiliza um banco de dados relacional (PostgreSQL). Abaixo estão descritas as entidades principais e suas responsabilidades:

#### Atores e Pessoas

- **Usuario:** Apresenta dados dos indivíduos que acessam o sistema (clientes, profissionais, recepcionistas). Controla login e autenticação.
- **Paciente:** Armazena dados e informações dos pacientes atendidos, como contato e CPF.
- **Paciente_telefone:** Armazena um ou mais números de contato dos pacientes.
- **Profissional:** Reúne informações profissionais e cadastrais dos prestadores de serviço.
- **Profissional_telefone:** Armazena os vários possíveis números dos profissionais.
- **Profissional_especialidade:** Relacionamento que liga profissionais às especialidades que exercem.

#### Clínico e Operacional

- **Especialidade:** Representa as áreas médicas ou de atuação dentro da clínica.
- **Serviço:** Representa os procedimentos e consultas, descrevendo valor, duração e especialidade vinculada.
- **Agendamento:** Registra os agendamentos com data, hora, serviço e sala associada.
- **Agendamento_servico:** Tabela associativa para resolver o relacionamento N:M entre Agendamentos e Serviços.
- **Fila_espera:** Lista de pacientes aguardando atendimento, vinculada a especialidade ou profissional.
- **Inscricao_lista_espera:** Registra as solicitações de entrada na fila de espera.
- **Prontuarios:** Armazena informações clínicas, diagnósticos, anotações e evoluções.
- **Prontuarios_arquivos:** Armazena arquivos complementares (exames, imagens).
- **Tags (Paciente_tag):** Etiquetas para identificação visual de pacientes (ex: VIP, Devedor).

#### Infraestrutura e Disponibilidade

- **Estabelecimento:** Unidade física da clínica (única) com localização e contato.
- **Endereço:** Dados de localização de pacientes e estabelecimentos.
- **Sala:** Representa os espaços físicos da clínica para vincular agendamentos.
- **Sala_horario:** Armazena os horários de disponibilidade de cada sala.
- **Horario_trabalho:** Armazena os períodos de trabalho de cada profissional.

#### Financeiro

- **Movimentacoes:** Registros financeiros (receitas e despesas) vinculados aos atendimentos.
- **Paciente_debitos:** Valores pendentes que um paciente possui por serviços não pagos.

#### Sistema e Segurança

- **Configuração:** Parâmetros personalizados do sistema (limites, tempos, valores).
- **Log_Acesso:** Registra tentativas de acesso (horário, tipo, sucesso/falha, dispositivo).
- **Log_Acao:** Histórico de inserções, atualizações e exclusões para auditoria completa.

---

### Como Rodar o Projeto

Este repositório é o "Root" do projeto. Para rodar o sistema, acesse as pastas específicas:

- **Backend:** Siga as instruções no `README.md` dentro da pasta `back-end/` para configurar o servidor Node.js e o Prisma.
- **Frontend:** (Em desenvolvimento) Acesse a pasta `front-end/` para iniciar a interface React.
