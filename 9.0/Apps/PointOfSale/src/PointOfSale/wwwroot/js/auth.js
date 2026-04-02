const SITE_OWNER_EMAIL = 'adm@mercado.com';
const SITE_OWNER_PASSWORD = '12345678';

function isSiteOwnerCredentials(email, password) {
  return (
    String(email).trim().toLowerCase() === SITE_OWNER_EMAIL &&
    password === SITE_OWNER_PASSWORD
  );
}

/** Chamar após login ou registro bem-sucedido (define se é dono pela combinação e-mail/senha). */
function setLoginSession(email, password) {
  const emailNorm = String(email).trim();
  localStorage.setItem('loggedInUser', emailNorm);
  if (isSiteOwnerCredentials(emailNorm, password)) {
    localStorage.setItem('isSiteOwner', '1');
  } else {
    localStorage.removeItem('isSiteOwner');
  }
}

function clearLoginSession() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('isSiteOwner');
}

function isSiteOwnerSession() {
  return localStorage.getItem('isSiteOwner') === '1';
}
