/* ========================================
   ANALYTICS.JS - Analytics & Statistics
   Calculates and displays statistics
   UPDATED: Fixed all fluctuation issues
   ======================================== */

const Analytics = {

    // Track active animations to prevent overlapping
    activeAnimations: new Map(),

    /**
     * Update all statistics on page - FIXED
     */
    updateStatistics() {
        // Use requestAnimationFrame to prevent layout thrashing
        requestAnimationFrame(() => {
            this.updateTotalFeedback();
            this.updateAverageRating();
            this.updateHappyCustomers();
            this.updateThisWeekCount();
        });
    },

    /**
     * Update total feedback count - FIXED
     */
    updateTotalFeedback() {
        const total = FeedbackManager.getAllFeedback().length;
        const elements = ['totalFeedback', 'adminTotalFeedback'];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, total, id);
            }
        });
    },

    /**
     * Calculate and update average rating - FIXED
     */
    updateAverageRating() {
        const allFeedback = FeedbackManager.getAllFeedback();

        if (allFeedback.length === 0) {
            this.setAverageRating('0.0');
            return;
        }

        const totalRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0);
        const average = (totalRating / allFeedback.length).toFixed(1);

        this.setAverageRating(average);
    },

    /**
     * Set average rating display - FIXED (Smooth transition)
     */
    setAverageRating(average) {
        const elements = ['avgRating', 'adminAvgRating'];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const currentValue = element.textContent;

                // Only update if value changed
                if (currentValue !== average) {
                    // Smooth fade transition
                    element.style.transition = 'opacity 0.3s ease';
                    element.style.opacity = '0.5';

                    setTimeout(() => {
                        element.textContent = average;
                        element.style.opacity = '1';
                    }, 150);
                }
            }
        });
    },

    /**
     * Update happy customers count (4+ stars) - FIXED
     */
    updateHappyCustomers() {
        const allFeedback = FeedbackManager.getAllFeedback();
        const happy = allFeedback.filter(fb => fb.rating >= 4).length;

        const elements = ['happyCustomers', 'adminHappyCustomers'];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, happy, id);
            }
        });
    },

    /**
     * Update this week's feedback count - FIXED
     */
    updateThisWeekCount() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const allFeedback = FeedbackManager.getAllFeedback();
        const thisWeek = allFeedback.filter(fb => fb.timestamp >= oneWeekAgo).length;

        const elements = ['thisWeek', 'adminThisWeek'];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, thisWeek, id);
            }
        });
    },

    /**
     * Animate number change - COMPLETELY FIXED (No Fluctuation)
     * @param {HTMLElement} element - Target element
     * @param {Number} target - Target number
     * @param {String} elementId - Unique ID for tracking
     */
    animateNumber(element, target, elementId) {
        if (!element) return;

        // Cancel any existing animation for this element
        if (this.activeAnimations.has(elementId)) {
            clearInterval(this.activeAnimations.get(elementId));
        }

        const current = parseInt(element.textContent) || 0;

        // If same value, don't animate
        if (current === target) {
            element.textContent = target;
            return;
        }

        const difference = target - current;
        const duration = 800; // milliseconds
        const steps = Math.min(Math.abs(difference), 30); // Max 30 steps
        const stepValue = difference / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;

            if (currentStep >= steps) {
                // Set final value and clear
                element.textContent = target;
                clearInterval(timer);
                this.activeAnimations.delete(elementId);
            } else {
                // Calculate and set intermediate value
                const newValue = Math.round(current + (stepValue * currentStep));
                element.textContent = newValue;
            }
        }, stepDuration);

        // Store timer reference
        this.activeAnimations.set(elementId, timer);
    },

    /**
     * Get rating distribution
     * @returns {Object} Rating counts
     */
    getRatingDistribution() {
        const allFeedback = FeedbackManager.getAllFeedback();
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        allFeedback.forEach(fb => {
            if (fb.rating >= 1 && fb.rating <= 5) {
                distribution[fb.rating]++;
            }
        });

        return distribution;
    },

    /**
     * Get category distribution
     * @returns {Object} Category counts
     */
    getCategoryDistribution() {
        const allFeedback = FeedbackManager.getAllFeedback();
        const categories = {};

        allFeedback.forEach(fb => {
            if (fb.category) {
                categories[fb.category] = (categories[fb.category] || 0) + 1;
            }
        });

        return categories;
    },

    /**
     * Get sentiment analysis
     * @returns {Object} Sentiment counts
     */
    getSentimentAnalysis() {
        const allFeedback = FeedbackManager.getAllFeedback();

        const sentiment = {
            positive: 0, // 4-5 stars
            neutral: 0, // 3 stars
            negative: 0 // 1-2 stars
        };

        allFeedback.forEach(fb => {
            if (fb.rating >= 4) {
                sentiment.positive++;
            } else if (fb.rating === 3) {
                sentiment.neutral++;
            } else if (fb.rating >= 1) {
                sentiment.negative++;
            }
        });

        return sentiment;
    },

    /**
     * Get feedback trends (last 7 days)
     * @returns {Array} Trend data
     */
    getFeedbackTrends() {
        const allFeedback = FeedbackManager.getAllFeedback();
        const trends = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayStart = date.getTime();
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);

            const count = allFeedback.filter(fb =>
                fb.timestamp >= dayStart && fb.timestamp < dayEnd
            ).length;

            trends.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count
            });
        }

        return trends;
    },

    /**
     * Get top rated feedback
     * @param {Number} limit - Number of results
     * @returns {Array} Top feedback
     */
    getTopFeedback(limit = 5) {
        const allFeedback = FeedbackManager.getAllFeedback();
        return allFeedback
            .filter(fb => fb.rating === 5)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    },

    /**
     * Get pending feedback count
     * @returns {Number} Pending count
     */
    getPendingCount() {
        const allFeedback = FeedbackManager.getAllFeedback();
        return allFeedback.filter(fb => fb.status === 'pending').length;
    },

    /**
     * Calculate average rating (helper method)
     * @returns {Number} Average rating
     */
    calculateAverageRating() {
        const allFeedback = FeedbackManager.getAllFeedback();

        if (allFeedback.length === 0) {
            return 0;
        }

        const totalRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0);
        return parseFloat((totalRating / allFeedback.length).toFixed(1));
    },

    /**
     * Get feedback by date range
     * @param {Number} startDate - Start timestamp
     * @param {Number} endDate - End timestamp
     * @returns {Array} Filtered feedback
     */
    getFeedbackByDateRange(startDate, endDate) {
        const allFeedback = FeedbackManager.getAllFeedback();
        return allFeedback.filter(fb =>
            fb.timestamp >= startDate && fb.timestamp <= endDate
        );
    },

    /**
     * Get statistics summary
     * @returns {Object} Complete statistics
     */
    getStatisticsSummary() {
        const allFeedback = FeedbackManager.getAllFeedback();
        const sentiment = this.getSentimentAnalysis();
        const distribution = this.getRatingDistribution();

        return {
            totalFeedback: allFeedback.length,
            averageRating: this.calculateAverageRating(),
            happyCustomers: sentiment.positive,
            pendingCount: this.getPendingCount(),
            ratingDistribution: distribution,
            sentimentAnalysis: sentiment,
            categoryBreakdown: this.getCategoryDistribution()
        };
    },

    /**
     * Clear all active animations (cleanup)
     */
    clearAllAnimations() {
        this.activeAnimations.forEach((timer, id) => {
            clearInterval(timer);
        });
        this.activeAnimations.clear();
    }
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    Analytics.clearAllAnimations();
});