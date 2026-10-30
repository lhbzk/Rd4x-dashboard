/* ============================================================
   RD4X DASHBOARD V10 — Global Search Page
   ============================================================ */
'use strict';

const SearchPageState = { q: '', type: 'all', status: 'all', admin: '', dateFrom: '', dateTo: '' };

window.renderSearch = async function(el, params = {}) {
  const initialQ = params.q || '';
  SearchPageState.q = initialQ;

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Busca Global</h1>
        <p class="page-desc">Pesquise por IDs, usuários, tickets, releases, transcripts e mais</p>
      </div>
    </div>

    <div class="card mb-16">
      <input type="text" class="input mb-12" id="search-main" value="${Utils.escapeHtml(initialQ)}" placeholder="Discord ID, Roblox ID, @menção, ticket-1042, HWID-ABC123, 2026-10-30...">
      <div class="filters" style="border:none;padding:0;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">
        <div>
          <label class="filter-label">Tipo</label>
          <select class="select" id="filter-type">
            <option value="all">Todos</option>
            <option value="users">Usuários</option>
            <option value="tickets">Tickets</option>
            <option value="releases">Releases</option>
            <option value="incidents">Incidentes</option>
            <option value="audit">Auditoria</option>
            <option value="transcripts">Transcripts</option>
          </select>
        </div>
        <div>
          <label class="filter-label">Status</label>
          <input type="text" class="input" id="filter-status" placeholder="Ativo, Aberto...">
        </div>
        <div>
          <label class="filter-label">Administrador</label>
          <input type="text" class="input" id="filter-admin" placeholder="admin.alice">
        </div>
        <div>
          <label class="filter-label">Data inicial</label>
          <input type="date" class="input" id="filter-date-from">
        </div>
        <div>
          <label class="filter-label">Data final</label>
          <input type="date" class="input" id="filter-date-to">
        </div>
      </div>
    </div>

    <div id="search-results"></div>
  `;

  const resultsEl = el.querySelector('#search-results');
  const runSearch = () => {
    const q = SearchPageState.q.trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = `
        <div class="empty-state">
          <svg class="icon"><use href="#i-search"/></svg>
          <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px">Digite para buscar</div>
          <div>Exemplos: 123456789012345678 · @usuario · ticket-1042 · HWID-ABC123 · 2026-10-30</div>
        </div>`;
      return;
    }

    const matchDate = (iso) => {
      if (!iso) return true;
      const d = new Date(iso);
      if (SearchPageState.dateFrom) {
        const from = new Date(SearchPageState.dateFrom + 'T00:00:00');
        if (d < from) return false;
      }
      if (SearchPageState.dateTo) {
        const to = new Date(SearchPageState.dateTo + 'T23:59:59');
        if (d > to) return false;
      }
      return true;
    };

    const matchStatus = (s) => !SearchPageState.status || (s && s.toLowerCase().includes(SearchPageState.status.toLowerCase()));
    const matchAdmin = (a) => !SearchPageState.admin || (a && a.toLowerCase().includes(SearchPageState.admin.toLowerCase()));

    const groups = [];

    // USERS
    if (SearchPageState.type === 'all' || SearchPageState.type === 'users') {
      const users = MockData.users.filter(u => {
        if (!matchStatus(u.status)) return false;
        if (!matchDate(u.createdAt)) return false;
        if (!matchAdmin(u.admin || '')) return false;
        const hay = [u.discord, u.discordId, u.roblox, u.robloxId, u.hwid, u.status, u.id].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (users.length) groups.push({
        title: 'Usuários',
        count: users.length,
        items: users.map(u => ({
          title: u.discord,
          sub: `${u.discordId} · ${u.roblox} · ${u.status}`,
          onClick: () => window.openUserProfileModal(u)
        }))
      });
    }

    // TICKETS
    if (SearchPageState.type === 'all' || SearchPageState.type === 'tickets') {
      const tickets = MockData.tickets.filter(t => {
        if (!matchStatus(t.status)) return false;
        if (!matchAdmin(t.assignee || '')) return false;
        if (!matchDate(t.createdAt)) return false;
        const user = MockData.users.find(u => u.id === t.userId);
        const hay = [t.id, t.category, t.priority, t.assignee, t.status, user && user.discord, user && user.discordId].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (tickets.length) groups.push({
        title: 'Tickets',
        count: tickets.length,
        items: tickets.map(t => ({
          title: `${t.id} · ${t.category}`,
          sub: `${t.priority} · ${t.status} · ${t.assignee || 'sem responsável'}`,
          onClick: () => window.openTicketModal(t)
        }))
      });
    }

    // RELEASES
    if (SearchPageState.type === 'all' || SearchPageState.type === 'releases') {
      const releases = MockData.releases.filter(r => {
        if (!matchStatus(r.status)) return false;
        if (!matchAdmin(r.admin || '')) return false;
        if (!matchDate(r.createdAt)) return false;
        const u = MockData.users.find(x => x.id === r.userId);
        const hay = [r.id, r.admin, r.status, r.hwid, u && u.discord, u && u.discordId, u && u.roblox].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (releases.length) groups.push({
        title: 'Releases',
        count: releases.length,
        items: releases.map(r => ({
          title: r.id,
          sub: `${r.admin} · ${r.status} · ${Utils.formatDate(r.createdAt)}`,
          onClick: () => window.openReleaseModal(r)
        }))
      });
    }

    // INCIDENTS
    if (SearchPageState.type === 'all' || SearchPageState.type === 'incidents') {
      const incidents = MockData.incidents.filter(i => {
        if (!matchStatus(i.status)) return false;
        if (!matchAdmin(i.assignee || '')) return false;
        if (!matchDate(i.createdAt)) return false;
        const hay = [i.id, i.type, i.severity, i.status, i.assignee, i.description].join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (incidents.length) groups.push({
        title: 'Incidentes',
        count: incidents.length,
        items: incidents.map(i => ({
          title: `${i.id} · ${i.type}`,
          sub: `${i.severity} · ${i.status}`,
          onClick: () => window.openIncidentModal(i)
        }))
      });
    }

    // AUDIT
    if (SearchPageState.type === 'all' || SearchPageState.type === 'audit') {
      const audit = MockData.audit.filter(a => {
        if (!matchAdmin(a.admin || '')) return false;
        if (!matchDate(a.createdAt)) return false;
        const hay = [a.admin, a.action, a.target, a.result, a.details].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (audit.length) groups.push({
        title: 'Auditoria',
        count: audit.length,
        items: audit.map(a => ({
          title: `${a.action} — ${a.admin}`,
          sub: `${a.target || '—'} · ${Utils.formatDate(a.createdAt)}`,
          onClick: () => window.openAuditModal(a)
        }))
      });
    }

    // TRANSCRIPTS
    if (SearchPageState.type === 'all' || SearchPageState.type === 'transcripts') {
      const transcripts = MockData.transcripts.filter(t => {
        if (!matchAdmin(t.admin || '')) return false;
        if (!matchDate(t.createdAt)) return false;
        const u = MockData.users.find(x => x.id === t.userId);
        const hay = [t.id, t.ticketId, t.admin, u && u.discord, ...t.messages.map(m => m.text)].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (transcripts.length) groups.push({
        title: 'Transcripts',
        count: transcripts.length,
        items: transcripts.map(t => ({
          title: `${t.id} · ${t.ticketId}`,
          sub: `${t.messages.length} mensagens · ${t.admin}`,
          onClick: () => window.openTranscriptModal(t)
        }))
      });
    }

    if (!groups.length) {
      resultsEl.innerHTML = `
        <div class="empty-state">
          <svg class="icon"><use href="#i-search"/></svg>
          <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px">Nenhum resultado encontrado</div>
          <div>Tente buscar por outro termo ou ajustar os filtros.</div>
        </div>`;
      return;
    }

    resultsEl.innerHTML = groups.map(g => `
      <div class="search-group">
        <div class="search-group-head">
          <span>${Utils.escapeHtml(g.title)}</span>
          <span class="badge info">${g.count}</span>
        </div>
        ${g.items.map((item, i) => `
          <div class="search-result" data-group="${Utils.escapeHtml(g.title)}" data-idx="${i}">
            <div class="search-result-info">
              <div class="search-result-title">${Utils.highlight(item.title, q)}</div>
              <div class="search-result-sub">${Utils.highlight(item.sub, q)}</div>
            </div>
            <div class="search-result-type">${Utils.escapeHtml(g.title)}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    groups.forEach(g => {
      g.items.forEach((item, i) => {
        const node = resultsEl.querySelector(`[data-group="${CSS.escape(g.title)}"][data-idx="${i}"]`);
        if (node) node.addEventListener('click', item.onClick);
      });
    });
  };

  el.querySelector('#search-main').addEventListener('input', Utils.debounce(e => {
    SearchPageState.q = e.target.value; runSearch();
  }, 200));
  el.querySelector('#filter-type').addEventListener('change', e => { SearchPageState.type = e.target.value; runSearch(); });
  el.querySelector('#filter-status').addEventListener('input', Utils.debounce(e => { SearchPageState.status = e.target.value; runSearch(); }, 200));
  el.querySelector('#filter-admin').addEventListener('input', Utils.debounce(e => { SearchPageState.admin = e.target.value; runSearch(); }, 200));
  el.querySelector('#filter-date-from').addEventListener('change', e => { SearchPageState.dateFrom = e.target.value; runSearch(); });
  el.querySelector('#filter-date-to').addEventListener('change', e => { SearchPageState.dateTo = e.target.value; runSearch(); });

  runSearch();
  if (initialQ) {
    setTimeout(() => el.querySelector('#search-main').focus(), 100);
  }
};