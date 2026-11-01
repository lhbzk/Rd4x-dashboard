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
     URL
     ========================================================== */

  _buildUrl(path) {
    return (
      CONFIG.API_BASE_URL.replace(/\/+$/, '') +
      '/' +
      String(path || '').replace(/^\/+/, '')
    );
  },


  /* ==========================================================
     REQUEST CENTRAL
     ========================================================== */

  async _request(method, path, body) {

    const url = this._buildUrl(path);

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
        'Accept':
          'application/json, text/plain, */*'
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

      options.headers['Content-Type'] =
        'application/json';

      options.body =
        JSON.stringify(body);
    }


    try {

      console.log(
        '[RD4X API] REQUEST:',
        method,
        path,
        body || null
      );


      const response =
        await fetch(
          url,
          options
        );


      const text =
        await response.text();


      const cleanText =
        String(text || '')
          .replace(/^\uFEFF/, '')
          .trim();


      let data = null;


      if (cleanText) {

        try {

          data =
            JSON.parse(cleanText);

        } catch (parseError) {

          console.error(
            `[RD4X API] Resposta não-JSON em ${path}:`,
            cleanText
          );

          const error =
            new Error(
              `A API retornou uma resposta inválida em ${path}.`
            );

          error.status =
            response.status;

          error.raw =
            cleanText;

          throw error;
        }
      }


      console.log(
        '[RD4X API] RESPONSE:',
        response.status,
        path,
        data
      );


      if (!response.ok) {

        const error =
          new Error(
            data?.error ||
            data?.message ||
            data?.reason ||
            data?.motivo ||
            `HTTP ${response.status}`
          );


        error.status =
          response.status;

        error.data =
          data;

        throw error;
      }


      return data;

    } catch (error) {

      if (
        error?.name ===
        'AbortError'
      ) {

        const timeoutError =
          new Error(
            `Tempo limite excedido ao acessar ${path}`
          );

        timeoutError.status =
          408;

        timeoutError.code =
          'REQUEST_TIMEOUT';

        throw timeoutError;
      }


      throw error;

    } finally {

      clearTimeout(timeout);
    }
  },


  /* ==========================================================
     GET
     ========================================================== */

  async _get(path) {

    return this._request(
      'GET',
      path
    );
  },


  /* ==========================================================
     POST
     ========================================================== */

  async _post(path, body) {

    return this._request(
      'POST',
      path,
      body
    );
  },


  /* ==========================================================
     AUTH — DISCORD
     ========================================================== */

  async login() {

    window.location.href =
      this._buildUrl(
        '/api/auth/discord/login'
      );
  },


  async logout() {

    return this._post(
      '/api/auth/discord/logout',
      {}
    );
  },


  async getCurrentUser() {

    return this._get(
      '/api/auth/discord/me'
    );
  },


  async checkAuth() {

    return this._get(
      '/api/auth/discord/me'
    );
  },


  async refreshAuth() {

    return this._get(
      '/api/auth/discord/me'
    );
  },


  /* ==========================================================
     RD4X KEY — VALIDAÇÃO
     ========================================================== */

  async validateKey(
    key,
    hwid = null
  ) {

    const cleanKey =
      String(key || '').trim();


    if (!cleanKey) {

      return {
        success: false,
        valid: false,
        reason: 'key_ausente',
        diagnostic: {
          client: true,
          stage: 'api.validateKey',
          reason: 'key_ausente'
        }
      };
    }


    const payload = {
      key: cleanKey
    };


    if (
      hwid !== undefined &&
      hwid !== null &&
      String(hwid).trim()
    ) {

      payload.hwid =
        String(hwid).trim();
    }


    console.log(
      '[RD4X KEY] Enviando validação:',
      {
        keyPresent: true,
        hwidPresent:
          !!payload.hwid
      }
    );


    try {

      const response =
        await this._post(
          '/api/v2/keys/validate',
          payload
        );


      console.log(
        '[RD4X KEY] Resposta recebida:',
        response
      );


      /*
       * NÃO altera a resposta do Worker.
       * O app.js receberá exatamente
       * o motivo retornado pela API.
       */

      if (
        response &&
        typeof response === 'object'
      ) {

        return response;
      }


      return {
        success: false,
        valid: false,
        reason: 'resposta_vazia',
        diagnostic: {
          client: true,
          stage: 'api.validateKey',
          reason: 'resposta_vazia'
        }
      };

    } catch (error) {

      console.error(
        '[RD4X KEY] Erro HTTP:',
        error
      );


      /*
       * Se o Worker respondeu com JSON,
       * preservamos absolutamente tudo.
       */

      if (
        error &&
        error.data &&
        typeof error.data === 'object'
      ) {

        return {
          ...error.data,

          success:
            error.data.success === true
              ? true
              : false,

          valid:
            error.data.valid === true
              ? true
              : false,

          diagnostic:
            error.data.diagnostic ||
            {
              client: true,
              stage: 'api.validateKey.catch',
              httpStatus:
                error.status || null
            }
        };
      }


      /*
       * Se nem uma resposta JSON chegou,
       * devolvemos um diagnóstico explícito.
       */

      return {
        success: false,

        valid: false,

        reason:
          error?.code ||
          (
            error?.status
              ? `http_${error.status}`
              : 'request_failed'
          ),

        message:
          error?.message ||
          'Falha ao comunicar com o servidor.',

        diagnostic: {
          client: true,

          stage:
            'api.validateKey.network',

          httpStatus:
            error?.status || null,

          errorName:
            error?.name || null,

          errorMessage:
            error?.message || null
        }
      };
    }
  },


  /* ==========================================================
     API RD4X
     ========================================================== */

  async getOverview() {

    return this._get(
      '/api/rd4x/overview'
    );
  },


  async getUsers() {

    return this._get(
      '/api/rd4x/users'
    );
  },


  async getTickets() {

    return this._get(
      '/api/rd4x/tickets'
    );
  },


  async getReleases() {

    return this._get(
      '/api/rd4x/releases'
    );
  },


  async getIncidents() {

    return this._get(
      '/api/rd4x/incidents'
    );
  },


  async getAudit() {

    return this._get(
      '/api/rd4x/audit'
    );
  },


  async getStats() {

    return this._get(
      '/api/rd4x/stats'
    );
  },


  async getTranscripts() {

    return this._get(
      '/api/rd4x/transcripts'
    );
  },


  async getSettings() {

    return this._get(
      '/api/rd4x/settings'
    );
  },


  async search(query) {

    return this._get(
      `/api/rd4x/search?q=${encodeURIComponent(
        String(query || '')
      )}`
    );
  },


  /* ==========================================================
     GENERIC
     ========================================================== */

  async get(path) {

    return this._get(path);
  },


  async post(
    path,
    body
  ) {

    return this._post(
      path,
      body
    );
  },


  async put(
    path,
    body
  ) {

    return this._request(
      'PUT',
      path,
      body
    );
  },


  async patch(
    path,
    body
  ) {

    return this._request(
      'PATCH',
      path,
      body
    );
  },


  async delete(path) {

    return this._request(
      'DELETE',
      path
    );
  }
};


/* ============================================================
   GLOBAL
   ============================================================ */

window.Api =
  Api;

window.RD4X_CONFIG =
  CONFIG;


/* ============================================================
   DEBUG
   ============================================================ */

console.log(
  '[RD4X API] api.js carregado.',
  {
    version:
      CONFIG.DASHBOARD_VERSION,

    apiVersion:
      CONFIG.API_VERSION,

    baseUrl:
      CONFIG.API_BASE_URL,

    mockMode:
      CONFIG.MOCK_MODE
  }
);
