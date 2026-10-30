/* ============================================================
   RD4X DASHBOARD V10 — Users Page
   ============================================================ */
'use strict';

const UsersPageState = {
  query: '',
  status: 'all',
  sort: 'discord',
  sortDir: 'asc',
  page: 1,
  pageSize: 10,
  data: []
};

window.renderUsers = async function(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Usuários</h1>
        <p class="page-desc">Gerencie licenças, HWIDs e status de usuários</p>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input type="text" class="input search-input" id="users-search" placeholder="Buscar usuário, Discord ID, Roblox ID, HWID...">
        <select class="select" id="users-filter" style="max-width:180px">
          <option value="all">Todos status</option>
          <option value="Ativo">Ativo</option>
          <option value="Expirado">Expirado</option>
          <option value="Blacklisted">Blacklisted</option>
          <option value="Suspenso">Suspenso</option>
          <option value="Sem licença">Sem licença</option>
        </select>
        <div class="ml-auto text-muted" style="font-size:12px" id="users-count"></div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th data-sort="discord">Usuário</th>
              <th data-sort="discordId">Discord ID</th>
              <th data-sort="roblox">Roblox</th>
              <th data-sort="status">Status</th>
              <th data-sort="lastActivity">Última atividade</th>
              <th data-sort="releases">Releases</th>
              <th data-sort="tickets">Tickets</th>
            </tr>
          </thead>
          <tbody id="users-tbody"></tbody>
        </table>
      </div>
      <div class="table-toolbar" style="border-top:1px solid var(--border);border-bottom:none;justify-content:space-between">
        <div class="text-muted" style="font-size:12px" id="users-pagination-info">—</div>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" id="users-prev">Anterior</button>
          <button class="btn btn-ghost btn-sm" id="users-next">Próxima</button>
        </div>
      </div>
    </div>
  `;

  const allUsers = await Api.getUsers();
  UsersPageState.data = allUsers;

  const draw = () => {
    const filtered = filterUsers(UsersPageState.data);
    const sorted = sortUsers(filtered);
    const total = sorted.length;
    const pages = Math.max(1, Math.ceil(total / UsersPageState.pageSize));
    if (UsersPageState.page > pages) UsersPageState.page = pages;
    const start = (UsersPageState.page - 1) * UsersPageState.pageSize;
    const pageItems = sorted.slice(start, start + UsersPageState.pageSize);

    const tbody = el.querySelector('#users-tbody');
    if (!pageItems.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><svg class="icon"><use href="#i-users"/></svg><div>Nenhum usuário encontrado</div></div></td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map(u => `
        <tr class="clickable" data-user-id="${u.id}">
          <td>
            <div class="cell-user">
              <div class="avatar" style="background:${Utils.colorForString(u.discord)}">${Utils.initials(u.discord)}</div>
              <div>
                <div class="cell-strong">${Utils.escapeHtml(u.discord)}</div>
                <div style="font-size:11px;color:var(--muted)">@${Utils.escapeHtml(u.discord)}</div>
              </div>
            </div>
          </td>
          <td class="cell-mono">${Utils.escapeHtml(u.discordId)}</td>
          <td>
            <div class="cell-strong">${Utils.escapeHtml(u.roblox)}</div>
            <div style="font-size:11px;color:var(--muted)">${Utils.escapeHtml(u.robloxId)}</div>
          </td>
          <td>${Utils.statusBadge(u.status)}</td>
          <td>${Utils.relativeTime(u.lastActivity)}</td>
          <td>${u.releases}</td>
          <td>${u.tickets}</td>
        </tr>
      `).join('');
    }

    el.querySelector('#users-count').textContent = `${total} usuário(s)`;
    el.querySelector('#users-pagination-info').textContent = `Página ${UsersPageState.page} de ${pages}`;
    el.querySelector('#users-prev').disabled = UsersPageState.page <= 1;
    el.querySelector('#users-next').disabled = UsersPageState.page >= pages;

    tbody.querySelectorAll('tr[data-user-id]').forEach(row => {
      row.addEventListener('click', () => {
        const u = UsersPageState.data.find(x => x.id === row.dataset.userId);
        if (u) openUserProfileModal(u);
      });
    });
  };

  el.querySelector('#users-search').addEventListener('input', Utils.debounce(e => {
    UsersPageState.query = e.target.value.trim().toLowerCase();
    UsersPageState.page = 1;
    draw();
  }, 200));
  el.querySelector('#users-filter').addEventListener('change', e => {
    UsersPageState.status = e.target.value;
    UsersPageState.page = 1;
    draw();
  });
  el.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (UsersPageState.sort === field) {
        UsersPageState.sortDir = UsersPageState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        UsersPageState.sort = field;
        UsersPageState.sortDir = 'asc';
      }
      draw();
    });
  });
  el.querySelector('#users-prev').addEventListener('click', () => {
    if (UsersPageState.page > 1) { UsersPageState.page--; draw(); }
  });
  el.querySelector('#users-next').addEventListener('click', () => {
    UsersPageState.page++; draw();
  });

  draw();
};

function filterUsers(list) {
  const q = UsersPageState.query;
  return list.filter(u => {
    if (UsersPageState.status !== 'all' && u.status !== UsersPageState.status) return false;
    if (!q) return true;
    return [u.discord, u.discordId, u.roblox, u.robloxId, u.hwid, u.status, u.id]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
  });
}

function sortUsers(list) {
  const f = UsersPageState.sort;
  const dir = UsersPageState.sortDir === 'asc' ? 1 : -1;
  return list.slice().sort((a, b) => {
    const va = a[f] ?? '';
    const vb = b[f] ?? '';
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });
}

window.openUserProfileModal = function(user) {
  const tickets = MockData.tickets.filter(t => t.userId === user.id);
  const releases = MockData.releases.filter(r => r.userId === user.id);
  const incidents = MockData.incidents.filter(i => i.description && i.description.toLowerCase().includes(user.discord.toLowerCase()));
  const audit = MockData.audit.filter(a => a.targetUserId === user.id);
  const transcripts = MockData.transcripts.filter(t => t.userId === user.id);

  const content = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div class="avatar avatar-lg" style="background:${Utils.colorForString(user.discord)}">${Utils.initials(user.discord)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:18px;font-weight:700;letter-spacing:-.3px">${Utils.escapeHtml(user.discord)}</div>
        <div style="font-size:12.5px;color:var(--muted);margin-top:2px">Roblox: ${Utils.escapeHtml(user.roblox)} · ${Utils.escapeHtml(user.robloxId)}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          ${Utils.statusBadge(user.status)}
          ${user.blacklisted ? '<span class="badge bl">Blacklisted</span>' : ''}
        </div>
      </div>
    </div>

    <div class="section-title">Informações</div>
    <div class="field-grid">
      <div class="field"><div class="field-label">Discord</div><div class="field-value">${Utils.escapeHtml(user.discord)}</div></div>
      <div class="field"><div class="field-label">Discord ID</div><div class="field-value mono">${Utils.escapeHtml(user.discordId)}</div></div>
      <div class="field"><div class="field-label">Roblox</div><div class="field-value">${Utils.escapeHtml(user.roblox)}</div></div>
      <div class="field"><div class="field-label">Roblox ID</div><div class="field-value mono">${Utils.escapeHtml(user.robloxId)}</div></div>
      <div class="field"><div class="field-label">HWID</div><div class="field-value mono">${Utils.escapeHtml(user.hwid || '—')}</div></div>
      <div class="field"><div class="field-label">Data de criação</div><div class="field-value">${Utils.formatDate(user.createdAt)}</div></div>
      <div class="field"><div class="field-label">Última atividade</div><div class="field-value">${Utils.formatDate(user.lastActivity)}</div></div>
      <div class="field"><div class="field-label">Blacklist</div><div class="field-value">${user.blacklisted ? 'Sim' : 'Não'}</div></div>
    </div>

    ${user.blacklisted && user.blacklistReason ? `
      <div class="section-title">Motivo da blacklist</div>
      <div class="field-value" style="font-size:13px;color:var(--text-2)">${Utils.escapeHtml(user.blacklistReason)}</div>
    ` : ''}

    <div class="section-title">Histórico de releases (${releases.length})</div>
    ${releases.length ? releases.map(r => `
      <div class="list-item" style="padding:8px 10px">
        <div class="list-item-icon"><svg class="icon"><use href="#i-release"/></svg></div>
        <div style="flex:1">
          <div class="list-item-title">${Utils.escapeHtml(r.id)}</div>
          <div class="list-item-sub">${Utils.escapeHtml(r.admin)} · ${Utils.formatDate(r.createdAt)}</div>
        </div>
        ${Utils.statusBadge(r.status)}
      </div>
    `).join('') : '<div class="text-muted" style="font-size:12.5px">Nenhuma release registrada.</div>'}

    <div class="section-title">Tickets (${tickets.length})</div>
    ${tickets.length ? tickets.map(t => `
      <div class="list-item" style="padding:8px 10px">
        <div class="list-item-icon"><svg class="icon"><use href="#i-ticket"/></svg></div>
        <div style="flex:1">
          <div class="list-item-title">${Utils.escapeHtml(t.id)} · ${Utils.escapeHtml(t.category)}</div>
          <div class="list-item-sub">${Utils.escapeHtml(t.priority)} · ${Utils.formatDate(t.createdAt)}</div>
        </div>
        ${Utils.statusBadge(t.status)}
      </div>
    `).join('') : '<div class="text-muted" style="font-size:12.5px">Nenhum ticket registrado.</div>'}

    <div class="section-title">Auditoria relacionada (${audit.length})</div>
    ${audit.length ? audit.map(a => `
      <div class="list-item" style="padding:8px 10px">
        <div class="list-item-icon ${a.result === 'Falha' ? 'danger' : 'success'}"><svg class="icon"><use href="#i-audit"/></svg></div>
        <div style="flex:1">
          <div class="list-item-title">${Utils.escapeHtml(a.action)}</div>
          <div class="list-item-sub">${Utils.escapeHtml(a.admin)} · ${Utils.formatDate(a.createdAt)}</div>
        </div>
      </div>
    `).join('') : '<div class="text-muted" style="font-size:12.5px">Sem registros.</div>'}

    <div class="section-title">Transcripts relacionados (${transcripts.length})</div>
    ${transcripts.length ? transcripts.map(t => `
      <div class="list-item" style="padding:8px 10px">
        <div class="list-item-icon"><svg class="icon"><use href="#i-transcript"/></svg></div>
        <div style="flex:1">
          <div class="list-item-title">${Utils.escapeHtml(t.id)}</div>
          <div class="list-item-sub">${Utils.escapeHtml(t.ticketId)} · ${t.messages.length} mensagens</div>
        </div>
        <button class="btn btn-ghost btn-sm" data-open-transcript="${t.id}">Abrir</button>
      </div>
    `).join('') : '<div class="text-muted" style="font-size:12.5px">Sem transcripts.</div>'}
  `;

  const modal = Modals.open({
    title: 'Perfil do usuário',
    subtitle: user.discord,
    content,
    size: 'lg',
    actions: [
      { label: 'Fechar', className: 'btn-ghost' },
      {
        label: 'Liberar',
        className: 'btn-primary',
        closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Liberar usuário',
            message: 'Você tem certeza que deseja liberar este usuário?',
            details: `Usuário: ${user.discord}\nDiscord: ${user.discordId}\nRoblox: ${user.roblox}\nRoblox ID: ${user.robloxId}`,
            confirmText: 'Liberar'
          });
          if (ok) {
            Notifications.success('Operação simulada com sucesso. (MOCK)');
            Modals.close(bd);
          }
        }
      },
      {
        label: 'Revogar',
        className: 'btn-ghost',
        closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Revogar licença',
            message: 'Você tem certeza que deseja revogar a licença deste usuário?',
            details: `Usuário: ${user.discord}\nDiscord ID: ${user.discordId}\nRoblox: ${user.roblox}`,
            confirmText: 'Revogar',
            danger: true
          });
          if (ok) {
            Notifications.success('Operação simulada com sucesso. (MOCK)');
            Modals.close(bd);
          }
        }
      },
      {
        label: 'Resetar HWID',
        className: 'btn-ghost',
        closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Resetar HWID',
            message: 'Confirmar reset de HWID para este usuário?',
            details: `Usuário: ${user.discord}\nHWID atual: ${user.hwid || '—'}`,
            confirmText: 'Resetar HWID'
          });
          if (ok) {
            Notifications.success('HWID resetado (simulação).');
            Modals.close(bd);
          }
        }
      },
      {
        label: user.blacklisted ? 'Remover blacklist' : 'Blacklist',
        className: user.blacklisted ? 'btn-success' : 'btn-danger',
        closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: user.blacklisted ? 'Remover da blacklist' : 'Adicionar à blacklist',
            message: user.blacklisted
              ? 'Confirmar remoção deste usuário da blacklist?'
              : 'Confirmar adição deste usuário à blacklist?',
            details: `Usuário: ${user.discord}\nDiscord ID: ${user.discordId}`,
            confirmText: user.blacklisted ? 'Remover' : 'Blacklist',
            danger: !user.blacklisted
          });
          if (ok) {
            Notifications.success('Operação simulada com sucesso. (MOCK)');
            Modals.close(bd);
          }
        }
      }
    ]
  });

  modal.querySelectorAll('[data-open-transcript]').forEach(b => {
    b.addEventListener('click', () => {
      const t = MockData.transcripts.find(x => x.id === b.dataset.openTranscript);
      if (t && window.openTranscriptModal) {
        Modals.close(modal);
        window.openTranscriptModal(t);
      }
    });
  });
};