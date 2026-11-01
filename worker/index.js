/**
 * RD4X Dashboard V10
 * Cloudflare Worker
 *
 * Fluxo:
 *
 * Discord OAuth
 *      ↓
 * Worker cria sessão Discord
 *      ↓
 * Dashboard mostra Key
 *      ↓
 * /api/v2/keys/validate
 *      ↓
 * Bot Express /api/v2/keys/validate
 *      ↓
 * db.productKeys
 *      ↓
 * valid / invalid
 */

const DASHBOARD_URL =
  'https://rd4x-dashboard.ronaldoo-sev7n.workers.dev';

const SESSION_COOKIE =
  'rd4x_session';

const OAUTH_STATE_COOKIE =
  'rd4x_oauth_state';

const SESSION_MAX_AGE =
  60 * 60 * 24 * 3650; // 10 anos

const OAUTH_STATE_MAX_AGE =
  10 * 60; // 10 minutos


// ============================================================
// CONFIGURAÇÃO
// ============================================================

function getConfig(env) {
  return {
    apiUrl:
      String(
        env.RD4X_API_URL || ''
      )
        .trim()
        .replace(/\/+$/, ''),

    apiKey:
      String(
        env.DASHBOARD_API_KEY || ''
      ).trim(),

    discordClientId:
      String(
        env.DISCORD_CLIENT_ID || ''
      ).trim(),

    discordClientSecret:
      String(
        env.DISCORD_CLIENT_SECRET || ''
      ).trim(),

    discordRedirectUri:
      String(
        env.DISCORD_OAUTH_REDIRECT_URI || ''
      ).trim()
  };
}


// ============================================================
// JSON
// ============================================================

function json(
  data,
  status = 200,
  extraHeaders = {}
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type':
          'application/json; charset=utf-8',

        'Cache-Control':
          'no-store, no-cache, must-revalidate',

        ...extraHeaders
      }
    }
  );
}


// ============================================================
// REDIRECT
// ============================================================

function redirect(
  url,
  status = 302,
  extraHeaders = {}
) {
  return new Response(
    null,
    {
      status,
      headers: {
        Location: url,
        ...extraHeaders
      }
    }
  );
}


// ============================================================
// BASE64URL
// ============================================================

function base64UrlEncode(
  value
) {
  const bytes =
    new TextEncoder().encode(
      value
    );

  let binary = '';

  for (
    const byte of bytes
  ) {
    binary += String.fromCharCode(
      byte
    );
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}


function base64UrlDecode(
  value
) {
  const normalized =
    String(value || '')
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const padding =
    normalized.length % 4;

  const padded =
    padding
      ? normalized +
        '='.repeat(
          4 - padding
        )
      : normalized;

  const binary =
    atob(padded);

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

  return new TextDecoder()
    .decode(bytes);
}


// ============================================================
// HMAC
// ============================================================

async function hmacSign(
  value,
  secret
) {
  const key =
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(
        secret
      ),
      {
        name: 'HMAC',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    );

  const signature =
    await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(
        value
      )
    );

  const bytes =
    new Uint8Array(
      signature
    );

  let binary = '';

  for (
    const byte of bytes
  ) {
    binary += String.fromCharCode(
      byte
    );
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}


// ============================================================
// HMAC VERIFY
// ============================================================

async function hmacVerify(
  value,
  signature,
  secret
) {
  const expected =
    await hmacSign(
      value,
      secret
    );

  if (
    expected.length !==
    signature.length
  ) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < expected.length;
    i++
  ) {
    result |=
      expected.charCodeAt(i) ^
      signature.charCodeAt(i);
  }

  return result === 0;
}


// ============================================================
// SESSION
// ============================================================

async function createSession(
  user,
  secret
) {
  const payload = {
    sub:
      String(
        user.discordId ||
        user.id ||
        ''
      ),

    discordId:
      String(
        user.discordId ||
        user.id ||
        ''
      ),

    username:
      user.username ||
      null,

    globalName:
      user.globalName ||
      null,

    avatar:
      user.avatar ||
      null,

    role:
      user.role ||
      'Administrador',

    isOwner:
      Boolean(
        user.isOwner
      ),

    isAdmin:
      Boolean(
        user.isAdmin
      ),

    iat:
      Date.now(),

    exp:
      Date.now() +
      SESSION_MAX_AGE * 1000
  };

  const encoded =
    base64UrlEncode(
      JSON.stringify(
        payload
      )
    );

  const signature =
    await hmacSign(
      encoded,
      secret
    );

  return `${encoded}.${signature}`;
}


