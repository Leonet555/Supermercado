/**
 * Autenticação do Mercado — sessão em localStorage + lista de utilizadores.
 * Dono: adm@mercado.com / 12345678
 */
(function (global) {
  var OWNER_EMAIL = 'adm@mercado.com';
  var OWNER_PASSWORD = '12345678';
  var KEY_USERS = 'users';
  var KEY_SESSION = 'mercado_auth_session';

  function normalizeEmail(e) {
    return String(e || '').trim().toLowerCase();
  }

  function loadUsers() {
    try {
      var j = localStorage.getItem(KEY_USERS);
      return j ? JSON.parse(j) : [];
    } catch (err) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }

  function updateUserNameInStore(email, name) {
    var em = normalizeEmail(email);
    var trimmed = String(name || '').trim();
    if (!trimmed) return;
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (normalizeEmail(users[i].email) === em) {
        users[i].name = trimmed;
        saveUsers(users);
        return;
      }
    }
  }

  function isOwnerCredentials(email, password) {
    return normalizeEmail(email) === normalizeEmail(OWNER_EMAIL) && password === OWNER_PASSWORD;
  }

  function migrateLegacySession() {
    var legacyEmail = localStorage.getItem('loggedInUser');
    if (!legacyEmail) return null;
    var em = normalizeEmail(legacyEmail);
    var users = loadUsers();
    var u = null;
    for (var i = 0; i < users.length; i++) {
      if (normalizeEmail(users[i].email) === em) {
        u = users[i];
        break;
      }
    }
    var isOwner = localStorage.getItem('isSiteOwner') === '1';
    var session = { email: em, name: u && u.name ? u.name : '', isOwner: isOwner };
    setSession(session);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isSiteOwner');
    return session;
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(KEY_SESSION);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.email) return s;
      }
    } catch (e) {}
    return migrateLegacySession();
  }

  function setSession(session) {
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(KEY_SESSION);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isSiteOwner');
  }

  /**
   * @param {string} [optionalName] — se preenchido, atualiza o nome na sessão (e na lista local, para utilizadores normais).
   * @returns {{ ok: boolean, message?: string }}
   */
  function attemptLogin(email, password, optionalName) {
    var em = normalizeEmail(email);
    var pw = String(password);
    var nameInput = String(optionalName || '').trim();
    if (!em || !pw) {
      return { ok: false, message: 'Preencha e-mail e senha.' };
    }
    if (isOwnerCredentials(em, pw)) {
      setSession({
        email: em,
        name: nameInput || 'Administrador',
        isOwner: true
      });
      return { ok: true };
    }
    var users = loadUsers();
    var user = null;
    for (var j = 0; j < users.length; j++) {
      if (normalizeEmail(users[j].email) === em && users[j].password === pw) {
        user = users[j];
        break;
      }
    }
    if (!user) {
      return { ok: false, message: 'E-mail ou senha incorretos.' };
    }
    var displayName = nameInput || user.name || '';
    if (nameInput) {
      updateUserNameInStore(em, nameInput);
    }
    setSession({
      email: em,
      name: displayName,
      isOwner: false
    });
    return { ok: true };
  }

  function logout() {
    clearSession();
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function requireAuth(redirectUrl) {
    if (!getSession()) {
      window.location.href = redirectUrl || 'index.html';
    }
  }

  function redirectIfAuthed(targetUrl) {
    if (getSession()) {
      window.location.href = targetUrl || 'mercado.html';
    }
  }

  function isSiteOwnerSession() {
    var s = getSession();
    return !!(s && s.isOwner);
  }

  function getUserLabel() {
    var s = getSession();
    if (!s) return '';
    if (s.isOwner) return '👑 Dono do site';
    if (s.name) return 'Olá, ' + s.name + '!';
    return 'Olá, ' + s.email + '!';
  }

  function userExistsLocal(email) {
    var em = normalizeEmail(email);
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (normalizeEmail(users[i].email) === em) return true;
    }
    return false;
  }

  function addUserLocal(user) {
    var users = loadUsers();
    users.push({
      name: user.name || '',
      email: normalizeEmail(user.email),
      password: user.password
    });
    saveUsers(users);
  }

  function setSessionAfterRegister(name, email, password) {
    var em = normalizeEmail(email);
    setSession({
      email: em,
      name: name || '',
      isOwner: isOwnerCredentials(em, password)
    });
  }

  global.Auth = {
    attemptLogin: attemptLogin,
    logout: logout,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    requireAuth: requireAuth,
    redirectIfAuthed: redirectIfAuthed,
    isSiteOwnerSession: isSiteOwnerSession,
    getUserLabel: getUserLabel,
    userExistsLocal: userExistsLocal,
    addUserLocal: addUserLocal,
    setSessionAfterRegister: setSessionAfterRegister,
    normalizeEmail: normalizeEmail,
    isOwnerCredentials: isOwnerCredentials
  };
})(window);
