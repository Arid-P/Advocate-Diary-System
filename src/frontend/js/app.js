/**
 * Advocate Diary System — Main Application Controller
 * Boots the application, binds DOM events, handles API interactions, and manages UI routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Theme Boot
  AppState.setTheme(AppState.data.theme);

  // 2. Setup View Titles Mapping
  const viewTitles = {
    dashboard: {
      title: 'Legal Practice Dashboard',
      subtitle: 'Real-time overview of active matters, agenda, and client workflows',
    },
    clients: {
      title: 'Clients Directory',
      subtitle: 'Manage clients, retainers, contact records, and case linkages',
    },
    cases: {
      title: 'Case Management',
      subtitle: 'Track court matters, dispute status, courts, and hearing logs',
    },
    hearings: {
      title: 'Court Diary & Hearings',
      subtitle: 'Chronological proceedings, cause lists, orders, and adjournment calendar',
    },
    portal: {
      title: 'Client Matter Portal',
      subtitle: 'Self-service client access to active cases, proceedings, orders, and hearings',
    },
  };

  // 3. Register State Change Subscribers
  AppState.subscribe((event, payload) => {
    switch (event) {
      case 'clients_updated':
        UI.renderClients();
        UI.renderDashboard();
        if (AppState.data.currentView === 'portal') UI.renderPortal();
        break;
      case 'cases_updated':
        UI.renderCases();
        UI.renderDashboard();
        if (AppState.data.currentView === 'portal') UI.renderPortal();
        break;
      case 'hearings_updated':
        UI.renderHearings();
        UI.renderDashboard();
        if (AppState.data.currentView === 'portal') UI.renderPortal();
        break;
      case 'portal_client_updated':
        if (AppState.data.currentView === 'portal') UI.renderPortal();
        break;
      case 'view_change':
        switchViewUI(payload);
        break;
      case 'theme_change':
        updateThemeToggleIcon(payload);
        break;
    }
  });

  function switchViewUI(viewName) {
    // Update navigation sidebar
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update view sections
    document.querySelectorAll('.view-section').forEach((section) => {
      section.classList.toggle('active', section.id === `view-${viewName}`);
    });

    // Update Header titles
    const meta = viewTitles[viewName] || viewTitles.dashboard;
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    if (pageTitle) pageTitle.textContent = meta.title;
    if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;

    // Render corresponding view
    if (viewName === 'dashboard') UI.renderDashboard();
    if (viewName === 'clients') UI.renderClients();
    if (viewName === 'cases') UI.renderCases();
    if (viewName === 'hearings') UI.renderHearings();
    if (viewName === 'portal') UI.renderPortal();

    // Close mobile sidebar if open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
  }

  function updateThemeToggleIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      btn.title = 'Switch to Light Theme';
    } else {
      btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      btn.title = 'Switch to Dark Executive Theme';
    }
  }

  // 4. Initial Data Load
  async function loadInitialData() {
    try {
      // Parallel fetch with resilient 404 handling in API wrapper
      const [clientsRes, casesRes, hearingsRes] = await Promise.allSettled([
        API.getClients(0, 100),
        API.getCases(0, 100),
        API.getHearings(0, 100),
      ]);

      const clients = clientsRes.status === 'fulfilled' ? clientsRes.value : [];
      const cases = casesRes.status === 'fulfilled' ? casesRes.value : [];
      const hearings = hearingsRes.status === 'fulfilled' ? hearingsRes.value : [];

      AppState.setClients(clients);
      AppState.setCases(cases);
      AppState.setHearings(hearings);

      // Verify API health status indicator
      checkSystemHealth();
    } catch (err) {
      console.error('Initial load failed:', err);
      UI.showToast('Failed to load diary data from server.', 'error');
    }
  }

  async function checkSystemHealth() {
    const statusText = document.getElementById('dbStatusText');
    const statusDot = document.getElementById('dbStatusDot');
    try {
      const res = await API.checkHealth();
      if (res && res.status === 'healthy') {
        if (statusText) statusText.textContent = 'API Connected';
        if (statusDot) {
          statusDot.style.backgroundColor = 'var(--feedback-success)';
          statusDot.style.boxShadow = '0 0 8px var(--feedback-success)';
        }
      }
    } catch {
      if (statusText) statusText.textContent = 'API Disconnected';
      if (statusDot) {
        statusDot.style.backgroundColor = 'var(--feedback-danger)';
        statusDot.style.boxShadow = '0 0 8px var(--feedback-danger)';
      }
    }
  }

  // 5. Setup Navigation Clicks
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view) AppState.setView(view);
    });
  });

  // Mobile menu button
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('mobile-open');
    });
  }

  // Theme Toggle Button
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => AppState.toggleTheme());
  }

  // Quick Create Dropdown
  const quickCreateBtn = document.getElementById('quickCreateBtn');
  const quickCreateDropdown = document.getElementById('quickCreateDropdown');

  if (quickCreateBtn && quickCreateDropdown) {
    quickCreateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickCreateDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      quickCreateDropdown.classList.remove('open');
    });
  }

  // Quick Action Click Handlers in Dropdown & Dashboard
  document.querySelectorAll('[data-action="create-client"]').forEach((el) => {
    el.addEventListener('click', () => UI.openCreateClientModal());
  });
  document.querySelectorAll('[data-action="create-case"]').forEach((el) => {
    el.addEventListener('click', () => UI.openCreateCaseModal());
  });
  document.querySelectorAll('[data-action="schedule-hearing"]').forEach((el) => {
    el.addEventListener('click', () => UI.openScheduleHearingModal());
  });

  // Modal Close buttons
  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => UI.closeAllModals());
  });

  // Click outside modal content to close
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        UI.closeAllModals();
      }
    });
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape closes modals and dropdowns
    if (e.key === 'Escape') {
      UI.closeAllModals();
      if (quickCreateDropdown) quickCreateDropdown.classList.remove('open');
    }
    // Ctrl+K or Cmd+K focuses search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const globalSearch = document.getElementById('globalSearchInput');
      if (globalSearch) globalSearch.focus();
    }
  });

  // 6. Global Search Input
  const globalSearchInput = document.getElementById('globalSearchInput');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      const current = AppState.data.currentView;

      if (current === 'clients') {
        AppState.data.filters.clientSearch = q;
        UI.renderClients();
      } else if (current === 'cases') {
        AppState.data.filters.caseSearch = q;
        UI.renderCases();
      } else if (current === 'hearings') {
        AppState.data.filters.hearingSearch = q;
        UI.renderHearings();
      } else {
        // From dashboard, redirect to Cases search if query entered
        if (q.trim().length > 0) {
          AppState.data.filters.caseSearch = q;
          AppState.setView('cases');
          const caseSearch = document.getElementById('caseSearchInput');
          if (caseSearch) caseSearch.value = q;
        }
      }
    });
  }

  // 7. Clients View Filter
  const clientSearchInput = document.getElementById('clientSearchInput');
  if (clientSearchInput) {
    clientSearchInput.addEventListener('input', (e) => {
      AppState.data.filters.clientSearch = e.target.value;
      UI.renderClients();
    });
  }

  // 8. Cases View Filters
  document.querySelectorAll('.case-status-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.case-status-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      AppState.data.filters.caseStatus = tab.dataset.status;
      UI.renderCases();
    });
  });

  const caseClientFilter = document.getElementById('caseClientFilter');
  if (caseClientFilter) {
    caseClientFilter.addEventListener('change', (e) => {
      AppState.data.filters.caseClientId = e.target.value;
      UI.renderCases();
    });
  }

  const caseSearchInput = document.getElementById('caseSearchInput');
  if (caseSearchInput) {
    caseSearchInput.addEventListener('input', (e) => {
      AppState.data.filters.caseSearch = e.target.value;
      UI.renderCases();
    });
  }

  // 9. Hearings View Filters
  const hearingDateFilter = document.getElementById('hearingDateFilter');
  if (hearingDateFilter) {
    hearingDateFilter.addEventListener('change', (e) => {
      AppState.data.filters.hearingDateFilter = e.target.value;
      UI.renderHearings();
    });
  }

  const hearingCaseFilter = document.getElementById('hearingCaseFilter');
  if (hearingCaseFilter) {
    hearingCaseFilter.addEventListener('change', (e) => {
      AppState.data.filters.hearingCaseId = e.target.value;
      UI.renderHearings();
    });
  }

  const hearingSearchInput = document.getElementById('hearingSearchInput');
  if (hearingSearchInput) {
    hearingSearchInput.addEventListener('input', (e) => {
      AppState.data.filters.hearingSearch = e.target.value;
      UI.renderHearings();
    });
  }

  /* --------------------------------------------------------------------------
     Form Submissions & Entity Operations
     -------------------------------------------------------------------------- */

  // Helper for submit button loading states
  function setButtonLoading(btn, isLoading, defaultText = 'Save') {
    if (!btn) return;
    if (isLoading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<svg class="icon" style="animation: spin 1s linear infinite;" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving...';
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || defaultText;
    }
  }

  // --- CLIENT FORMS ---
  // Create Client
  const createClientForm = document.getElementById('createClientForm');
  if (createClientForm) {
    createClientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = createClientForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true);

      const payload = {
        name: document.getElementById('clientName').value.trim(),
        phone: document.getElementById('clientPhone').value.trim() || null,
        email: document.getElementById('clientEmail').value.trim() || null,
        address: document.getElementById('clientAddress').value.trim(),
      };

      try {
        const newClient = await API.createClient(payload);
        AppState.addClient(newClient);
        UI.showToast(`Client "${newClient.name}" created successfully.`, 'success');
        UI.closeModal('createClientModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Edit Client
  const editClientForm = document.getElementById('editClientForm');
  if (editClientForm) {
    editClientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = editClientForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true);

      const clientId = Number(document.getElementById('editClientId').value);
      const payload = {
        name: document.getElementById('editClientName').value.trim(),
        phone: document.getElementById('editClientPhone').value.trim() || null,
        email: document.getElementById('editClientEmail').value.trim() || null,
        address: document.getElementById('editClientAddress').value.trim(),
      };

      try {
        const updated = await API.updateClient(clientId, payload);
        AppState.updateClient(updated);
        UI.showToast(`Client "${updated.name}" updated successfully.`, 'success');
        UI.closeModal('editClientModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Delete Client
  const deleteClientForm = document.getElementById('deleteClientForm');
  if (deleteClientForm) {
    deleteClientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = deleteClientForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true, 'Delete Client');

      const clientId = Number(document.getElementById('deleteClientId').value);

      try {
        await API.deleteClient(clientId);
        AppState.removeClient(clientId);
        UI.showToast('Client and associated records deleted.', 'info');
        UI.closeModal('deleteClientModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false, 'Delete Client');
      }
    });
  }

  // --- CASE FORMS ---
  // Create Case
  const createCaseForm = document.getElementById('createCaseForm');
  if (createCaseForm) {
    createCaseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = createCaseForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true);

      const payload = {
        case_number: document.getElementById('caseNumber').value.trim(),
        title: document.getElementById('caseTitle').value.trim(),
        court: document.getElementById('caseCourt').value.trim(),
        status: document.getElementById('caseStatus').value,
        opposite_party: document.getElementById('caseOppositeParty').value.trim(),
        client_id: Number(document.getElementById('caseFormClientId').value),
        description: document.getElementById('caseDescription').value.trim() || null,
      };

      try {
        const newCase = await API.createCase(payload);
        AppState.addCase(newCase);
        UI.showToast(`Case "${newCase.case_number}" filed successfully.`, 'success');
        UI.closeModal('createCaseModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Edit Case
  const editCaseForm = document.getElementById('editCaseForm');
  if (editCaseForm) {
    editCaseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = editCaseForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true);

      const caseId = Number(document.getElementById('editCaseId').value);
      const payload = {
        case_number: document.getElementById('editCaseNumber').value.trim(),
        title: document.getElementById('editCaseTitle').value.trim(),
        court: document.getElementById('editCaseCourt').value.trim(),
        status: document.getElementById('editCaseStatus').value,
        opposite_party: document.getElementById('editCaseOppositeParty').value.trim(),
        client_id: Number(document.getElementById('editCaseFormClientId').value),
        description: document.getElementById('editCaseDescription').value.trim() || null,
      };

      try {
        const updated = await API.updateCase(caseId, payload);
        AppState.updateCase(updated);
        UI.showToast(`Case "${updated.case_number}" updated.`, 'success');
        UI.closeModal('editCaseModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Delete Case
  const deleteCaseForm = document.getElementById('deleteCaseForm');
  if (deleteCaseForm) {
    deleteCaseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = deleteCaseForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true, 'Delete Case');

      const caseId = Number(document.getElementById('deleteCaseId').value);

      try {
        await API.deleteCase(caseId);
        AppState.removeCase(caseId);
        UI.showToast('Case and all associated hearings deleted.', 'info');
        UI.closeModal('deleteCaseModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false, 'Delete Case');
      }
    });
  }

  // --- HEARING FORMS ---
  // Schedule Hearing
  const scheduleHearingForm = document.getElementById('scheduleHearingForm');
  if (scheduleHearingForm) {
    scheduleHearingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = scheduleHearingForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true);

      const nextDateVal = document.getElementById('hearingNextDate').value;
      const payload = {
        case_id: Number(document.getElementById('hearingFormCaseId').value),
        hearing_date: document.getElementById('hearingDate').value,
        stage: document.getElementById('hearingStage').value.trim(),
        summary: document.getElementById('hearingSummary').value.trim() || null,
        next_hearing_date: nextDateVal ? nextDateVal : null,
      };

      try {
        const newHearing = await API.createHearing(payload);
        AppState.addHearing(newHearing);
        UI.showToast(`Hearing on ${UI.formatDate(newHearing.hearing_date)} scheduled.`, 'success');
        UI.closeModal('scheduleHearingModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Edit Hearing
  const editHearingForm = document.getElementById('editHearingForm');
  if (editHearingForm) {
    editHearingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = editHearingForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true);

      const hearingId = Number(document.getElementById('editHearingId').value);
      const nextDateVal = document.getElementById('editHearingNextDate').value;

      const payload = {
        case_id: Number(document.getElementById('editHearingFormCaseId').value),
        hearing_date: document.getElementById('editHearingDate').value,
        stage: document.getElementById('editHearingStage').value.trim(),
        summary: document.getElementById('editHearingSummary').value.trim() || null,
        next_hearing_date: nextDateVal ? nextDateVal : null,
      };

      try {
        const updated = await API.updateHearing(hearingId, payload);
        AppState.updateHearing(updated);
        UI.showToast('Hearing details updated successfully.', 'success');
        UI.closeModal('editHearingModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Quick Record Outcome
  const recordOutcomeForm = document.getElementById('recordOutcomeForm');
  if (recordOutcomeForm) {
    recordOutcomeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = recordOutcomeForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true, 'Save Proceedings');

      const hearingId = Number(document.getElementById('outcomeHearingId').value);
      const nextDateVal = document.getElementById('outcomeNextDate').value;

      const payload = {
        stage: document.getElementById('outcomeStage').value.trim(),
        summary: document.getElementById('outcomeSummary').value.trim() || null,
        next_hearing_date: nextDateVal ? nextDateVal : null,
      };

      try {
        const updated = await API.updateHearing(hearingId, payload);
        AppState.updateHearing(updated);
        UI.showToast('Hearing outcome and adjourned date recorded.', 'success');
        UI.closeModal('recordOutcomeModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false, 'Save Proceedings');
      }
    });
  }

  // Delete Hearing
  const deleteHearingForm = document.getElementById('deleteHearingForm');
  if (deleteHearingForm) {
    deleteHearingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = deleteHearingForm.querySelector('button[type=submit]');
      setButtonLoading(submitBtn, true, 'Delete Hearing');

      const hearingId = Number(document.getElementById('deleteHearingId').value);

      try {
        await API.deleteHearing(hearingId);
        AppState.removeHearing(hearingId);
        UI.showToast('Hearing removed from court diary.', 'info');
        UI.closeModal('deleteHearingModal');
      } catch (err) {
        UI.showToast(err.message, 'error');
      } finally {
        setButtonLoading(submitBtn, false, 'Delete Hearing');
      }
    });
  }

  // --- CLIENT PORTAL LOGIN FORM ---
  document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'portalLoginForm') {
      e.preventDefault();
      const input = document.getElementById('portalIdentifierInput');
      const errorBox = document.getElementById('portalLoginError');
      const submitBtn = document.getElementById('portalSubmitBtn');
      if (!input) return;

      const identifier = input.value.trim();
      if (!identifier) return;

      if (errorBox) errorBox.style.display = 'none';
      setButtonLoading(submitBtn, true, 'Accessing...');

      try {
        const client = await API.lookupClient(identifier);
        AppState.setPortalClient(client);
        UI.showToast(`Welcome to your case portal, ${client.name}!`, 'success');
        UI.renderPortal();
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err.message || 'Client account not found. Please verify your ID or phone number.';
          errorBox.style.display = 'block';
        } else {
          UI.showToast(err.message, 'error');
        }
      } finally {
        setButtonLoading(submitBtn, false, 'Access My Case Portal →');
      }
    }
  });

  // 10. Start the App!
  loadInitialData();
});