async function verifySession(
  token,
  secret
) {
  try {
    if (!token) {
      return null;
    }

    const parts =
      String(token).split('.');

    if (
      parts.length !== 2
    ) {
      return null;
    }

    const [
      encoded,
      signature
    ] = parts;

    const valid =
      await hmacVerify(
        encoded,
        signature,
        secret
      );

    if (!valid) {
      return null;
    }

    const payload =
      JSON.parse(
        base64UrlDecode(
          encoded
        )
      );

    if (
      !payload ||
      !payload.sub
    ) {
      return null;
    }

    if (
      payload.exp &&
      Date.now() >
        Number(payload.exp)
    ) {
      return null;
    }

    return payload;

  } catch (error) {
    console.error(
      '[SESSION VERIFY]',
      error
    );

    return null;
  }
}


// ============================================================
// COOKIES
// ============================================================

function getCookie(
  request,
  name
) {
  const cookieHeader =
    request.headers.get(
      'Cookie'
    ) || '';

  const cookies =
    cookieHeader.split(';');

  for (
    const cookie of cookies
  ) {
    const [
      key,
      ...rest
    ] = cookie.trim().split('=');

    if (
      key === name
    ) {
      return rest.join('=');
    }
  }

  return null;
}


function sessionCookie(
  value
) {
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE}`
  ].join('; ');
}


function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0'
  ].join('; ');
}


function oauthStateCookie(
  value
) {
  return [
    `${OAUTH_STATE_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${OAUTH_STATE_MAX_AGE}`
  ].join('; ');
}


function clearOAuthStateCookie() {
  return [
    `${OAUTH_STATE_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0'
  ].join('; ');
}


// ============================================================
// OAUTH STATE
// ============================================================

async function createOAuthState(
  secret
) {
  const random =
    crypto.randomUUID();

  const payload = {
    nonce:
      random,

    iat:
      Date.now(),

    exp:
      Date.now() +
      OAUTH_STATE_MAX_AGE * 1000
  };

  const encoded =
    base64UrlEncode(
      JSON.stringify(
        payload
      )
    );

  const signature =
    await hmacSign(
      encoded,
      secret
    );

  return `${encoded}.${signature}`;
}


async function verifyOAuthState(
  token,
  secret
) {
  try {
    if (!token) {
      return false;
    }

    const parts =
      String(token).split('.');

    if (
      parts.length !== 2
    ) {
      return false;
    }

    const [
      encoded,
      signature
    ] = parts;

    const valid =
      await hmacVerify(
        encoded,
        signature,
        secret
      );

    if (!valid) {
      return false;
    }

    const payload =
      JSON.parse(
        base64UrlDecode(
          encoded
        )
      );

    if (
      !payload ||
      !payload.exp
    ) {
      return false;
    }

    return (
      Date.now() <=
      Number(payload.exp)
    );

  } catch {
    return false;
  }
}


// ============================================================
// REQUIRE SESSION
// ============================================================

async function getSession(
  request,
  env
) {
  const config =
    getConfig(env);

  if (!config.apiKey) {
    return null;
  }

  const token =
    getCookie(
      request,
      SESSION_COOKIE
    );

  return verifySession(
    token,
    config.apiKey
  );
}


// ============================================================
// CONFIG CHECK
// ============================================================

function missingConfig(
  config
) {
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

  return missing;
}


// ============================================================
// WORKER STATUS
// ============================================================

