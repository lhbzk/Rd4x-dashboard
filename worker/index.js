export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const routes = {
      // ========================================================
      // API RD4X
      // ========================================================

      "/api/rd4x/overview": "/api/dashboard/overview",
      "/api/rd4x/admins": "/api/dashboard/admins",
      "/api/rd4x/users": "/api/dashboard/users",
      "/api/rd4x/tickets": "/api/dashboard/tickets",
      "/api/rd4x/releases": "/api/dashboard/releases",
      "/api/rd4x/audit": "/api/dashboard/audit",
      "/api/rd4x/incidents": "/api/dashboard/incidents",
      "/api/rd4x/transcripts": "/api/dashboard/transcripts",

      // ========================================================
      // COMPATIBILIDADE COM O FRONTEND
      // ========================================================

      "/api/dashboard/overview": "/api/dashboard/overview",
      "/api/dashboard/admins": "/api/dashboard/admins",
      "/api/dashboard/users": "/api/dashboard/users",
      "/api/dashboard/tickets": "/api/dashboard/tickets",
      "/api/dashboard/releases": "/api/dashboard/releases",
      "/api/dashboard/audit": "/api/dashboard/audit",
      "/api/dashboard/incidents": "/api/dashboard/incidents",
      "/api/dashboard/transcripts": "/api/dashboard/transcripts"
    };

    const targetPath = routes[url.pathname];

    /*
     * ============================================================
     * API RD4X
     * ============================================================
     */

    if (targetPath) {
      if (request.method !== "GET") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Método não permitido"
          }),
          {
            status: 405,
            headers: {
              "Content-Type":
                "application/json; charset=utf-8",

              "Cache-Control":
                "no-store, no-cache, must-revalidate"
            }
          }
        );
      }

      if (!env.RD4X_API_URL) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "RD4X_API_URL não configurada"
          }),
          {
            status: 500,
            headers: {
              "Content-Type":
                "application/json; charset=utf-8"
            }
          }
        );
      }

      if (!env.DASHBOARD_API_KEY) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "DASHBOARD_API_KEY não configurada"
          }),
          {
            status: 500,
            headers: {
              "Content-Type":
                "application/json; charset=utf-8"
            }
          }
        );
      }

      try {
        const apiUrl =
          `${env.RD4X_API_URL}${targetPath}`;

        console.log(
          `[WORKER] API → ${apiUrl}`
        );

        const response =
          await fetch(
            apiUrl,
            {
              method: "GET",

              headers: {
                "Authorization":
                  `Bearer ${env.DASHBOARD_API_KEY}`,

                "Accept":
                  "application/json",

                "Cache-Control":
                  "no-cache"
              }
            }
          );

        const body =
          await response.text();

        return new Response(
          body,
          {
            status: response.status,

            headers: {
              "Content-Type":
                response.headers.get(
                  "Content-Type"
                ) ||
                "application/json; charset=utf-8",

              "Cache-Control":
                "no-store, no-cache, must-revalidate",

              "Pragma":
                "no-cache",

              "Expires":
                "0"
            }
          }
        );

      } catch (error) {
        console.error(
          "[WORKER] Erro API:",
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
                "application/json; charset=utf-8",

              "Cache-Control":
                "no-store"
            }
          }
        );
      }
    }

    /*
     * ============================================================
     * ASSETS DO DASHBOARD
     * ============================================================
     */

    if (env.ASSETS) {
      const response =
        await env.ASSETS.fetch(request);

      /*
       * Não altera o conteúdo dos arquivos.
       * Apenas garante que o HTML/JS/CSS não fique preso
       * em uma versão antiga no navegador.
       */

      const contentType =
        response.headers.get(
          "Content-Type"
        ) || "";

      if (
        contentType.includes("text/html") ||
        contentType.includes("javascript") ||
        contentType.includes("text/css")
      ) {
        const headers =
          new Headers(
            response.headers
          );

        headers.set(
          "Cache-Control",
          "no-store, no-cache, must-revalidate"
        );

        headers.set(
          "Pragma",
          "no-cache"
        );

        headers.set(
          "Expires",
          "0"
        );

        return new Response(
          response.body,
          {
            status:
              response.status,

            statusText:
              response.statusText,

            headers
          }
        );
      }

      return response;
    }

    return new Response(
      "RD4X Dashboard online, mas o binding ASSETS não foi encontrado.",
      {
        status: 500,

        headers: {
          "Content-Type":
            "text/plain; charset=utf-8"
        }
      }
    );
  }
};
