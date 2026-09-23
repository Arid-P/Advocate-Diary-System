/**
 * Advocate Diary System — State Store
 * Manages in-memory data collections, active filters, and reactive events.
 */

const AppState = {
  data: {
    clients: [],
    cases: [],
    hearings: [],
    currentView: 'dashboard',
    theme: localStorage.getItem('advocate_theme') || 'dark',
    portalClient: (() => {
      try {
        return JSON.parse(sessionStorage.getItem('advocate_portal_client')) || null;
      } catch {
        return null;
      }
    })(),
    filters: {
      clientSearch: '',
      caseStatus: 'all',
      caseClientId: 'all',
      caseSearch: '',
      hearingDateFilter: 'upcoming', // 'upcoming', 'today', 'week', 'past', 'all'
      hearingCaseId: 'all',
      hearingSearch: '',
    },
  },

  listeners: new Set(),

  /**
   * Subscribe to state change notifications
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notify(event, payload) {
    this.listeners.forEach((fn) => {
      try {
        fn(event, payload, this.data);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    });
  },

  /* --------------------------------------------------------------------------
     Theme Management
     -------------------------------------------------------------------------- */
  setTheme(theme) {
    this.data.theme = theme;
    localStorage.setItem('advocate_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.notify('theme_change', theme);
  },

  toggleTheme() {
    const nextTheme = this.data.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  },

  /* --------------------------------------------------------------------------
     View Navigation
     -------------------------------------------------------------------------- */
  setView(viewName) {
    if (['dashboard', 'clients', 'cases', 'hearings', 'portal'].includes(viewName)) {
      this.data.currentView = viewName;
      this.notify('view_change', viewName);
    }
  },

  /* --------------------------------------------------------------------------
     Portal Client Access
     -------------------------------------------------------------------------- */
  setPortalClient(client) {
    this.data.portalClient = client;
    try {
      if (client) {
        sessionStorage.setItem('advocate_portal_client', JSON.stringify(client));
      } else {
        sessionStorage.removeItem('advocate_portal_client');
      }
    } catch (e) {
      console.warn('Could not persist portal client in sessionStorage', e);
    }
    this.notify('portal_client_updated', client);
  },

  clearPortalClient() {
    this.setPortalClient(null);
  },

  getPortalClient() {
    return this.data.portalClient;
  },

  /* --------------------------------------------------------------------------
     Clients Mutators
     -------------------------------------------------------------------------- */
  setClients(clients) {
    this.data.clients = Array.isArray(clients) ? clients : [];
    this.notify('clients_updated', this.data.clients);
  },

  addClient(client) {
    this.data.clients.unshift(client);
    this.notify('clients_updated', this.data.clients);
  },

  updateClient(updatedClient) {
    this.data.clients = this.data.clients.map((c) =>
      c.id === updatedClient.id ? updatedClient : c
    );
    if (this.data.portalClient && this.data.portalClient.id === updatedClient.id) {
      this.setPortalClient(updatedClient);
    }
    this.notify('clients_updated', this.data.clients);
  },

  removeClient(clientId) {
    this.data.clients = this.data.clients.filter((c) => c.id !== clientId);
    if (this.data.portalClient && this.data.portalClient.id === clientId) {
      this.clearPortalClient();
    }
    // Cascade delete cases and hearings associated with this client in memory
    const removedCaseIds = this.data.cases
      .filter((c) => c.client_id === clientId)
      .map((c) => c.id);
    this.data.cases = this.data.cases.filter((c) => c.client_id !== clientId);
    this.data.hearings = this.data.hearings.filter(
      (h) => !removedCaseIds.includes(h.case_id)
    );
    this.notify('clients_updated', this.data.clients);
    this.notify('cases_updated', this.data.cases);
    this.notify('hearings_updated', this.data.hearings);
  },

  getClientById(clientId) {
    const id = Number(clientId);
    return this.data.clients.find((c) => c.id === id) || null;
  },

  /* --------------------------------------------------------------------------
     Cases Mutators
     -------------------------------------------------------------------------- */
  setCases(cases) {
    this.data.cases = Array.isArray(cases) ? cases : [];
    this.notify('cases_updated', this.data.cases);
  },

  addCase(caseItem) {
    this.data.cases.unshift(caseItem);
    this.notify('cases_updated', this.data.cases);
  },

  updateCase(updatedCase) {
    this.data.cases = this.data.cases.map((c) =>
      c.id === updatedCase.id ? updatedCase : c
    );
    this.notify('cases_updated', this.data.cases);
  },

  removeCase(caseId) {
    this.data.cases = this.data.cases.filter((c) => c.id !== caseId);
    // Cascade delete hearings associated with this case in memory
    this.data.hearings = this.data.hearings.filter((h) => h.case_id !== caseId);
    this.notify('cases_updated', this.data.cases);
    this.notify('hearings_updated', this.data.hearings);
  },

  getCaseById(caseId) {
    const id = Number(caseId);
    return this.data.cases.find((c) => c.id === id) || null;
  },

  getCasesForClient(clientId) {
    const id = Number(clientId);
    return this.data.cases.filter((c) => c.client_id === id);
  },

  /* --------------------------------------------------------------------------
     Hearings Mutators
     -------------------------------------------------------------------------- */
  setHearings(hearings) {
    this.data.hearings = Array.isArray(hearings) ? hearings : [];
    this.notify('hearings_updated', this.data.hearings);
  },

  addHearing(hearing) {
    this.data.hearings.unshift(hearing);
    this.notify('hearings_updated', this.data.hearings);
  },

  updateHearing(updatedHearing) {
    this.data.hearings = this.data.hearings.map((h) =>
      h.id === updatedHearing.id ? updatedHearing : h
    );
    this.notify('hearings_updated', this.data.hearings);
  },

  removeHearing(hearingId) {
    this.data.hearings = this.data.hearings.filter((h) => h.id !== hearingId);
    this.notify('hearings_updated', this.data.hearings);
  },

  getHearingById(hearingId) {
    const id = Number(hearingId);
    return this.data.hearings.find((h) => h.id === id) || null;
  },

  getHearingsForCase(caseId) {
    const id = Number(caseId);
    return this.data.hearings.filter((h) => h.case_id === id);
  },

  /* --------------------------------------------------------------------------
     Filtering Selectors
     -------------------------------------------------------------------------- */
  getFilteredClients() {
    const q = this.data.filters.clientSearch.trim().toLowerCase();
    if (!q) return this.data.clients;

    return this.data.clients.filter((client) => {
      const name = (client.name || '').toLowerCase();
      const email = (client.email || '').toLowerCase();
      const phone = (client.phone || '').toLowerCase();
      const address = (client.address || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        address.includes(q)
      );
    });
  },

  getFilteredCases() {
    const statusFilter = this.data.filters.caseStatus;
    const clientFilter = this.data.filters.caseClientId;
    const q = this.data.filters.caseSearch.trim().toLowerCase();

    return this.data.cases.filter((c) => {
      // Status filter
      if (statusFilter !== 'all' && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Client filter
      if (clientFilter !== 'all' && Number(c.client_id) !== Number(clientFilter)) {
        return false;
      }
      // Search query
      if (q) {
        const caseNumber = (c.case_number || '').toLowerCase();
        const title = (c.title || '').toLowerCase();
        const court = (c.court || '').toLowerCase();
        const oppositeParty = (c.opposite_party || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const client = this.getClientById(c.client_id);
        const clientName = client ? client.name.toLowerCase() : '';

        return (
          caseNumber.includes(q) ||
          title.includes(q) ||
          court.includes(q) ||
          oppositeParty.includes(q) ||
          desc.includes(q) ||
          clientName.includes(q)
        );
      }
      return true;
    });
  },

  getFilteredHearings() {
    const dateFilter = this.data.filters.hearingDateFilter;
    const caseFilter = this.data.filters.hearingCaseId;
    const q = this.data.filters.hearingSearch.trim().toLowerCase();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    const weekStr = weekFromNow.toISOString().split('T')[0];

    return this.data.hearings
      .filter((h) => {
        // Case filter
        if (caseFilter !== 'all' && Number(h.case_id) !== Number(caseFilter)) {
          return false;
        }

        // Date filter
        const hearingDateStr = (h.hearing_date || '').split('T')[0];
        if (dateFilter === 'today') {
          if (hearingDateStr !== todayStr) return false;
        } else if (dateFilter === 'upcoming') {
          if (hearingDateStr < todayStr) return false;
        } else if (dateFilter === 'week') {
          if (hearingDateStr < todayStr || hearingDateStr > weekStr) return false;
        } else if (dateFilter === 'past') {
          if (hearingDateStr >= todayStr) return false;
        }

        // Text query
        if (q) {
          const stage = (h.stage || '').toLowerCase();
          const summary = (h.summary || '').toLowerCase();
          const c = this.getCaseById(h.case_id);
          const caseTitle = c ? c.title.toLowerCase() : '';
          const caseNumber = c ? c.case_number.toLowerCase() : '';
          return (
            stage.includes(q) ||
            summary.includes(q) ||
            caseTitle.includes(q) ||
            caseNumber.includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.hearing_date);
        const dateB = new Date(b.hearing_date);
        return dateA - dateB;
      });
  },

  /* --------------------------------------------------------------------------
     Dashboard KPIs & Aggregations
     -------------------------------------------------------------------------- */
  getKPIs() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const in48Hours = new Date();
    in48Hours.setDate(now.getDate() + 2);
    const in48HoursStr = in48Hours.toISOString().split('T')[0];

    const totalClients = this.data.clients.length;
    const activeCases = this.data.cases.filter(
      (c) => c.status.toLowerCase() === 'open' || c.status.toLowerCase() === 'pending'
    ).length;
    const closedCases = this.data.cases.filter(
      (c) => c.status.toLowerCase() === 'closed'
    ).length;

    const upcomingHearings = this.data.hearings.filter((h) => {
      const d = (h.hearing_date || '').split('T')[0];
      return d >= todayStr;
    });

    const urgentHearings = this.data.hearings.filter((h) => {
      const d = (h.hearing_date || '').split('T')[0];
      return d >= todayStr && d <= in48HoursStr;
    });

    return {
      totalClients,
      activeCases,
      closedCases,
      upcomingHearingsCount: upcomingHearings.length,
      upcomingHearingsList: upcomingHearings.slice(0, 5),
      urgentHearings,
    };
  },
};

window.AppState = AppState;
