/**
 * Login & Registration — premium split-panel auth page.
 * Left: gradient visual with brand messaging. Right: clean form card.
 */
const LoginPage = (function () {

    function render(initialTab = 'login') {
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="auth-page fade-in">
                <!-- Left: visual panel -->
                <div class="auth-visual">
                    <div class="auth-visual-content">
                        <div class="brand-row">
                            <span class="brand-icon">R</span>
                            <span style="font-size: 20px; font-weight: 800;">Resolve</span>
                        </div>
                        <h1>Incident management,<br>reimagined.</h1>
                        <p>Track incidents, get AI-powered recommendations from similar past incidents, and resolve issues faster than ever.</p>
                        <div class="auth-features">
                            <div class="auth-feature">
                                <span class="check">&#10003;</span>
                                Full incident lifecycle from New to Closed
                            </div>
                            <div class="auth-feature">
                                <span class="check">&#10003;</span>
                                Smart recommendations from resolved incidents
                            </div>
                            <div class="auth-feature">
                                <span class="check">&#10003;</span>
                                Real-time dashboard analytics & insights
                            </div>
                            <div class="auth-feature">
                                <span class="check">&#10003;</span>
                                Role-based access for users & engineers
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: form panel -->
                <div class="auth-form-side">
                    <div class="auth-card">
                        <h2 id="auth-heading">Welcome back</h2>
                        <p class="auth-subtitle" id="auth-sub">Sign in to your account to continue</p>

                        <div class="auth-tabs">
                            <button class="auth-tab ${initialTab === 'login' ? 'active' : ''}" id="tab-login" type="button">Log in</button>
                            <button class="auth-tab ${initialTab === 'register' ? 'active' : ''}" id="tab-register" type="button">Create account</button>
                        </div>

                        <div id="auth-alert" class="alert alert-error hidden" role="alert"></div>

                        <!-- Login form -->
                        <form id="login-form" class="${initialTab === 'login' ? '' : 'hidden'}">
                            <div class="form-group">
                                <label for="login-username">Username</label>
                                <input type="text" id="login-username" autocomplete="username" placeholder="Enter your username" required>
                                <div class="field-error" id="login-username-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" autocomplete="current-password" placeholder="Enter your password" required>
                                <div class="field-error" id="login-password-error"></div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-submit" style="margin-top: var(--sp-2);">Sign in</button>
                        </form>

                        <!-- Register form -->
                        <form id="register-form" class="${initialTab === 'register' ? '' : 'hidden'}">
                            <div class="form-group">
                                <label for="reg-username">Username</label>
                                <input type="text" id="reg-username" autocomplete="username" placeholder="3-50 characters" required>
                                <div class="field-error" id="reg-username-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="reg-password">Password</label>
                                <input type="password" id="reg-password" autocomplete="new-password" placeholder="6-100 characters" required>
                                <div class="field-error" id="reg-password-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="reg-role">Role</label>
                                <select id="reg-role" required>
                                    <option value="USER">User</option>
                                    <option value="ENGINEER">Engineer</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <div class="field-error" id="reg-role-error"></div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block btn-lg" id="register-submit" style="margin-top: var(--sp-2);">Create account</button>
                        </form>

                        <p class="auth-switch-hint" id="auth-switch-hint"></p>
                    </div>
                </div>
            </div>
        `;
        bindEvents();
        switchTab(initialTab, false);

        // Show registration success message
        const regSuccess = sessionStorage.getItem('im_registration_success');
        if (regSuccess && initialTab === 'login') {
            sessionStorage.removeItem('im_registration_success');
            document.getElementById('login-username').value = regSuccess;
            showAlert('Account created successfully. Please sign in.', true);
        }
    }

    function bindEvents() {
        document.getElementById('tab-login').addEventListener('click', () => switchTab('login', true));
        document.getElementById('tab-register').addEventListener('click', () => switchTab('register', true));
        document.getElementById('login-form').addEventListener('submit', onLogin);
        document.getElementById('register-form').addEventListener('submit', onRegister);

        ['login-username', 'login-password'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => clearFieldError(id));
        });
        ['reg-username', 'reg-password', 'reg-role'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('input', () => clearFieldError(id));
            el.addEventListener('change', () => clearFieldError(id));
        });
    }

    function switchTab(tab, navigate = false) {
        if (navigate && location.hash !== '#/' + tab) {
            location.hash = '#/' + tab;
            return;
        }
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
        document.getElementById('auth-heading').textContent = tab === 'login' ? 'Welcome back' : 'Create your account';
        document.getElementById('auth-sub').textContent = tab === 'login' ? 'Sign in to your account to continue' : 'Start managing incidents in minutes';
        document.getElementById('auth-switch-hint').innerHTML = tab === 'login'
            ? 'Don\'t have an account? <button type="button" id="switch-to-register">Create one</button>'
            : 'Already have an account? <button type="button" id="switch-to-login">Sign in</button>';
        const sw = document.getElementById(tab === 'login' ? 'switch-to-register' : 'switch-to-login');
        if (sw) sw.addEventListener('click', () => switchTab(tab === 'login' ? 'register' : 'login', true));
        hideAlert();
        clearAllFieldErrors();
    }

    async function onLogin(e) {
        e.preventDefault();
        hideAlert();
        clearAllFieldErrors();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        let valid = true;
        if (!username) { setFieldError('login-username', 'Username is required'); valid = false; }
        if (!password) { setFieldError('login-password', 'Password is required'); valid = false; }
        if (!valid) return;

        const btn = document.getElementById('login-submit');
        btn.disabled = true; btn.textContent = 'Signing in...';
        try {
            await Auth.login(username, password);
            location.hash = '#/dashboard';
        } catch (err) {
            handleAuthError(err, 'login');
        } finally {
            btn.disabled = false; btn.textContent = 'Sign in';
        }
    }

    async function onRegister(e) {
        e.preventDefault();
        hideAlert();
        clearAllFieldErrors();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        let valid = true;
        if (!username) { setFieldError('reg-username', 'Username is required'); valid = false; }
        else if (username.length < 3 || username.length > 50) { setFieldError('reg-username', 'Username must be 3-50 characters'); valid = false; }
        if (!password) { setFieldError('reg-password', 'Password is required'); valid = false; }
        else if (password.length < 6 || password.length > 100) { setFieldError('reg-password', 'Password must be 6-100 characters'); valid = false; }
        if (!valid) return;

        const btn = document.getElementById('register-submit');
        btn.disabled = true; btn.textContent = 'Creating account...';
        try {
            await Auth.register(username, password, role);
            sessionStorage.setItem('im_registration_success', username);
            location.hash = '#/login';
        } catch (err) {
            handleAuthError(err, 'register');
        } finally {
            btn.disabled = false; btn.textContent = 'Create account';
        }
    }

    function handleAuthError(err, prefix) {
        if (err.status === 401) { showAlert(err.message || 'Invalid username or password'); return; }
        if (err.status === 409) { showAlert(err.message || 'Username already exists'); return; }
        if (err.status === 400 && err.errors) {
            Object.entries(err.errors).forEach(([field, msg]) => {
                const id = prefix === 'register' ? 'reg-' + field : prefix + '-' + field;
                setFieldError(id, msg);
            });
            return;
        }
        showAlert(err.message || 'Something went wrong. Please try again.');
    }

    function showAlert(message, success = false) {
        const el = document.getElementById('auth-alert');
        el.textContent = message;
        el.classList.toggle('alert-success', success);
        el.classList.toggle('alert-error', !success);
        el.classList.remove('hidden');
    }

    function hideAlert() {
        const el = document.getElementById('auth-alert');
        el.classList.add('hidden');
        el.classList.remove('alert-success', 'alert-error');
        el.textContent = '';
    }

    function setFieldError(id, message) {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(id + '-error');
        if (input) input.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function clearFieldError(id) {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(id + '-error');
        if (input) input.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    }

    function clearAllFieldErrors() {
        ['login-username', 'login-password', 'reg-username', 'reg-password', 'reg-role'].forEach(clearFieldError);
    }

    return { render };
})();
