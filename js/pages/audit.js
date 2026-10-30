/* ============================================================
   RD4X DASHBOARD V10 — Auditoria
   Auditoria real conectada à API RD4X
   ============================================================ */
'use strict';

window.renderAudit = async function renderAudit(
  content,
  params = {}
) {
  const state = {
    data: [],
    loading: true,
    search: params.q || '',
    action: 'all'
  };

  const escape = value =>
    typeof Utils !== 'undefined' &&
    typeof Utils.escapeHtml === 'function'
      ? Utils.escapeHtml(String(value ?? ''))
      : String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');

  const formatDate = value => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium'
    });
  };

  const getArray = response => {
    if (!response) return [];

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (
      response.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    return [];
  };

  const normalize = item => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    return {
      id:
        item.id ||
        item._id ||
        '',

      at:
        item.at ||
        item.createdAt ||
        item.created_at ||
        item.timestamp ||
        null,

      actor:
        item.actor ||
        item.actorTag ||
        item.user ||
        item.username ||
        'Sistema',

      action:
        item.action ||
        item.type ||
        'unknown',

      target:
        item.target ||
        item.nick ||
        item.channel ||
        '',

      details:
        item.details ||
        {}
    };
  };

  const actionLabel = action => {
    const labels = {
      release: 'Liberação',
      revoke_panel: 'Revogar painel',
      blacklist: 'Blacklist',
      unblacklist: 'Remover blacklist',
      reset_hwid: 'Reset HWID',
      ticket_takeover: 'Assumir ticket',
      ticket_priority: 'Prioridade',
      ticket_tag: 'Tag de ticket',
      ticket_note: 'Nota de ticket',
      ticket_close: 'Fechar ticket',
      ticket_reopen: 'Reabrir ticket',
      login: 'Login',
      logout: 'Logout',
      expiration: 'Expiração',
      system: 'Sistema'
    };

    return labels[action] ||
      String(action || 'Ação')
        .replace(/_/g, ' ');
  };

  const actionClass = action => {
    if (
      [
        'release',
        'ticket_reopen',
        'unblacklist',
        'login'
      ].includes(action)
    ) {
      return 'audit-green';
    }

    if (
      [
        'blacklist',
        'revoke_panel',
        'ticket_close',
        'reset_hwid'
      ].includes(action)
    ) {
      return 'audit-red';
    }

    if (
      [
        'ticket_priority',
        'ticket_takeover'
      ].includes(action)
    ) {
      return 'audit-yellow';
    }

    return 'audit-neutral';
  };

  const detailsText = details => {
    if (
      details === null ||
      details === undefined
    ) {
      return '';
    }

    if (
      typeof details === 'string'
    ) {
      return details;
    }

    try {
      return JSON.stringify(
        details,
        null,
        2
      );
    } catch {
      return String(details);
    }
  };

  const getFiltered = () => {
    const query =
      state.search
        .trim()
        .toLowerCase();

    return state.data.filter(item => {
      if (
        state.action !== 'all' &&
        item.action !== state.action
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.id,
        item.actor,
        item.action,
        item.target,
        detailsText(item.details)
      ]
        .filter(Boolean)
        .some(value =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  };

  const render = () => {
    const filtered =
      getFiltered();

    const actions = [
      ...new Set(
        state.data
          .map(item => item.action)
          .filter(Boolean)
      )
    ].sort();

    content.innerHTML = `
      <style>
        .audit-page {
          display:flex;
          flex-direction:column;
          gap:18px;
        }

        .audit-header {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          flex-wrap:wrap;
        }

        .audit-title {
          margin:0;
          color:var(--text);
          font-size:24px;
          font-weight:700;
        }

        .audit-subtitle {
          margin-top:5px;
          color:var(--muted);
          font-size:13px;
        }

        .audit-actions {
          display:flex;
          gap:8px;
        }

        .audit-btn {
          border:1px solid var(--border);
          background:var(--panel);
          color:var(--text);
          border-radius:9px;
          padding:9px 13px;
          cursor:pointer;
          font-size:13px;
          font-weight:600;
        }

        .audit-btn:hover {
          border-color:var(--accent);
        }

        .audit-stats {
          display:grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap:12px;
        }

        .audit-stat {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
          padding:16px;
        }

        .audit-stat-label {
          color:var(--muted);
          font-size:12px;
          margin-bottom:8px;
        }

        .audit-stat-value {
          color:var(--text);
          font-size:22px;
          font-weight:700;
        }

        .audit-toolbar {
          display:flex;
          gap:10px;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
          padding:12px;
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
        }

        .audit-search {
          flex:1;
          min-width:220px;
          border:1px solid var(--border);
          background:transparent;
          color:var(--text);
          border-radius:8px;
          padding:10px 12px;
          outline:none;
        }

        .audit-search:focus {
          border-color:var(--accent);
        }

        .audit-filter-wrap {
          display:flex;
          gap:6px;
          flex-wrap:wrap;
        }

        .audit-filter {
          border:1px solid var(--border);
          background:transparent;
          color:var(--muted);
          border-radius:8px;
          padding:8px 10px;
          cursor:pointer;
          font-size:11px;
        }

        .audit-filter.active {
          color:var(--text);
          border-color:var(--accent);
          background:rgba(255,255,255,.04);
        }

        .audit-table-wrap {
          overflow-x:auto;
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
        }

        .audit-table {
          width:100%;
          min-width:900px;
          border-collapse:collapse;
        }

        .audit-table th {
          padding:13px 14px;
          text-align:left;
          color:var(--muted);
          font-size:11px;
          font-weight:600;
          border-bottom:1px solid var(--border);
          white-space:nowrap;
        }

        .audit-table td {
          padding:13px 14px;
          color:var(--text);
          font-size:12px;
          border-bottom:1px solid var(--border);
          vertical-align:middle;
        }

        .audit-table tr:last-child td {
          border-bottom:0;
        }

        .audit-badge {
          display:inline-flex;
          align-items:center;
          border-radius:999px;
          padding:5px 9px;
          font-size:10px;
          font-weight:650;
          white-space:nowrap;
        }

        .audit-green {
          color:#4ade80;
          background:rgba(74,222,128,.10);
        }

        .audit-red {
          color:#f87171;
          background:rgba(248,113,113,.10);
        }

        .audit-yellow {
          color:#fbbf24;
          background:rgba(251,191,36,.10);
        }

        .audit-neutral {
          color:var(--muted);
          background:rgba(255,255,255,.05);
        }

        .audit-actor {
          font-weight:650;
        }

        .audit-target {
          color:var(--muted);
        }

        .audit-id {
          font-family:monospace;
          font-size:10px;
          color:var(--muted);
        }

        .audit-empty,
        .audit-loading {
          padding:45px 20px;
          text-align:center;
          color:var(--muted);
        }

        .audit-empty strong,
        .audit-loading strong {
          display:block;
          color:var(--text);
          margin-bottom:5px;
        }

        .audit-details {
          max-width:280px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          color:var(--muted);
          cursor:pointer;
        }

        .audit-modal-backdrop {
          position:fixed;
          inset:0;
          z-index:9999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          background:rgba(0,0,0,.65);
        }

        .audit-modal {
          width:min(700px,100%);
          max-height:85vh;
          overflow:auto;
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:14px;
          box-shadow:0 20px 70px rgba(0,0,0,.45);
        }

        .audit-modal-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:15px 17px;
          border-bottom:1px solid var(--border);
        }

        .audit-modal-title {
          color:var(--text);
          font-weight:700;
        }

        .audit-modal-close {
          border:0;
          background:transparent;
          color:var(--muted);
          cursor:pointer;
          font-size:20px;
        }

        .audit-modal-body {
          padding:17px;
        }

        .audit-detail-grid {
          display:grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap:12px;
          margin-bottom:16px;
        }

        .audit-detail-box {
          padding:12px;
          border:1px solid var(--border);
          border-radius:9px;
        }

        .audit-detail-label {
          color:var(--muted);
          font-size:10px;
          margin-bottom:5px;
        }

        .audit-detail-value {
          color:var(--text);
          font-size:12px;
          word-break:break-word;
        }

        .audit-json {
          margin:0;
          padding:13px;
          border-radius:9px;
          background:rgba(0,0,0,.2);
          border:1px solid var(--border);
          color:var(--text);
          font-size:11px;
          line-height:1.5;
          overflow:auto;
        }

        @media(max-width:700px) {
          .audit-stats {
            grid-template-columns:1fr;
          }

          .audit-detail-grid {
            grid-template-columns:1fr;
          }
        }
      </style>

      <section class="audit-page">

        <header class="audit-header">

          <div>
            <h1 class="audit-title">
              Auditoria
            </h1>

            <div class="audit-subtitle">
              Histórico real de ações executadas no RD4X.
            </div>
          </div>

          <div class="audit-actions">

            <button
              class="audit-btn"
              id="audit-refresh"
            >
              Atualizar
            </button>

          </div>

        </header>

        <div class="audit-stats">

          <div class="audit-stat">
            <div class="audit-stat-label">
              Eventos carregados
            </div>

            <div class="audit-stat-value">
              ${state.data.length}
            </div>
          </div>

          <div class="audit-stat">
            <div class="audit-stat-label">
              Administradores/atores
            </div>

            <div class="audit-stat-value">
              ${
                new Set(
                  state.data
                    .map(item => item.actor)
                    .filter(Boolean)
                ).size
              }
            </div>
          </div>

          <div class="audit-stat">
            <div class="audit-stat-label">
              Ações diferentes
            </div>

            <div class="audit-stat-value">
              ${actions.length}
            </div>
          </div>

        </div>

        <div class="audit-toolbar">

          <input
            id="audit-search"
            class="audit-search"
            type="search"
            placeholder="Pesquisar ator, ação, alvo ou detalhes..."
            value="${escape(state.search)}"
          />

          <div class="audit-filter-wrap">

            <button
              class="audit-filter ${
                state.action === 'all'
                  ? 'active'
                  : ''
              }"
              data-action="all"
            >
              Todas
            </button>

            ${actions.map(action => `
              <button
                class="audit-filter ${
                  state.action === action
                    ? 'active'
                    : ''
                }"
                data-action="${escape(action)}"
              >
                ${escape(
                  actionLabel(action)
                )}
              </button>
            `).join('')}

          </div>

        </div>

        <div class="audit-table-wrap">

          ${
            state.loading
              ? `
                <div class="audit-loading">
                  <strong>
                    Carregando auditoria...
                  </strong>
                  Buscando os eventos reais do RD4X.
                </div>
              `
              : filtered.length === 0
                ? `
                  <div class="audit-empty">
                    <strong>
                      Nenhum evento encontrado
                    </strong>

                    ${
                      state.search ||
                      state.action !== 'all'
                        ? 'Tente alterar os filtros.'
                        : 'Ainda não existem eventos de auditoria.'
                    }
                  </div>
                `
                : `
                  <table class="audit-table">

                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Ator</th>
                        <th>Ação</th>
                        <th>Alvo</th>
                        <th>Detalhes</th>
                        <th>ID</th>
                      </tr>
                    </thead>

                    <tbody>

                      ${filtered.map((item, index) => `
                        <tr>

                          <td>
                            ${formatDate(item.at)}
                          </td>

                          <td>
                            <span class="audit-actor">
                              ${escape(item.actor)}
                            </span>
                          </td>

                          <td>
                            <span
                              class="audit-badge ${
                                actionClass(
                                  item.action
                                )
                              }"
                            >
                              ${escape(
                                actionLabel(
                                  item.action
                                )
                              )}
                            </span>
                          </td>

                          <td>
                            <span class="audit-target">
                              ${escape(
                                item.target || '—'
                              )}
                            </span>
                          </td>

                          <td>

                            <div
                              class="audit-details"
                              data-audit-index="${index}"
                              title="Ver detalhes"
                            >
                              ${escape(
                                detailsText(
                                  item.details
                                ) || '—'
                              )}
                            </div>

                          </td>

                          <td>
                            <span class="audit-id">
                              ${escape(
                                item.id || '—'
                              )}
                            </span>
                          </td>

                        </tr>
                      `).join('')}

                    </tbody>

                  </table>
                `
          }

        </div>

      </section>
    `;

    const search =
      document.getElementById(
        'audit-search'
      );

    if (search) {
      search.addEventListener(
        'input',
        () => {
          state.search =
            search.value;

          render();
        }
      );
    }

    document
      .querySelectorAll(
        '.audit-filter'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            state.action =
              button.dataset.action ||
              'all';

            render();
          }
        );
      });

    const refresh =
      document.getElementById(
        'audit-refresh'
      );

    if (refresh) {
      refresh.addEventListener(
        'click',
        load
      );
    }

    document
      .querySelectorAll(
        '.audit-details'
      )
      .forEach(element => {
        element.addEventListener(
          'click',
          () => {
            const index =
              Number(
                element.dataset.auditIndex
              );

            const item =
              filtered[index];

            if (!item) return;

            openDetails(item);
          }
        );
      });
  };

  const openDetails = item => {
    const existing =
      document.getElementById(
        'audit-modal-backdrop'
      );

    if (existing) {
      existing.remove();
    }

    const backdrop =
      document.createElement('div');

    backdrop.id =
      'audit-modal-backdrop';

    backdrop.className =
      'audit-modal-backdrop';

    backdrop.innerHTML = `
      <div
        class="audit-modal"
        role="dialog"
        aria-modal="true"
      >

        <div class="audit-modal-head">

          <div class="audit-modal-title">
            Detalhes da auditoria
          </div>

          <button
            class="audit-modal-close"
            id="audit-modal-close"
          >
            ×
          </button>

        </div>

        <div class="audit-modal-body">

          <div class="audit-detail-grid">

            <div class="audit-detail-box">
              <div class="audit-detail-label">
                Data
              </div>

              <div class="audit-detail-value">
                ${escape(
                  formatDate(item.at)
                )}
              </div>
            </div>

            <div class="audit-detail-box">
              <div class="audit-detail-label">
                Ator
              </div>

              <div class="audit-detail-value">
                ${escape(item.actor)}
              </div>
            </div>

            <div class="audit-detail-box">
              <div class="audit-detail-label">
                Ação
              </div>

              <div class="audit-detail-value">
                ${escape(
                  actionLabel(
                    item.action
                  )
                )}
              </div>
            </div>

            <div class="audit-detail-box">
              <div class="audit-detail-label">
                Alvo
              </div>

              <div class="audit-detail-value">
                ${escape(
                  item.target || '—'
                )}
              </div>
            </div>

          </div>

          <pre class="audit-json">${escape(
            detailsText(
              item.details
            ) || 'Sem detalhes adicionais.'
          )}</pre>

        </div>

      </div>
    `;

    document.body.appendChild(
      backdrop
    );

    const close = () =>
      backdrop.remove();

    document
      .getElementById(
        'audit-modal-close'
      )
      ?.addEventListener(
        'click',
        close
      );

    backdrop.addEventListener(
      'click',
      event => {
        if (
          event.target ===
          backdrop
        ) {
          close();
        }
      }
    );
  };

  async function load() {
    state.loading = true;
    render();

    try {
      const response =
        await Api.getAudit();

      state.data =
        getArray(response)
          .map(normalize)
          .filter(Boolean);

      state.loading = false;

      render();

    } catch (error) {
      console.error(
        '[AUDIT]',
        error
      );

      state.loading = false;

      content.innerHTML = `
        <div
          style="
            padding:25px;
            border-radius:12px;
            border:1px solid rgba(248,113,113,.25);
            background:rgba(248,113,113,.07);
            color:#fca5a5;
          "
        >
          <strong
            style="
              display:block;
              color:var(--text);
              margin-bottom:6px;
            "
          >
            Não foi possível carregar a auditoria.
          </strong>

          ${escape(
            error?.message ||
            'Erro desconhecido.'
          )}
        </div>
      `;

      if (
        typeof Notifications !== 'undefined' &&
        typeof Notifications.error === 'function'
      ) {
        Notifications.error(
          'Erro ao carregar auditoria.'
        );
      }
    }
  }

  await load();
}; 
