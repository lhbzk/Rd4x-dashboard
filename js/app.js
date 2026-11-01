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
     ESTADO DA KEY
     ============================================================ */

  keyValidated: false,

  validatingKey: false,


  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */

  async init() {

    this.setupSidebar();

    this.setupTopbar();

    this.setupRouter();

    this.setupKeyboard();

    this.setupKeyScreen();


    const authenticated =
      await this.checkDiscordSession();


    if (!authenticated) {

      return;

    }


    /*
     * Discord autenticado.
     *
     * IMPORTANTE:
     * A autenticação Discord não libera o Dashboard.
     * Primeiro mostramos a tela da Key.
     */

    this.showKeyScreen();

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

        this.keyValidated =
          false;


        this.hideKeyScreen();

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

      this.keyValidated =
        false;


      this.showAuthError(error);


      return false;

    } finally {

      this.checkingAuth =
        false;

    }

  },


  /* ============================================================
     MOSTRAR LOGIN DISCORD
     ============================================================ */

  showDiscordLogin() {

    const loginScreen =
      document.getElementById(
        'discord-login-screen'
      );


    const keyScreen =
      document.getElementById(
        'rd4x-key-screen'
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


    if (keyScreen) {

      keyScreen.hidden =
        true;

    }


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
     ESCONDER LOGIN DISCORD
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
     TELA DA KEY
     ============================================================ */

  setupKeyScreen() {

    const form =
      document.getElementById(
        'rd4x-key-form'
      );


    const input =
      document.getElementById(
        'rd4x-key-input'
      );


    if (!form || !input) {

      console.error(
        '[RD4X KEY] Elementos da tela de Key não encontrados.'
      );

      return;

    }


    if (
      form.dataset.keyBound === 'true'
    ) {

      return;

    }


    form.dataset.keyBound =
      'true';


    form.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        if (
          this.validatingKey
        ) {

          return;

        }


        const key =
          input.value.trim();


        if (!key) {

          this.showKeyError(
            'Digite sua RD4X Key.'
          );

          input.focus();

          return;

        }


        await this.validateKey(
          key
        );

      }
    );


    input.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Enter'
        ) {

          event.preventDefault();

          form.requestSubmit();

        }

      }
    );

  },


  /* ============================================================
     MOSTRAR TELA DA KEY
     ============================================================ */

  showKeyScreen() {

    const keyScreen =
      document.getElementById(
        'rd4x-key-screen'
      );


    const loginScreen =
      document.getElementById(
        'discord-login-screen'
      );


    const input =
      document.getElementById(
        'rd4x-key-input'
      );


    const userLabel =
      document.getElementById(
        'rd4x-key-user'
      );


    if (loginScreen) {

      loginScreen.hidden =
        true;

    }


    if (!keyScreen) {

      console.error(
        '[RD4X KEY] Tela de Key não encontrada.'
      );

      return;

    }


    keyScreen.hidden =
      false;


    this.showKeyLoading(
      false
    );


    this.clearKeyError();


    if (userLabel) {

      const user =
        this.currentUser;


      const name =
        user?.globalName ||
        user?.username ||
        'Usuário Discord';


      userLabel.textContent =
        `Discord: ${name}`;

    }


    if (input) {

      input.value =
        '';

      setTimeout(
        () => {

          if (
            !this.keyValidated &&
            !keyScreen.hidden
          ) {

            input.focus();

          }

        },
        50
      );

    }

  },


  /* ============================================================
     ESCONDER TELA DA KEY
     ============================================================ */

  hideKeyScreen() {

    const keyScreen =
      document.getElementById(
        'rd4x-key-screen'
      );


    if (keyScreen) {

      keyScreen.hidden =
        true;

    }

  },


  /* ============================================================
     VALIDAR KEY
     ============================================================ */

  async validateKey(
    key
  ) {

    if (
      this.validatingKey
    ) {

      return false;

    }


    if (
      !this.authenticated
    ) {

      this.showKeyError(
        'Sua sessão Discord não está autenticada.'
      );

      this.showDiscordLogin();

      return false;

    }


    this.validatingKey =
      true;


    this.showKeyError(
      ''
    );


    this.showKeyLoading(
      true
    );


    const submit =
      document.getElementById(
        'rd4x-key-submit'
      );


    const input =
      document.getElementById(
        'rd4x-key-input'
      );


    if (submit) {

      submit.disabled =
        true;

      submit.textContent =
        'Validando...';

    }


    try {

      if (
        typeof Api.validateKey !==
        'function'
      ) {

        throw new Error(
          'A função de validação da Key ainda não está disponível no api.js.'
        );

      }


      const response =
        await Api.validateKey(
          key
        );


      /*
       * Aceitamos os formatos mais comuns
       * retornados pelo endpoint.
       */

      const valid =
        response?.valid === true ||
        response?.success === true &&
        (
          response?.valid !== false
        ) ||
        response?.data?.valid === true ||
        response?.data?.success === true;


      if (!valid) {

        const message =
          response?.message ||
          response?.error ||
          response?.data?.message ||
          'Key inválida ou não autorizada.';


        throw new Error(
          message
        );

      }


      /*
       * A Key foi validada somente nesta sessão
       * desta página.
       *
       * Não salvamos a Key em localStorage,
       * sessionStorage ou cookie.
       */

      this.keyValidated =
        true;


      window.RD4X_KEY_VALIDATED =
        true;


      this.showKeyLoading(
        false
      );


      this.hideKeyScreen();


      /*
       * Agora sim o Dashboard pode ser renderizado.
       */

      this.route();


      return true;

    } catch (error) {

      console.error(
        '[RD4X KEY] Erro ao validar Key:',
        error
      );


      this.keyValidated =
        false;


      window.RD4X_KEY_VALIDATED =
        false;


      this.showKeyLoading(
        false
      );


      this.showKeyError(
        this.getKeyErrorMessage(
          error
        )
      );


      if (input) {

        input.focus();

        input.select();

      }


      return false;

    } finally {

      this.validatingKey =
        false;


      if (submit) {

        submit.disabled =
          false;

        submit.textContent =
          'Continuar';

      }

    }

  },


  /* ============================================================
     MENSAGEM DE ERRO DA KEY
     ============================================================ */

  getKeyErrorMessage(
    error
  ) {

    const message =
      String(
        error?.message ||
        ''
      ).trim();


    if (!message) {

      return 'Não foi possível validar a Key. Tente novamente.';

    }


    return message;

  },


  /* ============================================================
     ERRO DA KEY
     ============================================================ */

  showKeyError(
    message
  ) {

    const errorBox =
      document.getElementById(
        'rd4x-key-error'
      );


    if (!errorBox) {

      return;

    }


    const text =
      String(
        message ||
        ''
      ).trim();


    errorBox.textContent =
      text;


    errorBox.hidden =
      !text;

  },


  /* ============================================================
     LOADING DA KEY
     ============================================================ */

  showKeyLoading(
    loading
  ) {

    const loadingBox =
      document.getElementById(
        'rd4x-key-loading'
      );


    if (loadingBox) {

      loadingBox.hidden =
        !loading;

    }

  },


  /* ============================================================
     ERRO DE AUTENTICAÇÃO
     ============================================================ */

  showAuthError(
    error
  ) {

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


    this.hideKeyScreen();


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
        'global-search'
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
        'user-btn'
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

        /*
         * Não interceptar teclas enquanto
         * o usuário está digitando a Key.
         */

        const activeElement =
          document.activeElement;


        const isKeyInput =
          activeElement?.id ===
          'rd4x-key-input';


        if (
          isKeyInput
        ) {

          return;

        }


        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() === 'k'
        ) {

          event.preventDefault();


          const input =
            document.getElementById(
              'global-search'
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

        /*
         * Sem Discord não há Dashboard.
         */

        if (
          !this.authenticated
        ) {

          this.showDiscordLogin();

          return;

        }


        /*
         * Com Discord autenticado, mas sem Key,
         * nenhuma rota pode abrir.
         */

        if (
          !this.keyValidated
        ) {

          this.showKeyScreen();

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

    /*
     * PRIMEIRA BARREIRA:
     * Discord
     */

    if (
      !this.authenticated
    ) {

      this.showDiscordLogin();

      return;

    }


    /*
     * SEGUNDA BARREIRA:
     * RD4X Key
     */

    if (
      !this.keyValidated
    ) {

      this.showKeyScreen();

      return;

    }


    const {
      route
    } =
      this.parseHash();


    /*
     * Nunca deixar #/key virar uma página
     * do Dashboard.
     */

    if (
      route === 'key'
    ) {

      window.location.hash =
        '#/overview';

      return;

    }


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

      /*
       * Mantemos a chamada original das páginas.
       *
       * As páginas existentes continuam responsáveis
       * por obter seus dados e preencher #content.
       */

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


    document.title =
      'RD4X Dashboard V10';

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


      const keyScreen =
        document.getElementById(
          'rd4x-key-screen'
        );


      /*
       * Se o erro aconteceu antes da autenticação
       * Discord, mostramos o login.
       */

      if (
        !App.authenticated
      ) {

        if (keyScreen) {

          keyScreen.hidden =
            true;

        }


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

        return;

      }


      /*
       * Se o Discord está autenticado,
       * mostramos a tela da Key.
       */

      App.showKeyScreen();

      App.showKeyError(
        error?.message ||
        'Erro ao inicializar a autenticação da Key.'
      );

    }

  }
);
