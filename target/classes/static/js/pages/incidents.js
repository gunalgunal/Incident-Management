/**
 * Incidents page — data table with sorting/filtering + create incident modal.
 */
const IncidentsPage = (function () {
    let incidents = [];
    let sortKey = 'id';
    let sortDir = 'desc';
    let filterStatus = '';
    let filterPriority = '';
    let filterSearch = '';

    async function render() {
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="fade-in">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Incidents</h1>
                        <p class="page-subtitle">Manage and track all reported incidents</p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="new-incident-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Incident
                    </button>
                </div>
                <div id="incidents-content">
                    <div class="loading-state"><div class="spinner"></div></div>
                </div>
            </div>
        `;
        document.getElementById('new-incident-btn').addEventListener('click', openCreateModal);
        try {
            incidents = await Api.get('/api/incidents');
            renderTable();
        } catch (err) {
            document.getElementById('incidents-content').innerHTML =
                `<div class="alert alert-error">${escapeHtml(err.message || 'Failed to load incidents')}</div>`;
        }
    }

    function renderTable() {
        const content = document.getElementById('incidents-content');
        const filtered = applyFilters();

        content.innerHTML = `
            <!-- Filter bar -->
            <div class="card" style="margin-bottom: var(--sp-4);">
                <div class="card-body" style="display:flex; gap:var(--sp-3); flex-wrap:wrap; align-items:center;">
                    <div style="position:relative; flex:1; min-width:200px;">
                        <svg style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-tertiary);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" id="filter-search" placeholder="Search incidents..." value="${escapeAttr(filterSearch)}" style="width:100%; height:36px; padding:0 var(--sp-3) 0 34px; border:1px solid var(--border); border-radius:var(--r-md); background:var(--surface); color:var(--text);">
                    </div>
                    <select id="filter-status" style="height:36px; padding:0 28px 0 12px; border:1px solid var(--border); border-radius:var(--r-md); background:var(--surface); color:var(--text); cursor:pointer; appearance:none;">
                        <option value="">All Statuses</option>
                        <option value="NEW" ${filterStatus === 'NEW' ? 'selected' : ''}>New</option>
                        <option value="ASSIGNED" ${filterStatus === 'ASSIGNED' ? 'selected' : ''}>Assigned</option>
                        <option value="IN_PROGRESS" ${filterStatus === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                        <option value="RESOLVED" ${filterStatus === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
                        <option value="CLOSED" ${filterStatus === 'CLOSED' ? 'selected' : ''}>Closed</option>
                    </select>
                    <select id="filter-priority" style="height:36px; padding:0 28px 0 12px; border:1px solid var(--border); border-radius:var(--r-md); background:var(--surface); color:var(--text); cursor:pointer; appearance:none;">
                        <option value="">All Priorities</option>
                        <option value="LOW" ${filterPriority === 'LOW' ? 'selected' : ''}>Low</option>
                        <option value="MEDIUM" ${filterPriority === 'MEDIUM' ? 'selected' : ''}>Medium</option>
                        <option value="HIGH" ${filterPriority === 'HIGH' ? 'selected' : ''}>High</option>
                        <option value="CRITICAL" ${filterPriority === 'CRITICAL' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
            </div>

            <!-- Table -->
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th data-sort="id">ID <span class="sort-icon">${sortIcon('id')}</span></th>
                            <th data-sort="title">Title <span class="sort-icon">${sortIcon('title')}</span></th>
                            <th data-sort="category">Category <span class="sort-icon">${sortIcon('category')}</span></th>
                            <th data-sort="priority">Priority <span class="sort-icon">${sortIcon('priority')}</span></th>
                            <th data-sort="status">Status <span class="sort-icon">${sortIcon('status')}</span></th>
                            <th data-sort="reportedBy">Reported By <span class="sort-icon">${sortIcon('reportedBy')}</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.length === 0
                            ? `<tr><td colspan="6" style="text-align:center; padding:var(--sp-12); color:var(--text-tertiary);">No incidents found</td></tr>`
                            : filtered.map(i => `
                                <tr>
                                    <td class="id-cell">#${i.id}</td>
                                    <td class="title-cell">${escapeHtml(i.title)}</td>
                                    <td>${escapeHtml(i.category)}</td>
                                    <td><span class="badge badge-${i.priority.toLowerCase()}">${i.priority}</span></td>
                                    <td><span class="badge badge-${i.status.toLowerCase()}">${i.status.replace(/_/g, ' ')}</span></td>
                                    <td>${escapeHtml(i.reportedBy || '—')}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top:var(--sp-3); font-size:12px; color:var(--text-tertiary); text-align:right;">
                Showing ${filtered.length} of ${incidents.length} incidents
            </div>
        `;

        // Bind sort
        document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else { sortKey = key; sortDir = 'asc'; }
                renderTable();
            });
        });
        // Mark sorted column
        var sortedTh = document.querySelector('.data-table th[data-sort="' + sortKey + '"]');
        if (sortedTh) sortedTh.classList.add('sorted');

        // Bind filters
        document.getElementById('filter-search').addEventListener('input', (e) => { filterSearch = e.target.value; renderTableBody(); });
        document.getElementById('filter-status').addEventListener('change', (e) => { filterStatus = e.target.value; renderTableBody(); });
        document.getElementById('filter-priority').addEventListener('change', (e) => { filterPriority = e.target.value; renderTableBody(); });
    }

    function renderTableBody() {
        // Re-render full table to update counts + sort indicators
        renderTable();
    }

    function applyFilters() {
        let list = incidents.slice();
        if (filterStatus) list = list.filter(i => i.status === filterStatus);
        if (filterPriority) list = list.filter(i => i.priority === filterPriority);
        if (filterSearch) {
            const q = filterSearch.toLowerCase();
            list = list.filter(i =>
                (i.title || '').toLowerCase().includes(q) ||
                (i.description || '').toLowerCase().includes(q) ||
                (i.category || '').toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            let av = a[sortKey], bv = b[sortKey];
            if (typeof av === 'string') av = av.toLowerCase();
            if (typeof bv === 'string') bv = bv.toLowerCase();
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }

    function sortIcon(key) {
        if (sortKey !== key) return '↕';
        return sortDir === 'asc' ? '↑' : '↓';
    }

    // ---------- Create modal ----------
    function openCreateModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <span class="modal-title">Create New Incident</span>
                    <button class="modal-close" id="modal-close">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="modal-alert" class="alert alert-error hidden"></div>
                    <form id="create-incident-form">
                        <div class="form-group">
                            <label for="ci-title">Title</label>
                            <input type="text" id="ci-title" placeholder="Brief incident title" required>
                            <div class="field-error" id="ci-title-error"></div>
                        </div>
                        <div class="form-group">
                            <label for="ci-description">Description</label>
                            <textarea id="ci-description" placeholder="Detailed description of the incident" rows="4" required></textarea>
                            <div class="field-error" id="ci-description-error"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="ci-category">Category</label>
                                <input type="text" id="ci-category" placeholder="e.g. Database, Network" required>
                                <div class="field-error" id="ci-category-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="ci-priority">Priority</label>
                                <select id="ci-priority" required>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM" selected>Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                                <div class="field-error" id="ci-priority-error"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="ci-reportedBy">Reported By</label>
                            <input type="text" id="ci-reportedBy" placeholder="Your username" required>
                            <div class="field-error" id="ci-reportedBy-error"></div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                    <button class="btn btn-primary" id="modal-submit">Create Incident</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('open'));

        // Pre-fill reportedBy with logged-in user
        const session = Auth.getSession();
        if (session) document.getElementById('ci-reportedBy').value = session.username;

        const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); };
        document.getElementById('modal-close').addEventListener('click', close);
        document.getElementById('modal-cancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        document.getElementById('modal-submit').addEventListener('click', async () => {
            clearModalErrors();
            const payload = {
                title: document.getElementById('ci-title').value.trim(),
                description: document.getElementById('ci-description').value.trim(),
                category: document.getElementById('ci-category').value.trim(),
                priority: document.getElementById('ci-priority').value,
                reportedBy: document.getElementById('ci-reportedBy').value.trim(),
            };
            let valid = true;
            Object.entries(payload).forEach(([k, v]) => {
                if (!v) { document.getElementById('ci-' + k + '-error').textContent = 'Required'; valid = false; }
            });
            if (!valid) return;

            const btn = document.getElementById('modal-submit');
            btn.disabled = true; btn.textContent = 'Creating...';
            try {
                const created = await Api.post('/api/incidents', payload);
                incidents.push(created);
                close();
                renderTable();
            } catch (err) {
                if (err.status === 400 && err.errors) {
                    Object.entries(err.errors).forEach(([f, m]) => {
                        const el = document.getElementById('ci-' + f + '-error');
                        if (el) el.textContent = m;
                    });
                } else {
                    document.getElementById('modal-alert').textContent = err.message || 'Failed to create incident';
                    document.getElementById('modal-alert').classList.remove('hidden');
                }
                btn.disabled = false; btn.textContent = 'Create Incident';
            }
        });
    }

    function clearModalErrors() {
        document.querySelectorAll('[id^="ci-"][id$="-error"]').forEach(e => e.textContent = '');
        var alertEl = document.getElementById('modal-alert');
        if (alertEl) alertEl.classList.add('hidden');
    }

    function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
    function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '"'); }

    return { render };
})();
