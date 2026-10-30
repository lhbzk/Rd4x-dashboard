/* ============================================================
   RD4X DASHBOARD V10 — Modals
   ============================================================ */
'use strict';

const Modals = {
  root: null,
  stack: [],

  _ensure() {
    if (!this.root) this.root = document.getElementById('modal-root');
    return this.root;
  },

  open(options = {}) {
    const {
      title = '',
      subtitle = '',
      content = '',
      size = 'md',
      actions = [],
      onClose = null
    } = options;

    const root = this._ensure();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const sizeClass = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : '';
    backdrop.innerHTML = `
      <div class="modal ${sizeClass}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <div class="modal-title">${Utils.escapeHtml(title)}</div>
            ${subtitle ? `<div class="modal-sub">${Utils.escapeHtml(subtitle)}</div>` : ''}
          </div>
          <button class="icon-btn" data-close aria-label="Fechar">
            <svg class="icon"><use href="#i-close"/></svg>
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${actions.length ? `<div class="modal-footer"></div>` : ''}
      </div>
    `;

    const modalEl = backdrop.querySelector('.modal');
    const bodyEl = backdrop.querySelector('.modal-body');
    const footerEl = backdrop.querySelector('.modal-footer');

    if (actions.length && footerEl) {
      actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'btn ' + (a.className || 'btn-ghost');
        btn.textContent = a.label;
        btn.type = 'button';
        btn.addEventListener('click', async () => {
          if (typeof a.onClick === 'function') {
            const shouldClose = await a.onClick(backdrop, bodyEl);
            if (shouldClose !== false && a.closeOnClick !== false) {
              this.close(backdrop);
            }
          } else {
            this.close(backdrop);
          }
        });
        footerEl.appendChild(btn);
      });
    }

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close(backdrop);
    });
    backdrop.querySelector('[data-close]').addEventListener('click', () => this.close(backdrop));

    const onKey = (e) => {
      if (e.key === 'Escape' && backdrop.parentNode) {
        document.removeEventListener('keydown', onKey);
        this.close(backdrop);
      }
    };
    document.addEventListener('keydown', onKey);
    backdrop._onKey = onKey;
    backdrop._onClose = onClose;

    root.appendChild(backdrop);
    this.stack.push(backdrop);

    // Focus
    setTimeout(() => {
      const focusable = backdrop.querySelector('input, select, textarea, button');
      if (focusable) focusable.focus();
    }, 50);

    return backdrop;
  },

  close(backdrop) {
    if (!backdrop || !backdrop.parentNode) return;
    if (backdrop._onKey) document.removeEventListener('keydown', backdrop._onKey);
    if (typeof backdrop._onClose === 'function') {
      try { backdrop._onClose(); } catch (e) { /* ignore */ }
    }
    backdrop.remove();
    const i = this.stack.indexOf(backdrop);
    if (i >= 0) this.stack.splice(i, 1);
  },

  closeAll() {
    while (this.stack.length) this.close(this.stack[this.stack.length - 1]);
  },

  confirm(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmar ação',
        message = '',
        details = '',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        danger = false
      } = options;

      const content = `
        <p style="font-size:13.5px;color:var(--text-2);line-height:1.55">${Utils.escapeHtml(message)}</p>
        ${details ? `<div style="margin-top:14px;padding:12px 14px;background:var(--panel-2);border:1px solid var(--border);border-radius:8px;font-size:12.5px;color:var(--text-2);white-space:pre-line;line-height:1.6">${Utils.escapeHtml(details)}</div>` : ''}
        <div style="margin-top:14px;display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--muted)">
          <svg class="icon" style="width:14px;height:14px"><use href="#i-alert"/></svg>
          Modo de teste — nenhuma ação real será executada.
        </div>
      `;

      let resolved = false;
      const backdrop = this.open({
        title,
        content,
        actions: [
          { label: cancelText, className: 'btn-ghost', onClick: () => { resolved = true; resolve(false); } },
          { label: confirmText, className: danger ? 'btn-danger' : 'btn-primary', onClick: () => { resolved = true; resolve(true); } }
        ],
        onClose: () => { if (!resolved) resolve(false); }
      });
      return backdrop;
    });
  }
};

window.Modals = Modals;
