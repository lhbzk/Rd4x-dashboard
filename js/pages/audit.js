/* ============================================================
   RD4X DASHBOARD V10 — AUDITORIA REAL
   ============================================================ */
'use strict';

window.renderAudit = async function (content, params = {}) {
  const PAGE_SIZE = 50;

  content.innerHTML = `
    <div class="page audit-page">

      <div class="page-header">
        <div>
          <div class="page-title">Auditoria</div>
          <div class="page-subtitle">
            Histórico real de ações administrativas do RD4X.
          </div>
        </div>

        <button class="btn btn-secondary" id="audit-refresh">
          <svg class="icon">
            <use href="#i-refresh"></use>
          </svg>
          Atualizar
        </button>
      </div>

      <div class="audit-stats" id="audit-stats">
        <div class="stat-card">
          <div class="stat-label">Eventos</div>
          <div class="stat-value">—</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Hoje</div>
          <div class="stat-value">—</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Administradores</div>
          <div class="stat-value">—</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Ações</div>
          <div class="stat-value">—</div>
        </div>
      </div>

      <div class="panel audit-panel">

        <div class="audit-toolbar">

          <div class="search-box">
            <svg class="icon">
              <use href="#i-search"></use>
            </svg>

            <input
              type="text"
              id="audit-search"
              placeholder="Buscar por administrador, ação, alvo..."
              autocomplete="off"
            >
          </div>

          <select id="audit-action-filter" class="select">
            <option value="">Todas as ações</option>
          </select>

          <select id="audit-date-filter" class="select">
            <option value="">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>

        </div>

        <div id="audit-table">
          <div class="loading-state">
            Carregando auditoria...
          </div>
        </div>

      </div>

    </div>

    <style>
      .audit-page {
        padding-bottom: 40px;
      }

      .audit-page .page-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        margin-bottom:22px;
      }

      .audit-page .page-title {
        font-size:24px;
        font-weight:700;
        color:var(--text-primary);
      }

      .audit-page .page-subtitle {
        margin-top:5px;
        font-size:13px;
        color:var(--text-secondary);
      }

      .audit-stats {
        display:grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap:14px;
        margin-bottom:18px;
      }

      .audit-stats .stat-card {
        padding:18px;
        border:1px solid var(--border);
        border-radius:14px;
        background:var(--card);
      }

      .audit-stats .stat-label {
        font-size:12px;
        color:var(--text-secondary);
        margin-bottom:8px;
      }

      .audit-stats .stat-value {
        font-size:24px;
        font-weight:700;
        color:var(--text-primary);
      }

      .audit-panel {
        overflow:hidden;
      }

      .audit-toolbar {
        display:flex;
        align-items:center;
        gap:10px;
        padding:16px;
        border-bottom:1px solid var(--border);
        flex-wrap:wrap;
      }

      .search-box {
        position:relative;
        flex:1;
        min-width:220px;
      }

      .search-box .icon {
        position:absolute;
        left:12px;
        top:50%;
        transform:translateY(-50%);
        width:16px;
        height:16px;
        color:var(--text-secondary);
      }

      .search-box input {
        width:100%;
        height:40px;
        padding:0 12px 0 38px;
        border:1px solid var(--border);
        border-radius:9px;
        background:var(--background);
        color:var(--text-primary);
        outline:none;
      }

      .search-box input:focus {
        border-color:var(--accent);
      }

      .select {
        height:40px;
        padding:0 12px;
        border:1px solid var(--border);
        border-radius:9px;
        background:var(--background);
        color:var(--text-primary);
        outline:none;
      }

      .audit-table-wrap {
        width:100%;
        overflow-x:auto;
      }

      .audit-table {
        width:100%;
        border-collapse:collapse;
        min-width:850px;
      }

      .audit-table th {
        text-align:left;
        padding:13px 16px;
        font-size:11px;
        font-weight:700;
        text-transform:uppercase;
        letter-spacing:.04em;
        color:var(--text-secondary);
        border-bottom:1px solid var(--border);
        white-space:nowrap;
      }

      .audit-table td {
        padding:14px 16px;
        border-bottom:1px solid var(--border);
        font-size:13px;
        color:var(--text-primary);
        vertical-align:middle;
      }

      .audit-table tr:last-child td {
        border-bottom:0;
      }

      .audit-table tbody tr {
        transition:.15s ease;
      }

      .audit-table tbody tr:hover {
        background:rgba(255,255,255,.025);
      }

      .audit-time {
        white-space:nowrap;
        color:var(--text-secondary);
      }

      .audit-actor {
        font-weight:600;
      }

      .audit-target {
        color:var(--text-secondary);
      }

      .audit-action {
        display:inline-flex;
        align-items:center;
        padding:4px 8px;
        border-radius:7px;
        background:rgba(255,255,255,.06);
        border:1px solid var(--border);
        font-size:11px;
        font-weight:600;
      }

      .audit-details {
        max-width:320px;
        color:var(--text-secondary);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .audit-empty {
        padding:55px 20px;
        text-align:center;
        color:var(--text-secondary);
      }

      .audit-empty-title {
        margin-bottom:5px;
        font-size:15px;
        font-weight:600;
        color:var(--text-primary);
      }

      .audit-pagination {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        padding:14px 16px;
        border-top:1px solid var(--border);
      }

      .audit-page-info {
        font-size:12px;
        color:var(--text-secondary);
      }

      .audit-pagination-actions {
        display:flex;
        gap:8px;
      }

      .audit-detail-modal {
        position:fixed;
        inset:0;
        z-index:9999;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.65);
      }

      .audit-detail-modal.open {
        display:flex;
      }

      .audit-detail-box {
        width:min(650px, 100%);
        max-height:85vh;
        overflow:auto;
        padding:22px;
        border:1px solid var(--border);
        border-radius:16px;
        background:var(--card);
        box-shadow:0 20px 60px rgba(0,0,0,.35);
      }

      .audit-detail-head {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:18px;
      }

      .audit-detail-title {
        font-size:18px;
        font-weight:700;
      }

      .audit-detail-grid {
        display:grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap:12px;
      }

      .audit-detail-field {
        padding:12px;
        border:1px solid var(--border);
        border-radius:10px;
      }

      .audit-detail-label {
        font-size:11px;
        color:var(--text-secondary);
        margin-bottom:5px;
        text-transform:uppercase;
      }

      .audit-detail-value {
        font-size:13px;
        color:var(--text-primary);
        word-break:break-word;
      }

      .audit-json {
        margin-top:14px;
        padding:14px;
        border-radius:10px;
        background:var(--background);
        border:1px solid var(--border);
        overflow:auto;
        font-size:12px;
        line-height:1.5;
        color:var(--text-secondary);
      }

      @media (max-width:900px) {
        .audit-stats {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width:600px) {
        .audit-page .page-header {
          align-items:flex-start;
        }

        .audit-stats {
          grid-template-columns:1fr 1fr;
        }

        .audit-toolbar {
          align-items:stretch;
        }

        .search-box,
        .select {
          width:100%;
        }

        .audit-detail-grid {
          grid-template-columns:1fr;
        }
      }
    </style>

    <div class="audit-detail-modal" id="audit-modal">
      <div class="audit-detail-box">

        <div class="audit-detail-head">
          <div class="audit-detail-title">
            Detalhes da auditoria
          </div>

          <button
            class="btn btn-secondary"
            id="audit-modal-close"
          >
            Fechar
          </button>
        </div>

        <div id="audit-modal-content"></div>

      </div>
    </div>
  `;

  const table =
    document.getElementById('audit-table');

  const searchInput =
    document.getElementById('audit-search');

  const actionFilter =
    document.getElementById('audit-action-filter');

  const dateFilter =
    document.getElementById('audit-date-filter');

  const refreshButton =
    document.getElementById('audit-refresh');

  const modal =
    document.getElementById('audit-modal');

  const modalClose =
    document.getElementById('audit-modal-close');

  const modalContent =
    document.getElementById('audit-modal-content');

  let events = [];
  let filtered = [];
  let page = 1;

  const escape =
    value =>
      Utils.escapeHtml(
        value === null ||
        value === undefined
          ? ''
          : String(value)
      );

  function normalizeEvent(event) {
    return {
      id:
        event?.id ||
        event?._id ||
        cryptoRandomFallback(),

      at:
        event?.at ||
        event?.createdAt ||
        event?.timestamp ||
        null,

      actor:
        event?.actor ||
        event?.actorTag ||
        event?.admin ||
        'Sistema',

      action:
        event?.action ||
        event?.type ||
        'unknown',

      target:
        event?.target ||
        event?.nick ||
        event?.user ||
        '',

      details:
        event?.details ||
        {}
    };
  }

  function cryptoRandomFallback() {
    return `audit-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  function formatDate(value) {
    if (!value) return '—';

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString(
      'pt-BR',
      {
        dateStyle:'short',
        timeStyle:'short'
      }
    );
  }

  function startOfDay(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
  }

  function detailText(details) {
    if (
      details === null ||
      details === undefined
    ) {
      return '';
    }

    if (
      typeof details === 'string' ||
      typeof details === 'number' ||
      typeof details === 'boolean'
    ) {
      return String(details);
    }

    try {
      return JSON.stringify(details);
    } catch {
      return '[detalhes]';
    }
  }

  function updateStats() {
    const todayStart =
      startOfDay(new Date());

    const today =
      events.filter(event => {
        if (!event.at) return false;

        const date =
          new Date(event.at);

        if (Number.isNaN(date.getTime())) {
          return false;
        }

        return date.getTime() >= todayStart;
      }).length;

    const actors =
      new Set(
        events
          .map(event => event.actor)
          .filter(Boolean)
      ).size;

    const actions =
      new Set(
        events
          .map(event => event.action)
          .filter(Boolean)
      ).size;

    const cards =
      document.querySelectorAll(
        '#audit-stats .stat-value'
      );

    if (cards[0]) cards[0].textContent =
      events.length.toLocaleString('pt-BR');

    if (cards[1]) cards[1].textContent =
      today.toLocaleString('pt-BR');

    if (cards[2]) cards[2].textContent =
      actors.toLocaleString('pt-BR');

    if (cards[3]) cards[3].textContent =
      actions.toLocaleString('pt-BR');
  }

  function populateActions() {
    const actions =
      [...new Set(
        events
          .map(event => event.action)
          .filter(Boolean)
      )]
      .sort((a, b) =>
        String(a).localeCompare(
          String(b),
          'pt-BR'
        )
      );

    actionFilter.innerHTML = `
      <option value="">Todas as ações</option>
      ${actions.map(action => `
        <option value="${escape(action)}">
          ${escape(action)}
        </option>
      `).join('')}
    `;
  }

  function applyFilters() {
    const query =
      searchInput.value
        .trim()
        .toLowerCase();

    const action =
      actionFilter.value;

    const date =
      dateFilter.value;

    const now =
      Date.now();

    const limit =
      date === 'today'
        ? startOfDay(new Date())
        : date
          ? now -
            Number(date) *
            86400000
          : null;

    filtered =
      events.filter(event => {

        if (action &&
            event.action !== action) {
          return false;
        }

        if (limit !== null) {
          if (!event.at) return false;

          const time =
            new Date(event.at).getTime();

          if (Number.isNaN(time) ||
              time < limit) {
            return false;
          }
        }

        if (!query) {
          return true;
        }

        const haystack =
          [
            event.id,
            event.actor,
            event.action,
            event.target,
            detailText(event.details)
          ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });

    page = 1;
    renderTable();
  }

  function renderTable() {
    const total =
      filtered.length;

    const totalPages =
      Math.max(
        1,
        Math.ceil(total / PAGE_SIZE)
      );

    if (page > totalPages) {
      page = totalPages;
    }

    const start =
      (page - 1) *
      PAGE_SIZE;

    const rows =
      filtered.slice(
        start,
        start + PAGE_SIZE
      );

    if (!rows.length) {
      table.innerHTML = `
        <div class="audit-empty">
          <div class="audit-empty-title">
            Nenhum evento encontrado
          </div>

          <div>
            Não existem registros
            correspondentes aos filtros atuais.
          </div>
        </div>
      `;
      return;
    }

    table.innerHTML = `
      <div class="audit-table-wrap">

        <table class="audit-table">

          <thead>
            <tr>
              <th>Data</th>
              <th>Administrador</th>
              <th>Ação</th>
              <th>Alvo</th>
              <th>Detalhes</th>
            </tr>
          </thead>

          <tbody>
            ${rows.map((event, index) => `
              <tr
                class="audit-row"
                data-index="${index}"
              >
                <td class="audit-time">
                  ${escape(formatDate(event.at))}
                </td>

                <td>
                  <div class="audit-actor">
                    ${escape(event.actor)}
                  </div>
                </td>

                <td>
                  <span class="audit-action">
                    ${escape(event.action)}
                  </span>
                </td>

                <td class="audit-target">
                  ${escape(event.target || '—')}
                </td>

                <td class="audit-details">
                  ${escape(
                    detailText(event.details) ||
                    '—'
                  )}
                </td>
              </tr>
            `).join('')}
          </tbody>

        </table>

      </div>

      <div class="audit-pagination">

        <div class="audit-page-info">
          Mostrando
          ${start + 1}
          –
          ${Math.min(
            start + PAGE_SIZE,
            total
          )}
          de
          ${total}
        </div>

        <div class="audit-pagination-actions">

          <button
            class="btn btn-secondary"
            id="audit-prev"
            ${page <= 1 ? 'disabled' : ''}
          >
            Anterior
          </button>

          <button
            class="btn btn-secondary"
            id="audit-next"
            ${page >= totalPages ? 'disabled' : ''}
          >
            Próxima
          </button>

        </div>

      </div>
    `;

    document
      .querySelectorAll('.audit-row')
      .forEach(row => {
        row.addEventListener(
          'click',
          () => {
            const index =
              Number(row.dataset.index);

            openDetails(rows[index]);
          }
        );
      });

    const prev =
      document.getElementById(
        'audit-prev'
      );

    const next =
      document.getElementById(
        'audit-next'
      );

    if (prev) {
      prev.addEventListener(
        'click',
        () => {
          if (page <= 1) return;

          page--;
          renderTable();
        }
      );
    }

    if (next) {
      next.addEventListener(
        'click',
        () => {
          if (page >= totalPages) return;

          page++;
          renderTable();
        }
      );
    }
  }

  function openDetails(event) {
    if (!event) return;

    modalContent.innerHTML = `
      <div class="audit-detail-grid">

        <div class="audit-detail-field">
          <div class="audit-detail-label">
            ID
          </div>

          <div class="audit-detail-value">
            ${escape(event.id)}
          </div>
        </div>

        <div class="audit-detail-field">
          <div class="audit-detail-label">
            Data
          </div>

          <div class="audit-detail-value">
            ${escape(formatDate(event.at))}
          </div>
        </div>

        <div class="audit-detail-field">
          <div class="audit-detail-label">
            Administrador
          </div>

          <div class="audit-detail-value">
            ${escape(event.actor)}
          </div>
        </div>

        <div class="audit-detail-field">
          <div class="audit-detail-label">
            Ação
          </div>

          <div class="audit-detail-value">
            ${escape(event.action)}
          </div>
        </div>

        <div class="audit-detail-field">
          <div class="audit-detail-label">
            Alvo
          </div>

          <div class="audit-detail-value">
            ${escape(event.target || '—')}
          </div>
        </div>

      </div>

      <pre class="audit-json">${escape(
        JSON.stringify(
          event.details || {},
          null,
          2
        )
      )}</pre>
    `;

    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  async function load() {
    table.innerHTML = `
      <div class="loading-state">
        Carregando auditoria real...
      </div>
    `;

    try {
      const response =
        await Api.getAudit();

      const data =
        Array.isArray(response)
          ? response
          : response?.data;

      events =
        Array.isArray(data)
          ? data.map(normalizeEvent)
          : [];

      events.sort((a, b) => {
        const ta =
          a.at
            ? new Date(a.at).getTime()
            : 0;

        const tb =
          b.at
            ? new Date(b.at).getTime()
            : 0;

        return tb - ta;
      });

      updateStats();
      populateActions();
      applyFilters();

    } catch (error) {
      console.error(
        '[AUDIT]',
        error
      );

      table.innerHTML = `
        <div class="audit-empty">

          <div
            class="audit-empty-title"
            style="color:var(--danger)"
          >
            Erro ao carregar auditoria
          </div>

          <div>
            ${escape(
              error?.message ||
              'Não foi possível carregar os registros.'
            )}
          </div>

        </div>
      `;

      Notifications.error(
        'Não foi possível carregar a auditoria.'
      );
    }
  }

  searchInput.addEventListener(
    'input',
    applyFilters
  );

  actionFilter.addEventListener(
    'change',
    applyFilters
  );

  dateFilter.addEventListener(
    'change',
    applyFilters
  );

  refreshButton.addEventListener(
    'click',
    load
  );

  modalClose.addEventListener(
    'click',
    closeModal
  );

  modal.addEventListener(
    'click',
    event => {
      if (event.target === modal) {
        closeModal();
      }
    }
  );

  await load();
};
