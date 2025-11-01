/* ========================================
   STORAGE.JS - localStorage Management
   Handles all data storage operations
   ======================================== */

const Storage = {
    // Key name for storing feedback in localStorage
    FEEDBACK_KEY: 'feedbackData',
    SETTINGS_KEY: 'appSettings',
    ADMIN_PASSWORD_KEY: 'adminPassword',

    /**
     * Save feedback array to localStorage
     * @param {Array} feedbackArray - Array of feedback objects
     */
    saveFeedback(feedbackArray) {
        try {
            const jsonData = JSON.stringify(feedbackArray);
            localStorage.setItem(this.FEEDBACK_KEY, jsonData);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.handleStorageError(error);
            return false;
        }
    },

    /**
     * Get all feedback from localStorage
     * @returns {Array} Array of feedback objects
     */
    getFeedback() {
        try {
            const data = localStorage.getItem(this.FEEDBACK_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },

    /**
     * Add new feedback to storage
     * @param {Object} feedback - Feedback object to add
     */
    addFeedback(feedback) {
        const allFeedback = this.getFeedback();
        allFeedback.unshift(feedback); // Add to beginning of array
        return this.saveFeedback(allFeedback);
    },

    /**
     * Update existing feedback
     * @param {String} id - Feedback ID
     * @param {Object} updatedData - Updated feedback data
     */
    updateFeedback(id, updatedData) {
        const allFeedback = this.getFeedback();
        const index = allFeedback.findIndex(fb => fb.id === id);

        if (index !== -1) {
            allFeedback[index] = {...allFeedback[index], ...updatedData };
            return this.saveFeedback(allFeedback);
        }
        return false;
    },

    /**
     * Delete feedback by ID
     * @param {String} id - Feedback ID to delete
     */
    deleteFeedback(id) {
        const allFeedback = this.getFeedback();
        const filtered = allFeedback.filter(fb => fb.id !== id);
        return this.saveFeedback(filtered);
    },

    /**
     * Get single feedback by ID
     * @param {String} id - Feedback ID
     * @returns {Object|null} Feedback object or null
     */
    getFeedbackById(id) {
        const allFeedback = this.getFeedback();
        return allFeedback.find(fb => fb.id === id) || null;
    },

    /**
     * Clear all feedback
     */
    clearAllFeedback() {
        try {
            localStorage.removeItem(this.FEEDBACK_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    /**
     * Save app settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    /**
     * Get app settings
     * @returns {Object} Settings object
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            return data ? JSON.parse(data) : {
                theme: 'light',
                adminPassword: 'admin123'
            };
        } catch (error) {
            console.error('Error reading settings:', error);
            return { theme: 'light', adminPassword: 'admin123' };
        }
    },

    /**
     * Export all data as JSON
     * @returns {String} JSON string of all data
     */
    exportData() {
        const allData = {
            feedback: this.getFeedback(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(allData, null, 2);
    },

    /**
     * Import data from JSON
     * @param {String} jsonData - JSON string to import
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.feedback && Array.isArray(data.feedback)) {
                this.saveFeedback(data.feedback);
            }

            if (data.settings) {
                this.saveSettings(data.settings);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    /**
     * Get storage usage information
     * @returns {Object} Storage usage info
     */
    getStorageInfo() {
        const allFeedback = this.getFeedback();
        const dataSize = new Blob([JSON.stringify(allFeedback)]).size;
        const storageSizeKB = (dataSize / 1024).toFixed(2);

        return {
            totalFeedback: allFeedback.length,
            storageSizeKB,
            storagePercentage: ((dataSize / (5 * 1024 * 1024)) * 100).toFixed(2)
        };
    },

    /**
     * Handle storage errors (quota exceeded, etc.)
     */
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            alert('Storage limit reached! Please clear some feedback or export data.');
        }
    },

    /**
     * Check if localStorage is available
     * @returns {Boolean}
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Check storage availability on load
if (!Storage.isAvailable()) {
    console.warn('localStorage is not available. Data will not persist.');
}