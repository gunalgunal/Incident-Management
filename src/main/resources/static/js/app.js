/**
 * Resolve — Login & Registration Page (Vanilla JS, no build tools)
 *
 * 3.1 Login & Registration (#/login, #/register)
 *   - Two tabs: Login / Register
 *   - Login: username + password → POST /api/users/login → store session → redirect #/dashboard
 *   - Register: username (3-50), password (6-100), role dropdown → POST /api/users/register
 *   - Inline errors: 401 (invalid creds), 409 (user exists), 400 (field validation from errors map)
 */

(function () {
    'use strict';

    // ===================== Session Storage =====================
    var SESSION_KEY = 'im_session';

    function saveSession(user, username, password) {
        var session = {
            user: user,
            username: username,
            credentials: btoa(username + ':' + password)
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    function getSession() {
        var raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }

    function isLoggedIn() { return getSession() !== null; }

    function logout() { sessionStorage.removeItem(SESSION_KEY); }

    // ===================== API Client =====================
    function apiRequest(method, path, body) {
        var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
        if (body !== undefined) opts.body = JSON.stringify(body);

        return fetch(path, opts).then(function (res) {
            return res.text().then(function (text) {
                var data = null;
                if (text) {
                    try { data = JSON.parse(text); } catch (e) { /* non-JSON */ }
                }
                if (!res.ok) {
                    var err = new Error((data && data.message) || res.statusText || 'Request failed');
                    err.status = res.status;
                    err.errors = (data && data.errors) ? data.errors : null;
                    throw err;
                }
                return data;
            });
        });
    }

    // ===================== Router =====================
    function currentPath() {
        var hash = location.hash.replace(/^#/, '');
        return hash || '/login';
    }

    function navigate(path) { location.hash = '#' + path; }

    function resolveRoute(path) {
        // Handle /incidents/:id and /incidents/new
        if (path.indexOf('/incidents/') === 0) {
            if (!isLoggedIn()) return '/login';
            return path;
        }
        if (PROTECTED.indexOf(path) !== -1 && !isLoggedIn()) return '/login';
        if ((path === '/login' || path === '/register') && isLoggedIn()) return '/dashboard';
        if (ALL_ROUTES.indexOf(path) === -1) return isLoggedIn() ? '/dashboard' : '/login';
        return path;
    }

    var PROTECTED = ['/dashboard', '/incidents', '/engineer'];
    var ALL_ROUTES = ['/login', '/register', '/dashboard', '/incidents', '/incidents/new', '/engineer'];

    // ===================== Icons (SVG strings) =====================
    var ICONS = {
        errorCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        successCheck: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        logout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        alertTriangle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        checkCircle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        arrowLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        tag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
        user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        lightbulb: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
        check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        checkSmall: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
    };

    // ===================== Auth Page =====================
    function renderAuthPage(initialTab) {
        var root = document.getElementById('root');
        root.innerHTML = `
            <div class="auth-page">
                <!-- Left: Visual Panel -->
                <div class="auth-visual">
                    <div class="auth-brand">
                        <div class="auth-brand-icon">R</div>
                        <div class="auth-brand-name">Resolve</div>
                    </div>
                    <div class="auth-hero">
                        <h1>Incident management,<br>reimagined.</h1>
                        <p>Track incidents, get AI-powered recommendations from similar past incidents, and resolve issues faster than ever.</p>
                        <ul class="auth-features">
                            <li class="auth-feature"><span class="auth-feature-check">&#10003;</span> Full incident lifecycle from New to Closed</li>
                            <li class="auth-feature"><span class="auth-feature-check">&#10003;</span> Smart recommendations from resolved incidents</li>
                            <li class="auth-feature"><span class="auth-feature-check">&#10003;</span> Real-time dashboard analytics & insights</li>
                            <li class="auth-feature"><span class="auth-feature-check">&#10003;</span> Role-based access for users & engineers</li>
                        </ul>
                    </div>
                    <div class="auth-footer">&copy; 2026 Resolve Inc. All rights reserved.</div>
                </div>

                <!-- Right: Form Panel -->
                <div class="auth-form-side">
                    <div class="auth-card">
                        <div class="auth-card-header">
                            <h2 id="auth-heading">Welcome back</h2>
                            <p id="auth-subtitle">Sign in to your Resolve account to continue.</p>
                        </div>

                        <div class="auth-tabs">
                            <button class="auth-tab ${initialTab === 'login' ? 'active' : ''}" id="tab-login" type="button">Log in</button>
                            <button class="auth-tab ${initialTab === 'register' ? 'active' : ''}" id="tab-register" type="button">Create account</button>
                        </div>

                        <div id="auth-alert" class="alert alert-error hidden"></div>

                        <!-- Login Form -->
                        <form id="login-form" class="${initialTab === 'login' ? '' : 'hidden'}">
                            <div class="form-group">
                                <label for="login-username">Username</label>
                                <input type="text" id="login-username" class="form-input" placeholder="Enter your username" autocomplete="username">
                                <div class="field-error" id="login-username-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" class="form-input" placeholder="Enter your password" autocomplete="current-password">
                                <div class="field-error" id="login-password-error"></div>
                            </div>
                            <button type="submit" class="btn-primary" id="login-submit">Sign in</button>
                        </form>

                        <!-- Register Form -->
                        <form id="register-form" class="${initialTab === 'register' ? '' : 'hidden'}">
                            <div class="form-group">
                                <div class="label-row">
                                    <label for="reg-username">Username</label>
                                    <span class="field-hint">3–50 characters</span>
                                </div>
                                <input type="text" id="reg-username" class="form-input" placeholder="Choose a username" autocomplete="username">
                                <div class="field-error" id="reg-username-error"></div>
                            </div>
                            <div class="form-group">
                                <div class="label-row">
                                    <label for="reg-password">Password</label>
                                    <span class="field-hint">6–100 characters</span>
                                </div>
                                <input type="password" id="reg-password" class="form-input" placeholder="Create a password" autocomplete="new-password">
                                <div class="field-error" id="reg-password-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="reg-role">Role</label>
                                <select id="reg-role" class="form-select">
                                    <option value="USER">User</option>
                                    <option value="ENGINEER">Engineer</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <div class="field-error" id="reg-role-error"></div>
                            </div>
                            <button type="submit" class="btn-primary" id="register-submit">Create account</button>
                        </form>

                        <p class="switch-hint" id="switch-hint"></p>
                    </div>
                </div>
            </div>
        `;
        bindAuthEvents(initialTab);
    }

    function bindAuthEvents(initialTab) {
        var tab = initialTab;

        document.getElementById('tab-login').addEventListener('click', function () { switchTab('login'); });
        document.getElementById('tab-register').addEventListener('click', function () { switchTab('register'); });
        document.getElementById('login-form').addEventListener('submit', function (e) { e.preventDefault(); handleLogin(); });
        document.getElementById('register-form').addEventListener('submit', function (e) { e.preventDefault(); handleRegister(); });

        // Clear field errors on input
        ['login-username', 'login-password'].forEach(function (id) {
            document.getElementById(id).addEventListener('input', function () { clearFieldError(id); });
        });
        ['reg-username', 'reg-password', 'reg-role'].forEach(function (id) {
            var el = document.getElementById(id);
            el.addEventListener('input', function () { clearFieldError(id); });
            el.addEventListener('change', function () { clearFieldError(id); });
        });

        // Show registration success message if coming back from register
        var regSuccess = sessionStorage.getItem('im_reg_success');
        if (regSuccess && initialTab === 'login') {
            sessionStorage.removeItem('im_reg_success');
            document.getElementById('login-username').value = regSuccess;
            showAlert('success', 'Account created successfully! Please sign in to continue.');
        }

        updateSwitchHint(tab);
    }

    function switchTab(newTab) {
        var current = location.hash.replace(/^#/, '') === '/register' ? 'register' : 'login';
        if (newTab === current) return;
        navigate(newTab === 'register' ? '/register' : '/login');
    }

    function updateTabUI(tab) {
        document.querySelectorAll('.auth-tab').forEach(function (t) { t.classList.remove('active'); });
        var tabBtn = document.getElementById('tab-' + tab);
        if (tabBtn) tabBtn.classList.add('active');

        document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');

        document.getElementById('auth-heading').textContent = tab === 'login' ? 'Welcome back' : 'Create your account';
        document.getElementById('auth-subtitle').textContent = tab === 'login'
            ? 'Sign in to your Resolve account to continue.'
            : 'Start managing incidents in just a few minutes.';

        updateSwitchHint(tab);
        hideAlert();
        clearAllFieldErrors();
    }

    function updateSwitchHint(tab) {
        var hint = document.getElementById('switch-hint');
        if (tab === 'login') {
            hint.innerHTML = 'Don\'t have an account? <button type="button" id="switch-to-register">Create one</button>';
            document.getElementById('switch-to-register').addEventListener('click', function () { switchTab('register'); });
        } else {
            hint.innerHTML = 'Already have an account? <button type="button" id="switch-to-login">Sign in</button>';
            document.getElementById('switch-to-login').addEventListener('click', function () { switchTab('login'); });
        }
    }

    // ===================== Login Handler =====================
    function handleLogin() {
        hideAlert();
        clearAllFieldErrors();

        var username = document.getElementById('login-username').value.trim();
        var password = document.getElementById('login-password').value;
        var valid = true;
        if (!username) { setFieldError('login-username', 'Username is required'); valid = false; }
        if (!password) { setFieldError('login-password', 'Password is required'); valid = false; }
        if (!valid) return;

        var btn = document.getElementById('login-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Signing in...';

        apiRequest('POST', '/api/users/login', { username: username, password: password })
            .then(function (data) {
                saveSession(data.user, username, password);
                navigate('/dashboard');
            })
            .catch(function (err) {
                if (err.status === 401) {
                    showAlert('error', err.message || 'Invalid username or password.');
                } else if (err.status === 400 && err.errors) {
                    showFieldErrors(err.errors, 'login');
                } else {
                    showAlert('error', err.message || 'An unexpected error occurred.');
                }
            })
            .finally(function () {
                btn.disabled = false;
                btn.textContent = 'Sign in';
            });
    }

    // ===================== Register Handler =====================
    function handleRegister() {
        hideAlert();
        clearAllFieldErrors();

        var username = document.getElementById('reg-username').value.trim();
        var password = document.getElementById('reg-password').value;
        var role = document.getElementById('reg-role').value;
        var valid = true;
        if (!username) { setFieldError('reg-username', 'Username is required'); valid = false; }
        else if (username.length < 3 || username.length > 50) { setFieldError('reg-username', 'Username must be between 3 and 50 characters'); valid = false; }
        if (!password) { setFieldError('reg-password', 'Password is required'); valid = false; }
        else if (password.length < 6 || password.length > 100) { setFieldError('reg-password', 'Password must be between 6 and 100 characters'); valid = false; }
        if (!valid) return;

        var btn = document.getElementById('register-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creating account...';

        apiRequest('POST', '/api/users/register', { username: username, password: password, role: role })
            .then(function () {
                // Registration success → redirect to login (no auto-login)
                showAlert('success', 'Account created successfully! Please sign in to continue.');
                sessionStorage.setItem('im_reg_success', username);
                setTimeout(function () { navigate('/login'); }, 1200);
            })
            .catch(function (err) {
                if (err.status === 409) {
                    showAlert('error', err.message || 'Username already exists.');
                } else if (err.status === 400 && err.errors) {
                    showFieldErrors(err.errors, 'reg');
                } else {
                    showAlert('error', err.message || 'An unexpected error occurred.');
                }
            })
            .finally(function () {
                btn.disabled = false;
                btn.textContent = 'Create account';
            });
    }

    // ===================== Alert & Field Errors =====================
    function showAlert(type, message) {
        var el = document.getElementById('auth-alert');
        el.className = 'alert alert-' + type;
        el.innerHTML = (type === 'error' ? ICONS.errorCircle : ICONS.successCheck) + '<span>' + escapeHtml(message) + '</span>';
    }

    function hideAlert() {
        var el = document.getElementById('auth-alert');
        el.className = 'alert alert-error hidden';
        el.innerHTML = '';
    }

    function setFieldError(id, message) {
        var input = document.getElementById(id);
        var errorEl = document.getElementById(id + '-error');
        if (input) input.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function clearFieldError(id) {
        var input = document.getElementById(id);
        var errorEl = document.getElementById(id + '-error');
        if (input) input.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    }

    function clearAllFieldErrors() {
        ['login-username', 'login-password', 'reg-username', 'reg-password', 'reg-role'].forEach(clearFieldError);
    }

    function showFieldErrors(errors, prefix) {
        Object.keys(errors).forEach(function (field) {
            var id = prefix === 'reg' ? 'reg-' + field : 'login-' + field;
            setFieldError(id, errors[field]);
        });
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '"');
    }

    // ===================== Topbar =====================
    function renderTopbar(activeRoute) {
        var session = getSession();
        if (!session) return '';
        var username = (session.user && session.user.username) || 'User';
        var role = (session.user && session.user.role) || 'USER';
        var initial = username.charAt(0).toUpperCase();

        var navItems = [
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/incidents', label: 'Incidents' }
        ];
        if (role === 'ENGINEER' || role === 'ADMIN') {
            navItems.push({ path: '/engineer', label: 'My Queue' });
        }

        var navHtml = navItems.map(function (item) {
            return '<a href="#' + item.path + '" class="topbar-nav-item ' + (item.path === activeRoute ? 'active' : '') + '">' + item.label + '</a>';
        }).join('');

        return `
            <header class="topbar">
                <div class="topbar-brand">
                    <div class="topbar-brand-icon">R</div>
                    <span>Resolve</span>
                </div>
                <nav class="topbar-nav">${navHtml}</nav>
                <div class="topbar-right">
                    <div class="topbar-user">
                        <div class="topbar-avatar">${escapeHtml(initial)}</div>
                        <span class="topbar-username">${escapeHtml(username)}</span>
                        <span class="topbar-role-badge">${escapeHtml(role)}</span>
                    </div>
                    <button class="btn-logout" id="btn-logout">
                        ${ICONS.logout}
                        <span class="logout-label">Logout</span>
                    </button>
                </div>
            </header>
        `;
    }

    function bindTopbarLogout() {
        var btn = document.getElementById('btn-logout');
        if (btn) {
            btn.addEventListener('click', function () {
                logout();
                navigate('/login');
            });
        }
    }

    // ===================== Dashboard =====================
    function renderDashboard() {
        var root = document.getElementById('root');
        root.innerHTML = renderTopbar('/dashboard') + `
            <div class="dash-page">
                <div class="dash-container">
                    <div class="dash-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Overview of incidents across your organization</p>
                        </div>
                        <button class="btn-refresh" id="btn-refresh">
                            ${ICONS.refresh}
                            <span>Refresh</span>
                        </button>
                    </div>
                    <div id="dash-error" class="dash-error hidden"></div>
                    <div id="dash-content">
                        <div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>
                    </div>
                </div>
            </div>
        `;
        bindTopbarLogout();
        document.getElementById('btn-refresh').addEventListener('click', loadDashboard);
        loadDashboard();
    }

    function loadDashboard() {
        var btn = document.getElementById('btn-refresh');
        var errorEl = document.getElementById('dash-error');
        var content = document.getElementById('dash-content');
        errorEl.classList.add('hidden');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span><span>Refreshing...</span>';
        content.innerHTML = '<div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>';

        // Fetch all four endpoints in parallel
        Promise.all([
            apiRequest('GET', '/api/dashboard/summary'),
            apiRequest('GET', '/api/dashboard/counts/by-category'),
            apiRequest('GET', '/api/dashboard/counts/by-status'),
            apiRequest('GET', '/api/dashboard/counts/by-priority')
        ]).then(function (results) {
            renderDashboardContent(results[0], results[1], results[2], results[3]);
        }).catch(function (err) {
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = ICONS.errorCircle + '<span>' + escapeHtml(err.message || 'Failed to load dashboard data') + '</span>';
            content.innerHTML = '';
        }).finally(function () {
            btn.disabled = false;
            btn.innerHTML = ICONS.refresh + '<span>Refresh</span>';
        });
    }

    function renderDashboardContent(summary, byCategory, byStatus, byPriority) {
        var content = document.getElementById('dash-content');

        var totalAll = (summary.totalOpen || 0) + (summary.totalResolved || 0);

        content.innerHTML = `
            <!-- Summary Cards -->
            <div class="dash-summary">
                <div class="summary-card">
                    <div class="summary-card-icon open">
                        ${ICONS.alertTriangle}
                    </div>
                    <div class="summary-card-info">
                        <div class="summary-card-label">Total Open</div>
                        <div class="summary-card-value">${summary.totalOpen || 0}</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-icon resolved">
                        ${ICONS.checkCircle}
                    </div>
                    <div class="summary-card-info">
                        <div class="summary-card-label">Total Resolved</div>
                        <div class="summary-card-value">${summary.totalResolved || 0}</div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="dash-charts">
                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">By Status</div>
                    </div>
                    <div class="chart-card-body">
                        ${renderBarChart(byStatus, 'status')}
                    </div>
                </div>
                <div class="chart-card">
                    <div class="chart-card-header">
                        <div class="chart-card-title">By Priority</div>
                    </div>
                    <div class="chart-card-body">
                        ${renderBarChart(byPriority, 'priority')}
                    </div>
                </div>
                <div class="chart-card full-width">
                    <div class="chart-card-header">
                        <div class="chart-card-title">By Category</div>
                    </div>
                    <div class="chart-card-body">
                        ${renderBarChart(byCategory, 'category')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderBarChart(items, type) {
        if (!items || items.length === 0) {
            return '<div class="empty-state">No data available</div>';
        }
        var maxVal = 0;
        items.forEach(function (item) {
            if (item.count > maxVal) maxVal = item.count;
        });
        if (maxVal === 0) maxVal = 1;

        return '<div class="bar-chart">' + items.map(function (item, idx) {
            var pct = Math.round((item.count / maxVal) * 100);
            var fillClass = getBarFillClass(item.label, type, idx);
            var label = formatLabel(item.label);
            return `
                <div class="bar-chart-row">
                    <div class="bar-chart-label">${escapeHtml(label)}</div>
                    <div class="bar-chart-track">
                        <div class="bar-chart-fill ${fillClass}" style="width: ${pct}%"></div>
                    </div>
                    <div class="bar-chart-value">${item.count}</div>
                </div>
            `;
        }).join('') + '</div>';
    }

    function getBarFillClass(label, type, idx) {
        if (type === 'status') return 'bar-fill-' + label;
        if (type === 'priority') return 'bar-fill-' + label;
        if (type === 'category') return 'bar-fill-cat-' + (idx % 8);
        return '';
    }

    function formatLabel(label) {
        return String(label).replace(/_/g, ' ').toLowerCase();
    }

    // ===================== Incident List =====================
    var incState = { sortKey: 'id', sortDir: 'desc', filterStatus: '', filterPriority: '', filterCategory: '', searchText: '', incidents: [], categories: [] };

    function renderIncidentList() {
        var root = document.getElementById('root');
        root.innerHTML = renderTopbar('/incidents') + `
            <div class="dash-page">
                <div class="dash-container">
                    <div class="dash-header">
                        <div>
                            <h1>Incidents</h1>
                            <p>Manage and track all reported incidents</p>
                        </div>
                        <button class="btn-report" id="btn-report">
                            ${ICONS.plus}
                            Report Incident
                        </button>
                    </div>
                    <div id="inc-error" class="dash-error hidden"></div>
                    <div id="inc-content">
                        <div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>
                    </div>
                </div>
            </div>
        `;
        bindTopbarLogout();
        document.getElementById('btn-report').addEventListener('click', function () { navigate('/incidents/new'); });
        loadIncidents();
    }

    function loadIncidents() {
        var errorEl = document.getElementById('inc-error');
        var content = document.getElementById('inc-content');
        errorEl.classList.add('hidden');
        content.innerHTML = '<div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>';

        apiRequest('GET', '/api/incidents').then(function (data) {
            incState.incidents = data || [];
            // Extract unique categories for filter dropdown + datalist
            var catSet = {};
            incState.incidents.forEach(function (i) { catSet[i.category] = true; });
            incState.categories = Object.keys(catSet).sort();
            renderIncidentTable();
        }).catch(function (err) {
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = ICONS.errorCircle + '<span>' + escapeHtml(err.message || 'Failed to load incidents') + '</span>';
            content.innerHTML = '';
        });
    }

    function renderIncidentTable() {
        var content = document.getElementById('inc-content');
        var filtered = applyIncFilters();

        content.innerHTML = `
            <div class="inc-toolbar">
                <div class="inc-search">
                    ${ICONS.search}
                    <input type="text" id="inc-search-input" placeholder="Search by title..." value="${escapeAttr(incState.searchText)}">
                </div>
                <div class="inc-filter">
                    <select id="inc-filter-status">
                        <option value="">All Statuses</option>
                        <option value="NEW" ${incState.filterStatus === 'NEW' ? 'selected' : ''}>New</option>
                        <option value="ASSIGNED" ${incState.filterStatus === 'ASSIGNED' ? 'selected' : ''}>Assigned</option>
                        <option value="IN_PROGRESS" ${incState.filterStatus === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                        <option value="RESOLVED" ${incState.filterStatus === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                        <option value="CLOSED" ${incState.filterStatus === 'CLOSED' ? 'selected' : ''}>Closed</option>
                    </select>
                </div>
                <div class="inc-filter">
                    <select id="inc-filter-priority">
                        <option value="">All Priorities</option>
                        <option value="LOW" ${incState.filterPriority === 'LOW' ? 'selected' : ''}>Low</option>
                        <option value="MEDIUM" ${incState.filterPriority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
                        <option value="HIGH" ${incState.filterPriority === 'HIGH' ? 'selected' : ''}>High</option>
                        <option value="CRITICAL" ${incState.filterPriority === 'CRITICAL' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
                <div class="inc-filter">
                    <select id="inc-filter-category">
                        <option value="">All Categories</option>
                        ${incState.categories.map(function (c) {
                            return '<option value="' + escapeAttr(c) + '"' + (incState.filterCategory === c ? ' selected' : '') + '>' + escapeHtml(c) + '</option>';
                        }).join('')}
                    </select>
                </div>
            </div>
            <div class="inc-table-wrap">
                <div class="inc-table-scroll">
                    <table class="inc-table">
                        <thead>
                            <tr>
                                <th data-sort="id" class="${incState.sortKey === 'id' ? 'sorted' : ''}">ID <span class="sort-arrow">${incState.sortKey === 'id' ? (incState.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>
                                <th data-sort="title">Title <span class="sort-arrow">${incState.sortKey === 'title' ? (incState.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>
                                <th data-sort="category">Category <span class="sort-arrow">${incState.sortKey === 'category' ? (incState.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>
                                <th data-sort="priority" class="${incState.sortKey === 'priority' ? 'sorted' : ''}">Priority <span class="sort-arrow">${incState.sortKey === 'priority' ? (incState.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>
                                <th data-sort="status" class="${incState.sortKey === 'status' ? 'sorted' : ''}">Status <span class="sort-arrow">${incState.sortKey === 'status' ? (incState.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>
                                <th data-sort="reportedBy">Reported By <span class="sort-arrow">${incState.sortKey === 'reportedBy' ? (incState.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>
                                <th>Assigned To</th>
                                <th>Resolved By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0
                                ? '<tr><td colspan="8" style="text-align:center; padding: 40px; color: #94a3b8;">No incidents found</td></tr>'
                                : filtered.map(function (i) {
                                    return `
                                        <tr data-id="${i.id}">
                                            <td class="col-id">#${i.id}</td>
                                            <td class="col-title">${escapeHtml(i.title)}</td>
                                            <td>${escapeHtml(i.category)}</td>
                                            <td><span class="badge badge-${i.priority}">${i.priority}</span></td>
                                            <td><span class="badge badge-${i.status}">${i.status.replace(/_/g, ' ')}</span></td>
                                            <td>${escapeHtml(i.reportedBy || '—')}</td>
                                            <td class="${i.assignedTo ? '' : 'col-muted'}">${escapeHtml(i.assignedTo || '—')}</td>
                                            <td class="${i.resolvedBy ? '' : 'col-muted'}">${escapeHtml(i.resolvedBy || '—')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="inc-footer">Showing ${filtered.length} of ${incState.incidents.length} incidents</div>
        `;

        // Bind sort
        document.querySelectorAll('.inc-table th[data-sort]').forEach(function (th) {
            th.addEventListener('click', function () {
                var key = th.dataset.sort;
                if (incState.sortKey === key) {
                    incState.sortDir = incState.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    incState.sortKey = key;
                    incState.sortDir = 'asc';
                }
                renderIncidentTable();
            });
        });

        // Bind filters
        document.getElementById('inc-search-input').addEventListener('input', function (e) { incState.searchText = e.target.value; renderIncidentTable(); });
        document.getElementById('inc-filter-status').addEventListener('change', function (e) { incState.filterStatus = e.target.value; renderIncidentTable(); });
        document.getElementById('inc-filter-priority').addEventListener('change', function (e) { incState.filterPriority = e.target.value; renderIncidentTable(); });
        document.getElementById('inc-filter-category').addEventListener('change', function (e) { incState.filterCategory = e.target.value; renderIncidentTable(); });

        // Bind row click
        document.querySelectorAll('.inc-table tbody tr[data-id]').forEach(function (tr) {
            tr.addEventListener('click', function () { navigate('/incidents/' + tr.dataset.id); });
        });
    }

    var PRIORITY_ORDER = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    var STATUS_ORDER = { NEW: 1, ASSIGNED: 2, IN_PROGRESS: 3, RESOLVED: 4, CLOSED: 5 };

    function applyIncFilters() {
        var list = incState.incidents.slice();
        if (incState.filterStatus) list = list.filter(function (i) { return i.status === incState.filterStatus; });
        if (incState.filterPriority) list = list.filter(function (i) { return i.priority === incState.filterPriority; });
        if (incState.filterCategory) list = list.filter(function (i) { return i.category === incState.filterCategory; });
        if (incState.searchText) {
            var q = incState.searchText.toLowerCase();
            list = list.filter(function (i) { return (i.title || '').toLowerCase().indexOf(q) !== -1; });
        }
        list.sort(function (a, b) {
            var av, bv;
            if (incState.sortKey === 'priority') {
                av = PRIORITY_ORDER[a.priority] || 0; bv = PRIORITY_ORDER[b.priority] || 0;
            } else if (incState.sortKey === 'status') {
                av = STATUS_ORDER[a.status] || 0; bv = STATUS_ORDER[b.status] || 0;
            } else {
                av = a[incState.sortKey]; bv = b[incState.sortKey];
                if (typeof av === 'string') av = av.toLowerCase();
                if (typeof bv === 'string') bv = bv.toLowerCase();
            }
            if (av < bv) return incState.sortDir === 'asc' ? -1 : 1;
            if (av > bv) return incState.sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }

    // ===================== Incident Detail =====================
    function renderIncidentDetail(id) {
        var root = document.getElementById('root');
        root.innerHTML = renderTopbar('/incidents') + `
            <div class="dash-page">
                <div class="dash-container">
                    <a href="#/incidents" class="detail-back">
                        ${ICONS.arrowLeft}
                        Back to Incidents
                    </a>
                    <div id="detail-error" class="dash-error hidden"></div>
                    <div id="detail-content">
                        <div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>
                    </div>
                </div>
            </div>
        `;
        bindTopbarLogout();
        loadIncidentDetail(id);
    }

    function loadIncidentDetail(id) {
        var errorEl = document.getElementById('detail-error');
        var content = document.getElementById('detail-content');
        errorEl.classList.add('hidden');
        content.innerHTML = '<div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>';

        // Fetch incident details and recommendations in parallel
        Promise.all([
            apiRequest('GET', '/api/incidents/' + id),
            apiRequest('GET', '/api/incidents/' + id + '/recommendations?limit=5').catch(function () { return []; })
        ]).then(function (results) {
            var incident = results[0];
            var recommendations = results[1] || [];
            renderIncidentDetailContent(incident, recommendations);
        }).catch(function (err) {
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = ICONS.errorCircle + '<span>' + escapeHtml(err.message || 'Failed to load incident') + '</span>';
            content.innerHTML = '';
        });
    }

    function renderIncidentDetailContent(i, recs) {
        var content = document.getElementById('detail-content');
        var isOpen = i.status !== 'RESOLVED' && i.status !== 'CLOSED';
        var session = getSession();
        var engineerName = (session && session.user && session.user.username) || '';
        var isEngineer = session && session.user && (session.user.role === 'ENGINEER' || session.user.role === 'ADMIN');

        content.innerHTML = `
            <div class="detail-card">
                <div class="detail-card-header">
                    <div>
                        <div class="detail-id">Incident #${i.id}</div>
                        <h2>${escapeHtml(i.title)}</h2>
                        <div class="detail-badges" style="margin-top: 12px;">
                            <span class="badge badge-${i.priority}">${i.priority}</span>
                            <span class="badge badge-${i.status}">${i.status.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                </div>
                <div class="detail-card-body">
                    <div class="detail-field">
                        <div class="detail-field-label">Description</div>
                        <div class="detail-description">${escapeHtml(i.description || 'No description provided')}</div>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-field">
                            <div class="detail-field-label">Category</div>
                            <div class="detail-field-value">${escapeHtml(i.category)}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-field-label">Priority</div>
                            <div class="detail-field-value">${escapeHtml(i.priority)}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-field-label">Reported By</div>
                            <div class="detail-field-value">${escapeHtml(i.reportedBy || '—')}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-field-label">Assigned To</div>
                            <div class="detail-field-value ${i.assignedTo ? '' : 'muted'}">${escapeHtml(i.assignedTo || 'Unassigned')}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-field-label">Resolved By</div>
                            <div class="detail-field-value ${i.resolvedBy ? '' : 'muted'}">${escapeHtml(i.resolvedBy || 'Not resolved')}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-field-label">Status</div>
                            <div class="detail-field-value">${escapeHtml(i.status.replace(/_/g, ' '))}</div>
                        </div>
                    </div>
                    ${i.resolutionNote ? `
                        <div class="detail-field">
                            <div class="detail-field-label">Resolution Note</div>
                            <div class="detail-description">${escapeHtml(i.resolutionNote)}</div>
                        </div>
                    ` : ''}
                    ${i.solution ? `
                        <div class="detail-solution">
                            <div class="detail-solution-label">Solution</div>
                            <div class="detail-solution-text">${escapeHtml(i.solution)}</div>
                            ${i.rootCause ? '<div style="margin-top: 12px;"><div class="detail-solution-label">Root Cause</div><div class="detail-solution-text">' + escapeHtml(i.rootCause) + '</div></div>' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>

            ${isOpen && isEngineer ? renderDetailEngineerActions(i, engineerName) : ''}

            ${isOpen ? renderInlineRecommendations(i, recs) : ''}
        `;

        // Bind accept/reject on inline recommendations
        if (isOpen && recs.length > 0) {
            recs.forEach(function (r) {
                var acceptBtn = document.getElementById('detail-rec-accept-' + r.incidentId);
                var rejectBtn = document.getElementById('detail-rec-reject-' + r.incidentId);
                if (acceptBtn) acceptBtn.addEventListener('click', function () { handleInlineDecision('ACCEPT', r, i.id); });
                if (rejectBtn) rejectBtn.addEventListener('click', function () { handleInlineDecision('REJECT', r, i.id); });
            });
        }

        // Bind engineer actions on detail page
        if (isOpen && isEngineer) {
            bindDetailEngineerActions(i, engineerName);
        }
    }

    function renderDetailEngineerActions(i, engineerName) {
        var canAssign = i.status === 'NEW';
        var canStart = i.status === 'ASSIGNED';
        var canResolve = i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED' || i.status === 'NEW';

        var buttons = '';
        if (canAssign) {
            buttons += '<button class="btn-eng-action btn-assign" id="detail-eng-assign">' + ICONS.user + ' Assign to me</button>';
        }
        if (canStart) {
            buttons += '<button class="btn-eng-action btn-start" id="detail-eng-start">Start Investigation</button>';
        }

        return `
            <div class="eng-actions-section">
                <div class="eng-section-title">Engineer Actions</div>
                <div class="eng-action-buttons">
                    ${buttons}
                </div>
            </div>
            <div class="eng-resolve-section">
                <div class="eng-section-title">Resolve with Solution</div>
                <div id="detail-eng-resolve-form" class="eng-resolve-form ${canResolve ? '' : 'hidden'}">
                    <div class="form-field">
                        <label for="detail-eng-solution">Solution <span class="req">*</span></label>
                        <textarea id="detail-eng-solution" rows="3" maxlength="4000" placeholder="Describe the solution that was applied..."></textarea>
                        <div class="field-error" id="detail-eng-solution-err"></div>
                    </div>
                    <div class="form-field">
                        <label for="detail-eng-rootcause">Root Cause <span class="req">*</span></label>
                        <textarea id="detail-eng-rootcause" rows="2" maxlength="4000" placeholder="What was the underlying cause?"></textarea>
                        <div class="field-error" id="detail-eng-rootcause-err"></div>
                    </div>
                    <button class="btn-submit" id="detail-eng-resolve">
                        ${ICONS.check}
                        Resolve Incident
                    </button>
                </div>
                ${!canResolve ? '<p class="eng-hint">This incident cannot be resolved in its current state.</p>' : ''}
            </div>
        `;
    }

    function bindDetailEngineerActions(incident, engineerName) {
        var assignBtn = document.getElementById('detail-eng-assign');
        var startBtn = document.getElementById('detail-eng-start');
        var resolveBtn = document.getElementById('detail-eng-resolve');

        if (assignBtn) {
            assignBtn.addEventListener('click', function () {
                assignBtn.disabled = true;
                assignBtn.innerHTML = '<span class="spinner"></span> Assigning...';
                apiRequest('PATCH', '/api/incidents/' + incident.id + '/status', {
                    status: 'ASSIGNED',
                    assignedTo: engineerName
                }).then(function () {
                    showToast('success', 'Incident #' + incident.id + ' assigned to you');
                    loadIncidentDetail(incident.id);
                }).catch(function (err) {
                    showToast('error', err.message || 'Failed to assign');
                    assignBtn.disabled = false;
                    assignBtn.innerHTML = ICONS.user + ' Assign to me';
                });
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', function () {
                startBtn.disabled = true;
                startBtn.innerHTML = '<span class="spinner"></span> Starting...';
                apiRequest('PATCH', '/api/incidents/' + incident.id + '/status', {
                    status: 'IN_PROGRESS'
                }).then(function () {
                    showToast('success', 'Investigation started for #' + incident.id);
                    loadIncidentDetail(incident.id);
                }).catch(function (err) {
                    showToast('error', err.message || 'Failed to start');
                    startBtn.disabled = false;
                    startBtn.innerHTML = 'Start Investigation';
                });
            });
        }

        if (resolveBtn) {
            resolveBtn.addEventListener('click', function () {
                var solution = document.getElementById('detail-eng-solution').value.trim();
                var rootCause = document.getElementById('detail-eng-rootcause').value.trim();
                var solErr = document.getElementById('detail-eng-solution-err');
                var rcErr = document.getElementById('detail-eng-rootcause-err');
                solErr.textContent = ''; rcErr.textContent = '';

                var valid = true;
                if (!solution) { solErr.textContent = 'Solution is required'; valid = false; }
                if (!rootCause) { rcErr.textContent = 'Root cause is required'; valid = false; }
                if (!valid) return;

                resolveBtn.disabled = true;
                resolveBtn.innerHTML = '<span class="spinner"></span> Resolving...';

                apiRequest('POST', '/api/incidents/' + incident.id + '/engineer-solution', {
                    solution: solution,
                    rootCause: rootCause,
                    resolvedBy: engineerName
                }).then(function () {
                    showToast('success', 'Incident #' + incident.id + ' resolved successfully');
                    loadIncidentDetail(incident.id);
                }).catch(function (err) {
                    showToast('error', err.message || 'Failed to resolve');
                    resolveBtn.disabled = false;
                    resolveBtn.innerHTML = ICONS.check + ' Resolve Incident';
                });
            });
        }
    }

    function renderInlineRecommendations(incident, recs) {
        if (recs.length === 0) {
            return `
                <div class="rec-section">
                    <div class="rec-section-header">
                        <h3>${ICONS.lightbulb} Recommended Actions</h3>
                    </div>
                    <div class="rec-section-body">
                        <div class="empty-state">
                            <p>No recommendations available yet. When similar incidents are resolved in the same category, their solutions will appear here.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="rec-section">
                <div class="rec-section-header">
                    <h3>${ICONS.lightbulb} Recommended Actions</h3>
                    <span class="rec-count">${recs.length} ${recs.length === 1 ? 'match' : 'matches'}</span>
                </div>
                <div class="rec-section-body">
                    <div class="rec-checklist">
                        ${recs.map(function (r) {
                            var pct = Math.round(r.similarity * 100);
                            return `
                                <div class="rec-checklist-item">
                                    <div class="rec-checklist-check">${ICONS.check}</div>
                                    <div class="rec-checklist-content">
                                        <div class="rec-checklist-title">${escapeHtml(r.solution || 'Solution from similar incident')}</div>
                                        <div class="rec-checklist-meta">
                                            Similar incident: <a href="#/incidents/${r.incidentId}" class="rec-source-link">INC-${String(r.incidentId).padStart(4, '0')}</a>
                                            &middot; ${escapeHtml(r.category)} &middot; ${r.priority}
                                            <span class="rec-resolved-tag">${ICONS.checkSmall} Resolved</span>
                                        </div>
                                    </div>
                                    <div class="rec-checklist-similarity">
                                        <div class="sim-bar"><div class="sim-bar-fill" style="width: ${pct}%"></div></div>
                                        <span class="sim-pct">${pct}%</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="rec-inline-actions">
                        <button class="btn-accept" id="detail-rec-accept-${recs[0].incidentId}">
                            ${ICONS.check}
                            Accept Top Recommendation
                        </button>
                        <button class="btn-reject" id="detail-rec-reject-${recs[0].incidentId}">
                            ${ICONS.x}
                            Reject
                        </button>
                        <span class="rec-inline-hint">Accepting will auto-resolve this incident using the top recommended solution</span>
                    </div>
                </div>
            </div>
        `;
    }

    function handleInlineDecision(decision, rec, targetId) {
        var session = getSession();
        var decidedBy = (session && session.user && session.user.username) || 'user';

        var acceptBtn = document.getElementById('detail-rec-accept-' + rec.incidentId);
        var rejectBtn = document.getElementById('detail-rec-reject-' + rec.incidentId);
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;

        var payload = {
            recommendationIncidentId: rec.incidentId,
            decision: decision,
            decidedBy: decidedBy,
            comment: ''
        };

        apiRequest('POST', '/api/incidents/' + targetId + '/recommendation/decision', payload)
            .then(function () {
                if (decision === 'ACCEPT') {
                    showToast('success', 'Recommendation accepted. Incident #' + targetId + ' has been resolved.');
                    // Reload the detail page to show resolved status
                    setTimeout(function () { loadIncidentDetail(targetId); }, 1200);
                } else {
                    showToast('info', 'Recommendation rejected.');
                    // Reload detail to update the resolution note
                    loadIncidentDetail(targetId);
                }
            })
            .catch(function (err) {
                showToast('error', err.message || 'Failed to process decision');
                if (acceptBtn) acceptBtn.disabled = false;
                if (rejectBtn) rejectBtn.disabled = false;
            });
    }

    // ===================== Engineer Workspace =====================
    var engState = {
        incidents: [],
        selectedId: null,
        filterStatus: '',
        recs: []
    };

    function renderEngineerWorkspace() {
        var session = getSession();
        if (!session || (session.user.role !== 'ENGINEER' && session.user.role !== 'ADMIN')) {
            navigate('/dashboard');
            return;
        }
        var root = document.getElementById('root');
        root.innerHTML = renderTopbar('/engineer') + `
            <div class="dash-page">
                <div class="dash-container">
                    <div class="eng-header">
                        <div>
                            <h1>Engineer Workspace</h1>
                            <p class="eng-subtitle">Investigate, progress, and resolve incidents assigned to you</p>
                        </div>
                        <button class="btn-refresh" id="eng-refresh">
                            ${ICONS.refresh}
                            <span>Refresh</span>
                        </button>
                    </div>
                    <div class="eng-layout">
                        <div class="eng-queue">
                            <div class="eng-queue-header">
                                <h3>Incident Queue</h3>
                                <select id="eng-filter-status" class="eng-filter">
                                    <option value="">All Open</option>
                                    <option value="NEW">New</option>
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                            <div id="eng-queue-list" class="eng-queue-list">
                                <div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>
                            </div>
                        </div>
                        <div id="eng-detail" class="eng-detail">
                            <div class="empty-state">
                                <p>Select an incident from the queue to start working on it</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        bindTopbarLogout();
        document.getElementById('eng-refresh').addEventListener('click', loadEngineerIncidents);
        document.getElementById('eng-filter-status').addEventListener('change', function (e) {
            engState.filterStatus = e.target.value;
            renderEngineerQueue();
        });
        loadEngineerIncidents();
    }

    function loadEngineerIncidents() {
        var refreshBtn = document.getElementById('eng-refresh');
        if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.innerHTML = '<span class="spinner"></span> Refreshing...'; }

        apiRequest('GET', '/api/incidents').then(function (list) {
            engState.incidents = list;
            renderEngineerQueue();
            if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.innerHTML = ICONS.refresh + '<span>Refresh</span>'; }
        }).catch(function (err) {
            if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.innerHTML = ICONS.refresh + '<span>Refresh</span>'; }
            document.getElementById('eng-queue-list').innerHTML = '<div class="empty-state"><p>Failed to load: ' + escapeHtml(err.message) + '</p></div>';
        });
    }

    function renderEngineerQueue() {
        var list = engState.incidents.slice();
        if (engState.filterStatus) {
            list = list.filter(function (i) { return i.status === engState.filterStatus; });
        } else {
            list = list.filter(function (i) { return i.status !== 'CLOSED'; });
        }
        // Sort: NEW first, then ASSIGNED, then IN_PROGRESS, then RESOLVED; within each, CRITICAL first
        var statusOrder = { NEW: 1, ASSIGNED: 2, IN_PROGRESS: 3, RESOLVED: 4, CLOSED: 5 };
        var prioOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
        list.sort(function (a, b) {
            if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
            return prioOrder[a.priority] - prioOrder[b.priority];
        });

        var container = document.getElementById('eng-queue-list');
        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No incidents in this view</p></div>';
            return;
        }

        container.innerHTML = list.map(function (i) {
            var isActive = i.id === engState.selectedId;
            return `
                <div class="eng-queue-item ${isActive ? 'active' : ''}" data-id="${i.id}">
                    <div class="eng-queue-item-top">
                        <span class="eng-queue-id">#${i.id}</span>
                        <span class="badge badge-${i.priority}">${i.priority}</span>
                    </div>
                    <div class="eng-queue-title">${escapeHtml(i.title)}</div>
                    <div class="eng-queue-item-bottom">
                        <span class="badge badge-${i.status}">${i.status.replace(/_/g, ' ')}</span>
                        <span class="eng-queue-cat">${escapeHtml(i.category)}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.eng-queue-item').forEach(function (el) {
            el.addEventListener('click', function () {
                engState.selectedId = parseInt(el.dataset.id, 10);
                renderEngineerQueue();
                loadEngineerDetail();
            });
        });
    }

    function loadEngineerDetail() {
        var detail = document.getElementById('eng-detail');
        detail.innerHTML = '<div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>';

        var incident = engState.incidents.find(function (i) { return i.id === engState.selectedId; });
        if (!incident) {
            detail.innerHTML = '<div class="empty-state"><p>Incident not found</p></div>';
            return;
        }

        // Fetch incident + recommendations in parallel
        Promise.all([
            apiRequest('GET', '/api/incidents/' + incident.id),
            apiRequest('GET', '/api/incidents/' + incident.id + '/recommendations?limit=5').catch(function () { return []; })
        ]).then(function (results) {
            renderEngineerDetailContent(results[0], results[1] || []);
        }).catch(function (err) {
            detail.innerHTML = '<div class="alert alert-error">' + escapeHtml(err.message || 'Failed to load') + '</div>';
        });
    }

    function renderEngineerDetailContent(i, recs) {
        var detail = document.getElementById('eng-detail');
        var session = getSession();
        var engineerName = (session && session.user && session.user.username) || 'engineer';
        var isResolved = i.status === 'RESOLVED' || i.status === 'CLOSED';
        var isAssignedToMe = i.assignedTo === engineerName;
        var canAssign = i.status === 'NEW';
        var canStart = i.status === 'ASSIGNED';
        var canResolve = i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED' || i.status === 'NEW';

        detail.innerHTML = `
            <div class="eng-detail-header">
                <div>
                    <span class="eng-detail-id">Incident #${i.id}</span>
                    <h2>${escapeHtml(i.title)}</h2>
                    <div class="detail-badges" style="margin-top: 8px;">
                        <span class="badge badge-${i.priority}">${i.priority}</span>
                        <span class="badge badge-${i.status}">${i.status.replace(/_/g, ' ')}</span>
                    </div>
                </div>
            </div>

            <div class="eng-detail-section">
                <div class="eng-detail-label">Description</div>
                <div class="detail-description">${escapeHtml(i.description || 'No description provided')}</div>
            </div>

            <div class="eng-detail-grid">
                <div class="eng-detail-field">
                    <div class="eng-detail-label">Category</div>
                    <div class="eng-detail-value">${escapeHtml(i.category)}</div>
                </div>
                <div class="eng-detail-field">
                    <div class="eng-detail-label">Reported By</div>
                    <div class="eng-detail-value">${escapeHtml(i.reportedBy || '—')}</div>
                </div>
                <div class="eng-detail-field">
                    <div class="eng-detail-label">Assigned To</div>
                    <div class="eng-detail-value ${i.assignedTo ? '' : 'muted'}">${escapeHtml(i.assignedTo || 'Unassigned')}</div>
                </div>
                <div class="eng-detail-field">
                    <div class="eng-detail-label">Resolved By</div>
                    <div class="eng-detail-value ${i.resolvedBy ? '' : 'muted'}">${escapeHtml(i.resolvedBy || 'Not resolved')}</div>
                </div>
            </div>

            ${i.resolutionNote ? `
                <div class="eng-detail-section">
                    <div class="eng-detail-label">Resolution Note</div>
                    <div class="detail-description">${escapeHtml(i.resolutionNote)}</div>
                </div>
            ` : ''}

            ${i.solution ? `
                <div class="detail-solution">
                    <div class="detail-solution-label">Solution</div>
                    <div class="detail-solution-text">${escapeHtml(i.solution)}</div>
                    ${i.rootCause ? '<div style="margin-top: 12px;"><div class="detail-solution-label">Root Cause</div><div class="detail-solution-text">' + escapeHtml(i.rootCause) + '</div></div>' : ''}
                </div>
            ` : ''}

            ${!isResolved ? renderEngineerActions(i, engineerName, canAssign, canStart, canResolve) : ''}

            ${!isResolved && recs.length > 0 ? renderEngineerRecommendations(recs) : ''}
        `;

        bindEngineerActions(i, engineerName);
    }

    function renderEngineerActions(i, engineerName, canAssign, canStart, canResolve) {
        var buttons = '';
        if (canAssign) {
            buttons += `<button class="btn-eng-action btn-assign" id="eng-action-assign">${ICONS.user} Assign to me</button>`;
        }
        if (canStart) {
            buttons += `<button class="btn-eng-action btn-start" id="eng-action-start">Start Investigation</button>`;
        }

        return `
            <div class="eng-actions-section">
                <div class="eng-section-title">Engineer Actions</div>
                <div class="eng-action-buttons">
                    ${buttons}
                </div>
            </div>

            <div class="eng-resolve-section">
                <div class="eng-section-title">Resolve with Solution</div>
                <div id="eng-resolve-form" class="eng-resolve-form ${canResolve ? '' : 'hidden'}">
                    <div class="form-field">
                        <label for="eng-solution">Solution <span class="req">*</span></label>
                        <textarea id="eng-solution" rows="3" maxlength="4000" placeholder="Describe the solution that was applied..."></textarea>
                        <div class="field-error" id="eng-solution-err"></div>
                    </div>
                    <div class="form-field">
                        <label for="eng-rootcause">Root Cause <span class="req">*</span></label>
                        <textarea id="eng-rootcause" rows="2" maxlength="4000" placeholder="What was the underlying cause?"></textarea>
                        <div class="field-error" id="eng-rootcause-err"></div>
                    </div>
                    <button class="btn-submit" id="eng-action-resolve">
                        ${ICONS.check}
                        Resolve Incident
                    </button>
                </div>
                ${!canResolve ? '<p class="eng-hint">This incident cannot be resolved in its current state.</p>' : ''}
            </div>
        `;
    }

    function renderEngineerRecommendations(recs) {
        return `
            <div class="rec-section">
                <div class="rec-section-header">
                    <h3>${ICONS.lightbulb} Recommended Actions</h3>
                    <span class="rec-count">${recs.length} ${recs.length === 1 ? 'match' : 'matches'}</span>
                </div>
                <div class="rec-section-body">
                    <div class="rec-checklist">
                        ${recs.map(function (r) {
                            var pct = Math.round(r.similarity * 100);
                            return `
                                <div class="rec-checklist-item">
                                    <div class="rec-checklist-check">${ICONS.check}</div>
                                    <div class="rec-checklist-content">
                                        <div class="rec-checklist-title">${escapeHtml(r.solution || 'Solution from similar incident')}</div>
                                        <div class="rec-checklist-meta">
                                            Similar incident: <a href="#/incidents/${r.incidentId}" class="rec-source-link">INC-${String(r.incidentId).padStart(4, '0')}</a>
                                            &middot; ${escapeHtml(r.category)} &middot; ${r.priority}
                                            <span class="rec-resolved-tag">${ICONS.checkSmall} Resolved</span>
                                        </div>
                                    </div>
                                    <div class="rec-checklist-similarity">
                                        <div class="sim-bar"><div class="sim-bar-fill" style="width: ${pct}%"></div></div>
                                        <span class="sim-pct">${pct}%</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function bindEngineerActions(incident, engineerName) {
        var assignBtn = document.getElementById('eng-action-assign');
        var startBtn = document.getElementById('eng-action-start');
        var resolveBtn = document.getElementById('eng-action-resolve');

        if (assignBtn) {
            assignBtn.addEventListener('click', function () {
                assignBtn.disabled = true;
                assignBtn.innerHTML = '<span class="spinner"></span> Assigning...';
                apiRequest('PATCH', '/api/incidents/' + incident.id + '/status', {
                    status: 'ASSIGNED',
                    assignedTo: engineerName
                }).then(function () {
                    showToast('success', 'Incident #' + incident.id + ' assigned to you');
                    loadEngineerIncidents();
                    setTimeout(loadEngineerDetail, 500);
                }).catch(function (err) {
                    showToast('error', err.message || 'Failed to assign');
                    assignBtn.disabled = false;
                    assignBtn.innerHTML = ICONS.user + ' Assign to me';
                });
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', function () {
                startBtn.disabled = true;
                startBtn.innerHTML = '<span class="spinner"></span> Starting...';
                apiRequest('PATCH', '/api/incidents/' + incident.id + '/status', {
                    status: 'IN_PROGRESS'
                }).then(function () {
                    showToast('success', 'Investigation started for #' + incident.id);
                    loadEngineerIncidents();
                    setTimeout(loadEngineerDetail, 500);
                }).catch(function (err) {
                    showToast('error', err.message || 'Failed to start');
                    startBtn.disabled = false;
                    startBtn.innerHTML = 'Start Investigation';
                });
            });
        }

        if (resolveBtn) {
            resolveBtn.addEventListener('click', function () {
                var solution = document.getElementById('eng-solution').value.trim();
                var rootCause = document.getElementById('eng-rootcause').value.trim();
                var solErr = document.getElementById('eng-solution-err');
                var rcErr = document.getElementById('eng-rootcause-err');
                solErr.textContent = ''; rcErr.textContent = '';

                var valid = true;
                if (!solution) { solErr.textContent = 'Solution is required'; valid = false; }
                if (!rootCause) { rcErr.textContent = 'Root cause is required'; valid = false; }
                if (!valid) return;

                resolveBtn.disabled = true;
                resolveBtn.innerHTML = '<span class="spinner"></span> Resolving...';

                apiRequest('POST', '/api/incidents/' + incident.id + '/engineer-solution', {
                    solution: solution,
                    rootCause: rootCause,
                    resolvedBy: engineerName
                }).then(function () {
                    showToast('success', 'Incident #' + incident.id + ' resolved successfully');
                    loadEngineerIncidents();
                    setTimeout(loadEngineerDetail, 500);
                }).catch(function (err) {
                    showToast('error', err.message || 'Failed to resolve');
                    resolveBtn.disabled = false;
                    resolveBtn.innerHTML = ICONS.check + ' Resolve Incident';
                });
            });
        }
    }

    // ===================== Report Incident =====================
    function renderReportIncident() {
        var session = getSession();
        var defaultReporter = (session && session.user && session.user.username) || '';
        var root = document.getElementById('root');
        root.innerHTML = renderTopbar('/incidents') + `
            <div class="dash-page">
                <div class="dash-container">
                    <a href="#/incidents" class="detail-back">
                        ${ICONS.arrowLeft}
                        Back to Incidents
                    </a>
                    <div class="form-card">
                        <div class="form-card-header">
                            <h2>Report New Incident</h2>
                            <p>Fill in the details below to create a new incident.</p>
                        </div>
                        <div class="form-card-body">
                            <div id="form-alert" class="alert alert-error hidden"></div>
                            <form id="report-form" novalidate>
                                <div class="form-field">
                                    <div class="label-row">
                                        <label for="r-title">Title</label>
                                        <span class="field-hint">Max 200 characters</span>
                                    </div>
                                    <input type="text" id="r-title" maxlength="200" placeholder="Brief incident title">
                                    <div class="form-field-error" id="r-title-error"></div>
                                </div>
                                <div class="form-field">
                                    <div class="label-row">
                                        <label for="r-description">Description</label>
                                        <span class="field-hint">Max 4000 characters</span>
                                    </div>
                                    <textarea id="r-description" maxlength="4000" placeholder="Detailed description of the incident"></textarea>
                                    <div class="form-field-error" id="r-description-error"></div>
                                </div>
                                <div class="form-field">
                                    <label for="r-category">Category</label>
                                    <input type="text" id="r-category" list="category-list" maxlength="100" placeholder="e.g. Database, Network, Auth">
                                    <datalist id="category-list"></datalist>
                                    <div class="form-field-error" id="r-category-error"></div>
                                </div>
                                <div class="form-field">
                                    <label for="r-priority">Priority</label>
                                    <select id="r-priority">
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM" selected>Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                    <div class="form-field-error" id="r-priority-error"></div>
                                </div>
                                <div class="form-field">
                                    <label for="r-reportedBy">Reported By</label>
                                    <input type="text" id="r-reportedBy" maxlength="100" value="${escapeAttr(defaultReporter)}">
                                    <div class="form-field-error" id="r-reportedBy-error"></div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-cancel" id="r-cancel">Cancel</button>
                                    <button type="submit" class="btn-submit" id="r-submit">Create Incident</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        bindTopbarLogout();
        bindReportForm();
        loadCategoryDatalist();
    }

    function loadCategoryDatalist() {
        apiRequest('GET', '/api/incidents').then(function (data) {
            var catSet = {};
            (data || []).forEach(function (i) { catSet[i.category] = true; });
            var cats = Object.keys(catSet).sort();
            var datalist = document.getElementById('category-list');
            if (datalist) {
                datalist.innerHTML = cats.map(function (c) {
                    return '<option value="' + escapeAttr(c) + '">';
                }).join('');
            }
        }).catch(function () { /* ignore — datalist is optional */ });
    }

    function bindReportForm() {
        var form = document.getElementById('report-form');
        var cancelBtn = document.getElementById('r-cancel');

        cancelBtn.addEventListener('click', function () { navigate('/incidents'); });

        ['r-title', 'r-description', 'r-category', 'r-priority', 'r-reportedBy'].forEach(function (id) {
            var el = document.getElementById(id);
            el.addEventListener('input', function () { clearFormFieldError(id); });
            el.addEventListener('change', function () { clearFormFieldError(id); });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            submitReportIncident();
        });
    }

    function submitReportIncident() {
        hideFormAlert();
        clearAllFormFieldErrors();

        var payload = {
            title: document.getElementById('r-title').value.trim(),
            description: document.getElementById('r-description').value.trim(),
            category: document.getElementById('r-category').value.trim(),
            priority: document.getElementById('r-priority').value,
            reportedBy: document.getElementById('r-reportedBy').value.trim()
        };

        // Client-side validation
        var valid = true;
        if (!payload.title) { setFormFieldError('r-title', 'Title is required'); valid = false; }
        else if (payload.title.length > 200) { setFormFieldError('r-title', 'Title must be at most 200 characters'); valid = false; }
        if (!payload.description) { setFormFieldError('r-description', 'Description is required'); valid = false; }
        else if (payload.description.length > 4000) { setFormFieldError('r-description', 'Description must be at most 4000 characters'); valid = false; }
        if (!payload.category) { setFormFieldError('r-category', 'Category is required'); valid = false; }
        else if (payload.category.length > 100) { setFormFieldError('r-category', 'Category must be at most 100 characters'); valid = false; }
        if (!payload.reportedBy) { setFormFieldError('r-reportedBy', 'Reported by is required'); valid = false; }
        if (!valid) return;

        var btn = document.getElementById('r-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creating...';

        apiRequest('POST', '/api/incidents', payload).then(function (created) {
            navigate('/incidents/' + created.id);
        }).catch(function (err) {
            if (err.status === 400 && err.errors) {
                // Map backend field names to element IDs
                Object.keys(err.errors).forEach(function (field) {
                    var id = 'r-' + field;
                    setFormFieldError(id, err.errors[field]);
                });
            } else {
                showFormAlert('error', err.message || 'Failed to create incident');
            }
        }).finally(function () {
            btn.disabled = false;
            btn.textContent = 'Create Incident';
        });
    }

    function showFormAlert(type, message) {
        var el = document.getElementById('form-alert');
        el.className = 'alert alert-' + type;
        el.innerHTML = (type === 'error' ? ICONS.errorCircle : ICONS.successCheck) + '<span>' + escapeHtml(message) + '</span>';
    }

    function hideFormAlert() {
        var el = document.getElementById('form-alert');
        el.className = 'alert alert-error hidden';
        el.innerHTML = '';
    }

    function setFormFieldError(id, message) {
        var input = document.getElementById(id);
        var errorEl = document.getElementById(id + '-error');
        if (input) input.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function clearFormFieldError(id) {
        var input = document.getElementById(id);
        var errorEl = document.getElementById(id + '-error');
        if (input) input.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    }

    function clearAllFormFieldErrors() {
        ['r-title', 'r-description', 'r-category', 'r-priority', 'r-reportedBy'].forEach(clearFormFieldError);
    }

    // ===================== Recommendations =====================
    var recState = { incidents: [], selectedId: null, recommendations: [], loadingRecs: false };

    function renderRecommendations() {
        var root = document.getElementById('root');
        root.innerHTML = renderTopbar('/recommendations') + `
            <div class="dash-page">
                <div class="dash-container">
                    <div class="dash-header">
                        <div>
                            <h1>Recommendations</h1>
                            <p>Find similar resolved incidents and reuse their solutions</p>
                        </div>
                        <button class="btn-refresh" id="rec-refresh">
                            ${ICONS.refresh}
                            <span>Refresh</span>
                        </button>
                    </div>
                    <div id="rec-error" class="dash-error hidden"></div>
                    <div id="rec-content">
                        <div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>
                    </div>
                </div>
            </div>
        `;
        bindTopbarLogout();
        document.getElementById('rec-refresh').addEventListener('click', loadRecommendationsPage);
        loadRecommendationsPage();
    }

    function loadRecommendationsPage() {
        var errorEl = document.getElementById('rec-error');
        var content = document.getElementById('rec-content');
        errorEl.classList.add('hidden');
        content.innerHTML = '<div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>';

        apiRequest('GET', '/api/incidents').then(function (data) {
            recState.incidents = data || [];
            // Only show open incidents (not RESOLVED or CLOSED) as selectable targets
            var openIncidents = recState.incidents.filter(function (i) {
                return i.status !== 'RESOLVED' && i.status !== 'CLOSED';
            });

            if (openIncidents.length === 0) {
                content.innerHTML = `
                    <div class="rec-selector">
                        <label>Select an open incident</label>
                        <select disabled><option>No open incidents available</option></select>
                    </div>
                    <div class="empty-state">
                        ${ICONS.checkCircle}
                        <h3 style="margin-top: 12px; font-size: 16px; font-weight: 700;">All incidents are resolved</h3>
                        <p>There are no open incidents to get recommendations for.</p>
                    </div>
                `;
                return;
            }

            content.innerHTML = `
                <div class="rec-selector">
                    <label for="rec-select">Select an open incident</label>
                    <select id="rec-select">
                        <option value="">— Choose an incident —</option>
                        ${openIncidents.map(function (i) {
                            return '<option value="' + i.id + '">#' + i.id + ' — ' + escapeHtml(i.title) + ' (' + escapeHtml(i.category) + ')</option>';
                        }).join('')}
                    </select>
                </div>
                <div id="rec-results"></div>
            `;

            document.getElementById('rec-select').addEventListener('change', function (e) {
                recState.selectedId = e.target.value || null;
                if (!recState.selectedId) {
                    document.getElementById('rec-results').innerHTML = '';
                    return;
                }
                loadRecommendationsFor(recState.selectedId);
            });

            // Auto-select first open incident
            recState.selectedId = String(openIncidents[0].id);
            document.getElementById('rec-select').value = recState.selectedId;
            loadRecommendationsFor(recState.selectedId);
        }).catch(function (err) {
            errorEl.classList.remove('hidden');
            errorEl.innerHTML = ICONS.errorCircle + '<span>' + escapeHtml(err.message || 'Failed to load incidents') + '</span>';
            content.innerHTML = '';
        });
    }

    function loadRecommendationsFor(incidentId) {
        var results = document.getElementById('rec-results');
        results.innerHTML = '<div class="empty-state"><div class="spinner" style="margin: 0 auto;"></div></div>';

        // Fetch the target incident details + recommendations in parallel
        Promise.all([
            apiRequest('GET', '/api/incidents/' + incidentId),
            apiRequest('GET', '/api/incidents/' + incidentId + '/recommendations?limit=5')
        ]).then(function (res) {
            var incident = res[0];
            recState.recommendations = res[1] || [];
            renderRecommendationResults(incident, recState.recommendations);
        }).catch(function (err) {
            results.innerHTML = '<div class="dash-error">' + ICONS.errorCircle + '<span>' + escapeHtml(err.message || 'Failed to load recommendations') + '</span></div>';
        });
    }

    function renderRecommendationResults(incident, recs) {
        var results = document.getElementById('rec-results');

        results.innerHTML = `
            <!-- Target incident info -->
            <div class="rec-target">
                <div class="rec-target-header">
                    <span class="rec-target-id">Incident #${incident.id}</span>
                    <span class="rec-target-title">${escapeHtml(incident.title)}</span>
                    <span class="badge badge-${incident.priority}" style="margin-left: auto;">${incident.priority}</span>
                    <span class="badge badge-${incident.status}">${incident.status.replace(/_/g, ' ')}</span>
                </div>
                <div class="rec-target-desc">${escapeHtml(incident.description || 'No description')}</div>
                <div class="rec-target-meta">
                    <span>${ICONS.tag} ${escapeHtml(incident.category)}</span>
                    <span>${ICONS.user} Reported by ${escapeHtml(incident.reportedBy || '—')}</span>
                </div>
            </div>

            <!-- Recommendations -->
            <div id="rec-list-container">
                ${recs.length === 0
                    ? '<div class="empty-state">' + ICONS.search + '<h3 style="margin-top: 12px; font-size: 16px; font-weight: 700;">No recommendations found</h3><p>There are no resolved incidents in the same category with similar descriptions. Resolve some incidents to build up your recommendation base.</p></div>'
                    : '<div class="rec-list">' + recs.map(function (r) {
                        return renderRecCard(r, incident.id);
                    }).join('') + '</div>'
                }
            </div>
        `;

        // Bind accept/reject buttons
        recs.forEach(function (r) {
            var acceptBtn = document.getElementById('rec-accept-' + r.incidentId);
            var rejectBtn = document.getElementById('rec-reject-' + r.incidentId);
            if (acceptBtn) acceptBtn.addEventListener('click', function () { handleDecision('ACCEPT', r, incident.id); });
            if (rejectBtn) rejectBtn.addEventListener('click', function () { handleDecision('REJECT', r, incident.id); });
        });
    }

    function renderRecCard(r, targetId) {
        var pct = Math.round(r.similarity * 100);
        return `
            <div class="rec-card">
                <div class="rec-card-body">
                    <div class="rec-card-top">
                        <div class="rec-card-info">
                            <div class="rec-card-title-row">
                                <span class="rec-card-source-id">#${r.incidentId}</span>
                                <span class="rec-card-title">${escapeHtml(r.title)}</span>
                            </div>
                            <div class="rec-card-meta">
                                ${escapeHtml(r.category)} &middot; ${r.priority} &middot; Resolved by ${escapeHtml(r.resolvedBy || 'engineer')}
                            </div>
                        </div>
                        <div class="sim-bar-wrap">
                            <div class="sim-bar"><div class="sim-bar-fill" style="width: ${pct}%"></div></div>
                            <span class="sim-pct">${pct}%</span>
                        </div>
                    </div>
                    ${r.solution ? `
                        <div class="rec-solution">
                            <div class="rec-solution-label">${ICONS.lightbulb} Recommended Solution</div>
                            <div class="rec-solution-text">${escapeHtml(r.solution)}</div>
                        </div>
                    ` : ''}
                    <div class="rec-actions">
                        <button class="btn-accept" id="rec-accept-${r.incidentId}">
                            ${ICONS.check}
                            Accept & Resolve
                        </button>
                        <button class="btn-reject" id="rec-reject-${r.incidentId}">
                            ${ICONS.x}
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function handleDecision(decision, rec, targetId) {
        var session = getSession();
        var decidedBy = (session && session.user && session.user.username) || 'user';

        var acceptBtn = document.getElementById('rec-accept-' + rec.incidentId);
        var rejectBtn = document.getElementById('rec-reject-' + rec.incidentId);
        if (acceptBtn) acceptBtn.disabled = true;
        if (rejectBtn) rejectBtn.disabled = true;

        var payload = {
            recommendationIncidentId: rec.incidentId,
            decision: decision,
            decidedBy: decidedBy,
            comment: ''
        };

        apiRequest('POST', '/api/incidents/' + targetId + '/recommendation/decision', payload)
            .then(function () {
                if (decision === 'ACCEPT') {
                    showToast('success', 'Recommendation accepted. Incident #' + targetId + ' has been resolved.');
                    // The incident is now resolved — reload the page to update the selector
                    setTimeout(function () { loadRecommendationsPage(); }, 1500);
                } else {
                    showToast('info', 'Recommendation rejected.');
                    // Refresh recommendations for the same incident
                    loadRecommendationsFor(targetId);
                }
            })
            .catch(function (err) {
                showToast('error', err.message || 'Failed to process decision');
                if (acceptBtn) acceptBtn.disabled = false;
                if (rejectBtn) rejectBtn.disabled = false;
            });
    }

    // ===================== Toast =====================
    var toastTimer = null;
    function showToast(type, message) {
        // Remove existing toast
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();
        if (toastTimer) clearTimeout(toastTimer);

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        var icon = type === 'success' ? ICONS.checkCircle : (type === 'error' ? ICONS.errorCircle : ICONS.info);
        toast.innerHTML = icon + '<span>' + escapeHtml(message) + '</span>';
        document.body.appendChild(toast);

        toastTimer = setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 300ms ease';
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    }

    // ===================== Router / Init =====================
    function render() {
        var path = resolveRoute(currentPath());
        if (path === '/login') { renderAuthPage('login'); }
        else if (path === '/register') { renderAuthPage('register'); }
        else if (path === '/dashboard') { renderDashboard(); }
        else if (path === '/incidents/new') { renderReportIncident(); }
        else if (path === '/incidents') { renderIncidentList(); }
        else if (path === '/engineer') { renderEngineerWorkspace(); }
        else if (path.indexOf('/incidents/') === 0) {
            var id = path.replace('/incidents/', '');
            renderIncidentDetail(id);
        }
        else { renderAuthPage('login'); }
    }

    window.addEventListener('hashchange', render);

    // Initialize
    if (!location.hash) {
        location.hash = isLoggedIn() ? '#/dashboard' : '#/login';
    } else {
        render();
    }
})();
