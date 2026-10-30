/* ============================================================
   RD4X DASHBOARD V10 — App Router & Shell
   ============================================================ */
'use strict';

const App = {
  pages: {
    overview: window.renderOverview,
    search: window.renderSearch,
    users: window.renderUsers,
    tickets: window.renderTickets,
    releases: window.renderReleases,
    incidents: window.renderIncidents,
    audit: window.renderAudit,
    transcripts: window.renderTranscripts,
    settings: window.renderSettings
  },

  init() {
    this.setupSidebar();
    this.setupTopbar();
    this.setupRouter();
    this.setupKeyboard();
    this.route();
  },

  setupSidebar() {
    const sidebar =
      document.getElementById('sidebar');

    const backdrop =
      document.getElementById('sidebar-backdrop');

    const btn =
      document.getElementById('menu-toggle');

    const close = () => {
      if (sidebar) {
        sidebar.classList.remove('open');
      }

      if (backdrop) {
        backdrop.classList.remove('open');
      }
    };

    if (btn) {
      btn.addEventListener('click', () => {
        if (sidebar) {
          sidebar.classList.toggle('open');
        }

        if (backdrop) {
          backdrop.classList.toggle('open');
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    document.querySelectorAll('.nav-item')
      .forEach(a => {
        a.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
            close();
          }
        });
      });
  },

  setupTopbar() {
    const searchInput =
      document.getElementById('global-search');

    if (searchInput) {
      searchInput.addEventListener(
        'keydown',
        e => {
          if (e.key !== 'Enter') return;

          const q =
            searchInput.value.trim();

          if (q) {
            window.location.hash =
              `#/search?q=${encodeURIComponent(q)}`;

            searchInput.value = '';
          } else {
            window.location.hash = '#/search';
          }
        }
      );
    }

    const userBtn =
      document.getElementById('user-btn');

    if (userBtn) {
      userBtn.addEventListener('click', () => {
        Notifications.info(
          'Perfil administrativo — autenticação será integrada futuramente.'
        );
      });
    }
  },

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
            document.getElementById('global-search');

          if (input) {
            input.focus();
          }
        }
      }
    );
  },

  setupRouter() {
    window.addEventListener(
      'hashchange',
      () => this.route()
    );
  },

  parseHash() {
    const raw =
      window.location.hash
        .replace(/^#\/?/, '');

    const [
      pathPart,
      queryPart
    ] = raw.split('?');

    const page =
      (pathPart || 'overview')
        .split('/')[0] ||
      'overview';

    const params = {};

    if (queryPart) {
      new URLSearchParams(
        queryPart
      ).forEach((value, key) => {
        params[key] = value;
      });
    }

    return {
      page,
      params
    };
  },

  async route() {
    const {
      page,
      params
    } = this.parseHash();

    const content =
      document.getElementById('content');

    if (!content) return;

    const known = [
      'overview',
      'search',
      'users',
      'tickets',
      'releases',
      'incidents',
      'audit',
      'transcripts',
      'settings'
    ];

    const currentPage =
      known.includes(page)
        ? page
        : 'overview';

    document.querySelectorAll('.nav-item')
      .forEach(a => {
        a.classList.toggle(
          'active',
          a.dataset.route === currentPage
        );
      });

    content.scrollTop = 0;

    try {
      const fn =
        this.pages[currentPage];

      if (typeof fn === 'function') {
        await fn(content, params);
      } else {
        content.innerHTML = `
          <div class="empty-state">
            Página não encontrada.
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

    document.title =
      `RD4X Dashboard V10 · ${
        currentPage.charAt(0).toUpperCase() +
        currentPage.slice(1)
      }`;
  }
};

document.addEventListener(
  'DOMContentLoaded',
  () => {
    App.init();

    Notifications.info(
      'Dashboard conectado à API RD4X.'
    );
  }
);
