/* ============================================================
   RD4X DASHBOARD V10 — App Router & Shell
   ============================================================ */

'use strict';

const App = {

  /* ==========================================================
     PÁGINAS
     ========================================================== */

  pages: {

    overview:
      window.renderOverview,

    search:
      window.renderSearch,

    users:
      window.renderUsers,

    tickets:
      window.renderTickets,

    releases:
      window.renderReleases,

    incidents:
      window.renderIncidents,

    audit:
      window.renderAudit,

    stats:
      window.renderStats,

    transcripts:
      window.renderTranscripts,

    settings:
      window.renderSettings

  },


  /* ==========================================================
     ESTADO DE AUTENTICAÇÃO
     ========================================================== */

  authChecked: false,

  authenticated: false,

  currentUser: null,

  checkingAuth: false,


  /* ==========================================================
     INIT
     ========================================================== */

  async init() {

    this.setupSidebar();

    this.setupTopbar();

    this.setupRouter();

    this.setupKeyboard();

    /*
     * Antes de carregar qualquer página,
     * confirma a sessão Discord no Worker.
     */
    const authenticated =
      await this.checkDiscordSession();

    if (!authenticated) {
      return;
    }

    this.route();

  },


  /* ==========================================================
     AUTENTICAÇÃO DISCORD
     ========================================================== */

  async checkDiscordSession() {

    /*
     * Evita chamadas duplicadas.
     */
    if (this.checkingAuth) {
      return this.authenticated;
    }


    this.checkingAuth = true;


    try {

      /*
       * Api.checkAuth() consulta:
       *
       * /api/auth/discord/me
       *
       * O api.js deve manter:
       *
       * credentials: 'include'
       *
       * para que o cookie da sessão seja enviado.
       */

      const response =
        await Api.checkAuth();


      /*
       * Formatos aceitos:
       *
       * {
       *   authenticated: true,
       *   user: {...}
       * }
       *
       * ou
       *
       * {
       *   success: true,
       *   authenticated: true,
       *   user: {...}
       * }
       */

      const authenticated =
        response?.authenticated === true ||
        response?.success === true &&
        response?.user;


      if (!authenticated) {

        this.authChecked = true;

        this.authenticated = false;

        this.currentUser =
          null;


        this.showDiscordLogin();

        return false;

      }


      this.authChecked = true;

      this.authenticated = true;


      this.currentUser =
        response?.user ||
        response?.data ||
        null;


      /*
       * Disponibiliza o usuário globalmente.
       */
      window.RD4X_CURRENT_USER =
        this.currentUser;


      return true;


    } catch (error) {

      console.error(
        '[RD4X AUTH] Erro ao verificar sessão Discord:',
        error
      );


      this.authChecked = true;

      this.authenticated = false;

      this.currentUser =
        null;


      this.showAuthError(
        error
      );


      return false;


    } finally {

      this.checkingAuth = false;

    }

  },


  /* ==========================================================
     TELA DE LOGIN DISCORD
     ========================================================== */

  showDiscordLogin() {

    const content =
      document.getElementById(
        'content'
      );


    if (!content) {
      return;
    }


    content.innerHTML = `

      <div
        class="empty-state"
        style="
          min-height:60vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          gap:12px;
        "
      >

        <svg
          class="icon"
          style="
            width:42px;
            height:42px;
            color:var(--danger);
          "
        >
          <use href="#i-lock"/>
        </svg>


        <div
          style="
            font-size:18px;
            font-weight:700;
          "
        >
          Sessão Discord não autenticada
        </div>


        <div
          style="
            max-width:420px;
            color:var(--text-muted);
            line-height:1.5;
          "
        >
          Você precisa estar autenticado
          com sua conta do Discord para
          acessar o RD4X Dashboard.
        </div>


        <button
          id="rd4x-discord-login"
          type="button"
          class="btn btn-primary"
          style="
            margin-top:8px;
            display:inline-flex;
            align-items:center;
            gap:8px;
          "
        >

          <svg
            class="icon"
            style="
              width:18px;
              height:18px;
            "
          >
            <use href="#i-discord"/>
          </svg>

          Entrar com Discord

        </button>

      </div>

    `;


    const loginButton =
      document.getElementById(
        'rd4x-discord-login'
      );


    if (loginButton) {

      loginButton.addEventListener(
        'click',
        () => {

          /*
           * O login é iniciado pelo Worker.
           */
          Api.login();

        }
      );

    }

  },


  /* ==========================================================
     ERRO DE AUTENTICAÇÃO
     ========================================================== */

  showAuthError(
    error
  ) {

    const content =
      document.getElementById(
        'content'
      );


    if (!content) {
      return;
    }


    const message =
      error?.message ||
      'Não foi possível verificar sua sessão Discord.';


    content.innerHTML = `

      <div
        class="empty-state"
        style="
          min-height:60vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          gap:12px;
        "
      >

        <svg
          class="icon"
          style="
            width:42px;
            height:42px;
            color:var(--danger);
          "
        >
          <use href="#i-alert"/>
        </svg>


        <div
          style="
            font-size:18px;
            font-weight:700;
            color:var(--danger);
          "
        >
          Erro ao verificar sessão
        </div>


        <div
          style="
            max-width:500px;
            color:var(--text-muted);
            line-height:1.5;
          "
        >
          ${Utils.escapeHtml(message)}
        </div>


        <button
          id="rd4x-auth-retry"
          type="button"
          class="btn btn-primary"
          style="margin-top:8px;"
        >
          Tentar novamente
        </button>

      </div>

    `;


    const retry =
      document.getElementById(
        'rd4x-auth-retry'
      );


    if (retry) {

      retry.addEventListener(
        'click',
        () => {

          this.checkDiscordSession();

        }
      );

    }

  },


  /* ==========================================================
     SIDEBAR
     ========================================================== */

  setupSidebar() {

    const sidebar =
      document.getElementById('sidebar');

    const backdrop =
      document.getElementById(
        'sidebar-backdrop'
      );

    const btn =
      document.getElementById(
        'menu-toggle'
      );


    const close = () => {

      if (sidebar) {
        sidebar.classList.remove('open');
      }

      if (backdrop) {
        backdrop.classList.remove('open');
      }

    };


    if (btn) {

      btn.addEventListener(
        'click',
        () => {

          if (sidebar) {
            sidebar.classList.toggle(
              'open'
            );
          }

          if (backdrop) {
            backdrop.classList.toggle(
              'open'
            );
          }

        }
      );

    }


    if (backdrop) {

      backdrop.addEventListener(
        'click',
        close
      );

    }


    document
      .querySelectorAll('.nav-item')
      .forEach(a => {

        a.addEventListener(
          'click',
          () => {

            if (
              window.innerWidth <= 900
            ) {
              close();
            }

          }
        );

      });

  },


  /* ==========================================================
     TOPBAR
     ========================================================== */

  setupTopbar() {

    const searchInput =
      document.getElementById(
        'global-search'
      );


    if (searchInput) {

      searchInput.addEventListener(
        'keydown',
        e => {

          if (e.key !== 'Enter') {
            return;
          }


          const q =
            searchInput.value.trim();


          if (q) {

            window.location.hash =
              `#/search?q=${encodeURIComponent(q)}`;

            searchInput.value = '';

          } else {

            window.location.hash =
              '#/search';

          }

        }
      );

    }


    const userBtn =
      document.getElementById(
        'user-btn'
      );


    if (userBtn) {

      userBtn.addEventListener(
        'click',
        () => {

          if (
            this.currentUser
          ) {

            Notifications.info(
              `Autenticado como ${
                this.currentUser.globalName ||
                this.currentUser.username ||
                'usuário Discord'
              }.`
            );

          } else {

            Notifications.info(
              'Sessão Discord autenticada.'
            );

          }

        }
      );

    }

  },


  /* ==========================================================
     KEYBOARD
     ========================================================== */

  setupKeyboard() {

    document.addEventListener(
      'keydown',
      e => {

        if (
          e.key === '/' &&
          ![
            'INPUT',
            'TEXTAREA',
            'SELECT'
          ].includes(
            document.activeElement.tagName
          )
        ) {

          e.preventDefault();


          const input =
            document.getElementById(
              'global-search'
            );


          if (input) {
            input.focus();
          }

        }

      }
    );

  },


  /* ==========================================================
     ROUTER
     ========================================================== */

  setupRouter() {

    window.addEventListener(
      'hashchange',
      () => {

        /*
         * Nunca deixa o router carregar
         * páginas protegidas antes da
         * autenticação.
         */
        if (
          !this.authenticated
        ) {
          return;
        }


        this.route();

      }
    );

  },


  /* ==========================================================
     HASH PARSER
     ========================================================== */

  parseHash() {

    const raw =
      window.location.hash
        .replace(/^#\/?/, '');


    const [
      pathPart,
      queryPart
    ] =
      raw.split('?');


    const page =
      (
        pathPart ||
        'overview'
      )
        .split('/')[0] ||
      'overview';


    const params = {};


    if (queryPart) {

      new URLSearchParams(
        queryPart
      ).forEach(
        (value, key) => {

          params[key] = value;

        }
      );

    }


    return {
      page,
      params
    };

  },


  /* ==========================================================
     ROUTE
     ========================================================== */

  async route() {

    /*
     * Proteção adicional.
     */
    if (
      !this.authenticated
    ) {

      return;

    }


    const {
      page,
      params
    } =
      this.parseHash();


    const content =
      document.getElementById(
        'content'
      );


    if (!content) {
      return;
    }


    const known = [

      'overview',

      'search',

      'users',

      'tickets',

      'releases',

      'incidents',

      'audit',

      'stats',

      'transcripts',

      'settings'

    ];


    const currentPage =
      known.includes(page)
        ? page
        : 'overview';


    /* ----------------------------------------------------------
       ATUALIZA MENU ATIVO
       ---------------------------------------------------------- */

    document
      .querySelectorAll('.nav-item')
      .forEach(a => {

        a.classList.toggle(
          'active',
          a.dataset.route ===
            currentPage
        );

      });


    /* ----------------------------------------------------------
       RESET DO SCROLL
       ---------------------------------------------------------- */

    content.scrollTop = 0;


    /* ----------------------------------------------------------
       CARREGA PÁGINA
       ---------------------------------------------------------- */

    try {

      const fn =
        this.pages[currentPage];


      if (typeof fn === 'function') {

        await fn(
          content,
          params
        );

      } else {

        content.innerHTML = `

          <div class="empty-state">

            <svg class="icon">
              <use href="#i-alert"/>
            </svg>

            <div
              style="
                font-size:15px;
                font-weight:600;
                color:var(--danger);
                margin-bottom:4px
              "
            >
              Página não encontrada
            </div>

            <div>
              O módulo
              <strong>
                ${Utils.escapeHtml(
                  currentPage
                )}
              </strong>
              ainda não foi carregado.
            </div>

          </div>

        `;

      }

    } catch (err) {

      console.error(err);


      content.innerHTML = `

        <div class="empty-state">

          <svg class="icon">
            <use href="#i-alert"/>
          </svg>

          <div
            style="
              font-size:15px;
              font-weight:600;
              color:var(--danger);
              margin-bottom:4px
            "
          >
            Erro ao carregar página
          </div>

          <div>
            ${Utils.escapeHtml(
              err.message ||
              'Erro desconhecido'
            )}
          </div>

        </div>

      `;


      Notifications.error(
        'Erro ao conectar. Tentando novamente.'
      );

    }


    /* ----------------------------------------------------------
       TÍTULO
       ---------------------------------------------------------- */

    const titles = {

      overview:
        'Visão Geral',

      search:
        'Busca Global',

      users:
        'Usuários',

      tickets:
        'Tickets',

      releases:
        'Releases',

      incidents:
        'Incidentes',

      audit:
        'Auditoria',

      stats:
        'Estatísticas',

      transcripts:
        'Transcripts',

      settings:
        'Configuração'

    };


    document.title =
      `RD4X Dashboard V10 · ${
        titles[currentPage] ||
        'Dashboard'
      }`;

  }

};


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await App.init();

  }
);
