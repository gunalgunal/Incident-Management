/**
 * API client: thin fetch wrapper that talks to the Spring Boot backend.
 * Parses error responses into a consistent shape:
 *   { status, message, errors: { field: msg } }
 */
const Api = (function () {
    const BASE = '';

    async function request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body !== undefined) opts.body = JSON.stringify(body);
        // Attach basic-auth credentials if we have a stored session.
        const creds = Auth.getCredentials();
        if (creds) {
            opts.headers['Authorization'] = 'Basic ' + btoa(creds.username + ':' + creds.password);
        }

        let resp;
        try {
            resp = await fetch(BASE + path, opts);
        } catch (e) {
            throw { status: 0, message: 'Network error: unable to reach server', errors: {} };
        }

        const text = await resp.text();
        let data = null;
        if (text) {
            try { data = JSON.parse(text); } catch (_) { data = { message: text }; }
        }

        if (!resp.ok) {
            const err = {
                status: resp.status,
                message: (data && data.message) || resp.statusText || 'Request failed',
                errors: (data && data.errors) || {},
            };
            throw err;
        }
        return data;
    }

    return {
        get: (p) => request('GET', p),
        post: (p, body) => request('POST', p, body),
        patch: (p, body) => request('PATCH', p, body),
    };
})();
