// ============================================================
// FonoEdu PRO — app.js (arquivo único e completo)
// Dados + Autenticação + Seed + Navegação + Módulos
// ============================================================

// ===== 1. Camada de dados (localStorage) =====
const DB = {
  USERS: 'fonoedu_users',
  SESSION: 'fonoedu_session',
  PACIENTES: 'fonoedu_pacientes',
  PLANEJAMENTOS: 'fonoedu_planejamentos',
  EVOLUCOES: 'fonoedu_evolucoes',
  CONTROLE: 'fonoedu_controle',
  LISTAS: 'fonoedu_listas',
  CONFIG: 'fonoedu_config',
  RELATORIOS: 'fonoedu_relatorios_emitidos',
};

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== 2. Autenticação =====
const Auth = {
  init() {
    const users = read(DB.USERS);
    if (!users.some((u) => u.email === 'demo@fonoedu.com')) {
      users.push({
        id: uid(),
        nome: 'Fonoaudióloga Demo',
        email: 'demo@fonoedu.com',
        senha: 'fono123',
      });
      write(DB.USERS, users);
    }
  },

  register(nome, email, senha) {
    const users = read(DB.USERS);
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: 'Já existe uma conta com este e-mail.' };
    }
    const user = { id: uid(), nome, email, senha };
    users.push(user);
    write(DB.USERS, users);
    this.setSession(user);
    return { ok: true };
  },

  login(email, senha) {
    const users = read(DB.USERS);
    const user = users.find((u) => u.email === email && u.senha === senha);
    if (!user) return { ok: false, error: 'E-mail ou senha incorretos.' };
    this.setSession(user);
    return { ok: true };
  },

  setSession(user) {
    write(DB.SESSION, { userId: user.id, nome: user.nome, email: user.email });
  },

  current() {
    return read(DB.SESSION, null);
  },

  logout() {
    localStorage.removeItem(DB.SESSION);
  },
};

Auth.init();

// ===== 3. Seed de dados de exemplo =====
function seedData() {
  if (localStorage.getItem(DB.PACIENTES)) return;

  const anaId = uid();
  const miguelId = uid();

  write(DB.PACIENTES, [
    {
      id: anaId,
      codigo: 'P001',
      nome: 'Ana Clara Souza',
      dataNascimento: '2018-04-12',
      sexo: 'Feminino',
      transtorno: 'Transtorno do Desenvolvimento da Aprendizagem',
      cid: '6A03',
      escola: 'EMEF Paulo Freire',
      anoEscolar: '3º ano',
      responsavel: 'Maria Souza',
      telefone: '(43) 99999-0001',
      frequencia: '2x semana',
      dataAvaliacao: '2026-01-20',
      dataInicio: '2026-02-10',
      proximaReavaliacao: '2026-07-10',
      diaSemana: 'Terça',
      hora: '14:00',
      desligamento: '',
    },
    {
      id: miguelId,
      codigo: 'P002',
      nome: 'Miguel Oliveira',
      dataNascimento: '2017-09-03',
      sexo: 'Masculino',
      transtorno: 'Transtorno do Déficit de Atenção e Hiperatividade',
      cid: '6A05',
      escola: 'EMEF Paulo Freire',
      anoEscolar: '4º ano',
      responsavel: 'João Oliveira',
      telefone: '(43) 99999-0002',
      frequencia: '1x semana',
      dataAvaliacao: '2026-02-05',
      dataInicio: '2026-03-05',
      proximaReavaliacao: '2026-08-05',
      diaSemana: 'Quinta',
      hora: '10:00',
      desligamento: '',
    },
  ]);

  write(DB.PLANEJAMENTOS, [
    {
      id: uid(),
      pacienteId: anaId,
      transtorno: 'Transtorno do Desenvolvimento da Aprendizagem',
      objetivoGeral: 'Desenvolver consciência fonológica',
      objetivos: [
        'Segmentar palavras em sílabas',
        'Identificar rimas',
        'Reconhecer fonema inicial',
      ],
      area: 'Linguagem',
      frequencia: '2x semana',
      nivel: 'Moderada',
      status: 'Ativo',
      dataInicio: '2026-02-10',
      estrategias: {
        'Incentivo Verbal': 'Apresentou evolução',
        'Aprimorar Atenção Visual': 'Desenvolver consciência fonológica',
        'Cartões de Figuras': 'Figuras',
      },
    },
  ]);

  write(DB.EVOLUCOES, [
    {
      id: uid(),
      pacienteId: anaId,
      diagnostico: 'Transtorno do Desenvolvimento da Aprendizagem',
      data: '2026-08-20',
      sessao: 1,
      presenca: 'Presente',
      planejamentoId: null,
      objetivos: 'Segmentação silábica',
      estrategias: 'Cartões de figuras',
      resposta: 'Apresentou evolução',
      nivelAjuda: 'Apoio verbal',
      observacoes: 'Concluiu com apoio verbal.',
      evolucaoGerada:
        'Na sessão 1, Ana Clara Souza compareceu à sessão de 20/08/2026. Resposta: Apresentou evolução. Nível de ajuda: Apoio verbal.',
    },
  ]);

  write(DB.LISTAS, [
    {
      id: uid(),
      nome: 'Palavras com sílabas simples',
      nivel: 'Fácil',
      itens: ['BOLA', 'CASA', 'DADO', 'FACA', 'GATO'],
    },
  ]);

  if (!localStorage.getItem(DB.CONFIG)) {
    write(DB.CONFIG, { crfa: '' });
  }
}

seedData();

// ===== 4. Constantes e utilitários =====
const $ = (sel) => document.querySelector(sel);

function on(selector, event, handler) {
  const el = $(selector);
  if (el) el.addEventListener(event, handler);
}

const SECTIONS = {
  dashboard: 'Inicial',
  pacientes: 'Pacientes',
  planejamento: 'Planejamento Terapêutico',
  evolucoes: 'Evoluções',
  controle: 'Controle Evolutivo Mensal',
  listas: 'Listas',
  config: 'Configurações',
};

const TRANSTORNOS = [
  'Transtorno do Desenvolvimento da Fluência da Fala',
  'Transtorno do Desenvolvimento da Linguagem',
  'Transtorno do Espectro Autista',
  'Transtorno do Desenvolvimento da Aprendizagem',
  'Transtorno do Déficit de Atenção e Hiperatividade',
  'Transtorno de Oposição Desafiador',
  'Fenda Lábio-Alveolar',
];

