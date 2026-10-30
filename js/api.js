/* ============================================================
   RD4X DASHBOARD V10 — API Layer
   ============================================================ */
'use strict';

const CONFIG = {
  MOCK_MODE: false,
  API_BASE_URL: 'https://rd4x-dashboard.ronaldoo-sev7n.workers.dev',
  REFRESH_INTERVAL: 30000,
  ENVIRONMENT: 'production',
  DASHBOARD_VERSION: '10.0.0',
  API_VERSION: '10.x'
};

const Api = {
  isMock() {
    return CONFIG.MOCK_MODE === true;
  },

  getConfig() {
    return {
      mockMode: CONFIG.MOCK_MODE,
      apiBaseUrl: CONFIG.API_BASE_URL,
      refreshInterval: CONFIG.REFRESH_INTERVAL,
      environment: CONFIG.ENVIRONMENT,
      dashboardVersion: CONFIG.DASHBOARD_VERSION,
      apiVersion: CONFIG.API_VERSION,
      connected: !CONFIG.MOCK_MODE
    };
  },

  _delay(ms = 250) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async _request(method, path, body) {
    if (CONFIG.MOCK_MODE) {
      throw new Error('Requisição real bloqueada em MOCK_MODE');
    }

    const url =
      CONFIG.API_BASE_URL.replace(/\/$/, '') + path;

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      signal: controller.signal
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(
          `Tempo limite excedido ao acessar ${path}`
        );
      }

      throw error;

    } finally {
      clearTimeout(timeout);
    }
  },

  async getOverview() {
    if (CONFIG.MOCK_MODE) {
      await this._delay();
      return this._computeMockOverview();
    }

    const overviewResponse = await this._request(
      'GET',
      '/api/rd4x/overview'
    );

    let adminsResponse = {
      success: true,
      data: []
    };

    try {
      adminsResponse = await this._request(
        'GET',
        '/api/rd4x/admins'
      );
    } catch (error) {
      console.warn(
        '[RD4X] Não foi possível carregar administradores:',
        error
      );
    }

    const data = overviewResponse?.data || {};
    const admins = Array.isArray(adminsResponse?.data)
      ? adminsResponse.data
      : [];

    return {
      users: {
        total: data.ativos || 0,
        active: data.ativos || 0,
        blacklisted: 0,
        suspended: 0,
        expired: 0
      },

      tickets: {
        total: data.ticketsAbertos || 0,
        open: data.ticketsAbertos || 0,
        inProgress: 0,
        waitingUser: 0,
        resolved: 0,
        closed: 0
      },

      releases: {
        total: data.execucoes || 0,
        last24h: 0,
        active: data.execucoes || 0,
        revoked: 0
      },

      incidents: {
        total: data.incidentesAbertos || 0,
        open: data.incidentesAbertos || 0
      },

      hwid: {
        active: 0
      },

      admins: admins.map(admin => ({
        id: admin.id,
        discordId: admin.discordId || admin.id,
        name: admin.name || 'Administrador',
        tag: admin.tag || admin.name || 'Administrador',
        avatar: admin.avatar || '',
        role: admin.role || 'Administrador',
        status: admin.status || 'offline',
        isOwner: Boolean(admin.isOwner)
      })),

      recentActivity: [],
      recentTickets: [],
      recentReleases: [],
      recentIncidents: [],
      systemActivity: [],

      vendas: data.vendas || 0,
      faturamento: data.faturamento || 0
    };
  },

  async getUsers(params = {}) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(180);
      return MockData.users.slice();
    }

    const qs = new URLSearchParams(params).toString();

    return this._request(
      'GET',
      '/api/dashboard/users' + (qs ? '?' + qs : '')
    );
  },

  async getTickets(params = {}) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(180);
      return MockData.tickets.slice();
    }

    const qs = new URLSearchParams(params).toString();

    return this._request(
      'GET',
      '/api/dashboard/tickets' + (qs ? '?' + qs : '')
    );
  },

  async getAudit(params = {}) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(180);
      return MockData.audit.slice();
    }

    const qs = new URLSearchParams(params).toString();

    return this._request(
      'GET',
      '/api/dashboard/audit' + (qs ? '?' + qs : '')
    );
  },

  async getReleases() {
    if (CONFIG.MOCK_MODE) {
      await this._delay(160);
      return MockData.releases.slice();
    }

    return this._request(
      'GET',
      '/api/dashboard/overview'
    );
  },

  async getIncidents() {
    if (CONFIG.MOCK_MODE) {
      await this._delay(160);
      return MockData.incidents.slice();
    }

    return this._request(
      'GET',
      '/api/dashboard/overview'
    );
  },

  async getTranscripts() {
    if (CONFIG.MOCK_MODE) {
      await this._delay(160);
      return MockData.transcripts.slice();
    }

    return this._request(
      'GET',
      '/api/dashboard/tickets'
    );
  },

  async postRelease(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);

      return {
        ok: true,
        simulated: true,
        message: 'Operação simulada com sucesso (MOCK MODE).',
        payload
      };
    }

    return this._request(
      'POST',
      '/api/dashboard/release',
      payload
    );
  },

  async postResetHwid(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);

      return {
        ok: true,
        simulated: true,
        message: 'HWID resetado (simulação).',
        payload
      };
    }

    return this._request(
      'POST',
      '/api/dashboard/reset-hwid',
      payload
    );
  },

  async postRevoke(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);

      return {
        ok: true,
        simulated: true,
        message: 'Release revogada (simulação).',
        payload
      };
    }

    return this._request(
      'POST',
      '/api/dashboard/revoke',
      payload
    );
  },

  async postBlacklist(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);

      return {
        ok: true,
        simulated: true,
        message: 'Usuário blacklistado (simulação).',
        payload
      };
    }

    return this._request(
      'POST',
      '/api/dashboard/blacklist',
      payload
    );
  },

  async postUnblacklist(payload) {
    if (CONFIG.MOCK_MODE) {
      await this._delay(400);

      return {
        ok: true,
        simulated: true,
        message: 'Usuário removido da blacklist (simulação).',
        payload
      };
    }

    return this._request(
      'POST',
      '/api/dashboard/unblacklist',
      payload
    );
  },

  _computeMockOverview() {
    const users = MockData.users;

    return {
      users: {
        total: users.length,
        active: users.filter(
          u => u.status === 'Ativo'
        ).length,
        blacklisted: users.filter(
          u => u.blacklisted
        ).length,
        suspended: users.filter(
          u => u.status === 'Suspenso'
        ).length,
        expired: users.filter(
          u => u.status === 'Expirado'
        ).length
      },

      tickets: {
        total: MockData.tickets.length,
        open: MockData.tickets.filter(
          t => t.status === 'Aberto'
        ).length,
        inProgress: MockData.tickets.filter(
          t => t.status === 'Em atendimento'
        ).length,
        waitingUser: MockData.tickets.filter(
          t => t.status === 'Aguardando usuário'
        ).length,
        resolved: MockData.tickets.filter(
          t => t.status === 'Resolvido'
        ).length,
        closed: MockData.tickets.filter(
          t => t.status === 'Fechado'
        ).length
      },

      releases: {
        total: MockData.releases.length,
        last24h: MockData.releases.filter(
          r =>
            Date.now() -
            new Date(r.createdAt).getTime() <
            24 * 3600 * 1000
        ).length,
        active: MockData.releases.filter(
          r => r.status === 'Ativa'
        ).length,
        revoked: MockData.releases.filter(
          r => r.status === 'Revogada'
        ).length
      },

      incidents: {
        total: MockData.incidents.length,
        open: MockData.incidents.filter(
          i =>
            i.status === 'Aberto' ||
            i.status === 'Investigando'
        ).length
      },

      hwid: {
        active: users.filter(u => u.hwid).length
      },

      admins: [],

      recentActivity: [],
      recentTickets: [],
      recentReleases: [],
      recentIncidents: [],

      releaseVolumeAlert:
        MockData.releaseVolumeAlert,

      systemActivity:
        MockData.systemActivity
    };
  }
};

window.CONFIG = CONFIG;
window.Api = Api;
