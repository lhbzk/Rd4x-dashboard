/* ============================================================
   RD4X DASHBOARD V10 — Releases
   Releases reais conectados à API RD4X
   ============================================================ */
'use strict';

window.renderReleases = async function renderReleases(
  content,
  params = {}
) {
  const state = {
    data: [],
    loading: true,
    search: params.q || '',
    filter: 'all'
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
      return escape(value);
    }

    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const formatExpiration = value => {
    if (value === 'perm') {
      return {
        text: 'Permanente',
        className: 'release-permanent'
      };
    }

    if (!value) {
      return {
        text: 'Sem informação',
        className: 'release-unknown'
      };
    }

    const timestamp =
      typeof value === 'number'
        ? value
        : Number(value);

    if (!Number.isFinite(timestamp)) {
      return {
        text: String(value),
        className: 'release-unknown'
      };
    }

    const restante = timestamp - Date.now();

    if (restante <= 0) {
      return {
        text: 'Expirado',
        className: 'release-expired'
      };
    }

    const dias = Math.floor(
      restante / 86400000
    );

    const horas = Math.floor(
      (restante % 86400000) / 3600000
    );

    if (dias > 0) {
      return {
        text: `${dias}d ${horas}h restantes`,
        className:
          dias <= 2
            ? 'release-warning'
            : 'release-active'
      };
    }

    const minutos = Math.floor(
      (restante % 3600000) / 60000
    );

    return {
      text: `${horas}h ${minutos}min restantes`,
      className: 'release-warning'
    };
  };

  const normalize = item => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const nick =
      item.nick ||
      item.username ||
      item.user ||
      item.name ||
      'Desconhecido';

    const expiration =
      item.expiraEm ??
      item.expiresAt ??
      item.expiration ??
      null;

    const valor =
      Number(
        item.valor ??
        item.valorPago ??
        item.price ??
        0
      ) || 0;

    const dataVenda =
      item.dataVenda ||
      item.createdAt ||
      item.created_at ||
      item.at ||
      null;

    const expirationInfo =
      formatExpiration(expiration);

    return {
      ...item,

      nick,
      discordId:
        item.discordId ||
        item.userId ||
        null,

      expiraEm: expiration,

      valor,
      dataVenda,

      expirationText:
        expirationInfo.text,

      expirationClass:
        expirationInfo.className
    };
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

  const getFiltered = () => {
    const query =
      state.search
        .trim()
        .toLowerCase();

    return state.data.filter(item => {
      if (state.filter === 'active') {
        if (
          item.expiraEm !== 'perm' &&
          (!Number.isFinite(
            Number(item.expiraEm)
          ) ||
            Number(item.expiraEm) <= Date.now())
        ) {
          return false;
        }
      }

      if (state.filter === 'expired') {
        if (
          item.expiraEm === 'perm' ||
          !Number.isFinite(
            Number(item.expiraEm)
          ) ||
          Number(item.expiraEm) > Date.now()
        ) {
          return false;
        }
      }

      if (state.filter === 'permanent') {
        if (item.expiraEm !== 'perm') {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return [
        item.nick,
        item.discordId,
        item.actorTag,
        item.actor,
        item.tempo,
        item.expirationText
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

    const total =
      state.data.length;

    const permanent =
      state.data.filter(
        item =>
          item.expiraEm === 'perm'
      ).length;

    const active =
      state.data.filter(item => {
        if (item.expiraEm === 'perm') {
          return true;
        }

        const timestamp =
          Number(item.expiraEm);

        return (
          Number.isFinite(timestamp) &&
          timestamp > Date.now()
        );
      }).length;

    const expired =
      total - active;

    content.innerHTML = `
      <style>
        .releases-page {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .releases-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .releases-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
        }

        .releases-subtitle {
          margin-top: 5px;
          color: var(--muted);
          font-size: 13px;
        }

        .releases-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .release-btn {
          border: 1px solid var(--border);
          background: var(--panel);
          color: var(--text);
          border-radius: 9px;
          padding: 9px 13px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .release-btn:hover {
          border-color: var(--accent);
        }

        .release-btn.primary {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }

        .release-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .release-stat {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }

        .release-stat-label {
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 8px;
        }

        .release-stat-value {
          color: var(--text);
          font-size: 22px;
          font-weight: 700;
        }

        .release-toolbar {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
        }

        .release-search {
          flex: 1;
          min-width: 220px;
          border: 1px solid var(--border);
          background: var(--background, transparent);
          color: var(--text);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
        }

        .release-search:focus {
          border-color: var(--accent);
        }

        .release-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .release-filter {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          border-radius: 8px;
          padding: 8px 11px;
          cursor: pointer;
          font-size: 12px;
        }

        .release-filter.active {
          color: var(--text);
          border-color: var(--accent);
          background: rgba(255,255,255,.04);
        }

        .release-table-wrap {
          overflow-x: auto;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .release-table {
          width: 100%;
          min-width: 820px;
          border-collapse: collapse;
        }

        .release-table th {
          text-align: left;
          color: var(--muted);
          font-size: 11px;
          font-weight: 600;
          padding: 13px 14px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .release-table td {
          padding: 14px;
          color: var(--text);
          font-size: 13px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .release-table tr:last-child td {
          border-bottom: 0;
        }

        .release-user {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .release-user-name {
          font-weight: 650;
        }

        .release-user-id {
          color: var(--muted);
          font-size: 11px;
        }

        .release-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }

        .release-active {
          color: #4ade80;
          background: rgba(74,222,128,.10);
        }

        .release-warning {
          color: #fbbf24;
          background: rgba(251,191,36,.10);
        }

        .release-expired {
          color: #f87171;
          background: rgba(248,113,113,.10);
        }

        .release-permanent {
          color: #a78bfa;
          background: rgba(167,139,250,.10);
        }

        .release-unknown {
          color: var(--muted);
          background: rgba(255,255,255,.05);
        }

        .release-empty {
          padding: 45px 20px;
          text-align: center;
          color: var(--muted);
        }

        .release-empty strong {
          display: block;
          color: var(--text);
          margin-bottom: 5px;
        }

        .release-loading {
          padding: 35px;
          text-align: center;
          color: var(--muted);
        }

        .release-error {
          padding: 18px;
          border: 1px solid rgba(248,113,113,.25);
          background: rgba(248,113,113,.07);
          border-radius: 12px;
          color: #fca5a5;
        }

        @media (max-width: 900px) {
          .release-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .release-stats {
            grid-template-columns: 1fr;
          }

          .releases-title {
            font-size: 21px;
          }
        }
      </style>

      <section class="releases-page">

        <header class="releases-header">
          <div>
            <h1 class="releases-title">
              Releases
            </h1>

            <div class="releases-subtitle">
              Liberações de acesso registradas no RD4X.
            </div>
          </div>

          <div class="releases-actions">
            <button
              class="release-btn"
              id="release-refresh"
            >
              Atualizar
            </button>

            <button
              class="release-btn primary"
              id="release-new"
            >
              Nova liberação
            </button>
          </div>
        </header>

        <div class="release-stats">

          <div class="release-stat">
            <div class="release-stat-label">
              Total
            </div>

            <div class="release-stat-value">
              ${total}
            </div>
          </div>

          <div class="release-stat">
            <div class="release-stat-label">
              Ativos
            </div>

            <div class="release-stat-value">
              ${active}
            </div>
          </div>

          <div class="release-stat">
            <div class="release-stat-label">
              Permanentes
            </div>

            <div class="release-stat-value">
              ${permanent}
            </div>
          </div>

          <div class="release-stat">
            <div class="release-stat-label">
              Expirados
            </div>

            <div class="release-stat-value">
              ${expired}
            </div>
          </div>

        </div>

        <div class="release-toolbar">

          <input
            id="release-search"
            class="release-search"
            type="search"
            placeholder="Pesquisar nick, Discord ou responsável..."
            value="${escape(state.search)}"
          />

          <div class="release-filters">

            <button
              class="release-filter ${
                state.filter === 'all'
                  ? 'active'
                  : ''
              }"
              data-filter="all"
            >
              Todos
            </button>

            <button
              class="release-filter ${
                state.filter === 'active'
                  ? 'active'
                  : ''
              }"
              data-filter="active"
            >
              Ativos
            </button>

            <button
              class="release-filter ${
                state.filter === 'permanent'
                  ? 'active'
                  : ''
              }"
              data-filter="permanent"
            >
              Permanentes
            </button>

            <button
              class="release-filter ${
                state.filter === 'expired'
                  ? 'active'
                  : ''
              }"
              data-filter="expired"
            >
              Expirados
            </button>

          </div>
        </div>

        <div class="release-table-wrap">

          ${
            state.loading
              ? `
                <div class="release-loading">
                  Carregando releases reais...
                </div>
              `
              : filtered.length === 0
                ? `
                  <div class="release-empty">
                    <strong>
                      Nenhum release encontrado
                    </strong>

                    ${
                      state.search ||
                      state.filter !== 'all'
                        ? 'Tente alterar os filtros.'
                        : 'Ainda não existem liberações registradas.'
                    }
                  </div>
                `
                : `
                  <table class="release-table">

                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Status</th>
                        <th>Duração</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Discord</th>
                      </tr>
                    </thead>

                    <tbody>

                      ${filtered.map(item => `
                        <tr>

                          <td>
                            <div class="release-user">

                              <div class="release-user-name">
                                ${escape(item.nick)}
                              </div>

                              ${
                                item.actorTag
                                  ? `
                                    <div class="release-user-id">
                                      por ${escape(item.actorTag)}
                                    </div>
                                  `
                                  : ''
                              }

                            </div>
                          </td>

                          <td>
                            <span
                              class="release-badge ${item.expirationClass}"
                            >
                              ${escape(item.expirationText)}
                            </span>
                          </td>

                          <td>
                            ${
                              item.expiraEm === 'perm'
                                ? 'Permanente'
                                : item.tempo
                                  ? escape(item.tempo)
                                  : item.expiraEm
                                    ? formatDate(item.expiraEm)
                                    : '—'
                            }
                          </td>

                          <td>
                            ${
                              item.valor > 0
                                ? `R$ ${item.valor.toFixed(2).replace('.', ',')}`
                                : '—'
                            }
                          </td>

                          <td>
                            ${formatDate(item.dataVenda)}
                          </td>

                          <td>
                            ${
                              item.discordId
                                ? escape(item.discordId)
                                : '—'
                            }
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
        'release-search'
      );

    if (search) {
      search.addEventListener(
        'input',
        () => {
          state.search = search.value;
          render();
        }
      );
    }

    document
      .querySelectorAll(
        '.release-filter'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            state.filter =
              button.dataset.filter ||
              'all';

            render();
          }
        );
      });

    const refresh =
      document.getElementById(
        'release-refresh'
      );

    if (refresh) {
      refresh.addEventListener(
        'click',
        load
      );
    }

    const newButton =
      document.getElementById(
        'release-new'
      );

    if (newButton) {
      newButton.addEventListener(
        'click',
        () => {
          Notifications.info(
            'O formulário de nova liberação será conectado na etapa de Ações Administrativas.'
          );
        }
      );
    }
  };

  async function load() {
    state.loading = true;
    render();

    try {
      const response =
        await Api.getReleases();

      state.data =
        getArray(response)
          .map(normalize)
          .filter(Boolean);

      state.loading = false;
      render();

    } catch (error) {
      console.error(
        '[RELEASES]',
        error
      );

      state.loading = false;

      content.innerHTML = `
        <style>
          .release-error-page {
            padding: 25px;
          }

          .release-error {
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(248,113,113,.25);
            background: rgba(248,113,113,.07);
            color: #fca5a5;
          }

          .release-error strong {
            display: block;
            color: var(--text);
            margin-bottom: 6px;
          }
        </style>

        <div class="release-error-page">

          <div class="release-error">

            <strong>
              Não foi possível carregar os Releases.
            </strong>

            ${escape(
              error?.message ||
              'Erro desconhecido.'
            )}

          </div>

        </div>
      `;

      if (
        typeof Notifications !== 'undefined' &&
        typeof Notifications.error === 'function'
      ) {
        Notifications.error(
          'Erro ao carregar Releases.'
        );
      }
    }
  }

  await load();
};
