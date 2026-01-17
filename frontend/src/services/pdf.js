/**
 * BYD KDS - PDF Report Generator
 * Creates professional PDF reports from TOPSIS analysis results
 */

const PDFGenerator = {
    // Load jsPDF
    loaded: false,

    async init() {
        if (this.loaded) return;

        // Load jsPDF from CDN
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js');

        this.loaded = true;
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Generate TOPSIS Results PDF
    async generateTopsisReport(runData, results) {
        await this.init();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Header
        doc.setFillColor(200, 16, 46); // BYD Red
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('BYD Türkiye', margin, 18);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Karar Destek Sistemi - TOPSIS Analiz Raporu', margin, 30);

        y = 55;

        // Report Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Rapor Bilgileri', margin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const info = [
            ['Analiz Adı:', runData.run_name || 'TOPSIS Analizi'],
            ['Senaryo:', this.getScenarioName(runData.scenario_type)],
            ['Tarih:', new Date(runData.created_at).toLocaleString('tr-TR')],
            ['Analiz Edilen Şehir:', `${results.length} şehir`],
            ['Çalışma Süresi:', `${runData.execution_time_ms || 0}ms`]
        ];

        info.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, margin + 45, y);
            y += 6;
        });

        y += 10;

        // Summary Box
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 3, 3, 'F');

        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 16, 46);
        doc.text('Özet Sonuçlar', margin + 5, y);

        y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const top3 = results.slice(0, 3);
        const summaryText = top3.map((r, i) =>
            `${i + 1}. ${r.city_name} (${(r.score * 100).toFixed(1)}%)`
        ).join('   •   ');

        doc.text('En Yüksek Skorlu Şehirler: ' + summaryText, margin + 5, y);

        y += 7;
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        doc.text(`Ortalama TOPSIS Skoru: ${(avgScore * 100).toFixed(1)}%`, margin + 5, y);

        y += 20;

        // Results Table
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Şehir Sıralaması', margin, y);
        y += 5;

        const tableData = results.map(r => [
            `#${r.rank}`,
            r.city_name,
            r.plate_code,
            parseFloat(r.s_plus || 0).toFixed(4),
            parseFloat(r.s_minus || 0).toFixed(4),
            `${(parseFloat(r.score) * 100).toFixed(2)}%`,
            this.getPriorityText(r.investment_priority)
        ]);

        doc.autoTable({
            startY: y,
            head: [['Sıra', 'Şehir', 'Plaka', 'S+', 'S-', 'Skor', 'Öncelik']],
            body: tableData,
            margin: { left: margin, right: margin },
            headStyles: {
                fillColor: [200, 16, 46],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { halign: 'left', cellWidth: 35 },
                2: { halign: 'center', cellWidth: 15 },
                3: { halign: 'center', cellWidth: 22 },
                4: { halign: 'center', cellWidth: 22 },
                5: { halign: 'center', cellWidth: 20 },
                6: { halign: 'center', cellWidth: 25 }
            }
        });

        // Footer on each page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Sayfa ${i} / ${pageCount}  •  BYD Türkiye KDS  •  ${new Date().toLocaleDateString('tr-TR')}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save
        const filename = `BYD_TOPSIS_Rapor_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);

        return filename;
    },

    getScenarioName(type) {
        const names = {
            balanced: 'Dengeli Strateji',
            aggressive: 'Agresif Büyüme',
            conservative: 'Temkinli Yaklaşım'
        };
        return names[type] || type || 'Özel';
    },

    getPriorityText(priority) {
        const texts = {
            high: 'Yüksek',
            medium: 'Orta',
            low: 'Düşük'
        };
        return texts[priority] || 'Orta';
    },

    // Generate City Comparison PDF
    async generateComparisonReport(cities) {
        await this.init();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Header
        doc.setFillColor(200, 16, 46);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('BYD Türkiye', margin, 18);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Şehir Karşılaştırma Raporu', margin, 30);

        y = 55;

        // Cities comparison
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Karşılaştırılan Şehirler', margin, y);
        y += 10;

        cities.forEach((city, index) => {
            doc.setFillColor(index === 0 ? 200 : 240, index === 0 ? 16 : 240, index === 0 ? 46 : 240);
            doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, 'F');

            doc.setTextColor(index === 0 ? 255 : 0, index === 0 ? 255 : 0, index === 0 ? 255 : 0);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`#${city.rank || index + 1} ${city.name}`, margin + 5, y + 12);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`TOPSIS Skoru: ${((city.last_topsis_score || 0) * 100).toFixed(1)}%`, margin + 5, y + 22);
            doc.text(city.region_name || '', pageWidth - margin - 30, y + 12);

            y += 35;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `BYD Türkiye KDS  •  ${new Date().toLocaleDateString('tr-TR')}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );

        const filename = `BYD_Sehir_Karsilastirma_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);

        return filename;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}
