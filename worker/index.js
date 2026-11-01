const DASHBOARD_URL =
  'https://rd4x-dashboard.ronaldoo-sev7n.workers.dev';

const SESSION_COOKIE = 'rd4x_session';
const OAUTH_STATE_COOKIE = 'rd4x_oauth_state';

const SESSION_MAX_AGE = 60 * 60 * 24 * 3650;
const OAUTH_STATE_MAX_AGE = 10 * 60;

/* =========================================================
   CONFIG
========================================================= */

function getConfig(env) {
  return {
    apiUrl: String(env.RD4X_API_URL || '')
      .trim()
      .replace(/\/+$/, ''),

    apiKey: String(env.DASHBOARD_API_KEY || '').trim(),

    discordClientId: String(env.DISCORD_CLIENT_ID || '').trim(),

    discordClientSecret: String(
      env.DISCORD_CLIENT_SECRET || ''
    ).trim(),

    discordRedirectUri: String(
      env.DISCORD_OAUTH_REDIRECT_URI || ''
    ).trim()
  };
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function json(data, status = 200, headers = {}) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type':
          'application/json; charset=utf-8',

        'Cache-Control':
          'no-store, no-cache, must-revalidate',

        ...headers
      }
    }
  );
}

function addCors(response, request) {
  const origin =
    request.headers.get('Origin');

  const headers =
    new Headers(response.headers);

  if (
    origin &&
    (
      origin === DASHBOARD_URL ||
      origin.endsWith('.workers.dev')
    )
  ) {
    headers.set(
      'Access-Control-Allow-Origin',
      origin
    );
  }

  headers.set(
    'Access-Control-Allow-Credentials',
    'true'
  );

  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  headers.set(
    'Vary',
    'Origin'
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

/* =========================================================
   COOKIE HELPERS
========================================================= */

function parseCookies(request) {
  const header =
    request.headers.get('Cookie') || '';

  const cookies = {};

  for (
    const part of header.split(';')
  ) {
    const index =
      part.indexOf('=');

    if (index === -1) {
      continue;
    }

    const name =
      part.slice(0, index).trim();

    const value =
      part.slice(index + 1).trim();

    try {
      cookies[name] =
        decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }

  return cookies;
}

function makeCookie(
  name,
  value,
  maxAge,
  options = {}
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax'
  ];

  if (options.sameSite) {
    parts[
      parts.length - 1
    ] = `SameSite=${options.sameSite}`;
  }

  return parts.join('; ');
}

/* =========================================================
   CRYPTO
========================================================= */

function textEncoder() {
  return new TextEncoder();
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    textEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(bytes) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized =
    value
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const padding =
    normalized.length % 4 === 0
      ? ''
      : '='.repeat(
          4 - (normalized.length % 4)
        );

  const binary =
    atob(
      normalized + padding
    );

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

async function createSignedSession(
  payload,
  secret
) {
  const data =
    base64UrlEncode(
      textEncoder().encode(
        JSON.stringify(payload)
      )
    );

  const key =
    await importHmacKey(secret);

  const signature =
    await crypto.subtle.sign(
      'HMAC',
      key,
      textEncoder().encode(data)
    );

  return (
    `${data}.${base64UrlEncode(
      new Uint8Array(signature)
    )}`
  );
}

async function verifySignedSession(
  token,
  secret
) {
  try {
    if (!token || !secret) {
      return null;
    }

    const parts =
      token.split('.');

    if (parts.length !== 2) {
      return null;
    }

    const [
      data,
      signature
    ] = parts;

    const key =
      await importHmacKey(secret);

    const valid =
      await crypto.subtle.verify(
        'HMAC',
        key,
        base64UrlDecode(signature),
        textEncoder().encode(data)
      );

    if (!valid) {
      return null;
    }

    const payload =
      JSON.parse(
        new TextDecoder().decode(
          base64UrlDecode(data)
        )
      );

    if (
      payload.exp &&
      Number(payload.exp) < Date.now()
    ) {
      return null;
    }

    return payload;

  } catch {
    return null;
  }
}

/* =========================================================
   SESSION
========================================================= */

async function getSession(
  request,
  env
) {
  const config =
    getConfig(env);

  if (!config.apiKey) {
    return null;
  }

  const cookies =
    parseCookies(request);

  const token =
    cookies[SESSION_COOKIE];

  if (!token) {
    return null;
  }

  return verifySignedSession(
    token,
    config.apiKey
  );
}

async function createSessionCookie(
  user,
  env
) {
  const config =
    getConfig(env);

  const now =
    Date.now();

  const payload = {
    discordId: String(
      user.discordId ||
      user.id ||
      ''
    ),

    username:
      user.username ||
      user.globalName ||
      null,

    role:
      user.role ||
      'user',

    isOwner:
      Boolean(user.isOwner),

    iat:
      now,

    exp:
      now +
      SESSION_MAX_AGE * 1000
  };

  const token =
    await createSignedSession(
      payload,
      config.apiKey
    );

  return makeCookie(
    SESSION_COOKIE,
    token,
    SESSION_MAX_AGE
  );
}

/* =========================================================
   DISCORD LOGIN
========================================================= */

async function discordLogin(
  request,
  env
) {
  const config =
    getConfig(env);

  if (
    !config.discordClientId ||
    !config.discordRedirectUri
  ) {
    return json({
      success: false,
      error:
        'Discord OAuth não configurado'
    }, 503);
  }

  const stateBytes =
    crypto.getRandomValues(
      new Uint8Array(32)
    );

  const state =
    base64UrlEncode(
      stateBytes
    );

  const cookie =
    makeCookie(
      OAUTH_STATE_COOKIE,
      state,
      OAUTH_STATE_MAX_AGE
    );

  const params =
    new URLSearchParams({
      client_id:
        config.discordClientId,

      response_type:
        'code',

      redirect_uri:
        config.discordRedirectUri,

      scope:
        'identify',

      state
    });

  const url =
    `https://discord.com/oauth2/authorize?${params.toString()}`;

  return new Response(
    null,
    {
      status: 302,

      headers: {
        Location: url,

        'Set-Cookie':
          cookie
      }
    }
  );
}

/* =========================================================
   DISCORD CALLBACK
========================================================= */

async function discordCallback(
  request,
  env
) {
  const config =
    getConfig(env);

  const url =
    new URL(request.url);

  const code =
    url.searchParams.get('code');

  const state =
    url.searchParams.get('state');

  if (!code) {
    return new Response(
      'Código OAuth ausente.',
      {
        status: 400
      }
    );
  }

  const cookies =
    parseCookies(request);

  const savedState =
    cookies[OAUTH_STATE_COOKIE];

  if (
    !state ||
    !savedState ||
    state !== savedState
  ) {
    return new Response(
      'Estado OAuth inválido.',
      {
        status: 400
      }
    );
  }

  try {
    const exchangeResponse =
      await fetch(
        `${config.apiUrl}/api/auth/discord/exchange`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'Authorization':
              `Bearer ${config.apiKey}`,

            'X-Dashboard-Request':
              'rd4x-cloudflare-worker'
          },

          body:
            JSON.stringify({
              code,

              redirectUri:
                config.discordRedirectUri
            })
        }
      );

    const raw =
      await exchangeResponse.text();

    let data = null;

    try {
      data =
        JSON.parse(raw);
    } catch {
      data = null;
    }

    if (
      !exchangeResponse.ok ||
      !data
    ) {
      console.error(
        '[DISCORD CALLBACK] Exchange falhou:',
        exchangeResponse.status,
        raw
      );

      return new Response(
        'Falha ao autenticar com Discord.',
        {
          status: 502
        }
      );
    }

    const user =
      data.user ||
      data.data?.user ||
      data;

    const sessionCookie =
      await createSessionCookie(
        user,
        env
      );

    const headers =
      new Headers();

    headers.set(
      'Location',
      `${DASHBOARD_URL}/#/key`
    );

    headers.append(
      'Set-Cookie',
      sessionCookie
    );

    headers.append(
      'Set-Cookie',
      makeCookie(
        OAUTH_STATE_COOKIE,
        '',
        0
      )
    );

    return new Response(
      null,
      {
        status: 302,
        headers
      }
    );

  } catch (error) {
    console.error(
      '[DISCORD CALLBACK]',
      error?.message || error
    );

    return new Response(
      'Erro interno durante autenticação.',
      {
        status: 500
      }
    );
  }
}

/* =========================================================
   DISCORD ME
========================================================= */

async function discordMe(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (!session) {
    return json({
      authenticated: false
    }, 401);
  }

  return json({
    authenticated: true,

    user: {
      id:
        session.discordId,

      discordId:
        session.discordId,

      username:
        session.username,

      role:
        session.role,

      isOwner:
        session.isOwner
    }
  });
}

/* =========================================================
   DISCORD LOGOUT
========================================================= */

async function discordLogout() {
  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,

      headers: {
        'Content-Type':
          'application/json; charset=utf-8',

        'Cache-Control':
          'no-store',

        'Set-Cookie':
          makeCookie(
            SESSION_COOKIE,
            '',
            0
          )
      }
    }
  );
}

