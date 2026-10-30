export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const routes = {
      "/api/rd4x/overview": "/api/dashboard/overview",
      "/api/rd4x/admins": "/api/dashboard/admins"
    };

    const targetPath = routes[url.pathname];

    if (!targetPath) {
      return new Response(
        JSON.stringify({
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
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Só permite GET
    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Rotas permitidas
    const routes = {
      "/api/rd4x/overview": "/api/dashboard/overview",
      "/api/rd4x/admins": "/api/dashboard/admins"
    };

    const targetPath = routes[url.pathname];

    if (!targetPath) {
      return new Response(
        JSON.stringify({ error: "Endpoint não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verifica as variáveis
    if (!env.RD4X_API_URL || !env.DASHBOARD_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Configuração do Worker incompleta"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    try {
      const response = await fetch(
        `${env.RD4X_API_URL}${targetPath}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${env.DASHBOARD_API_KEY}`,
            "Accept": "application/json"
          }
        }
      );

      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") ||
            "application/json"
        }
      });

    } catch (error) {
      console.error("[WORKER] Erro:", error);

      return new Response(
        JSON.stringify({
          error: "Erro ao conectar com a API RD4X"
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};
