/**
 * Recommendations page — pick an open incident, view similar resolved incidents
 * with similarity bars, and accept/reject a recommendation.
 */
const RecommendationsPage = (function () {
    let incidents = [];
    let selectedId = null;
    let recommendations = [];

    async function render() {
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="fade-in">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Recommendations</h1>
                        <p class="page-subtitle">Find similar resolved incidents and reuse their solutions</p>
                    </div>
                </div>
                <div id="rec-content">
                    <div class="loading-state"><div class="spinner"></div></div>
                </div>
            </div>
        `;
        try {
            incidents = await Api.get('/api/incidents');
            // Default to open incidents only for selection
            renderLayout();
        } catch (err) {
            document.getElementById('rec-content').innerHTML =
                `<div class="alert alert-error">${escapeHtml(err.message || 'Failed to load')}</div>`;
        }
    }

    function renderLayout() {
        const openIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
        const content = document.getElementById('rec-content');
        content.innerHTML = `
            <div class="card" style="margin-bottom: var(--sp-4);">
                <div class="card-body">
                    <label style="font-size:13px; font-weight:600; color:var(--text-secondary); margin-bottom:var(--sp-2); display:block;">Select an open incident</label>
                    <select id="rec-incident-select" style="width:100%; max-width:500px; height:40px; padding:0 36px 0 12px; border:1px solid var(--border); border-radius:var(--r-md); background:var(--surface); color:var(--text); cursor:pointer; appearance:none;">
                        <option value="">— Choose an incident —</option>
                        ${openIncidents.map(i => `<option value="${i.id}">#${i.id} — ${escapeHtml(i.title)} (${escapeHtml(i.category)})</option>`).join('')}
                    </select>
                </div>
            </div>
            <div id="rec-results"></div>
        `;
        document.getElementById('rec-incident-select').addEventListener('change', async (e) => {
            selectedId = e.target.value;
            if (!selectedId) { document.getElementById('rec-results').innerHTML = ''; return; }
            await loadRecommendations(selectedId);
        });
        if (openIncidents.length > 0 && !selectedId) {
            selectedId = openIncidents[0].id;
            document.getElementById('rec-incident-select').value = selectedId;
            loadRecommendations(selectedId);
        }
    }

    async function loadRecommendations(id) {
        const results = document.getElementById('rec-results');
        results.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
        try {
            recommendations = await Api.get(`/api/incidents/${id}/recommendations?limit=5`);
            renderRecommendations(id);
        } catch (err) {
            results.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message || 'Failed to load recommendations')}</div>`;
        }
    }

    function renderRecommendations(incidentId) {
        const results = document.getElementById('rec-results');
        if (recommendations.length === 0) {
            results.innerHTML = `
                <div class="card">
                    <div class="card-body placeholder-state">
                        <h3>No recommendations yet</h3>
                        <p>There are no resolved incidents in the same category with similar descriptions. Resolve some incidents to build up your recommendation base.</p>
                    </div>
                </div>
            `;
            return;
        }
        results.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:var(--sp-4);">
                ${recommendations.map(r => `
                    <div class="card hoverable" data-rec-id="${r.incidentId}">
                        <div class="card-body">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:var(--sp-4); margin-bottom:var(--sp-3);">
                                <div>
                                    <div style="display:flex; align-items:center; gap:var(--sp-2); margin-bottom:var(--sp-1);">
                                        <span style="font-weight:700; color:var(--primary);">#${r.incidentId}</span>
                                        <span style="font-size:15px; font-weight:700;">${escapeHtml(r.title)}</span>
                                    </div>
                                    <div style="font-size:12px; color:var(--text-tertiary);">
                                        ${escapeHtml(r.category)} · ${r.priority} · Resolved by ${escapeHtml(r.resolvedBy || 'engineer')}
                                    </div>
                                </div>
                                <div class="sim-bar-wrap">
                                    <div class="sim-bar"><div class="sim-bar-fill" style="width:${Math.round(r.similarity * 100)}%"></div></div>
                                    <span class="sim-pct">${Math.round(r.similarity * 100)}%</span>
                                </div>
                            </div>
                            ${r.solution ? `
                                <div style="background:var(--bg); border:1px solid var(--border); border-radius:var(--r-md); padding:var(--sp-3) var(--sp-4); margin:var(--sp-3) 0;">
                                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-tertiary); margin-bottom:var(--sp-1);">Recommended Solution</div>
                                    <div style="font-size:13px; line-height:1.6;">${escapeHtml(r.solution)}</div>
                                </div>
                            ` : ''}
                            <div style="display:flex; gap:var(--sp-2); margin-top:var(--sp-3);">
                                <button class="btn btn-primary btn-sm" data-action="accept" data-rec-id="${r.incidentId}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                    Accept
                                </button>
                                <button class="btn btn-secondary btn-sm" data-action="reject" data-rec-id="${r.incidentId}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Bind accept/reject
        results.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', () => handleDecision(btn.dataset.action, btn.dataset.recId, incidentId));
        });
    }

    async function handleDecision(action, recId, incidentId) {
        const session = Auth.getSession();
        const payload = {
            recommendationIncidentId: parseInt(recId, 10),
            decision: action === 'accept' ? 'ACCEPT' : 'REJECT',
            decidedBy: session ? session.username : 'user',
            comment: '',
        };
        try {
            await Api.post(`/api/incidents/${incidentId}/recommendation/decision`, payload);
            // Reload incidents and recommendations
            incidents = await Api.get('/api/incidents');
            if (action === 'accept') {
                // Incident is now resolved, go back to selection
                selectedId = null;
                renderLayout();
            } else {
                // Refresh recommendations
                await loadRecommendations(incidentId);
            }
        } catch (err) {
            alert(err.message || 'Failed to process decision');
        }
    }

    function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

    return { render };
})();