/* =========================================================
   WORKER STATUS
========================================================= */

async function workerStatus(env) {
  const config =
    getConfig(env);

  const missing = [];

  if (!config.apiUrl) {
    missing.push(
      'RD4X_API_URL'
    );
  }

  if (!config.apiKey) {
    missing.push(
      'DASHBOARD_API_KEY'
    );
  }

  if (!config.discordClientId) {
    missing.push(
      'DISCORD_CLIENT_ID'
    );
  }

  if (!config.discordClientSecret) {
    missing.push(
      'DISCORD_CLIENT_SECRET'
    );
  }

  if (!config.discordRedirectUri) {
    missing.push(
      'DISCORD_OAUTH_REDIRECT_URI'
    );
  }

  return json({
    success: true,

    worker:
      'online',

    apiConfigured:
      Boolean(config.apiUrl),

    apiKeyConfigured:
      Boolean(config.apiKey),

    discordConfigured:
      Boolean(
        config.discordClientId &&
        config.discordClientSecret
      ),

    redirectConfigured:
      Boolean(
        config.discordRedirectUri
      ),

    missing
  });
}

/* =========================================================
   KEY VALIDATION
========================================================= */

async function validateKey(
  request,
  env
) {
  const config =
    getConfig(env);

  /*
   * IMPORTANTE:
   * Este endpoint agora devolve informações
   * suficientes para sabermos exatamente
   * onde a comunicação está parando.
   */

  const diagnostic = {
    worker: true,
    route: '/api/v2/keys/validate',
    method: request.method,
    session: false,
    keyReceived: false,
    botRequestStarted: false,
    botResponseReceived: false
  };

  console.log(
    '[KEY VALIDATE WORKER] 1 - Rota recebida'
  );

  const session =
    await getSession(
      request,
      env
    );

  console.log(
    '[KEY VALIDATE WORKER] 2 - Sessão:',
    session
      ? `OK (${session.discordId})`
      : 'AUSENTE'
  );

  if (!session) {
    return json({
      success: false,
      valid: false,

      reason:
        'discord_session_missing',

      diagnostic: {
        ...diagnostic,
        session: false
      }
    }, 401);
  }

  diagnostic.session = true;

  console.log(
    '[KEY VALIDATE WORKER] 3 - API URL:',
    config.apiUrl
      ? 'CONFIGURADA'
      : 'AUSENTE'
  );

  console.log(
    '[KEY VALIDATE WORKER] 4 - API KEY:',
    config.apiKey
      ? `CONFIGURADA (${config.apiKey.length} caracteres)`
      : 'AUSENTE'
  );

  if (!config.apiUrl) {
    return json({
      success: false,
      valid: false,

      reason:
        'api_url_not_configured',

      diagnostic
    }, 503);
  }

  if (!config.apiKey) {
    return json({
      success: false,
      valid: false,

      reason:
        'dashboard_api_key_not_configured',

      diagnostic
    }, 503);
  }

  let body;

  try {
    body =
      await request.json();

    console.log(
      '[KEY VALIDATE WORKER] 5 - JSON recebido'
    );

  } catch (error) {
    console.error(
      '[KEY VALIDATE WORKER] 5 - JSON inválido:',
      error?.message || error
    );

    return json({
      success: false,
      valid: false,

      reason:
        'json_invalido',

      diagnostic
    }, 400);
  }

  const key =
    String(
      body?.key || ''
    ).trim();

  const hwid =
    body?.hwid
      ? String(body.hwid).trim()
      : null;

  diagnostic.keyReceived =
    Boolean(key);

  console.log(
    '[KEY VALIDATE WORKER] 6 - Key recebida:',
    key
      ? `SIM (${key.length} caracteres)`
      : 'NÃO'
  );

  if (!key) {
    return json({
      success: true,
      valid: false,

      reason:
        'key_ausente',

      diagnostic
    });
  }

  const targetUrl =
    `${config.apiUrl}/api/v2/keys/validate`;

  console.log(
    '[KEY VALIDATE WORKER] 7 - Enviando para Bot:',
    targetUrl
  );

  diagnostic.botRequestStarted = true;

  try {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        10000
      );

    let response;

    try {
      response =
        await fetch(
          targetUrl,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              'Accept':
                'application/json',

              'Authorization':
                `Bearer ${config.apiKey}`,

              'X-Dashboard-User-ID':
                String(
                  session.discordId
                ),

              'X-Dashboard-User-Role':
                String(
                  session.role || ''
                ),

              'X-Dashboard-User-Owner':
                session.isOwner
                  ? 'true'
                  : 'false',

              'X-Dashboard-Request':
                'rd4x-key-validation'
            },

            body:
              JSON.stringify({
                key,

                hwid,

                discordId:
                  String(
                    session.discordId
                  )
              }),

            signal:
              controller.signal
          }
        );

    } finally {
      clearTimeout(timeout);
    }

    diagnostic.botResponseReceived =
      true;

    console.log(
      '[KEY VALIDATE WORKER] 8 - Bot respondeu:',
      response.status,
      response.statusText
    );

    const raw =
      await response.text();

    console.log(
      '[KEY VALIDATE WORKER] 9 - Resposta recebida:',
      raw
        ? `SIM (${raw.length} caracteres)`
        : 'VAZIA'
    );

    let data = null;

    try {
      data =
        JSON.parse(raw);
    } catch {
      data = null;
    }

    if (data) {
      console.log(
        '[KEY VALIDATE WORKER] 10 - Resultado:',
        JSON.stringify({
          success:
            data.success ?? null,

          valid:
            data.valid ?? null,

          reason:
            data.reason ||
            data.error ||
            null
        })
      );

      /*
       * Se o Bot respondeu, devolvemos
       * o resultado original junto do
       * diagnóstico.
       */
      return json({
        ...data,

        diagnostic: {
          ...diagnostic,

          botStatus:
            response.status,

          botStatusText:
            response.statusText
        }
      }, response.status);
    }

    console.error(
      '[KEY VALIDATE WORKER] 10 - Bot não retornou JSON'
    );

    return json({
      success: false,
      valid: false,

      reason:
        'resposta_invalida_do_bot',

      botStatus:
        response.status,

      diagnostic
    }, 502);

  } catch (error) {
    console.error(
      '[KEY VALIDATE WORKER] ERRO NO FETCH PARA O BOT:',
      error?.name,
      error?.message || error
    );

    /*
     * AbortError significa timeout.
     */
    if (
      error?.name === 'AbortError'
    ) {
      return json({
        success: false,
        valid: false,

        reason:
          'bot_timeout',

        diagnostic: {
          ...diagnostic,

          botResponseReceived:
            false
        }
      }, 504);
    }

    return json({
      success: false,
      valid: false,

      reason:
        'bot_connection_failed',

      error:
        String(
          error?.message || error
        ),

      diagnostic
    }, 502);
  }
}

