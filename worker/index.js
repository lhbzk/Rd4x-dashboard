export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * ROTAS DA API
     *
     * Aceitamos tanto:
     * /api/rd4x/...
     * quanto:
     * /api/dashboard/...
     *
     * Isso mantém compatibilidade com o frontend atual.
     */

    const routes = {
      // Rotas novas
      "/api/rd4x/overview": "/api/dashboard/overview",
      "/api/rd4x/admins": "/api/dashboard/admins",
      "/api/rd4x/users": "/api/dashboard/users",
      "/api/rd4x/tickets": "/api/dashboard/tickets",
      "/api/rd4x/audit": "/api/dashboard/audit",

      // Rotas usadas pelo frontend atual
      "/api/dashboard/overview": "/api/dashboard/overview",
      "/api/dashboard/admins": "/api/dashboard/admins",
      "/api/dashboard/users": "/api/dashboard/users",
      "/api/dashboard/tickets": "/api/dashboard/tickets",
      "/api/dashboard/audit": "/api/dashboard/audit"
    };

    const targetPath = routes[url.pathname];

    /*
     * Endpoint inexistente
     */
    if (!targetPath) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Endpoint não encontrado",
          path: url.pathname
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
     * Por enquanto o Worker trabalha com GET.
     */
    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Método não permitido"
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
     * URL da API do bot
     */
    if (!env.RD4X_API_URL) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "RD4X_API_URL não configurada"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    /*
     * Chave usada somente pelo Worker
     * para conversar com o bot.
     */
    if (!env.DASHBOARD_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "DASHBOARD_API_KEY não configurada"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    try {
      /*
       * Encaminha a requisição para o bot
       */
      const response = await fetch(
        `${env.RD4X_API_URL}${targetPath}`,
        {
          method: "GET",
          headers: {
            "Authorization":
              `Bearer ${env.DASHBOARD_API_KEY}`,

            "Accept":
              "application/json"
          }
        }
      );

      /*
       * Mantém exatamente a resposta
       * enviada pela API do bot.
       */
      const body = await response.text();

      return new Response(
        body,
        {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get(
                "Content-Type"
              ) ||
              "application/json"
          }
        }
      );

    } catch (error) {
      console.error(
        "[WORKER] Erro ao conectar com RD4X:",
        error
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Erro ao conectar com a API RD4X"
        }),
        {
          status: 502,
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );
    }
  }
};
