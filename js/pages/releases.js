/* ============================================================
   RD4X DASHBOARD V10 — RELEASES
   ============================================================ */
'use strict';

window.renderReleases = async function (content, params = {}) {

  content.innerHTML = `
    <div class="page releases-page">

      <div class="page-header">
        <div>
          <div class="page-title">
            Releases
          </div>

          <div class="page-subtitle">
            Gerenciamento e histórico das licenças liberadas.
          </div>
        </div>

        <div class="page-header-actions">

          <button
            class="btn btn-secondary"
            id="releases-refresh"
          >
            <svg class="icon">
              <use href="#i-refresh"></use>
            </svg>
            Atualizar
          </button>

          <button
            class="btn btn-primary"
            id="release-new"
          >
            <svg class="icon">
              <use href="#i-plus"></use>
            </svg>
            Nova release
          </button>

        </div>
      </div>

      <div
        class="release-stats"
        id="release-stats"
      >
        <div class="release-stat">
          <div class="release-stat-label">
            Total
          </div>
          <div class="release-stat-value">
            —
          </div>
        </div>

        <div class="release-stat">
          <div class="release-stat-label">
            Ativas
          </div>
          <div class="release-stat-value">
            —
          </div>
        </div>

        <div class="release-stat">
          <div class="release-stat-label">
            Permanentes
          </div>
          <div class="release-stat-value">
            —
          </div>
        </div>

        <div class="release-stat">
          <div class="release-stat-label">
            Faturamento
          </div>
          <div class="release-stat-value">
            —
          </div>
        </div>
      </div>

      <section class="panel">

        <div class="releases-toolbar">

          <div class="release-search">
            <svg class="icon">
              <use href="#i-search"></use>
            </svg>

            <input
              id="release-search"
              type="text"
              placeholder="Buscar por usuário, Discord ID..."
              autocomplete="off"
            >
          </div>

          <select
            id="release-status"
            class="select"
          >
            <option value="">
              Todos os status
            </option>

            <option value="active">
              Ativas
            </option>

            <option value="expired">
              Expiradas
            </option>

            <option value="permanent">
              Permanentes
            </option>
          </select>

        </div>

        <div id="releases-table">
          <div class="loading-state">
            Carregando releases...
          </div>
        </div>

      </section>

    </div>

    <style>
      .releases-page {
        padding-bottom:40px;
      }

      .releases-page .page-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        margin-bottom:22px;
      }

      .page-header-actions {
        display:flex;
        gap:8px;
      }

      .release-stats {
        display:grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap:12px;
        margin-bottom:18px;
      }

      .release-stat {
        padding:17px;
        border:1px solid var(--border);
        border-radius:14px;
        background:var(--card);
      }

      .release-stat-label {
        font-size:12px;
        color:var(--text-secondary);
        margin-bottom:8px;
      }

      .release-stat-value {
        font-size:24px;
        font-weight:700;
        color:var(--text-primary);
      }

      .releases-toolbar {
        display:flex;
        align-items:center;
        gap:10px;
        padding:16px;
        border-bottom:1px solid var(--border);
        flex-wrap:wrap;
      }

      .release-search {
        position:relative;
        flex:1;
        min-width:230px;
      }

      .release-search .icon {
        position:absolute;
        left:12px;
        top:50%;
        transform:translateY(-50%);
        width:16px;
        height:16px;
        color:var(--text-secondary);
      }

      .release-search input {
        width:100%;
        height:40px;
        padding:0 12px 0 38px;
        border:1px solid var(--border);
        border-radius:9px;
        background:var(--background);
        color:var(--text-primary);
        outline:none;
      }

      .release-search input:focus {
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

      .release-table-wrap {
        width:100%;
        overflow-x:auto;
      }

      .release-table {
        width:100%;
        min-width:850px;
        border-collapse:collapse;
      }

      .release-table th {
        padding:13px 16px;
        text-align:left;
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.04em;
        color:var(--text-secondary);
        border-bottom:1px solid var(--border);
        white-space:nowrap;
      }

      .release-table td {
        padding:14px 16px;
        border-bottom:1px solid var(--border);
        font-size:13px;
        color:var(--text-primary);
        vertical-align:middle;
      }

      .release-table tr:last-child td {
        border-bottom:0;
      }

      .release-table tbody tr {
        transition:.15s ease;
      }

      .release-table tbody tr:hover {
        background:rgba(255,255,255,.025);
      }

      .release-user {
        font-weight:600;
      }

      .release-discord {
        margin-top:3px;
        font-size:11px;
        color:var(--text-secondary);
      }

      .release-status {
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:4px 8px;
        border-radius:7px;
        border:1px solid var(--border);
        font-size:10px;
        font-weight:600;
      }

      .release-status-dot {
        width:6px;
        height:6px;
        border-radius:50%;
        background:var(--text-secondary);
      }

      .release-status.active .release-status-dot {
        background:var(--success);
      }

      .release-status.expired .release-status-dot {
        background:var(--danger);
      }

      .release-status.permanent .release-status-dot {
        background:var(--accent);
      }

      .release-expiration {
        color:var(--text-secondary);
        white-space:nowrap;
      }

      .release-price {
        font-weight:600;
      }

      .release-empty {
        padding:55px 20px;
        text-align:center;
        color:var(--text-secondary);
      }

      .release-empty-title {
        margin-bottom:5px;
        color:var(--text-primary);
        font-size:15px;
        font-weight:600;
      }

      .release-modal {
        position:fixed;
        inset:0;
        z-index:9999;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.65);
      }

      .release-modal.open {
        display:flex;
      }

      .release-modal-box {
        width:min(560px,100%);
        max-height:90vh;
        overflow:auto;
        padding:22px;
        border:1px solid var(--border);
        border-radius:16px;
        background:var(--card);
        box-shadow:0 20px 60px rgba(0,0,0,.35);
      }

      .release-modal-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:20px;
      }

      .release-modal-title {
        font-size:18px;
        font-weight:700;
      }

      .release-form {
        display:grid;
        gap:14px;
      }

      .release-field {
        display:grid;
        gap:6px;
      }

      .release-field label {
        font-size:12px;
        color:var(--text-secondary);
      }

      .release-field input,
      .release-field select {
        width:100%;
        height:42px;
        padding:0 12px;
        border:1px solid var(--border);
        border-radius:9px;
        background:var(--background);
        color:var(--text-primary);
        outline:none;
      }

      .release-field input:focus,
      .release-field select:focus {
        border-color:var(--accent);
      }

      .release-form-actions {
        display:flex;
        justify-content:flex-end;
        gap:8px;
        margin-top:4px;
      }

      @media (max-width:900px) {
        .release-stats {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width:600px) {
        .releases-page .page-header {
          align-items:flex-start;
          flex-direction:column;
        }

        .page-header-actions {
          width:100%;
        }

        .page-header-actions button {
          flex:1;
        }

        .release-stats {
          grid-template-columns:1fr 1fr;
        }

        .releases-toolbar {
          align-items:stretch;
        }

        .release-search,
        .select {
          width:100%;
        }
      }
    </style>

    <div
      class="release-modal"
      id="release-modal"
    >
      <div class="release-modal-box">

        <div class="release-modal-header">

          <div class="release-modal-title">
            Nova release
          </div>

          <button
            class="btn btn-secondary"
            id="release-modal-close"
          >
            Fechar
          </button>

        </div>

        <form
          class="release-form"
          id="release-form"
        >

          <div class="release-field">
            <label for="release-nick">
              Usuário
            </label>

            <input
              id="release-nick"
              required
              placeholder="Nick do usuário"
            >
          </div>

          <div class="release-field">
            <label for="release-discord">
              Discord ID
            </label>

            <input
              id="release-discord"
              placeholder="ID do Discord"
            >
          </div>

          <div class="release-field">
            <label for="release-time">
              Duração
            </label>

            <select id="release-time">
              <option value="3d">
                3 dias
              </option>

              <option value="7d">
                7 dias
              </option>

              <option value="12d">
                12 dias
              </option>

              <option value="30d">
                30 dias
              </option>

              <option value="1m">
                1 mês
              </option>

              <option value="2m">
                2 meses
              </option>

              <option value="perm">
                Permanente
              </option>
            </select>
          </div>

          <div class="release-field">
            <label for="release-value">
              Valor pago
            </label>

            <input
              id="release-value"
              type="number"
              min="0"
              step="0.01"
              value="0"
              placeholder="0,00"
            >
          </div>

          <div class="release-form-actions">

            <button
              type="button"
              class="btn btn-secondary"
              id="release-cancel"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              Liberar
            </button>

          </div>

        </form>

      </div>
    </div>
  `;

  const escape =
    value =>
      Utils.escapeHtml(
        value === null ||
        value === undefined
          ? ''
          : String(value)
      );

  let releases = [];

  function normalize(response) {
    const data =
      Array.isArray(response)
        ? response
        : response?.data;

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      nick:
        item.nick ||
        item.username ||
        item.user ||
        '—',

      discordId:
        item.discordId ||
        item.userId ||
        null,

      expiraEm:
        item.expiraEm ??
        item.expiresAt ??
        null,

      valorPago:
        Number(
          item.valorPago ??
          item.valor ??
          0
        ),

      dataVenda:
        item.dataVenda ||
        item.createdAt ||
        null,

      hwid:
        item.hwid ||
        'LIVRE'
    }));
  }

  function isPermanent(item) {
    return (
      item.expiraEm === 'perm' ||
      item.expiraEm === 'permanente'
    );
  }

  function isExpired(item) {
    if (isPermanent(item)) {
      return false;
    }

    if (
      item.expiraEm === null ||
      item.expiraEm === undefined ||
      item.expiraEm === ''
    ) {
      return false;
    }

    const timestamp =
      typeof item.expiraEm === 'number'
        ? item.expiraEm
        : new Date(item.expiraEm).getTime();

    return (
      !Number.isNaN(timestamp) &&
      timestamp <= Date.now()
    );
  }

  function getStatus(item) {
    if (isPermanent(item)) {
      return {
        key:'permanent',
        label:'Permanente'
      };
    }

    if (isExpired(item)) {
      return {
        key:'expired',
        label:'Expirada'
      };
    }

    return {
      key:'active',
      label:'Ativa'
    };
  }

  function formatExpiration(value) {
    if (
      value === 'perm' ||
      value === 'permanente'
    ) {
      return 'Permanente';
    }

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    const date =
      typeof value === 'number'
        ? new Date(value)
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  function formatCurrency(value) {
    return Number(
      value || 0
    ).toLocaleString(
      'pt-BR',
      {
        style:'currency',
        currency:'BRL'
      }
    );
  }

  function renderStats() {
    const total =
      releases.length;

    const active =
      releases.filter(
        item =>
          getStatus(item).key === 'active'
      ).length;

    const permanent =
      releases.filter(
        item =>
          getStatus(item).key === 'permanent'
      ).length;

    const revenue =
      releases.reduce(
        (sum, item) =>
          sum + Number(
            item.valorPago || 0
          ),
        0
      );

    const values =
      document.querySelectorAll(
        '#release-stats .release-stat-value'
      );

    if (values[0]) {
      values[0].textContent =
        total.toLocaleString('pt-BR');
    }

    if (values[1]) {
      values[1].textContent =
        active.toLocaleString('pt-BR');
    }

    if (values[2]) {
      values[2].textContent =
        permanent.toLocaleString('pt-BR');
    }

    if (values[3]) {
      values[3].textContent =
        formatCurrency(revenue);
    }
  }

  function renderTable() {
    const query =
      document
        .getElementById('release-search')
        .value
        .trim()
        .toLowerCase();

    const statusFilter =
      document
        .getElementById('release-status')
        .value;

    const filtered =
      releases.filter(item => {

        const status =
          getStatus(item);

        if (
          statusFilter &&
          status.key !== statusFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const haystack =
          [
            item.nick,
            item.discordId,
            item.hwid,
            status.label
          ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });

    const table =
      document.getElementById(
        'releases-table'
      );

    if (!filtered.length) {
      table.innerHTML = `
        <div class="release-empty">

          <div class="release-empty-title">
            Nenhuma release encontrada
          </div>

          <div>
            Não existem releases correspondentes
            aos filtros atuais.
          </div>

        </div>
      `;

      return;
    }

    table.innerHTML = `
      <div class="release-table-wrap">

        <table class="release-table">

          <thead>
            <tr>
              <th>Usuário</th>
              <th>Status</th>
              <th>Expiração</th>
              <th>HWID</th>
              <th>Valor</th>
              <th>Venda</th>
            </tr>
          </thead>

          <tbody>

            ${filtered.map(item => {

              const status =
                getStatus(item);

              return `
                <tr>

                  <td>
                    <div class="release-user">
                      ${escape(item.nick)}
                    </div>

                    <div class="release-discord">
                      ${
                        item.discordId
                          ? escape(item.discordId)
                          : 'Discord ID não informado'
                      }
                    </div>
                  </td>

                  <td>
                    <span
                      class="release-status ${escape(
                        status.key
                      )}"
                    >
                      <span class="release-status-dot"></span>
                      ${escape(status.label)}
                    </span>
                  </td>

                  <td class="release-expiration">
                    ${escape(
                      formatExpiration(
                        item.expiraEm
                      )
                    )}
                  </td>

                  <td>
                    ${escape(item.hwid)}
                  </td>

                  <td class="release-price">
                    ${escape(
                      formatCurrency(
                        item.valorPago
                      )
                    )}
                  </td>

                  <td class="release-expiration">
                    ${escape(
                      formatExpiration(
                        item.dataVenda
                      )
                    )}
                  </td>

                </tr>
              `;
            }).join('')}

          </tbody>

        </table>

      </div>
    `;
  }

  async function load() {
    const table =
      document.getElementById(
        'releases-table'
      );

    table.innerHTML = `
      <div class="loading-state">
        Carregando releases reais...
      </div>
    `;

    try {
      const response =
        await Api.getReleases();

      releases =
        normalize(response);

      renderStats();
      renderTable();

    } catch (error) {
      console.error(
        '[RELEASES]',
        error
      );

      table.innerHTML = `
        <div class="release-empty">

          <div
            class="release-empty-title"
            style="color:var(--danger)"
          >
            Não foi possível carregar as releases
          </div>

          <div>
            ${escape(
              error?.message ||
              'Erro desconhecido'
            )}
          </div>

        </div>
      `;

      Notifications.error(
        'Erro ao carregar releases.'
      );
    }
  }

  function openModal() {
    document
      .getElementById('release-modal')
      .classList.add('open');
  }

  function closeModal() {
    document
      .getElementById('release-modal')
      .classList.remove('open');
  }

  document
    .getElementById('release-refresh')
    .addEventListener(
      'click',
      load
    );

  document
    .getElementById('release-search')
    .addEventListener(
      'input',
      renderTable
    );

  document
    .getElementById('release-status')
    .addEventListener(
      'change',
      renderTable
    );

  document
    .getElementById('release-new')
    .addEventListener(
      'click',
      openModal
    );

  document
    .getElementById('release-modal-close')
    .addEventListener(
      'click',
      closeModal
    );

  document
    .getElementById('release-cancel')
    .addEventListener(
      'click',
      closeModal
    );

  document
    .getElementById('release-modal')
    .addEventListener(
      'click',
      event => {
        if (
          event.target.id ===
          'release-modal'
        ) {
          closeModal();
        }
      }
    );

  document
    .getElementById('release-form')
    .addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const nick =
          document
            .getElementById('release-nick')
            .value
            .trim();

        const discordId =
          document
            .getElementById('release-discord')
            .value
            .trim();

        const tempo =
          document
            .getElementById('release-time')
            .value;

        const valor =
          Number(
            document
              .getElementById('release-value')
              .value || 0
          );

        if (!nick) {
          Notifications.error(
            'Informe o usuário.'
          );
          return;
        }

        try {
          await Api.postRelease({
            nick,
            discordId,
            tempo,
            valor
          });

          Notifications.success(
            'Release criada com sucesso.'
          );

          closeModal();

          event.target.reset();

          await load();

        } catch (error) {
          console.error(
            '[RELEASE CREATE]',
            error
          );

          Notifications.error(
            error?.message ||
            'Não foi possível criar a release.'
          );
        }
      }
    );

  await load();
};
