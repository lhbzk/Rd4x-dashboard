/* ============================================================
   RD4X DASHBOARD V10 — Mock Data
   Dados fictícios para MOCK MODE.
   ============================================================ */
'use strict';

const MockData = {
  users: [
    { id:'u1', discord:'lucasplays', discordId:'432871556123456789', roblox:'LucasGames2024', robloxId:'4200878493', status:'Ativo', hwid:'HWID-A1B2C3D4-5E6F', createdAt:'2025-03-14T10:23:00Z', lastActivity:'2026-10-30T09:15:00Z', releases:4, tickets:2, blacklisted:false, blacklistReason:null, avatarSeed:'lucas' },
    { id:'u2', discord:'maria.x', discordId:'528994321098765432', roblox:'MariaBuilds', robloxId:'8821944621', status:'Ativo', hwid:'HWID-7F3E9B21-9A0C', createdAt:'2025-05-02T14:10:00Z', lastActivity:'2026-10-30T07:40:00Z', releases:6, tickets:1, blacklisted:false, blacklistReason:null, avatarSeed:'maria' },
    { id:'u3', discord:'pedrinho', discordId:'391122334455667788', roblox:'PedroExploits', robloxId:'1172930456', status:'Expirado', hwid:'HWID-D4C5B6A7-8F9E', createdAt:'2024-11-20T08:00:00Z', lastActivity:'2026-09-22T19:30:00Z', releases:2, tickets:3, blacklisted:false, blacklistReason:null, avatarSeed:'pedro' },
    { id:'u4', discord:'anavip', discordId:'667788990011223344', roblox:'AnaLegend', robloxId:'3300112233', status:'Ativo', hwid:'HWID-9E8D7C6B-5A4F', createdAt:'2025-08-09T11:45:00Z', lastActivity:'2026-10-29T22:10:00Z', releases:8, tickets:0, blacklisted:false, blacklistReason:null, avatarSeed:'ana' },
    { id:'u5', discord:'gabs', discordId:'778899001122334455', roblox:'GabrielSniper', robloxId:'9922334455', status:'Blacklisted', hwid:'HWID-B3A2C1D0-9F8E', createdAt:'2024-07-15T16:20:00Z', lastActivity:'2026-08-01T12:00:00Z', releases:1, tickets:5, blacklisted:true, blacklistReason:'Compartilhamento de HWID com múltiplas contas', avatarSeed:'gabs' },
    { id:'u6', discord:'julia', discordId:'112233445566778899', roblox:'JuliaPro', robloxId:'4455667788', status:'Suspenso', hwid:'HWID-C2D3E4F5-6A7B', createdAt:'2025-01-08T09:30:00Z', lastActivity:'2026-10-15T17:50:00Z', releases:3, tickets:2, blacklisted:false, blacklistReason:null, avatarSeed:'julia' },
    { id:'u7', discord:'rafa', discordId:'223344556677889900', roblox:'RafaelKing', robloxId:'5566778899', status:'Ativo', hwid:'HWID-1A2B3C4D-5E6F', createdAt:'2025-09-22T13:00:00Z', lastActivity:'2026-10-30T06:20:00Z', releases:5, tickets:1, blacklisted:false, blacklistReason:null, avatarSeed:'rafa' },
    { id:'u8', discord:'bea', discordId:'334455667788990011', roblox:'BeatrizMoon', robloxId:'6677889900', status:'Sem licença', hwid:null, createdAt:'2025-12-05T20:15:00Z', lastActivity:'2026-10-28T11:35:00Z', releases:0, tickets:1, blacklisted:false, blacklistReason:null, avatarSeed:'bea' },
    { id:'u9', discord:'thi', discordId:'445566778899001122', roblox:'ThiagoFF', robloxId:'7788990011', status:'Ativo', hwid:'HWID-F5E6D7C8-9B0A', createdAt:'2025-06-18T15:40:00Z', lastActivity:'2026-10-30T08:05:00Z', releases:7, tickets:0, blacklisted:false, blacklistReason:null, avatarSeed:'thi' },
    { id:'u10', discord:'lari', discordId:'556677889900112233', roblox:'LarissaX', robloxId:'8899001122', status:'Ativo', hwid:'HWID-2C3D4E5F-6G7H', createdAt:'2026-02-14T19:00:00Z', lastActivity:'2026-10-29T15:55:00Z', releases:2, tickets:1, blacklisted:false, blacklistReason:null, avatarSeed:'lari' }
  ],

  tickets: [
    { id:'ticket-1042', userId:'u1', category:'Liberação', priority:'Alta', assignee:'admin.alice', status:'Aberto', createdAt:'2026-10-30T08:40:00Z', updatedAt:'2026-10-30T09:20:00Z',
      messages:[
        { author:'lucasplays', authorId:'432871556123456789', time:'2026-10-30T08:40:00Z', text:'Olá, comprei a licença ontem mas não consigo liberar. Já reiniciei o PC.', role:'user' },
        { author:'admin.alice', authorId:'900000000000000001', time:'2026-10-30T09:05:00Z', text:'Olá Lucas! Vou verificar seu HWID agora.', role:'staff' },
        { author:'admin.alice', authorId:'900000000000000001', time:'2026-10-30T09:20:00Z', text:'Seu HWID está correto. Pode tentar novamente por favor?', role:'staff' }
      ]},
    { id:'ticket-1041', userId:'u3', category:'Renovação', priority:'Normal', assignee:'admin.bob', status:'Em atendimento', createdAt:'2026-10-29T16:15:00Z', updatedAt:'2026-10-30T07:00:00Z',
      messages:[
        { author:'pedrinho', authorId:'391122334455667788', time:'2026-10-29T16:15:00Z', text:'Minha licença expirou, como renovo?', role:'user' },
        { author:'admin.bob', authorId:'900000000000000002', time:'2026-10-29T17:00:00Z', text:'Você pode renovar pelo painel ou pelo link de checkout. Quer que eu envie?', role:'staff' }
      ]},
    { id:'ticket-1040', userId:'u5', category:'Blacklist', priority:'Urgente', assignee:'admin.alice', status:'Aguardando usuário', createdAt:'2026-10-28T11:00:00Z', updatedAt:'2026-10-29T10:30:00Z',
      messages:[
        { author:'gabs', authorId:'778899001122334455', time:'2026-10-28T11:00:00Z', text:'Fui colocado na blacklist injustamente. Preciso de ajuda.', role:'user' },
        { author:'admin.alice', authorId:'900000000000000001', time:'2026-10-28T11:20:00Z', text:'Identificamos uso de HWID compartilhado. Envie prova de que é sua conta principal.', role:'staff' },
        { author:'gabs', authorId:'778899001122334455', time:'2026-10-29T10:30:00Z', text:'Enviando screenshot agora.', role:'user' }
      ]},
    { id:'ticket-1039', userId:'u2', category:'Bug', priority:'Normal', assignee:'admin.carol', status:'Resolvido', createdAt:'2026-10-27T19:45:00Z', updatedAt:'2026-10-28T14:20:00Z',
      messages:[
        { author:'maria.x', authorId:'528994321098765432', time:'2026-10-27T19:45:00Z', text:'O script não carrega em mobile. Mostra erro de execução.', role:'user' },
        { author:'admin.carol', authorId:'900000000000000003', time:'2026-10-28T14:20:00Z', text:'Corrigido! Atualize a versão e teste novamente.', role:'staff' }
      ]},
    { id:'ticket-1038', userId:'u4', category:'Suporte', priority:'Baixa', assignee:'admin.bob', status:'Fechado', createdAt:'2026-10-25T08:00:00Z', updatedAt:'2026-10-26T09:30:00Z',
      messages:[
        { author:'anavip', authorId:'667788990011223344', time:'2026-10-25T08:00:00Z', text:'Só uma dúvida: como faço para trocar de HWID?', role:'user' },
        { author:'admin.bob', authorId:'900000000000000002', time:'2026-10-25T08:30:00Z', text:'Você pode abrir um ticket pedindo reset com motivo.', role:'staff' }
      ]},
    { id:'ticket-1037', userId:'u6', category:'Suspensão', priority:'Alta', assignee:'admin.alice', status:'Aberto', createdAt:'2026-10-30T05:10:00Z', updatedAt:'2026-10-30T05:20:00Z',
      messages:[
        { author:'julia', authorId:'112233445566778899', time:'2026-10-30T05:10:00Z', text:'Por que fui suspensa? Não fiz nada errado.', role:'user' }
      ]},
    { id:'ticket-1036', userId:'u9', category:'Liberação', priority:'Normal', assignee:'admin.carol', status:'Resolvido', createdAt:'2026-10-24T14:00:00Z', updatedAt:'2026-10-24T16:45:00Z',
      messages:[
        { author:'thi', authorId:'445566778899001122', time:'2026-10-24T14:00:00Z', text:'Licença não está ativando. Já reabri o app.', role:'user' },
        { author:'admin.carol', authorId:'900000000000000003', time:'2026-10-24T16:45:00Z', text:'Resetamos seu HWID. Tente novamente.', role:'staff' }
      ]}
  ],

  releases: [
    { id:'release-2001', userId:'u1', admin:'admin.alice', createdAt:'2026-10-30T08:55:00Z', status:'Ativa', hwid:'HWID-A1B2C3D4-5E6F' },
    { id:'release-2002', userId:'u2', admin:'admin.alice', createdAt:'2026-10-30T08:30:00Z', status:'Ativa', hwid:'HWID-7F3E9B21-9A0C' },
    { id:'release-2003', userId:'u4', admin:'admin.bob', createdAt:'2026-10-30T07:15:00Z', status:'Ativa', hwid:'HWID-9E8D7C6B-5A4F' },
    { id:'release-2004', userId:'u9', admin:'admin.carol', createdAt:'2026-10-29T22:40:00Z', status:'Ativa', hwid:'HWID-F5E6D7C8-9B0A' },
    { id:'release-2005', userId:'u7', admin:'admin.bob', createdAt:'2026-10-29T20:20:00Z', status:'Revogada', hwid:'HWID-1A2B3C4D-5E6F' },
    { id:'release-2006', userId:'u1', admin:'admin.alice', createdAt:'2026-10-29T18:05:00Z', status:'Ativa', hwid:'HWID-A1B2C3D4-5E6F' },
    { id:'release-2007', userId:'u3', admin:'admin.alice', createdAt:'2026-10-20T10:00:00Z', status:'Expirada', hwid:'HWID-D4C5B6A7-8F9E' },
    { id:'release-2008', userId:'u10', admin:'admin.carol', createdAt:'2026-10-29T15:50:00Z', status:'Ativa', hwid:'HWID-2C3D4E5F-6G7H' },
    { id:'release-2009', userId:'u2', admin:'admin.alice', createdAt:'2026-10-28T12:30:00Z', status:'Ativa', hwid:'HWID-7F3E9B21-9A0C' },
    { id:'release-2010', userId:'u6', admin:'admin.bob', createdAt:'2026-10-15T09:00:00Z', status:'Revogada', hwid:'HWID-C2D3E4F5-6A7B' },
    { id:'release-2011', userId:'u4', admin:'admin.carol', createdAt:'2026-10-27T11:00:00Z', status:'Ativa', hwid:'HWID-9E8D7C6B-5A4F' },
    { id:'release-2012', userId:'u5', admin:'admin.alice', createdAt:'2026-08-01T10:00:00Z', status:'Revogada', hwid:'HWID-B3A2C1D0-9F8E' }
  ],

  incidents: [
    { id:'incident-001', type:'Volume anormal de releases', severity:'Crítica', status:'Investigando', assignee:'admin.alice', createdAt:'2026-10-30T08:45:00Z', description:'Mais de 50 releases detectadas em um intervalo de 15 minutos. Possível comprometimento de conta admin.' },
    { id:'incident-002', type:'Falha de autenticação em massa', severity:'Alta', status:'Resolvido', assignee:'admin.carol', createdAt:'2026-10-27T03:20:00Z', description:'Usuários relatando erro 401 intermitente entre 03h00 e 04h15. Causa: token expirado prematuramente.' },
    { id:'incident-003', type:'Tentativa de ação administrativa suspeita', severity:'Média', status:'Aberto', assignee:'admin.bob', createdAt:'2026-10-29T19:00:00Z', description:'Requisição de revogação em massa de releases partindo de IP desconhecido. Bloqueada pela API.' },
    { id:'incident-004', type:'Compartilhamento de HWID em massa', severity:'Alta', status:'Investigando', assignee:'admin.alice', createdAt:'2026-10-26T14:30:00Z', description:'Três contas distintas reportando o mesmo HWID. Possível revenda de licenças.' },
    { id:'incident-005', type:'Indisponibilidade parcial da API', severity:'Baixa', status:'Fechado', assignee:'admin.carol', createdAt:'2026-10-22T10:00:00Z', description:'Latência elevada na rota /api/dashboard/overview por aproximadamente 20 minutos.' }
  ],

  audit: [
    { id:'aud-001', createdAt:'2026-10-30T08:55:00Z', admin:'admin.alice', action:'Release criada', target:'release-2001', targetUserId:'u1', result:'Sucesso', details:'Release liberada para lucasplays (HWID-A1B2C3D4-5E6F)' },
    { id:'aud-002', createdAt:'2026-10-30T08:45:00Z', admin:'system', action:'Alerta de volume de releases', target:'incident-001', targetUserId:null, result:'Sucesso', details:'Mais de 50 releases em 15 minutos — incidente aberto' },
    { id:'aud-003', createdAt:'2026-10-30T08:30:00Z', admin:'admin.alice', action:'Release criada', target:'release-2002', targetUserId:'u2', result:'Sucesso', details:'Release liberada para maria.x' },
    { id:'aud-004', createdAt:'2026-10-30T07:15:00Z', admin:'admin.bob', action:'Release criada', target:'release-2003', targetUserId:'u4', result:'Sucesso', details:'Release liberada para anavip' },
    { id:'aud-005', createdAt:'2026-10-29T22:40:00Z', admin:'admin.carol', action:'HWID resetado', target:'u9', targetUserId:'u9', result:'Sucesso', details:'HWID resetado a pedido do usuário' },
    { id:'aud-006', createdAt:'2026-10-29T20:20:00Z', admin:'admin.bob', action:'Release revogada', target:'release-2005', targetUserId:'u7', result:'Sucesso', details:'Release revogada por suspeita de compartilhamento' },
    { id:'aud-007', createdAt:'2026-10-29T18:05:00Z', admin:'admin.alice', action:'Release criada', target:'release-2006', targetUserId:'u1', result:'Sucesso', details:'Nova release após reset' },
    { id:'aud-008', createdAt:'2026-10-29T19:00:00Z', admin:'unknown', action:'Tentativa de ação administrativa', target:'revoke-bulk', targetUserId:null, result:'Falha', details:'Requisição bloqueada: IP não autorizado' },
    { id:'aud-009', createdAt:'2026-10-29T16:15:00Z', admin:'admin.bob', action:'Ticket assumido', target:'ticket-1041', targetUserId:'u3', result:'Sucesso', details:'Ticket atribuído a admin.bob' },
    { id:'aud-010', createdAt:'2026-10-28T11:20:00Z', admin:'admin.alice', action:'Prioridade alterada', target:'ticket-1040', targetUserId:'u5', result:'Sucesso', details:'Prioridade ajustada para URGENTE' },
    { id:'aud-011', createdAt:'2026-10-28T10:00:00Z', admin:'admin.alice', action:'Usuário blacklistado', target:'u5', targetUserId:'u5', result:'Sucesso', details:'Motivo: compartilhamento de HWID' },
    { id:'aud-012', createdAt:'2026-10-27T14:00:00Z', admin:'admin.carol', action:'Nota adicionada', target:'incident-002', targetUserId:null, result:'Sucesso', details:'Causa raiz identificada' },
    { id:'aud-013', createdAt:'2026-10-26T09:30:00Z', admin:'admin.bob', action:'Ticket fechado', target:'ticket-1038', targetUserId:'u4', result:'Sucesso', details:'Ticket resolvido e fechado' },
    { id:'aud-014', createdAt:'2026-10-24T16:45:00Z', admin:'admin.carol', action:'HWID resetado', target:'u9', targetUserId:'u9', result:'Sucesso', details:'Reset realizado após análise' },
    { id:'aud-015', createdAt:'2026-10-22T10:00:00Z', admin:'system', action:'Incidente aberto', target:'incident-005', targetUserId:null, result:'Sucesso', details:'Latência elevada detectada' }
  ],

  transcripts: [
    { id:'tr-1001', ticketId:'ticket-1042', userId:'u1', admin:'admin.alice', createdAt:'2026-10-30T09:20:00Z', messages:
      [
        { author:'lucasplays', role:'user', time:'2026-10-30T08:40:00Z', text:'Olá, comprei a licença ontem mas não consigo liberar. Já reiniciei o PC.' },
        { author:'admin.alice', role:'staff', time:'2026-10-30T09:05:00Z', text:'Olá Lucas! Vou verificar seu HWID agora.' },
        { author:'admin.alice', role:'staff', time:'2026-10-30T09:20:00Z', text:'Seu HWID está correto. Pode tentar novamente por favor?' }
      ]},
    { id:'tr-1002', ticketId:'ticket-1041', userId:'u3', admin:'admin.bob', createdAt:'2026-10-29T17:00:00Z', messages:
      [
        { author:'pedrinho', role:'user', time:'2026-10-29T16:15:00Z', text:'Minha licença expirou, como renovo?' },
        { author:'admin.bob', role:'staff', time:'2026-10-29T17:00:00Z', text:'Você pode renovar pelo painel ou pelo link de checkout. Quer que eu envie?' }
      ]},
    { id:'tr-1003', ticketId:'ticket-1040', userId:'u5', admin:'admin.alice', createdAt:'2026-10-29T10:30:00Z', messages:
      [
        { author:'gabs', role:'user', time:'2026-10-28T11:00:00Z', text:'Fui colocado na blacklist injustamente. Preciso de ajuda.' },
        { author:'admin.alice', role:'staff', time:'2026-10-28T11:20:00Z', text:'Identificamos uso de HWID compartilhado. Envie prova de que é sua conta principal.' },
        { author:'gabs', role:'user', time:'2026-10-29T10:30:00Z', text:'Enviando screenshot agora.' }
      ]},
    { id:'tr-1004', ticketId:'ticket-1039', userId:'u2', admin:'admin.carol', createdAt:'2026-10-28T14:20:00Z', messages:
      [
        { author:'maria.x', role:'user', time:'2026-10-27T19:45:00Z', text:'O script não carrega em mobile. Mostra erro de execução.' },
        { author:'admin.carol', role:'staff', time:'2026-10-28T14:20:00Z', text:'Corrigido! Atualize a versão e teste novamente.' }
      ]},
    { id:'tr-1005', ticketId:'ticket-1038', userId:'u4', admin:'admin.bob', createdAt:'2026-10-26T09:30:00Z', messages:
      [
        { author:'anavip', role:'user', time:'2026-10-25T08:00:00Z', text:'Só uma dúvida: como faço para trocar de HWID?' },
        { author:'admin.bob', role:'staff', time:'2026-10-25T08:30:00Z', text:'Você pode abrir um ticket pedindo reset com motivo.' }
      ]}
  ],

  // Alertas especiais
  releaseVolumeAlert: {
    triggered: true,
    count: 58,
    periodMinutes: 15,
    detectedAt: '2026-10-30T08:45:00Z',
    severity: 'Crítica',
    admins: ['admin.alice', 'admin.bob'],
    usersAffected: 12
  },

  systemActivity: [
    { label:'Seg', tickets: 12, releases: 18, activity: 30 },
    { label:'Ter', tickets: 9, releases: 22, activity: 28 },
    { label:'Qua', tickets: 15, releases: 14, activity: 35 },
    { label:'Qui', tickets: 18, releases: 26, activity: 42 },
    { label:'Sex', tickets: 22, releases: 34, activity: 55 },
    { label:'Sáb', tickets: 14, releases: 19, activity: 32 },
    { label:'Dom', tickets: 8, releases: 11, activity: 20 }
  ]
};

window.MockData = MockData;