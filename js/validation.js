/* ========================================
   VALIDATION.JS - Form Validation Logic
   Handles all form validation
   ======================================== */

const Validation = {

    /**
     * Validate name field
     * @param {String} name - Name to validate
     * @returns {Object} { valid: Boolean, message: String }
     */
    validateName(name) {
        if (!name || name.trim().length === 0) {
            return { valid: false, message: 'Name is required' };
        }

        if (name.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters' };
        }

        if (name.trim().length > 50) {
            return { valid: false, message: 'Name must not exceed 50 characters' };
        }

        // Check for valid characters (letters, spaces, hyphens)
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(name.trim())) {
            return { valid: false, message: 'Name contains invalid characters' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Validate email field
     * @param {String} email - Email to validate
     * @returns {Object} { valid: Boolean, message: String }
     */
    validateEmail(email) {
        if (!email || email.trim().length === 0) {
            return { valid: false, message: 'Email is required' };
        }

        // RFC 5322 compliant email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return { valid: false, message: 'Please enter a valid email address' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Validate category field
     * @param {String} category - Category to validate
     * @returns {Object} { valid: Boolean, message: String }
     */
    validateCategory(category) {
        const validCategories = ['Service', 'Product', 'Support', 'Website', 'Other'];

        if (!category || category.trim().length === 0) {
            return { valid: false, message: 'Please select a category' };
        }

        if (!validCategories.includes(category)) {
            return { valid: false, message: 'Invalid category selected' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Validate rating
     * @param {Number} rating - Rating value (1-5)
     * @returns {Object} { valid: Boolean, message: String }
     */
    validateRating(rating) {
        const numRating = Number(rating);

        if (!rating || numRating === 0) {
            return { valid: false, message: 'Please select a rating' };
        }

        if (numRating < 1 || numRating > 5) {
            return { valid: false, message: 'Rating must be between 1 and 5' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Validate feedback text
     * @param {String} feedback - Feedback text to validate
     * @returns {Object} { valid: Boolean, message: String }
     */
    validateFeedback(feedback) {
        if (!feedback || feedback.trim().length === 0) {
            return { valid: false, message: 'Feedback is required' };
        }

        if (feedback.trim().length < 10) {
            return { valid: false, message: 'Feedback must be at least 10 characters' };
        }

        if (feedback.trim().length > 500) {
            return { valid: false, message: 'Feedback must not exceed 500 characters' };
        }

        return { valid: true, message: '' };
    },

    /**
     * Show error message for a field
     * @param {String} fieldId - Field ID
     * @param {String} message - Error message
     */
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`);

        if (field) {
            field.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
        }
    },

    /**
     * Clear error for a field
     * @param {String} fieldId - Field ID
     */
    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`);

        if (field) {
            field.classList.remove('error');
        }

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    },

    /**
     * Clear all form errors
     */
    clearAllErrors() {
        const errorFields = ['name', 'email', 'category', 'rating', 'feedback'];
        errorFields.forEach(field => this.clearError(field));
    },

    /**
     * Validate entire feedback form
     * @param {Object} formData - Form data object
     * @returns {Object} { valid: Boolean, errors: Object }
     */
    validateForm(formData) {
        this.clearAllErrors();

        const errors = {};
        let isValid = true;

        // Validate name
        const nameValidation = this.validateName(formData.name);
        if (!nameValidation.valid) {
            errors.name = nameValidation.message;
            this.showError('name', nameValidation.message);
            isValid = false;
        }

        // Validate email
        const emailValidation = this.validateEmail(formData.email);
        if (!emailValidation.valid) {
            errors.email = emailValidation.message;
            this.showError('email', emailValidation.message);
            isValid = false;
        }

        // Validate category
        const categoryValidation = this.validateCategory(formData.category);
        if (!categoryValidation.valid) {
            errors.category = categoryValidation.message;
            this.showError('category', categoryValidation.message);
            isValid = false;
        }

        // Validate rating
        const ratingValidation = this.validateRating(formData.rating);
        if (!ratingValidation.valid) {
            errors.rating = ratingValidation.message;
            this.showError('rating', ratingValidation.message);
            isValid = false;
        }

        // Validate feedback
        const feedbackValidation = this.validateFeedback(formData.feedback);
        if (!feedbackValidation.valid) {
            errors.feedback = feedbackValidation.message;
            this.showError('feedback', feedbackValidation.message);
            isValid = false;
        }

        return { valid: isValid, errors };
    },

    /**
     * Sanitize input to prevent XSS
     * @param {String} input - Input string
     * @returns {String} Sanitized string
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Validate admin password
     * @param {String} password - Password to validate
     * @returns {Boolean}
     */
    validateAdminPassword(password) {
        const settings = Storage.getSettings();
        return password === settings.adminPassword;
    }
};