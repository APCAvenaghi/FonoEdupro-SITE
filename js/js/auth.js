// ===== FonoEdu PRO — Autenticação =====

const Auth = {
  // Usuário demo pré-cadastrado
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
    if (!user) {
      return { ok: false, error: 'E-mail ou senha incorretos.' };
    }
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