const FREQUENCIAS = ['1x semana', '2x semana', '3x semana', 'Quinzenal', 'Mensal'];

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function calcularIdade(dataNasc) {
  if (!dataNasc) return '—';
  const hoje = new Date();
  const nasc = new Date(dataNasc + 'T00:00:00');
  if (isNaN(nasc.getTime())) return '—';
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const partes = String(dateStr).split('-');
  if (partes.length !== 3) return dateStr;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function dataHojeBR() {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(
    2,
    '0'
  )}/${hoje.getFullYear()}`;
}

function openModal(title, bodyHTML) {
  const titulo = $('#modal-title');
  const corpo = $('#modal-body');
  const overlay = $('#modal-overlay');
  if (!titulo || !corpo || !overlay) return;
  titulo.textContent = title;
  corpo.innerHTML = bodyHTML;
  overlay.classList.remove('hidden');
}

function closeModal() {
  const overlay = $('#modal-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ===== 5. Autenticação (interface) =====
function showAuth() {
  $('#auth-screen')?.classList.remove('hidden');
  $('#app-screen')?.classList.add('hidden');
}

function showApp() {
  const session = Auth.current();
  if (!session) return showAuth();

  $('#auth-screen')?.classList.add('hidden');
  $('#app-screen')?.classList.remove('hidden');

  const userName = $('#user-name');
  const welcome = $('#welcome-name');
  if (userName) userName.textContent = session.nome;
  if (welcome) welcome.textContent = String(session.nome || '').split(' ')[0];

  renderDashboard();
  popularFiltroPacientes();
  renderPacientes();
  renderPlanejamentos();
  renderEvolucoes();
  popularFiltroListas();
  renderListas();
  renderControlePacientes();
  carregarCrfa();
  renderConfiguracoes();
}

function bindAuthEvents() {
  on('#login-form', 'submit', (e) => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const senha = $('#login-password').value;
    const result = Auth.login(email, senha);
    if (result.ok) {
      $('#login-error').textContent = '';
      e.target.reset();
      showApp();
    } else {
      $('#login-error').textContent = result.error;
    }
  });

  on('#register-form', 'submit', (e) => {
    e.preventDefault();
    const nome = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim();
    const senha = $('#reg-password').value;

    if (senha.length < 4) {
      $('#register-error').textContent = 'A senha deve ter no mínimo 4 caracteres.';
      return;
    }

    const result = Auth.register(nome, email, senha);
    if (result.ok) {
      $('#register-error').textContent = '';
      e.target.reset();
      showApp();
    } else {
      $('#register-error').textContent = result.error;
    }
  });

  on('#show-register', 'click', (e) => {
    e.preventDefault();
    $('#login-form')?.classList.add('hidden');
    $('#register-form')?.classList.remove('hidden');
  });

  on('#show-login', 'click', (e) => {
    e.preventDefault();
    $('#register-form')?.classList.add('hidden');
    $('#login-form')?.classList.remove('hidden');
  });

  on('#logout-btn', 'click', () => {
    Auth.logout();
    showAuth();
  });
}

// ===== 6. Navegação =====
function refreshSection(section) {
  switch (section) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'pacientes':
      popularFiltroPacientes();
      renderPacientes();
      break;
    case 'planejamento':
      renderPlanejamentos();
      break;
    case 'evolucoes':
      renderEvolucoes();
      break;
    case 'controle':
      renderControlePacientes();
      carregarCrfa();
      break;
    case 'config':
      renderConfiguracoes();
      break;
    case 'listas':
      popularFiltroListas();
      renderListas();
      break;
    default:
      break;
  }
}

function bindNav() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const section = btn.dataset.section;
      document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
      $('#section-' + section)?.classList.add('active');

      const titulo = $('#section-title');
      if (titulo) titulo.textContent = SECTIONS[section] || section;

      refreshSection(section);
    });
  });
}

function bindSidebarToggle() {
  const sidebar = $('#sidebar');
  const toggle = $('#sidebar-toggle');
  if (!sidebar || !toggle) return;

  if (localStorage.getItem('fonoedu_sidebar_collapsed') === '1') {
    sidebar.classList.add('collapsed');
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem(
      'fonoedu_sidebar_collapsed',
      sidebar.classList.contains('collapsed') ? '1' : '0'
    );
  });
}

// ===== 7. Painel Inicial =====
function renderDashboard() {
  const set = (sel, valor) => {
    const el = $(sel);
    if (el) el.textContent = valor;
  };
  set('#stat-pacientes', read(DB.PACIENTES).length);
  set('#stat-metas', read(DB.PLANEJAMENTOS).length);
  set('#stat-evolucoes', read(DB.EVOLUCOES).length);
  set('#stat-listas', read(DB.LISTAS).length);
}

// ===== 8. Pacientes =====
function getPacientes() {
  const brutos = read(DB.PACIENTES);
  let alterado = false;

  const pacientes = brutos.map((p, i) => {
    const novo = { ...p };
    if (!novo.transtorno && novo.diagnostico) {
      novo.transtorno = novo.diagnostico;
      alterado = true;
    }
    if (!novo.anoEscolar && novo.serie) {
      novo.anoEscolar = novo.serie;
      alterado = true;
    }
    if (!novo.codigo) {
      novo.codigo = 'P' + String(i + 1).padStart(3, '0');
      alterado = true;
    }
    return novo;
  });

  if (alterado) write(DB.PACIENTES, pacientes);
  return pacientes;
}

function popularFiltroPacientes() {
  const select = $('#paciente-filtro-diagnostico');
  if (!select) return;

  const atual = select.value;
  const pacientes = getPacientes();
  const usados = [...new Set(pacientes.map((p) => p.transtorno).filter(Boolean))].sort();
  const lista = usados.length ? usados : TRANSTORNOS;

  select.innerHTML =
    '<option value="">Todos os transtornos</option>' +
    lista.map((t) => `<option>${t}</option>`).join('');

  if (atual && lista.includes(atual)) select.value = atual;
}

function renderPacientes() {
  const tbody = $('#pacientes-tbody');
  const empty = $('#pacientes-empty');
  if (!tbody) return;

  const pacientes = getPacientes();
  const busca = normalizarTexto($('#paciente-search')?.value || '');
  const filtro = $('#paciente-filtro-diagnostico')?.value || '';

  const filtrados = pacientes.filter((p) => {
    const campos = [
      p.nome,
      p.codigo,
      p.escola,
      p.responsavel,
      p.telefone,
      p.transtorno,
      p.cid,
      p.anoEscolar,
    ];
    const okBusca = !busca || campos.some((c) => normalizarTexto(c).includes(busca));
    const okFiltro = !filtro || p.transtorno === filtro;
    return okBusca && okFiltro;
  });

  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  filtrados.forEach((p) => {
    const idadeTexto = p.dataNascimento
      ? `${calcularIdade(p.dataNascimento)} anos`
      : p.idade
        ? `${p.idade} anos`
        : '—';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.codigo || '—'}</strong></td>
      <td><strong>${p.nome || '—'}</strong></td>
      <td>${idadeTexto}</td>
      <td>${p.sexo || '—'}</td>
      <td><span class="badge">${p.transtorno || '—'}</span></td>
      <td>${p.escola || '—'}</td>
      <td>${p.telefone || '—'}</td>
      <td>${p.frequencia || '—'}</td>
      <td>
        <button class="btn-sm" onclick="viewPaciente('${p.id}')">Ficha</button>
        <button class="btn-sm" onclick="editPaciente('${p.id}')">Editar</button>
        <button class="btn-sm danger" onclick="deletePaciente('${p.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function pacienteFormHTML(paciente = {}) {
  const transtornoOptions = TRANSTORNOS.map((t) => {
    const selected = paciente.transtorno === t ? 'selected' : '';
    return `<option ${selected}>${t}</option>`;
  }).join('');

  const freqOptions = FREQUENCIAS.map((f) => {
    const selected = paciente.frequencia === f ? 'selected' : '';
    return `<option ${selected}>${f}</option>`;
  }).join('');

  const sexoOptions = ['Feminino', 'Masculino', 'Outro']
    .map((s) => {
      const selected = paciente.sexo === s ? 'selected' : '';
      return `<option ${selected}>${s}</option>`;
    })
    .join('');

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diasOptions = diasSemana
    .map((d) => {
      const selected = paciente.diaSemana === d ? 'selected' : '';
      return `<option ${selected}>${d}</option>`;
    })
    .join('');

  const idadeAtual = paciente.dataNascimento
    ? `${calcularIdade(paciente.dataNascimento)} anos`
    : paciente.idade
      ? `${paciente.idade} anos`
      : 'Calculada automaticamente';

  return `
    <form id="paciente-form" class="form-grid">
      <div class="form-group">
        <label>ID</label>
        <input type="text" value="${paciente.codigo || 'Gerado automaticamente'}" disabled>
      </div>
      <div class="form-group">
        <label>Paciente (nome)</label>
        <input type="text" id="pf-nome" value="${paciente.nome || ''}" required>
      </div>
      <div class="form-group">
        <label>Data de nascimento</label>
        <input type="date" id="pf-nascimento" value="${paciente.dataNascimento || ''}" required>
      </div>
      <div class="form-group">
        <label>Idade</label>
        <input type="text" id="pf-idade" value="${idadeAtual}" disabled>
      </div>
      <div class="form-group">
        <label>Sexo</label>
        <select id="pf-sexo" required>
          <option value="">Selecione...</option>
          ${sexoOptions}
        </select>
      </div>
      <div class="form-group full">
        <label>Hipótese Diagnóstica</label>
        <select id="pf-transtorno" required>
          <option value="">Selecione...</option>
          ${transtornoOptions}
        </select>
      </div>
      <div class="form-group">
        <label>CID-11</label>
        <input type="text" id="pf-cid" placeholder="Ex: 6A03" value="${paciente.cid || ''}">
      </div>
      <div class="form-group">
        <label>Escola</label>
        <input type="text" id="pf-escola" placeholder="Nome da escola" value="${paciente.escola || ''}">
      </div>
      <div class="form-group">
        <label>Ano Escolar</label>
        <input type="text" id="pf-ano-escolar" placeholder="Ex: 3º ano" value="${paciente.anoEscolar || ''}">
      </div>
      <div class="form-group">
        <label>Responsável</label>
        <input type="text" id="pf-responsavel" placeholder="Nome do responsável" value="${paciente.responsavel || ''}">
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="tel" id="pf-telefone" placeholder="(00) 00000-0000" value="${paciente.telefone || ''}">
      </div>
      <div class="form-group">
        <label>Frequência</label>
        <select id="pf-frequencia" required>
          <option value="">Selecione...</option>
          ${freqOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Data de Avaliação</label>
        <input type="date" id="pf-data-avaliacao" value="${paciente.dataAvaliacao || ''}">
      </div>
      <div class="form-group">
        <label>Data de início</label>
        <input type="date" id="pf-data" value="${paciente.dataInicio || ''}" required>
      </div>
      <div class="form-group">
        <label>Próxima Reavaliação</label>
        <input type="date" id="pf-proxima-reavaliacao" value="${paciente.proximaReavaliacao || ''}">
      </div>
      <div class="form-group">
        <label>Atendimento — Dia da semana</label>
        <select id="pf-dia-semana">
          <option value="">Selecione...</option>
          ${diasOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Atendimento — Hora</label>
        <input type="time" id="pf-hora" value="${paciente.hora || ''}">
      </div>
      <div class="form-group full">
        <label>Desligamento</label>
        <input type="date" id="pf-desligamento" value="${paciente.desligamento || ''}">
        <small style="color:var(--muted)">Preencha apenas se o paciente foi desligado do atendimento.</small>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Salvar paciente</button>
      </div>
    </form>
  `;
}

function ligarCalculoIdade() {
  const nasc = $('#pf-nascimento');
  if (!nasc) return;
  nasc.addEventListener('change', () => {
    const campoIdade = $('#pf-idade');
    if (campoIdade) {
      campoIdade.value = nasc.value ? `${calcularIdade(nasc.value)} anos` : '';
    }
  });
}

function novoPaciente() {
  openModal('Novo paciente', pacienteFormHTML());
  ligarCalculoIdade();
  on('#paciente-form', 'submit', (e) => {
    e.preventDefault();
    salvarPaciente(null);
  });
}

function editPaciente(id) {
  const paciente = read(DB.PACIENTES).find((p) => p.id === id);
  if (!paciente) return;
  openModal('Editar paciente', pacienteFormHTML(paciente));
  ligarCalculoIdade();
  on('#paciente-form', 'submit', (e) => {
    e.preventDefault();
    salvarPaciente(id);
  });
}

function proximoCodigoPaciente(pacientes) {
  const numeros = pacientes
    .map((p) => parseInt(String(p.codigo || '').replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const proximo = numeros.length ? Math.max(...numeros) + 1 : 1;
  return 'P' + String(proximo).padStart(3, '0');
}

function salvarPaciente(id) {
  const dados = {
    nome: $('#pf-nome').value.trim(),
    dataNascimento: $('#pf-nascimento').value,
    sexo: $('#pf-sexo').value,
    transtorno: $('#pf-transtorno').value,
    cid: $('#pf-cid').value.trim(),
    escola: $('#pf-escola').value.trim(),
    anoEscolar: $('#pf-ano-escolar').value.trim(),
    responsavel: $('#pf-responsavel').value.trim(),
    telefone: $('#pf-telefone').value.trim(),
    frequencia: $('#pf-frequencia').value,
    dataAvaliacao: $('#pf-data-avaliacao').value,
    dataInicio: $('#pf-data').value,
    proximaReavaliacao: $('#pf-proxima-reavaliacao').value,
    diaSemana: $('#pf-dia-semana').value,
    hora: $('#pf-hora').value,
    desligamento: $('#pf-desligamento').value,
  };

  const pacientes = getPacientes();

  if (id) {
    const idx = pacientes.findIndex((p) => p.id === id);
    if (idx >= 0) pacientes[idx] = { ...pacientes[idx], ...dados };
  } else {
    pacientes.push({ id: uid(), codigo: proximoCodigoPaciente(pacientes), ...dados });
  }

  write(DB.PACIENTES, pacientes);
  closeModal();
  popularFiltroPacientes();
  renderPacientes();
  renderDashboard();
}

function deletePaciente(id) {
  if (!confirm('Excluir este paciente? Esta ação não pode ser desfeita.')) return;
  write(
    DB.PACIENTES,
    read(DB.PACIENTES).filter((p) => p.id !== id)
  );
  popularFiltroPacientes();
  renderPacientes();
  renderDashboard();
}

function viewPaciente(id) {
  const paciente = read(DB.PACIENTES).find((p) => p.id === id);
  if (!paciente) return;

  openModal(
    `Ficha — ${paciente.codigo || ''} ${paciente.nome}`,
    `
    <div class="ficha">
      <p><strong>ID:</strong> ${paciente.codigo || '—'}</p>
      <p><strong>Paciente:</strong> ${paciente.nome || '—'}</p>
      <p><strong>Data de nascimento:</strong> ${formatDate(paciente.dataNascimento)} (${calcularIdade(paciente.dataNascimento)} anos)</p>
      <p><strong>Sexo:</strong> ${paciente.sexo || '—'}</p>
      <p><strong>Hipótese Diagnóstica:</strong> <span class="badge">${paciente.transtorno || '—'}</span></p>
      <p><strong>CID-11:</strong> ${paciente.cid || '—'}</p>
      <p><strong>Escola:</strong> ${paciente.escola || '—'} (${paciente.anoEscolar || '—'})</p>
      <p><strong>Responsável:</strong> ${paciente.responsavel || '—'}</p>
      <p><strong>Telefone:</strong> ${paciente.telefone || '—'}</p>
      <p><strong>Frequência:</strong> ${paciente.frequencia || '—'}</p>
      <p><strong>Data de Avaliação:</strong> ${formatDate(paciente.dataAvaliacao)}</p>
      <p><strong>Data de início:</strong> ${formatDate(paciente.dataInicio)}</p>
      <p><strong>Próxima Reavaliação:</strong> ${formatDate(paciente.proximaReavaliacao)}</p>
      <p><strong>Atendimento:</strong> ${paciente.diaSemana || '—'}${paciente.hora ? ' às ' + paciente.hora : ''}</p>
      <p><strong>Desligamento:</strong> ${paciente.desligamento ? formatDate(paciente.desligamento) : 'Ativo'}</p>
    </div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="closeModal()">Fechar</button>
    </div>
  `
  );
}

function bindPacientesEvents() {
  on('#btn-novo-paciente', 'click', novoPaciente);
  on('#paciente-search', 'input', renderPacientes);
  on('#paciente-filtro-diagnostico', 'change', renderPacientes);
  on('#modal-close', 'click', closeModal);
  on('#modal-overlay', 'click', (e) => {
    if (e.target === $('#modal-overlay')) closeModal();
  });
}

// ===== 9. Planejamento Terapêutico =====
const AREAS_TERAPEUTICAS = [
  'Linguagem',
  'Audição',
  'Motricidade Orofacial',
  'Fluência',
  'Voz',
  'Aprendizagem',
];

const NIVEIS_DIFICULDADE = ['Intensa', 'Moderada', 'Leve'];

const CATEGORIAS_ESTRATEGIAS = {
  'Incentivo Verbal': [
    'Necessitou mediação constante',
    'Apresentou evolução',
    'Manteve desempenho',
    'Apresentou dificuldade',
    'Generalizou habilidade',
  ],
  'Aumentar Complexidade': [
    'Reduzir pistas',
    'Reforçar habilidade',
    'Introduzir nova habilidade',
    'Adaptar atividade',
    'Reavaliar desempenho',
    'Orientar família',
    'Orientar escola',
  ],
  'Aprimorar Atenção Visual': [
    'Aprimorar nomeação automática rápida',
    'Aprimorar relação fonema-grafema',
    'Desenvolver consciência fonêmica',
    'Desenvolver consciência fonológica',
    'Desenvolver consciência silábica',
    'Desenvolver fluência leitora',
    'Desenvolver habilidades comunicativas',
    'Expandir acesso lexical',
    'Expandir vocabulário expressivo',
    'Facilitar funções neurovegetativas',
    'Favorecer a produção escrita',
    'Favorecer a compreensão leitora',
    'Reabilitar linguagem oral',
  ],
  'Cartões de Figuras': [
    'Textos',
    'Histórias',
    'Jogos de memória',
    'Aplicativos educativos',
    'Material escolar',
    'Figuras',
    'Pranchas visuais',
    'Dados',
    'Quebra-cabeças',
  ],
  'Processamento Auditivo': [
    'Leitura e Escrita',
    'Vocabulário',
    'Motricidade Orofacial',
    'Praxias',
    'Pragmática / Comunicação',
  ],
  'Discriminação Auditiva': [
    'Atenção Auditiva',
    'Memória Fonológica',
    'Organização Sintática',
    'Habilidades Narrativas',
    'Classificação de Palavras',
    'Acesso Lexical',
    'Produção Escrita',
    'Correspondência Grafo-fonêmica',
    'Habilidades Metafonológicas',
    'Padrões Silábicos',
    'Modelamento da Fluência',
    'Percepção Auditiva',
    'Adequação de OFAs',
    'Facilitação de Funções Neurovegetativas',
  ],
  'Atividades Multissensoriais': [
    'A Voz em Papel',
    'Bandinha',
    'Brincar de Falar',
    'Cara Cara',
    'Cilada',
    'Coleção Estrelinha',
    'Combinou',
    'Cuca Legal',
    'Desafio das Cores',
    'Dobble',
    'Dominós',
    'Entrevistamente',
    'Escola Games',
    'Fono na Escola - Linguagem',
    'Fono na Escola - Audição',
    'Fono na Escola - Escrita',
    'Gagueira Infantil',
    'Jogos de Boquinhas',
    'Jogos de Memória',
  ],
};

function slugCat(cat) {
  return cat
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function nomePaciente(id) {
  const p = read(DB.PACIENTES).find((x) => x.id === id);
  return p ? p.nome : '—';
}

function estrategiasSelectHTML(categoria, valorAtual) {
  const opcoes = (CATEGORIAS_ESTRATEGIAS[categoria] || [])
    .map((op) => `<option ${valorAtual === op ? 'selected' : ''}>${op}</option>`)
    .join('');
  return `<select id="estr-${slugCat(categoria)}" class="estr-select">
    <option value="">—</option>${opcoes}</select>`;
}

function renderPlanejamentos() {
  const tbody = $('#planejamentos-tbody');
  if (!tbody) return;

  const planos = read(DB.PLANEJAMENTOS);
  const busca = normalizarTexto($('#planejamento-search')?.value || '');
  const filtro = $('#planejamento-filtro-transtorno')?.value || '';

  const filtrados = planos.filter((pl) => {
    const nome = normalizarTexto(nomePaciente(pl.pacienteId));
    const okBusca =
      !busca || normalizarTexto(pl.objetivoGeral).includes(busca) || nome.includes(busca);
    const okFiltro = !filtro || pl.transtorno === filtro;
    return okBusca && okFiltro;
  });

  tbody.innerHTML = '';

  const empty = $('#planejamentos-empty');
  if (filtrados.length === 0) {
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  filtrados.forEach((pl) => {
    const status = pl.status || 'Ativo';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${nomePaciente(pl.pacienteId)}</strong></td>
      <td>${pl.objetivoGeral || '—'}</td>
      <td><span class="badge">${pl.transtorno || '—'}</span></td>
      <td><span class="badge">${pl.nivel || '—'}</span></td>
      <td><span class="badge status-${status === 'Ativo' ? 'ativo' : 'encerrado'}">${status}</span></td>
      <td>${pl.frequencia || '—'}</td>
      <td>
        <button class="btn-sm" onclick="viewPlanejamento('${pl.id}')">Ver</button>
        <button class="btn-sm" onclick="editPlanejamento('${pl.id}')">Editar</button>
        <button class="btn-sm danger" onclick="deletePlanejamento('${pl.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function planejamentoFormHTML(plano = {}) {
  const pacientes = getPacientes();
  const pacienteOptions = pacientes
    .map((p) => {
      const selected = plano.pacienteId === p.id ? 'selected' : '';
      return `<option value="${p.id}" ${selected}>${p.codigo || ''} ${p.nome}</option>`;
    })
    .join('');

  const transtornoOptions = TRANSTORNOS.map((t) => {
    const selected = plano.transtorno === t ? 'selected' : '';
    return `<option ${selected}>${t}</option>`;
  }).join('');

  const areaOptions = AREAS_TERAPEUTICAS.map((a) => {
    const selected = plano.area === a ? 'selected' : '';
    return `<option ${selected}>${a}</option>`;
  }).join('');

  const freqOptions = FREQUENCIAS.map((f) => {
    const selected = plano.frequencia === f ? 'selected' : '';
    return `<option ${selected}>${f}</option>`;
  }).join('');

  const nivelOptions = NIVEIS_DIFICULDADE.map((n) => {
    const selected = plano.nivel === n ? 'selected' : '';
    return `<option ${selected}>${n}</option>`;
  }).join('');

  const statusOptions = ['Ativo', 'Encerrado']
    .map((s) => {
      const selected = (plano.status || 'Ativo') === s ? 'selected' : '';
      return `<option ${selected}>${s}</option>`;
    })
    .join('');

  const objetivosTexto = (plano.objetivos || []).join('\n');
  const estrategias = plano.estrategias || {};

  const estrategiasHTML = Object.keys(CATEGORIAS_ESTRATEGIAS)
    .map(
      (cat) => `
    <div class="form-group full">
      <label>${cat}</label>
      ${estrategiasSelectHTML(cat, estrategias[cat] || '')}
    </div>`
    )
    .join('');

  return `
    <form id="planejamento-form" class="form-grid">
      <div class="form-group full">
        <label>Paciente</label>
        <select id="pl-paciente" required>
          <option value="">Selecione o paciente...</option>
          ${pacienteOptions}
        </select>
      </div>
      <div class="form-group full">
        <label>Hipótese Diagnóstica (Transtorno)</label>
        <select id="pl-transtorno" required>
          <option value="">Selecione o transtorno...</option>
          ${transtornoOptions}
        </select>
      </div>
      <div class="form-group full">
        <label>Objetivo Geral</label>
        <input type="text" id="pl-objetivo-geral" placeholder="Ex: Desenvolver consciência fonológica" value="${plano.objetivoGeral || ''}" required>
      </div>
      <div class="form-group full">
        <label>Objetivos Específicos (um por linha)</label>
        <textarea id="pl-objetivos" rows="4" placeholder="Ex:&#10;Segmentar palavras em sílabas&#10;Identificar rimas&#10;Reconhecer fonema inicial">${objetivosTexto}</textarea>
      </div>
      <div class="form-group">
        <label>Área Terapêutica</label>
        <select id="pl-area" required>
          <option value="">Selecione...</option>
          ${areaOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Frequência</label>
        <select id="pl-frequencia" required>
          <option value="">Selecione...</option>
          ${freqOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Nível de Dificuldade</label>
        <select id="pl-nivel" required>
          <option value="">Selecione...</option>
          ${nivelOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="pl-status" required>
          ${statusOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Data de planejamento</label>
        <input type="date" id="pl-data-inicio" value="${plano.dataInicio || ''}" required>
      </div>
      <div class="form-group full">
        <label>Estratégias Terapêuticas</label>
        <div class="estrategias-grid">${estrategiasHTML}</div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Salvar planejamento</button>
      </div>
    </form>`;
}

function novoPlanejamento() {
  if (getPacientes().length === 0) {
    alert('Cadastre um paciente antes de criar um planejamento.');
    return;
  }
  openModal('Novo planejamento terapêutico', planejamentoFormHTML());
  on('#planejamento-form', 'submit', (e) => {
    e.preventDefault();
    salvarPlanejamento(null);
  });
}

function editPlanejamento(id) {
  const plano = read(DB.PLANEJAMENTOS).find((p) => p.id === id);
  if (!plano) return;
  openModal('Editar planejamento', planejamentoFormHTML(plano));
  on('#planejamento-form', 'submit', (e) => {
    e.preventDefault();
    salvarPlanejamento(id);
  });
}

function salvarPlanejamento(id) {
  const estrategias = {};
  Object.keys(CATEGORIAS_ESTRATEGIAS).forEach((cat) => {
    const campo = $('#estr-' + slugCat(cat));
    const valor = campo ? campo.value : '';
    if (valor) estrategias[cat] = valor;
  });

  const dados = {
    pacienteId: $('#pl-paciente').value,
    transtorno: $('#pl-transtorno').value,
    objetivoGeral: $('#pl-objetivo-geral').value.trim(),
    objetivos: $('#pl-objetivos')
      .value.split('\n')
      .map((o) => o.trim())
      .filter(Boolean),
    area: $('#pl-area').value,
    frequencia: $('#pl-frequencia').value,
    nivel: $('#pl-nivel').value,
    status: $('#pl-status').value,
    dataInicio: $('#pl-data-inicio').value,
    estrategias,
  };

  const planos = read(DB.PLANEJAMENTOS);
  if (id) {
    const idx = planos.findIndex((p) => p.id === id);
    if (idx >= 0) planos[idx] = { ...planos[idx], ...dados };
  } else {
    planos.push({ id: uid(), ...dados });
  }

  write(DB.PLANEJAMENTOS, planos);
  closeModal();
  renderPlanejamentos();
  renderDashboard();
}

function deletePlanejamento(id) {
  if (!confirm('Excluir este planejamento? Esta ação não pode ser desfeita.')) return;
  write(
    DB.PLANEJAMENTOS,
    read(DB.PLANEJAMENTOS).filter((p) => p.id !== id)
  );
  renderPlanejamentos();
  renderDashboard();
}

function viewPlanejamento(id) {
  const plano = read(DB.PLANEJAMENTOS).find((p) => p.id === id);
  if (!plano) return;

  const status = plano.status || 'Ativo';

  const objetivosHTML =
    (plano.objetivos || []).map((o) => `<li>${o}</li>`).join('') ||
    '<li style="color:var(--muted)">Nenhum objetivo específico.</li>';

  const estrategiasHTML =
    Object.keys(CATEGORIAS_ESTRATEGIAS)
      .map((cat) => {
        const valor = plano.estrategias && plano.estrategias[cat];
        if (!valor) return '';
        return `<p><strong>${cat}:</strong> ${valor}</p>`;
      })
      .join('') || '<p style="color:var(--muted)">Nenhuma estratégia registrada.</p>';

  openModal(
    `Planejamento — ${nomePaciente(plano.pacienteId)}`,
    `
    <div class="ficha">
      <p><strong>Hipótese Diagnóstica:</strong> <span class="badge">${plano.transtorno || '—'}</span></p>
      <p><strong>Objetivo Geral:</strong> ${plano.objetivoGeral || '—'}</p>
      <p><strong>Área Terapêutica:</strong> ${plano.area || '—'} · <strong>Frequência:</strong> ${plano.frequencia || '—'} · <strong>Nível:</strong> <span class="badge">${plano.nivel || '—'}</span></p>
      <p><strong>Status:</strong> <span class="badge status-${status === 'Ativo' ? 'ativo' : 'encerrado'}">${status}</span></p>
      <p><strong>Data de planejamento:</strong> ${formatDate(plano.dataInicio)}</p>
    </div>
    <h4 style="margin:14px 0 8px">Objetivos Específicos</h4>
    <ul style="margin:0 0 14px 18px; font-size:.9rem">${objetivosHTML}</ul>
    <h4 style="margin:0 0 8px">Estratégias Terapêuticas</h4>
    <div class="ficha">${estrategiasHTML}</div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="editPlanejamento('${plano.id}')">Editar</button>
      <button class="btn-outline" onclick="closeModal()">Fechar</button>
    </div>
  `
  );
}

function bindPlanejamentosEvents() {
  on('#btn-novo-planejamento', 'click', novoPlanejamento);
  on('#planejamento-search', 'input', renderPlanejamentos);
  on('#planejamento-filtro-transtorno', 'change', renderPlanejamentos);
}

// ===== 10. Evoluções =====
const PRESENCAS = ['Presente', 'Ausente', 'Justificada'];

const RESPOSTAS = [
  'Apresentou evolução',
  'Manteve desempenho',
  'Apresentou dificuldade',
  'Generalizou habilidade',
  'Necessitou mediação constante',
];

const NIVEIS_AJUDA = ['Independente', 'Pista visual', 'Apoio verbal', 'Mediação constante'];

function badgeResposta(resposta) {
  if (!resposta) return '—';
  const classes = {
    'Apresentou evolução': 'status-concluido',
    'Generalizou habilidade': 'status-concluido',
    'Manteve desempenho': 'status-manutencao',
    'Apresentou dificuldade': 'status-dificuldade',
    'Necessitou mediação constante': 'status-dificuldade',
  };
  return `<span class="badge ${classes[resposta] || ''}">${resposta}</span>`;
}

function badgeAjuda(nivel) {
  if (!nivel) return '—';
  const classes = {
    Independente: 'status-concluido',
    'Pista visual': 'status-ajuda',
    'Apoio verbal': 'status-ajuda',
    'Mediação constante': 'status-dificuldade',
  };
  return `<span class="badge ${classes[nivel] || ''}">${nivel}</span>`;
}

function proximaSessao(pacienteId) {
  return read(DB.EVOLUCOES).filter((e) => e.pacienteId === pacienteId).length + 1;
}

function gerarEvolucaoTexto(ev) {
  const nome = nomePaciente(ev.pacienteId);
  const presenca = ev.presenca === 'Presente' ? 'compareceu' : 'não compareceu';
  let texto = `Na sessão ${ev.sessao}, ${nome} ${presenca} à sessão de ${formatDate(ev.data)}.`;
  if (ev.resposta) texto += ` Resposta: ${ev.resposta}.`;
  if (ev.nivelAjuda) texto += ` Nível de ajuda: ${ev.nivelAjuda}.`;
  if (ev.observacoes) texto += ` Observações: ${ev.observacoes}`;
  return texto;
}

function atualizarPlanejamentosPaciente() {
  const pid = $('#ev-paciente')?.value;
  const select = $('#ev-planejamento');
  if (!select) return;

  const planos = pid
    ? read(DB.PLANEJAMENTOS).filter(
        (pl) => pl.pacienteId === pid && (pl.status || 'Ativo') === 'Ativo'
      )
    : [];

  select.innerHTML =
    '<option value="">Sem planejamento vinculado</option>' +
    planos.map((pl) => `<option value="${pl.id}">${pl.objetivoGeral}</option>`).join('');

  if (planos.length > 0) select.value = planos[0].id;
}

function renderEvolucoes() {
  const filtroSelect = $('#evolucao-filtro-paciente');
  if (!filtroSelect) return;

  const valorAtual = filtroSelect.value;
  const pacientes = getPacientes();

  filtroSelect.innerHTML =
    '<option value="">Todos os pacientes</option>' +
    pacientes
      .map(
        (p) =>
          `<option value="${p.id}" ${valorAtual === p.id ? 'selected' : ''}>${p.codigo || ''} ${p.nome}</option>`
      )
      .join('');

  const tbody = $('#evolucoes-tbody');
  if (!tbody) return;

  const busca = normalizarTexto($('#evolucao-search')?.value || '');
  const filtroPaciente = filtroSelect.value;
  const planos = read(DB.PLANEJAMENTOS);

  const filtradas = read(DB.EVOLUCOES)
    .filter((ev) => {
      const nome = normalizarTexto(nomePaciente(ev.pacienteId));
      const okBusca =
        !busca ||
        nome.includes(busca) ||
        normalizarTexto(ev.observacoes).includes(busca) ||
        normalizarTexto(ev.objetivos).includes(busca);
      const okFiltro = !filtroPaciente || ev.pacienteId === filtroPaciente;
      return okBusca && okFiltro;
    })
    .sort((a, b) => (a.data < b.data ? 1 : -1));

  tbody.innerHTML = '';

  const empty = $('#evolucoes-empty');
  if (filtradas.length === 0) {
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  filtradas.forEach((ev) => {
    const planejamento = ev.planejamentoId
      ? (planos.find((pl) => pl.id === ev.planejamentoId) || {}).objetivoGeral
      : null;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(ev.data)}</td>
      <td><strong>${nomePaciente(ev.pacienteId)}</strong></td>
      <td><span class="badge">${ev.diagnostico || '—'}</span></td>
      <td><span class="badge">Sessão ${ev.sessao || '—'}</span></td>
      <td><span class="badge ${ev.presenca === 'Presente' ? 'status-concluido' : 'status-pausado'}">${ev.presenca || '—'}</span></td>
      <td class="cell-truncate">${ev.objetivos || '—'}</td>
      <td class="cell-truncate">${ev.estrategias || '—'}</td>
      <td>${badgeResposta(ev.resposta)}</td>
      <td>${badgeAjuda(ev.nivelAjuda)}</td>
      <td class="cell-truncate">${ev.observacoes || '—'}</td>
      <td class="cell-truncate">${ev.evolucaoGerada || '—'}</td>
      <td>${planejamento ? `<span class="badge">${planejamento}</span>` : '—'}</td>
      <td>
        <button class="btn-sm" onclick="viewEvolucao('${ev.id}')">Ver</button>
        <button class="btn-sm" onclick="editEvolucao('${ev.id}')">Editar</button>
        <button class="btn-sm danger" onclick="deleteEvolucao('${ev.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function evolucaoFormHTML(evolucao = {}) {
  const pacientes = getPacientes();
  const pacienteOptions = pacientes
    .map((p) => {
      const selected = evolucao.pacienteId === p.id ? 'selected' : '';
      return `<option value="${p.id}" ${selected}>${p.codigo || ''} ${p.nome}</option>`;
    })
    .join('');

  const presencaOptions = PRESENCAS.map((s) => {
    const selected = evolucao.presenca === s ? 'selected' : '';
    return `<option ${selected}>${s}</option>`;
  }).join('');

  const respostaOptions = RESPOSTAS.map((r) => {
    const selected = evolucao.resposta === r ? 'selected' : '';
    return `<option ${selected}>${r}</option>`;
  }).join('');

  const ajudaOptions = NIVEIS_AJUDA.map((a) => {
    const selected = evolucao.nivelAjuda === a ? 'selected' : '';
    return `<option ${selected}>${a}</option>`;
  }).join('');

  const planosPaciente = evolucao.pacienteId
    ? read(DB.PLANEJAMENTOS).filter(
        (pl) =>
          pl.pacienteId === evolucao.pacienteId &&
          ((pl.status || 'Ativo') === 'Ativo' || pl.id === evolucao.planejamentoId)
      )
    : [];

  const planoOptions = planosPaciente
    .map((pl) => {
      const selected = evolucao.planejamentoId === pl.id ? 'selected' : '';
      return `<option value="${pl.id}" ${selected}>${pl.objetivoGeral}</option>`;
    })
    .join('');

  const diagnostico = evolucao.pacienteId
    ? (read(DB.PACIENTES).find((p) => p.id === evolucao.pacienteId) || {}).transtorno || ''
    : '';

  return `
    <form id="evolucao-form" class="form-grid">
      <div class="form-group">
        <label>Data</label>
        <input type="date" id="ev-data" value="${evolucao.data || ''}" required>
      </div>
      <div class="form-group">
        <label>Paciente</label>
        <select id="ev-paciente" required>
          <option value="">Selecione...</option>
          ${pacienteOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Diagnóstico</label>
        <input type="text" id="ev-diagnostico" value="${evolucao.diagnostico || diagnostico}" readonly>
      </div>
      <div class="form-group">
        <label>Sessão</label>
        <input type="number" id="ev-sessao" value="${evolucao.sessao || ''}" min="1" required>
      </div>
      <div class="form-group">
        <label>Presença</label>
        <select id="ev-presenca" required>
          <option value="">Selecione...</option>
          ${presencaOptions}
        </select>
      </div>
      <div class="form-group">
        <label>ID Planejamento</label>
        <select id="ev-planejamento">
          <option value="">Sem planejamento vinculado</option>
          ${planoOptions}
        </select>
      </div>
      <div class="form-group full">
        <label>Objetivos trabalhados</label>
        <textarea id="ev-objetivos" rows="3" placeholder="Objetivos trabalhados na sessão...">${evolucao.objetivos || ''}</textarea>
      </div>
      <div class="form-group full">
        <label>Estratégias Terapêuticas</label>
        <textarea id="ev-estrategias" rows="3" placeholder="Estratégias utilizadas na sessão...">${evolucao.estrategias || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Resposta</label>
        <select id="ev-resposta">
          <option value="">Selecione...</option>
          ${respostaOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Nível de Ajuda</label>
        <select id="ev-nivel-ajuda">
          <option value="">Selecione...</option>
          ${ajudaOptions}
        </select>
      </div>
      <div class="form-group full">
        <label>Observações</label>
        <textarea id="ev-observacoes" rows="3" placeholder="Observações clínicas da sessão...">${evolucao.observacoes || ''}</textarea>
      </div>
      <div class="form-group full">
        <label>Evolução gerada</label>
        <textarea id="ev-evolucao-gerada" rows="3">${evolucao.evolucaoGerada || ''}</textarea>
        <small style="color:var(--muted)">Gerada automaticamente — você pode editar antes de salvar.</small>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Salvar evolução</button>
      </div>
    </form>`;
}

function ligarEventosEvolucao() {
  on('#ev-paciente', 'change', () => {
    const pid = $('#ev-paciente').value;
    const p = read(DB.PACIENTES).find((x) => x.id === pid);
    if (p && $('#ev-diagnostico')) {
      $('#ev-diagnostico').value = p.transtorno || '';
      const campoSessao = $('#ev-sessao');
      if (campoSessao && !campoSessao.value) campoSessao.value = proximaSessao(pid);
    }
    atualizarPlanejamentosPaciente();
  });
}

function novoEvolucao() {
  if (getPacientes().length === 0) {
    alert('Cadastre um paciente antes de registrar uma evolução.');
    return;
  }
  openModal('Nova evolução', evolucaoFormHTML());
  ligarEventosEvolucao();
  on('#evolucao-form', 'submit', (e) => {
    e.preventDefault();
    salvarEvolucao(null);
  });
}

function editEvolucao(id) {
  const evolucao = read(DB.EVOLUCOES).find((e) => e.id === id);
  if (!evolucao) return;
  openModal('Editar evolução', evolucaoFormHTML(evolucao));
  ligarEventosEvolucao();
  on('#evolucao-form', 'submit', (e) => {
    e.preventDefault();
    salvarEvolucao(id);
  });
}

function salvarEvolucao(id) {
  const dados = {
    data: $('#ev-data').value,
    pacienteId: $('#ev-paciente').value,
    diagnostico: $('#ev-diagnostico').value,
    sessao: parseInt($('#ev-sessao').value, 10) || 1,
    presenca: $('#ev-presenca').value,
    planejamentoId: $('#ev-planejamento').value || null,
    objetivos: $('#ev-objetivos').value.trim(),
    estrategias: $('#ev-estrategias').value.trim(),
    resposta: $('#ev-resposta').value,
    nivelAjuda: $('#ev-nivel-ajuda').value,
    observacoes: $('#ev-observacoes').value.trim(),
    evolucaoGerada: $('#ev-evolucao-gerada').value.trim(),
  };

  if (!dados.evolucaoGerada) dados.evolucaoGerada = gerarEvolucaoTexto(dados);

  const evolucoes = read(DB.EVOLUCOES);
  if (id) {
    const idx = evolucoes.findIndex((e) => e.id === id);
    if (idx >= 0) evolucoes[idx] = { ...evolucoes[idx], ...dados };
  } else {
    evolucoes.push({ id: uid(), ...dados });
  }

  write(DB.EVOLUCOES, evolucoes);
  closeModal();
  renderEvolucoes();
  renderDashboard();
}

function deleteEvolucao(id) {
  if (!confirm('Excluir esta evolução? Esta ação não pode ser desfeita.')) return;
  write(
    DB.EVOLUCOES,
    read(DB.EVOLUCOES).filter((e) => e.id !== id)
  );
  renderEvolucoes();
  renderDashboard();
}

function viewEvolucao(id) {
  const ev = read(DB.EVOLUCOES).find((x) => x.id === id);
  if (!ev) return;

  const planejamento = ev.planejamentoId
    ? (read(DB.PLANEJAMENTOS).find((pl) => pl.id === ev.planejamentoId) || {}).objetivoGeral
    : null;

  openModal(
    `Evolução — ${nomePaciente(ev.pacienteId)}`,
    `
    <div class="ficha">
      <p><strong>Data:</strong> ${formatDate(ev.data)} · <strong>Sessão:</strong> ${ev.sessao || '—'}</p>
      <p><strong>Paciente:</strong> ${nomePaciente(ev.pacienteId)}</p>
      <p><strong>Diagnóstico:</strong> <span class="badge">${ev.diagnostico || '—'}</span></p>
      <p><strong>Presença:</strong> <span class="badge ${ev.presenca === 'Presente' ? 'status-concluido' : 'status-pausado'}">${ev.presenca || '—'}</span></p>
      ${planejamento ? `<p><strong>Planejamento vinculado:</strong> ${planejamento}</p>` : ''}
      ${ev.objetivos ? `<p><strong>Objetivos:</strong> ${ev.objetivos}</p>` : ''}
      ${ev.estrategias ? `<p><strong>Estratégias:</strong> ${ev.estrategias}</p>` : ''}
      <p><strong>Resposta:</strong> ${badgeResposta(ev.resposta)} · <strong>Nível de ajuda:</strong> ${badgeAjuda(ev.nivelAjuda)}</p>
      ${ev.observacoes ? `<p><strong>Observações:</strong> ${ev.observacoes}</p>` : ''}
    </div>
    <h4 style="margin:14px 0 8px">Evolução gerada</h4>
    <div class="ficha">${ev.evolucaoGerada || gerarEvolucaoTexto(ev)}</div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="editEvolucao('${ev.id}')">Editar</button>
      <button class="btn-outline" onclick="closeModal()">Fechar</button>
    </div>
  `
  );
}

function bindEvolucoesEvents() {
  on('#btn-novo-evolucao', 'click', novoEvolucao);
  on('#evolucao-search', 'input', renderEvolucoes);
  on('#evolucao-filtro-paciente', 'change', renderEvolucoes);
}

// ===== 11. Controle Evolutivo Mensal =====
function renderControlePacientes() {
  const select = $('#controle-paciente');
  if (!select) return;

  const atual = select.value;
  const pacientes = getPacientes();

  select.innerHTML =
    '<option value="">Selecione o paciente...</option>' +
    pacientes
      .map(
        (p) =>
          `<option value="${p.id}" ${atual === p.id ? 'selected' : ''}>${p.codigo || ''} ${p.nome}</option>`
      )
      .join('');
}

function labelMes(mesISO) {
  const [ano, mes] = String(mesISO).split('-');
  const idx = parseInt(mes, 10) - 1;
  return `${MESES[idx] || mes} de ${ano}`;
}

function resumoDoMes(evolucoes) {
  const total = evolucoes.length;
  const presencas = evolucoes.filter((e) => e.presenca === 'Presente').length;
  const ausencias = evolucoes.filter((e) => e.presenca === 'Ausente').length;
  const justificadas = evolucoes.filter((e) => e.presenca === 'Justificada').length;
  const aproveitamento = total ? Math.round((presencas / total) * 100) : 0;
  return { total, presencas, ausencias, justificadas, aproveitamento };
}

function carregarCrfa() {
  const campo = $('#controle-crfa');
  if (!campo) return;
  const cfg = getConfig();
  campo.value = cfg.crfa || '';
}

function salvarCrfa() {
  const campo = $('#controle-crfa');
  if (!campo) return;
  const cfg = getConfig();
  cfg.crfa = campo.value.trim();
  write(DB.CONFIG, cfg);

  const campoCfg = $('#cfg-crfa');
  if (campoCfg) campoCfg.value = cfg.crfa;
}

function gerarControle() {
  const pacienteId = $('#controle-paciente')?.value;
  const mes = $('#controle-mes')?.value;

  if (!pacienteId || !mes) {
    alert('Selecione um paciente e um mês.');
    return;
  }

  const paciente = read(DB.PACIENTES).find((p) => p.id === pacienteId);
  if (!paciente) return;

  const evolucoes = read(DB.EVOLUCOES)
    .filter((ev) => ev.pacienteId === pacienteId && String(ev.data || '').startsWith(mes))
    .sort((a, b) => (a.data < b.data ? -1 : 1));

  const plano = read(DB.PLANEJAMENTOS).find(
    (pl) => pl.pacienteId === pacienteId && (pl.status || 'Ativo') === 'Ativo'
  );

  const cfg = getConfig();
  const session = Auth.current();
  const fonoNome = cfg.nomeProfissional || (session ? session.nome : 'Fonoaudióloga');
  const crfa = cfg.crfa || ($('#controle-crfa')?.value || '').trim();

  const resumo = resumoDoMes(evolucoes);
  const dataEmissao = dataHojeBR();

  const linhas = evolucoes.length
    ? evolucoes
        .map(
          (ev) => `
      <tr>
        <td>${formatDate(ev.data)}</td>
        <td>${ev.sessao || '—'}</td>
        <td>${ev.presenca || '—'}</td>
        <td>${ev.objetivos || '—'}</td>
        <td>${ev.estrategias || '—'}</td>
        <td>${ev.resposta || '—'}</td>
        <td>${ev.nivelAjuda || '—'}</td>
        <td>${ev.observacoes || '—'}</td>
      </tr>`
        )
        .join('')
    : '<tr><td colspan="8" style="text-align:center;color:var(--muted)">Nenhuma evolução registrada neste mês.</td></tr>';

  const report = $('#controle-report');
  if (!report) return;

  report.innerHTML = `
    <div class="controle-doc">
      <div class="controle-header">
        <p><strong>Fonoaudióloga responsável:</strong> ${fonoNome}${crfa ? ' · CRFa: ' + crfa : ''}</p>
        <p><strong>Data de emissão:</strong> ${dataEmissao}</p>
      </div>

      <h3 class="controle-title">CONTROLE EVOLUTIVO FONOAUDIOLÓGICO</h3>
      <p class="controle-periodo">Período: ${labelMes(mes)}</p>

      <div class="ficha">
        <p><strong>Identificação do paciente</strong></p>
        <p><strong>Nome:</strong> ${paciente.nome || '—'}</p>
        <p><strong>Hipótese Diagnóstica:</strong> ${paciente.transtorno || '—'}</p>
        <p><strong>CID-11:</strong> ${paciente.cid || '—'}</p>
        <p><strong>Data de Nascimento:</strong> ${formatDate(paciente.dataNascimento)} (${calcularIdade(paciente.dataNascimento)} anos)</p>
        <p><strong>Início do Atendimento:</strong> ${formatDate(paciente.dataInicio)}</p>
        <p><strong>Atendimento:</strong> ${paciente.diaSemana || '—'}${paciente.hora ? ' às ' + paciente.hora : ''} · ${paciente.frequencia || '—'}</p>
        <p><strong>Escola:</strong> ${paciente.escola || '—'}${paciente.anoEscolar ? ' (' + paciente.anoEscolar + ')' : ''}</p>
        <p><strong>Responsável:</strong> ${paciente.responsavel || '—'}${paciente.telefone ? ' · ' + paciente.telefone : ''}</p>
        <p><strong>Área Terapêutica:</strong> ${plano ? plano.area : '—'}</p>
        <p><strong>Objetivo Geral:</strong> ${plano ? plano.objetivoGeral : '—'}</p>
      </div>

      <h4 class="controle-subtitle">Resumo do mês</h4>
      <div class="controle-resumo">
        <div class="resumo-item"><span>Sessões registradas</span><strong>${resumo.total}</strong></div>
        <div class="resumo-item"><span>Presenças</span><strong>${resumo.presencas}</strong></div>
        <div class="resumo-item"><span>Ausências</span><strong>${resumo.ausencias}</strong></div>
        <div class="resumo-item"><span>Faltas justificadas</span><strong>${resumo.justificadas}</strong></div>
        <div class="resumo-item"><span>Aproveitamento</span><strong>${resumo.aproveitamento}%</strong></div>
      </div>

      <h4 class="controle-subtitle">Evoluções Diárias</h4>
      <div class="table-wrap">
        <table class="data-table controle-table">
          <thead>
            <tr>
              <th>Data</th><th>Sessão</th><th>Presença</th><th>Objetivos</th>
              <th>Estratégias</th><th>Resposta</th><th>Nível de Ajuda</th><th>Observações</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>

      <div class="controle-assinatura">
        <p>_________________________________________</p>
        <p><strong>${fonoNome}</strong></p>
        <p>Fonoaudióloga</p>
        <p>CRFa: ${crfa || '________'}</p>
      </div>
    </div>`;

  report.classList.remove('hidden');
  $('#controle-empty')?.classList.add('hidden');
}

function imprimirControle() {
  const report = $('#controle-report');
  if (!report || report.classList.contains('hidden')) {
    alert('Gere o relatório antes de imprimir.');
    return;
  }

  const win = window.open('', '_blank', 'width=1000,height=760');
  if (!win) {
    alert('Permita pop-ups para imprimir o relatório.');
    return;
  }

  win.document.write(`
    <html><head><meta charset="UTF-8"><title>Controle Evolutivo Mensal</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 28px; font-size: 12px; }
      h3 { text-align: center; font-size: 15px; letter-spacing: .04em; margin: 14px 0 2px; }
      h4 { font-size: 12px; margin: 16px 0 6px; color: #155e75; }
      p { margin: 3px 0; }
      .controle-header { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
      .controle-periodo { text-align: center; color: #64748b; font-size: 11px; margin-bottom: 12px; }
      .ficha { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
      .controle-resumo { display: flex; gap: 8px; flex-wrap: wrap; }
      .resumo-item { flex: 1; min-width: 90px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; background: #f8fafc; }
      .resumo-item span { display: block; font-size: 10px; color: #64748b; }
      .resumo-item strong { font-size: 15px; color: #155e75; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th, td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: left; font-size: 10px; vertical-align: top; }
      th { background: #f1f5f9; }
      .controle-assinatura { margin-top: 44px; text-align: center; line-height: 1.7; }
      @page { margin: 14mm; }
    </style></head><body>${report.innerHTML}</body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function bindControleEvents() {
  on('#btn-gerar-controle', 'click', gerarControle);
  on('#btn-imprimir-controle', 'click', imprimirControle);
  on('#controle-crfa', 'change', salvarCrfa);

  const campoMes = $('#controle-mes');
  if (campoMes && !campoMes.value) {
    campoMes.value = new Date().toISOString().slice(0, 7);
  }

  carregarCrfa();
}

// ===== 12. Configurações =====
const CONFIG_PADRAO = {
  nomeProfissional: '',
  crfa: '',
  especialidade: '',
  emailProfissional: '',
  clinicaNome: '',
  cnpj: '',
  telefoneClinica: '',
  emailClinica: '',
  endereco: '',
  cidade: '',
  uf: '',
};

function getConfig() {
  const bruto = read(DB.CONFIG, {});
  const base = bruto && typeof bruto === 'object' && !Array.isArray(bruto) ? bruto : {};
  return { ...CONFIG_PADRAO, ...base };
}

function preencherConfig(sel, valor) {
  const el = $(sel);
  if (el) el.value = valor || '';
}

function renderConfiguracoes() {
  const cfg = getConfig();

  preencherConfig('#cfg-nome', cfg.nomeProfissional);
  preencherConfig('#cfg-crfa', cfg.crfa);
  preencherConfig('#cfg-especialidade', cfg.especialidade);
  preencherConfig('#cfg-email', cfg.emailProfissional);
  preencherConfig('#cfg-clinica', cfg.clinicaNome);
  preencherConfig('#cfg-cnpj', cfg.cnpj);
  preencherConfig('#cfg-telefone', cfg.telefoneClinica);
  preencherConfig('#cfg-email-clinica', cfg.emailClinica);
  preencherConfig('#cfg-endereco', cfg.endereco);
  preencherConfig('#cfg-cidade', cfg.cidade);
  preencherConfig('#cfg-uf', cfg.uf);

  renderBackupInfo();
}

function renderBackupInfo() {
  const info = $('#config-backup-info');
  if (!info) return;

  info.textContent =
    `Pacientes: ${read(DB.PACIENTES).length} · ` +
    `Planejamentos: ${read(DB.PLANEJAMENTOS).length} · ` +
    `Evoluções: ${read(DB.EVOLUCOES).length} · ` +
    `Listas: ${read(DB.LISTAS).length} · ` +
    `Relatórios emitidos: ${read(DB.RELATORIOS).length}`;
}

function salvarConfiguracoes() {
  const cfg = getConfig();

  cfg.nomeProfissional = $('#cfg-nome')?.value.trim() || '';
  cfg.crfa = $('#cfg-crfa')?.value.trim() || '';
  cfg.especialidade = $('#cfg-especialidade')?.value.trim() || '';
  cfg.emailProfissional = $('#cfg-email')?.value.trim() || '';
  cfg.clinicaNome = $('#cfg-clinica')?.value.trim() || '';
  cfg.cnpj = $('#cfg-cnpj')?.value.trim() || '';
  cfg.telefoneClinica = $('#cfg-telefone')?.value.trim() || '';
  cfg.emailClinica = $('#cfg-email-clinica')?.value.trim() || '';
  cfg.endereco = $('#cfg-endereco')?.value.trim() || '';
  cfg.cidade = $('#cfg-cidade')?.value.trim() || '';
  cfg.uf = ($('#cfg-uf')?.value || '').trim().toUpperCase();

  write(DB.CONFIG, cfg);

  const campoCrfa = $('#controle-crfa');
  if (campoCrfa) campoCrfa.value = cfg.crfa;

  alert('Configurações salvas.');
}

function exportarDados() {
  const pacote = {
    app: 'FonoEdu PRO',
    versao: 1,
    exportadoEm: new Date().toISOString(),
    dados: {
      usuarios: read(DB.USERS),
      pacientes: read(DB.PACIENTES),
      planejamentos: read(DB.PLANEJAMENTOS),
      evolucoes: read(DB.EVOLUCOES),
      listas: read(DB.LISTAS),
      relatorios: read(DB.RELATORIOS),
      config: getConfig(),
    },
  };

  const hoje = new Date();
  const nome =
    'fonoedu-backup-' +
    `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-` +
    `${String(hoje.getDate()).padStart(2, '0')}.json`;

  const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importarDados(file) {
  const reader = new FileReader();

  reader.onload = () => {
    let pacote;
    try {
      pacote = JSON.parse(String(reader.result));
    } catch {
      alert('Arquivo inválido. Selecione um backup .json exportado pelo FonoEdu PRO.');
      return;
    }

    const dados = pacote && pacote.dados ? pacote.dados : pacote;
    if (!dados || !Array.isArray(dados.pacientes)) {
      alert('Este arquivo não contém dados do FonoEdu PRO.');
      return;
    }

    const confirmado = confirm(
      `Importar backup de ${
        pacote.exportadoEm ? formatDate(pacote.exportadoEm.slice(0, 10)) : 'data desconhecida'
      }?\n\n` +
        `Pacientes: ${dados.pacientes.length}\n` +
        `Evoluções: ${(dados.evolucoes || []).length}\n\n` +
        'Os dados atuais serão substituídos.'
    );
    if (!confirmado) return;

    write(DB.PACIENTES, dados.pacientes || []);
    write(DB.PLANEJAMENTOS, dados.planejamentos || []);
    write(DB.EVOLUCOES, dados.evolucoes || []);
    write(DB.LISTAS, dados.listas || []);
    write(DB.USERS, dados.usuarios || read(DB.USERS));
    write(DB.RELATORIOS, dados.relatorios || []);
    if (dados.config) write(DB.CONFIG, dados.config);

    alert('Backup importado com sucesso.');
    showApp();
    renderConfiguracoes();
  };

  reader.onerror = () => alert('Não foi possível ler o arquivo.');
  reader.readAsText(file);
}

function limparTodosDados() {
  if (!confirm('Apagar todos os pacientes, planejamentos e evoluções deste navegador?')) return;
  if (!confirm('Esta ação não pode ser desfeita. Confirma a exclusão definitiva?')) return;

  [DB.PACIENTES, DB.PLANEJAMENTOS, DB.EVOLUCOES, DB.LISTAS, DB.RELATORIOS].forEach((chave) =>
    localStorage.removeItem(chave)
  );

  alert('Dados apagados. As configurações da profissional foram mantidas.');
  showApp();
  renderConfiguracoes();
}

function bindConfigEvents() {
  on('#btn-salvar-config', 'click', salvarConfiguracoes);
  on('#btn-exportar-dados', 'click', exportarDados);
  on('#btn-importar-dados', 'click', () => $('#cfg-import-file')?.click());

  on('#cfg-import-file', 'change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importarDados(file);
    e.target.value = '';
  });

  on('#btn-limpar-dados', 'click', limparTodosDados);
}
// ===== 13. Listas de estímulos =====
const CATEGORIAS_LISTA = [
  'Palavras',
  'Sílabas',
  'Pseudopalavras',
  'Pares mínimos',
  'Frases',
  'Textos',
  'Figuras',
  'Outros',
];

const NIVEIS_LISTA = ['Fácil', 'Médio', 'Difícil'];

function getListas() {
  const brutas = read(DB.LISTAS);
  let alterado = false;

  const listas = brutas.map((l) => {
    const nova = { ...l };
    if (!Array.isArray(nova.itens)) { nova.itens = []; alterado = true; }
    if (!nova.categoria) { nova.categoria = 'Palavras'; alterado = true; }
    if (!nova.nivel) { nova.nivel = 'Fácil'; alterado = true; }
    if (nova.descricao === undefined) { nova.descricao = ''; alterado = true; }
    if (!nova.dataCriacao) { nova.dataCriacao = new Date().toISOString().slice(0, 10); alterado = true; }
    return nova;
  });

  if (alterado) write(DB.LISTAS, listas);
  return listas;
}

function popularFiltroListas() {
  const select = $('#lista-filtro-categoria');
  if (!select) return;

  const atual = select.value;
  const listas = getListas();
  const usadas = [...new Set(listas.map((l) => l.categoria).filter(Boolean))].sort();
  const opcoes = usadas.length ? usadas : CATEGORIAS_LISTA;

  select.innerHTML =
    '<option value="">Todas as categorias</option>' +
    opcoes.map((c) => `<option ${atual === c ? 'selected' : ''}>${c}</option>`).join('');
}

function renderListas() {
  const tbody = $('#listas-tbody');
  const empty = $('#listas-empty');
  if (!tbody) return;

  const busca = normalizarTexto($('#lista-search')?.value || '');
  const filtroCat = $('#lista-filtro-categoria')?.value || '';
  const filtroNivel = $('#lista-filtro-nivel')?.value || '';

  const filtradas = getListas()
    .filter((l) => {
      const itensTexto = normalizarTexto((l.itens || []).join(' '));
      const okBusca =
        !busca ||
        normalizarTexto(l.nome).includes(busca) ||
        normalizarTexto(l.descricao).includes(busca) ||
        itensTexto.includes(busca);
      const okCat = !filtroCat || l.categoria === filtroCat;
      const okNivel = !filtroNivel || l.nivel === filtroNivel;
      return okBusca && okCat && okNivel;
    })
    .sort((a, b) => normalizarTexto(a.nome).localeCompare(normalizarTexto(b.nome)));

  tbody.innerHTML = '';

  if (filtradas.length === 0) {
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  filtradas.forEach((l) => {
    const classeNivel =
      l.nivel === 'Fácil' ? 'status-concluido' : l.nivel === 'Difícil' ? 'status-dificuldade' : 'status-ajuda';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${l.nome || '—'}</strong></td>
      <td><span class="badge">${l.categoria || '—'}</span></td>
      <td><span class="badge ${classeNivel}">${l.nivel || '—'}</span></td>
      <td><strong>${(l.itens || []).length}</strong></td>
      <td class="cell-truncate">${l.descricao || '—'}</td>
      <td>
        <button class="btn-sm" onclick="viewLista('${l.id}')">Ver</button>
        <button class="btn-sm" onclick="editLista('${l.id}')">Editar</button>
        <button class="btn-sm danger" onclick="deleteLista('${l.id}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function listaFormHTML(lista = {}) {
  const catOptions = CATEGORIAS_LISTA.map((c) => {
    const selected = lista.categoria === c ? 'selected' : '';
    return `<option ${selected}>${c}</option>`;
  }).join('');

  const nivelOptions = NIVEIS_LISTA.map((n) => {
    const selected = lista.nivel === n ? 'selected' : '';
    return `<option ${selected}>${n}</option>`;
  }).join('');

  const itensTexto = (lista.itens || []).join('\n');

  return `
    <form id="lista-form" class="form-grid">
      <div class="form-group full">
        <label>Nome da lista</label>
        <input type="text" id="lt-nome" placeholder="Ex: Palavras com dígrafos CH" value="${lista.nome || ''}" required>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select id="lt-categoria" required>
          ${catOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Nível</label>
        <select id="lt-nivel" required>
          ${nivelOptions}
        </select>
      </div>
      <div class="form-group full">
        <label>Descrição (opcional)</label>
        <input type="text" id="lt-descricao" placeholder="Ex: Para treino de consciência fonológica" value="${lista.descricao || ''}">
      </div>
      <div class="form-group full">
        <label>Itens — um por linha</label>
        <textarea id="lt-itens" rows="9" placeholder="CHAVE&#10;CHUVA&#10;CHAPÉU&#10;MACHADO">${itensTexto}</textarea>
        <small style="color:var(--muted)">
          Cole a lista direto da planilha ou digite um item por linha.
          <span id="lt-contador">${(lista.itens || []).length} item(ns)</span>
        </small>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Salvar lista</button>
      </div>
    </form>`;
}

function contarItensLista() {
  const campo = $('#lt-itens');
  const contador = $('#lt-contador');
  if (!campo || !contador) return;

  const total = campo.value
    .split('\n')
    .map((i) => i.trim())
    .filter(Boolean).length;

  contador.textContent = `${total} item(ns)`;
}

function novaLista() {
  openModal('Nova lista', listaFormHTML());
  on('#lt-itens', 'input', contarItensLista);
  on('#lista-form', 'submit', (e) => {
    e.preventDefault();
    salvarLista(null);
  });
}

function editLista(id) {
  const lista = read(DB.LISTAS).find((l) => l.id === id);
  if (!lista) return;

  openModal('Editar lista', listaFormHTML(lista));
  on('#lt-itens', 'input', contarItensLista);
  on('#lista-form', 'submit', (e) => {
    e.preventDefault();
    salvarLista(id);
  });
}

function salvarLista(id) {
  const itens = $('#lt-itens')
    .value.split('\n')
    .map((i) => i.trim())
    .filter(Boolean);

  const dados = {
    nome: $('#lt-nome').value.trim(),
    categoria: $('#lt-categoria').value,
    nivel: $('#lt-nivel').value,
    descricao: $('#lt-descricao').value.trim(),
    itens,
  };

  const listas = getListas();

  if (id) {
    const idx = listas.findIndex((l) => l.id === id);
    if (idx >= 0) listas[idx] = { ...listas[idx], ...dados };
  } else {
    listas.push({
      id: uid(),
      dataCriacao: new Date().toISOString().slice(0, 10),
      ...dados,
    });
  }

  write(DB.LISTAS, listas);
  closeModal();
  popularFiltroListas();
  renderListas();
  renderDashboard();
}

function deleteLista(id) {
  if (!confirm('Excluir esta lista? Esta ação não pode ser desfeita.')) return;
  write(DB.LISTAS, read(DB.LISTAS).filter((l) => l.id !== id));
  popularFiltroListas();
  renderListas();
  renderDashboard();
}

function viewLista(id) {
  const lista = read(DB.LISTAS).find((l) => l.id === id);
  if (!lista) return;

  const itens = lista.itens || [];
  const itensHTML = itens.length
    ? itens.map((i) => `<span class="lista-chip">${i}</span>`).join('')
    : '<p style="color:var(--muted)">Nenhum item cadastrado.</p>';

  openModal(
    lista.nome,
    `
    <div class="ficha">
      <p><strong>Categoria:</strong> <span class="badge">${lista.categoria || '—'}</span> · <strong>Nível:</strong> <span class="badge">${lista.nivel || '—'}</span></p>
      <p><strong>Total de itens:</strong> ${itens.length}</p>
      ${lista.descricao ? `<p><strong>Descrição:</strong> ${lista.descricao}</p>` : ''}
    </div>
    <h4 style="margin:14px 0 8px">Itens</h4>
    <div class="lista-chips">${itensHTML}</div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="imprimirLista('${lista.id}')">🖨️ Imprimir</button>
      <button class="btn-outline" onclick="editLista('${lista.id}')">Editar</button>
      <button class="btn-outline" onclick="closeModal()">Fechar</button>
    </div>
  `
  );
}

function imprimirLista(id) {
  const lista = read(DB.LISTAS).find((l) => l.id === id);
  if (!lista) return;

  const win = window.open('', '_blank', 'width=900,height=760');
  if (!win) {
    alert('Permita pop-ups para imprimir a lista.');
    return;
  }

  const itens = (lista.itens || [])
    .map((i) => `<div class="item">${i}</div>`)
    .join('');

  win.document.write(`
    <html><head><meta charset="UTF-8"><title>${lista.nome}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 26px; }
      h1 { font-size: 16px; margin: 0 0 4px; }
      .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
      .grade { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .item { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 8px; text-align: center; font-size: 16px; font-weight: 600; }
      @page { margin: 14mm; }
    </style></head><body>
      <h1>${lista.nome}</h1>
      <div class="meta">${lista.categoria || ''} · Nível ${lista.nivel || ''} · ${(lista.itens || []).length} itens${lista.descricao ? ' · ' + lista.descricao : ''}</div>
      <div class="grade">${itens}</div>
    </body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function bindListasEvents() {
  on('#btn-nova-lista', 'click', novaLista);
  on('#lista-search', 'input', renderListas);
  on('#lista-filtro-categoria', 'change', renderListas);
  on('#lista-filtro-nivel', 'change', renderListas);
}

// ===== 14. Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
  bindAuthEvents();
  bindNav();
  bindSidebarToggle();
  bindPacientesEvents();
  bindPlanejamentosEvents();
  bindEvolucoesEvents();
  bindControleEvents();
  bindConfigEvents();
  bindListasEvents();


  Auth.current() ? showApp() : showAuth();
});