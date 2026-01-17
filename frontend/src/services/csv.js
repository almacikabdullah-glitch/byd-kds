/**
 * BYD KDS - CSV Export Utility
 * Creates Excel-compatible CSV files from data
 */

const CSVExporter = {
    /**
     * Generate and download CSV file
     * @param {Array} data - Array of objects to export
     * @param {Array} columns - Column definitions [{key, label}]
     * @param {string} filename - Output filename (without extension)
     */
    export(data, columns, filename) {
        // Create CSV header
        const headers = columns.map(col => this.escapeCSV(col.label));
        const csvContent = [];
        csvContent.push(headers.join(';')); // Use semicolon for Turkish Excel

        // Create data rows
        data.forEach(row => {
            const values = columns.map(col => {
                let value = row[col.key];

                // Format numbers
                if (typeof value === 'number') {
                    value = value.toLocaleString('tr-TR');
                }

                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = '';
                }

                return this.escapeCSV(String(value));
            });
            csvContent.push(values.join(';'));
        });

        // Add BOM for UTF-8 Excel compatibility
        const BOM = '\uFEFF';
        const csv = BOM + csvContent.join('\r\n');

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return `${filename}.csv`;
    },

    /**
     * Escape CSV value
     */
    escapeCSV(value) {
        if (value.includes('"') || value.includes(';') || value.includes('\n')) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
    },

    /**
     * Export TOPSIS results to CSV
     */
    exportTopsisResults(runData, results) {
        const columns = [
            { key: 'rank', label: 'Sıra' },
            { key: 'city_name', label: 'Şehir' },
            { key: 'plate_code', label: 'Plaka' },
            { key: 's_plus', label: 'S+' },
            { key: 's_minus', label: 'S-' },
            { key: 'score_percent', label: 'TOPSIS Skoru (%)' },
            { key: 'investment_priority', label: 'Yatırım Önceliği' }
        ];

        // Transform data
        const data = results.map(r => ({
            rank: r.rank,
            city_name: r.city_name,
            plate_code: r.plate_code,
            s_plus: parseFloat(r.s_plus || 0).toFixed(4),
            s_minus: parseFloat(r.s_minus || 0).toFixed(4),
            score_percent: (parseFloat(r.score) * 100).toFixed(2),
            investment_priority: r.investment_priority === 'high' ? 'Yüksek' :
                r.investment_priority === 'low' ? 'Düşük' : 'Orta'
        }));

        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `BYD_TOPSIS_Sonuclar_${dateStr}`;

        return this.export(data, columns, filename);
    },

    /**
     * Export city comparison to CSV
     */
    exportCityComparison(cities) {
        const columns = [
            { key: 'rank', label: 'Sıra' },
            { key: 'name', label: 'Şehir' },
            { key: 'plate_code', label: 'Plaka' },
            { key: 'region_name', label: 'Bölge' },
            { key: 'population', label: 'Nüfus' },
            { key: 'score', label: 'TOPSIS Skoru (%)' }
        ];

        const data = cities.map(c => ({
            rank: c.last_topsis_rank || '-',
            name: c.name,
            plate_code: c.plate_code,
            region_name: c.region_name || '-',
            population: c.population || 0,
            score: ((c.last_topsis_score || 0) * 100).toFixed(1)
        }));

        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `BYD_Sehir_Karsilastirma_${dateStr}`;

        return this.export(data, columns, filename);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVExporter;
}
