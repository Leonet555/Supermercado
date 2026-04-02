const DB_NAME = 'SupermercadoDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

function openUserDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function addUser(user) {
  return openUserDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add({
        email: user.email,
        password: user.password,
        name: user.name || ''
      });
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  });
}

function getUserByEmail(email) {
  return openUserDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(email);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function validateUser(email, password) {
  return getUserByEmail(email).then((user) => {
    if (!user) return false;
    return user.password === password;
  });
}
