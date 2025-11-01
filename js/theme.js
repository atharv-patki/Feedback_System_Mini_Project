/* ========================================
   THEME.JS - Theme Management
   Handles dark/light mode toggle
   ======================================== */

const ThemeManager = {
    currentTheme: 'light',

    /**
     * Initialize theme
     */
    init() {
        this.loadTheme();
        this.attachListeners();
    },

    /**
     * Load saved theme from localStorage
     */
    loadTheme() {
        const settings = Storage.getSettings();
        this.currentTheme = settings.theme || 'light';
        this.applyTheme(this.currentTheme);
        this.updateToggleIcon();
    },

    /**
     * Apply theme to document
     * @param {String} theme - Theme name ('light' or 'dark')
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        this.currentTheme = theme;
    },

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
        this.updateToggleIcon();

        // Show notification
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`, 'success');
    },

    /**
     * Save theme to localStorage
     * @param {String} theme - Theme name
     */
    saveTheme(theme) {
        const settings = Storage.getSettings();
        settings.theme = theme;
        Storage.saveSettings(settings);
    },

    /**
     * Update toggle button icon
     */
    updateToggleIcon() {
        const toggleButtons = ['themeToggle', 'adminThemeToggle'];

        toggleButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                const icon = button.querySelector('i');
                if (icon) {
                    if (this.currentTheme === 'dark') {
                        icon.classList.remove('fa-moon');
                        icon.classList.add('fa-sun');
                    } else {
                        icon.classList.remove('fa-sun');
                        icon.classList.add('fa-moon');
                    }
                }
            }
        });
    },

    /**
     * Attach event listeners
     */
    attachListeners() {
        // Main theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Admin theme toggle
        const adminThemeToggle = document.getElementById('adminThemeToggle');
        if (adminThemeToggle) {
            adminThemeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Theme radio buttons (settings page)
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
                this.saveTheme(e.target.value);
            });

            // Set checked state
            if (radio.value === this.currentTheme) {
                radio.checked = true;
            }
        });
    },

    /**
     * Get current theme
     * @returns {String} Current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
};