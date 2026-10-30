export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Permite apenas GET por enquanto
    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Só libera o endpoint de Overview nesta primeira etapa
    if (url.pathname !== "/api/rd4x/overview") {
      return new Response(
        JSON.stringify({ error: "Endpoint não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const apiUrl =
      `${env.RD4X_API_URL}/api/dashboard/overview`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.DASHBOARD_API_KEY}`,
          "Accept": "application/json"
        }
      });

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
