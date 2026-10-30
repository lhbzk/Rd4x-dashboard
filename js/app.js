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
     INIT
     ========================================================== */

  init() {

    this.setupSidebar();

    this.setupTopbar();

    this.setupRouter();

    this.setupKeyboard();

    this.route();

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

          Notifications.info(
            'Perfil administrativo — autenticação será integrada futuramente.'
          );

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
      () => this.route()
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
  () => {

    App.init();


    Notifications.info(
      'Dashboard conectado à API RD4X.'
    );

  }
);
