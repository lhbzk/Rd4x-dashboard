/* ============================================================
   RD4X DASHBOARD V10 — API Layer
   Camada de serviço. Em MOCK_MODE retorna dados fictícios.
   Em produção, chamará a API do rd4x-server via proxy seguro.
   ============================================================ */
'use strict';

const CONFIG = {
  MOCK_MODE: false,
  API_BASE_URL: 'https://rd4x-dashboard.ronaldoo-sev7n.workers.dev/api/rd4x',
  REFRESH_INTERVAL: 30000,
  ENVIRONMENT: 'demo',
  DASHBOARD_VERSION: '10.0.0',
  API_VERSION: '10.x'
};

const Api = {
  isMock() { return CONFIG.MOCK_MODE === true; },

  getConfig() {
    return {
      mockMode: CONFIG.MOCK_MODE,
      apiBaseUrl: CONFIG.API_BASE_URL,
      refreshInterval: CONFIG.REFRESH_INTERVAL,
      environment: CONFIG.ENVIRONMENT,
      dashboardVersion: CONFIG.DASHBOARD_VERSION,
      apiVersion: CONFIG.API_VERSION,
      connected: true
    };
  },

  _delay(ms = 250) { return new Promise(r => setTimeout(r, ms)); },

  async _request(method, path, body) {
    if (CONFIG.MOCK_MODE) throw new Error('Requisição real bloqueada em MOCK_MODE');
    const url = CONFIG.API_BASE_URL.replace(/\/$/, '') + path;
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include'
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  /* ============ ENDPOINTS OFICIAIS (RD4X V10) ============ */

  async getOverview() {
    if (CONFIG.MOCK_MODE) { await this._delay(); return this._computeMockOverview(); }
    return this._request('GET', '/api/dashboard/overview');
  },

  async getUsers(params = {}) {
    if (CONFIG.MOCK_MODE) { await this._delay(180); return MockData.users.slice(); }
    const qs = new URLSearchParams(params).toString();
    return this._request('GET', '/api/dashboard/users' + (qs ? '?' + qs : ''));
  },

  async getTickets(params = {}) {
    if (CONFIG.MOCK_MODE) { await this._delay(180); return MockData.tickets.slice(); }
    const qs = new URLSearchParams(params).toString();
    return this._request('GET', '/api/dashboard/tickets' + (qs ? '?' + qs : ''));
  },

  async getAudit(params = {}) {
    if (CONFIG.MOCK_MODE) { await this._delay(180); return MockData.audit.slice(); }
    const qs = new URLSearchParams(params).toString();
    return this._request('GET', '/api/dashboard/audit' + (qs ? '?' + qs : ''));
  },

  async getReleases() {
    if (CONFIG.MOCK_MODE) { await this._delay(160); return MockData.releases.slice(); }
    return this._request('GET', '/api/dashboard/overview');
  },

  async getIncidents() {
    if (CONFIG.MOCK_MODE) { await this._delay(160); return MockData.incidents.slice(); }
    return this._request('GET', '/api/dashboard/overview');
  },

  async getTranscripts() {
    if (CONFIG.MOCK_MODE) { await this._delay(160); return MockData.transcripts.slice(); }
    return this._request('GET', '/api/dashboard/tickets');
  },

  /* ============ AÇÕES ADMINISTRATIVAS ============ */

  async postRelease(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);
      return { ok: true, simulated: true, message: 'Operação simulada com sucesso (MOCK MODE).', payload };
    }
    return this._request('POST', '/api/dashboard/release', payload);
  },

  async postResetHwid(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);
      return { ok: true, simulated: true, message: 'HWID resetado (simulação).', payload };
    }
    return this._request('POST', '/api/dashboard/reset-hwid', payload);
  },

  async postRevoke(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);
      return { ok: true, simulated: true, message: 'Release revogada (simulação).', payload };
    }
    return this._request('POST', '/api/dashboard/revoke', payload);
  },

  async postBlacklist(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);
      return { ok: true, simulated: true, message: 'Usuário blacklistado (simulação).', payload };
    }
    return this._request('POST', '/api/dashboard/blacklist', payload);
  },

  async postUnblacklist(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);
      return { ok: true, simulated: true, message: 'Usuário removido da blacklist (simulação).', payload };
    }
    return this._request('POST', '/api/dashboard/unblacklist', payload);
  },

  /* ============ HELPERS INTERNOS ============ */

  _computeMockOverview() {
    const users = MockData.users;
    return {
      users: {
        total: users.length,
        active: users.filter(u => u.status === 'Ativo').length,
        blacklisted: users.filter(u => u.blacklisted).length,
        suspended: users.filter(u => u.status === 'Suspenso').length,
        expired: users.filter(u => u.status === 'Expirado').length
      },
      tickets: {
        total: MockData.tickets.length,
        open: MockData.tickets.filter(t => t.status === 'Aberto').length,
        inProgress: MockData.tickets.filter(t => t.status === 'Em atendimento').length,
        waitingUser: MockData.tickets.filter(t => t.status === 'Aguardando usuário').length,
        resolved: MockData.tickets.filter(t => t.status === 'Resolvido').length,
        closed: MockData.tickets.filter(t => t.status === 'Fechado').length
      },
      releases: {
        total: MockData.releases.length,
        last24h: MockData.releases.filter(r => Date.now() - new Date(r.createdAt).getTime() < 24 * 3600 * 1000).length,
        active: MockData.releases.filter(r => r.status === 'Ativa').length,
        revoked: MockData.releases.filter(r => r.status === 'Revogada').length
      },
      incidents: {
        total: MockData.incidents.length,
        open: MockData.incidents.filter(i => i.status === 'Aberto' || i.status === 'Investigando').length
      },
      hwid: {
        active: users.filter(u => u.hwid).length
      },
      admins: [
        { name:'admin.alice', role:'Super Admin', status:'online' },
        { name:'admin.bob', role:'Moderador', status:'online' },
        { name:'admin.carol', role:'Suporte', status:'away' }
      ],
      recentActivity: MockData.audit.slice(0, 8),
      recentTickets: MockData.tickets.slice(0, 5),
      recentReleases: MockData.releases.slice(0, 5),
      recentIncidents: MockData.incidents.slice(0, 5),
      releaseVolumeAlert: MockData.releaseVolumeAlert,
      systemActivity: MockData.systemActivity
    };
  }
};

window.CONFIG = CONFIG;
window.Api = Api;