function workerStatus(
  env
) {
  const config =
    getConfig(env);

  const missing =
    missingConfig(
      config
    );

  return json({
    success: true,

    worker:
      'online',

    apiConfigured:
      Boolean(
        config.apiUrl
      ),

    apiKeyConfigured:
      Boolean(
        config.apiKey
      ),

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


// ============================================================
// DISCORD LOGIN
// ============================================================

async function discordLogin(
  request,
  env
) {
  const config =
    getConfig(env);

  if (
    !config.discordClientId ||
    !config.discordRedirectUri ||
    !config.apiKey
  ) {
    return json(
      {
        success: false,
        error:
          'Discord OAuth não configurado corretamente.'
      },
      503
    );
  }

  const state =
    await createOAuthState(
      config.apiKey
    );

  const params =
    new URLSearchParams({
      client_id:
        config.discordClientId,

      redirect_uri:
        config.discordRedirectUri,

      response_type:
        'code',

      scope:
        'identify',

      state
    });

  const url =
    `https://discord.com/oauth2/authorize?${params.toString()}`;

  return redirect(
    url,
    302,
    {
      'Set-Cookie':
        oauthStateCookie(
          state
        )
    }
  );
}


// ============================================================
// DISCORD CALLBACK
// ============================================================

async function discordCallback(
  request,
  env
) {
  const config =
    getConfig(env);

  const url =
    new URL(request.url);

  const code =
    url.searchParams.get(
      'code'
    );

  const returnedState =
    url.searchParams.get(
      'state'
    );

  const savedState =
    getCookie(
      request,
      OAUTH_STATE_COOKIE
    );

  if (!code) {
    return redirect(
      `${DASHBOARD_URL}/#/login?error=oauth_code_missing`,
      302,
      {
        'Set-Cookie':
          clearOAuthStateCookie()
      }
    );
  }

  if (
    !returnedState ||
    !savedState ||
    returnedState !== savedState
  ) {
    return redirect(
      `${DASHBOARD_URL}/#/login?error=oauth_state_invalid`,
      302,
      {
        'Set-Cookie':
          clearOAuthStateCookie()
      }
    );
  }

  const stateValid =
    await verifyOAuthState(
      returnedState,
      config.apiKey
    );

  if (!stateValid) {
    return redirect(
      `${DASHBOARD_URL}/#/login?error=oauth_state_expired`,
      302,
      {
        'Set-Cookie':
          clearOAuthStateCookie()
      }
    );
  }

  if (
    !config.apiUrl ||
    !config.apiKey
  ) {
    return json(
      {
        success: false,
        error:
          'API do RD4X não configurada.'
      },
      503
    );
  }

  try {
    const response =
      await fetch(
        `${config.apiUrl}/api/auth/discord/exchange`,
        {
          method:
            'POST',

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
      await response.text();

    let data = null;

    try {
      data =
        JSON.parse(raw);
    } catch {
      data = {
        success: false,
        error:
          raw ||
          'Resposta inválida da API.'
      };
    }

    if (
      !response.ok ||
      !data?.success
    ) {
      console.error(
        '[DISCORD CALLBACK] Exchange recusado:',
        response.status,
        data?.error ||
          data?.reason ||
          'unknown'
      );

      return redirect(
        `${DASHBOARD_URL}/#/login?error=discord_exchange_failed`,
        302,
        {
          'Set-Cookie':
            clearOAuthStateCookie()
        }
      );
    }

    const user =
      data.data ||
      data.user ||
      data;

    const session =
      await createSession(
        user,
        config.apiKey
      );

    return redirect(
      `${DASHBOARD_URL}/#/key`,
      302,
      {
        'Set-Cookie': [
          sessionCookie(
            session
          ),
          clearOAuthStateCookie()
        ]
      }
    );

  } catch (error) {
    console.error(
      '[DISCORD CALLBACK] Erro de comunicação com API:',
      error?.message ||
        error
    );

    return redirect(
      `${DASHBOARD_URL}/#/login?error=api_connection_failed`,
      302,
      {
        'Set-Cookie':
          clearOAuthStateCookie()
      }
    );
  }
}


// ============================================================
// DISCORD ME
// ============================================================

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
      success: false,
      authenticated: false,
      user: null
    });
  }

  return json({
    success: true,
    authenticated: true,

    user: {
      id:
        session.discordId,

      discordId:
        session.discordId,

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

      isAdmin:
        Boolean(
          session.isAdmin
        )
    }
  });
}


// ============================================================
// LOGOUT
// ============================================================

function discordLogout() {
  return json(
    {
      success: true
    },
    200,
    {
      'Set-Cookie':
        clearSessionCookie()
    }
  );
}


// ============================================================
// KEY VALIDATION
// ============================================================

async function validateKey(
  request,
  env
) {
  const config =
    getConfig(env);

  const session =
    await getSession(
      request,
      env
    );

  if (!session) {
    return json(
      {
        success: false,
        valid: false,
        reason:
          'discord_session_missing'
      },
      401
    );
  }

  if (!config.apiUrl) {
    return json(
      {
        success: false,
        valid: false,
        reason:
          'api_url_not_configured'
      },
      503
    );
  }

  if (!config.apiKey) {
    return json(
      {
        success: false,
        valid: false,
        reason:
          'dashboard_api_key_not_configured'
      },
      503
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
        valid: false,
        reason:
          'json_invalido'
      },
      400
    );
  }

  const key =
    String(
      body?.key || ''
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
        'key_ausente'
    });
  }

  /*
   * IMPORTANTE:
   *
   * O Worker NÃO tenta validar a Key localmente.
   *
   * Ele encaminha para o BOT, que é quem possui
   * db.productKeys e toda a lógica oficial de
   * geração/resgate da Key.
   */

  try {
    const response =
      await fetch(
        `${config.apiUrl}/api/v2/keys/validate`,
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',

            'Authorization':
              `Bearer ${config.apiKey}`,

            'X-Dashboard-User-ID':
              String(
                session.discordId
              ),

            'X-Dashboard-User-Role':
              String(
                session.role ||
                ''
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
            })
        }
      );

    const raw =
      await response.text();

    let data = null;

    try {
      data =
        JSON.parse(raw);
    } catch {
      data = null;
    }

    /*
     * Diagnóstico seguro:
     *
     * Nunca registramos a Key.
     * Nunca registramos a DASHBOARD_API_KEY.
     * Apenas status e reason.
     */

    console.log(
      '[KEY VALIDATE]',
      JSON.stringify({
        httpStatus:
          response.status,

        botResponseOk:
          response.ok,

        botSuccess:
          data?.success ?? null,

        botValid:
          data?.valid ?? null,

        reason:
          data?.reason ||
          data?.error ||
          null,

        discordId:
          session.discordId
      })
    );

    /*
     * Se o Bot respondeu JSON, devolvemos
     * exatamente a informação necessária
     * para o frontend entender a validação.
     */

    if (data) {
      return json(
        data,
        response.status
      );
    }

    /*
     * Se o Bot respondeu algo que não é JSON,
     * não mostramos o conteúdo bruto ao usuário.
     */

    return json(
      {
        success: false,
        valid: false,
        reason:
          'resposta_invalida_do_bot',
        botStatus:
          response.status
      },
      502
    );

  } catch (error) {
    console.error(
      '[KEY VALIDATE] Falha Worker -> Bot:',
      error?.message ||
        error
    );

    return json(
      {
        success: false,
        valid: false,
        reason:
          'bot_connection_failed'
      },
      502
    );
  }
}