/* =========================================================
   DASHBOARD PROXY
========================================================= */

async function proxyDashboard(
  request,
  env,
  pathname
) {
  const config =
    getConfig(env);

  const session =
    await getSession(
      request,
      env
    );

  if (!session) {
    return json({
      success: false,
      error:
        'Discord não autenticado'
    }, 401);
  }

  if (!config.apiUrl) {
    return json({
      success: false,
      error:
        'RD4X_API_URL não configurada'
    }, 503);
  }

  if (!config.apiKey) {
    return json({
      success: false,
      error:
        'DASHBOARD_API_KEY não configurada'
    }, 503);
  }

  const target =
    `${config.apiUrl}${pathname}`;

  const headers =
    new Headers(
      request.headers
    );

  headers.set(
    'Authorization',
    `Bearer ${config.apiKey}`
  );

  headers.set(
    'X-Dashboard-User-ID',
    String(
      session.discordId
    )
  );

  headers.set(
    'X-Dashboard-User-Role',
    String(
      session.role || ''
    )
  );

  headers.set(
    'X-Dashboard-User-Owner',
    session.isOwner
      ? 'true'
      : 'false'
  );

  headers.set(
    'X-Dashboard-Request',
    'rd4x-cloudflare-worker'
  );

  headers.delete(
    'Cookie'
  );

  try {
    const response =
      await fetch(
        target,
        {
          method:
            request.method,

          headers,

          body:
            request.method === 'GET' ||
            request.method === 'HEAD'
              ? undefined
              : request.body
        }
      );

    const responseHeaders =
      new Headers(
        response.headers
      );

    responseHeaders.delete(
      'Set-Cookie'
    );

    responseHeaders.set(
      'Cache-Control',
      'no-store'
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

  } catch (error) {
    console.error(
      '[DASHBOARD PROXY]',
      error?.message || error
    );

    return json({
      success: false,
      error:
        'Falha ao conectar com a API RD4X'
    }, 502);
  }
}

/* =========================================================
   MAIN FETCH
========================================================= */

export default {
  async fetch(
    request,
    env
  ) {
    const url =
      new URL(request.url);

    const pathname =
      url.pathname;

    console.log(
      '[WORKER REQUEST]',
      request.method,
      pathname
    );

    /* =====================================================
       OPTIONS / CORS
    ===================================================== */

    if (
      request.method ===
      'OPTIONS'
    ) {
      return addCors(
        new Response(
          null,
          {
            status: 204
          }
        ),
        request
      );
    }

    /* =====================================================
       STATUS
    ===================================================== */

    if (
      pathname ===
      '/api/rd4x/worker-status'
    ) {
      return addCors(
        await workerStatus(env),
        request
      );
    }

    /* =====================================================
       DISCORD LOGIN
    ===================================================== */

    if (
      pathname ===
      '/api/auth/discord/login'
    ) {
      return addCors(
        await discordLogin(
          request,
          env
        ),
        request
      );
    }

    /* =====================================================
       DISCORD CALLBACK
    ===================================================== */

    if (
      pathname ===
      '/api/auth/discord/callback'
    ) {
      return await discordCallback(
        request,
        env
      );
    }

    /* =====================================================
       DISCORD ME
    ===================================================== */

    if (
      pathname ===
      '/api/auth/discord/me'
    ) {
      return addCors(
        await discordMe(
          request,
          env
        ),
        request
      );
    }

    /* =====================================================
       DISCORD LOGOUT
    ===================================================== */

    if (
      pathname ===
      '/api/auth/discord/logout'
    ) {
      return addCors(
        await discordLogout(),
        request
      );
    }

    /* =====================================================
       KEY VALIDATION
    ===================================================== */

    if (
      pathname ===
      '/api/v2/keys/validate'
    ) {
      if (
        request.method !==
        'POST'
      ) {
        return addCors(
          json({
            success: false,
            valid: false,

            reason:
              'method_not_allowed'
          }, 405),
          request
        );
      }

      const result =
        await validateKey(
          request,
          env
        );

      return addCors(
        result,
        request
      );
    }

    /* =====================================================
       DASHBOARD / RD4X API
    ===================================================== */

    if (
      pathname.startsWith(
        '/api/rd4x/'
      ) ||
      pathname.startsWith(
        '/api/dashboard/'
      )
    ) {
      return addCors(
        await proxyDashboard(
          request,
          env,
          pathname
        ),
        request
      );
    }

    /* =====================================================
       STATIC ASSETS
    ===================================================== */

    return env.ASSETS.fetch(
      request
    );
  }
};
