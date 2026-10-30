/* ============================================================
   RD4X DASHBOARD V10
   Página: Overview
   Dados reais + Tickets recentes reais
   ============================================================ */

'use strict';

window.renderOverview = async function renderOverview(
  content,
  params = {}
) {

  content.innerHTML = `
    <style>
      .overview-page {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .overview-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
        flex-wrap: wrap;
      }

      .overview-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .overview-subtitle {
        margin: 5px 0 0;
        font-size: 13px;
        color: var(--text-secondary);
      }

      .overview-refresh {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 13px;
        border-radius: 9px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text-primary);
        cursor: pointer;
      }

      .overview-refresh:hover {
        border-color: var(--accent);
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .overview-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 16px;
      }

      .overview-card-label {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 8px;
      }

      .overview-card-value {
        font-size: 25px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .overview-section {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }

      .overview-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 15px 16px;
        border-bottom: 1px solid var(--border);
      }

      .overview-section-title {
        margin: 0;
        font-size: 14px;
        color: var(--text-primary);
        font-weight: 650;
      }

      .overview-section-link {
        border: 0;
        background: transparent;
        color: var(--accent);
        cursor: pointer;
        font-size: 12px;
      }

      .overview-list {
        display: flex;
        flex-direction: column;
      }

      .overview-ticket {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 13px 16px;
        border-bottom: 1px solid var(--border);
        cursor: pointer;
      }

      .overview-ticket:last-child {
        border-bottom: 0;
      }

      .overview-ticket:hover {
        background: rgba(255,255,255,.025);
      }

      .overview-ticket-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .overview-ticket-name {
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .overview-ticket-user {
        color: var(--text-secondary);
        font-size: 11px;
      }

      .overview-ticket-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .overview-ticket-status {
        padding: 5px 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 600;
      }

      .overview-ticket-status.open {
        color: #32d583;
        background: rgba(50,213,131,.10);
      }

      .overview-ticket-status.attending {
        color: #5da9ff;
        background: rgba(93,169,255,.10);
      }

      .overview-ticket-status.closed {
        color: #ff5c70;
        background: rgba(255,92,112,.10);
      }

      .overview-admins {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        padding: 14px;
      }

      .overview-admin {
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 11px;
      }

      .overview-admin-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        background: rgba(255,255,255,.06);
      }

      .overview-admin-info {
        min-width: 0;
      }

      .overview-admin-name {
        color: var(--text-primary);
        font-size: 12px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .overview-admin-status {
        color: #32d583;
        font-size: 10px;
        margin-top: 2px;
      }

      .overview-empty {
        padding: 28px 16px;
        text-align: center;
        color: var(--text-secondary);
        font-size: 12px;
      }

      @media (max-width: 900px) {
        .overview-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .overview-admins {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 520px) {
        .overview-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="overview-page">

      <div class="overview-header">
        <div>
          <h1 class="overview-title">
            Overview
          </h1>

          <p class="overview-subtitle">
            Visão geral do RD4X Hub em tempo real.
          </p>
        </div>

        <button
          id="overview-refresh"
          class="overview-refresh"
          type="button"
        >
          <svg class="icon">
            <use href="#i-refresh"></use>
          </svg>
          Atualizar
        </button>
      </div>

      <div class="overview-grid">

        <div class="overview-card">
          <div class="overview-card-label">
            Usuários ativos
          </div>

          <div
            id="overview-ativos"
            class="overview-card-value"
          >
            —
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-card-label">
            Tickets abertos
          </div>

          <div
            id="overview-tickets"
            class="overview-card-value"
          >
            —
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-card-label">
            Execuções
          </div>

          <div
            id="overview-execucoes"
            class="overview-card-value"
          >
            —
          </div>
        </div>

        <div class="overview-card">
          <div class="overview-card-label">
            Faturamento
          </div>

          <div
            id="overview-faturamento"
            class="overview-card-value"
          >
            —
          </div>
        </div>

      </div>

      <section class="overview-section">

        <div class="overview-section-header">

          <h2 class="overview-section-title">
            Tickets recentes
          </h2>

          <button
            id="overview-open-tickets"
            class="overview-section-link"
            type="button"
          >
            Ver todos
          </button>

        </div>

        <div
          id="overview-tickets-list"
          class="overview-list"
        >
          <div class="overview-empty">
            Carregando tickets...
          </div>
        </div>

      </section>

      <section class="overview-section">

        <div class="overview-section-header">

          <h2 class="overview-section-title">
            Administradores ativos
          </h2>

        </div>

        <div
          id="overview-admins"
          class="overview-admins"
        >
          <div class="overview-empty">
            Carregando administradores...
          </div>
        </div>

      </section>

    </div>
  `;

  const refreshButton =
    document.getElementById(
      'overview-refresh'
    );

  function escape(value) {
    if (
      window.Utils &&
      typeof Utils.escapeHtml ===
        'function'
    ) {
      return Utils.escapeHtml(
        String(value ?? '')
      );
    }

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMoney(value) {
    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    ).format(
      Number(value) || 0
    );
  }

  function formatDate(value) {
    if (!value) {
      return '—';
    }

    const timestamp =
      typeof value === 'number'
        ? value
        : new Date(value).getTime();

    if (
      !Number.isFinite(timestamp)
    ) {
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

  function ticketStatus(
    status
  ) {
    const value =
      String(status || '')
        .toLowerCase();

    if (
      value === 'em_atendimento' ||
      value === 'atendimento' ||
      value === 'attending'
    ) {
      return {
        key: 'attending',
        label: 'Em atendimento'
      };
    }

    if (
      value === 'closed' ||
      value === 'fechado' ||
      value === 'encerrado'
    ) {
      return {
        key: 'closed',
        label: 'Encerrado'
      };
    }

    return {
      key: 'open',
      label: 'Aberto'
    };
  }

  function normalizeTicket(
    item
  ) {
    return {
      channelId:
        item.channelId ||
        item.id ||
        '',

      channelName:
        item.channelName ||
        item.name ||
        (
          item.channelId
            ? `ticket-${item.channelId}`
            : 'Ticket'
        ),

      username:
        item.username ||
        item.user ||
        'Desconhecido',

      userId:
        item.userId ||
        '',

      status:
        item.status ||
        'open',

      prioridade:
        item.prioridade ||
        'normal',

      ultimoContato:
        item.ultimoContato ||
        null
    };
  }

  async function loadOverview() {

    refreshButton.disabled =
      true;

    try {

      const [
        overviewResponse,
        ticketsResponse,
        adminsResponse
      ] = await Promise.all([
        Api.getOverview(),
        Api.getTickets(),
        Api.getAdmins()
      ]);

      const overview =
        overviewResponse?.data ||
        overviewResponse ||
        {};

      const ticketsRaw =
        Array.isArray(
          ticketsResponse
        )
          ? ticketsResponse
          : Array.isArray(
              ticketsResponse?.data
            )
              ? ticketsResponse.data
              : [];

      const adminsRaw =
        Array.isArray(
          adminsResponse
        )
          ? adminsResponse
          : Array.isArray(
              adminsResponse?.data
            )
              ? adminsResponse.data
              : [];

      document.getElementById(
        'overview-ativos'
      ).textContent =
        Number(
          overview.ativos || 0
        );

      document.getElementById(
        'overview-tickets'
      ).textContent =
        Number(
          overview.ticketsAbertos || 0
        );

      document.getElementById(
        'overview-execucoes'
      ).textContent =
        Number(
          overview.execucoes || 0
        );

      document.getElementById(
        'overview-faturamento'
      ).textContent =
        formatMoney(
          overview.faturamento
        );

      renderTickets(
        ticketsRaw
          .map(normalizeTicket)
          .slice(0, 8)
      );

      renderAdmins(
        adminsRaw
      );

    } catch (error) {

      console.error(
        '[OVERVIEW]',
        error
      );

      document.getElementById(
        'overview-tickets-list'
      ).innerHTML = `
        <div class="overview-empty">
          Não foi possível carregar os tickets.
        </div>
      `;

      document.getElementById(
        'overview-admins'
      ).innerHTML = `
        <div class="overview-empty">
          Não foi possível carregar os administradores.
        </div>
      `;

      if (
        window.Notifications
      ) {
        Notifications.error(
          'Erro ao atualizar o Overview.'
        );
      }

    } finally {

      refreshButton.disabled =
        false;
    }
  }

  function renderTickets(
    tickets
  ) {
    const container =
      document.getElementById(
        'overview-tickets-list'
      );

    if (!tickets.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhum ticket encontrado.
        </div>
      `;

      return;
    }

    container.innerHTML =
      tickets
        .map(ticket => {

          const status =
            ticketStatus(
              ticket.status
            );

          return `
            <div
              class="overview-ticket"
              data-ticket-id="${escape(
                ticket.channelId
              )}"
            >

              <div class="overview-ticket-main">

                <div class="overview-ticket-name">
                  ${escape(
                    ticket.channelName
                  )}
                </div>

                <div class="overview-ticket-user">
                  ${escape(
                    ticket.username
                  )}
                </div>

              </div>

              <div class="overview-ticket-right">

                <span
                  class="overview-ticket-status ${status.key}"
                >
                  ${status.label}
                </span>

              </div>

            </div>
          `;
        })
        .join('');

    container
      .querySelectorAll(
        '[data-ticket-id]'
      )
      .forEach(element => {

        element.addEventListener(
          'click',
          () => {
            window.location.hash =
              `#/tickets?q=${
                encodeURIComponent(
                  element.dataset.ticketId
                )
              }`;
          }
        );

      });
  }

  function renderAdmins(
    admins
  ) {
    const container =
      document.getElementById(
        'overview-admins'
      );

    if (!admins.length) {
      container.innerHTML = `
        <div class="overview-empty">
          Nenhum administrador encontrado.
        </div>
      `;

      return;
    }

    container.innerHTML =
      admins
        .map(admin => {

          const avatar =
            admin.avatar ||
            admin.user?.avatar ||
            '';

          const name =
            admin.name ||
            admin.username ||
            admin.tag ||
            'Administrador';

          const status =
            admin.status === 'online'
              ? 'Online'
              : 'Offline';

          return `
            <div class="overview-admin">

              ${
                avatar
                  ? `
                    <img
                      class="overview-admin-avatar"
                      src="${escape(avatar)}"
                      alt=""
                    />
                  `
                  : `
                    <div
                      class="overview-admin-avatar"
                    ></div>
                  `
              }

              <div class="overview-admin-info">

                <div class="overview-admin-name">
                  ${escape(name)}
                </div>

                <div
                  class="overview-admin-status"
                  style="${
                    status === 'Offline'
                      ? 'color:var(--text-secondary)'
                      : ''
                  }"
                >
                  ${status}
                </div>

              </div>

            </div>
          `;
        })
        .join('');
  }

  document
    .getElementById(
      'overview-open-tickets'
    )
    ?.addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/tickets';
      }
    );

  refreshButton.addEventListener(
    'click',
    loadOverview
  );

  await loadOverview();
};
