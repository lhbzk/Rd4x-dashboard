export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const DASHBOARD_URL =
      "https://rd4x-dashboard.ronaldoo-sev7n.workers.dev";

    const API_URL =
      String(env.RD4X_API_URL || "").replace(/\/+$/, "");

    const API_KEY =
      String(env.DASHBOARD_API_KEY || "").trim();

    const SESSION_MAX_AGE =
      8 * 60 * 60;

    // =========================================================
    // RESPOSTAS
    // =========================================================

    function json(data, status = 200, extraHeaders = {}) {
      return new Response(
        JSON.stringify(data),
        {
          status,
          headers: {
            "Content-Type":
              "application/json; charset=utf-8",

            "Cache-Control":
              "no-store, no-cache, must-revalidate",

            "Pragma":
              "no-cache",

            "Expires":
              "0",

            ...extraHeaders
          }
        }
      );
    }

    function redirect(location, headers = {}) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: location,
          ...headers
        }
      });
    }

    // =========================================================
    // CRIPTOGRAFIA DA SESSÃO
    // =========================================================

    function base64urlEncode(bytes) {
      let binary = "";

      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }

      return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    }

    function base64urlDecode(value) {
      const normalized =
        value
          .replace(/-/g, "+")
          .replace(/_/g, "/") +
        "=".repeat(
          (4 - (value.length % 4)) % 4
        );

      const binary =
        atob(normalized);

      const bytes =
        new Uint8Array(
          binary.length
        );

      for (
        let i = 0;
        i < binary.length;
        i++
      ) {
        bytes[i] =
          binary.charCodeAt(i);
      }

      return bytes;
    }

    async function hmac(message) {
      const key =
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(
            API_KEY
          ),
          {
            name: "HMAC",
            hash: "SHA-256"
          },
          false,
          ["sign"]
        );

      const signature =
        await crypto.subtle.sign(
          "HMAC",
          key,
          new TextEncoder().encode(
            message
          )
        );

      return base64urlEncode(
        new Uint8Array(
          signature
        )
      );
    }

    async function createSession(user) {
      const payload = {
        sub:
          String(user.id),

        username:
          user.username ||
          "",

        globalName:
          user.globalName ||
          null,

        avatar:
          user.avatar ||
          null,

        role:
          user.role ||
          "Administrador",

        isOwner:
          Boolean(
            user.isOwner
          ),

        iat:
          Date.now(),

        exp:
          Date.now() +
          SESSION_MAX_AGE * 1000
      };

      const encoded =
        base64urlEncode(
          new TextEncoder().encode(
            JSON.stringify(
              payload
            )
          )
        );

      const signature =
        await hmac(
          encoded
        );

      return `${encoded}.${signature}`;
    }

    async function verifySession(token) {
      if (!token) {
        return null;
      }

      const parts =
        token.split(".");

      if (
        parts.length !== 2
      ) {
        return null;
      }

      const [
        encoded,
        receivedSignature
      ] = parts;

      const expectedSignature =
        await hmac(
          encoded
        );

      if (
        receivedSignature !==
        expectedSignature
      ) {
        return null;
      }

      try {
        const payload =
          JSON.parse(
            new TextDecoder().decode(
              base64urlDecode(
                encoded
              )
            )
          );

        if (
          !payload?.sub ||
          !payload?.exp ||
          Date.now() >
            payload.exp
        ) {
          return null;
        }

        return payload;

      } catch {
        return null;
      }
    }

    function getCookie(request, name) {
      const cookieHeader =
        request.headers.get(
          "Cookie"
        ) || "";

      const match =
        cookieHeader.match(
          new RegExp(
            `(?:^|;\\s*)${name}=([^;]+)`
          )
        );

      return match
        ? decodeURIComponent(
            match[1]
          )
        : null;
    }

    async function getSession(request) {
      const token =
        getCookie(
          request,
          "rd4x_session"
        );

      return verifySession(
        token
      );
    }

    // =========================================================
    // OAUTH STATE
    // =========================================================

    async function createOAuthState() {
      const payload = {
        iat:
          Date.now(),

        nonce:
          base64urlEncode(
            crypto.getRandomValues(
              new Uint8Array(24)
            )
          )
      };

      const encoded =
        base64urlEncode(
          new TextEncoder().encode(
            JSON.stringify(
              payload
            )
          )
        );

      const signature =
        await hmac(
          encoded
        );

      return `${encoded}.${signature}`;
    }

    async function verifyOAuthState(state) {
      if (!state) {
        return false;
      }

      const parts =
        state.split(".");

      if (
        parts.length !== 2
      ) {
        return false;
      }

      const [
        encoded,
        receivedSignature
      ] = parts;

      const expected =
        await hmac(
          encoded
        );

      if (
        receivedSignature !==
        expected
      ) {
        return false;
      }

      try {
        const data =
          JSON.parse(
            new TextDecoder().decode(
              base64urlDecode(
                encoded
              )
            )
          );

        return (
          data?.iat &&
          Date.now() -
            data.iat <
            10 * 60 * 1000
        );

      } catch {
        return false;
      }
    }

    // =========================================================
    // ROTAS DE AUTENTICAÇÃO
    // =========================================================

    if (
      url.pathname ===
        "/api/auth/discord/login" &&
      request.method === "GET"
    ) {
      if (
        !API_KEY ||
        !API_URL
      ) {
        return json(
          {
            success: false,
            error:
              "Configuração do Worker incompleta."
          },
          500
        );
      }

      const clientId =
        String(
          env.DISCORD_CLIENT_ID ||
            ""
        ).trim();

      const redirectUri =
        String(
          env.DISCORD_OAUTH_REDIRECT_URI ||
            `${DASHBOARD_URL}/api/auth/discord/callback`
        ).trim();

      if (!clientId) {
        return json(
          {
            success: false,
            error:
              "DISCORD_CLIENT_ID não configurado no Worker."
          },
          500
        );
      }

      const state =
        await createOAuthState();

      const params =
        new URLSearchParams({
          client_id:
            clientId,

          response_type:
            "code",

          redirect_uri:
            redirectUri,

          scope:
            "identify",

          state
        });

      return redirect(
        `https://discord.com/oauth2/authorize?${params.toString()}`
      );
    }

    if (
      url.pathname ===
        "/api/auth/discord/callback" &&
      request.method === "GET"
    ) {
      const code =
        url.searchParams.get(
          "code"
        );

      const state =
        url.searchParams.get(
          "state"
        );

      const oauthError =
        url.searchParams.get(
          "error"
        );

      if (oauthError) {
        return redirect(
          `${DASHBOARD_URL}/#/login?error=discord_cancelado`
        );
      }

      if (
        !code ||
        !state
      ) {
        return redirect(
          `${DASHBOARD_URL}/#/login?error=oauth_invalido`
        );
      }

      const validState =
        await verifyOAuthState(
          state
        );

      if (!validState) {
        return redirect(
          `${DASHBOARD_URL}/#/login?error=oauth_expirado`
        );
      }

      if (
        !API_KEY ||
        !API_URL
      ) {
        return redirect(
          `${DASHBOARD_URL}/#/login?error=worker_config`
        );
      }

      try {
        const redirectUri =
          String(
            env.DISCORD_OAUTH_REDIRECT_URI ||
              `${DASHBOARD_URL}/api/auth/discord/callback`
          ).trim();

        const response =
          await fetch(
            `${API_URL}/api/auth/discord/exchange`,
            {
              method:
                "POST",

              headers: {
                "Authorization":
                  `Bearer ${API_KEY}`,

                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json",

                "Cache-Control":
                  "no-cache"
              },

              body:
                JSON.stringify({
                  code,
                  redirectUri
                })
            }
          );

        const text =
          await response.text();

        let data;

        try {
          data =
            JSON.parse(
              text
            );
        } catch {
          data = null;
        }

        if (
          !response.ok ||
          !data?.success ||
          !data?.data?.id
        ) {
          console.error(
            "[WORKER OAUTH] Bot recusou OAuth:",
            response.status,
            data
          );

          return redirect(
            `${DASHBOARD_URL}/#/login?error=${encodeURIComponent(
              data?.error ||
              "oauth_negado"
            )}`
          );
        }

        const session =
          await createSession(
            data.data
          );

        const cookie =
          [
            `rd4x_session=${encodeURIComponent(session)}`,
            "HttpOnly",
            "Secure",
            "SameSite=Lax",
            "Path=/",
            `Max-Age=${SESSION_MAX_AGE}`
          ].join("; ");

        return redirect(
          `${DASHBOARD_URL}/#/dashboard`,
          {
            "Set-Cookie":
              cookie
          }
        );

      } catch (error) {
        console.error(
          "[WORKER OAUTH CALLBACK]",
          error
        );

        return redirect(
          `${DASHBOARD_URL}/#/login?error=oauth_erro`
        );
      }
    }

    if (
      url.pathname ===
        "/api/auth/discord/me" &&
      request.method === "GET"
    ) {
      const session =
        await getSession(
          request
        );

      if (!session) {
        return json(
          {
            success: false,
            error:
              "Sessão não autenticada"
          },
          401
        );
      }

      return json({
        success: true,

        data: {
          id:
            session.sub,

          discordId:
            session.sub,

          username:
            session.username,

          globalName:
            session.globalName,

          avatar:
            session.avatar,

          role:
            session.role,

          isOwner:
            session.isOwner,

          isAdmin:
            true
        }
      });
    }

    if (
      url.pathname ===
        "/api/auth/discord/logout" &&
      request.method === "POST"
    ) {
      return json(
        {
          success: true
        },
        200,
        {
          "Set-Cookie":
            [
              "rd4x_session=",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
              "Path=/",
              "Max-Age=0"
            ].join("; ")
        }
      );
    }

    // =========================================================
    // VALIDAÇÃO DE KEY RD4X
    // =========================================================

    if (
      url.pathname ===
        "/api/v2/keys/validate" &&
      request.method === "POST"
    ) {
      const session =
        await getSession(
          request
        );

      if (!session) {
        return json(
          {
            success: false,
            valid: false,
            reason:
              "sessao_nao_autenticada"
          },
          401
        );
      }

      if (
        !API_URL ||
        !API_KEY
      ) {
        return json(
          {
            success: false,
            valid: false,
            reason:
              "api_nao_configurada"
          },
          500
        );
      }

      try {
        const body =
          await request.json();

        const key =
          String(
            body?.key || ""
          ).trim();

        const hwid =
          body?.hwid
            ? String(
                body.hwid
              ).trim()
            : null;

        if (!key) {
          return json({
            success: true,
            valid: false,
            reason:
              "key_ausente"
          });
        }

        const response =
          await fetch(
            `${API_URL}/api/v2/keys/validate`,
            {
              method:
                "POST",

              headers: {
                "Authorization":
                  `Bearer ${API_KEY}`,

                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json",

                "Cache-Control":
                  "no-cache"
              },

              body:
                JSON.stringify({
                  key,

                  discordId:
                    String(
                      session.sub
                    ),

                  hwid
                })
            }
          );

        const text =
          await response.text();

        let data;

        try {
          data =
            JSON.parse(
              text
            );
        } catch {
          data = null;
        }

        if (!data) {
          return json(
            {
              success: false,
              valid: false,
              reason:
                "resposta_api_invalida"
            },
            502
          );
        }

        return json(
          data,
          response.status
        );

      } catch (error) {
        console.error(
          "[WORKER KEY VALIDATE]",
          error
        );

        return json(
          {
            success: false,
            valid: false,
            reason:
              "erro_api"
          },
          502
        );
      }
    }

    // =========================================================
    // ROTAS DA API RD4X
    // =========================================================

    const routes = {
      "/api/rd4x/overview":
        "/api/dashboard/overview",

      "/api/rd4x/admins":
        "/api/dashboard/admins",

      "/api/rd4x/users":
        "/api/dashboard/users",

      "/api/rd4x/tickets":
        "/api/dashboard/tickets",

      "/api/rd4x/releases":
        "/api/dashboard/releases",

      "/api/rd4x/audit":
        "/api/dashboard/audit",

      "/api/rd4x/incidents":
        "/api/dashboard/incidents",

      "/api/rd4x/transcripts":
        "/api/dashboard/transcripts",

      "/api/rd4x/release":
        "/api/dashboard/release",

      "/api/rd4x/reset-hwid":
        "/api/dashboard/reset-hwid",

      "/api/rd4x/revoke":
        "/api/dashboard/revoke",

      "/api/rd4x/blacklist":
        "/api/dashboard/blacklist",

      "/api/rd4x/unblacklist":
        "/api/dashboard/unblacklist",

      "/api/dashboard/overview":
        "/api/dashboard/overview",

      "/api/dashboard/admins":
        "/api/dashboard/admins",

      "/api/dashboard/users":
        "/api/dashboard/users",

      "/api/dashboard/tickets":
        "/api/dashboard/tickets",

      "/api/dashboard/releases":
        "/api/dashboard/releases",

      "/api/dashboard/audit":
        "/api/dashboard/audit",

      "/api/dashboard/incidents":
        "/api/dashboard/incidents",

      "/api/dashboard/transcripts":
        "/api/dashboard/transcripts",

      "/api/dashboard/release":
        "/api/dashboard/release",

      "/api/dashboard/reset-hwid":
        "/api/dashboard/reset-hwid",

      "/api/dashboard/revoke":
        "/api/dashboard/revoke",

      "/api/dashboard/blacklist":
        "/api/dashboard/blacklist",

      "/api/dashboard/unblacklist":
        "/api/dashboard/unblacklist"
    };

    const targetPath =
      routes[url.pathname];

    if (targetPath) {
      const session =
        await getSession(
          request
        );

      if (!session) {
        return json(
          {
            success: false,
            error:
              "Sessão Discord não autenticada"
          },
          401
        );
      }

      if (
        !API_URL ||
        !API_KEY
      ) {
        return json(
          {
            success: false,
            error:
              "API RD4X não configurada."
          },
          500
        );
      }

      try {
        const headers =
          new Headers();

        headers.set(
          "Authorization",
          `Bearer ${API_KEY}`
        );

        headers.set(
          "Accept",
          "application/json"
        );

        headers.set(
          "Cache-Control",
          "no-cache"
        );

        headers.set(
          "X-Dashboard-User-ID",
          String(
            session.sub
          )
        );

        headers.set(
          "X-Dashboard-Role",
          String(
            session.role ||
              "Administrador"
          )
        );

        headers.set(
          "X-Dashboard-Owner",
          session.isOwner
            ? "true"
            : "false"
        );

        let body;

        if (
          request.method !==
            "GET" &&
          request.method !==
            "HEAD"
        ) {
          body =
            await request.text();

          if (body) {
            headers.set(
              "Content-Type",
              request.headers.get(
                "Content-Type"
              ) ||
                "application/json"
            );
          }
        }

        const apiResponse =
          await fetch(
            `${API_URL}${targetPath}${url.search}`,
            {
              method:
                request.method,

              headers,

              body
            }
          );

        const responseBody =
          await apiResponse.text();

        return new Response(
          responseBody,
          {
            status:
              apiResponse.status,

            headers: {
              "Content-Type":
                apiResponse.headers.get(
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
          "[WORKER API]",
          error
        );

        return json(
          {
            success: false,
            error:
              "Erro ao conectar com a API RD4X"
          },
          502
        );
      }
    }

    // =========================================================
    // ASSETS
    // =========================================================

    if (env.ASSETS) {
      const response =
        await env.ASSETS.fetch(
          request
        );

      const contentType =
        response.headers.get(
          "Content-Type"
        ) || "";

      if (
        contentType.includes(
          "text/html"
        ) ||
        contentType.includes(
          "javascript"
        ) ||
        contentType.includes(
          "text/css"
        )
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
