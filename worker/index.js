export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const routes = {
      // ======================================================
      // API RD4X — DASHBOARD
      // ======================================================

      "/api/rd4x/overview":
        "/api/dashboard/overview",

      "/api/rd4x/admins":
        "/api/dashboard/admins",

      "/api/rd4x/users":
        "/api/dashboard/users",

      "/api/rd4x/tickets":
        "/api/dashboard/tickets",

      "/api/rd4x/audit":
        "/api/dashboard/audit",

      "/api/rd4x/releases":
        "/api/dashboard/releases",

      "/api/rd4x/release":
        "/api/dashboard/release",

      // ======================================================
      // COMPATIBILIDADE COM FRONTEND ATUAL
      // ======================================================

      "/api/dashboard/overview":
        "/api/dashboard/overview",

      "/api/dashboard/admins":
        "/api/dashboard/admins",

      "/api/dashboard/users":
        "/api/dashboard/users",

      "/api/dashboard/tickets":
        "/api/dashboard/tickets",

      "/api/dashboard/audit":
        "/api/dashboard/audit",

      "/api/dashboard/releases":
        "/api/dashboard/releases",

      "/api/dashboard/release":
        "/api/dashboard/release"
    };

    const targetPath =
      routes[url.pathname];

    if (targetPath) {

      // ------------------------------------------------------
      // MÉTODOS PERMITIDOS
      // ------------------------------------------------------

      const allowedMethods =
        targetPath ===
        "/api/dashboard/release"
          ? ["GET", "POST"]
          : ["GET"];

      if (
        !allowedMethods.includes(
          request.method
        )
      ) {
        return new Response(
          JSON.stringify({
            success:false,
            error:
              "Método não permitido"
          }),
          {
            status:405,

            headers:{
              "Content-Type":
                "application/json"
            }
          }
        );
      }

      // ------------------------------------------------------
      // CONFIGURAÇÃO API
      // ------------------------------------------------------

      if (
        !env.RD4X_API_URL
      ) {
        return new Response(
          JSON.stringify({
            success:false,
            error:
              "RD4X_API_URL não configurada"
          }),
          {
            status:500,

            headers:{
              "Content-Type":
                "application/json"
            }
          }
        );
      }

      if (
        !env.DASHBOARD_API_KEY
      ) {
        return new Response(
          JSON.stringify({
            success:false,
            error:
              "DASHBOARD_API_KEY não configurada"
          }),
          {
            status:500,

            headers:{
              "Content-Type":
                "application/json"
            }
          }
        );
      }

      // ------------------------------------------------------
      // FORWARD
      // ------------------------------------------------------

      try {
        const apiUrl =
          `${env.RD4X_API_URL}${targetPath}${url.search}`;

        console.log(
          `[WORKER] ${request.method} → ${apiUrl}`
        );

        const headers =
          new Headers();

        headers.set(
          "Authorization",
          `Bearer ${env.DASHBOARD_API_KEY}`
        );

        headers.set(
          "Accept",
          "application/json"
        );

        // ----------------------------------------------------
        // BODY PARA POST
        // ----------------------------------------------------

        let body = undefined;

        if (
          request.method !==
          "GET"
        ) {
          body =
            await request.text();

          headers.set(
            "Content-Type",
            request.headers.get(
              "Content-Type"
            ) ||
            "application/json"
          );
        }

        // ----------------------------------------------------
        // FETCH API RD4X
        // ----------------------------------------------------

        const response =
          await fetch(
            apiUrl,
            {
              method:
                request.method,

              headers,

              body
            }
          );

        const responseBody =
          await response.text();

        return new Response(
          responseBody,
          {
            status:
              response.status,

            headers:{
              "Content-Type":
                response.headers.get(
                  "Content-Type"
                ) ||
                "application/json",

              "Cache-Control":
                "no-store"
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
            success:false,
            error:
              "Erro ao conectar com a API RD4X"
          }),
          {
            status:502,

            headers:{
              "Content-Type":
                "application/json"
            }
          }
        );
      }
    }

    // ========================================================
    // ASSETS DO DASHBOARD
    // ========================================================

    if (env.ASSETS) {
      return env.ASSETS.fetch(
        request
      );
    }

    return new Response(
      "RD4X Dashboard online, mas o binding ASSETS não foi encontrado.",
      {
        status:500,

        headers:{
          "Content-Type":
            "text/plain; charset=utf-8"
        }
      }
    );
  }
};
