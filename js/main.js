import { initializeForm } from './formHandler.js';
import { setCurrentDate } from './utils.js';

// Initialize the form on page load
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate('current-date');
    initializeForm();
});
