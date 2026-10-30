/* ============================================================
   RD4X DASHBOARD V10
   App Router & Shell
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
      .forEach(item => {
        item.addEventListener(
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
            event.key !== 'Enter'
          ) {
            return;
          }

          const query =
            searchInput.value.trim();

          if (query) {
            window.location.hash =
              `#/search?q=${
                encodeURIComponent(
                  query
                )
              }`;

            searchInput.value = '';

          } else {
            window.location.hash =
              '#/search';
          }
        }
      );
    }

    const userButton =
      document.getElementById(
        'user-btn'
      );

    if (userButton) {
      userButton.addEventListener(
        'click',
        () => {
          Notifications.info(
            'Perfil administrativo — autenticação será integrada futuramente.'
          );
        }
      );
    }
  },

  setupKeyboard() {
    document.addEventListener(
      'keydown',
      event => {
        const active =
          document.activeElement;

        const tag =
          active?.tagName;

        if (
          event.key === '/' &&
          ![
            'INPUT',
            'TEXTAREA',
            'SELECT'
          ].includes(tag)
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

  updateActiveNavigation(
    currentPage
  ) {
    document
      .querySelectorAll('.nav-item')
      .forEach(item => {
        item.classList.toggle(
          'active',
          item.dataset.route ===
            currentPage
        );
      });
  },

  async route() {
    const {
      page,
      params
    } = this.parseHash();

    const content =
      document.getElementById(
        'content'
      );

    if (!content) {
      return;
    }

    const knownPages = [
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
      knownPages.includes(page)
        ? page
        : 'overview';

    this.updateActiveNavigation(
      currentPage
    );

    content.scrollTop = 0;

    try {
      const pageRenderer =
        this.pages[currentPage];

      if (
        typeof pageRenderer ===
        'function'
      ) {
        await pageRenderer(
          content,
          params
        );

      } else {
        content.innerHTML = `
          <div class="empty-state">
            Página não encontrada.
          </div>
        `;
      }

    } catch (error) {
      console.error(
        '[APP ROUTER]',
        error
      );

      const message =
        error?.message ||
        'Erro desconhecido';

      content.innerHTML = `
        <div class="empty-state">

          <svg class="icon">
            <use href="#i-alert"></use>
          </svg>

          <div
            style="
              font-size:15px;
              font-weight:600;
              color:var(--danger);
              margin-bottom:4px;
            "
          >
            Erro ao carregar página
          </div>

          <div>
            ${
              window.Utils?.escapeHtml
                ? Utils.escapeHtml(
                    message
                  )
                : message
            }
          </div>

        </div>
      `;

      if (
        window.Notifications &&
        typeof Notifications.error ===
          'function'
      ) {
        Notifications.error(
          'Erro ao carregar a página.'
        );
      }
    }

    document.title =
      `RD4X Dashboard V10 · ${
        currentPage
          .charAt(0)
          .toUpperCase() +
        currentPage.slice(1)
      }`;
  }
};

document.addEventListener(
  'DOMContentLoaded',
  () => {
    App.init();

    if (
      window.Notifications &&
      typeof Notifications.info ===
        'function'
    ) {
      Notifications.info(
        'Dashboard conectado à API RD4X.'
      );
    }
  }
);