// ============================================================
// PROXY DASHBOARD
// ============================================================

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
    return json(
      {
        success: false,
        error:
          'Não autorizado',
        reason:
          'discord_session_missing'
      },
      401
    );
  }

  if (!config.apiUrl) {
    return json(
      {
        success: false,
        error:
          'API do RD4X não configurada.'
      },
      503
    );
  }

  if (!config.apiKey) {
    return json(
      {
        success: false,
        error:
          'DASHBOARD_API_KEY não configurada.'
      },
      503
    );
  }

  /*
   * /api/rd4x/foo
   *      ↓
   * /api/dashboard/foo
   *
   * /api/dashboard/foo
   *      ↓
   * /api/dashboard/foo
   */

  let targetPath;

  if (
    pathname.startsWith(
      '/api/rd4x/'
    )
  ) {
    targetPath =
      pathname.replace(
        '/api/rd4x',
        '/api/dashboard'
      );

  } else {
    targetPath =
      pathname;
  }

  const targetUrl =
    `${config.apiUrl}${targetPath}${new URL(request.url).search}`;

  const headers =
    new Headers(request.headers);

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
      session.role ||
      ''
    )
  );

  headers.set(
    'X-Dashboard-User-Owner',
    session.isOwner
      ? 'true'
      : 'false'
  );

  headers.set(
    'X-Dashboard-Authenticated',
    'true'
  );

  headers.set(
    'X-Dashboard-Request',
    'rd4x-cloudflare-worker'
  );

  /*
   * Não encaminhamos o Cookie da sessão
   * do Cloudflare para o Bot.
   */

  headers.delete(
    'Cookie'
  );

  try {
    const response =
      await fetch(
        targetUrl,
        {
          method:
            request.method,

          headers,

          body:
            request.method === 'GET' ||
            request.method === 'HEAD'
              ? undefined
              : request.body,

          redirect:
            'manual'
        }
      );

    const responseHeaders =
      new Headers(
        response.headers
      );

    responseHeaders.delete(
      'set-cookie'
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
      targetPath,
      error?.message ||
        error
    );

    return json(
      {
        success: false,
        error:
          'Não foi possível comunicar com a API do RD4X.'
      },
      502
    );
  }
}


