/**
 * Dashboard page — KPI cards, SVG donut chart, bar chart, count breakdowns.
 */
const DashboardPage = (function () {

    async function render() {
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="fade-in">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Dashboard</h1>
                        <p class="page-subtitle">Overview of incidents across your organization</p>
                    </div>
                    <a href="#/incidents" class="btn btn-secondary btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Incident
                    </a>
                </div>
                <div id="dash-content">
                    <div class="loading-state"><div class="spinner"></div></div>
                </div>
            </div>
        `;
        try {
            const [summary, byStatus, byCategory, byPriority] = await Promise.all([
                Api.get('/api/dashboard/summary'),
                Api.get('/api/dashboard/counts/by-status'),
                Api.get('/api/dashboard/counts/by-category'),
                Api.get('/api/dashboard/counts/by-priority'),
            ]);
            renderContent(summary, byStatus, byCategory, byPriority);
        } catch (err) {
            document.getElementById('dash-content').innerHTML =
                `<div class="alert alert-error">${escapeHtml(err.message || 'Failed to load dashboard')}</div>`;
        }
    }

    function renderContent(summary, byStatus, byCategory, byPriority) {
        const c = document.getElementById('dash-content');
        const total = summary.totalOpen + summary.totalResolved;

        c.innerHTML = `
            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Total Incidents</span>
                        <span class="kpi-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </span>
                    </div>
                    <div class="kpi-value">${total}</div>
                    <div class="kpi-trend">All time</div>
                </div>
                <div class="kpi-card warning">
                    <div class="kpi-header">
                        <span class="kpi-label">Open</span>
                        <span class="kpi-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </span>
                    </div>
                    <div class="kpi-value">${summary.totalOpen}</div>
                    <div class="kpi-trend">Awaiting resolution</div>
                </div>
                <div class="kpi-card success">
                    <div class="kpi-header">
                        <span class="kpi-label">Resolved</span>
                        <span class="kpi-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </span>
                    </div>
                    <div class="kpi-value">${summary.totalResolved}</div>
                    <div class="kpi-trend up">${total > 0 ? Math.round(summary.totalResolved / total * 100) : 0}% resolution rate</div>
                </div>
                <div class="kpi-card error">
                    <div class="kpi-header">
                        <span class="kpi-label">Critical Priority</span>
                        <span class="kpi-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </span>
                    </div>
                    <div class="kpi-value">${getCount(byPriority, 'CRITICAL')}</div>
                    <div class="kpi-trend">Need immediate attention</div>
                </div>
            </div>

            <!-- Charts row -->
            <div class="stat-row">
                <div class="card chart-card">
                    <div class="card-header">
                        <span class="card-title">By Status</span>
                    </div>
                    <div class="card-body">
                        ${donutChart(byStatus, [
                            { label: 'NEW', color: '#2563EB' },
                            { label: 'ASSIGNED', color: '#F59E0B' },
                            { label: 'IN_PROGRESS', color: '#3B82F6' },
                            { label: 'RESOLVED', color: '#10B981' },
                            { label: 'CLOSED', color: '#9CA3AF' },
                        ])}
                    </div>
                </div>
                <div class="card chart-card">
                    <div class="card-header">
                        <span class="card-title">By Priority</span>
                    </div>
                    <div class="card-body">
                        ${barChart(byPriority, [
                            { label: 'LOW', color: '#9CA3AF' },
                            { label: 'MEDIUM', color: '#F59E0B' },
                            { label: 'HIGH', color: '#EA580C' },
                            { label: 'CRITICAL', color: '#EF4444' },
                        ])}
                    </div>
                </div>
            </div>

            <!-- Category breakdown -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Incidents by Category</span>
                </div>
                <div class="card-body">
                    ${countList(byCategory)}
                </div>
            </div>
        `;
    }

    function donutChart(data, palette) {
        const total = data.reduce((s, d) => s + d.count, 0);
        if (total === 0) return '<div class="placeholder-state"><p>No data available</p></div>';

        const r = 60, stroke = 24, cx = 80, cy = 80;
        const circumference = 2 * Math.PI * r;
        let offset = 0;
        const segments = palette.map(p => {
            const item = data.find(d => d.label === p.label);
            const count = item ? item.count : 0;
            if (count === 0) return null;
            const pct = count / total;
            const dash = pct * circumference;
            const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${stroke}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
            offset += dash;
            return { label: p.label, color: p.color, count };
        }).filter(Boolean);

        return `
            <div class="donut-wrap">
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-active)" stroke-width="${stroke}"/>
                    ${segments.map(s => s ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${(s.count/total)*circumference} ${circumference - (s.count/total)*circumference}" stroke-dashoffset="${-offset + (segments.slice(0, segments.indexOf(s)).reduce((acc, s2) => acc + (s2.count/total)*circumference, 0))}" transform="rotate(-90 ${cx} ${cy})" style="transition: stroke-dasharray 0.6s ease;"/>` : '').join('')}
                    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="28" font-weight="800" fill="var(--text)">${total}</text>
                    <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="var(--text-tertiary)">Total</text>
                </svg>
                <div class="donut-legend">
                    ${segments.map(s => `
                        <div class="legend-item">
                            <span class="legend-dot" style="background:${s.color}"></span>
                            <span class="legend-label">${s.label.replace(/_/g, ' ')}</span>
                            <span class="legend-value">${s.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function barChart(data, palette) {
        const max = Math.max(...data.map(d => d.count), 1);
        const barH = 140, barW = 40, gap = 16;
        const totalW = palette.length * (barW + gap) - gap;
        return `
            <div style="display:flex; align-items:flex-end; justify-content:center; gap:${gap}px; height:${barH + 40}px; padding-top:20px;">
                ${palette.map(p => {
                    const item = data.find(d => d.label === p.label);
                    const count = item ? item.count : 0;
                    const h = (count / max) * barH;
                    return `
                        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                            <span style="font-size:12px; font-weight:700; color:var(--text-secondary);">${count}</span>
                            <div style="width:${barW}px; height:${Math.max(h, 2)}px; border-radius:6px 6px 0 0; background:${p.color}; transition: height 0.5s ease; opacity:0.85;"></div>
                            <span style="font-size:10px; font-weight:600; color:var(--text-tertiary); text-transform:uppercase;">${p.label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function countList(items) {
        if (!items || items.length === 0) return '<div class="placeholder-state"><p>No data available</p></div>';
        return `<ul class="count-list">${items.map(i =>
            `<li><span class="label">${escapeHtml(formatLabel(i.label))}</span><span class="count">${i.count}</span></li>`
        ).join('')}</ul>`;
    }

    function getCount(items, label) {
        const item = items.find(i => i.label === label);
        return item ? item.count : 0;
    }

    function formatLabel(label) { return String(label).replace(/_/g, ' '); }
    function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

    return { render };
})();
