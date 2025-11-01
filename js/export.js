/* ========================================
   EXPORT.JS - Export Data Functionality
   Handles exporting data to CSV and JSON
   ======================================== */

const ExportManager = {

        /**
         * Export feedback to CSV
         */
        exportToCSV() {
            const allFeedback = FeedbackManager.getAllFeedback();

            if (allFeedback.length === 0) {
                showToast('No feedback to export', 'warning');
                return;
            }

            // CSV Headers
            const headers = ['ID', 'Name', 'Email', 'Category', 'Rating', 'Feedback', 'Date', 'Status', 'Admin Reply'];

            // Convert feedback to CSV rows
            const rows = allFeedback.map(fb => {
                return [
                    fb.id,
                    this.escapeCSV(fb.name),
                    this.escapeCSV(fb.email),
                    fb.category,
                    fb.rating,
                    this.escapeCSV(fb.feedback),
                    new Date(fb.timestamp).toLocaleString(),
                    fb.status,
                    this.escapeCSV(fb.adminReply || '')
                ];
            });

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Create and download file
            this.downloadFile(csvContent, 'feedback-data.csv', 'text/csv');
            showToast('Feedback exported to CSV successfully', 'success');
        },

        /**
         * Escape CSV special characters
         * @param {String} str - String to escape
         * @returns {String} Escaped string
         */
        escapeCSV(str) {
            if (typeof str !== 'string') return '';

            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        },

        /**
         * Export feedback to JSON
         */
        exportToJSON() {
            const allData = Storage.exportData();

            if (!allData) {
                showToast('No data to export', 'warning');
                return;
            }

            this.downloadFile(allData, 'feedback-backup.json', 'application/json');
            showToast('Data exported to JSON successfully', 'success');
        },

        /**
         * Import data from JSON file
         * @param {File} file - File object
         */
        importFromJSON(file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const jsonData = e.target.result;
                    const success = Storage.importData(jsonData);

                    if (success) {
                        FeedbackManager.displayAllFeedback();
                        Analytics.updateStatistics();
                        showToast('Data imported successfully', 'success');

                        // Refresh page after import
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showToast('Failed to import data', 'error');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    showToast('Invalid file format', 'error');
                }
            };

            reader.onerror = () => {
                showToast('Error reading file', 'error');
            };

            reader.readAsText(file);
        },

        /**
         * Download file
         * @param {String} content - File content
         * @param {String} filename - File name
         * @param {String} mimeType - MIME type
         */
        downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        },

        /**
         * Print feedback
         */
        printFeedback() {
            window.print();
        },

        /**
         * Generate and download report
         */
        generateReport() {
            const allFeedback = FeedbackManager.getAllFeedback();
            const distribution = Analytics.getRatingDistribution();
            const sentiment = Analytics.getSentimentAnalysis();
            const avgRating = Analytics.calculateAverageRating();

            const report = `
FEEDBACK COLLECTION SYSTEM - REPORT
Generated: ${new Date().toLocaleString()}
========================================

SUMMARY STATISTICS
------------------
Total Feedback: ${allFeedback.length}
Average Rating: ${avgRating.toFixed(2)}/5
Happy Customers (4+ stars): ${sentiment.positive}

SENTIMENT ANALYSIS
------------------
Positive (4-5 stars): ${sentiment.positive} (${((sentiment.positive/allFeedback.length)*100).toFixed(1)}%)
Neutral (3 stars): ${sentiment.neutral} (${((sentiment.neutral/allFeedback.length)*100).toFixed(1)}%)
Negative (1-2 stars): ${sentiment.negative} (${((sentiment.negative/allFeedback.length)*100).toFixed(1)}%)

RATING DISTRIBUTION
-------------------
5 Stars: ${distribution[5]}
4 Stars: ${distribution[4]}
3 Stars: ${distribution[3]}
2 Stars: ${distribution[2]}
1 Star: ${distribution[1]}

CATEGORY BREAKDOWN
------------------
${Object.entries(Analytics.getCategoryDistribution())
    .map(([cat, count]) => `${cat}: ${count}`)
    .join('\n')}

RECENT FEEDBACK
---------------
${allFeedback.slice(0, 5).map((fb, i) => `
${i + 1}. ${fb.name} - ${fb.rating} stars (${fb.category})
   "${fb.feedback}"
   Date: ${new Date(fb.timestamp).toLocaleString()}
`).join('\n')}

========================================
End of Report
        `;
        
        this.downloadFile(report, 'feedback-report.txt', 'text/plain');
        showToast('Report generated successfully', 'success');
    }
};