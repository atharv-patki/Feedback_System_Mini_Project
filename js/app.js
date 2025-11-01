/* ========================================
   APP.JS - Main Application Entry Point
   UPDATED: Fixed auto-scroll on page load
   Initializes and coordinates all modules
   ======================================== */

// ⭐ PREVENT AUTO-SCROLL ON PAGE LOAD - ADD THIS AT TOP
(function() {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    window.scrollTo(0, 0);

    // Disable smooth scroll behavior initially
    document.documentElement.style.scrollBehavior = 'auto';
})();

// Global toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast') || document.getElementById('adminToast');
    const toastMessage = document.getElementById('toastMessage') || document.getElementById('adminToastMessage');

    if (!toast || !toastMessage) return;

    // Set message
    toastMessage.textContent = message;

    // Set type class
    toast.classList.remove('error', 'warning', 'success');
    toast.classList.add(type);

    // Update icon
    const icon = toast.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-check-circle', 'fa-exclamation-circle', 'fa-exclamation-triangle');

        switch (type) {
            case 'success':
                icon.classList.add('fa-check-circle');
                break;
            case 'error':
                icon.classList.add('fa-exclamation-circle');
                break;
            case 'warning':
                icon.classList.add('fa-exclamation-triangle');
                break;
        }
    }

    // Show toast
    toast.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Main App Initialization
document.addEventListener('DOMContentLoaded', () => {

    // ⭐ FORCE SCROLL TO TOP (prevent auto-scroll)
    window.scrollTo(0, 0);

    // Check if we're on admin page
    const isAdminPage = window.location.pathname.includes('admin.html');

    if (isAdminPage) {
        // Initialize admin panel
        AdminManager.init();
        ThemeManager.init();
    } else {
        // Initialize user-facing features
        initializeApp();
    }

    // ⭐ Re-enable smooth scroll after page is loaded (500ms delay)
    setTimeout(() => {
        document.documentElement.classList.add('loaded');
        document.documentElement.style.scrollBehavior = 'smooth';
    }, 500);
});

/**
 * Initialize main application (index.html)
 */
function initializeApp() {
    // ⭐ IMPORTANT: Prevent auto-scroll first
    window.scrollTo(0, 0);

    // Initialize theme
    ThemeManager.init();

    // Initialize filters
    Filters.init();

    // Display all feedback
    FeedbackManager.displayAllFeedback();

    // Update statistics
    Analytics.updateStatistics();

    // Setup feedback form
    setupFeedbackForm();

    // Setup star rating
    setupStarRating();

    // Setup character counter
    setupCharacterCounter();

    // Setup smooth scrolling (but only for click events)
    setupSmoothScrolling();

    console.log('Feedback Collection System initialized successfully!');
}

/**
 * Setup feedback form submission
 */
function setupFeedbackForm() {
    const form = document.getElementById('feedbackForm');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            category: document.getElementById('category').value,
            rating: document.getElementById('rating').value,
            feedback: document.getElementById('feedback').value
        };

        // Validate form
        const validation = Validation.validateForm(formData);

        if (!validation.valid) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        // Save feedback
        const success = FeedbackManager.saveFeedback(formData);

        if (success) {
            showToast('Thank you for your feedback!', 'success');
            form.reset();
            resetStarRating();

            // Scroll to feedback section ONLY after submission
            setTimeout(() => {
                const feedbackSection = document.getElementById('all-feedback');
                if (feedbackSection) {
                    feedbackSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 500);
        } else {
            showToast('Failed to submit feedback. Please try again.', 'error');
        }
    });

    // Reset button
    form.addEventListener('reset', () => {
        Validation.clearAllErrors();
        resetStarRating();
    });
}

/**
 * Setup star rating functionality
 */
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    const ratingValue = document.getElementById('ratingValue');
    const ratingText = document.getElementById('ratingText');

    if (!stars.length) return;

    const ratingTexts = {
        1: 'Very Poor',
        2: 'Poor',
        3: 'Average',
        4: 'Good',
        5: 'Excellent'
    };

    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseenter', () => {
            const value = star.dataset.value;
            highlightStars(value);
        });

        // Click to select
        star.addEventListener('click', () => {
            const value = star.dataset.value;
            ratingInput.value = value;
            ratingValue.textContent = value;
            ratingText.textContent = ratingTexts[value];
            highlightStars(value);
            Validation.clearError('rating');
        });
    });

    // Reset on mouse leave
    const starRating = document.getElementById('starRating');
    if (starRating) {
        starRating.addEventListener('mouseleave', () => {
            const currentRating = ratingInput.value;
            highlightStars(currentRating);
        });
    }

    function highlightStars(count) {
        stars.forEach((star, index) => {
            const icon = star.querySelector('i');
            if (index < count) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                star.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                star.classList.remove('active');
            }
        });
    }
}

/**
 * Reset star rating - FIXED (Smooth)
 */
function resetStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    const ratingValue = document.getElementById('ratingValue');
    const ratingText = document.getElementById('ratingText');

    if (!stars.length) return;

    // Use requestAnimationFrame for smooth reset
    requestAnimationFrame(() => {
        ratingInput.value = '0';
        ratingValue.textContent = '0';
        ratingText.textContent = 'No rating selected';

        stars.forEach(star => {
            const icon = star.querySelector('i');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            star.classList.remove('active');
        });
    });
}

/**
 * Setup character counter for textarea
 */
function setupCharacterCounter() {
    const textarea = document.getElementById('feedback');
    const charCount = document.getElementById('charCount');

    if (!textarea || !charCount) return;

    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        charCount.textContent = length;

        // Change color when approaching limit
        if (length > 450) {
            charCount.style.color = '#ef4444';
        } else if (length > 400) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#6b7280';
        }
    });
}

/**
 * Setup smooth scrolling for anchor links - FIXED
 * Only works on click, not on page load
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Skip if it's just "#"
            if (targetId === '#') return;

            const target = document.querySelector(targetId);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Helper function to show all feedback
 */
function showAllFeedback() {
    const section = document.getElementById('feedbackSection');
    if (section) {
        AdminManager.switchSection('feedback');
    }
}

// Export functions for global access
window.showToast = showToast;
window.showAllFeedback = showAllFeedback;