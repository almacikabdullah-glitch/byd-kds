/**
 * BYD KDS - TOPSIS Engine
 * Technique for Order of Preference by Similarity to Ideal Solution
 * 
 * Algoritma:
 * 1. Karar matrisini oluştur (alternatifler x kriterler)
 * 2. Normalize et (vektör normalizasyonu)
 * 3. Ağırlıklı normalize matrisi hesapla
 * 4. İdeal pozitif (A+) ve ideal negatif (A-) çözümleri bul
 * 5. Her alternatif için S+ ve S- mesafelerini hesapla
 * 6. Relatif yakınlık (C*) skorunu hesapla
 * 7. Sırala
 */

class TopsisEngine {
    constructor() {
        this.decisionMatrix = [];
        this.normalizedMatrix = [];
        this.weightedMatrix = [];
        this.weights = [];
        this.polarities = [];
        this.alternatives = [];
        this.criteria = [];
    }

    /**
     * TOPSIS hesaplamasını çalıştır
     * @param {Array} data - [{cityId, cityName, indicators: {code: value}}]
     * @param {Object} weights - {indicatorCode: weight}
     * @param {Object} polarities - {indicatorCode: 'benefit'|'cost'}
     * @returns {Array} - Sıralı sonuçlar
     */
    run(data, weights, polarities) {
        // Kriter kodlarını al
        this.criteria = Object.keys(weights);
        this.weights = this.criteria.map(c => weights[c]);
        this.polarities = this.criteria.map(c => polarities[c]);

        // Alternatifleri ve karar matrisini oluştur
        this.alternatives = data.map(d => ({
            cityId: d.cityId,
            cityName: d.cityName,
            plateCode: d.plateCode
        }));

        this.decisionMatrix = data.map(d =>
            this.criteria.map(c => d.indicators[c] || 0)
        );

        // TOPSIS adımları
        this._normalize();
        this._applyWeights();
        const { idealPositive, idealNegative } = this._findIdealSolutions();
        const distances = this._calculateDistances(idealPositive, idealNegative);
        const scores = this._calculateScores(distances);

        // Sonuçları oluştur
        const results = this.alternatives.map((alt, i) => ({
            cityId: alt.cityId,
            cityName: alt.cityName,
            plateCode: alt.plateCode,
            sPlus: distances.sPlus[i],
            sMinus: distances.sMinus[i],
            cStar: scores[i]
        }));

        // C* skoruna göre sırala (büyükten küçüğe)
        results.sort((a, b) => b.cStar - a.cStar);

        // Sıralama pozisyonunu ekle
        results.forEach((r, i) => {
            r.rank = i + 1;
            r.investmentPriority = this._getPriority(r.rank);
        });

        return results;
    }

    /**
     * Vektör normalizasyonu
     * x'ij = xij / sqrt(sum(xij^2))
     */
    _normalize() {
        const numCriteria = this.criteria.length;
        const numAlternatives = this.alternatives.length;

        // Her kriter için normalize et
        this.normalizedMatrix = [];

        for (let i = 0; i < numAlternatives; i++) {
            this.normalizedMatrix[i] = [];
        }

        for (let j = 0; j < numCriteria; j++) {
            // Sütun için karelerin toplamının karekökü
            let sumSquares = 0;
            for (let i = 0; i < numAlternatives; i++) {
                sumSquares += Math.pow(this.decisionMatrix[i][j], 2);
            }
            const denominator = Math.sqrt(sumSquares) || 1; // 0'a bölme engelle

            // Normalize et
            for (let i = 0; i < numAlternatives; i++) {
                this.normalizedMatrix[i][j] = this.decisionMatrix[i][j] / denominator;
            }
        }
    }

    /**
     * Ağırlıkları uygula
     * v'ij = wj * x'ij
     */
    _applyWeights() {
        const numCriteria = this.criteria.length;
        const numAlternatives = this.alternatives.length;

        this.weightedMatrix = [];

        for (let i = 0; i < numAlternatives; i++) {
            this.weightedMatrix[i] = [];
            for (let j = 0; j < numCriteria; j++) {
                this.weightedMatrix[i][j] = this.normalizedMatrix[i][j] * this.weights[j];
            }
        }
    }

