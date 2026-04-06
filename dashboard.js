// ══════════════════════════════════════
//  INFRAVEX DASHBOARD ENGINE
// ══════════════════════════════════════

// ── DATA KEYS ──
const KEYS = {
  members: 'infravex-members',
  contacts: 'infravex-contacts',
  newsletters: 'infravex-newsletters',
  payments: 'infravex-payments',
  tickets: 'infravex-tickets',
  edits: 'infravex-edits',
  adminPass: 'infravex-admin-pass',
  session: 'infravex-session'
};

// ── HELPERS ──
function getData(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function getObj(key) { return JSON.parse(localStorage.getItem(key) || '{}'); }
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function genId() { return Date.now() + Math.random().toString(36).substr(2, 5); }
function now() { return new Date().toISOString(); }
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ── TOAST ──
function dashToast(msg, type = 'success') {
  let c = document.getElementById('dashToasts');
  if (!c) { c = document.createElement('div'); c.id = 'dashToasts'; c.className = 'dash-toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'dash-toast ' + type;
  t.innerHTML = `<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; setTimeout(() => t.remove(), 300); }, 3500);
}

// ── SESSION ──
function getSession() { return JSON.parse(sessionStorage.getItem(KEYS.session) || 'null'); }
function setSession(data) { sessionStorage.setItem(KEYS.session, JSON.stringify(data)); }
function clearSession() { sessionStorage.removeItem(KEYS.session); }

function requireAuth(role) {
  const s = getSession();
  if (!s || s.role !== role) {
    window.location.href = 'index.html';
    return null;
  }
  return s;
}

// ── MEMBER CRUD ──
function registerMember(data) {
  const members = getData(KEYS.members);
  if (members.find(m => m.email === data.email)) return { error: 'Email already registered' };
  const member = {
    id: genId(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || '',
    company: data.company || '',
    password: data.password,
    plan: 'launchpad',
    status: 'active',
    createdAt: now(),
    lastLogin: now()
  };
  members.push(member);
  setData(KEYS.members, members);
  // Create welcome payment
  addPayment({ memberId: member.id, memberName: member.firstName + ' ' + member.lastName, amount: 0, plan: 'launchpad', type: 'signup', status: 'completed', note: 'Free trial activation' });
  return { success: true, member };
}

function loginMember(email, password) {
  const members = getData(KEYS.members);
  const m = members.find(m => m.email === email && m.password === password);
  if (!m) return { error: 'Invalid email or password' };
  if (m.status === 'suspended') return { error: 'Account suspended. Contact support.' };
  m.lastLogin = now();
  setData(KEYS.members, members);
  return { success: true, member: m };
}

function getMember(id) {
  return getData(KEYS.members).find(m => m.id === id);
}

function updateMember(id, updates) {
  const members = getData(KEYS.members);
  const idx = members.findIndex(m => m.id === id);
  if (idx === -1) return false;
  Object.assign(members[idx], updates);
  setData(KEYS.members, members);
  return members[idx];
}

// ── PAYMENTS ──
function addPayment(data) {
  const payments = getData(KEYS.payments);
  payments.unshift({
    id: genId(),
    memberId: data.memberId,
    memberName: data.memberName,
    amount: data.amount,
    plan: data.plan,
    type: data.type || 'subscription',
    status: data.status || 'completed',
    method: data.method || 'card',
    cardLast4: data.cardLast4 || '••••',
    note: data.note || '',
    createdAt: now()
  });
  setData(KEYS.payments, payments);
}

function getMemberPayments(memberId) {
  return getData(KEYS.payments).filter(p => p.memberId === memberId);
}

// ── TICKETS ──
function createTicket(data) {
  const tickets = getData(KEYS.tickets);
  tickets.unshift({
    id: 'TKT-' + (1000 + tickets.length + 1),
    memberId: data.memberId,
    memberName: data.memberName,
    memberEmail: data.memberEmail,
    subject: data.subject,
    message: data.message,
    priority: data.priority || 'medium',
    status: 'open',
    createdAt: now(),
    replies: []
  });
  setData(KEYS.tickets, tickets);
}

function getMemberTickets(memberId) {
  return getData(KEYS.tickets).filter(t => t.memberId === memberId);
}

function replyToTicket(ticketId, message, from) {
  const tickets = getData(KEYS.tickets);
  const t = tickets.find(t => t.id === ticketId);
  if (t) {
    t.replies.push({ message, from, createdAt: now() });
    if (from === 'admin') t.status = 'replied';
    setData(KEYS.tickets, tickets);
  }
}

function closeTicket(ticketId) {
  const tickets = getData(KEYS.tickets);
  const t = tickets.find(t => t.id === ticketId);
  if (t) { t.status = 'closed'; setData(KEYS.tickets, tickets); }
}

// ── PLAN DATA ──
const PLANS = {
  launchpad: { name: 'Launchpad', price: 999, features: ['100 GB Storage', '5 Websites', 'Email Marketing (5K/mo)', 'Basic Analytics', 'SSL Certificates', 'Business Email'] },
  proscale: { name: 'ProScale', price: 3499, features: ['1 TB Storage', 'Unlimited Websites', 'Email Marketing (50K/mo)', 'Advanced Analytics + AI', 'CDN & Load Balancing', 'Priority 24/7 Support'] },
  inframax: { name: 'InfraMax', price: 9999, features: ['Unlimited Storage', 'Dedicated Infra', 'White-label Options', 'SLA 99.99% Uptime', 'Dedicated Account Mgr', 'On-premise Integration'] }
};

// ══════════════════════════════════════
//  DASHBOARD PAGE NAVIGATION
// ══════════════════════════════════════

function showDashPage(pageId) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  const nav = document.querySelector(`[data-page="${pageId}"]`);
  if (nav) nav.classList.add('active');
  // Update header title
  const title = nav ? nav.textContent.trim() : '';
  const headerTitle = document.getElementById('dashHeaderTitle');
  if (headerTitle && title) headerTitle.textContent = title;
  // Load page data
  if (typeof window['load_' + pageId] === 'function') window['load_' + pageId]();
  // Close mobile sidebar
  document.querySelector('.dash-sidebar')?.classList.remove('open');
}

function toggleSidebar() {
  document.querySelector('.dash-sidebar')?.classList.toggle('open');
}

// ══════════════════════════════════════
//  ADMIN DASHBOARD PAGES
// ══════════════════════════════════════

window.load_admin_overview = function () {
  const members = getData(KEYS.members);
  const payments = getData(KEYS.payments);
  const contacts = getData(KEYS.contacts);
  const tickets = getData(KEYS.tickets);
  const revenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const activeMembers = members.filter(m => m.status === 'active').length;
  const openTickets = tickets.filter(t => t.status === 'open').length;

  document.getElementById('adminStatMembers').textContent = members.length;
  document.getElementById('adminStatRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('adminStatRequests').textContent = contacts.length;
  document.getElementById('adminStatTickets').textContent = openTickets;

  // Recent activity
  const actContainer = document.getElementById('adminRecentActivity');
  const allActivity = [
    ...members.map(m => ({ text: `${m.firstName} ${m.lastName} registered`, time: m.createdAt, type: 'blue' })),
    ...payments.filter(p => p.amount > 0).map(p => ({ text: `Payment ₹${p.amount} from ${p.memberName}`, time: p.createdAt, type: 'green' })),
    ...contacts.map(c => ({ text: `Contact from ${c.firstName || 'Visitor'} ${c.lastName || ''}`, time: c.timestamp, type: 'gold' }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  actContainer.innerHTML = allActivity.length ? allActivity.map(a => `
    <div class="activity-item">
      <div class="activity-dot ${a.type}"></div>
      <div><div class="activity-text">${escHtml(a.text)}</div><div class="activity-time">${fmtDate(a.time)} ${fmtTime(a.time)}</div></div>
    </div>`).join('') : '<div class="dash-empty"><div class="dash-empty-icon">📊</div><p>No activity yet</p></div>';
};

window.load_admin_members = function () {
  const members = getData(KEYS.members);
  const tbody = document.getElementById('adminMembersBody');
  document.getElementById('adminMemberCount').textContent = members.length;
  tbody.innerHTML = members.length ? members.map(m => `
    <tr>
      <td><strong>${escHtml(m.firstName)} ${escHtml(m.lastName)}</strong><br><span style="font-size:0.72rem;color:var(--muted)">${escHtml(m.email)}</span></td>
      <td><span class="badge ${m.plan}">${PLANS[m.plan]?.name || m.plan}</span></td>
      <td><span class="badge ${m.status}">${m.status}</span></td>
      <td>${fmtDate(m.createdAt)}</td>
      <td>
        <button class="dash-btn sm outline" onclick="toggleMemberStatus('${m.id}')">${m.status === 'active' ? '⏸ Suspend' : '▶ Activate'}</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--dim);">No members yet</td></tr>';
};

window.toggleMemberStatus = function (id) {
  const m = getMember(id);
  if (m) {
    updateMember(id, { status: m.status === 'active' ? 'suspended' : 'active' });
    dashToast(`Member ${m.firstName} ${m.status === 'active' ? 'suspended' : 'activated'}`, 'info');
    window.load_admin_members();
  }
};

window.load_admin_requests = function () {
  const contacts = getData(KEYS.contacts);
  const newsletters = getData(KEYS.newsletters);
  document.getElementById('adminContactCount').textContent = contacts.length;
  document.getElementById('adminNewsletterCount').textContent = newsletters.length;

  const contactsHtml = contacts.length ? contacts.map(c => `
    <div class="ticket-card">
      <div class="ticket-header">
        <div><div class="ticket-subject">${escHtml(c.firstName || 'Visitor')} ${escHtml(c.lastName || '')}</div><div class="ticket-id">${escHtml(c.email || 'N/A')}</div></div>
        <span class="badge pending">${fmtDate(c.timestamp)}</span>
      </div>
      <div class="ticket-body">${escHtml(c.message || 'No message')}</div>
      <div class="ticket-meta"><span>Service: ${escHtml(c.service || 'N/A')}</span><span>Budget: ${escHtml(c.budget || 'N/A')}</span></div>
    </div>`).join('') : '<div class="dash-empty"><div class="dash-empty-icon">📭</div><p>No contact requests yet</p></div>';
  document.getElementById('adminContactsList').innerHTML = contactsHtml;

  const newsHtml = newsletters.length ? newsletters.map(n => `
    <div class="ticket-card" style="padding:0.75rem 1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:600;color:var(--accent);font-size:0.88rem;">${escHtml(n.email)}</span>
        <span style="font-size:0.68rem;color:var(--dim);">${fmtDate(n.timestamp)}</span>
      </div>
    </div>`).join('') : '<div class="dash-empty"><div class="dash-empty-icon">📬</div><p>No subscribers</p></div>';
  document.getElementById('adminNewsletterList').innerHTML = newsHtml;
};

window.load_admin_payments = function () {
  const payments = getData(KEYS.payments);
  const revenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  document.getElementById('adminTotalRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('adminPaymentCount').textContent = payments.length;

  const tbody = document.getElementById('adminPaymentsBody');
  tbody.innerHTML = payments.length ? payments.map(p => `
    <tr>
      <td>${escHtml(p.memberName)}</td>
      <td style="font-weight:700;color:var(--accent);">₹${p.amount.toLocaleString('en-IN')}</td>
      <td><span class="badge ${p.plan}">${PLANS[p.plan]?.name || p.plan}</span></td>
      <td>${escHtml(p.method)} ${p.cardLast4 !== '••••' ? '(••' + p.cardLast4 + ')' : ''}</td>
      <td><span class="badge ${p.status}">${p.status}</span></td>
      <td>${fmtDate(p.createdAt)}</td>
    </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--dim);">No payments</td></tr>';
};

window.load_admin_tickets = function () {
  const tickets = getData(KEYS.tickets);
  document.getElementById('adminTicketCount').textContent = tickets.filter(t => t.status === 'open').length;
  const container = document.getElementById('adminTicketsList');
  container.innerHTML = tickets.length ? tickets.map(t => `
    <div class="ticket-card">
      <div class="ticket-header">
        <div><div class="ticket-subject">${escHtml(t.subject)}</div><div class="ticket-id">${t.id} · ${escHtml(t.memberName)}</div></div>
        <span class="badge ${t.status}">${t.status}</span>
      </div>
      <div class="ticket-body">${escHtml(t.message)}</div>
      <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
        ${t.status !== 'closed' ? `<button class="dash-btn sm outline" onclick="adminReplyTicket('${t.id}')">💬 Reply</button>
        <button class="dash-btn sm danger" onclick="closeTicket('${t.id}');load_admin_tickets();">✕ Close</button>` : ''}
      </div>
    </div>`).join('') : '<div class="dash-empty"><div class="dash-empty-icon">🎫</div><p>No support tickets</p></div>';
};

window.adminReplyTicket = function (id) {
  const msg = prompt('Enter reply message:');
  if (msg) {
    replyToTicket(id, msg, 'admin');
    dashToast('Reply sent!', 'success');
    window.load_admin_tickets();
  }
};

window.load_admin_settings = function () {
  // Settings page - static content, handled by HTML
};

window.adminChangePassword = function () {
  const cur = document.getElementById('adminCurPass').value;
  const np = document.getElementById('adminNewPass').value;
  const cp = document.getElementById('adminConfPass').value;
  const savedPass = localStorage.getItem(KEYS.adminPass) || 'infravex2025';
  if (cur !== savedPass) { dashToast('Current password incorrect', 'error'); return; }
  if (np.length < 6) { dashToast('Password must be at least 6 characters', 'error'); return; }
  if (np !== cp) { dashToast('Passwords do not match', 'error'); return; }
  localStorage.setItem(KEYS.adminPass, np);
  dashToast('Password changed successfully!', 'success');
  document.getElementById('adminCurPass').value = '';
  document.getElementById('adminNewPass').value = '';
  document.getElementById('adminConfPass').value = '';
};

// ══════════════════════════════════════
//  MEMBER DASHBOARD PAGES
// ══════════════════════════════════════

window.load_member_overview = function () {
  const s = getSession();
  if (!s) return;
  const m = getMember(s.id);
  if (!m) return;
  const plan = PLANS[m.plan] || PLANS.launchpad;
  const payments = getMemberPayments(m.id);
  const tickets = getMemberTickets(m.id);
  const totalSpent = payments.reduce((s, p) => s + (p.amount || 0), 0);

  document.getElementById('memberPlanName').textContent = plan.name;
  document.getElementById('memberPlanPrice').textContent = '₹' + plan.price + '/mo';
  document.getElementById('memberTotalSpent').textContent = '₹' + totalSpent.toLocaleString('en-IN');
  document.getElementById('memberTicketCount').textContent = tickets.filter(t => t.status !== 'closed').length;
  document.getElementById('memberWelcome').textContent = 'Welcome back, ' + m.firstName + '!';
};

window.load_member_plan = function () {
  const s = getSession();
  if (!s) return;
  const m = getMember(s.id);
  if (!m) return;
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.toggle('current', card.dataset.plan === m.plan);
  });
};

window.changePlan = function (planKey) {
  const s = getSession();
  if (!s) return;
  const m = getMember(s.id);
  if (!m || m.plan === planKey) return;
  const plan = PLANS[planKey];
  if (!plan) return;
  openPaymentModal(planKey, plan.price, `Upgrade to ${plan.name}`);
};

window.load_member_payments = function () {
  const s = getSession();
  if (!s) return;
  const payments = getMemberPayments(s.id);
  const tbody = document.getElementById('memberPaymentsBody');
  tbody.innerHTML = payments.length ? payments.map(p => `
    <tr>
      <td>${fmtDate(p.createdAt)}</td>
      <td>${escHtml(PLANS[p.plan]?.name || p.plan)}</td>
      <td style="font-weight:700;">₹${p.amount.toLocaleString('en-IN')}</td>
      <td>${escHtml(p.method)}${p.cardLast4 !== '••••' ? ' (••' + p.cardLast4 + ')' : ''}</td>
      <td><span class="badge ${p.status}">${p.status}</span></td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--dim);">No payments yet</td></tr>';
};

window.load_member_tickets = function () {
  const s = getSession();
  if (!s) return;
  const tickets = getMemberTickets(s.id);
  const container = document.getElementById('memberTicketsList');
  container.innerHTML = tickets.length ? tickets.map(t => `
    <div class="ticket-card">
      <div class="ticket-header">
        <div><div class="ticket-subject">${escHtml(t.subject)}</div><div class="ticket-id">${t.id}</div></div>
        <span class="badge ${t.status}">${t.status}</span>
      </div>
      <div class="ticket-body">${escHtml(t.message)}</div>
      ${t.replies.length ? t.replies.map(r => `<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:0.75rem;margin-top:0.5rem;font-size:0.82rem;"><strong style="color:var(--accent);">${r.from === 'admin' ? 'Support Team' : 'You'}:</strong> ${escHtml(r.message)}<div style="font-size:0.68rem;color:var(--dim);margin-top:4px;">${fmtDate(r.createdAt)}</div></div>`).join('') : ''}
      <div class="ticket-meta" style="margin-top:0.5rem;"><span>Priority: ${t.priority}</span><span>${fmtDate(t.createdAt)}</span></div>
    </div>`).join('') : '<div class="dash-empty"><div class="dash-empty-icon">🎫</div><p>No tickets. Submit one if you need help!</p></div>';
};

window.submitTicket = function () {
  const s = getSession();
  if (!s) return;
  const m = getMember(s.id);
  const subject = document.getElementById('ticketSubject').value.trim();
  const message = document.getElementById('ticketMessage').value.trim();
  const priority = document.getElementById('ticketPriority').value;
  if (!subject || !message) { dashToast('Please fill in all fields', 'error'); return; }
  createTicket({ memberId: m.id, memberName: m.firstName + ' ' + m.lastName, memberEmail: m.email, subject, message, priority });
  dashToast('Ticket submitted! We\'ll respond soon.', 'success');
  document.getElementById('ticketSubject').value = '';
  document.getElementById('ticketMessage').value = '';
  window.load_member_tickets();
};

window.load_member_profile = function () {
  const s = getSession();
  if (!s) return;
  const m = getMember(s.id);
  if (!m) return;
  document.getElementById('profileFirstName').value = m.firstName;
  document.getElementById('profileLastName').value = m.lastName;
  document.getElementById('profileEmail').value = m.email;
  document.getElementById('profilePhone').value = m.phone || '';
  document.getElementById('profileCompany').value = m.company || '';
};

window.saveProfile = function () {
  const s = getSession();
  if (!s) return;
  const updated = updateMember(s.id, {
    firstName: document.getElementById('profileFirstName').value.trim(),
    lastName: document.getElementById('profileLastName').value.trim(),
    phone: document.getElementById('profilePhone').value.trim(),
    company: document.getElementById('profileCompany').value.trim()
  });
  if (updated) {
    setSession({ ...s, name: updated.firstName + ' ' + updated.lastName });
    dashToast('Profile updated!', 'success');
    updateDashUserInfo();
  }
};

window.changeMemberPassword = function () {
  const s = getSession();
  if (!s) return;
  const m = getMember(s.id);
  const cur = document.getElementById('memberCurPass').value;
  const np = document.getElementById('memberNewPass').value;
  if (cur !== m.password) { dashToast('Current password incorrect', 'error'); return; }
  if (np.length < 6) { dashToast('Min 6 characters', 'error'); return; }
  updateMember(s.id, { password: np });
  dashToast('Password changed!', 'success');
  document.getElementById('memberCurPass').value = '';
  document.getElementById('memberNewPass').value = '';
};

// ══════════════════════════════════════
//  PAYMENT MODAL
// ══════════════════════════════════════

let pendingPayment = null;

window.openPaymentModal = function (planKey, amount, description) {
  pendingPayment = { planKey, amount, description };
  const modal = document.getElementById('paymentModal');
  if (!modal) return;
  document.getElementById('paymentDesc').textContent = description || '';
  document.getElementById('paymentAmount').textContent = '₹' + amount.toLocaleString('en-IN');
  modal.classList.add('open');
};

window.closePaymentModal = function () {
  document.getElementById('paymentModal')?.classList.remove('open');
  pendingPayment = null;
};

window.processPayment = function () {
  const cardNum = document.getElementById('payCardNumber').value.replace(/\s/g, '');
  const expiry = document.getElementById('payExpiry').value;
  const cvv = document.getElementById('payCvv').value;
  const name = document.getElementById('payName').value.trim();
  if (cardNum.length < 16) { dashToast('Enter valid card number', 'error'); return; }
  if (!expiry || expiry.length < 5) { dashToast('Enter valid expiry', 'error'); return; }
  if (cvv.length < 3) { dashToast('Enter valid CVV', 'error'); return; }
  if (!name) { dashToast('Enter cardholder name', 'error'); return; }

  const btn = document.getElementById('payBtn');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  setTimeout(() => {
    const s = getSession();
    const m = s ? getMember(s.id) : null;
    if (m && pendingPayment) {
      addPayment({
        memberId: m.id,
        memberName: m.firstName + ' ' + m.lastName,
        amount: pendingPayment.amount,
        plan: pendingPayment.planKey,
        type: 'subscription',
        status: 'completed',
        method: 'card',
        cardLast4: cardNum.slice(-4)
      });
      updateMember(m.id, { plan: pendingPayment.planKey });
      setSession({ ...s, plan: pendingPayment.planKey });
      dashToast('Payment successful! Plan upgraded to ' + PLANS[pendingPayment.planKey].name, 'success');
    }
    closePaymentModal();
    btn.textContent = 'Pay Securely →';
    btn.disabled = false;
    // Clear form
    document.getElementById('payCardNumber').value = '';
    document.getElementById('payExpiry').value = '';
    document.getElementById('payCvv').value = '';
    document.getElementById('payName').value = '';
    // Refresh pages
    if (typeof window.load_member_plan === 'function') window.load_member_plan();
    if (typeof window.load_member_payments === 'function') window.load_member_payments();
    if (typeof window.load_member_overview === 'function') window.load_member_overview();
  }, 2000);
};

// Card number formatting
document.addEventListener('input', function (e) {
  if (e.target.id === 'payCardNumber') {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Update preview
    const preview = document.getElementById('cardPreviewNumber');
    if (preview) preview.textContent = v ? v.replace(/(\d{4})(?=\d)/g, '$1 ') : '•••• •••• •••• ••••';
  }
  if (e.target.id === 'payExpiry') {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
    e.target.value = v;
    const preview = document.getElementById('cardPreviewExpiry');
    if (preview) preview.textContent = v || 'MM/YY';
  }
  if (e.target.id === 'payName') {
    const preview = document.getElementById('cardPreviewName');
    if (preview) preview.textContent = e.target.value || 'YOUR NAME';
  }
});

// ── UTILITY ──
function updateDashUserInfo() {
  const s = getSession();
  if (!s) return;
  const nameEl = document.getElementById('dashUserName');
  const emailEl = document.getElementById('dashUserEmail');
  const avatarEl = document.getElementById('dashUserAvatar');
  if (nameEl) nameEl.textContent = s.name;
  if (emailEl) emailEl.textContent = s.email;
  if (avatarEl) avatarEl.textContent = s.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function dashLogout() {
  clearSession();
  window.location.href = 'index.html';
}

// ── DARK MODE ──
function initDashDarkMode() {
  const saved = localStorage.getItem('infravex-dark');
  if (saved === 'true') document.body.classList.add('dark');
}

// ══════════════════════════════════════
//  CONTENT EDITOR (for admin dashboard)
// ══════════════════════════════════════

window.load_admin_editor = function () { loadEditorPage(); };

function loadEditorPage() {
  const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
  // Populate known fields
  const heroTitle = document.getElementById('edit_hero-title');
  const heroSub = document.getElementById('edit_hero-subtitle');
  const servicesTitle = document.getElementById('edit_services-title');
  if (heroTitle) heroTitle.value = edits['hero-title'] || '';
  if (heroSub) heroSub.value = edits['hero-subtitle'] || '';
  if (servicesTitle) servicesTitle.value = edits['services-title'] || '';
  // Render saved edits list
  renderSavedEdits();
}

window.saveAllEdits = function () {
  const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
  const heroTitle = document.getElementById('edit_hero-title')?.value;
  const heroSub = document.getElementById('edit_hero-subtitle')?.value;
  const servicesTitle = document.getElementById('edit_services-title')?.value;
  if (heroTitle) edits['hero-title'] = heroTitle;
  if (heroSub) edits['hero-subtitle'] = heroSub;
  if (servicesTitle) edits['services-title'] = servicesTitle;
  localStorage.setItem('infravex-edits', JSON.stringify(edits));
  dashToast('All content changes saved! Refresh the main site to see them.', 'success');
  renderSavedEdits();
};

window.saveCustomEdit = function () {
  const key = document.getElementById('editCustomKey')?.value.trim();
  const value = document.getElementById('editCustomValue')?.value;
  if (!key || !value) { dashToast('Please enter both section name and content', 'error'); return; }
  const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
  edits[key] = value;
  localStorage.setItem('infravex-edits', JSON.stringify(edits));
  document.getElementById('editCustomKey').value = '';
  document.getElementById('editCustomValue').value = '';
  dashToast('Custom edit saved: ' + key, 'success');
  renderSavedEdits();
};

function renderSavedEdits() {
  const container = document.getElementById('savedEditsList');
  if (!container) return;
  const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
  const keys = Object.keys(edits);
  if (keys.length === 0) {
    container.innerHTML = '<div class="dash-empty"><div class="dash-empty-icon">📝</div><p>No saved edits yet</p></div>';
    return;
  }
  container.innerHTML = keys.map(k => `
    <div class="ticket-card" style="margin-bottom:0.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong style="font-size:0.85rem;color:var(--ink);">${escHtml(k)}</strong>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:2px;max-width:500px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(edits[k]).substring(0, 80)}...</div>
        </div>
        <button class="dash-btn sm danger" onclick="removeEdit('${escHtml(k)}')">🗑️</button>
      </div>
    </div>`).join('');
}

window.removeEdit = function (key) {
  const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
  delete edits[key];
  localStorage.setItem('infravex-edits', JSON.stringify(edits));
  dashToast('Edit removed: ' + key, 'info');
  renderSavedEdits();
};

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initDashDarkMode();
  updateDashUserInfo();
  // Show first page
  const firstNav = document.querySelector('.dash-nav-item.active');
  if (firstNav) {
    const pageId = firstNav.dataset.page;
    if (pageId) showDashPage(pageId);
  }
});
