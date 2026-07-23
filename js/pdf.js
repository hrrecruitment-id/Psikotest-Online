/**
 * pdf.js - PDF Generation & Printing Manager
 * Integrates html2pdf.js and QRCode.js to render and download
 * official result certificates for internal corporate use.
 */

const PDFManager = {
  /**
   * Generates and downloads a PDF file for a participant
   * @param {string} participantId 
   */
  async downloadPDF(participantId) {
    const details = StorageManager.getParticipantDetails(participantId);
    if (!details) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Data peserta tidak ditemukan!'
      });
      return;
    }

    // Show loading spinner
    Swal.fire({
      title: 'Menyiapkan Dokumen...',
      text: 'Mohon tunggu sebentar.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let tempWrapper = null;

    try {
      // Create a temporary wrapper to hide the container from the viewport
      // without using negative positioning that makes html2canvas draw blank pages
      tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'absolute';
      tempWrapper.style.left = '0';
      tempWrapper.style.top = '0';
      tempWrapper.style.width = '0';
      tempWrapper.style.height = '0';
      tempWrapper.style.overflow = 'hidden';
      tempWrapper.style.opacity = '0';
      tempWrapper.style.pointerEvents = 'none';
      tempWrapper.style.zIndex = '-99999';

      // Create a temporary element to hold the printable template
      const printContainer = document.createElement('div');
      printContainer.id = 'temp-pdf-container';
      printContainer.style.boxSizing = 'border-box';
      printContainer.style.width = '794px'; // 210mm A4 width at 96 DPI
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.color = '#333333';
      printContainer.style.fontFamily = "'Poppins', 'Inter', sans-serif";
      printContainer.style.padding = '40px';
      printContainer.style.position = 'relative';

      const formattedDate = new Date(details.testDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';

      // Recommendation text formatting
      let recBadgeColor = '#10B981'; // Green
      if (details.results.category === 'Direkomendasikan') recBadgeColor = '#2563EB'; // Blue
      else if (details.results.category === 'Dipertimbangkan') recBadgeColor = '#F59E0B'; // Yellow
      else if (details.results.category === 'Belum Sesuai') recBadgeColor = '#EF4444'; // Red

      // Build HTML template content
      printContainer.innerHTML = `
        <div style="border: 2px solid #e5e7eb; padding: 30px; border-radius: 8px;">
          <!-- Header / Company Logo -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 25px;">
            <div>
              <div style="font-size: 24px; font-weight: 800; color: #2563EB; letter-spacing: 1px;">HR RECRUITMENT</div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">Talent Assessment & Psychometric Portal</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px; color: #111827; font-weight: 700;">LAPORAN HASIL PSIKOTES</h2>
              <span style="font-size: 11px; color: #9ca3af;">NO: ${details.id}</span>
            </div>
          </div>

          <!-- Participant Info -->
          <div style="margin-bottom: 25px; background: #f9fafb; padding: 15px; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="width: 25%; padding: 5px 0; color: #6b7280; font-weight: 600;">Nama Lengkap</td>
                <td style="width: 5%; padding: 5px 0; color: #6b7280;">:</td>
                <td style="width: 70%; padding: 5px 0; font-weight: 700; color: #111827;">${details.name}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6b7280; font-weight: 600;">Email / No. HP</td>
                <td style="padding: 5px 0; color: #6b7280;">:</td>
                <td style="padding: 5px 0; color: #374151;">${details.email} / ${details.phone}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6b7280; font-weight: 600;">Posisi Dilamar</td>
                <td style="padding: 5px 0; color: #6b7280;">:</td>
                <td style="padding: 5px 0; color: #2563EB; font-weight: 600;">${details.position}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6b7280; font-weight: 600;">Pendidikan / Domisili</td>
                <td style="padding: 5px 0; color: #6b7280;">:</td>
                <td style="padding: 5px 0; color: #374151;">${details.education || '-'} / ${details.domicile || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6b7280; font-weight: 600;">Tanggal Ujian</td>
                <td style="padding: 5px 0; color: #6b7280;">:</td>
                <td style="padding: 5px 0; color: #374151;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <!-- Score Breakdown Table -->
          <h3 style="font-size: 14px; color: #111827; margin-bottom: 10px; border-left: 3px solid #2563EB; padding-left: 8px;">DETAIL NILAI KATEGORI</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
            <thead>
              <tr style="background: #2563EB; color: #ffffff; text-align: center;">
                <th style="padding: 10px; border: 1px solid #d1d5db; width: 8%; text-align: center; color: #ffffff !important;">No</th>
                <th style="padding: 10px; border: 1px solid #d1d5db; width: 67%; text-align: center; color: #ffffff !important;">Kategori Soal</th>
                <th style="padding: 10px; border: 1px solid #d1d5db; width: 25%; text-align: center; color: #ffffff !important;">Skor (0-100)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">1</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Kepribadian (20%)</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-weight: 700;">${details.results.scores.kepribadian}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">2</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Logika (20%)</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-weight: 700;">${details.results.scores.logika}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">3</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Copywriting (20%)</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-weight: 700;">${details.results.scores.copywriting}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">4</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Kreativitas (20%)</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-weight: 700;">${details.results.scores.kreativitas}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">5</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Analisa Data (20%)</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-weight: 700;">${details.results.scores.analisa_data}</td>
              </tr>
            </tbody>
          </table>

          <!-- Final Score and Recommendation Details -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <div>
              <div style="font-size: 12px; color: #4b5563; font-weight: 500;">NILAI AKHIR REKAPITULASI</div>
              <div style="font-size: 32px; font-weight: 800; color: #2563EB;">${details.results.totalScore} / 100</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #4b5563; font-weight: 500; margin-bottom: 5px;">KATEGORI HASIL</div>
              <div style="background-color: ${recBadgeColor}; color: #ffffff; padding: 8px 16px; font-size: 14px; font-weight: 700; border-radius: 20px; display: inline-block;">
                ${details.results.category}
              </div>
            </div>
          </div>

          <!-- Bottom Verification Block with QR Code -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #cccccc; padding-top: 25px;">
            <div style="width: 70%;">
              <h4 style="margin: 0 0 5px 0; font-size: 12px; color: #111827; font-weight: 700;">VERIFIKASI INTEGRITAS</h4>
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                Pindai kode QR di sebelah kanan untuk memverifikasi keaslian dokumen hasil psikotes ini di database internal kami secara langsung.
              </p>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <!-- QR Code Canvas Container -->
              <div id="pdf-qrcode" style="width: 80px; height: 80px; margin-bottom: 5px;"></div>
              <span style="font-size: 9px; color: #9ca3af; font-family: monospace;">ID: ${details.id}</span>
            </div>
          </div>

          <!-- Footer warning -->
          <div style="margin-top: 35px; border-top: 1px solid #e5e7eb; padding-top: 10px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #9ca3af; font-weight: 500; font-style: italic;">
              "Dokumen ini hanya digunakan untuk kebutuhan internal perusahaan."
            </p>
          </div>
        </div>
      `;

      // Append container to wrapper, and wrapper to DOM so html2pdf and QRCode can interact with it
      tempWrapper.appendChild(printContainer);
      document.body.appendChild(tempWrapper);

      // Generate QR Code inside container (use querySelector to avoid document-wide ID collision)
      const qrCodeElement = printContainer.querySelector('#pdf-qrcode');
      if (qrCodeElement) {
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrCodeElement, {
            text: `https://recruitment.startup.co/verify?id=${details.id}`,
            width: 80,
            height: 80,
            colorDark: "#111827",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        } else {
          // Fallback placeholder text if library not loaded
          qrCodeElement.style.border = '1px solid #ddd';
          qrCodeElement.style.fontSize = '8px';
          qrCodeElement.style.textAlign = 'center';
          qrCodeElement.style.paddingTop = '30px';
          qrCodeElement.innerText = '[QR Code]';
        }
      }

      // Wait a short moment for QR code image generation to finish in DOM
      await new Promise(resolve => setTimeout(resolve, 600));

      // Setup html2pdf configuration
      const filename = `Hasil_Psikotes_${details.name.replace(/\s+/g, '_')}.pdf`;
      const opt = {
        margin: 0, // margins in mm (0 to let container padding act as margins)
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            // Force light mode on cloned document for consistent print styling
            clonedDoc.documentElement.setAttribute('data-theme', 'light');
            clonedDoc.documentElement.classList.remove('dark');
            if (clonedDoc.body) {
              clonedDoc.body.classList.remove('dark');
              clonedDoc.body.style.margin = '0';
              clonedDoc.body.style.padding = '0';
              clonedDoc.body.style.display = 'block';
              clonedDoc.body.style.width = '794px';
              clonedDoc.body.style.minHeight = 'auto';
              clonedDoc.body.style.backgroundColor = '#ffffff';
            }

            const clonedContainer = clonedDoc.getElementById('temp-pdf-container');
            if (clonedContainer) {
              clonedContainer.style.position = 'relative';
              clonedContainer.style.left = '0';
              clonedContainer.style.top = '0';
              clonedContainer.style.margin = '0';
              clonedContainer.style.boxSizing = 'border-box';
              clonedContainer.style.width = '794px';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate and save PDF
      await html2pdf().set(opt).from(printContainer).save();

      // Clean up DOM
      if (tempWrapper.parentNode) {
        tempWrapper.parentNode.removeChild(tempWrapper);
      }

      // Close spinner and show success toast
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Laporan PDF berhasil diunduh.',
        timer: 1500,
        showConfirmButton: false
      });

    } catch (err) {
      console.error("PDF generation failed:", err);
      // Clean up DOM in case of error
      if (tempWrapper && tempWrapper.parentNode) {
        tempWrapper.parentNode.removeChild(tempWrapper);
      }

      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat mengekspor PDF.'
      });
    }
  },

  /**
   * Triggers native print for result details page
   * Suitable for printing directly or exporting via browser print menu
   */
  printResult() {
    window.print();
  }
};
