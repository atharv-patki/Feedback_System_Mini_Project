/* ========================================
   FEEDBACK.JS - Feedback CRUD Operations
   Handles feedback creation, display, update, delete
   ======================================== */

const FeedbackManager = {

        /**
         * Create new feedback object
         * @param {Object} formData - Form data
         * @returns {Object} Feedback object
         */
        createFeedback(formData) {
            return {
                id: this.generateId(),
                name: Validation.sanitizeInput(formData.name.trim()),
                email: Validation.sanitizeInput(formData.email.trim()),
                category: formData.category,
                rating: Number(formData.rating),
                feedback: Validation.sanitizeInput(formData.feedback.trim()),
                timestamp: Date.now(),
                status: 'pending',
                adminReply: '',
                flagged: false
            };
        },

        /**
         * Generate unique ID
         * @returns {String} Unique ID
         */
        generateId() {
            return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        /**
         * Save feedback
         * @param {Object} feedbackData - Feedback data
         * @returns {Boolean} Success status
         */
        saveFeedback(feedbackData) {
            const feedback = this.createFeedback(feedbackData);
            const success = Storage.addFeedback(feedback);

            if (success) {
                this.displayAllFeedback();
                Analytics.updateStatistics();
            }

            return success;
        },

        /**
         * Get all feedback
         * @returns {Array} Array of feedback objects
         */
        getAllFeedback() {
            return Storage.getFeedback();
        },

        /**
         * Delete feedback by ID
         * @param {String} id - Feedback ID
         */
        deleteFeedback(id) {
            if (confirm('Are you sure you want to delete this feedback?')) {
                const success = Storage.deleteFeedback(id);

                if (success) {
                    this.displayAllFeedback();
                    Analytics.updateStatistics();
                    showToast('Feedback deleted successfully', 'success');
                } else {
                    showToast('Error deleting feedback', 'error');
                }
            }
        },

        /**
         * Display all feedback in grid
         */
        displayAllFeedback() {
            const container = document.getElementById('feedbackContainer');
            const emptyState = document.getElementById('emptyState');

            if (!container) return;

            let feedbackArray = this.getAllFeedback();

            // Apply current filters
            feedbackArray = Filters.applyAllFilters(feedbackArray);

            if (feedbackArray.length === 0) {
                container.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
                return;
            }

            container.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';

            container.innerHTML = feedbackArray.map(fb => this.createFeedbackCard(fb)).join('');

            // Add event listeners to delete buttons
            this.attachDeleteListeners();
        },

        /**
         * Create HTML for feedback card
         * @param {Object} feedback - Feedback object
         * @returns {String} HTML string
         */
        createFeedbackCard(feedback) {
            const stars = this.generateStars(feedback.rating);
            const date = this.formatDate(feedback.timestamp);
            const categoryColor = this.getCategoryColor(feedback.category);

            return `
            <div class="feedback-card" data-id="${feedback.id}">
                <div class="feedback-header">
                    <div class="feedback-user">
                        <h4>${feedback.name}</h4>
                        <p>${feedback.email}</p>
                    </div>
                    <div class="feedback-rating">
                        ${stars}
                    </div>
                </div>
                <span class="feedback-category" style="background: ${categoryColor};">
                    ${feedback.category}
                </span>
                <p class="feedback-text">${feedback.feedback}</p>
                ${feedback.adminReply ? `
                    <div class="admin-reply">
                        <strong><i class="fas fa-reply"></i> Admin Reply:</strong>
                        <p>${feedback.adminReply}</p>
                    </div>
                ` : ''}
                <div class="feedback-footer">
                    <span class="feedback-date">
                        <i class="far fa-clock"></i> ${date}
                    </span>
                    <div class="feedback-actions">
                        <button class="icon-btn delete" data-id="${feedback.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Generate star HTML
     * @param {Number} rating - Rating value
     * @returns {String} HTML string
     */
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fa${i <= rating ? 's' : 'r'} fa-star"></i>`;
        }
        return stars;
    },
    
    /**
     * Format timestamp to readable date
     * @param {Number} timestamp - Unix timestamp
     * @returns {String} Formatted date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },
    
    /**
     * Get category color
     * @param {String} category - Category name
     * @returns {String} Color hex code
     */
    getCategoryColor(category) {
        const colors = {
            'Service': '#3b82f6',
            'Product': '#10b981',
            'Support': '#f59e0b',
            'Website': '#8b5cf6',
            'Other': '#6b7280'
        };
        return colors[category] || '#6b7280';
    },
    
    /**
     * Attach delete button listeners
     */
    attachDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.icon-btn.delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteFeedback(id);
            });
        });
    },
    
    /**
     * Get feedback count by rating
     * @param {Number} rating - Rating value
     * @returns {Number} Count
     */
    getCountByRating(rating) {
        const allFeedback = this.getAllFeedback();
        return allFeedback.filter(fb => fb.rating === rating).length;
    },
    
    /**
     * Get feedback count by category
     * @param {String} category - Category name
     * @returns {Number} Count
     */
    getCountByCategory(category) {
        const allFeedback = this.getAllFeedback();
        return allFeedback.filter(fb => fb.category === category).length;
    }
};