// ============================================================
// CORS
// ============================================================

function addCors(
  response,
  request
) {
  const headers =
    new Headers(
      response.headers
    );

  const origin =
    request.headers.get(
      'Origin'
    );

  if (
    origin === DASHBOARD_URL
  ) {
    headers.set(
      'Access-Control-Allow-Origin',
      origin
    );

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
  }

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


// ============================================================
// OPTIONS
// ============================================================

function handleOptions(
  request
) {
  const origin =
    request.headers.get(
      'Origin'
    );

  const headers = {
    'Access-Control-Allow-Methods':
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',

    'Access-Control-Allow-Headers':
      'Content-Type, Authorization',

    'Access-Control-Allow-Credentials':
      'true',

    'Access-Control-Max-Age':
      '86400'
  };

  if (
    origin === DASHBOARD_URL
  ) {
    headers[
      'Access-Control-Allow-Origin'
    ] = origin;
  }

  return new Response(
    null,
    {
      status: 204,
      headers
    }
  );
}


// ============================================================
// FETCH
// ============================================================

export default {
  async fetch(
    request,
    env,
    ctx
  ) {
    const url =
      new URL(request.url);

    const pathname =
      url.pathname;

    /*
     * OPTIONS
     */

    if (
      request.method ===
      'OPTIONS'
    ) {
      return handleOptions(
        request
      );
    }


    /*
     * STATUS
     */

    if (
      pathname ===
      '/api/rd4x/worker-status'
    ) {
      return addCors(
        workerStatus(env),
        request
      );
    }


    /*
     * DISCORD LOGIN
     */

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


    /*
     * DISCORD CALLBACK
     */

    if (
      pathname ===
      '/api/auth/discord/callback'
    ) {
      return await discordCallback(
        request,
        env
      );
    }


    /*
     * DISCORD ME
     */

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


    /*
     * LOGOUT
     */

    if (
      pathname ===
      '/api/auth/discord/logout'
    ) {
      return addCors(
        discordLogout(),
        request
      );
    }


    /*
     * KEY VALIDATION
     */

    if (
      pathname ===
      '/api/v2/keys/validate'
    ) {
      if (
        request.method !==
        'POST'
      ) {
        return json(
          {
            success: false,
            valid: false,
            reason:
              'method_not_allowed'
          },
          405
        );
      }

      return addCors(
        await validateKey(
          request,
          env
        ),
        request
      );
    }


    /*
     * DASHBOARD / RD4X API
     */

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


    /*
     * ASSETS
     *
     * index.html, CSS, JS, imagens etc.
     */

    if (
      env.ASSETS
    ) {
      return env.ASSETS.fetch(
        request
      );
    }


    /*
     * ASSETS AUSENTE
     */

    return json(
      {
        success: false,
        error:
          'ASSETS binding não configurado.'
      },
      500
    );
  }
};
