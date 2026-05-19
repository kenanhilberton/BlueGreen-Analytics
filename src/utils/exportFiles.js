import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Cədvəl məlumatlarını Excel formatında yükləyir (Təhlükəsiz CDN Versiyası)
 * @param {Array} data - İxrac olunacaq obyektlər massivi
 * @param {string} fileName - Faylın adı
 */
export const exportToExcel = (data, fileName = 'ESG_Hesabat') => {
  
  if (typeof window.XLSX === 'undefined') {
    alert("Excel kitabxanası tam yüklənmədi. Zəhmət olmasa internet bağlantınızı yoxlayın və ya səhifəni yeniləyin.");
    return;
  }
  
  const XLSX = window.XLSX;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hesabat");
  
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
};

/**
 * Cədvəl məlumatlarını vizual PDF formatında yükləyir
 * @param {string} title - PDF daxilində görünəcək başlıq
 * @param {Array} headers - Cədvəlin başlıqları
 * @param {Array} rows - Cədvəlin sətirləri
 * @param {string} fileName - Faylın adı
 */
export const exportToPDF = (title, headers, rows, fileName = 'ESG_Hesabat') => {
  const doc = jsPDF({ orientation: 'landscape' }); 

  // Minimalist rəsmi dizayn stilləri
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(5, 8, 22);
  doc.text(title, 14, 20);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generasiya tarixi: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Sistem: BlueGreen ESG Live Dashboard`, 14, 33);

  // Otomatik tablonun qurulması
  doc.autoTable({
    startY: 40,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [0, 210, 255], textColor: [5, 8, 22], fontStyle: 'bold' }, // Tünd göy/neon mavi tonu
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { font: "Helvetica", fontSize: 10, cellPadding: 4 },
  });

  doc.save(`${fileName}_${new Date().toISOString().slice(0,10)}.pdf`);
};