/* ============================================================
   RD4X DASHBOARD V10 — Releases Page
   ============================================================ */
'use strict';

const ReleasesPageState = { query: '', status: 'all' };

window.renderReleases = async function(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Releases</h1>
        <p class="page-desc">Histórico de liberações de licenças</p>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input type="text" class="input search-input" id="releases-search" placeholder="Buscar release, usuário, admin, HWID...">
        <select class="select" id="releases-status" style="max-width:160px">
          <option value="all">Todos status</option>
          <option>Ativa</option><option>Revogada</option><option>Expirada</option>
        </select>
        <div class="ml-auto text-muted" style="font-size:12px" id="releases-count"></div>
      </div>
      <div class="table-scroll">
        <table>
          <thead><tr>
            <th>Release</th><th>Discord</th><th>Discord ID</th>
            <th>Roblox</th><th>Admin</th><th>Data</th><th>Status</th><th>HWID</th>
          </tr></thead>
          <tbody id="releases-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const releases = await Api.getReleases();
  const draw = () => {
    const filtered = releases.filter(r => {
      if (ReleasesPageState.status !== 'all' && r.status !== ReleasesPageState.status) return false;
      const q = ReleasesPageState.query;
      if (!q) return true;
      const u = MockData.users.find(x => x.id === r.userId);
      const hay = [r.id, r.admin, r.status, r.hwid, u && u.discord, u && u.discordId, u && u.roblox].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });

    const tbody = el.querySelector('#releases-tbody');
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><svg class="icon"><use href="#i-release"/></svg><div>Nenhuma release encontrada</div></div></td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(r => {
        const u = MockData.users.find(x => x.id === r.userId);
        return `
          <tr class="clickable" data-release-id="${r.id}">
            <td class="cell-strong cell-mono">${Utils.escapeHtml(r.id)}</td>
            <td>${Utils.escapeHtml(u ? u.discord : '—')}</td>
            <td class="cell-mono">${Utils.escapeHtml(u ? u.discordId : '—')}</td>
            <td>${Utils.escapeHtml(u ? u.roblox : '—')}</td>
            <td class="cell-mono">${Utils.escapeHtml(r.admin)}</td>
            <td>${Utils.formatDate(r.createdAt)}</td>
            <td>${Utils.statusBadge(r.status)}</td>
            <td class="cell-mono">${Utils.escapeHtml(r.hwid || '—')}</td>
          </tr>
        `;
      }).join('');
    }
    el.querySelector('#releases-count').textContent = `${filtered.length} release(s)`;
    tbody.querySelectorAll('tr[data-release-id]').forEach(row => {
      row.addEventListener('click', () => {
        const r = releases.find(x => x.id === row.dataset.releaseId);
        if (r) openReleaseModal(r);
      });
    });
  };

  el.querySelector('#releases-search').addEventListener('input', Utils.debounce(e => {
    ReleasesPageState.query = e.target.value.trim().toLowerCase();
    draw();
  }, 200));
  el.querySelector('#releases-status').addEventListener('change', e => {
    ReleasesPageState.status = e.target.value; draw();
  });

  draw();
};

window.openReleaseModal = function(release) {
  const user = MockData.users.find(u => u.id === release.userId);
  const content = `
    <div class="field-grid">
      <div class="field"><div class="field-label">Release ID</div><div class="field-value mono">${Utils.escapeHtml(release.id)}</div></div>
      <div class="field"><div class="field-label">Status</div><div class="field-value">${Utils.statusBadge(release.status)}</div></div>
      <div class="field"><div class="field-label">Administrador</div><div class="field-value mono">${Utils.escapeHtml(release.admin)}</div></div>
      <div class="field"><div class="field-label">Data</div><div class="field-value">${Utils.formatDate(release.createdAt)}</div></div>
      <div class="field"><div class="field-label">HWID</div><div class="field-value mono">${Utils.escapeHtml(release.hwid || '—')}</div></div>
    </div>
    <div class="section-title">Usuário</div>
    <div class="field-grid">
      <div class="field"><div class="field-label">Discord</div><div class="field-value">${Utils.escapeHtml(user ? user.discord : '—')}</div></div>
      <div class="field"><div class="field-label">Discord ID</div><div class="field-value mono">${Utils.escapeHtml(user ? user.discordId : '—')}</div></div>
      <div class="field"><div class="field-label">Roblox</div><div class="field-value">${Utils.escapeHtml(user ? user.roblox : '—')}</div></div>
      <div class="field"><div class="field-label">Roblox ID</div><div class="field-value mono">${Utils.escapeHtml(user ? user.robloxId : '—')}</div></div>
    </div>
  `;

  Modals.open({
    title: 'Detalhes da release',
    subtitle: release.id,
    content,
    size: 'lg',
    actions: [
      { label: 'Fechar', className: 'btn-ghost' },
      {
        label: 'Revogar', className: 'btn-danger', closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Revogar release',
            message: 'Você tem certeza que deseja revogar esta release?',
            details: `Release: ${release.id}\nUsuário: ${user ? user.discord : '—'}\nDiscord: ${user ? user.discordId : '—'}\nRoblox: ${user ? user.roblox : '—'}`,
            confirmText: 'Revogar', danger: true
          });
          if (ok) { Notifications.success('Release revogada (simulação).'); Modals.close(bd); }
        }
      },
      {
        label: 'Resetar HWID', className: 'btn-ghost', closeOnClick: false,
        onClick: async (bd) => {
          const ok = await Modals.confirm({
            title: 'Resetar HWID',
            message: 'Confirmar reset de HWID desta release?',
            details: `Release: ${release.id}\nHWID atual: ${release.hwid || '—'}`,
            confirmText: 'Resetar'
          });
          if (ok) { Notifications.success('HWID resetado (simulação).'); Modals.close(bd); }
        }
      }
    ]
  });
};
