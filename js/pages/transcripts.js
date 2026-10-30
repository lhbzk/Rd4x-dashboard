/* ============================================================
   RD4X DASHBOARD V10 — Transcripts Page
   ============================================================ */
'use strict';

window.renderTranscripts = async function(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Transcripts</h1>
        <p class="page-desc">Histórico completo de conversas de tickets</p>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input type="text" class="input search-input" id="tr-search" placeholder="Buscar transcript, ticket, usuário, mensagem...">
        <div class="ml-auto text-muted" style="font-size:12px" id="tr-count"></div>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr>
            <th>ID</th><th>Ticket</th><th>Usuário</th><th>Administrador</th>
            <th>Data</th><th>Mensagens</th>
          </tr></thead>
          <tbody id="tr-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const transcripts = await Api.getTranscripts();
  const st = { query:'' };

  const draw = () => {
    const filtered = transcripts.filter(t => {
      const q = st.query;
      if (!q) return true;
      const u = MockData.users.find(x => x.id === t.userId);
      const text = [t.id, t.ticketId, t.admin, u && u.discord, ...t.messages.map(m => m.text)].join(' ').toLowerCase();
      return text.includes(q);
    });

    const tbody = el.querySelector('#tr-tbody');
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg class="icon"><use href="#i-transcript"/></svg><div>Nenhum transcript</div></div></td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(t => {
        const u = MockData.users.find(x => x.id === t.userId);
        return `
          <tr class="clickable" data-tr-id="${t.id}">
            <td class="cell-strong cell-mono">${Utils.escapeHtml(t.id)}</td>
            <td class="cell-mono">${Utils.escapeHtml(t.ticketId)}</td>
            <td>${Utils.escapeHtml(u ? u.discord : '—')}</td>
            <td class="cell-mono">${Utils.escapeHtml(t.admin)}</td>
            <td>${Utils.formatDate(t.createdAt)}</td>
            <td>${t.messages.length}</td>
          </tr>
        `;
      }).join('');
    }
    el.querySelector('#tr-count').textContent = `${filtered.length} transcript(s)`;

    tbody.querySelectorAll('tr[data-tr-id]').forEach(row => {
      row.addEventListener('click', () => {
        const t = transcripts.find(x => x.id === row.dataset.trId);
        if (t) openTranscriptModal(t);
      });
    });
  };

  el.querySelector('#tr-search').addEventListener('input', Utils.debounce(e => {
    st.query = e.target.value.trim().toLowerCase(); draw();
  }, 200));

  draw();
};

window.openTranscriptModal = function(transcript) {
  const u = MockData.users.find(x => x.id === transcript.userId);

  const renderMsgs = (q) => {
    return transcript.messages.map(m => `
      <div class="chat-msg">
        <div class="chat-avatar" style="background:${m.role === 'staff' ? 'var(--accent)' : Utils.colorForString(m.author)}">${Utils.initials(m.author)}</div>
        <div class="chat-body">
          <div class="chat-head">
            <span class="chat-author">${Utils.escapeHtml(m.author)}</span>
            ${m.role === 'staff' ? '<span class="badge info" style="padding:1px 6px;font-size:10px">STAFF</span>' : ''}
            <span class="chat-time">${Utils.formatDate(m.time)}</span>
          </div>
          <div class="chat-text">${q ? Utils.highlight(m.text, q) : Utils.escapeHtml(m.text)}</div>
        </div>
      </div>
    `).join('');
  };

  const modal = Modals.open({
    title: 'Transcript',
    subtitle: `${transcript.id} · ${transcript.ticketId}`,
    size: 'lg',
    content: `
      <div class="field-grid mb-16">
        <div class="field"><div class="field-label">Ticket</div><div class="field-value mono">${Utils.escapeHtml(transcript.ticketId)}</div></div>
        <div class="field"><div class="field-label">Usuário</div><div class="field-value">${Utils.escapeHtml(u ? u.discord : '—')}</div></div>
        <div class="field"><div class="field-label">Administrador</div><div class="field-value mono">${Utils.escapeHtml(transcript.admin)}</div></div>
        <div class="field"><div class="field-label">Data</div><div class="field-value">${Utils.formatDate(transcript.createdAt)}</div></div>
        <div class="field"><div class="field-label">Mensagens</div><div class="field-value">${transcript.messages.length}</div></div>
      </div>
      <input type="text" class="input mb-12" id="tr-inner-search" placeholder="Pesquisar dentro do transcript (ex: pagamento, erro, senha)...">
      <div class="chat-list" id="tr-chat">${renderMsgs('')}</div>
    `,
    actions: [{ label: 'Fechar', className: 'btn-primary' }]
  });

  const input = modal.querySelector('#tr-inner-search');
  const chat = modal.querySelector('#tr-chat');
  input.addEventListener('input', Utils.debounce(e => {
    const q = e.target.value.trim();
    chat.innerHTML = renderMsgs(q);
  }, 150));
};
