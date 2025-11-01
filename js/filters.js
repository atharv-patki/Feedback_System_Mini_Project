/* ========================================
   FILTERS.JS - Filtering & Sorting
   Handles feedback filtering and sorting
   ======================================== */

const Filters = {
    currentFilters: {
        rating: 'all',
        category: 'all',
        sortBy: 'newest',
        searchTerm: ''
    },

    /**
     * Initialize filter controls
     */
    init() {
        this.attachFilterListeners();
    },

    /**
     * Attach event listeners to filter controls
     */
    attachFilterListeners() {
        // Rating filter
        const ratingFilter = document.getElementById('filterRating');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilters.rating = e.target.value;
                FeedbackManager.displayAllFeedback();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('filterCategory');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                FeedbackManager.displayAllFeedback();
            });
        }

        // Sort by
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                FeedbackManager.displayAllFeedback();
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.searchTerm = e.target.value.toLowerCase();
                FeedbackManager.displayAllFeedback();
            });
        }

        // Admin search
        const adminSearchInput = document.getElementById('adminSearchInput');
        if (adminSearchInput) {
            adminSearchInput.addEventListener('input', (e) => {
                this.currentFilters.searchTerm = e.target.value.toLowerCase();
                this.displayAdminFeedback();
            });
        }
    },

    /**
     * Apply all filters to feedback array
     * @param {Array} feedbackArray - Array to filter
     * @returns {Array} Filtered array
     */
    applyAllFilters(feedbackArray) {
        let filtered = [...feedbackArray];

        // Apply rating filter
        filtered = this.filterByRating(filtered);

        // Apply category filter
        filtered = this.filterByCategory(filtered);

        // Apply search filter
        filtered = this.filterBySearch(filtered);

        // Apply sorting
        filtered = this.sortFeedback(filtered);

        return filtered;
    },

    /**
     * Filter by rating
     * @param {Array} feedbackArray - Array to filter
     * @returns {Array} Filtered array
     */
    filterByRating(feedbackArray) {
        if (this.currentFilters.rating === 'all') {
            return feedbackArray;
        }

        const rating = Number(this.currentFilters.rating);
        return feedbackArray.filter(fb => fb.rating === rating);
    },

    /**
     * Filter by category
     * @param {Array} feedbackArray - Array to filter
     * @returns {Array} Filtered array
     */
    filterByCategory(feedbackArray) {
        if (this.currentFilters.category === 'all') {
            return feedbackArray;
        }

        return feedbackArray.filter(fb => fb.category === this.currentFilters.category);
    },

    /**
     * Filter by search term
     * @param {Array} feedbackArray - Array to filter
     * @returns {Array} Filtered array
     */
    filterBySearch(feedbackArray) {
        if (!this.currentFilters.searchTerm) {
            return feedbackArray;
        }

        const term = this.currentFilters.searchTerm;

        return feedbackArray.filter(fb =>
            fb.name.toLowerCase().includes(term) ||
            fb.email.toLowerCase().includes(term) ||
            fb.feedback.toLowerCase().includes(term) ||
            fb.category.toLowerCase().includes(term)
        );
    },

    /**
     * Sort feedback array
     * @param {Array} feedbackArray - Array to sort
     * @returns {Array} Sorted array
     */
    sortFeedback(feedbackArray) {
        const sorted = [...feedbackArray];

        switch (this.currentFilters.sortBy) {
            case 'newest':
                return sorted.sort((a, b) => b.timestamp - a.timestamp);

            case 'oldest':
                return sorted.sort((a, b) => a.timestamp - b.timestamp);

            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);

            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);

            default:
                return sorted;
        }
    },

    /**
     * Reset all filters
     */
    resetFilters() {
        this.currentFilters = {
            rating: 'all',
            category: 'all',
            sortBy: 'newest',
            searchTerm: ''
        };

        // Reset UI
        const ratingFilter = document.getElementById('filterRating');
        const categoryFilter = document.getElementById('filterCategory');
        const sortBy = document.getElementById('sortBy');
        const searchInput = document.getElementById('searchInput');

        if (ratingFilter) ratingFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        if (sortBy) sortBy.value = 'newest';
        if (searchInput) searchInput.value = '';

        FeedbackManager.displayAllFeedback();
    },

    /**
     * Display admin feedback with filters
     */
    displayAdminFeedback() {
        const container = document.getElementById('adminFeedbackGrid');
        const emptyState = document.getElementById('adminEmptyState');

        if (!container) return;

        let feedbackArray = FeedbackManager.getAllFeedback();
        feedbackArray = this.applyAllFilters(feedbackArray);

        if (feedbackArray.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = feedbackArray.map(fb =>
            FeedbackManager.createFeedbackCard(fb)
        ).join('');

        FeedbackManager.attachDeleteListeners();
    }
};