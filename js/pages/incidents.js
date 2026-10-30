/* ============================================================
   RD4X DASHBOARD V10 — Incidentes
   Incidentes reais conectados à API RD4X
   ============================================================ */
'use strict';

window.renderIncidents = async function renderIncidents(
  content,
  params = {}
) {
  const state = {
    data: [],
    loading: true,
    search: params.q || '',
    severity: 'all',
    status: 'all'
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

      type:
        item.type ||
        item.name ||
        'unknown',

      severity:
        String(
          item.severity ||
          item.level ||
          'info'
        ).toLowerCase(),

      status:
        String(
          item.status ||
          'open'
        ).toLowerCase(),

      details:
        item.details ||
        {},

      actor:
        item.actor ||
        item.actorTag ||
        '',

      target:
        item.target ||
        item.nick ||
        ''
    };
  };

  const severityLabel = severity => {
    const labels = {
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Médio',
      low: 'Baixo',
      info: 'Informativo'
    };

    return labels[severity] ||
      String(severity || 'info');
  };

  const statusLabel = status => {
    const labels = {
      open: 'Aberto',
      investigating: 'Investigando',
      resolved: 'Resolvido',
      closed: 'Fechado',
      ignored: 'Ignorado'
    };

    return labels[status] ||
      String(status || 'open');
  };

  const severityClass = severity => {
    if (
      severity === 'critical' ||
      severity === 'high'
    ) {
      return 'incident-red';
    }

    if (
      severity === 'medium'
    ) {
      return 'incident-yellow';
    }

    if (
      severity === 'low'
    ) {
      return 'incident-blue';
    }

    return 'incident-neutral';
  };

  const statusClass = status => {
    if (
      status === 'open' ||
      status === 'investigating'
    ) {
      return 'incident-red';
    }

    if (
      status === 'resolved' ||
      status === 'closed'
    ) {
      return 'incident-green';
    }

    return 'incident-neutral';
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
        state.severity !== 'all' &&
        item.severity !== state.severity
      ) {
        return false;
      }

      if (
        state.status !== 'all' &&
        item.status !== state.status
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.id,
        item.type,
        item.severity,
        item.status,
        item.actor,
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

    const open =
      state.data.filter(
        item =>
          item.status === 'open' ||
          item.status === 'investigating'
      ).length;

    const critical =
      state.data.filter(
        item =>
          item.severity === 'critical'
      ).length;

    const resolved =
      state.data.filter(
        item =>
          item.status === 'resolved' ||
          item.status === 'closed'
      ).length;

    content.innerHTML = `
      <style>
        .incidents-page {
          display:flex;
          flex-direction:column;
          gap:18px;
        }

        .incidents-header {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
          flex-wrap:wrap;
        }

        .incidents-title {
          margin:0;
          color:var(--text);
          font-size:24px;
          font-weight:700;
        }

        .incidents-subtitle {
          margin-top:5px;
          color:var(--muted);
          font-size:13px;
        }

        .incidents-actions {
          display:flex;
          gap:8px;
        }

        .incident-btn {
          border:1px solid var(--border);
          background:var(--panel);
          color:var(--text);
          border-radius:9px;
          padding:9px 13px;
          cursor:pointer;
          font-size:13px;
          font-weight:600;
        }

        .incident-btn:hover {
          border-color:var(--accent);
        }

        .incident-stats {
          display:grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap:12px;
        }

        .incident-stat {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
          padding:16px;
        }

        .incident-stat-label {
          color:var(--muted);
          font-size:12px;
          margin-bottom:8px;
        }

        .incident-stat-value {
          color:var(--text);
          font-size:22px;
          font-weight:700;
        }

        .incident-toolbar {
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

        .incident-search {
          flex:1;
          min-width:220px;
          border:1px solid var(--border);
          background:transparent;
          color:var(--text);
          border-radius:8px;
          padding:10px 12px;
          outline:none;
        }

        .incident-search:focus {
          border-color:var(--accent);
        }

        .incident-filter-groups {
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }

        .incident-filter-group {
          display:flex;
          gap:5px;
        }

        .incident-filter {
          border:1px solid var(--border);
          background:transparent;
          color:var(--muted);
          border-radius:8px;
          padding:8px 10px;
          cursor:pointer;
          font-size:11px;
        }

        .incident-filter.active {
          color:var(--text);
          border-color:var(--accent);
          background:rgba(255,255,255,.04);
        }

        .incident-table-wrap {
          overflow-x:auto;
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
        }

        .incident-table {
          width:100%;
          min-width:950px;
          border-collapse:collapse;
        }

        .incident-table th {
          padding:13px 14px;
          text-align:left;
          color:var(--muted);
          font-size:11px;
          font-weight:600;
          border-bottom:1px solid var(--border);
          white-space:nowrap;
        }

        .incident-table td {
          padding:14px;
          color:var(--text);
          font-size:12px;
          border-bottom:1px solid var(--border);
          vertical-align:middle;
        }

        .incident-table tr:last-child td {
          border-bottom:0;
        }

        .incident-badge {
          display:inline-flex;
          align-items:center;
          border-radius:999px;
          padding:5px 9px;
          font-size:10px;
          font-weight:650;
          white-space:nowrap;
        }

        .incident-red {
          color:#f87171;
          background:rgba(248,113,113,.10);
        }

        .incident-yellow {
          color:#fbbf24;
          background:rgba(251,191,36,.10);
        }

        .incident-green {
          color:#4ade80;
          background:rgba(74,222,128,.10);
        }

        .incident-blue {
          color:#60a5fa;
          background:rgba(96,165,250,.10);
        }

        .incident-neutral {
          color:var(--muted);
          background:rgba(255,255,255,.05);
        }

        .incident-type {
          font-weight:650;
        }

        .incident-details {
          max-width:300px;
          color:var(--muted);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          cursor:pointer;
        }

        .incident-empty,
        .incident-loading {
          padding:45px 20px;
          text-align:center;
          color:var(--muted);
        }

        .incident-empty strong,
        .incident-loading strong {
          display:block;
          color:var(--text);
          margin-bottom:5px;
        }

        .incident-modal-backdrop {
          position:fixed;
          inset:0;
          z-index:9999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          background:rgba(0,0,0,.65);
        }

        .incident-modal {
          width:min(700px,100%);
          max-height:85vh;
          overflow:auto;
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:14px;
          box-shadow:0 20px 70px rgba(0,0,0,.45);
        }

        .incident-modal-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:15px 17px;
          border-bottom:1px solid var(--border);
        }

        .incident-modal-title {
          color:var(--text);
          font-weight:700;
        }

        .incident-modal-close {
          border:0;
          background:transparent;
          color:var(--muted);
          cursor:pointer;
          font-size:20px;
        }

        .incident-modal-body {
          padding:17px;
        }

        .incident-detail-grid {
          display:grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap:12px;
          margin-bottom:16px;
        }

        .incident-detail-box {
          padding:12px;
          border:1px solid var(--border);
          border-radius:9px;
        }

        .incident-detail-label {
          color:var(--muted);
          font-size:10px;
          margin-bottom:5px;
        }

        .incident-detail-value {
          color:var(--text);
          font-size:12px;
          word-break:break-word;
        }

        .incident-json {
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

        @media(max-width:900px) {
          .incident-stats {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media(max-width:650px) {
          .incident-stats {
            grid-template-columns:1fr;
          }

          .incident-detail-grid {
            grid-template-columns:1fr;
          }
        }
      </style>

      <section class="incidents-page">

        <header class="incidents-header">

          <div>
            <h1 class="incidents-title">
              Incidentes
            </h1>

            <div class="incidents-subtitle">
              Monitoramento de eventos de segurança e operação do RD4X.
            </div>
          </div>

          <div class="incidents-actions">

            <button
              class="incident-btn"
              id="incidents-refresh"
            >
              Atualizar
            </button>

          </div>

        </header>

        <div class="incident-stats">

          <div class="incident-stat">
            <div class="incident-stat-label">
              Total
            </div>

            <div class="incident-stat-value">
              ${state.data.length}
            </div>
          </div>

          <div class="incident-stat">
            <div class="incident-stat-label">
              Abertos
            </div>

            <div class="incident-stat-value">
              ${open}
            </div>
          </div>

          <div class="incident-stat">
            <div class="incident-stat-label">
              Críticos
            </div>

            <div class="incident-stat-value">
              ${critical}
            </div>
          </div>

          <div class="incident-stat">
            <div class="incident-stat-label">
              Resolvidos
            </div>

            <div class="incident-stat-value">
              ${resolved}
            </div>
          </div>

        </div>

        <div class="incident-toolbar">

          <input
            id="incident-search"
            class="incident-search"
            type="search"
            placeholder="Pesquisar incidente, tipo, alvo ou detalhes..."
            value="${escape(state.search)}"
          />

          <div class="incident-filter-groups">

            <div class="incident-filter-group">

              <button
                class="incident-filter ${
                  state.severity === 'all'
                    ? 'active'
                    : ''
                }"
                data-severity="all"
              >
                Severidade
              </button>

              <button
                class="incident-filter ${
                  state.severity === 'critical'
                    ? 'active'
                    : ''
                }"
                data-severity="critical"
              >
                Crítico
              </button>

              <button
                class="incident-filter ${
                  state.severity === 'high'
                    ? 'active'
                    : ''
                }"
                data-severity="high"
              >
                Alto
              </button>

            </div>

            <div class="incident-filter-group">

              <button
                class="incident-filter ${
                  state.status === 'all'
                    ? 'active'
                    : ''
                }"
                data-status="all"
              >
                Status
              </button>

              <button
                class="incident-filter ${
                  state.status === 'open'
                    ? 'active'
                    : ''
                }"
                data-status="open"
              >
                Abertos
              </button>

              <button
                class="incident-filter ${
                  state.status === 'closed'
                    ? 'active'
                    : ''
                }"
                data-status="closed"
              >
                Fechados
              </button>

            </div>

          </div>

        </div>

        <div class="incident-table-wrap">

          ${
            state.loading
              ? `
                <div class="incident-loading">
                  <strong>
                    Carregando incidentes...
                  </strong>

                  Buscando os eventos reais do RD4X.
                </div>
              `
              : filtered.length === 0
                ? `
                  <div class="incident-empty">
                    <strong>
                      Nenhum incidente encontrado
                    </strong>

                    ${
                      state.search ||
                      state.severity !== 'all' ||
                      state.status !== 'all'
                        ? 'Tente alterar os filtros.'
                        : 'Nenhum incidente foi registrado.'
                    }
                  </div>
                `
                : `
                  <table class="incident-table">

                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Severidade</th>
                        <th>Status</th>
                        <th>Alvo</th>
                        <th>Responsável</th>
                        <th>Detalhes</th>
                      </tr>
                    </thead>

                    <tbody>

                      ${filtered.map((item,index) => `
                        <tr>

                          <td>
                            ${formatDate(item.at)}
                          </td>

                          <td>
                            <span class="incident-type">
                              ${escape(item.type)}
                            </span>
                          </td>

                          <td>
                            <span
                              class="incident-badge ${
                                severityClass(
                                  item.severity
                                )
                              }"
                            >
                              ${escape(
                                severityLabel(
                                  item.severity
                                )
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              class="incident-badge ${
                                statusClass(
                                  item.status
                                )
                              }"
                            >
                              ${escape(
                                statusLabel(
                                  item.status
                                )
                              )}
                            </span>
                          </td>

                          <td>
                            ${escape(
                              item.target || '—'
                            )}
                          </td>

                          <td>
                            ${escape(
                              item.actor || 'Sistema'
                            )}
                          </td>

                          <td>

                            <div
                              class="incident-details"
                              data-incident-index="${index}"
                              title="Ver detalhes"
                            >
                              ${escape(
                                detailsText(
                                  item.details
                                ) || '—'
                              )}
                            </div>

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
        'incident-search'
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
        '[data-severity]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            state.severity =
              button.dataset.severity ||
              'all';

            render();
          }
        );
      });

    document
      .querySelectorAll(
        '[data-status]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            state.status =
              button.dataset.status ||
              'all';

            render();
          }
        );
      });

    const refresh =
      document.getElementById(
        'incidents-refresh'
      );

    if (refresh) {
      refresh.addEventListener(
        'click',
        load
      );
    }

    document
      .querySelectorAll(
        '.incident-details'
      )
      .forEach(element => {
        element.addEventListener(
          'click',
          () => {
            const index =
              Number(
                element.dataset.incidentIndex
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
        'incident-modal-backdrop'
      );

    if (existing) {
      existing.remove();
    }

    const backdrop =
      document.createElement('div');

    backdrop.id =
      'incident-modal-backdrop';

    backdrop.className =
      'incident-modal-backdrop';

    backdrop.innerHTML = `
      <div
        class="incident-modal"
        role="dialog"
        aria-modal="true"
      >

        <div class="incident-modal-head">

          <div class="incident-modal-title">
            Detalhes do incidente
          </div>

          <button
            class="incident-modal-close"
            id="incident-modal-close"
          >
            ×
          </button>

        </div>

        <div class="incident-modal-body">

          <div class="incident-detail-grid">

            <div class="incident-detail-box">
              <div class="incident-detail-label">
                Data
              </div>

              <div class="incident-detail-value">
                ${escape(
                  formatDate(item.at)
                )}
              </div>
            </div>

            <div class="incident-detail-box">
              <div class="incident-detail-label">
                Tipo
              </div>

              <div class="incident-detail-value">
                ${escape(item.type)}
              </div>
            </div>

            <div class="incident-detail-box">
              <div class="incident-detail-label">
                Severidade
              </div>

              <div class="incident-detail-value">
                ${escape(
                  severityLabel(
                    item.severity
                  )
                )}
              </div>
            </div>

            <div class="incident-detail-box">
              <div class="incident-detail-label">
                Status
              </div>

              <div class="incident-detail-value">
                ${escape(
                  statusLabel(
                    item.status
                  )
                )}
              </div>
            </div>

            <div class="incident-detail-box">
              <div class="incident-detail-label">
                Alvo
              </div>

              <div class="incident-detail-value">
                ${escape(
                  item.target || '—'
                )}
              </div>
            </div>

            <div class="incident-detail-box">
              <div class="incident-detail-label">
                Responsável
              </div>

              <div class="incident-detail-value">
                ${escape(
                  item.actor || 'Sistema'
                )}
              </div>
            </div>

          </div>

          <pre class="incident-json">${escape(
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
        'incident-modal-close'
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
        await Api.getIncidents();

      state.data =
        getArray(response)
          .map(normalize)
          .filter(Boolean);

      state.loading = false;

      render();

    } catch (error) {
      console.error(
        '[INCIDENTS]',
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
            Não foi possível carregar os incidentes.
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
          'Erro ao carregar incidentes.'
        );
      }
    }
  }

  await load();
};
