/**
 * storage.js - Local Storage Management with n8n Sync Integration
 * Handles saving and retrieving participants, test results, and settings.
 * Pre-populates mock data if storage is empty to demonstrate the Admin panel features.
 * Integrates with n8n to sync database state to SumoPod MySQL.
 */

const N8N_CONFIG = {
  ENABLED: true, // Ubah ke true jika Anda sudah mensetup webhook n8n
  WEBHOOK_URL: 'https://n8n-m1wtmfpb5ajg.n8x.biz.id/webhook/3057deac-287b-4a88-a68a-96a541a811d6' // Menggunakan Production Webhook URL n8n
};

const STORAGE_KEYS = {
  PARTICIPANTS: 'web_psikotes_participants',
  RESULTS: 'web_psikotes_results',
  SETTINGS: 'web_psikotes_settings',
  REGISTERED_CANDIDATES: 'web_psikotes_registered_candidates',
  POSITIONS: 'web_psikotes_positions'
};

const StorageManager = {
  n8nConfig: N8N_CONFIG,

  /**
   * Mengunduh seluruh database terpusat dari n8n ke localStorage
   */
  async syncFromN8N() {
    if (!N8N_CONFIG.ENABLED) return;
    try {
      const response = await fetch(N8N_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'getAllData' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result && result.success && result.data) {
        const resData = result.data;
        if (resData.participants) localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(resData.participants));
        if (resData.results) localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(resData.results));
        if (resData.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(resData.settings));
        if (resData.registered_candidates) localStorage.setItem(STORAGE_KEYS.REGISTERED_CANDIDATES, JSON.stringify(resData.registered_candidates));
        if (resData.positions) localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(resData.positions));
        console.log("n8n database sync completed successfully.");
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data dari n8n:", e);
    }
  },

  /**
   * Helper untuk sinkronisasi aksi perubahan data ke n8n di background
   */
  async _syncActionToN8N(action, payload) {
    if (!N8N_CONFIG.ENABLED) return;
    try {
      const response = await fetch(N8N_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, payload })
      });
      if (!response.ok) {
        console.warn(`n8n sync failed for action: ${action}`, response.statusText);
      }
    } catch (e) {
      console.error(`Gagal mengirim sinkronisasi aksi ${action} ke n8n:`, e);
    }
  },

  /**
   * Get all participants from localStorage
   */
  getParticipants() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) || [];
  },

  /**
   * Get all results from localStorage
   */
  getResults() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS)) || [];
  },

  /**
   * Get settings from localStorage
   */
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || { timerDuration: 60, theme: 'light' };
  },

  /**
   * Add a new participant
   */
  saveParticipant(participant) {
    const participants = this.getParticipants();
    participants.push(participant);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    this._syncActionToN8N('saveParticipant', participant);
  },

  /**
   * Add a new result
   */
  saveResult(result) {
    const results = this.getResults();
    results.push(result);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    this._syncActionToN8N('saveResult', result);
  },

  /**
   * Delete a participant and their corresponding results
   */
  deleteParticipant(id) {
    let participants = this.getParticipants();
    let results = this.getResults();

    participants = participants.filter(p => p.id !== id);
    results = results.filter(r => r.participantId !== id);

    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));

    this._syncActionToN8N('deleteParticipant', { id });
  },

  /**
   * Get participant detailed results (joined data)
   */
  getParticipantDetails(id) {
    const participants = this.getParticipants();
    const results = this.getResults();

    const participant = participants.find(p => p.id === id);
    const result = results.find(r => r.participantId === id);

    if (!participant) return null;
    return {
      ...participant,
      results: result || null
    };
  },

  /**
   * Get all registered candidates from localStorage
   */
  getRegisteredCandidates() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_CANDIDATES)) || [];
  },

  /**
   * Add a new registered candidate
   */
  saveRegisteredCandidate(candidate) {
    const candidates = this.getRegisteredCandidates();
    // Prevent duplicate email registration
    if (candidates.some(c => c.email === candidate.email)) return false;
    candidates.push(candidate);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_CANDIDATES, JSON.stringify(candidates));

    this._syncActionToN8N('saveRegisteredCandidate', candidate);
    return true;
  },

  /**
   * Delete a registered candidate by email
   */
  deleteRegisteredCandidate(email) {
    let candidates = this.getRegisteredCandidates();
    candidates = candidates.filter(c => c.email !== email);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_CANDIDATES, JSON.stringify(candidates));

    this._syncActionToN8N('deleteRegisteredCandidate', { email });
  },

  /**
   * Update candidate exam status
   */
  updateCandidateStatus(email, status) {
    const candidates = this.getRegisteredCandidates();
    const candidate = candidates.find(c => c.email === email);
    if (candidate) {
      candidate.status = status; // 'registered', 'active', 'completed'
      localStorage.setItem(STORAGE_KEYS.REGISTERED_CANDIDATES, JSON.stringify(candidates));

      this._syncActionToN8N('updateCandidateStatus', { email, status });
      return true;
    }
    return false;
  },

  /**
   * Get all vacancy positions
   */
  getPositions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSITIONS)) || [];
  },

  /**
   * Save a new vacancy position
   */
  savePosition(posName) {
    const positions = this.getPositions();
    if (positions.includes(posName)) return false;
    positions.push(posName);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));

    this._syncActionToN8N('savePosition', { position: posName });
    return true;
  },

  /**
   * Delete a vacancy position
   */
  deletePosition(posName) {
    let positions = this.getPositions();
    positions = positions.filter(p => p !== posName);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));

    this._syncActionToN8N('deletePosition', { position: posName });
    return true;
  },


};

