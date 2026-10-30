/* ============================================================
   RD4X DASHBOARD V10
   API CENTRAL — DASHBOARD COMPLETO
   ============================================================ */

'use strict';


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

const CONFIG = {

  MOCK_MODE: false,

  API_BASE_URL:
    'https://rd4x-dashboard.ronaldoo-sev7n.workers.dev',

  REFRESH_INTERVAL:
    30000,

  REQUEST_TIMEOUT:
    8000,

  ENVIRONMENT:
    'production',

  DASHBOARD_VERSION:
    '10.0.0',

  API_VERSION:
    '10.x'

};


/* ============================================================
   API
   ============================================================ */

const Api = {


  /* ==========================================================
     CONFIG
     ========================================================== */

  isMock() {
    return CONFIG.MOCK_MODE === true;
  },


  getConfig() {

    return {

      mockMode:
        CONFIG.MOCK_MODE,

      apiBaseUrl:
        CONFIG.API_BASE_URL,

      refreshInterval:
        CONFIG.REFRESH_INTERVAL,

      requestTimeout:
        CONFIG.REQUEST_TIMEOUT,

      environment:
        CONFIG.ENVIRONMENT,

      dashboardVersion:
        CONFIG.DASHBOARD_VERSION,

      apiVersion:
        CONFIG.API_VERSION,

      connected:
        !CONFIG.MOCK_MODE

    };

  },


  /* ==========================================================
     UTILITÁRIOS INTERNOS
     ========================================================== */

  _delay(ms = 250) {

    return new Promise(
      resolve =>
        setTimeout(resolve, ms)
    );

  },


  _buildUrl(path) {

    return (
      CONFIG.API_BASE_URL
        .replace(/\/$/, '') +
      path
    );

  },


  _buildQuery(params = {}) {

    const query =
      new URLSearchParams();

    Object.entries(params || {})
      .forEach(([key, value]) => {

        if (
          value === undefined ||
          value === null ||
          value === ''
        ) {
          return;
        }

        query.set(
          key,
          String(value)
        );

      });

    const result =
      query.toString();

    return result
      ? `?${result}`
      : '';

  },


  async _request(
    method,
    path,
    body
  ) {

    if (CONFIG.MOCK_MODE) {

      throw new Error(
        'Requisição real bloqueada em MOCK_MODE'
      );

    }


    const url =
      this._buildUrl(path);


    const controller =
      new AbortController();


    const timeout =
      setTimeout(
        () => controller.abort(),
        CONFIG.REQUEST_TIMEOUT
      );


    const options = {

      method,

      headers: {

        'Content-Type':
          'application/json',

        'Accept':
          'application/json'

      },

      credentials:
        'include',

      signal:
        controller.signal

    };


    if (
      body !== undefined &&
      body !== null
    ) {

      options.body =
        JSON.stringify(body);

    }


    try {

      const response =
        await fetch(
          url,
          options
        );


      const text =
        await response.text();


      let data = null;


      try {

        data =
          text
            ? JSON.parse(text)
            : null;

      } catch {

        throw new Error(
          `Resposta inválida da API em ${path}`
        );

      }


      if (!response.ok) {

        throw new Error(
          data?.error ||
          data?.message ||
          `HTTP ${response.status}`
        );

      }


      return data;


    } catch (error) {

      if (
        error?.name ===
        'AbortError'
      ) {

        throw new Error(
          `Tempo limite excedido ao acessar ${path}`
        );

      }


      throw error;


    } finally {

      clearTimeout(timeout);

    }

  },


  async _get(
    path,
    params = {}
  ) {

    return this._request(
      'GET',
      path +
      this._buildQuery(params)
    );

  },


  async _post(
    path,
    body = {}
  ) {

    return this._request(
      'POST',
      path,
      body
    );

  },


  async _put(
    path,
    body = {}
  ) {

    return this._request(
      'PUT',
      path,
      body
    );

  },


  async _patch(
    path,
    body = {}
  ) {

    return this._request(
      'PATCH',
      path,
      body
    );

  },


  async _delete(
    path,
    body
  ) {

    return this._request(
      'DELETE',
      path,
      body
    );

  },


  /* ==========================================================
     OVERVIEW / DASHBOARD
     ========================================================== */

  async getOverview() {

    if (CONFIG.MOCK_MODE) {

      await this._delay();

      return this._computeMockOverview();

    }


    const overviewResponse =
      await this._get(
        '/api/rd4x/overview'
      );


    let adminsResponse = {

      success: true,

      data: []

    };


    try {

      adminsResponse =
        await this._get(
          '/api/rd4x/admins'
        );

    } catch (error) {

      console.warn(
        '[RD4X] Não foi possível carregar administradores:',
        error
      );

    }


    const data =
      overviewResponse?.data ||
      {};


    const admins =
      Array.isArray(
        adminsResponse?.data
      )
        ? adminsResponse.data
        : [];


    return {

      users: {

        total:
          Number(data.ativos) || 0,

        active:
          Number(data.ativos) || 0,

        blacklisted:
          0,

        suspended:
          0,

        expired:
          0

      },


      tickets: {

        total:
          Number(
            data.ticketsAbertos
          ) || 0,

        open:
          Number(
            data.ticketsAbertos
          ) || 0,

        inProgress:
          0,

        waitingUser:
          0,

        resolved:
          0,

        closed:
          0

      },


      releases: {

        total:
          Number(
            data.execucoes
          ) || 0,

        last24h:
          0,

        active:
          Number(
            data.execucoes
          ) || 0,

        revoked:
          0

      },


      incidents: {

        total:
          Number(
            data.incidentesAbertos
          ) || 0,

        open:
          Number(
            data.incidentesAbertos
          ) || 0

      },


      hwid: {

        active:
          0

      },


      admins:
        admins.map(
          admin => ({

            id:
              admin.id,

            discordId:
              admin.discordId ||
              admin.id,

            name:
              admin.name ||
              'Administrador',

            tag:
              admin.tag ||
              admin.name ||
              'Administrador',

            avatar:
              admin.avatar ||
              '',

            role:
              admin.role ||
              'Administrador',

            status:
              admin.status ||
              'offline',

            isOwner:
              Boolean(
                admin.isOwner
              )

          })
        ),


      recentActivity: [],

      recentTickets: [],

      recentReleases: [],

      recentIncidents: [],

      systemActivity: [],


      vendas:
        Number(
          data.vendas
        ) || 0,


      faturamento:
        Number(
          data.faturamento
        ) || 0

    };

  },


  /* ==========================================================
     👥 USUÁRIOS
     ========================================================== */

  async getUsers(
    params = {}
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(180);

      return {

        success: true,

        data:
          Array.isArray(
            window.MockData?.users
          )
            ? MockData.users.slice()
            : []

      };

    }


    return this._get(
      '/api/dashboard/users',
      params
    );

  },


  async getUser(
    id
  ) {

    return this._get(
      `/api/dashboard/users/${encodeURIComponent(id)}`
    );

  },


  async getUserByNick(
    nick
  ) {

    return this._get(
      '/api/dashboard/users',
      { nick }
    );

  },


  /* ==========================================================
     🎫 TICKETS
     ========================================================== */

  async getTickets(
    params = {}
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(180);

      return {

        success: true,

        data:
          Array.isArray(
            window.MockData?.tickets
          )
            ? MockData.tickets.slice()
            : []

      };

    }


    return this._get(
      '/api/dashboard/tickets',
      params
    );

  },


  async getTicket(
    id
  ) {

    return this._get(
      `/api/dashboard/tickets/${encodeURIComponent(id)}`
    );

  },


  async getTicketTranscript(
    id
  ) {

    return this._get(
      `/api/dashboard/tickets/${encodeURIComponent(id)}/transcript`
    );

  },


  async closeTicket(
    id,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/tickets/${encodeURIComponent(id)}/close`,
      payload
    );

  },


  async reopenTicket(
    id,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/tickets/${encodeURIComponent(id)}/reopen`,
      payload
    );

  },


  /* ==========================================================
     📋 AUDITORIA
     ========================================================== */

  async getAudit(
    params = {}
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(180);

      return {

        success: true,

        data:
          Array.isArray(
            window.MockData?.audit
          )
            ? MockData.audit.slice()
            : []

      };

    }


    return this._get(
      '/api/dashboard/audit',
      params
    );

  },


  async getAuditEvent(
    id
  ) {

    return this._get(
      `/api/dashboard/audit/${encodeURIComponent(id)}`
    );

  },


  /* ==========================================================
     👑 ADMINISTRADORES
     ========================================================== */

  async getAdmins() {

    if (CONFIG.MOCK_MODE) {

      await this._delay(150);

      return {

        success: true,

        data: []

      };

    }


    return this._get(
      '/api/rd4x/admins'
    );

  },


  async getAdmin(
    id
  ) {

    return this._get(
      `/api/dashboard/admins/${encodeURIComponent(id)}`
    );

  },


  /* ==========================================================
     🚀 RELEASES
     ========================================================== */

  async getReleases(
    params = {}
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(160);

      return {

        success: true,

        data:
          Array.isArray(
            window.MockData?.releases
          )
            ? MockData.releases.slice()
            : []

      };

    }


    return this._get(
      '/api/dashboard/releases',
      params
    );

  },


  async getRelease(
    id
  ) {

    return this._get(
      `/api/dashboard/releases/${encodeURIComponent(id)}`
    );

  },


  async postRelease(
    payload
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(400);

      return {

        success: true,

        ok: true,

        simulated: true,

        message:
          'Release simulada com sucesso.',

        payload

      };

    }


    return this._post(
      '/api/dashboard/release',
      payload
    );

  },


  async postRevoke(
    payload
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(400);

      return {

        success: true,

        ok: true,

        simulated: true,

        message:
          'Release revogada (simulação).',

        payload

      };

    }


    return this._post(
      '/api/dashboard/revoke',
      payload
    );

  },


  async revokeRelease(
    id,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/releases/${encodeURIComponent(id)}/revoke`,
      payload
    );

  },


  /* ==========================================================
     🚨 INCIDENTES
     ========================================================== */

  async getIncidents(
    params = {}
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(160);

      return {

        success: true,

        data:
          Array.isArray(
            window.MockData?.incidents
          )
            ? MockData.incidents.slice()
            : []

      };

    }


    return this._get(
      '/api/dashboard/incidents',
      params
    );

  },


  async getIncident(
    id
  ) {

    return this._get(
      `/api/dashboard/incidents/${encodeURIComponent(id)}`
    );

  },


  async createIncident(
    payload
  ) {

    return this._post(
      '/api/dashboard/incidents',
      payload
    );

  },


  async updateIncident(
    id,
    payload
  ) {

    return this._patch(
      `/api/dashboard/incidents/${encodeURIComponent(id)}`,
      payload
    );

  },


  async closeIncident(
    id,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/incidents/${encodeURIComponent(id)}/close`,
      payload
    );

  },


  /* ==========================================================
     💻 HWID
     ========================================================== */

  async getHwid(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/hwid',
      params
    );

  },


  async getUserHwid(
    userId
  ) {

    return this._get(
      `/api/dashboard/users/${encodeURIComponent(userId)}/hwid`
    );

  },


  async postResetHwid(
    payload
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(400);

      return {

        success: true,

        ok: true,

        simulated: true,

        message:
          'HWID resetado (simulação).',

        payload

      };

    }


    return this._post(
      '/api/dashboard/reset-hwid',
      payload
    );

  },


  async resetUserHwid(
    userId,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/users/${encodeURIComponent(userId)}/reset-hwid`,
      payload
    );

  },


  /* ==========================================================
     ⛔ BLACKLIST
     ========================================================== */

  async getBlacklist(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/blacklist',
      params
    );

  },


  async postBlacklist(
    payload
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(400);

      return {

        success: true,

        ok: true,

        simulated: true,

        message:
          'Usuário blacklistado (simulação).',

        payload

      };

    }


    return this._post(
      '/api/dashboard/blacklist',
      payload
    );

  },


  async blacklistUser(
    userId,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/users/${encodeURIComponent(userId)}/blacklist`,
      payload
    );

  },


  async postUnblacklist(
    payload
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(400);

      return {

        success: true,

        ok: true,

        simulated: true,

        message:
          'Usuário removido da blacklist.',

        payload

      };

    }


    return this._post(
      '/api/dashboard/unblacklist',
      payload
    );

  },


  async unblacklistUser(
    userId,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/users/${encodeURIComponent(userId)}/unblacklist`,
      payload
    );

  },


  /* ==========================================================
     🔎 BUSCA GLOBAL
     ========================================================== */

  async search(
    query,
    params = {}
  ) {

    return this._get(
      '/api/dashboard/search',
      {
        q: query,
        ...params
      }
    );

  },


  async searchUsers(
    query,
    params = {}
  ) {

    return this._get(
      '/api/dashboard/search/users',
      {
        q: query,
        ...params
      }
    );

  },


  async searchTickets(
    query,
    params = {}
  ) {

    return this._get(
      '/api/dashboard/search/tickets',
      {
        q: query,
        ...params
      }
    );

  },


  async searchAudit(
    query,
    params = {}
  ) {

    return this._get(
      '/api/dashboard/search/audit',
      {
        q: query,
        ...params
      }
    );

  },


  /* ==========================================================
     📊 ESTATÍSTICAS
     ========================================================== */

  async getStats(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/stats',
      params
    );

  },


  async getStatsOverview(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/stats/overview',
      params
    );

  },


  async getStatsUsers(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/stats/users',
      params
    );

  },


  async getStatsTickets(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/stats/tickets',
      params
    );

  },


  async getStatsReleases(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/stats/releases',
      params
    );

  },


  async getStatsIncidents(
    params = {}
  ) {

    return this._get(
      '/api/dashboard/stats/incidents',
      params
    );

  },


  /* ==========================================================
     📜 TRANSCRIÇÕES
     ========================================================== */

  async getTranscripts(
    params = {}
  ) {

    if (CONFIG.MOCK_MODE) {

      await this._delay(160);

      return {

        success: true,

        data:
          Array.isArray(
            window.MockData?.transcripts
          )
            ? MockData.transcripts.slice()
            : []

      };

    }


    return this._get(
      '/api/dashboard/transcripts',
      params
    );

  },


  async getTranscript(
    id
  ) {

    return this._get(
      `/api/dashboard/transcripts/${encodeURIComponent(id)}`
    );

  },


  /* ==========================================================
     ⚙️ AÇÕES ADMINISTRATIVAS
     ========================================================== */

  async executeAction(
    action,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/actions/${encodeURIComponent(action)}`,
      payload
    );

  },


  async suspendUser(
    userId,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/users/${encodeURIComponent(userId)}/suspend`,
      payload
    );

  },


  async unsuspendUser(
    userId,
    payload = {}
  ) {

    return this._post(
      `/api/dashboard/users/${encodeURIComponent(userId)}/unsuspend`,
      payload
    );

  },


  async deleteUser(
    userId,
    payload = {}
  ) {

    return this._delete(
      `/api/dashboard/users/${encodeURIComponent(userId)}`,
      payload
    );

  },


  /* ==========================================================
     🔐 AUTENTICAÇÃO
     ========================================================== */

  async login(
    payload
  ) {

    return this._post(
      '/api/auth/login',
      payload
    );

  },


  async logout() {

    return this._post(
      '/api/auth/logout',
      {}
    );

  },


  async getCurrentUser() {

    return this._get(
      '/api/auth/me'
    );

  },


  async checkAuth() {

    return this._get(
      '/api/auth/check'
    );

  },


  async refreshAuth() {

    return this._post(
      '/api/auth/refresh',
      {}
    );

  },


  /* ==========================================================
     🩺 SISTEMA / HEALTH
     ========================================================== */

  async getHealth() {

    return this._get(
      '/api/dashboard/health'
    );

  },


  async getSystemStatus() {

    return this._get(
      '/api/dashboard/system'
    );

  },


  /* ==========================================================
     📦 MOCK OVERVIEW
     Mantido apenas para compatibilidade.
     ========================================================== */

  _computeMockOverview() {

    const users =
      Array.isArray(
        window.MockData?.users
      )
        ? MockData.users
        : [];


    const tickets =
      Array.isArray(
        window.MockData?.tickets
      )
        ? MockData.tickets
        : [];


    const releases =
      Array.isArray(
        window.MockData?.releases
      )
        ? MockData.releases
        : [];


    const incidents =
      Array.isArray(
        window.MockData?.incidents
      )
        ? MockData.incidents
        : [];


    return {

      users: {

        total:
          users.length,

        active:
          users.filter(
            u =>
              u.status === 'Ativo'
          ).length,

        blacklisted:
          users.filter(
            u =>
              u.blacklisted
          ).length,

        suspended:
          users.filter(
            u =>
              u.status === 'Suspenso'
          ).length,

        expired:
          users.filter(
            u =>
              u.status === 'Expirado'
          ).length

      },


      tickets: {

        total:
          tickets.length,

        open:
          tickets.filter(
            t =>
              t.status === 'Aberto'
          ).length,

        inProgress:
          tickets.filter(
            t =>
              t.status ===
              'Em atendimento'
          ).length,

        waitingUser:
          tickets.filter(
            t =>
              t.status ===
              'Aguardando usuário'
          ).length,

        resolved:
          tickets.filter(
            t =>
              t.status === 'Resolvido'
          ).length,

        closed:
          tickets.filter(
            t =>
              t.status === 'Fechado'
          ).length

      },


      releases: {

        total:
          releases.length,

        last24h:
          releases.filter(
            r =>
              Date.now() -
              new Date(
                r.createdAt
              ).getTime() <
              24 * 3600 * 1000
          ).length,

        active:
          releases.filter(
            r =>
              r.status === 'Ativa'
          ).length,

        revoked:
          releases.filter(
            r =>
              r.status === 'Revogada'
          ).length

      },


      incidents: {

        total:
          incidents.length,

        open:
          incidents.filter(
            i =>
              i.status === 'Aberto' ||
              i.status === 'Investigando'
          ).length

      },


      hwid: {

        active:
          users.filter(
            u =>
              u.hwid
          ).length

      },


      admins: [],

      recentActivity: [],

      recentTickets: [],

      recentReleases: [],

      recentIncidents: [],

      releaseVolumeAlert:
        window.MockData?.releaseVolumeAlert,

      systemActivity:
        window.MockData?.systemActivity ||
        []

    };

  }

};


/* ============================================================
   EXPOSIÇÃO GLOBAL
   ============================================================ */

window.CONFIG =
  CONFIG;

window.Api =
  Api;
