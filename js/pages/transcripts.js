/* ============================================================
RD4X DASHBOARD V10 — Transcripts Page
============================================================ */

'use strict';

window.renderTranscripts = async function(el) {

el.innerHTML = `
<div class="page-header">
<div>
<h1 class="page-title">Transcripts</h1>
<p class="page-desc">Histórico completo de conversas de tickets</p>
</div>
</div>

<div class="table-wrap">

  <div class="table-toolbar">
    <input
      type="text"
      class="input search-input"
      id="tr-search"
      placeholder="Buscar transcript, ticket, usuário, mensagem..."
    >

    <div
      class="ml-auto text-muted"
      style="font-size:12px"
      id="tr-count"
    ></div>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Ticket</th>
          <th>Usuário</th>
          <th>Administrador</th>
          <th>Data</th>
          <th>Mensagens</th>
        </tr>
      </thead>

      <tbody id="tr-tbody"></tbody>
    </table>
  </div>

</div>

`;

try {

const response = await Api.getTranscripts();

let transcripts = [];

if (Array.isArray(response)) {

  transcripts = response;

} else if (
  response &&
  Array.isArray(response.data)
) {

  transcripts = response.data;

}

transcripts = transcripts.map((transcript, index) => {

  const messages =
    Array.isArray(transcript.messages)
      ? transcript.messages
      : [];

  return {
    id:
      transcript.id ||
      `transcript-${index + 1}`,

    ticketId:
      transcript.ticketId ||
      transcript.ticket ||
      '—',

    userId:
      transcript.userId ||
      transcript.discordId ||
      '',

    user:
      transcript.user ||
      transcript.username ||
      transcript.discord ||
      '',

    admin:
      transcript.admin ||
      transcript.administrator ||
      '—',

    createdAt:
      transcript.createdAt ||
      transcript.date ||
      transcript.created ||
      null,

    messages: messages.map((message, messageIndex) => ({
      id:
        message.id ||
        `${transcript.id || index}-${messageIndex}`,

      author:
        message.author ||
        message.username ||
        'Usuário',

      userId:
        message.userId ||
        '',

      role:
        message.role ||
        (
          message.isStaff
            ? 'staff'
            : 'user'
        ),

      text:
        message.text ||
        message.content ||
        '',

      time:
        message.time ||
        message.createdAt ||
        transcript.createdAt ||
        null
    }))
  };

});

const state = {
  query: ''
};

const getUser = transcript => {

  if (!transcript) return null;

  if (
    transcript.user &&
    typeof transcript.user === 'string'
  ) {
    return transcript.user;
  }

  if (
    typeof MockData !== 'undefined' &&
    Array.isArray(MockData.users)
  ) {

    const user = MockData.users.find(
      x =>
        x.id === transcript.userId ||
        x.discordId === transcript.userId
    );

    if (user) {

      return (
        user.discord ||
        user.username ||
        user.name ||
        user.id ||
        '—'
      );

    }

  }

  return '—';
};

const draw = () => {

  const query =
    state.query
      .trim()
      .toLowerCase();

  const filtered =
    transcripts.filter(transcript => {

      if (!query) return true;

      const user =
        getUser(transcript);

      const messageText =
        transcript.messages
          .map(message => message.text || '')
          .join(' ');

      const searchable = [
        transcript.id,
        transcript.ticketId,
        transcript.userId,
        transcript.user,
        user,
        transcript.admin,
        transcript.createdAt,
        messageText
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);

    });

  const tbody =
    el.querySelector('#tr-tbody');

  if (!tbody) return;

  if (!filtered.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">

            <svg class="icon">
              <use href="#i-transcript"/>
            </svg>

            <div>
              ${
                transcripts.length
                  ? 'Nenhum transcript encontrado'
                  : 'Nenhum transcript disponível'
              }
            </div>

          </div>
        </td>
      </tr>
    `;

  } else {

    tbody.innerHTML =
      filtered.map(transcript => {

        const user =
          getUser(transcript);

        return `
          <tr
            class="clickable"
            data-tr-id="${Utils.escapeHtml(
              String(transcript.id)
            )}"
          >

            <td class="cell-strong cell-mono">
              ${Utils.escapeHtml(
                String(transcript.id)
              )}
            </td>

            <td class="cell-mono">
              ${Utils.escapeHtml(
                String(transcript.ticketId)
              )}
            </td>

            <td>
              ${Utils.escapeHtml(
                String(user || '—')
              )}
            </td>

            <td class="cell-mono">
              ${Utils.escapeHtml(
                String(transcript.admin || '—')
              )}
            </td>

            <td>
              ${
                transcript.createdAt
                  ? Utils.formatDate(
                      transcript.createdAt
                    )
                  : '—'
              }
            </td>

            <td>
              ${transcript.messages.length}
            </td>

          </tr>
        `;

      }).join('');
  }

  const count =
    el.querySelector('#tr-count');

  if (count) {
    count.textContent =
      `${filtered.length} transcript(s)`;
  }

  tbody
    .querySelectorAll(
      'tr[data-tr-id]'
    )
    .forEach(row => {

      row.addEventListener(
        'click',
        () => {

          const transcript =
            transcripts.find(
              item =>
                String(item.id) ===
                String(row.dataset.trId)
            );

          if (transcript) {
            openTranscriptModal(
              transcript
            );
          }

        }
      );

    });

};

const search =
  el.querySelector('#tr-search');

if (search) {

  search.addEventListener(
    'input',
    Utils.debounce(
      event => {

        state.query =
          event.target.value
            .trim()
            .toLowerCase();

        draw();

      },
      200
    )
  );

}

draw();

} catch (error) {

console.error(
  '[TRANSCRIPTS]',
  error
);

const tbody =
  el.querySelector('#tr-tbody');

if (tbody) {

  tbody.innerHTML = `
    <tr>
      <td colspan="6">

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
            Erro ao carregar transcripts
          </div>

          <div>
            ${Utils.escapeHtml(
              error?.message ||
              'Não foi possível carregar os transcripts.'
            )}
          </div>

        </div>

      </td>
    </tr>
  `;

}

const count =
  el.querySelector('#tr-count');

if (count) {
  count.textContent = 'Erro';
}

if (
  typeof Notifications !== 'undefined' &&
  typeof Notifications.error === 'function'
) {

  Notifications.error(
    'Não foi possível carregar os transcripts.'
  );

}

}

};

/* ============================================================
MODAL DO TRANSCRIPT
============================================================ */

window.openTranscriptModal = function(transcript) {

if (!transcript) return;

let user =
transcript.user || '';

if (
!user &&
typeof MockData !== 'undefined' &&
Array.isArray(MockData.users)
) {

const found =
  MockData.users.find(
    x =>
      x.id === transcript.userId ||
      x.discordId === transcript.userId
  );

if (found) {

  user =
    found.discord ||
    found.username ||
    found.name ||
    found.id ||
    '';

}

}

const messages =
Array.isArray(transcript.messages)
? transcript.messages
: [];

const renderMsgs = query => {

const q =
  String(query || '').trim();

const normalizedQuery =
  q.toLowerCase();

const visibleMessages =
  normalizedQuery
    ? messages.filter(
        message =>
          String(
            message.text || ''
          )
            .toLowerCase()
            .includes(normalizedQuery)
      )
    : messages;

if (!visibleMessages.length) {

  return `
    <div class="empty-state">

      <svg class="icon">
        <use href="#i-transcript"/>
      </svg>

      <div>
        ${
          messages.length
            ? 'Nenhuma mensagem encontrada'
            : 'Este transcript não possui mensagens'
        }
      </div>

    </div>
  `;

}

return visibleMessages
  .map(message => {

    const author =
      message.author ||
      'Usuário';

    const text =
      message.text ||
      '';

    const role =
      message.role ||
      'user';

    const isStaff =
      role === 'staff' ||
      role === 'admin' ||
      role === 'administrator';

    const avatarColor =
      Utils.colorForString(author);

    const initials =
      Utils.initials(author);

    const highlighted =
      q
        ? Utils.highlight(
            text,
            q
          )
        : Utils.escapeHtml(text);

    return `
      <div class="chat-msg">

        <div
          class="chat-avatar"
          style="background:${avatarColor}"
        >
          ${Utils.escapeHtml(initials)}
        </div>

        <div class="chat-body">

          <div class="chat-head">

            <span class="chat-author">
              ${Utils.escapeHtml(author)}
            </span>

            ${
              isStaff
                ? `
                  <span
                    class="badge info"
                    style="
                      padding:1px 6px;
                      font-size:10px
                    "
                  >
                    STAFF
                  </span>
                `
                : ''
            }

            <span class="chat-time">
              ${
                message.time
                  ? Utils.formatDate(
                      message.time
                    )
                  : '—'
              }
            </span>

          </div>

          <div class="chat-text">
            ${highlighted}
          </div>

        </div>

      </div>
    `;

  })
  .join('');

};

const modal =
Modals.open({

  title: 'Transcript',

  subtitle:
    `${transcript.id || '—'} · ${
      transcript.ticketId || '—'
    }`,

  size: 'lg',

  content: `

    <div class="field-grid mb-16">

      <div class="field">
        <div class="field-label">Ticket</div>
        <div class="field-value mono">
          ${Utils.escapeHtml(
            String(
              transcript.ticketId || '—'
            )
          )}
        </div>
      </div>

      <div class="field">
        <div class="field-label">Usuário</div>
        <div class="field-value">
          ${Utils.escapeHtml(
            String(user || '—')
          )}
        </div>
      </div>

      <div class="field">
        <div class="field-label">Administrador</div>
        <div class="field-value mono">
          ${Utils.escapeHtml(
            String(
              transcript.admin || '—'
            )
          )}
        </div>
      </div>

      <div class="field">
        <div class="field-label">Data</div>
        <div class="field-value">
          ${
            transcript.createdAt
              ? Utils.formatDate(
                  transcript.createdAt
                )
              : '—'
          }
        </div>
      </div>

      <div class="field">
        <div class="field-label">Mensagens</div>
        <div class="field-value">
          ${messages.length}
        </div>
      </div>

    </div>

    <input
      type="text"
      class="input mb-12"
      id="tr-inner-search"
      placeholder="Pesquisar dentro do transcript (ex: pagamento, erro, senha)..."
    >

    <div
      class="chat-list"
      id="tr-chat"
    >
      ${renderMsgs('')}
    </div>

  `,

  actions: [
    {
      label: 'Fechar',
      className: 'btn-primary'
    }
  ]

});

if (!modal) return;

const input =
modal.querySelector(
'#tr-inner-search'
);

const chat =
modal.querySelector(
'#tr-chat'
);

if (!input || !chat) return;

input.addEventListener(
'input',
Utils.debounce(
event => {

    const query =
      event.target.value.trim();

    chat.innerHTML =
      renderMsgs(query);

  },
  150
)

);

};
