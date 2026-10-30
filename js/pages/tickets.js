/* ============================================================
   RD4X DASHBOARD V10 — Tickets Page
   ============================================================ */
'use strict';

const TicketsPageState = { query: '', status: 'all', priority: 'all' };

window.renderTickets = async function(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Tickets</h1>
        <p class="page-desc">Gerencie tickets de suporte e atendimento</p>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input type="text" class="input search-input" id="tickets-search" placeholder="Buscar ticket, usuário, categoria...">
        <select class="select" id="tickets-status" style="max-width:180px">
          <option value="all">Todos status</option>
          <option>Aberto</option><option>Em atendimento</option>
          <option>Aguardando usuário</option><option>Resolvido</option><option>Fechado</option>
        </select>
        <select class="select" id="tickets-priority" style="max-width:160px">
          <option value="all">Todas prioridades</option>
          <option>Baixa</option><option>Normal</option><option>Alta</option><option>Urgente</option>
        </select>
        <div class="ml-auto text-muted" style="font-size:12px" id="tickets-count"></div>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr>
            <th>Ticket</th><th>Usuário</th><th>Categoria</th>
            <th>Prioridade</th><th>Responsável</th><th>Status</th>
            <th>Criado</th><th>Atualizado</th>
          </tr></thead>
          <tbody id="tickets-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tickets = await Api.getTickets();
  const draw = () => {
    const filtered = tickets.filter(t => {
      if (TicketsPageState.status !== 'all' && t.status !== TicketsPageState.status) return false;
      if (TicketsPageState.priority !== 'all' && t.priority !== TicketsPageState.priority) return false;
      const q = TicketsPageState.query;
      if (!q) return true;
      const user = MockData.users.find(u => u.id === t.userId);
      const hay = [t.id, t.category, t.priority, t.assignee, t.status, user && user.discord, user && user.discordId].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });

    const tbody = el.querySelector('#tickets-tbody');
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><svg class="icon"><use href="#i-ticket"/></svg><div>Nenhum ticket encontrado</div></div></td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(t => {
        const user = MockData.users.find(u => u.id === t.userId);
        return `
          <tr class="clickable" data-ticket-id="${t.id}">
            <td class="cell-strong cell-mono">${Utils.escapeHtml(t.id)}</td>
            <td>
              <div class="cell-user">
                <div class="avatar" style="background:${Utils.colorForString(user ? user.discord : '?')}">${Utils.initials(user ? user.discord : '?')}</div>
                <div>
                  <div class="cell-strong">${Utils.escapeHtml(user ? user.discord : '—')}</div>
                  <div style="font-size:11px;color:var(--muted)">${Utils.escapeHtml(user ? user.discordId : '')}</div>
                </div>
              </div>
            </td>
            <td>${Utils.escapeHtml(t.category)}</td>
            <td>${Utils.priorityBadge(t.priority)}</td>
            <td class="cell-mono">${Utils.escapeHtml(t.assignee || '—')}</td>
            <td>${Utils.statusBadge(t.status)}</td>
            <td>${Utils.formatDate(t.createdAt, {dateOnly: true})}</td>
            <td>${Utils.relativeTime(t.updatedAt)}</td>
          </tr>
        `;
      }).join('');
    }

    el.querySelector('#tickets-count').textContent = `${filtered.length} ticket(s)`;
    tbody.querySelectorAll('tr[data-ticket-id]').forEach(row => {
      row.addEventListener('click', () => {
        const t = tickets.find(x => x.id === row.dataset.ticketId);
        if (t) openTicketModal(t);
      });
    });
  };

  el.querySelector('#tickets-search').addEventListener('input', Utils.debounce(e => {
    TicketsPageState.query = e.target.value.trim().toLowerCase();
    draw();
  }, 200));
  el.querySelector('#tickets-status').addEventListener('change', e => { TicketsPageState.status = e.target.value; draw(); });
  el.querySelector('#tickets-priority').addEventListener('change', e => { TicketsPageState.priority = e.target.value; draw(); });

  draw();
};

