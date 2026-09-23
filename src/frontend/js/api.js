/**
 * Advocate Diary System — API Service
 * Centralized Fetch client for FastAPI REST endpoints.
 */

const API = {
  baseUrl: '',

  /**
   * Core request dispatcher with error normalization
   */
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Handle 404 Not Found gracefully for empty collections
      if (response.status === 404) {
        // Backend raises 404 when no cases or hearings exist
        if (
          endpoint.startsWith('/cases/') ||
          endpoint.startsWith('/cases?') ||
          endpoint === '/cases/' ||
          endpoint.startsWith('/hearings/') ||
          endpoint.startsWith('/hearings?') ||
          endpoint === '/hearings/'
        ) {
          // If this is a list query (e.g. /cases/, /cases/client/1, /hearings/, /hearings/case/1)
          if (
            endpoint.includes('/client/') ||
            endpoint.includes('/case/') ||
            endpoint.endsWith('/cases/') ||
            endpoint.startsWith('/cases/?') ||
            endpoint.endsWith('/hearings/') ||
            endpoint.startsWith('/hearings/?')
          ) {
            return [];
          }
        }
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred.';
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            // Pydantic v2 validation error array
            errorMessage = data.detail
              .map((err) => {
                const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
                return `${field}: ${err.msg}`;
              })
              .join('; ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the backend server. Is the API running?');
      }
      throw err;
    }
  },

  /* --------------------------------------------------------------------------
     Clients Endpoints
     -------------------------------------------------------------------------- */
  async getClients(skip = 0, limit = 100) {
    return this.request(`/clients/?skip=${skip}&limit=${limit}`);
  },

  async getClient(clientId) {
    return this.request(`/clients/${clientId}`);
  },

  async lookupClient(identifier) {
    return this.request(`/clients/portal/lookup?identifier=${encodeURIComponent(identifier)}`);
  },

  async createClient(clientData) {
    return this.request('/clients/', {
      method: 'POST',
      body: clientData,
    });
  },

  async updateClient(clientId, clientData) {
    return this.request(`/clients/${clientId}`, {
      method: 'PATCH',
      body: clientData,
    });
  },

  async deleteClient(clientId) {
    return this.request(`/clients/${clientId}`, {
      method: 'DELETE',
    });
  },

  /* --------------------------------------------------------------------------
     Cases Endpoints
     -------------------------------------------------------------------------- */
  async getCases(skip = 0, limit = 100) {
    return this.request(`/cases/?skip=${skip}&limit=${limit}`);
  },

  async getCase(caseId) {
    return this.request(`/cases/case/${caseId}`);
  },

  async getCasesByClient(clientId, skip = 0, limit = 100) {
    return this.request(`/cases/client/${clientId}?skip=${skip}&limit=${limit}`);
  },

  async createCase(caseData) {
    return this.request('/cases/', {
      method: 'POST',
      body: caseData,
    });
  },

  async updateCase(caseId, caseData) {
    return this.request(`/cases/case/${caseId}`, {
      method: 'PATCH',
      body: caseData,
    });
  },

  async deleteCase(caseId) {
    return this.request(`/cases/${caseId}`, {
      method: 'DELETE',
    });
  },

  /* --------------------------------------------------------------------------
     Hearings Endpoints
     -------------------------------------------------------------------------- */
  async getHearings(skip = 0, limit = 100) {
    return this.request(`/hearings/?skip=${skip}&limit=${limit}`);
  },

  async getHearing(hearingId) {
    return this.request(`/hearings/hearing/${hearingId}`);
  },

  async getHearingsByCase(caseId, skip = 0, limit = 100) {
    return this.request(`/hearings/case/${caseId}?skip=${skip}&limit=${limit}`);
  },

  async createHearing(hearingData) {
    return this.request('/hearings/', {
      method: 'POST',
      body: hearingData,
    });
  },

  async updateHearing(hearingId, hearingData) {
    return this.request(`/hearings/hearing/${hearingId}`, {
      method: 'PATCH',
      body: hearingData,
    });
  },

  async deleteHearing(hearingId) {
    return this.request(`/hearings/${hearingId}`, {
      method: 'DELETE',
    });
  },

  /* --------------------------------------------------------------------------
     System Health
     -------------------------------------------------------------------------- */
  async checkHealth() {
    return this.request('/api/health');
  },
};

window.API = API;
