/* ============================================================
   RD4X DASHBOARD V10
   Página: Tickets
   Tickets reais vindos da API RD4X
   ============================================================ */

'use strict';

window.renderTickets = async function renderTickets(content, params = {}) {

  const state = {
    tickets: [],
    filtered: [],
    search: params.q || '',
    status: params.status || 'all',
    priority: params.priority || 'all',
    selected: null
  };

  content.innerHTML = `
    <style>
      .tickets-page {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .tickets-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .tickets-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .tickets-subtitle {
        margin: 5px 0 0;
        font-size: 13px;
        color: var(--text-secondary);
      }

      .tickets-refresh {
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
      }

      .tickets-refresh:hover {
        border-color: var(--accent);
      }

      .tickets-refresh.loading {
        opacity: .6;
        pointer-events: none;
      }

      .tickets-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .ticket-stat {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 15px;
      }

      .ticket-stat-label {
        color: var(--text-secondary);
        font-size: 12px;
        margin-bottom: 7px;
      }

      .ticket-stat-value {
        color: var(--text-primary);
        font-size: 22px;
        font-weight: 700;
      }

      .tickets-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
      }

      .tickets-search {
        flex: 1 1 250px;
        height: 38px;
        min-width: 180px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: transparent;
        color: var(--text-primary);
        padding: 0 12px;
        outline: none;
      }

      .tickets-search:focus {
        border-color: var(--accent);
      }

      .tickets-filter {
        height: 38px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        color: var(--text-primary);
        padding: 0 10px;
        outline: none;
      }

      .tickets-count {
        margin-left: auto;
        color: var(--text-secondary);
        font-size: 12px;
      }

      .tickets-table-wrap {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }

      .tickets-table-scroll {
        overflow-x: auto;
      }

      .tickets-table {
        width: 100%;
        min-width: 900px;
        border-collapse: collapse;
      }

      .tickets-table th {
        text-align: left;
        padding: 12px 14px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .04em;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border);
        background: rgba(255,255,255,.02);
        white-space: nowrap;
      }

      .tickets-table td {
        padding: 13px 14px;
        font-size: 13px;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border);
        vertical-align: middle;
      }

      .tickets-table tr:last-child td {
        border-bottom: 0;
      }

      .tickets-table tbody tr {
        cursor: pointer;
        transition: background .12s ease;
      }

      .tickets-table tbody tr:hover {
        background: rgba(255,255,255,.025);
      }

      .ticket-channel {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .ticket-channel-name {
        font-weight: 600;
      }

      .ticket-channel-id {
        font-family: monospace;
        color: var(--text-secondary);
        font-size: 10px;
      }

      .ticket-user {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .ticket-user-name {
        font-weight: 600;
      }

      .ticket-user-id {
        font-family: monospace;
        color: var(--text-secondary);
        font-size: 10px;
      }

      .ticket-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }

      .ticket-badge.open {
        color: #32d583;
        background: rgba(50,213,131,.10);
      }

      .ticket-badge.attending {
        color: #5da9ff;
        background: rgba(93,169,255,.10);
      }

      .ticket-badge.closed {
        color: #ff5c70;
        background: rgba(255,92,112,.10);
      }

      .ticket-badge.normal {
        color: var(--text-secondary);
        background: rgba(255,255,255,.05);
      }

      .ticket-badge.high {
        color: #f5b942;
        background: rgba(245,185,66,.10);
      }

      .ticket-badge.urgent {
        color: #ff5c70;
        background: rgba(255,92,112,.10);
      }

      .ticket-badge.low {
        color: #7fd1ae;
        background: rgba(127,209,174,.10);
      }

      .ticket-tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        max-width: 180px;
      }

      .ticket-tag {
        padding: 3px 6px;
        border-radius: 5px;
        font-size: 10px;
        color: var(--text-secondary);
        background: rgba(255,255,255,.05);
      }

      .ticket-date {
        color: var(--text-secondary);
        font-size: 12px;
        white-space: nowrap;
      }

      .tickets-empty,
      .tickets-loading,
      .tickets-error {
        padding: 45px 20px;
        text-align: center;
        color: var(--text-secondary);
      }

      .tickets-empty-title,
      .tickets-error-title {
        color: var(--text-primary);
        font-weight: 600;
        margin-bottom: 5px;
      }

      .tickets-error-title {
        color: var(--danger);
      }

      .ticket-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(0,0,0,.65);
      }

      .ticket-modal {
        width: min(720px, 100%);
        max-height: min(720px, 90vh);
        overflow-y: auto;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0,0,0,.35);
      }

      .ticket-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 18px;
        border-bottom: 1px solid var(--border);
      }

      .ticket-modal-title {
        margin: 0;
        color: var(--text-primary);
        font-size: 18px;
      }

      .ticket-modal-subtitle {
        margin-top: 4px;
        color: var(--text-secondary);
        font-size: 12px;
      }

      .ticket-modal-close {
        border: 0;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 22px;
        line-height: 1;
      }

      .ticket-modal-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .ticket-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .ticket-detail {
        border: 1px solid var(--border);
        border-radius: 9px;
        padding: 11px;
      }

      .ticket-detail-label {
        font-size: 10px;
        color: var(--text-secondary);
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .ticket-detail-value {
        font-size: 13px;
        color: var(--text-primary);
        word-break: break-word;
      }

      .ticket-section-title {
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .ticket-log {
        padding: 8px 10px;
        border-left: 2px solid var(--border);
        color: var(--text-secondary);
        font-size: 12px;
        margin-bottom: 5px;
      }

      .ticket-note {
        padding: 9px 10px;
        border-radius: 8px;
        background: rgba(255,255,255,.035);
        margin-bottom: 6px;
      }

      .ticket-note-by {
        font-size: 11px;
        color: var(--text-secondary);
      }

      .ticket-note-text {
        color: var(--text-primary);
        font-size: 12px;
        margin-top: 3px;
      }

      @media (max-width: 900px) {
        .tickets-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 520px) {
        .tickets-stats {
          grid-template-columns: 1fr;
        }

        .tickets-count {
          width: 100%;
          margin-left: 0;
        }

        .ticket-detail-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="tickets-page">

      <div class="tickets-header">
        <div>
          <h1 class="tickets-title">Tickets</h1>
          <p class="tickets-subtitle">
            Central de atendimento em tempo real do RD4X Hub.
          </p>
        </div>

        <button
          id="tickets-refresh"
          class="tickets-refresh"
          type="button"
        >
          <svg class="icon">
            <use href="#i-refresh"></use>
          </svg>
          Atualizar
        </button>
      </div>

      <div class="tickets-stats">

        <div class="ticket-stat">
          <div class="ticket-stat-label">
            Total
          </div>
          <div
            id="tickets-total"
            class="ticket-stat-value"
          >
            —
          </div>
        </div>

        <div class="ticket-stat">
          <div class="ticket-stat-label">
            Abertos
          </div>
          <div
            id="tickets-open"
            class="ticket-stat-value"
          >
            —
          </div>
        </div>

        <div class="ticket-stat">
          <div class="ticket-stat-label">
            Em atendimento
          </div>
          <div
            id="tickets-attending"
            class="ticket-stat-value"
          >
            —
          </div>
        </div>

        <div class="ticket-stat">
          <div class="ticket-stat-label">
            Urgentes
          </div>
          <div
            id="tickets-urgent"
            class="ticket-stat-value"
          >
            —
          </div>
        </div>

      </div>

      <div class="tickets-toolbar">

        <input
          id="tickets-search"
          class="tickets-search"
          type="search"
          placeholder="Pesquisar ticket, usuário ou ID..."
          autocomplete="off"
        />

        <select
          id="tickets-status"
          class="tickets-filter"
        >
          <option value="all">
            Todos os status
          </option>

          <option value="open">
            Abertos
          </option>

          <option value="attending">
            Em atendimento
          </option>

          <option value="closed">
            Encerrados
          </option>
        </select>

        <select
          id="tickets-priority"
          class="tickets-filter"
        >
          <option value="all">
            Todas prioridades
          </option>

          <option value="urgent">
            Urgente
          </option>

          <option value="high">
            Alta
          </option>

          <option value="normal">
            Normal
          </option>

          <option value="low">
            Baixa
          </option>
        </select>

        <span
          id="tickets-count"
          class="tickets-count"
        >
          0 tickets
        </span>

      </div>

      <div class="tickets-table-wrap">
        <div class="tickets-table-scroll">

          <table class="tickets-table">

            <thead>
              <tr>
                <th>Ticket</th>
                <th>Usuário</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Pagamento</th>
                <th>Responsável</th>
                <th>Último contato</th>
              </tr>
            </thead>

            <tbody id="tickets-body">
              <tr>
                <td colspan="7">
                  <div class="tickets-loading">
                    Carregando tickets reais...
                  </div>
                </td>
              </tr>
            </tbody>

          </table>

        </div>
      </div>

    </div>
  `;

  const body =
    document.getElementById(
      'tickets-body'
    );

  const searchInput =
    document.getElementById(
      'tickets-search'
    );

  const statusSelect =
    document.getElementById(
      'tickets-status'
    );

  const prioritySelect =
    document.getElementById(
      'tickets-priority'
    );

  const refreshButton =
    document.getElementById(
      'tickets-refresh'
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

  function normalizeTicket(
    ticket
  ) {
    const item =
      ticket &&
      typeof ticket === 'object'
        ? ticket
        : {};

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
      userId:
        item.userId ||
        '',
      username:
        item.username ||
        item.user ||
        'Desconhecido',
      status:
        String(
          item.status ||
          'open'
        ).toLowerCase(),
      prioridade:
        String(
          item.prioridade ||
          item.priority ||
          'normal'
        ).toLowerCase(),
      pagamento:
        item.pagamento ||
        'não informado',
      assumidoPor:
        item.assumidoPor ||
        null,
      tags:
        Array.isArray(item.tags)
          ? item.tags
          : [],
      notas:
        Array.isArray(item.notas)
          ? item.notas
          : [],
      logs:
        Array.isArray(item.logs)
          ? item.logs
          : [],
      ultimoContato:
        item.ultimoContato ||
        null,
      avisoInatividade:
        Boolean(
          item.avisoInatividade
        ),
      messageId:
        item.messageId ||
        null
    };
  }

  function statusInfo(
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

  function priorityInfo(
    priority
  ) {
    const value =
      String(priority || '')
        .toLowerCase();

    if (
      value === 'urgente' ||
      value === 'urgent'
    ) {
      return {
        key: 'urgent',
        label: 'Urgente'
      };
    }

    if (
      value === 'alta' ||
      value === 'high'
    ) {
      return {
        key: 'high',
        label: 'Alta'
      };
    }

    if (
      value === 'baixa' ||
      value === 'low'
    ) {
      return {
        key: 'low',
        label: 'Baixa'
      };
    }

    return {
      key: 'normal',
      label: 'Normal'
    };
  }

  function formatDate(
    value
  ) {
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

  function updateStats() {
    const total =
      state.tickets.length;

    const open =
      state.tickets.filter(
        ticket =>
          statusInfo(
            ticket.status
          ).key === 'open'
      ).length;

    const attending =
      state.tickets.filter(
        ticket =>
          statusInfo(
            ticket.status
          ).key === 'attending'
      ).length;

    const urgent =
      state.tickets.filter(
        ticket =>
          priorityInfo(
            ticket.prioridade
          ).key === 'urgent'
      ).length;

    document.getElementById(
      'tickets-total'
    ).textContent = total;

    document.getElementById(
      'tickets-open'
    ).textContent = open;

    document.getElementById(
      'tickets-attending'
    ).textContent = attending;

    document.getElementById(
      'tickets-urgent'
    ).textContent = urgent;
  }

  function applyFilters() {
    const query =
      state.search
        .trim()
        .toLowerCase();

    state.filtered =
      state.tickets.filter(
        ticket => {

          const status =
            statusInfo(
              ticket.status
            ).key;

          const priority =
            priorityInfo(
              ticket.prioridade
            ).key;

          if (
            state.status !== 'all' &&
            status !== state.status
          ) {
            return false;
          }

          if (
            state.priority !== 'all' &&
            priority !== state.priority
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            String(
              ticket.channelName
            )
              .toLowerCase()
              .includes(query) ||

            String(
              ticket.channelId
            )
              .toLowerCase()
              .includes(query) ||

            String(
              ticket.username
            )
              .toLowerCase()
              .includes(query) ||

            String(
              ticket.userId
            )
              .toLowerCase()
              .includes(query)
          );
        }
      );

    renderRows();
  }

  function renderRows() {

    document.getElementById(
      'tickets-count'
    ).textContent =
      `${state.filtered.length} ${
        state.filtered.length === 1
          ? 'ticket'
          : 'tickets'
      }`;

    if (
      !state.filtered.length
    ) {
      body.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="tickets-empty">
              <div class="tickets-empty-title">
                Nenhum ticket encontrado
              </div>

              <div>
                Não existem tickets correspondentes aos filtros atuais.
              </div>
            </div>
          </td>
        </tr>
      `;

      return;
    }

    body.innerHTML =
      state.filtered
        .map(ticket => {

          const status =
            statusInfo(
              ticket.status
            );

          const priority =
            priorityInfo(
              ticket.prioridade
            );

          const assigned =
            ticket.assumidoPor?.tag ||
            ticket.assumidoPor?.username ||
            'Não assumido';

          const tags =
            ticket.tags
              .slice(0, 3)
              .map(
                tag => `
                  <span class="ticket-tag">
                    ${escape(tag)}
                  </span>
                `
              )
              .join('');

          return `
            <tr
              data-ticket-id="${escape(
                ticket.channelId
              )}"
            >

              <td>
                <div class="ticket-channel">
                  <span class="ticket-channel-name">
                    ${escape(
                      ticket.channelName
                    )}
                  </span>

                  <span class="ticket-channel-id">
                    ${escape(
                      ticket.channelId ||
                      '—'
                    )}
                  </span>

                  ${
                    tags
                      ? `
                        <div class="ticket-tags">
                          ${tags}
                        </div>
                      `
                      : ''
                  }
                </div>
              </td>

              <td>
                <div class="ticket-user">
                  <span class="ticket-user-name">
                    ${escape(
                      ticket.username
                    )}
                  </span>

                  <span class="ticket-user-id">
                    ${escape(
                      ticket.userId ||
                      'Discord não informado'
                    )}
                  </span>
                </div>
              </td>

              <td>
                <span
                  class="ticket-badge ${status.key}"
                >
                  ${status.label}
                </span>
              </td>

              <td>
                <span
                  class="ticket-badge ${priority.key}"
                >
                  ${priority.label}
                </span>
              </td>

              <td>
                ${escape(
                  ticket.pagamento
                )}
              </td>

              <td>
                ${escape(
                  assigned
                )}
              </td>

              <td>
                <span class="ticket-date">
                  ${formatDate(
                    ticket.ultimoContato
                  )}
                </span>
              </td>

            </tr>
          `;
        })
        .join('');

    body
      .querySelectorAll(
        'tr[data-ticket-id]'
      )
      .forEach(row => {
        row.addEventListener(
          'click',
          () => {
            const id =
              row.dataset.ticketId;

            const ticket =
              state.tickets.find(
                item =>
                  String(
                    item.channelId
                  ) === String(id)
              );

            if (ticket) {
              openTicketModal(
                ticket
              );
            }
          }
        );
      });
  }

  function closeModal() {
    const modal =
      document.getElementById(
        'ticket-modal-overlay'
      );

    if (modal) {
      modal.remove();
    }
  }

  function openTicketModal(
    ticket
  ) {
    closeModal();

    const status =
      statusInfo(
        ticket.status
      );

    const priority =
      priorityInfo(
        ticket.prioridade
      );

    const assigned =
      ticket.assumidoPor?.tag ||
      ticket.assumidoPor?.username ||
      'Não assumido';

    const logs =
      ticket.logs.length
        ? ticket.logs
            .slice(-20)
            .map(
              log => `
                <div class="ticket-log">
                  ${escape(log)}
                </div>
              `
            )
            .join('')
        : `
          <div class="ticket-log">
            Nenhum evento registrado.
          </div>
        `;

    const notes =
      ticket.notas.length
        ? ticket.notas
            .slice(-10)
            .map(note => `
              <div class="ticket-note">

                <div class="ticket-note-by">
                  ${escape(
                    note.by ||
                    note.author ||
                    'Administrador'
                  )}
                  ·
                  ${formatDate(
                    note.at
                  )}
                </div>

                <div class="ticket-note-text">
                  ${escape(
                    note.text ||
                    note.content ||
                    ''
                  )}
                </div>

              </div>
            `)
            .join('')
        : `
          <div class="ticket-log">
            Nenhuma nota interna.
          </div>
        `;

    const overlay =
      document.createElement(
        'div'
      );

    overlay.id =
      'ticket-modal-overlay';

    overlay.className =
      'ticket-modal-overlay';

    overlay.innerHTML = `
      <div class="ticket-modal">

        <div class="ticket-modal-header">

          <div>
            <h2 class="ticket-modal-title">
              ${escape(
                ticket.channelName
              )}
            </h2>

            <div class="ticket-modal-subtitle">
              ID:
              ${escape(
                ticket.channelId
              )}
            </div>
          </div>

          <button
            type="button"
            class="ticket-modal-close"
            id="ticket-modal-close"
          >
            ×
          </button>

        </div>

        <div class="ticket-modal-body">

          <div class="ticket-detail-grid">

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Usuário
              </div>

              <div class="ticket-detail-value">
                ${escape(
                  ticket.username
                )}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Discord ID
              </div>

              <div class="ticket-detail-value">
                ${escape(
                  ticket.userId ||
                  '—'
                )}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Status
              </div>

              <div class="ticket-detail-value">
                ${status.label}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Prioridade
              </div>

              <div class="ticket-detail-value">
                ${priority.label}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Pagamento
              </div>

              <div class="ticket-detail-value">
                ${escape(
                  ticket.pagamento
                )}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Responsável
              </div>

              <div class="ticket-detail-value">
                ${escape(
                  assigned
                )}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Último contato
              </div>

              <div class="ticket-detail-value">
                ${formatDate(
                  ticket.ultimoContato
                )}
              </div>
            </div>

            <div class="ticket-detail">
              <div class="ticket-detail-label">
                Inatividade
              </div>

              <div class="ticket-detail-value">
                ${
                  ticket.avisoInatividade
                    ? 'Aviso enviado'
                    : 'Normal'
                }
              </div>
            </div>

          </div>

          <div>
            <div class="ticket-section-title">
              Tags
            </div>

            ${
              ticket.tags.length
                ? `
                  <div class="ticket-tags">
                    ${ticket.tags
                      .map(
                        tag => `
                          <span class="ticket-tag">
                            ${escape(tag)}
                          </span>
                        `
                      )
                      .join('')}
                  </div>
                `
                : `
                  <div class="ticket-log">
                    Nenhuma tag.
                  </div>
                `
            }
          </div>

          <div>
            <div class="ticket-section-title">
              Histórico
            </div>

            ${logs}
          </div>

          <div>
            <div class="ticket-section-title">
              Notas internas
            </div>

            ${notes}
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    document
      .getElementById(
        'ticket-modal-close'
      )
      ?.addEventListener(
        'click',
        closeModal
      );

    overlay.addEventListener(
      'click',
      event => {
        if (
          event.target === overlay
        ) {
          closeModal();
        }
      }
    );
  }

  async function loadTickets() {

    refreshButton.classList.add(
      'loading'
    );

    refreshButton.innerHTML = `
      <svg class="icon">
        <use href="#i-refresh"></use>
      </svg>
      Atualizando...
    `;

    body.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="tickets-loading">
            Buscando tickets reais no RD4X...
          </div>
        </td>
      </tr>
    `;

    try {

      const response =
        await Api.getTickets();

      const raw =
        Array.isArray(response)
          ? response
          : Array.isArray(
              response?.data
            )
              ? response.data
              : [];

      state.tickets =
        raw.map(
          normalizeTicket
        );

      updateStats();
      applyFilters();

    } catch (error) {

      console.error(
        '[TICKETS] Erro:',
        error
      );

      body.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="tickets-error">

              <div class="tickets-error-title">
                Não foi possível carregar os tickets
              </div>

              <div>
                ${escape(
                  error?.message ||
                  'Erro desconhecido ao consultar a API RD4X.'
                )}
              </div>

            </div>
          </td>
        </tr>
      `;

      if (
        window.Notifications
      ) {
        Notifications.error(
          'Erro ao carregar tickets.'
        );
      }

    } finally {

      refreshButton.classList.remove(
        'loading'
      );

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

  prioritySelect.addEventListener(
    'change',
    event => {
      state.priority =
        event.target.value;

      applyFilters();
    }
  );

  refreshButton.addEventListener(
    'click',
    loadTickets
  );

  document.addEventListener(
    'keydown',
    function ticketEscape(event) {
      if (
        event.key === 'Escape'
      ) {
        closeModal();
      }
    }
  );

  await loadTickets();
};
