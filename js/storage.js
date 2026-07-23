/**
 * storage.js - Local Storage Management
 * Handles saving and retrieving participants, test results, and settings.
 * Pre-populates mock data if storage is empty to demonstrate the Admin panel features.
 */

const STORAGE_KEYS = {
  PARTICIPANTS: 'web_psikotes_participants',
  RESULTS: 'web_psikotes_results',
  SETTINGS: 'web_psikotes_settings',
  REGISTERED_CANDIDATES: 'web_psikotes_registered_candidates',
  POSITIONS: 'web_psikotes_positions'
};

const StorageManager = {
  /**
   * Get all participants from localStorage
   */
  getParticipants() {
    this._initDataIfEmpty();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) || [];
  },

  /**
   * Get all results from localStorage
   */
  getResults() {
    this._initDataIfEmpty();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS)) || [];
  },

  /**
   * Get settings from localStorage
   */
  getSettings() {
    this._initDataIfEmpty();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
  },

  /**
   * Add a new participant
   */
  saveParticipant(participant) {
    const participants = this.getParticipants();
    participants.push(participant);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  },

  /**
   * Add a new result
   */
  saveResult(result) {
    const results = this.getResults();
    results.push(result);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
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
    this._initDataIfEmpty();
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
    return true;
  },

  /**
   * Delete a registered candidate by email
   */
  deleteRegisteredCandidate(email) {
    let candidates = this.getRegisteredCandidates();
    candidates = candidates.filter(c => c.email !== email);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_CANDIDATES, JSON.stringify(candidates));
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
      return true;
    }
    return false;
  },

  /**
   * Get all vacancy positions
   */
  getPositions() {
    this._initDataIfEmpty();
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
    return true;
  },

  /**
   * Delete a vacancy position
   */
  deletePosition(posName) {
    let positions = this.getPositions();
    positions = positions.filter(p => p !== posName);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
    return true;
  },

  /**
   * Checks if storage is empty, and initializes it with mock data if necessary.
   */
  _initDataIfEmpty() {
    const hasParticipants = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    const hasResults = localStorage.getItem(STORAGE_KEYS.RESULTS);
    const hasSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const hasRegisteredCandidates = localStorage.getItem(STORAGE_KEYS.REGISTERED_CANDIDATES);
    const hasPositions = localStorage.getItem(STORAGE_KEYS.POSITIONS);

    if (!hasParticipants || !hasResults || !hasSettings || !hasRegisteredCandidates || !hasPositions) {
      const mockParticipants = [
        {
          id: "PSKT-20260720-001",
          name: "Rian Hidayat",
          email: "rian.hidayat@example.com",
          phone: "081234567890",
          position: "Social Media Specialist",
          experience: "Fresh Graduate",
          education: "S1 Ilmu Komunikasi",
          domicile: "Jakarta",
          testDate: "2026-07-20T10:15:30.000Z"
        },
        {
          id: "PSKT-20260721-002",
          name: "Sarah Amalia",
          email: "sarah.amalia@example.com",
          phone: "082345678901",
          position: "Copywriter",
          experience: "1 - 3 Tahun",
          education: "S1 Sastra Indonesia",
          domicile: "Bandung",
          testDate: "2026-07-21T09:30:00.000Z"
        },
        {
          id: "PSKT-20260721-003",
          name: "Budi Santoso",
          email: "budi.santoso@example.com",
          phone: "083456789012",
          position: "Content Writer",
          experience: "3 - 5 Tahun",
          education: "D3 Humas",
          domicile: "Surabaya",
          testDate: "2026-07-21T14:45:00.000Z"
        },
        {
          id: "PSKT-20260722-004",
          name: "Dewi Lestari",
          email: "dewi.lestari@example.com",
          phone: "084567890123",
          position: "Data Analyst",
          experience: "5 - 10 Tahun",
          education: "S1 Statistika",
          domicile: "Yogyakarta",
          testDate: "2026-07-22T08:15:00.000Z"
        },
        {
          id: "PSKT-20260722-005",
          name: "Farhan Ramadhan",
          email: "farhan.r@example.com",
          phone: "085678901234",
          position: "Social Media Specialist",
          experience: "> 10 Tahun",
          education: "S1 Hubungan Internasional",
          domicile: "Medan",
          testDate: "2026-07-22T11:00:00.000Z"
        }
      ];

      const mockResults = [
        {
          participantId: "PSKT-20260720-001",
          scores: {
            kepribadian: 92,
            logika: 90,
            copywriting: 80,
            kreativitas: 90,
            analisa_data: 80
          },
          totalScore: 86,
          category: "Direkomendasikan",
          answers: {}
        },
        {
          participantId: "PSKT-20260721-002",
          scores: {
            kepribadian: 95,
            logika: 80,
            copywriting: 100,
            kreativitas: 95,
            analisa_data: 70
          },
          totalScore: 88,
          category: "Direkomendasikan",
          answers: {}
        },
        {
          participantId: "PSKT-20260721-003",
          scores: {
            kepribadian: 72,
            logika: 70,
            copywriting: 75,
            kreativitas: 80,
            analisa_data: 60
          },
          totalScore: 71,
          category: "Dipertimbangkan",
          answers: {}
        },
        {
          participantId: "PSKT-20260722-004",
          scores: {
            kepribadian: 88,
            logika: 100,
            copywriting: 70,
            kreativitas: 90,
            analisa_data: 100
          },
          totalScore: 90,
          category: "Direkomendasikan",
          answers: {}
        },
        {
          participantId: "PSKT-20260722-005",
          scores: {
            kepribadian: 60,
            logika: 60,
            copywriting: 65,
            kreativitas: 70,
            analisa_data: 55
          },
          totalScore: 62,
          category: "Belum Sesuai",
          answers: {}
        }
      ];

      // Let's refine the total scores and classifications to match scoring standards exactly:
      mockResults.forEach((res, index) => {
        const p = mockParticipants.find(part => part.id === res.participantId);
        const sc = res.scores;
        const total = (sc.kepribadian + sc.logika + sc.copywriting + sc.kreativitas + sc.analisa_data) / 5;
        res.totalScore = Math.round(total);
        res.category = ScoreManager.getRecommendation(res.totalScore, p ? p.experience : undefined);
      });

      const mockRegisteredCandidates = [
        {
          name: "Rian Hidayat",
          email: "rian.hidayat@example.com",
          phone: "081234567890",
          position: "Social Media Specialist",
          experience: "Fresh Graduate",
          password: "password123",
          status: "completed"
        },
        {
          name: "Sarah Amalia",
          email: "sarah.amalia@example.com",
          phone: "082345678901",
          position: "Copywriter",
          experience: "1 - 3 Tahun",
          password: "password123",
          status: "completed"
        },
        {
          name: "Budi Santoso",
          email: "budi.santoso@example.com",
          phone: "083456789012",
          position: "Content Writer",
          experience: "3 - 5 Tahun",
          password: "password123",
          status: "completed"
        },
        {
          name: "Dewi Lestari",
          email: "dewi.lestari@example.com",
          phone: "084567890123",
          position: "Data Analyst",
          experience: "5 - 10 Tahun",
          password: "password123",
          status: "completed"
        },
        {
          name: "Farhan Ramadhan",
          email: "farhan.r@example.com",
          phone: "085678901234",
          position: "Social Media Specialist",
          experience: "> 10 Tahun",
          password: "password123",
          status: "completed"
        },
        {
          name: "Rudi Tabuti",
          email: "peserta1@example.com",
          phone: "089876543210",
          position: "Digital Marketer",
          experience: "1 - 3 Tahun",
          password: "pass123",
          status: "registered"
        },
        {
          name: "Dewi Sartika",
          email: "peserta2@example.com",
          phone: "087712345678",
          position: "Data Analyst",
          experience: "Fresh Graduate",
          password: "pass123",
          status: "registered"
        }
      ];

      const mockSettings = {
        timerDuration: 60, // minutes
        theme: 'light'
      };

      const mockPositions = [
        "Social Media Specialist",
        "Copywriter",
        "Content Writer",
        "Data Analyst",
        "Digital Marketer"
      ];

      if (!hasParticipants) localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(mockParticipants));
      if (!hasResults) localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(mockResults));
      if (!hasSettings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mockSettings));
      if (!hasRegisteredCandidates) localStorage.setItem(STORAGE_KEYS.REGISTERED_CANDIDATES, JSON.stringify(mockRegisteredCandidates));
      if (!hasPositions) localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(mockPositions));
    }
  }
};
