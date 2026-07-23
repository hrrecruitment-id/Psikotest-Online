/**
 * chart.js - Chart.js Initializations & Helpers
 * Controls rendering of Dashboard charts (Score distributions, category averages) 
 * and detailed Candidate Result (Radar chart).
 */

const ChartManager = {
  // Store chart instances to destroy them before rendering new ones (prevents hover lag/overlap)
  instances: {},

  /**
   * Render Dashboard charts based on results list
   * @param {Array} results List of test results
   */
  renderDashboardCharts(results) {
    const canvasDistribution = document.getElementById('chartDistribution');
    const canvasCategoryAverages = document.getElementById('chartCategoryAverages');

    if (!canvasDistribution || !canvasCategoryAverages) return;

    // 1. Calculate Score Distribution count
    // Tiers: <70 (Belum Sesuai), 70-79 (Dipertimbangkan), 80-89 (Direkomendasikan), 90-100 (Sangat Direkomendasikan)
    const distributionCounts = {
      'Sangat Direkomendasikan (90-100)': 0,
      'Direkomendasikan (80-89)': 0,
      'Dipertimbangkan (70-79)': 0,
      'Belum Sesuai (<70)': 0
    };

    results.forEach(res => {
      const score = res.totalScore;
      if (score >= 90) distributionCounts['Sangat Direkomendasikan (90-100)']++;
      else if (score >= 80) distributionCounts['Direkomendasikan (80-89)']++;
      else if (score >= 70) distributionCounts['Dipertimbangkan (70-79)']++;
      else distributionCounts['Belum Sesuai (<70)']++;
    });

    // Destroy existing instance if it exists
    if (this.instances['distribution']) {
      this.instances['distribution'].destroy();
    }

    // Draw Distribution Pie/Doughnut Chart
    this.instances['distribution'] = new Chart(canvasDistribution, {
      type: 'doughnut',
      data: {
        labels: Object.keys(distributionCounts),
        datasets: [{
          data: Object.values(distributionCounts),
          backgroundColor: [
            '#10B981', // green (Sangat Direkomendasikan)
            '#2563EB', // blue (Direkomendasikan)
            '#F59E0B', // yellow (Dipertimbangkan)
            '#EF4444'  // red (Belum Sesuai)
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Poppins', size: 11 },
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                return ` ${context.label}: ${value} orang (${percent}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });

    // 2. Calculate Category Average scores
    const categorySum = { kepribadian: 0, logika: 0, copywriting: 0, kreativitas: 0, analisa_data: 0 };
    
    if (results.length > 0) {
      results.forEach(res => {
        categorySum.kepribadian += res.scores.kepribadian || 0;
        categorySum.logika += res.scores.logika || 0;
        categorySum.copywriting += res.scores.copywriting || 0;
        categorySum.kreativitas += res.scores.kreativitas || 0;
        categorySum.analisa_data += res.scores.analisa_data || 0;
      });
      
      const count = results.length;
      Object.keys(categorySum).forEach(key => {
        categorySum[key] = Math.round(categorySum[key] / count);
      });
    }

    if (this.instances['categoryAverages']) {
      this.instances['categoryAverages'].destroy();
    }

    // Draw Category Averages Bar Chart
    this.instances['categoryAverages'] = new Chart(canvasCategoryAverages, {
      type: 'bar',
      data: {
        labels: ['Kepribadian', 'Logika', 'Copywriting', 'Kreativitas', 'Analisa Data'],
        datasets: [{
          label: 'Rata-rata Nilai',
          data: [
            categorySum.kepribadian,
            categorySum.logika,
            categorySum.copywriting,
            categorySum.kreativitas,
            categorySum.analisa_data
          ],
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
          hoverBackgroundColor: '#2563EB',
          borderRadius: 8,
          borderWidth: 0,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Rata-rata: ${context.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { font: { family: 'Poppins', size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Poppins', size: 11 } }
          }
        }
      }
    });
  },

  /**
   * Render Radar Chart on participant result detail
   * @param {string} canvasId Canvas element ID
   * @param {Object} scores Candidate scores object { kepribadian, logika, copywriting, kreativitas, analisa_data }
   */
  renderRadarChart(canvasId, scores) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    this.instances[canvasId] = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Kepribadian', 'Logika', 'Copywriting', 'Kreativitas', 'Analisa Data'],
        datasets: [{
          label: 'Skor Peserta',
          data: [
            scores.kepribadian || 0,
            scores.logika || 0,
            scores.copywriting || 0,
            scores.kreativitas || 0,
            scores.analisa_data || 0
          ],
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: '#2563EB',
          pointBackgroundColor: '#2563EB',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#2563EB',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
            pointLabels: {
              font: { family: 'Poppins', size: 12, weight: 'bold' },
              color: '#374151'
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              showLabelBackdrop: false,
              font: { size: 9 }
            }
          }
        }
      }
    });
  }
};
