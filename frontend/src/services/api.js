/**
 * BYD KDS - API Service
 * Backend API ile iletişim
 */
const ApiService = {
    baseUrl: 'http://localhost:3000/api',
    token: null,

    // HTTP istekleri için yardımcı
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Token varsa ekle
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(data.error || 'İstek başarısız');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Token yönetimi
    setToken(token, refreshToken) {
        localStorage.setItem('byd_token', token);
        if (refreshToken) {
            localStorage.setItem('byd_refresh_token', refreshToken);
        }
        this.token = token;
    },

    getToken() {
        return this.token || localStorage.getItem('byd_token');
    },

    clearToken() {
        localStorage.removeItem('byd_token');
        localStorage.removeItem('byd_refresh_token');
        localStorage.removeItem('byd_user');
        this.token = null;
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    // Auth endpoints
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success) {
            this.setToken(data.data.accessToken, data.data.refreshToken);
            localStorage.setItem('byd_user', JSON.stringify(data.data.user));
        }

        return data;
    },

    async getMe() {
        return this.request('/auth/me');
    },

    getUser() {
        const user = localStorage.getItem('byd_user');
        return user ? JSON.parse(user) : null;
    },

    logout() {
        this.clearToken();
        window.location.href = '/login.html';
    },

    // Dashboard
    async getDashboard() {
        return this.request('/dashboard');
    },

    // Cities
    async getCities(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/cities${query ? '?' + query : ''}`);
    },

    async getCitiesForMap() {
        return this.request('/cities/map');
    },

    async getCity(id) {
        return this.request(`/cities/${id}`);
    },

    async getCitySummary() {
        return this.request('/cities/summary');
    },

    // Metrics
    async getIndicators() {
        return this.request('/metrics/indicators');
    },

    async getLatestMetrics() {
        return this.request('/metrics/latest');
    },

    async getCityMetrics(cityId) {
        return this.request(`/metrics/city/${cityId}`);
    },

    async getDataCompleteness() {
        return this.request('/metrics/completeness');
    },

    // TOPSIS
    async runTopsis(params) {
        return this.request('/topsis/run', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    },

    async getLatestTopsisResults() {
        return this.request('/topsis/latest');
    },

    async getTopsisRuns(limit = 10) {
        return this.request(`/topsis/runs?limit=${limit}`);
    },

    async getTopsisRunResults(runId) {
        return this.request(`/topsis/runs/${runId}`);
    },

    async getSensitivityAnalysis(runId) {
        return this.request(`/topsis/runs/${runId}/sensitivity`);
    },

    async deleteTopsisRun(runId) {
        return this.request(`/topsis/runs/${runId}`, {
            method: 'DELETE'
        });
    },

    // Scenarios
    async getScenarioPresets() {
        return this.request('/scenarios/presets');
    },

    async getScenarioPreset(id) {
        return this.request(`/scenarios/presets/${id}`);
    },

    async createScenarioPreset(data) {
        return this.request('/scenarios/presets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateScenarioPreset(id, data) {
        return this.request(`/scenarios/presets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // Forecast
    async runForecast(params) {
        return this.request('/forecast/run', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    },

    async getCityForecast(cityId, target = 'EV_COUNT') {
        return this.request(`/forecast/city/${cityId}?target=${target}`);
    },

    // ROI
    async calculateROI(params) {
        return this.request('/roi/calculate', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    },

    async getROISummary(runId = null) {
        const query = runId ? `?runId=${runId}` : '';
        return this.request(`/roi/summary${query}`);
    },

    async getCityROI(cityId) {
        return this.request(`/roi/city/${cityId}`);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