    /**
     * İdeal pozitif ve negatif çözümleri bul
     */
    _findIdealSolutions() {
        const numCriteria = this.criteria.length;
        const numAlternatives = this.alternatives.length;

        const idealPositive = [];
        const idealNegative = [];

        for (let j = 0; j < numCriteria; j++) {
            const column = [];
            for (let i = 0; i < numAlternatives; i++) {
                column.push(this.weightedMatrix[i][j]);
            }

            if (this.polarities[j] === 'benefit') {
                // Fayda kriteri: max = pozitif ideal, min = negatif ideal
                idealPositive[j] = Math.max(...column);
                idealNegative[j] = Math.min(...column);
            } else {
                // Maliyet kriteri: min = pozitif ideal, max = negatif ideal
                idealPositive[j] = Math.min(...column);
                idealNegative[j] = Math.max(...column);
            }
        }

        return { idealPositive, idealNegative };
    }

    /**
     * İdeal çözümlere uzaklıkları hesapla
     */
    _calculateDistances(idealPositive, idealNegative) {
        const numCriteria = this.criteria.length;
        const numAlternatives = this.alternatives.length;

        const sPlus = [];
        const sMinus = [];

        for (let i = 0; i < numAlternatives; i++) {
            let sumPlus = 0;
            let sumMinus = 0;

            for (let j = 0; j < numCriteria; j++) {
                sumPlus += Math.pow(this.weightedMatrix[i][j] - idealPositive[j], 2);
                sumMinus += Math.pow(this.weightedMatrix[i][j] - idealNegative[j], 2);
            }

            sPlus[i] = Math.sqrt(sumPlus);
            sMinus[i] = Math.sqrt(sumMinus);
        }

        return { sPlus, sMinus };
    }

    /**
     * Relatif yakınlık skorlarını hesapla
     * C*i = S-i / (S+i + S-i)
     */
    _calculateScores(distances) {
        const scores = [];

        for (let i = 0; i < distances.sPlus.length; i++) {
            const denominator = distances.sPlus[i] + distances.sMinus[i];
            scores[i] = denominator > 0 ? distances.sMinus[i] / denominator : 0;
        }

        return scores;
    }

    /**
     * Yatırım önceliğini belirle
     */
    _getPriority(rank) {
        if (rank <= 10) return 'high';
        if (rank <= 20) return 'medium';
        return 'low';
    }

    /**
     * Duyarlılık analizi
     * Ağırlıkları %±10 değiştirerek top 5'in nasıl değiştiğini analiz et
     */
    sensitivityAnalysis(data, baseWeights, polarities) {
        const results = {
            baseline: this.run(data, baseWeights, polarities).slice(0, 5),
            variations: []
        };

        const criteria = Object.keys(baseWeights);

        for (const criterion of criteria) {
            // +10% senaryo
            const weightsPlus = { ...baseWeights };
            weightsPlus[criterion] = Math.min(1, baseWeights[criterion] * 1.1);
            this._normalizeWeights(weightsPlus);

            const resultPlus = this.run(data, weightsPlus, polarities).slice(0, 5);

            // -10% senaryo
            const weightsMinus = { ...baseWeights };
            weightsMinus[criterion] = Math.max(0, baseWeights[criterion] * 0.9);
            this._normalizeWeights(weightsMinus);

            const resultMinus = this.run(data, weightsMinus, polarities).slice(0, 5);

            results.variations.push({
                criterion,
                plusTen: resultPlus.map(r => ({ rank: r.rank, cityName: r.cityName })),
                minusTen: resultMinus.map(r => ({ rank: r.rank, cityName: r.cityName }))
            });
        }

        return results;
    }

    /**
     * Ağırlıkları normalize et (toplam = 1)
     */
    _normalizeWeights(weights) {
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        for (const key of Object.keys(weights)) {
            weights[key] = weights[key] / sum;
        }
    }
}

module.exports = TopsisEngine;
