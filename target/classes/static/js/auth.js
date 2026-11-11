/**
 * Auth: session management using sessionStorage. Stores the logged-in user
 * (id, username, role) plus the raw credentials for basic-auth on API calls.
 * No token is involved (per requirements).
 */
const Auth = (function () {
    const SESSION_KEY = 'im_session';
    const CREDS_KEY = 'im_creds';

    function getSession() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function getCredentials() {
        const raw = sessionStorage.getItem(CREDS_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function isLoggedIn() {
        return getSession() !== null;
    }

    /** Persist session after a successful login or register. */
    function setSession(user, creds) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        sessionStorage.setItem(CREDS_KEY, JSON.stringify(creds));
    }

    function clear() {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(CREDS_KEY);
    }

    /** Login: POST /api/users/login, store session on success. */
    async function login(username, password) {
        const result = await Api.post('/api/users/login', { username, password });
        // result = { message, user: { id, username, role } }
        setSession(result.user, { username, password });
        return result.user;
    }

    /** Register: create the account only; the user must log in explicitly. */
    async function register(username, password, role) {
        return Api.post('/api/users/register', { username, password, role });
    }

    function logout() {
        clear();
    }

    return {
        getSession,
        getCredentials,
        isLoggedIn,
        login,
        register,
        logout,
    };
})();
