/* ============================================================
   RD4X DASHBOARD V10 — Notifications / Toasts
   ============================================================ */
'use strict';

const Notifications = {
  root: null,

  _ensure() {
    if (!this.root) this.root = document.getElementById('toast-root');
    return this.root;
  },

  show(message, type = 'info', opts = {}) {
    const root = this._ensure();
    if (!root) return;
    const duration = opts.duration ?? 3500;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
      info: 'i-alert',
      success: 'i-check',
      warn: 'i-alert',
      error: 'i-alert'
    };
    toast.innerHTML = `
      <svg class="icon toast-icon"><use href="#${icons[type] || 'i-alert'}"/></svg>
      <div class="toast-body">${Utils.escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Fechar">
        <svg class="icon" style="width:12px;height:12px"><use href="#i-close"/></svg>
      </button>
    `;
    root.appendChild(toast);

    const remove = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 200);
    };
    toast.querySelector('.toast-close').addEventListener('click', remove);
    if (duration > 0) setTimeout(remove, duration);
    return toast;
  },

  success(msg, opts) { return this.show(msg, 'success', opts); },
  warn(msg, opts) { return this.show(msg, 'warn', opts); },
  error(msg, opts) { return this.show(msg, 'error', opts); },
  info(msg, opts) { return this.show(msg, 'info', opts); }
};

window.Notifications = Notifications;