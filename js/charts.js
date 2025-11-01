/* ========================================
   CHARTS.JS - Data Visualization
   Handles chart creation and updates using Chart.js
   ======================================== */

const ChartsManager = {
    charts: {},

    /**
     * Initialize all charts
     */
    init() {
        this.createRatingPieChart();
        this.createFeedbackBarChart();
        this.createTimelineChart();
    },

    /**
     * Create rating distribution pie chart
     */
    createRatingPieChart() {
        const canvas = document.getElementById('ratingPieChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const distribution = Analytics.getRatingDistribution();

        // Destroy existing chart if exists
        if (this.charts.ratingPie) {
            this.charts.ratingPie.destroy();
        }

        this.charts.ratingPie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                datasets: [{
                    label: 'Rating Distribution',
                    data: [
                        distribution[1],
                        distribution[2],
                        distribution[3],
                        distribution[4],
                        distribution[5]
                    ],
                    backgroundColor: [
                        '#ef4444', // Red - 1 star
                        '#f59e0b', // Orange - 2 stars
                        '#fbbf24', // Yellow - 3 stars
                        '#10b981', // Green - 4 stars
                        '#3b82f6' // Blue - 5 stars
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create feedback trends bar chart
     */
    createFeedbackBarChart() {
        const canvas = document.getElementById('feedbackBarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const categories = Analytics.getCategoryDistribution();

        // Destroy existing chart if exists
        if (this.charts.feedbackBar) {
            this.charts.feedbackBar.destroy();
        }

        this.charts.feedbackBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: 'Feedback Count',
                    data: Object.values(categories),
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#6b7280'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                }
            }
        });
    },

    /**
     * Create timeline chart (last 7 days)
     */
    createTimelineChart() {
        const canvas = document.getElementById('timelineChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const trends = Analytics.getFeedbackTrends();

        // Destroy existing chart if exists
        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trends.map(t => t.date),
                datasets: [{
                    label: 'Feedback Count',
                    data: trends.map(t => t.count),
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    },

    /**
     * Update all charts with new data
     */
    updateAllCharts() {
        this.createRatingPieChart();
        this.createFeedbackBarChart();
        this.createTimelineChart();
    },

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};