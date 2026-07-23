/**
 * admin.js - Admin Dashboard & Result Details Page Controller
 * Manages tables, statistics, filtering, searches, deleting, Excel exports,
 * and loading individual results.
 */

const AdminManager = {
  activeFilters: {
    search: '',
    position: '',
    category: '',
    dateStart: '',
    dateEnd: ''
  },

  /**
   * Initializes the Dashboard UI
   */
  initDashboard() {
    this.loadMetrics();
    this.populateFilterDropdowns();
    this.renderParticipantsTable();
    this.setupDashboardEvents();
    
    // Initial chart draw
    const results = StorageManager.getResults();
    ChartManager.renderDashboardCharts(results);
  },

  /**
   * Calculates and displays high-level dashboard metrics
   */
  loadMetrics() {
    const participants = StorageManager.getParticipants();
    const results = StorageManager.getResults();

    const count = participants.length;
    let avg = 0;
    let max = 0;
    let min = 0;

    if (results.length > 0) {
      const scores = results.map(r => r.totalScore);
      avg = Math.round(scores.reduce((a, b) => a + b, 0) / count);
      max = Math.max(...scores);
      min = Math.min(...scores);
    }

    // Bind to DOM
    this._safeSetText('metricTotalParticipants', count);
    this._safeSetText('metricAverageScore', avg + '%');
    this._safeSetText('metricMaxScore', max + '%');
    this._safeSetText('metricMinScore', min + '%');
  },

  /**
   * Populates the Position dropdown dynamic options from participants database
   */
  populateFilterDropdowns() {
    const filterPosition = document.getElementById('filterPosition');
    if (!filterPosition) return;

    const participants = StorageManager.getParticipants();
    // Get unique positions
    const positions = [...new Set(participants.map(p => p.position).filter(Boolean))];

    // Clear but keep first option
    filterPosition.innerHTML = '<option value="">Semua Posisi</option>';
    positions.forEach(pos => {
      const opt = document.createElement('option');
      opt.value = pos;
      opt.innerText = pos;
      filterPosition.appendChild(opt);
    });
  },

  /**
   * Filters and retrieves participants based on active filters
   */
  getFilteredData() {
    const participants = StorageManager.getParticipants();
    const results = StorageManager.getResults();

    // Map together
    const joined = participants.map(p => {
      const res = results.find(r => r.participantId === p.id) || {
        totalScore: 0,
        category: 'Belum Sesuai',
        scores: {}
      };
      return { ...p, result: res };
    });

    return joined.filter(item => {
      // 1. Search filter (Name or Email)
      const nameMatch = item.name.toLowerCase().includes(this.activeFilters.search.toLowerCase());
      const emailMatch = item.email.toLowerCase().includes(this.activeFilters.search.toLowerCase());
      const searchMatch = nameMatch || emailMatch;

      // 2. Position filter
      const positionMatch = !this.activeFilters.position || item.position === this.activeFilters.position;

      // 3. Category filter
      const categoryMatch = !this.activeFilters.category || item.result.category === this.activeFilters.category;

      // 4. Date range filter
      let dateMatch = true;
      if (this.activeFilters.dateStart || this.activeFilters.dateEnd) {
        const testDate = new Date(item.testDate);
        testDate.setHours(0, 0, 0, 0); // Normalize time for date comparisons

        if (this.activeFilters.dateStart) {
          const start = new Date(this.activeFilters.dateStart);
          start.setHours(0, 0, 0, 0);
          if (testDate < start) dateMatch = false;
        }
        if (this.activeFilters.dateEnd) {
          const end = new Date(this.activeFilters.dateEnd);
          end.setHours(23, 59, 59, 999);
          if (testDate > end) dateMatch = false;
        }
      }

      return searchMatch && positionMatch && categoryMatch && dateMatch;
    });
  },

  /**
   * Renders the table list of candidates
   */
  renderParticipantsTable() {
    const tableBody = document.getElementById('participantsTableBody');
    if (!tableBody) return;

    const filtered = this.getFilteredData();
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4 text-muted">
            Tidak ada data peserta ditemukan.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((p, idx) => {
      const formattedDate = new Date(p.testDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const badgeClass = ScoreManager.getRecommendationBadgeClass(p.result.category);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="align-middle">${idx + 1}</td>
        <td class="align-middle fw-600">${p.name}</td>
        <td class="align-middle text-muted">${p.email}</td>
        <td class="align-middle">${p.phone}</td>
        <td class="align-middle"><span class="badge bg-light text-dark font-12">${p.position}</span></td>
        <td class="align-middle text-nowrap">${formattedDate}</td>
        <td class="align-middle text-center fw-700 color-primary">${p.result.totalScore}%</td>
        <td class="align-middle"><span class="badge ${badgeClass} font-11 rounded-pill px-2.5 py-1.5">${p.result.category}</span></td>
        <td class="align-middle text-nowrap text-end">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="AdminManager.viewDetail('${p.id}')">
            <i class="bi bi-eye"></i> Lihat
          </button>
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="PDFManager.downloadPDF('${p.id}')">
            <i class="bi bi-file-pdf"></i> PDF
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="AdminManager.deleteCandidate('${p.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  },

  /**
   * Sets up listener events for admin inputs and filtering
   */
  setupDashboardEvents() {
    const inputSearch = document.getElementById('searchName');
    const filterPosition = document.getElementById('filterPosition');
    const filterCategory = document.getElementById('filterCategory');
    const filterDateStart = document.getElementById('filterDateStart');
    const filterDateEnd = document.getElementById('filterDateEnd');
    const btnResetFilters = document.getElementById('btnResetFilters');

    const handleFilterChange = () => {
      this.activeFilters.search = inputSearch ? inputSearch.value : '';
      this.activeFilters.position = filterPosition ? filterPosition.value : '';
      this.activeFilters.category = filterCategory ? filterCategory.value : '';
      this.activeFilters.dateStart = filterDateStart ? filterDateStart.value : '';
      this.activeFilters.dateEnd = filterDateEnd ? filterDateEnd.value : '';

      this.renderParticipantsTable();
    };

    if (inputSearch) inputSearch.addEventListener('input', handleFilterChange);
    if (filterPosition) filterPosition.addEventListener('change', handleFilterChange);
    if (filterCategory) filterCategory.addEventListener('change', handleFilterChange);
    if (filterDateStart) filterDateStart.addEventListener('change', handleFilterChange);
    if (filterDateEnd) filterDateEnd.addEventListener('change', handleFilterChange);

    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        if (inputSearch) inputSearch.value = '';
        if (filterPosition) filterPosition.value = '';
        if (filterCategory) filterCategory.value = '';
        if (filterDateStart) filterDateStart.value = '';
        if (filterDateEnd) filterDateEnd.value = '';

        this.activeFilters = { search: '', position: '', category: '', dateStart: '', dateEnd: '' };
        this.renderParticipantsTable();
      });
    }
  },

  /**
   * Redirects to the result detail page
   */
  viewDetail(id) {
    window.location.href = `result.html?id=${id}`;
  },

  /**
   * Deletes a candidate with SweetAlert2 confirmation dialog
   */
  deleteCandidate(id) {
    Swal.fire({
      title: 'Hapus Peserta?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        StorageManager.deleteParticipant(id);
        
        // Refresh dashboard components
        this.loadMetrics();
        this.populateFilterDropdowns();
        this.renderParticipantsTable();
        
        // Redraw charts
        const results = StorageManager.getResults();
        ChartManager.renderDashboardCharts(results);

        Swal.fire({
          title: 'Terhapus!',
          text: 'Data peserta berhasil dihapus.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  },

  /**
   * Exports the filtered candidate database into a CSV format compatible with Excel.
   */
  exportToExcel() {
    const filteredData = this.getFilteredData();
    if (filteredData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Ekspor Kosong',
        text: 'Tidak ada data peserta yang memenuhi kriteria filter untuk diekspor.'
      });
      return;
    }

    // Build CSV Content. Excel needs BOM \uFEFF to load UTF-8 encoding correctly
    let csvContent = "\uFEFF";
    
    // Headers
    const headers = [
      "No", "ID Peserta", "Nama Lengkap", "Email", "No HP", "Posisi Dilamar", 
      "Pendidikan", "Domisili", "Tanggal Tes", 
      "Skor Kepribadian", "Skor Logika", "Skor Copywriting", "Skor Kreativitas", "Skor Analisa Data",
      "Skor Akhir", "Kategori Hasil"
    ];
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    // Row parsing
    filteredData.forEach((item, idx) => {
      const formattedDate = new Date(item.testDate).toLocaleString('id-ID');
      const row = [
        idx + 1,
        item.id,
        item.name,
        item.email,
        item.phone,
        item.position,
        item.education || "-",
        item.domicile || "-",
        formattedDate,
        item.result.scores.kepribadian || 0,
        item.result.scores.logika || 0,
        item.result.scores.copywriting || 0,
        item.result.scores.kreativitas || 0,
        item.result.scores.analisa_data || 0,
        item.result.totalScore || 0,
        item.result.category
      ];
      csvContent += row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",") + "\n";
    });

    // Download element creation
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const dateString = new Date().toISOString().split('T')[0];
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Rekap_Hasil_Psikotes_${dateString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: 'success',
      title: 'Ekspor Berhasil',
      text: 'File rekapitulasi data Excel (.csv) berhasil diunduh.',
      timer: 2000,
      showConfirmButton: false
    });
  },

  /**
   * Initializes the candidate detail page (result.html)
   */
  initResultDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID Peserta tidak ditentukan!',
        confirmButtonText: 'Kembali ke Dashboard'
      }).then(() => {
        window.location.href = 'dashboard.html';
      });
      return;
    }

    const details = StorageManager.getParticipantDetails(id);
    if (!details) {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Ditemukan',
        text: 'Data peserta tidak ditemukan di database!',
        confirmButtonText: 'Kembali ke Dashboard'
      }).then(() => {
        window.location.href = 'dashboard.html';
      });
      return;
    }

    // Render text data
    this._safeSetText('resID', details.id);
    this._safeSetText('resName', details.name);
    this._safeSetText('resEmail', details.email);
    this._safeSetText('resPhone', details.phone);
    this._safeSetText('resPosition', details.position);
    this._safeSetText('resEducation', details.education || '-');
    this._safeSetText('resDomicile', details.domicile || '-');

    const formattedDate = new Date(details.testDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
    this._safeSetText('resDate', formattedDate);

    // Score details
    this._safeSetText('scoreKepribadian', details.results.scores.kepribadian);
    this._safeSetText('scoreLogika', details.results.scores.logika);
    this._safeSetText('scoreCopywriting', details.results.scores.copywriting);
    this._safeSetText('scoreKreativitas', details.results.scores.kreativitas);
    this._safeSetText('scoreAnalisaData', details.results.scores.analisa_data);

    this._safeSetText('scoreTotal', details.results.totalScore + '%');

    const badgeClass = ScoreManager.getRecommendationBadgeClass(details.results.category);
    const badgeEl = document.getElementById('resCategoryBadge');
    if (badgeEl) {
      badgeEl.className = `badge ${badgeClass} font-14 px-3 py-2 rounded-pill`;
      badgeEl.innerText = details.results.category;
    }

    // Dynamic interpretation text and recommendation message
    const recTextEl = document.getElementById('resRecommendationText');
    if (recTextEl) {
      recTextEl.innerHTML = this.getRecommendationStatement(details.results.category, details.position);
    }

    // Draw Radar Chart
    ChartManager.renderRadarChart('chartRadarDetail', details.results.scores);

    // Setup action buttons on details page
    const btnDownload = document.getElementById('btnDownloadPDF');
    const btnPrint = document.getElementById('btnPrintResult');
    const btnDelete = document.getElementById('btnDeleteResult');

    if (btnDownload) {
      btnDownload.addEventListener('click', () => PDFManager.downloadPDF(id));
    }
    if (btnPrint) {
      btnPrint.addEventListener('click', () => PDFManager.printResult());
    }
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        Swal.fire({
          title: 'Hapus Peserta?',
          text: "Data yang dihapus tidak dapat dikembalikan!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#EF4444',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Ya, Hapus!',
          cancelButtonText: 'Batal'
        }).then((res) => {
          if (res.isConfirmed) {
            StorageManager.deleteParticipant(id);
            Swal.fire({
              title: 'Terhapus!',
              text: 'Data peserta berhasil dihapus.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.href = 'dashboard.html';
            });
          }
        });
      });
    }
  },

  /**
   * Generates evaluation comments based on score category
   */
  getRecommendationStatement(category, position) {
    switch (category) {
      case 'Sangat Direkomendasikan':
        return `Kandidat menunjukkan kecocokan kognitif, kreativitas, dan kepribadian yang <strong>sangat luar biasa</strong> untuk posisi <strong>${position}</strong>. Memiliki kemampuan analisis data yang tajam, bakat menulis yang terasah, logika kuat, serta kepribadian profesional yang matang. Sangat disarankan untuk segera diproses ke tahap interview akhir.`;
      case 'Direkomendasikan':
        return `Kandidat memenuhi kriteria kualifikasi psikologis dan kecakapan teknis yang dibutuhkan untuk posisi <strong>${position}</strong>. Menampilkan performa yang stabil di sebagian besar kategori penilaian dengan potensi adaptasi kerja yang baik. Direkomendasikan untuk berlanjut ke tahap wawancara.`;
      case 'Dipertimbangkan':
        return `Kandidat berada dalam batas ambang penerimaan untuk posisi <strong>${position}</strong>. Memiliki kelebihan tertentu pada kategori spesifik, namun perlu dilakukan evaluasi mendalam atau klarifikasi saat interview mengenai kategori nilai yang di bawah rata-rata.`;
      default:
        return `Kandidat saat ini <strong>belum menunjukkan kecocokan yang sesuai</strong> untuk kualifikasi posisi <strong>${position}</strong>. Nilai rata-rata berada di bawah standar minimum perekrutan perusahaan. Data diarsipkan untuk referensi kebutuhan rekrutmen lainnya.`;
    }
  },

  /**
   * Helper to set text content of element safely
   */
  _safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }
};
