/* ============================================================
   RD4X DASHBOARD V10 — Utils
   ============================================================ */
'use strict';

const Utils = {
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  formatDate(iso, opts = {}) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const pad = n => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    if (opts.dateOnly) return `${day}/${month}/${year}`;
    if (opts.timeOnly) return `${hours}:${mins}`;
    return `${day}/${month}/${year} ${hours}:${mins}`;
  },

  relativeTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso).getTime();
    if (isNaN(d)) return '—';
    const diff = Date.now() - d;
    const abs = Math.abs(diff);
    const min = 60 * 1000;
    const hour = 60 * min;
    const day = 24 * hour;
    if (abs < min) return 'agora';
    if (abs < hour) {
      const m = Math.floor(abs / min);
      return diff > 0 ? `há ${m}min` : `em ${m}min`;
    }
    if (abs < day) {
      const h = Math.floor(abs / hour);
      return diff > 0 ? `há ${h}h` : `em ${h}h`;
    }
    const dd = Math.floor(abs / day);
    if (dd < 30) return diff > 0 ? `há ${dd}d` : `em ${dd}d`;
    return Utils.formatDate(iso, { dateOnly: true });
  },

  initials(name) {
    if (!name) return '?';
    const clean = String(name).replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  },

  colorForString(str) {
    const palette = ['#5b8cff','#8b5cf6','#22c55e','#f59e0b','#ef4444','#38bdf8','#ec4899','#14b8a6'];
    let hash = 0;
    const s = String(str || 'x');
    for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
  },

  debounce(fn, wait = 250) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  },

  highlight(text, query) {
    const safe = Utils.escapeHtml(text);
    if (!query) return safe;
    const q = String(query).trim();
    if (!q) return safe;
    const re = new RegExp('(' + Utils.escapeRegex(q) + ')', 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  },

  statusBadge(status) {
    const map = {
      'Ativo': 'atl', 'Ativa': 'atl',
      'Expirado': 'exp', 'Expirada': 'exp',
      'Blacklisted': 'bl', 'Suspenso': 'sus',
      'Sem licença': 'nol', 'Revogada': 'bl',
      'Aberto': 'info', 'Em atendimento': 'exp', 'Aguardando usuário': 'sus',
      'Resolvido': 'atl', 'Fechado': 'nol',
      'Investigando': 'exp',
      'Baixa': 'nol', 'Normal': 'info', 'Média': 'info',
      'Alta': 'exp', 'Urgente': 'bl', 'Crítica': 'bl',
      'Sucesso': 'atl', 'Falha': 'bl'
    };
    const cls = map[status] || 'nol';
    return `<span class="badge ${cls}">${Utils.escapeHtml(status)}</span>`;
  },

  priorityBadge(p) {
    const map = { 'Baixa': 'nol', 'Normal': 'info', 'Alta': 'exp', 'Urgente': 'bl' };
    return `<span class="badge ${map[p] || 'nol'}">${Utils.escapeHtml(p)}</span>`;
  },

  severityBadge(s) {
    const map = { 'Baixa': 'nol', 'Média': 'info', 'Alta': 'exp', 'Crítica': 'bl' };
    return `<span class="badge ${map[s] || 'nol'}">${Utils.escapeHtml(s)}</span>`;
  },

  qs(sel, root = document) { return root.querySelector(sel); },
  qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },

  on(el, evt, sel, fn) {
    el.addEventListener(evt, e => {
      const target = e.target.closest(sel);
      if (target && el.contains(target)) fn(e, target);
    });
  }
};

window.Utils = Utils;