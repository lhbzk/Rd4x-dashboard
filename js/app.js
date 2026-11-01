'use strict';


const App = {

  /* ============================================================
     PÁGINAS
     ============================================================ */

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


  /* ============================================================
     ESTADO DE AUTENTICAÇÃO
     ============================================================ */

  authChecked: false,

  authenticated: false,

  currentUser: null,

  checkingAuth: false,


  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */

  async init() {

    this.setupSidebar();

    this.setupTopbar();

    this.setupRouter();

    this.setupKeyboard();


    const authenticated =
      await this.checkDiscordSession();


    if (!authenticated) {

      return;

    }


    this.route();

  },


  /* ============================================================
     AUTENTICAÇÃO DISCORD
     ============================================================ */

  async checkDiscordSession() {

    if (this.checkingAuth) {

      return this.authenticated;

    }


    this.checkingAuth = true;


    try {

      const response =
        await Api.checkAuth();


      const authenticated =
        response?.authenticated === true ||
        (
          response?.success === true &&
          !!response?.user
        );


      if (!authenticated) {

        this.authChecked =
          true;

        this.authenticated =
          false;

        this.currentUser =
          null;


        this.showDiscordLogin();


        return false;

      }


      this.authChecked =
        true;

      this.authenticated =
        true;


      this.currentUser =
        response?.user ||
        response?.data ||
        null;


      window.RD4X_CURRENT_USER =
        this.currentUser;


      this.hideDiscordLogin();


      this.updateAuthenticatedUser();


      return true;

    } catch (error) {

      console.error(
        '[RD4X AUTH] Erro ao verificar sessão Discord:',
        error
      );


      this.authChecked =
        true;

      this.authenticated =
        false;

      this.currentUser =
        null;


      this.showAuthError(error);


      return false;

    } finally {

      this.checkingAuth =
        false;

    }

  },


  /* ============================================================
     MOSTRAR LOGIN
     ============================================================ */

  showDiscordLogin() {

    const loginScreen =
      document.getElementById(
        'discord-login-screen'
      );


    const loginButton =
      document.getElementById(
        'discord-login-btn'
      );


    const loginError =
      document.getElementById(
        'discord-login-error'
      );


    const loginLoading =
      document.getElementById(
        'discord-login-loading'
      );


    if (!loginScreen) {

      console.error(
        '[RD4X AUTH] Tela de login não encontrada no index.html.'
      );

      return;

    }


    loginScreen.hidden =
      false;


    if (loginError) {

      loginError.textContent =
        '';

      loginError.hidden =
        true;

    }


    if (loginLoading) {

      loginLoading.hidden =
        true;

    }


    if (
      loginButton &&
      loginButton.dataset.authBound !== 'true'
    ) {

      loginButton.dataset.authBound =
        'true';


      loginButton.addEventListener(
        'click',
        async () => {

          loginButton.disabled =
            true;

          loginButton.textContent =
            'Redirecionando...';


          try {

            await Api.login();

          } catch (error) {

            console.error(
              '[RD4X AUTH] Erro ao iniciar login:',
              error
            );


            loginButton.disabled =
              false;

            loginButton.textContent =
              'Entrar com Discord';


            if (loginError) {

              loginError.textContent =
                error?.message ||
                'Não foi possível iniciar o login com Discord.';

              loginError.hidden =
                false;

            }

          }

        }
      );

    }

  },


  /* ============================================================
     ESCONDER LOGIN
     ============================================================ */

  hideDiscordLogin() {

    const loginScreen =
      document.getElementById(
        'discord-login-screen'
      );


    if (loginScreen) {

      loginScreen.hidden =
        true;

    }

  },


  /* ============================================================
     ERRO DE AUTENTICAÇÃO
     ============================================================ */

  showAuthError(error) {

    const loginScreen =
      document.getElementById(
        'discord-login-screen'
      );


    const loginError =
      document.getElementById(
        'discord-login-error'
      );


    const loginLoading =
      document.getElementById(
        'discord-login-loading'
      );


    const loginButton =
      document.getElementById(
        'discord-login-btn'
      );


    if (loginScreen) {

      loginScreen.hidden =
        false;


      if (loginLoading) {

        loginLoading.hidden =
          true;

      }


      if (loginButton) {

        loginButton.disabled =
          false;

        loginButton.textContent =
          'Entrar com Discord';

      }


      if (loginError) {

        loginError.textContent =
          error?.message ||
          'Não foi possível verificar sua sessão Discord.';

        loginError.hidden =
          false;

      }


      return;

    }


    /* Fallback caso a tela não exista */

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

      <div class="empty-state">

        <div class="empty-state-icon">
          !
        </div>

        <h3>
          Erro de autenticação
        </h3>

        <p>
          ${Utils.escapeHtml(message)}
        </p>

        <button
          id="rd4x-auth-retry"
          type="button"
          class="btn btn-primary"
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


  /* ============================================================
     ATUALIZAR USUÁRIO AUTENTICADO
     ============================================================ */

  updateAuthenticatedUser() {

    const user =
      this.currentUser;


    if (!user) {

      return;

    }


    const name =
      user.globalName ||
      user.username ||
      'Administrador';


    const role =
      user.role ||
      (
        user.isOwner
          ? 'Dono'
          : 'Administrador'
      );


    const avatar =
      document.getElementById(
        'topbar-avatar'
      );


    const userName =
      document.getElementById(
        'topbar-user-name'
      );


    const userRole =
      document.getElementById(
        'topbar-user-role'
      );


    if (userName) {

      userName.textContent =
        name;

    }


    if (userRole) {

      userRole.textContent =
        role;

    }


    if (avatar) {

      if (user.avatar) {

        avatar.innerHTML = `

          <img
            src="${Utils.escapeHtml(user.avatar)}"
            alt="${Utils.escapeHtml(name)}"
          >

        `;

      } else {

        avatar.textContent =
          String(name)
            .charAt(0)
            .toUpperCase();

      }

    }

  },


  /* ============================================================
     SIDEBAR
     ============================================================ */

  setupSidebar() {

    const sidebar =
      document.getElementById(
        'sidebar'
      );


    const menuToggle =
      document.getElementById(
        'menu-toggle'
      );


    const sidebarClose =
      document.getElementById(
        'sidebar-close'
      );


    const backdrop =
      document.getElementById(
        'sidebar-backdrop'
      );


    if (
      !sidebar ||
      !menuToggle
    ) {

      return;

    }


    const openSidebar =
      () => {

        sidebar.classList.add(
          'open'
        );


        if (backdrop) {

          backdrop.classList.add(
            'open'
          );

        }

      };


    const closeSidebar =
      () => {

        sidebar.classList.remove(
          'open'
        );


        if (backdrop) {

          backdrop.classList.remove(
            'open'
          );

        }

      };


    menuToggle.addEventListener(
      'click',
      openSidebar
    );


    if (sidebarClose) {

      sidebarClose.addEventListener(
        'click',
        closeSidebar
      );

    }


    if (backdrop) {

      backdrop.addEventListener(
        'click',
        closeSidebar
      );

    }


    document
      .querySelectorAll(
        '.nav-item'
      )
      .forEach(
        item => {

          item.addEventListener(
            'click',
            () => {

              closeSidebar();

            }
          );

        }
      );

  },


  /* ============================================================
     TOPBAR
     ============================================================ */

  setupTopbar() {

    const searchInput =
      document.getElementById(
        'global-search-input'
      );


    if (searchInput) {

      searchInput.addEventListener(
        'keydown',
        event => {

          if (
            event.key === 'Enter'
          ) {

            const value =
              searchInput.value
                .trim();


            if (!value) {

              return;

            }


            window.location.hash =
              `#/search?q=${encodeURIComponent(value)}`;

          }

        }
      );

    }


    const topbarUser =
      document.getElementById(
        'topbar-user'
      );


    if (topbarUser) {

      topbarUser.addEventListener(
        'click',
        () => {

          if (
            typeof window.openUserMenu ===
            'function'
          ) {

            window.openUserMenu(
              this.currentUser
            );

          }

        }
      );

    }

  },


  /* ============================================================
     TECLADO
     ============================================================ */

  setupKeyboard() {

    document.addEventListener(
      'keydown',
      event => {

        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() === 'k'
        ) {

          event.preventDefault();


          const input =
            document.getElementById(
              'global-search-input'
            );


          if (input) {

            input.focus();

          }

        }


        if (
          event.key === 'Escape'
        ) {

          const sidebar =
            document.getElementById(
              'sidebar'
            );


          const backdrop =
            document.getElementById(
              'sidebar-backdrop'
            );


          if (sidebar) {

            sidebar.classList.remove(
              'open'
            );

          }


          if (backdrop) {

            backdrop.classList.remove(
              'open'
            );

          }

        }

      }
    );

  },


  /* ============================================================
     ROUTER
     ============================================================ */

  setupRouter() {

    window.addEventListener(
      'hashchange',
      () => {

        if (
          !this.authenticated
        ) {

          return;

        }


        this.route();

      }
    );

  },


  /* ============================================================
     PARSER DA HASH
     ============================================================ */

  parseHash() {

    const hash =
      window.location.hash ||
      '#/overview';


    const clean =
      hash.replace(
        /^#\/?/,
        ''
      );


    const parts =
      clean.split('?');


    const route =
      parts[0] ||
      'overview';


    const query =
      new URLSearchParams(
        parts[1] || ''
      );


    return {
      route,
      query
    };

  },


  /* ============================================================
     ROTA
     ============================================================ */

  route() {

    if (
      !this.authenticated
    ) {

      this.showDiscordLogin();

      return;

    }


    const {
      route
    } =
      this.parseHash();


    const page =
      this.pages[route] ||
      this.pages.overview;


    this.updateNavigation(
      route
    );


    this.updatePageTitle(
      route
    );


    if (
      typeof page !==
      'function'
    ) {

      console.error(
        `[RD4X] Página "${route}" não encontrada.`
      );

      return;

    }


    try {

      page();

    } catch (error) {

      console.error(
        `[RD4X] Erro ao renderizar página "${route}":`,
        error
      );


      const content =
        document.getElementById(
          'content'
        );


      if (content) {

        content.innerHTML = `

          <div class="empty-state">

            <div class="empty-state-icon">
              !
            </div>

            <h3>
              Erro ao carregar página
            </h3>

            <p>
              ${Utils.escapeHtml(
                error?.message ||
                'Erro desconhecido.'
              )}
            </p>

          </div>

        `;

      }

    }

  },


  /* ============================================================
     NAVEGAÇÃO
     ============================================================ */

  updateNavigation(
    currentRoute
  ) {

    document
      .querySelectorAll(
        '.nav-item'
      )
      .forEach(
        item => {

          const route =
            item.dataset.route;


          item.classList.toggle(
            'active',
            route === currentRoute
          );

        }
      );

  },


  /* ============================================================
     TÍTULO DA PÁGINA
     ============================================================ */

  updatePageTitle(
    route
  ) {

    const titles = {

      overview:
        'Visão geral',

      search:
        'Pesquisa',

      users:
        'Usuários',

      tickets:
        'Tickets',

      releases:
        'Releases',

      audit:
        'Auditoria',

      incidents:
        'Incidentes',

      stats:
        'Estatísticas',

      transcripts:
        'Transcrições',

      settings:
        'Configurações'

    };


    const pageTitle =
      document.getElementById(
        'page-title'
      );


    if (pageTitle) {

      pageTitle.textContent =
        titles[route] ||
        'Visão geral';

    }

    if (
      document.title !==
      `RD4X Dashboard V10`
    ) {

      document.title =
        `RD4X Dashboard V10`;

    }

  }

};


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    try {

      await App.init();

    } catch (error) {

      console.error(
        '[RD4X APP] Erro fatal ao inicializar o dashboard:',
        error
      );


      const loginScreen =
        document.getElementById(
          'discord-login-screen'
        );


      const loginError =
        document.getElementById(
          'discord-login-error'
        );


      if (loginScreen) {

        loginScreen.hidden =
          false;

      }


      if (loginError) {

        loginError.textContent =
          error?.message ||
          'Erro ao inicializar o dashboard.';

        loginError.hidden =
          false;

      }

    }

  }
);
