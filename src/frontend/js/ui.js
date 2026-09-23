/**
 * Advocate Diary System — UI Rendering Engine
 * Handles DOM manipulation, view transitions, modal workflows, and toasts.
 */

const UI = {
  /**
   * Escape HTML to prevent XSS
   */
  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Extract initials from a name (e.g. "Arun Kumar" -> "AK")
   */
  getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  /**
   * Format ISO date string into readable English (e.g. "Sep 24, 2026")
   */
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  },

  /**
   * Format date components for timeline display
   */
  getDateComponents(dateStr) {
    if (!dateStr) return { month: 'TBD', day: '--', year: '----', weekday: '' };
    try {
      const parts = dateStr.split('T')[0].split('-');
      const d = parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date(dateStr);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        day: d.getDate(),
        year: d.getFullYear(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      };
    } catch {
      return { month: 'TBD', day: '--', year: '----', weekday: '' };
    }
  },

  /* --------------------------------------------------------------------------
     Toast Notifications
     -------------------------------------------------------------------------- */
  showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="icon toast-icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg class="icon toast-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg class="icon toast-icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg class="icon toast-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${this.escape(message)}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const closeToast = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);

    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
  },

  /* --------------------------------------------------------------------------
     Modal Lifecycle
     -------------------------------------------------------------------------- */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('open');
    const firstInput = modal.querySelector('input:not([type=hidden]), select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    const form = modal.querySelector('form');
    if (form) form.reset();
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach((m) => {
      m.classList.remove('open');
      const form = m.querySelector('form');
      if (form) form.reset();
    });
  },

  /* --------------------------------------------------------------------------
     Dropdown Controls
     -------------------------------------------------------------------------- */
  populateClientDropdowns() {
    const clients = AppState.data.clients;

    // 1. Cases View Client Filter Dropdown
    const filterSelect = document.getElementById('caseClientFilter');
    if (filterSelect) {
      const currentVal = filterSelect.value;
      let options = '<option value="all">All Clients</option>';
      clients.forEach((c) => {
        options += `<option value="${c.id}">${this.escape(c.name)}</option>`;
      });
      filterSelect.innerHTML = options;
      filterSelect.value = currentVal || 'all';
    }

    // 2. Create Case Modal Client Dropdown
    const createCaseSelect = document.getElementById('caseFormClientId');
    if (createCaseSelect) {
      let options = '<option value="" disabled selected>Select Client...</option>';
      clients.forEach((c) => {
        options += `<option value="${c.id}">${this.escape(c.name)}</option>`;
      });
      createCaseSelect.innerHTML = options;
    }

    // 3. Edit Case Modal Client Dropdown
    const editCaseSelect = document.getElementById('editCaseFormClientId');
    if (editCaseSelect) {
      let options = '<option value="" disabled>Select Client...</option>';
      clients.forEach((c) => {
        options += `<option value="${c.id}">${this.escape(c.name)}</option>`;
      });
      editCaseSelect.innerHTML = options;
    }
  },

  populateCaseDropdowns() {
    const cases = AppState.data.cases;

    // 1. Hearings View Case Filter Dropdown
    const filterSelect = document.getElementById('hearingCaseFilter');
    if (filterSelect) {
      const currentVal = filterSelect.value;
      let options = '<option value="all">All Cases</option>';
      cases.forEach((c) => {
        options += `<option value="${c.id}">[${this.escape(c.case_number)}] ${this.escape(c.title)}</option>`;
      });
      filterSelect.innerHTML = options;
      filterSelect.value = currentVal || 'all';
    }

    // 2. Schedule Hearing Modal Case Dropdown
    const scheduleSelect = document.getElementById('hearingFormCaseId');
    if (scheduleSelect) {
      let options = '<option value="" disabled selected>Select Case...</option>';
      cases.forEach((c) => {
        options += `<option value="${c.id}">[${this.escape(c.case_number)}] ${this.escape(c.title)}</option>`;
      });
      scheduleSelect.innerHTML = options;
    }

    // 3. Edit Hearing Modal Case Dropdown
    const editHearingSelect = document.getElementById('editHearingFormCaseId');
    if (editHearingSelect) {
      let options = '<option value="" disabled>Select Case...</option>';
      cases.forEach((c) => {
        options += `<option value="${c.id}">[${this.escape(c.case_number)}] ${this.escape(c.title)}</option>`;
      });
      editHearingSelect.innerHTML = options;
    }
  },

  /* --------------------------------------------------------------------------
     Dashboard View Rendering
     -------------------------------------------------------------------------- */
  renderDashboard() {
    const kpis = AppState.getKPIs();

    // KPI Numbers
    const elClients = document.getElementById('kpiTotalClients');
    const elActive = document.getElementById('kpiActiveCases');
    const elUpcoming = document.getElementById('kpiUpcomingHearings');
    const elClosed = document.getElementById('kpiClosedCases');

    if (elClients) elClients.textContent = kpis.totalClients;
    if (elActive) elActive.textContent = kpis.activeCases;
    if (elUpcoming) elUpcoming.textContent = kpis.upcomingHearingsCount;
    if (elClosed) elClosed.textContent = kpis.closedCases;

    // Nav counters
    const navClientCount = document.getElementById('navClientCount');
    const navCaseCount = document.getElementById('navCaseCount');
    const navHearingCount = document.getElementById('navHearingCount');
    if (navClientCount) navClientCount.textContent = kpis.totalClients;
    if (navCaseCount) navCaseCount.textContent = AppState.data.cases.length;
    if (navHearingCount) navHearingCount.textContent = kpis.upcomingHearingsCount;

    // Urgent Hearings Banner
    const urgentBanner = document.getElementById('dashboardUrgentBanner');
    const urgentCount = document.getElementById('dashboardUrgentCount');
    const urgentDetails = document.getElementById('dashboardUrgentDetails');

    if (urgentBanner) {
      if (kpis.urgentHearings.length > 0) {
        urgentBanner.style.display = 'flex';
        if (urgentCount) urgentCount.textContent = `${kpis.urgentHearings.length} Hearing(s) Within 48 Hours`;
        if (urgentDetails) {
          const first = kpis.urgentHearings[0];
          const c = AppState.getCaseById(first.case_id);
          const caseTitle = c ? c.title : 'Matter';
          urgentDetails.textContent = `Immediate proceeding: "${caseTitle}" (${first.stage}) on ${this.formatDate(first.hearing_date)}.`;
        }
      } else {
        urgentBanner.style.display = 'none';
      }
    }

    // Dashboard Upcoming Agenda
    const agendaContainer = document.getElementById('dashboardUpcomingList');
    if (!agendaContainer) return;

    if (kpis.upcomingHearingsList.length === 0) {
      agendaContainer.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <div class="empty-icon-wrap" style="width: 48px; height: 48px; margin-bottom: 0.75rem;">
            <svg class="icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="empty-title" style="font-size: 1rem;">No Upcoming Hearings</div>
          <p class="empty-desc" style="font-size: 0.8rem; margin-bottom: 1rem;">You currently have no court dates scheduled in the near future.</p>
          <button class="btn btn-primary btn-sm" onclick="UI.openScheduleHearingModal()">
            <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Schedule Hearing
          </button>
        </div>
      `;
      return;
    }

    let html = '<div class="timeline-container">';
    kpis.upcomingHearingsList.forEach((h) => {
      const c = AppState.getCaseById(h.case_id);
      const caseNumber = c ? c.case_number : 'N/A';
      const caseTitle = c ? c.title : 'Unassigned Case';
      const court = c ? c.court : 'Court';
      const dateParts = this.getDateComponents(h.hearing_date);

      html += `
        <div class="hearing-card" style="padding: 1rem;">
          <div class="hearing-date-box" style="min-width: 75px; padding: 0.5rem;">
            <span class="date-month">${dateParts.month}</span>
            <span class="date-day" style="font-size: 1.4rem;">${dateParts.day}</span>
            <span class="date-year">${dateParts.year}</span>
          </div>
          <div class="hearing-main-info">
            <div class="hearing-header-row">
              <span class="hearing-case-title" style="font-size: 0.95rem;">${this.escape(caseTitle)}</span>
              <span class="badge badge-stage">${this.escape(h.stage)}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 0.75rem;">
              <span><strong>No:</strong> ${this.escape(caseNumber)}</span>
              <span><strong>Court:</strong> ${this.escape(court)}</span>
            </div>
            ${h.summary ? `<div class="hearing-summary-box" style="margin: 0.5rem 0; padding: 0.5rem; font-size: 0.78rem;">${this.escape(h.summary)}</div>` : ''}
            <div class="hearing-footer-row" style="padding-top: 0.25rem;">
              <span class="adjourned-info">
                ${h.next_hearing_date ? `<span class="adjourned-date">Adjourned to: ${this.formatDate(h.next_hearing_date)}</span>` : '<span class="adjourned-pending"><svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Adjournment Pending</span>'}
              </span>
              <button class="btn btn-secondary btn-sm" onclick="UI.openRecordOutcomeModalById(${h.id})">
                Record Outcome
              </button>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    agendaContainer.innerHTML = html;
  },

  /* --------------------------------------------------------------------------
     Clients View Rendering
     -------------------------------------------------------------------------- */
  renderClients() {
    const clients = AppState.getFilteredClients();
    const tbody = document.getElementById('clientsTableBody');
    const emptyState = document.getElementById('clientsEmptyState');
    const tableWrap = document.getElementById('clientsTableWrap');

    this.populateClientDropdowns();

    if (!tbody) return;

    if (clients.length === 0) {
      if (tableWrap) tableWrap.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (tableWrap) tableWrap.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    let html = '';
    clients.forEach((c) => {
      const initials = this.getInitials(c.name);
      const caseCount = AppState.getCasesForClient(c.id).length;
      const joinedDate = this.formatDate(c.created_at);

      html += `
        <tr>
          <td>
            <div class="client-name-cell">
              <span class="avatar-initials">${initials}</span>
              <div>
                <div>${this.escape(c.name)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">ID: #${c.id}</div>
              </div>
            </div>
          </td>
          <td>
            ${c.phone ? `<a href="tel:${this.escape(c.phone)}" style="display: inline-flex; align-items: center; gap: 4px;"><svg class="icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${this.escape(c.phone)}</a>` : '<span style="color: var(--text-muted);">&mdash;</span>'}
          </td>
          <td>
            ${c.email ? `<a href="mailto:${this.escape(c.email)}" style="display: inline-flex; align-items: center; gap: 4px;"><svg class="icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>${this.escape(c.email)}</a>` : '<span style="color: var(--text-muted);">&mdash;</span>'}
          </td>
          <td>
            <div style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this.escape(c.address)}">
              ${this.escape(c.address)}
            </div>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="UI.viewCasesForClient(${c.id})" title="View matters for ${this.escape(c.name)}">
              ${caseCount} Case${caseCount === 1 ? '' : 's'}
            </button>
          </td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${joinedDate}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-ghost btn-sm btn-icon" title="Edit Client" onclick="UI.openEditClientModalById(${c.id})">
                <svg class="icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" style="color: var(--feedback-danger);" title="Delete Client" onclick="UI.openDeleteClientModalById(${c.id})">
                <svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  },

  /* --------------------------------------------------------------------------
     Cases View Rendering
     -------------------------------------------------------------------------- */
  renderCases() {
    const cases = AppState.getFilteredCases();
    const grid = document.getElementById('casesGrid');
    const emptyState = document.getElementById('casesEmptyState');

    this.populateCaseDropdowns();

    if (!grid) return;

    if (cases.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    let html = '';
    cases.forEach((c) => {
      const client = AppState.getClientById(c.client_id);
      const clientName = client ? client.name : `Client #${c.client_id}`;
      const hearings = AppState.getHearingsForCase(c.id);
      const statusClass = `badge-${(c.status || 'open').toLowerCase()}`;

      html += `
        <div class="case-card">
          <div class="case-card-header">
            <span class="case-number-pill">${this.escape(c.case_number)}</span>
            <span class="badge ${statusClass}">${this.escape(c.status)}</span>
          </div>

          <div class="case-court-pill">${this.escape(c.court)}</div>
          <div class="case-title">${this.escape(c.title)}</div>

          <div class="case-meta-list">
            <div class="case-meta-row">
              <span class="case-meta-label">Client</span>
              <span class="case-meta-value">${this.escape(clientName)}</span>
            </div>
            <div class="case-meta-row">
              <span class="case-meta-label">Opposite Party</span>
              <span class="case-meta-value">${this.escape(c.opposite_party)}</span>
            </div>
            <div class="case-meta-row">
              <span class="case-meta-label">Registered</span>
              <span class="case-meta-value">${this.formatDate(c.created_at)}</span>
            </div>
          </div>

          ${c.description ? `<p class="case-desc">${this.escape(c.description)}</p>` : '<p class="case-desc" style="font-style: italic; color: var(--text-subtle);">No briefing description provided.</p>'}

          <div class="case-card-footer">
            <button class="btn btn-secondary btn-sm" onclick="UI.viewHearingsForCase(${c.id})">
              <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${hearings.length} Hearing${hearings.length === 1 ? '' : 's'}
            </button>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-ghost btn-sm btn-icon" title="Edit Case" onclick="UI.openEditCaseModalById(${c.id})">
                <svg class="icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" style="color: var(--feedback-danger);" title="Delete Case" onclick="UI.openDeleteCaseModalById(${c.id})">
                <svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
  },

  /* --------------------------------------------------------------------------
     Hearings View Rendering
     -------------------------------------------------------------------------- */
  renderHearings() {
    const hearings = AppState.getFilteredHearings();
    const container = document.getElementById('hearingsTimeline');
    const emptyState = document.getElementById('hearingsEmptyState');

    if (!container) return;

    if (hearings.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    container.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const in48Hours = new Date();
    in48Hours.setDate(now.getDate() + 2);
    const in48HoursStr = in48Hours.toISOString().split('T')[0];

    let html = '';
    hearings.forEach((h) => {
      const c = AppState.getCaseById(h.case_id);
      const caseNumber = c ? c.case_number : 'N/A';
      const caseTitle = c ? c.title : `Case #${h.case_id}`;
      const court = c ? c.court : 'Court';
      const dateParts = this.getDateComponents(h.hearing_date);

      const hearingDateStr = (h.hearing_date || '').split('T')[0];
      const isUrgent = hearingDateStr >= todayStr && hearingDateStr <= in48HoursStr;

      html += `
        <div class="hearing-card ${isUrgent ? 'urgent' : ''}">
          <div class="hearing-date-box">
            <span class="date-month">${dateParts.month}</span>
            <span class="date-day">${dateParts.day}</span>
            <span class="date-year">${dateParts.year}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${dateParts.weekday}</span>
          </div>

          <div class="hearing-main-info">
            <div class="hearing-header-row">
              <div>
                <span class="hearing-case-title">${this.escape(caseTitle)}</span>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                  <span class="case-number-pill">${this.escape(caseNumber)}</span>
                  <span style="margin-left: 6px; color: var(--color-primary); font-weight: 600;">${this.escape(court)}</span>
                </div>
              </div>
              <span class="badge badge-stage">${this.escape(h.stage)}</span>
            </div>

            ${h.summary ? `<div class="hearing-summary-box">${this.escape(h.summary)}</div>` : ''}

            <div class="hearing-footer-row">
              <span class="adjourned-info">
                ${h.next_hearing_date ? `<span class="adjourned-date">Next Adjourned Date: ${this.formatDate(h.next_hearing_date)}</span>` : '<span class="adjourned-pending"><svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Adjournment Date Pending</span>'}
              </span>

              <div style="display: flex; gap: 8px;">
                <button class="btn btn-primary btn-sm" onclick="UI.openRecordOutcomeModalById(${h.id})">
                  <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Record Outcome
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" title="Edit Hearing" onclick="UI.openEditHearingModalById(${h.id})">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" style="color: var(--feedback-danger);" title="Delete Hearing" onclick="UI.openDeleteHearingModalById(${h.id})">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  /* --------------------------------------------------------------------------
     Navigation Actions
     -------------------------------------------------------------------------- */
  viewCasesForClient(clientId) {
    AppState.data.filters.caseClientId = String(clientId);
    const select = document.getElementById('caseClientFilter');
    if (select) select.value = String(clientId);
    AppState.setView('cases');
  },

  viewHearingsForCase(caseId) {
    AppState.data.filters.hearingCaseId = String(caseId);
    AppState.data.filters.hearingDateFilter = 'all';
    const select = document.getElementById('hearingCaseFilter');
    if (select) select.value = String(caseId);
    const dateSelect = document.getElementById('hearingDateFilter');
    if (dateSelect) dateSelect.value = 'all';
    AppState.setView('hearings');
  },

  /* --------------------------------------------------------------------------
     Modal Opener Helpers by Entity ID
     -------------------------------------------------------------------------- */
  openCreateClientModal() {
    this.openModal('createClientModal');
  },

  openEditClientModalById(clientId) {
    const client = AppState.getClientById(clientId);
    if (!client) return;

    document.getElementById('editClientId').value = client.id;
    document.getElementById('editClientName').value = client.name || '';
    document.getElementById('editClientPhone').value = client.phone || '';
    document.getElementById('editClientEmail').value = client.email || '';
    document.getElementById('editClientAddress').value = client.address || '';

    this.openModal('editClientModal');
  },

  openDeleteClientModalById(clientId) {
    const client = AppState.getClientById(clientId);
    if (!client) return;

    document.getElementById('deleteClientId').value = client.id;
    document.getElementById('deleteClientName').textContent = client.name;
    const casesCount = AppState.getCasesForClient(client.id).length;
    document.getElementById('deleteClientCasesCount').textContent = casesCount;

    this.openModal('deleteClientModal');
  },

  openCreateCaseModal() {
    this.populateClientDropdowns();
    this.openModal('createCaseModal');
  },

  openEditCaseModalById(caseId) {
    const c = AppState.getCaseById(caseId);
    if (!c) return;

    this.populateClientDropdowns();

    document.getElementById('editCaseId').value = c.id;
    document.getElementById('editCaseNumber').value = c.case_number || '';
    document.getElementById('editCaseTitle').value = c.title || '';
    document.getElementById('editCaseCourt').value = c.court || '';
    document.getElementById('editCaseOppositeParty').value = c.opposite_party || '';
    document.getElementById('editCaseStatus').value = (c.status || 'open').toLowerCase();
    document.getElementById('editCaseFormClientId').value = c.client_id;
    document.getElementById('editCaseDescription').value = c.description || '';

    this.openModal('editCaseModal');
  },

  openDeleteCaseModalById(caseId) {
    const c = AppState.getCaseById(caseId);
    if (!c) return;

    document.getElementById('deleteCaseId').value = c.id;
    document.getElementById('deleteCaseTitle').textContent = `[${c.case_number}] ${c.title}`;
    const hearingsCount = AppState.getHearingsForCase(c.id).length;
    document.getElementById('deleteCaseHearingsCount').textContent = hearingsCount;

    this.openModal('deleteCaseModal');
  },

  openScheduleHearingModal() {
    this.populateCaseDropdowns();
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('hearingDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = today;
    }
    this.openModal('scheduleHearingModal');
  },

  openEditHearingModalById(hearingId) {
    const h = AppState.getHearingById(hearingId);
    if (!h) return;

    this.populateCaseDropdowns();

    document.getElementById('editHearingId').value = h.id;
    document.getElementById('editHearingFormCaseId').value = h.case_id;
    document.getElementById('editHearingStage').value = h.stage || '';
    document.getElementById('editHearingDate').value = (h.hearing_date || '').split('T')[0];
    document.getElementById('editHearingNextDate').value = h.next_hearing_date ? h.next_hearing_date.split('T')[0] : '';
    document.getElementById('editHearingSummary').value = h.summary || '';

    this.openModal('editHearingModal');
  },

  openRecordOutcomeModalById(hearingId) {
    const h = AppState.getHearingById(hearingId);
    if (!h) return;

    const c = AppState.getCaseById(h.case_id);
    const caseTitle = c ? `[${c.case_number}] ${c.title}` : `Hearing #${h.id}`;

    document.getElementById('outcomeHearingId').value = h.id;
    document.getElementById('outcomeCaseTitle').textContent = caseTitle;
    document.getElementById('outcomeStage').value = h.stage || '';
    document.getElementById('outcomeSummary').value = h.summary || '';
    document.getElementById('outcomeNextDate').value = h.next_hearing_date ? h.next_hearing_date.split('T')[0] : '';

    this.openModal('recordOutcomeModal');
  },

  openDeleteHearingModalById(hearingId) {
    const h = AppState.getHearingById(hearingId);
    if (!h) return;

    const c = AppState.getCaseById(h.case_id);
    const caseTitle = c ? c.title : `Case #${h.case_id}`;

    document.getElementById('deleteHearingId').value = h.id;
    document.getElementById('deleteHearingTitle').textContent = `${caseTitle} (${h.stage} on ${this.formatDate(h.hearing_date)})`;

    this.openModal('deleteHearingModal');
  },
};

window.UI = UI;
