/* ============================================================
   RD4X DASHBOARD V10
   Página: Usuários
   Usuários reais vindos da API RD4X
   ============================================================ */

'use strict';

window.renderUsers = async function renderUsers(content, params = {}) {
  const state = {
    users: [],
    filtered: [],
    search: params.q || '',
    status: params.status || 'all',
    sort: params.sort || 'nick',
    order: params.order || 'asc'
  };

  content.innerHTML = `
    <style>
      .users-page {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .users-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .users-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .users-subtitle {
        margin: 5px 0 0;
        color: var(--text-secondary);
        font-size: 13px;
      }

      .users-refresh {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text-primary);
        border-radius: 9px;
        padding: 9px 13px;
        cursor: pointer;
        font-size: 13px;
        transition: .15s ease;
      }

      .users-refresh:hover {
        border-color: var(--accent);
      }

      .users-refresh.loading {
        opacity: .65;
        pointer-events: none;
      }

      .users-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .user-stat {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 15px;
      }

      .user-stat-label {
        color: var(--text-secondary);
        font-size: 12px;
        margin-bottom: 7px;
      }

      .user-stat-value {
        color: var(--text-primary);
        font-size: 22px;
        font-weight: 700;
      }

      .users-toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
      }

      .users-search {
        flex: 1 1 240px;
        min-width: 180px;
        height: 38px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--background, transparent);
        color: var(--text-primary);
        padding: 0 12px;
        outline: none;
      }

      .users-search:focus {
        border-color: var(--accent);
      }

      .users-filter {
        height: 38px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text-primary);
        padding: 0 10px;
        outline: none;
      }

      .users-count {
        margin-left: auto;
        color: var(--text-secondary);
        font-size: 12px;
      }

      .users-table-wrap {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }

      .users-table-scroll {
        width: 100%;
        overflow-x: auto;
      }

      .users-table {
        width: 100%;
        min-width: 850px;
        border-collapse: collapse;
      }

      .users-table th {
        text-align: left;
        padding: 12px 14px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .04em;
        color: var(--text-secondary);
        background: rgba(255,255,255,.02);
        border-bottom: 1px solid var(--border);
        white-space: nowrap;
      }

      .users-table td {
        padding: 13px 14px;
        border-bottom: 1px solid var(--border);
        font-size: 13px;
        color: var(--text-primary);
        vertical-align: middle;
      }

      .users-table tr:last-child td {
        border-bottom: 0;
      }

      .users-table tbody tr {
        transition: background .12s ease;
      }

      .users-table tbody tr:hover {
        background: rgba(255,255,255,.025);
      }

      .user-main {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .user-nick {
        font-weight: 600;
      }

      .user-discord {
        color: var(--text-secondary);
        font-size: 11px;
      }

      .user-id {
        font-family: monospace;
        font-size: 11px;
        color: var(--text-secondary);
      }

      .user-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }

      .user-status.active {
        color: #32d583;
        background: rgba(50,213,131,.10);
      }

      .user-status.expiring {
        color: #f5b942;
        background: rgba(245,185,66,.10);
      }

      .user-status.expired {
        color: #ff5c70;
        background: rgba(255,92,112,.10);
      }

      .user-status.permanent {
        color: #9b8cff;
        background: rgba(155,140,255,.10);
      }

      .user-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      .hwid {
        font-family: monospace;
        font-size: 11px;
      }

      .hwid-free {
        color: #32d583;
      }

      .hwid-bound {
        color: var(--text-secondary);
      }

      .user-money {
        font-weight: 600;
      }

      .user-date {
        color: var(--text-secondary);
        font-size: 12px;
        white-space: nowrap;
      }

      .users-empty {
        padding: 48px 20px;
        text-align: center;
        color: var(--text-secondary);
      }

      .users-empty-title {
        color: var(--text-primary);
        font-weight: 600;
        margin-bottom: 5px;
      }

      .users-error {
        padding: 30px 20px;
        text-align: center;
      }

      .users-error-title {
        color: var(--danger);
        font-weight: 600;
        margin-bottom: 5px;
      }

      .users-error-text {
        color: var(--text-secondary);
        font-size: 13px;
      }

      .users-loading {
        padding: 35px;
        text-align: center;
        color: var(--text-secondary);
      }

      .user-actions {
        display: flex;
        gap: 6px;
      }

      .user-action {
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-secondary);
        border-radius: 7px;
        padding: 6px 8px;
        cursor: pointer;
        font-size: 11px;
      }

      .user-action:hover {
        color: var(--text-primary);
        border-color: var(--accent);
      }

      @media (max-width: 900px) {
        .users-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 520px) {
        .users-stats {
          grid-template-columns: 1fr;
        }

        .users-count {
          width: 100%;
          margin-left: 0;
        }
      }
    </style>

    <div class="users-page">

      <div class="users-header">
        <div>
          <h1 class="users-title">Usuários</h1>
          <p class="users-subtitle">
            Clientes reais cadastrados no RD4X Hub.
          </p>
        </div>

        <button
          type="button"
          class="users-refresh"
          id="users-refresh"
        >
          <svg class="icon">
            <use href="#i-refresh"></use>
          </svg>
          Atualizar
        </button>
      </div>

      <div class="users-stats">
        <div class="user-stat">
          <div class="user-stat-label">Total</div>
          <div class="user-stat-value" id="users-total">—</div>
        </div>

        <div class="user-stat">
          <div class="user-stat-label">Ativos</div>
          <div class="user-stat-value" id="users-active">—</div>
        </div>

        <div class="user-stat">
          <div class="user-stat-label">Expirando</div>
          <div class="user-stat-value" id="users-expiring">—</div>
        </div>

        <div class="user-stat">
          <div class="user-stat-label">Permanentes</div>
          <div class="user-stat-value" id="users-permanent">—</div>
        </div>
      </div>

      <div class="users-toolbar">
        <input
          id="users-search"
          class="users-search"
          type="search"
          placeholder="Pesquisar por nick ou Discord..."
          autocomplete="off"
        />

        <select id="users-status" class="users-filter">
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="expiring">Expirando</option>
          <option value="permanent">Permanentes</option>
          <option value="expired">Expirados</option>
        </select>

        <span class="users-count" id="users-count">
          0 usuários
        </span>
      </div>

      <div class="users-table-wrap">
        <div class="users-table-scroll">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Discord ID</th>
                <th>Status</th>
                <th>Expiração</th>
                <th>HWID</th>
                <th>Valor</th>
                <th>Cadastro</th>
              </tr>
            </thead>

            <tbody id="users-body">
              <tr>
                <td colspan="7">
                  <div class="users-loading">
                    Carregando usuários...
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  const body = document.getElementById('users-body');
  const searchInput = document.getElementById('users-search');
  const statusSelect = document.getElementById('users-status');
  const refreshButton = document.getElementById('users-refresh');

  function escape(value) {
    if (window.Utils?.escapeHtml) {
      return Utils.escapeHtml(String(value ?? ''));
    }

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeUser(user) {
    const item = user && typeof user === 'object'
      ? user
      : {};

    return {
      nick: item.nick || item.username || 'Sem nick',
      discordId:
        item.discordId ||
        item.userId ||
        item.id ||
        null,
      expiraEm:
        item.expiraEm ??
        item.expiresAt ??
        null,
      hwid:
        item.hwid ||
        'LIVRE',
      valorPago:
        Number(item.valorPago ?? item.valor ?? 0) || 0,
      dataVenda:
        item.dataVenda ||
        item.createdAt ||
        null
    };
  }

  function getStatus(user) {
    if (user.expiraEm === 'perm') {
      return {
        key: 'permanent',
        label: 'Permanente'
      };
    }

    if (!user.expiraEm) {
      return {
        key: 'active',
        label: 'Ativo'
      };
    }

    const timestamp =
      typeof user.expiraEm === 'number'
        ? user.expiraEm
        : new Date(user.expiraEm).getTime();

    if (!Number.isFinite(timestamp)) {
      return {
        key: 'active',
        label: 'Ativo'
      };
    }

    if (timestamp <= Date.now()) {
      return {
        key: 'expired',
        label: 'Expirado'
      };
    }

    const remaining =
      timestamp - Date.now();

    if (remaining <= 7 * 86400000) {
      return {
        key: 'expiring',
        label: 'Expirando'
      };
    }

    return {
      key: 'active',
      label: 'Ativo'
    };
  }

  function formatExpiration(value) {
    if (value === 'perm') {
      return 'Permanente';
    }

    if (!value) {
      return 'Não informado';
    }

    const timestamp =
      typeof value === 'number'
        ? value
        : new Date(value).getTime();

    if (!Number.isFinite(timestamp)) {
      return escape(value);
    }

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(timestamp);
  }

  function formatDate(value) {
    if (!value) {
      return '—';
    }

    const timestamp =
      typeof value === 'number'
        ? value
        : new Date(value).getTime();

    if (!Number.isFinite(timestamp)) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(timestamp);
  }

  function formatMoney(value) {
    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    ).format(Number(value) || 0);
  }

  function updateStats() {
    const total =
      state.users.length;

    const active =
      state.users.filter(
        user => getStatus(user).key === 'active'
      ).length;

    const expiring =
      state.users.filter(
        user => getStatus(user).key === 'expiring'
      ).length;

    const permanent =
      state.users.filter(
        user => getStatus(user).key === 'permanent'
      ).length;

    document.getElementById('users-total')
      .textContent = total;

    document.getElementById('users-active')
      .textContent = active;

    document.getElementById('users-expiring')
      .textContent = expiring;

    document.getElementById('users-permanent')
      .textContent = permanent;
  }

  function sortUsers(list) {
    const direction =
      state.order === 'desc'
        ? -1
        : 1;

    return [...list].sort((a, b) => {
      if (state.sort === 'expiration') {
        const av =
          a.expiraEm === 'perm'
            ? Number.MAX_SAFE_INTEGER
            : Number(new Date(a.expiraEm).getTime()) || 0;

        const bv =
          b.expiraEm === 'perm'
            ? Number.MAX_SAFE_INTEGER
            : Number(new Date(b.expiraEm).getTime()) || 0;

        return (av - bv) * direction;
      }

      return String(a.nick)
        .localeCompare(
          String(b.nick),
          'pt-BR',
          { sensitivity: 'base' }
        ) * direction;
    });
  }

  function applyFilters() {
    const query =
      state.search
        .trim()
        .toLowerCase();

    let result =
      state.users.filter(user => {
        const status =
          getStatus(user).key;

        const matchesStatus =
          state.status === 'all' ||
          state.status === status;

        if (!matchesStatus) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          String(user.nick)
            .toLowerCase()
            .includes(query) ||
          String(user.discordId || '')
            .toLowerCase()
            .includes(query)
        );
      });

    result = sortUsers(result);

    state.filtered = result;

    renderRows();
  }

  function renderRows() {
    document.getElementById('users-count')
      .textContent =
      `${state.filtered.length} ${
        state.filtered.length === 1
          ? 'usuário'
          : 'usuários'
      }`;

    if (!state.filtered.length) {
      body.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="users-empty">
              <div class="users-empty-title">
                Nenhum usuário encontrado
              </div>
              <div>
                Não há usuários correspondendo aos filtros atuais.
              </div>
            </div>
          </td>
        </tr>
      `;

      return;
    }

    body.innerHTML =
      state.filtered.map(user => {
        const status =
          getStatus(user);

        const hwidLivre =
          !user.hwid ||
          String(user.hwid).toUpperCase() === 'LIVRE';

        return `
          <tr>

            <td>
              <div class="user-main">
                <span class="user-nick">
                  ${escape(user.nick)}
                </span>

                ${
                  user.discordId
                    ? `
                      <span class="user-discord">
                        Discord vinculado
                      </span>
                    `
                    : `
                      <span class="user-discord">
                        Discord não vinculado
                      </span>
                    `
                }
              </div>
            </td>

            <td>
              ${
                user.discordId
                  ? `
                    <span class="user-id">
                      ${escape(user.discordId)}
                    </span>
                  `
                  : '—'
              }
            </td>

            <td>
              <span class="user-status ${status.key}">
                <span class="user-status-dot"></span>
                ${status.label}
              </span>
            </td>

            <td>
              <span class="user-date">
                ${formatExpiration(user.expiraEm)}
              </span>
            </td>

            <td>
              <span class="hwid ${
                hwidLivre
                  ? 'hwid-free'
                  : 'hwid-bound'
              }">
                ${hwidLivre
                  ? 'LIVRE'
                  : escape(String(user.hwid).slice(0, 18))}
              </span>
            </td>

            <td>
              <span class="user-money">
                ${formatMoney(user.valorPago)}
              </span>
            </td>

            <td>
              <span class="user-date">
                ${formatDate(user.dataVenda)}
              </span>
            </td>

          </tr>
        `;
      }).join('');
  }

  async function loadUsers() {
    refreshButton.classList.add('loading');
    refreshButton.innerHTML = `
      <svg class="icon">
        <use href="#i-refresh"></use>
      </svg>
      Atualizando...
    `;

    body.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="users-loading">
            Buscando usuários reais no RD4X...
          </div>
        </td>
      </tr>
    `;

    try {
      const response =
        await Api.getUsers();

      const raw =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

      state.users =
        raw.map(normalizeUser);

      updateStats();
      applyFilters();

    } catch (error) {
      console.error(
        '[USERS] Erro:',
        error
      );

      body.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="users-error">
              <div class="users-error-title">
                Não foi possível carregar os usuários
              </div>

              <div class="users-error-text">
                ${escape(
                  error?.message ||
                  'Erro desconhecido ao consultar a API RD4X.'
                )}
              </div>
            </div>
          </td>
        </tr>
      `;

      Notifications.error(
        'Erro ao carregar usuários.'
      );

    } finally {
      refreshButton.classList.remove('loading');

      refreshButton.innerHTML = `
        <svg class="icon">
          <use href="#i-refresh"></use>
        </svg>
        Atualizar
      `;
    }
  }

  searchInput.addEventListener(
    'input',
    event => {
      state.search =
        event.target.value;

      applyFilters();
    }
  );

  statusSelect.addEventListener(
    'change',
    event => {
      state.status =
        event.target.value;

      applyFilters();
    }
  );

  refreshButton.addEventListener(
    'click',
    loadUsers
  );

  await loadUsers();
};
