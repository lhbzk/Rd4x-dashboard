export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const DASHBOARD_URL =
      "https://rd4x-dashboard.ronaldoo-sev7n.workers.dev";

    const API_URL =
      String(env.RD4X_API_URL || "").replace(/\/+$/, "");

    const API_KEY =
      String(env.DASHBOARD_API_KEY || "").trim();

    const DISCORD_CLIENT_ID =
      String(env.DISCORD_CLIENT_ID || "").trim();

    const DISCORD_REDIRECT_URI =
      String(
        env.DISCORD_OAUTH_REDIRECT_URI ||
          `${DASHBOARD_URL}/api/auth/discord/callback`
      ).trim();

    const SESSION_MAX_AGE =
      10 * 365 * 24 * 60 * 60;

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
            "Pragma": "no-cache",
            "Expires": "0",
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
        value.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat(
          (4 - (value.length % 4)) % 4
        );

      const binary = atob(normalized);

      const bytes =
        new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      return bytes;
    }

    async function hmac(message) {
      if (!API_KEY) {
        throw new Error(
          "DASHBOARD_API_KEY não configurada."
        );
      }

      const key =
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(API_KEY),
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
          new TextEncoder().encode(message)
        );

      return base64urlEncode(
        new Uint8Array(signature)
      );
    }

    async function createSession(user) {
      const now = Date.now();

      const payload = {
        sub: String(user.id),

        username:
          user.username || "",

        globalName:
          user.globalName || null,

        avatar:
          user.avatar || null,

        role:
          user.role || "Administrador",

        isOwner:
          Boolean(user.isOwner),

        iat: now,

        exp:
          now +
          SESSION_MAX_AGE * 1000
      };

      const encoded =
        base64urlEncode(
          new TextEncoder().encode(
            JSON.stringify(payload)
          )
        );

      const signature =
        await hmac(encoded);

      return `${encoded}.${signature}`;
    }

    async function verifySession(token) {
      if (!token) {
        return null;
      }

      const parts = token.split(".");

      if (parts.length !== 2) {
        return null;
      }

      const [
        encoded,
        receivedSignature
      ] = parts;

      try {
        const expectedSignature =
          await hmac(encoded);

        if (
          receivedSignature !==
          expectedSignature
        ) {
          return null;
        }

        const payload =
          JSON.parse(
            new TextDecoder().decode(
              base64urlDecode(encoded)
            )
          );

        if (
          !payload ||
          !payload.sub ||
          !payload.exp
        ) {
          return null;
        }

        if (
          Date.now() >=
          Number(payload.exp)
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
        request.headers.get("Cookie") || "";

      if (!cookieHeader) {
        return null;
      }

      const cookies =
        cookieHeader.split(";");

      for (const cookie of cookies) {
        const index = cookie.indexOf("=");

        if (index === -1) {
          continue;
        }

        const key =
          cookie
            .slice(0, index)
            .trim();

        if (key !== name) {
          continue;
        }

        const value =
          cookie
            .slice(index + 1)
            .trim();

        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }

      return null;
    }

    async function getSession(request) {
      const token =
        getCookie(
          request,
          "rd4x_session"
        );

      return verifySession(token);
    }

    async function createOAuthState() {
      const payload = {
        iat: Date.now(),

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
            JSON.stringify(payload)
          )
        );

      const signature =
        await hmac(encoded);

      return `${encoded}.${signature}`;
    }

    async function verifyOAuthState(state) {
      if (!state) {
        return false;
      }

      const parts =
        state.split(".");

      if (parts.length !== 2) {
        return false;
      }

      const [
        encoded,
        receivedSignature
      ] = parts;

      try {
        const expected =
          await hmac(encoded);

        if (
          receivedSignature !==
          expected
        ) {
          return false;
        }

        const data =
          JSON.parse(
            new TextDecoder().decode(
              base64urlDecode(encoded)
            )
          );

        if (!data?.iat) {
          return false;
        }

        return (
          Date.now() -
            Number(data.iat) <
          10 * 60 * 1000
        );
      } catch {
        return false;
      }
    }

    function missingConfig() {
      const missing = [];

      if (!API_URL) {
        missing.push("RD4X_API_URL");
      }

      if (!API_KEY) {
        missing.push("DASHBOARD_API_KEY");
      }

      if (!DISCORD_CLIENT_ID) {
        missing.push("DISCORD_CLIENT_ID");
      }

      return missing;
    }

    async function apiFetch(
      path,
      options = {}
    ) {
      if (!API_URL) {
        throw new Error(
          "RD4X_API_URL não configurada."
        );
      }

      if (!API_KEY) {
        throw new Error(
          "DASHBOARD_API_KEY não configurada."
        );
      }

      const target =
        `${API_URL}${path}`;

      const headers =
        new Headers(
          options.headers || {}
        );

      headers.set(
        "Authorization",
        `Bearer ${API_KEY}`
      );

      headers.set(
        "Accept",
        "application/json"
      );

      if (
        options.body &&
        !headers.has("Content-Type")
      ) {
        headers.set(
          "Content-Type",
          "application/json"
        );
      }

      return fetch(target, {
        ...options,
        headers
      });
    }

    function setSessionCookie(token) {
      return [
        `rd4x_session=${encodeURIComponent(token)}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        `Max-Age=${SESSION_MAX_AGE}`
      ].join("; ");
    }

    function clearSessionCookie() {
      return [
        "rd4x_session=",
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=0"
      ].join("; ");
    }

    function getDashboardTarget(pathname) {
      if (
        pathname.startsWith(
          "/api/rd4x/"
        )
      ) {
        return (
          "/api/dashboard/" +
          pathname.slice(
            "/api/rd4x/".length
          )
        );
      }

      if (
        pathname.startsWith(
          "/api/dashboard/"
        )
      ) {
        return pathname;
      }

      return null;
    }

    async function proxyDashboard(
      request,
      env,
      targetPath,
      session
    ) {
      const targetUrl =
        `${API_URL}${targetPath}${url.search}`;

      const headers =
        new Headers(request.headers);

      headers.delete("host");

      headers.set(
        "Authorization",
        `Bearer ${API_KEY}`
      );

      headers.set(
        "X-Dashboard-User-ID",
        String(session.sub)
      );

      headers.set(
        "X-Dashboard-User-Role",
        String(
          session.role ||
            "Administrador"
        )
      );

      headers.set(
        "X-Dashboard-User-Owner",
        session.isOwner
          ? "true"
          : "false"
      );

      let body = undefined;

      if (
        request.method !== "GET" &&
        request.method !== "HEAD"
      ) {
        body = await request.text();
      }

      const response =
        await fetch(
          targetUrl,
          {
            method:
              request.method,

            headers,

            body,

            redirect: "manual"
          }
        );

      const responseHeaders =
        new Headers(
          response.headers
        );

      responseHeaders.set(
        "Cache-Control",
        "no-store"
      );

      return new Response(
        response.body,
        {
          status:
            response.status,

          statusText:
            response.statusText,

          headers:
            responseHeaders
        }
      );
    }

    try {
      /*
       * =========================================================
       * CORS / OPTIONS
       * =========================================================
       */

      if (
        request.method === "OPTIONS"
      ) {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin":
              DASHBOARD_URL,

            "Access-Control-Allow-Credentials":
              "true",

            "Access-Control-Allow-Methods":
              "GET,POST,PUT,PATCH,DELETE,OPTIONS",

            "Access-Control-Allow-Headers":
              "Content-Type, Authorization"
          }
        });
      }

      /*
       * =========================================================
       * WORKER STATUS
       * =========================================================
       */

      if (
        url.pathname ===
        "/api/rd4x/worker-status"
      ) {
        const missing =
          missingConfig();

        return json({
          success:
            missing.length === 0,

          worker: "online",

          apiConfigured:
            Boolean(API_URL),

          apiKeyConfigured:
            Boolean(API_KEY),

          discordConfigured:
            Boolean(DISCORD_CLIENT_ID),

          redirectConfigured:
            Boolean(
              DISCORD_REDIRECT_URI
            ),

          missing
        });
      }

      /*
       * =========================================================
       * DISCORD LOGIN
       * =========================================================
       */

      if (
        url.pathname ===
        "/api/auth/discord/login"
      ) {
        const session =
          await getSession(request);

        if (session) {
          return redirect(
            `${DASHBOARD_URL}/#/key`
          );
        }

        const missing =
          missingConfig();

        if (missing.length) {
          return json(
            {
              success: false,
              error:
                "Worker não configurado.",
              missing
            },
            500
          );
        }

        const state =
          await createOAuthState();

        const discordUrl =
          new URL(
            "https://discord.com/oauth2/authorize"
          );

        discordUrl.searchParams.set(
          "client_id",
          DISCORD_CLIENT_ID
        );

        discordUrl.searchParams.set(
          "redirect_uri",
          DISCORD_REDIRECT_URI
        );

        discordUrl.searchParams.set(
          "response_type",
          "code"
        );

        discordUrl.searchParams.set(
          "scope",
          "identify"
        );

        discordUrl.searchParams.set(
          "state",
          state
        );

        return redirect(
          discordUrl.toString()
        );
      }

      /*
       * =========================================================
       * DISCORD CALLBACK
       * =========================================================
       */

      if (
        url.pathname ===
        "/api/auth/discord/callback"
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
            `${DASHBOARD_URL}/#/login?error=${encodeURIComponent(
              oauthError
            )}`
          );
        }

        if (!code) {
          return json(
            {
              success: false,
              error:
                "Código OAuth ausente."
            },
            400
          );
        }

        const validState =
          await verifyOAuthState(
            state
          );

        if (!validState) {
          return json(
            {
              success: false,
              error:
                "Estado OAuth inválido ou expirado."
            },
            400
          );
        }

        if (!API_URL) {
          return json(
            {
              success: false,
              error:
                "RD4X_API_URL não configurada."
            },
            500
          );
        }

        if (!API_KEY) {
          return json(
            {
              success: false,
              error:
                "DASHBOARD_API_KEY não configurada."
            },
            500
          );
        }

        try {
          const exchangeResponse =
            await apiFetch(
              "/api/auth/discord/exchange",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify({
                    code,
                    redirectUri:
                      DISCORD_REDIRECT_URI
                  })
              }
            );

          const text =
            await exchangeResponse.text();

          let data = null;

          try {
            data =
              text
                ? JSON.parse(text)
                : null;
          } catch {
            data = null;
          }

          if (
            !exchangeResponse.ok
          ) {
            return json(
              {
                success: false,
                error:
                  data?.error ||
                  data?.message ||
                  "Falha ao autenticar com Discord.",
                status:
                  exchangeResponse.status
              },
              exchangeResponse.status
            );
          }

          const user =
            data?.data ||
            data?.user ||
            data;

          if (
            !user ||
            !user.id
          ) {
            return json(
              {
                success: false,
                error:
                  "A API não retornou um usuário válido.",
                response:
                  data
              },
              502
            );
          }

          const sessionToken =
            await createSession(
              user
            );

          return redirect(
            `${DASHBOARD_URL}/#/key`,
            {
              "Set-Cookie":
                setSessionCookie(
                  sessionToken
                )
            }
          );
        } catch (error) {
          return json(
            {
              success: false,
              error:
                "Erro ao comunicar com a API RD4X.",
              message:
                error?.message ||
                String(error)
            },
            502
          );
        }
      }

      /*
       * =========================================================
       * DISCORD ME
       * =========================================================
       */

      if (
        url.pathname ===
        "/api/auth/discord/me"
      ) {
        const session =
          await getSession(request);

        if (!session) {
          return json(
            {
              success: false,
              authenticated: false,
              user: null
            },
            401
          );
        }

        return json({
          success: true,

          authenticated: true,

          user: {
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
              Boolean(
                session.isOwner
              ),

            isAdmin: true
          },

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
              Boolean(
                session.isOwner
              ),

            isAdmin: true
          }
        });
      }

      /*
       * =========================================================
       * LOGOUT
       * =========================================================
       */

      if (
        url.pathname ===
        "/api/auth/discord/logout"
      ) {
        return json(
          {
            success: true
          },
          200,
          {
            "Set-Cookie":
              clearSessionCookie()
          }
        );
      }

      /*
       * =========================================================
       * KEY VALIDATION
       * =========================================================
       */

      if (
        url.pathname ===
        "/api/v2/keys/validate"
      ) {
        const session =
          await getSession(request);

        if (!session) {
          return json(
            {
              success: false,
              authenticated: false,
              error:
                "Sessão Discord inválida ou expirada."
            },
            401
          );
        }

        if (!API_URL) {
          return json(
            {
              success: false,
              error:
                "RD4X_API_URL não configurada."
            },
            500
          );
        }

        if (!API_KEY) {
          return json(
            {
              success: false,
              error:
                "DASHBOARD_API_KEY não configurada."
            },
            500
          );
        }

        let body;

        try {
          body =
            await request.json();
        } catch {
          return json(
            {
              success: false,
              error:
                "JSON inválido."
            },
            400
          );
        }

        const key =
          String(
            body?.key || ""
          ).trim();

        const hwid =
          String(
            body?.hwid || ""
          ).trim();

        if (!key) {
          return json(
            {
              success: false,
              valid: false,
              error:
                "Key não informada."
            },
            400
          );
        }

        try {
          const response =
            await apiFetch(
              "/api/v2/keys/validate",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify({
                    key,

                    discordId:
                      session.sub,

                    hwid
                  })
              }
            );

          const responseText =
            await response.text();

          let data;

          try {
            data =
              responseText
                ? JSON.parse(
                    responseText
                  )
                : {};
          } catch {
            data = {
              success:
                response.ok,
              raw:
                responseText
            };
          }

          return json(
            data,
            response.status
          );
        } catch (error) {
          return json(
            {
              success: false,
              valid: false,
              error:
                "Não foi possível validar a Key.",
              message:
                error?.message ||
                String(error)
            },
            502
          );
        }
      }

      /*
       * =========================================================
       * DASHBOARD API
       *
       * Aceita automaticamente:
       *
       * /api/rd4x/*
       * /api/dashboard/*
       *
       * Inclusive subrotas:
       *
       * /users/:id
       * /tickets/:id
       * /incidents/:id
       * /transcripts/:id
       * etc.
       * =========================================================
       */

      const dashboardTarget =
        getDashboardTarget(
          url.pathname
        );

      if (dashboardTarget) {
        const session =
          await getSession(request);

        if (!session) {
          return json(
            {
              success: false,
              authenticated: false,
              error:
                "Sessão Discord inválida ou expirada."
            },
            401
          );
        }

        if (!API_URL) {
          return json(
            {
              success: false,
              error:
                "RD4X_API_URL não configurada."
            },
            500
          );
        }

        if (!API_KEY) {
          return json(
            {
              success: false,
              error:
                "DASHBOARD_API_KEY não configurada."
            },
            500
          );
        }

        try {
          return await proxyDashboard(
            request,
            env,
            dashboardTarget,
            session
          );
        } catch (error) {
          return json(
            {
              success: false,
              error:
                "Erro ao comunicar com a API RD4X.",
              message:
                error?.message ||
                String(error)
            },
            502
          );
        }
      }

      /*
       * =========================================================
       * STATIC ASSETS
       * =========================================================
       */

      if (
        env.ASSETS &&
        typeof env.ASSETS.fetch ===
          "function"
      ) {
        const assetResponse =
          await env.ASSETS.fetch(
            request
          );

        const headers =
          new Headers(
            assetResponse.headers
          );

        const contentType =
          headers.get(
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
        }

        return new Response(
          assetResponse.body,
          {
            status:
              assetResponse.status,

            statusText:
              assetResponse.statusText,

            headers
          }
        );
      }

      /*
       * =========================================================
       * ASSETS NÃO CONFIGURADO
       * =========================================================
       */

      return json(
        {
          success: false,
          error:
            "Binding ASSETS não foi encontrado.",
          message:
            "O Worker está funcionando, mas os arquivos do Dashboard não estão vinculados a este Worker.",
          hint:
            "Configure o Static Assets/Assets binding no Cloudflare."
        },
        500
      );
    } catch (error) {
      return json(
        {
          success: false,
          error:
            "Erro interno do Worker.",
          message:
            error?.message ||
            String(error)
        },
        500
      );
    }
  }
};
