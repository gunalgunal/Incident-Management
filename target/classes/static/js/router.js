/**
 * Router, app shell, theme management, sidebar, notifications, breadcrumbs.
 */
(function () {
    const PROTECTED = ['/dashboard', '/incidents', '/recommendations'];

    const routes = {
        '/login': () => LoginPage.render('login'),
        '/register': () => LoginPage.render('register'),
        '/dashboard': () => DashboardPage.render(),
        '/incidents': () => IncidentsPage.render(),
        '/recommendations': () => RecommendationsPage.render(),
    };

    const routeLabels = {
        '/dashboard': 'Dashboard',
        '/incidents': 'Incidents',
        '/recommendations': 'Recommendations',
        '/login': 'Login',
        '/register': 'Register',
    };

    function currentPath() {
        const hash = location.hash.replace(/^#/, '');
        return hash || '/login';
    }

    function navigate() {
        const path = currentPath();
        const loggedIn = Auth.isLoggedIn();

        if (PROTECTED.includes(path) && !loggedIn) {
            location.hash = '#/login';
            return;
        }
        if ((path === '/login' || path === '/register') && loggedIn) {
            location.hash = '#/dashboard';
            return;
        }
        if (!routes[path]) {
            location.hash = loggedIn ? '#/dashboard' : '#/login';
            return;
        }

        updateShell(path);
        updateBreadcrumbs(path);
        routes[path]();

        // Close mobile sidebar on navigation
        document.getElementById('sidebar').classList.remove('mobile-open');
    }

    function updateShell(path) {
        const loggedIn = Auth.isLoggedIn();
        const sidebar = document.getElementById('sidebar');
        const topbar = document.getElementById('topbar');

        // Show/hide topbar and sidebar based on auth state
        if (loggedIn) {
            topbar.style.display = '';
            sidebar.style.display = '';
            const session = Auth.getSession();
            const name = session.username;
            document.getElementById('user-name').textContent = name;
            document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
            document.getElementById('dd-name').textContent = name;
            document.getElementById('dd-role').textContent = session.role;
        } else {
            topbar.style.display = 'none';
            sidebar.style.display = 'none';
            // Reset main margins for auth page
            document.getElementById('main').style.marginLeft = '0';
            document.getElementById('main').style.marginTop = '0';
            document.getElementById('main').style.padding = '0';
        }

        // Active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.route === path);
        });
    }

    function updateBreadcrumbs(path) {
        const bc = document.getElementById('breadcrumbs');
        if (!Auth.isLoggedIn() || path === '/login' || path === '/register') {
            bc.innerHTML = '';
            return;
        }
        bc.innerHTML = `
            <a href="#/dashboard">Home</a>
            <span class="sep">/</span>
            <span class="current">${routeLabels[path] || path}</span>
        `;
    }

    // ---------- Theme ----------
    function initTheme() {
        const saved = localStorage.getItem('im_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
    }
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('im_theme', next);
    }

    // ---------- Sidebar toggle ----------
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-open');
        } else {
            sidebar.classList.toggle('collapsed');
            const main = document.getElementById('main');
            if (sidebar.classList.contains('collapsed')) {
                main.style.marginLeft = 'var(--sidebar-w-collapsed)';
            } else {
                main.style.marginLeft = 'var(--sidebar-w)';
            }
        }
    }

    // ---------- User dropdown ----------
    function toggleDropdown() {
        document.getElementById('user-dropdown').classList.toggle('open');
    }

    // ---------- Notifications ----------
    function openNotifications() {
        document.getElementById('slide-overlay').classList.add('open');
        document.getElementById('notif-panel').classList.add('open');
        loadNotifications();
    }
    function closeNotifications() {
        document.getElementById('slide-overlay').classList.remove('open');
        document.getElementById('notif-panel').classList.remove('open');
    }
    function loadNotifications() {
        const list = document.getElementById('notif-list');
        list.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
        // Try to fetch recent incidents as "notifications"
        Api.get('/api/incidents').then(incidents => {
            const recent = (incidents || []).slice(-5).reverse();
            if (recent.length === 0) {
                list.innerHTML = '<div class="placeholder-state"><h3>No notifications</h3><p>You\'re all caught up.</p></div>';
                return;
            }
            list.innerHTML = recent.map(i => `
                <div class="notif-item">
                    <div class="notif-title">${escapeHtml(i.title)}</div>
                    <div class="notif-desc">Status: ${i.status.replace(/_/g, ' ')} · ${escapeHtml(i.category)}</div>
                    <div class="notif-time">Reported by ${escapeHtml(i.reportedBy)}</div>
                </div>
            `).join('');
        }).catch(() => {
            list.innerHTML = '<div class="placeholder-state"><p>Unable to load notifications.</p></div>';
        });
    }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function logout() {
        Auth.logout();
        location.hash = '#/login';
    }

    // ---------- Init ----------
    initTheme();
    window.addEventListener('hashchange', navigate);
    document.addEventListener('DOMContentLoaded', () => {
        // Event listeners
        document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
        document.getElementById('dd-theme').addEventListener('click', toggleTheme);
        document.getElementById('user-profile-btn').addEventListener('click', toggleDropdown);
        document.getElementById('dd-logout').addEventListener('click', () => { logout(); });
        document.getElementById('notif-btn').addEventListener('click', openNotifications);
        document.getElementById('notif-close').addEventListener('click', closeNotifications);
        document.getElementById('slide-overlay').addEventListener('click', closeNotifications);

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            const btn = document.getElementById('user-profile-btn');
            if (dropdown.classList.contains('open') && !btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        // Start
        if (!location.hash) {
            location.hash = Auth.isLoggedIn() ? '#/dashboard' : '#/login';
        } else {
            navigate();
        }
    });
})();