window.openTicketModal = function(ticket) {
  const user = MockData.users.find(u => u.id === ticket.userId);
  const transcript = MockData.transcripts.find(t => t.ticketId === ticket.id);

  const content = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${Utils.statusBadge(ticket.status)}
      ${Utils.priorityBadge(ticket.priority)}
      <span class="badge info">${Utils.escapeHtml(ticket.category)}</span>
    </div>

    <div class="section-title">Informações do ticket</div>
    <div class="field-grid">
      <div class="field"><div class="field-label">Ticket ID</div><div class="field-value mono">${Utils.escapeHtml(ticket.id)}</div></div>
      <div class="field"><div class="field-label">Categoria</div><div class="field-value">${Utils.escapeHtml(ticket.category)}</div></div>
      <div class="field"><div class="field-label">Responsável</div><div class="field-value mono">${Utils.escapeHtml(ticket.assignee || '—')}</div></div>
      <div class="field"><div class="field-label">Criado em</div><div class="field-value">${Utils.formatDate(ticket.createdAt)}</div></div>
      <div class="field"><div class="field-label">Atualizado em</div><div class="field-value">${Utils.formatDate(ticket.updatedAt)}</div></div>
    </div>

    ${user ? `
      <div class="section-title">Usuário</div>
      <div class="field-grid">
        <div class="field"><div class="field-label">Discord</div><div class="field-value">${Utils.escapeHtml(user.discord)}</div></div>
        <div class="field"><div class="field-label">Discord ID</div><div class="field-value mono">${Utils.escapeHtml(user.discordId)}</div></div>
        <div class="field"><div class="field-label">Roblox</div><div class="field-value">${Utils.escapeHtml(user.roblox)}</div></div>
        <div class="field"><div class="field-label">Status</div><div class="field-value">${Utils.statusBadge(user.status)}</div></div>
      </div>
    ` : ''}

    <div class="section-title">Mensagens</div>
    <div class="chat-list">
      ${ticket.messages.map(m => `
        <div class="chat-msg">
          <div class="chat-avatar" style="background:${m.role === 'staff' ? 'var(--accent)' : Utils.colorForString(m.author)}">${Utils.initials(m.author)}</div>
          <div class="chat-body">
            <div class="chat-head">
              <span class="chat-author">${Utils.escapeHtml(m.author)}</span>
              ${m.role === 'staff' ? '<span class="badge info" style="padding:1px 6px;font-size:10px">STAFF</span>' : ''}
              <span class="chat-time">${Utils.formatDate(m.time)}</span>
            </div>
            <div class="chat-text">${Utils.escapeHtml(m.text)}</div>
          </div>
        </div>
      `).join('')}
    </div>

    ${transcript ? `
      <div class="section-title">Transcript</div>
      <button class="btn btn-ghost" data-open-transcript="${transcript.id}">
        <svg class="icon" style="width:14px;height:14px"><use href="#i-transcript"/></svg>
        Abrir transcript completo (${transcript.messages.length} mensagens)
      </button>
    ` : ''}
  `;

  const modal = Modals.open({
    title: 'Detalhes do ticket',
    subtitle: ticket.id,
    content,
    size: 'lg',
    actions: [
      { label: 'Fechar', className: 'btn-ghost' },
      {
        label: 'Assumir ticket',
        className: 'btn-primary',
        closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Assumir ticket',
            message: 'Deseja assumir este ticket?',
            details: `Ticket: ${ticket.id}\nCategoria: ${ticket.category}\nPrioridade: ${ticket.priority}`,
            confirmText: 'Assumir'
          });
          if (ok) { Notifications.success('Ticket assumido (simulação).'); Modals.close(bd); }
        }
      }
    ]
  });

  const trBtn = modal.querySelector('[data-open-transcript]');
  if (trBtn) trBtn.addEventListener('click', () => {
    Modals.close(modal);
    if (window.openTranscriptModal) window.openTranscriptModal(transcript);
  });
};
