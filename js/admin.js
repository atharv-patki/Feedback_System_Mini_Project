/* ========================================
   ADMIN.JS - Admin Panel Functions
   FULLY FUNCTIONAL - NO ERRORS
   ======================================== */

const AdminManager = {
    isAuthenticated: false,
    currentSection: 'dashboard',

    /**
     * Initialize admin panel
     */
    init() {
        this.checkAuthentication();
        this.attachListeners();
    },

    /**
     * Check if admin is authenticated
     */
    checkAuthentication() {
        const isAuth = sessionStorage.getItem('adminAuthenticated');
        if (isAuth === 'true') {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLoginModal();
        }
    },

    /**
     * Show login modal
     */
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
    },

    /**
     * Hide login modal
     */
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    },

    /**
     * Show admin dashboard
     */
    showDashboard() {
        this.hideLoginModal();
        const dashboard = document.getElementById('adminDashboard');
        if (dashboard) {
            dashboard.style.display = 'flex';
            this.loadDashboardData();
        }
    },

    /**
     * Handle login
     */
    login(password) {
        const correctPassword = 'admin123';

        if (password.trim() === correctPassword) {
            this.isAuthenticated = true;
            sessionStorage.setItem('adminAuthenticated', 'true');

            const adminPasswordInput = document.getElementById('adminPassword');
            if (adminPasswordInput) {
                adminPasswordInput.value = '';
                adminPasswordInput.classList.remove('error');
            }

            this.hideLoginModal();
            this.showDashboard();
            this.showToast('Login successful!', 'success');
        } else {
            const adminPasswordInput = document.getElementById('adminPassword');
            if (adminPasswordInput) {
                adminPasswordInput.classList.add('error');
                adminPasswordInput.value = '';
                adminPasswordInput.focus();
            }
            this.showToast('Incorrect password', 'error');
        }
    },

    /**
     * Handle logout
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.isAuthenticated = false;
            sessionStorage.removeItem('adminAuthenticated');
            window.location.href = 'index.html';
        }
    },

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        Analytics.updateStatistics();
        this.updatePendingCount();
        this.loadRecentFeedback();
        this.displayCategoryStats();
        this.displaySentimentAnalysis();
        this.displayTopFeedback();

        // Initialize charts
        if (typeof ChartsManager !== 'undefined') {
            ChartsManager.init();
        }
    },

    /**
     * Update pending feedback count
     */
    updatePendingCount() {
        const pending = Analytics.getPendingCount();
        const element = document.getElementById('adminPendingFeedback');
        if (element) {
            element.textContent = pending;
        }
    },

    /**
     * Load recent feedback table
     */
    loadRecentFeedback() {
        const tbody = document.getElementById('recentFeedbackBody');
        if (!tbody) return;

        const allFeedback = FeedbackManager.getAllFeedback();
        const recent = allFeedback.slice(0, 5);

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No feedback yet</td></tr>';
            return;
        }

        tbody.innerHTML = recent.map(fb => `
            <tr>
                <td>${fb.name}</td>
                <td>${fb.email}</td>
                <td>${this.generateStars(fb.rating)}</td>
                <td><span class="badge">${fb.category}</span></td>
                <td>${this.formatDate(fb.timestamp)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="AdminManager.replyToFeedback('${fb.id}')">
                        <i class="fas fa-reply"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Display category statistics
     */
    displayCategoryStats() {
        const container = document.getElementById('categoryStats');
        if (!container) return;

        const categories = Analytics.getCategoryDistribution();
        const total = FeedbackManager.getAllFeedback().length;

        if (total === 0) {
            container.innerHTML = '<p>No data available</p>';
            return;
        }

        container.innerHTML = Object.entries(categories).map(([category, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return `
                <div class="category-stat-item">
                    <span>${category}: ${count}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Display sentiment analysis
     */
    displaySentimentAnalysis() {
        const container = document.getElementById('sentimentDisplay');
        if (!container) return;

        const sentiment = Analytics.getSentimentAnalysis();
        const total = sentiment.positive + sentiment.neutral + sentiment.negative;

        if (total === 0) {
            container.innerHTML = '<p>No feedback data available</p>';
            return;
        }

        container.innerHTML = `
            <div class="sentiment-item">
                <i class="fas fa-smile" style="color: #10b981;"></i>
                <span>Positive: ${sentiment.positive} (${((sentiment.positive/total)*100).toFixed(1)}%)</span>
            </div>
            <div class="sentiment-item">
                <i class="fas fa-meh" style="color: #f59e0b;"></i>
                <span>Neutral: ${sentiment.neutral} (${((sentiment.neutral/total)*100).toFixed(1)}%)</span>
            </div>
            <div class="sentiment-item">
                <i class="fas fa-frown" style="color: #ef4444;"></i>
                <span>Negative: ${sentiment.negative} (${((sentiment.negative/total)*100).toFixed(1)}%)</span>
            </div>
        `;
    },

    /**
     * Display top feedback
     */
    displayTopFeedback() {
        const container = document.getElementById('topFeedbackList');
        if (!container) return;

        const topFeedback = Analytics.getTopFeedback(3);

        if (topFeedback.length === 0) {
            container.innerHTML = '<p>No 5-star feedback yet</p>';
            return;
        }

        container.innerHTML = topFeedback.map(fb => `
            <div class="top-feedback-item">
                <strong>${fb.name}</strong>
                <p>"${fb.feedback.substring(0, 80)}${fb.feedback.length > 80 ? '...' : ''}"</p>
                <small>${this.formatDate(fb.timestamp)}</small>
            </div>
        `).join('');
    },

    /**
     * Reply to feedback
     */
    replyToFeedback(feedbackId) {
        const feedback = Storage.getFeedbackById(feedbackId);
        if (!feedback) return;

        const modal = document.getElementById('replyModal');
        const detailsDiv = document.getElementById('feedbackDetails');

        if (modal && detailsDiv) {
            detailsDiv.innerHTML = `
                <div class="feedback-preview">
                    <p><strong>From:</strong> ${feedback.name}</p>
                    <p><strong>Email:</strong> ${feedback.email}</p>
                    <p><strong>Rating:</strong> ${this.generateStars(feedback.rating)}</p>
                    <p><strong>Feedback:</strong> "${feedback.feedback}"</p>
                </div>
            `;

            modal.style.display = 'flex';
            modal.dataset.feedbackId = feedbackId;
        }
    },

    /**
     * Send reply
     */
    sendReply(feedbackId, reply) {
        const success = Storage.updateFeedback(feedbackId, {
            adminReply: reply,
            status: 'resolved'
        });

        if (success) {
            this.showToast('Reply sent successfully', 'success');
            this.loadDashboardData();
            document.getElementById('replyModal').style.display = 'none';
            document.getElementById('replyText').value = '';
        }
    },

    /**
     * Switch section
     */
    switchSection(section) {
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        }

        this.currentSection = section;
    },

    /**
     * Clear all feedback
     */
    clearAllFeedback() {
        if (confirm('Delete ALL feedback? This cannot be undone!')) {
            Storage.clearAllFeedback();
            this.loadDashboardData();
            this.showToast('All feedback deleted', 'success');
        }
    },

    /**
     * Reset all data
     */
    resetAllData() {
        if (confirm('RESET ALL DATA? This cannot be undone!')) {
            localStorage.clear();
            sessionStorage.clear();
            this.showToast('Data reset. Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('adminToast');
        const toastMessage = document.getElementById('adminToastMessage');

        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.remove('error', 'warning', 'success');
            toast.classList.add(type);
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    },

    /**
     * Generate stars
     */
    generateStars(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < rating ? '⭐' : '☆';
        }
        return stars;
    },

    /**
     * Format date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const password = document.getElementById('adminPassword').value;
                this.login(password);
            });
        }

        // Clear error on input
        const adminPasswordInput = document.getElementById('adminPassword');
        if (adminPasswordInput) {
            adminPasswordInput.addEventListener('input', () => {
                adminPasswordInput.classList.remove('error');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Sidebar navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Export CSV
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                if (typeof ExportManager !== 'undefined') {
                    ExportManager.exportToCSV();
                }
            });
        }

        // Clear all
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllFeedback());
        }

        // Export data
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                if (typeof ExportManager !== 'undefined') {
                    ExportManager.exportToJSON();
                }
            });
        }

        // Import data
        const importDataBtn = document.getElementById('importDataBtn');
        const importFileInput = document.getElementById('importFileInput');
        if (importDataBtn && importFileInput) {
            importDataBtn.addEventListener('click', () => importFileInput.click());
            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && typeof ExportManager !== 'undefined') {
                    ExportManager.importFromJSON(file);
                }
            });
        }

        // Reset data
        const resetDataBtn = document.getElementById('resetDataBtn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => this.resetAllData());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
                this.showToast('Data refreshed', 'success');
            });
        }

        // Reply form
        const replyForm = document.getElementById('replyForm');
        if (replyForm) {
            replyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const modal = document.getElementById('replyModal');
                const feedbackId = modal.dataset.feedbackId;
                const reply = document.getElementById('replyText').value;

                if (reply.trim()) {
                    this.sendReply(feedbackId, reply);
                }
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('adminThemeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                if (typeof ThemeManager !== 'undefined') {
                    ThemeManager.toggleTheme();
                }
            });
        }
    }
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AdminManager.init();
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.init();
        }
    });
} else {
    AdminManager.init();
    if (typeof ThemeManager !== 'undefined') {
        ThemeManager.init();
    }
}