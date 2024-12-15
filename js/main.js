import { initializeForm } from './formHandler.js';
import { setCurrentDate } from './utils.js';

document.addEventListener('DOMContentLoaded',()=>{
    setCurrentDate('current-date-field');
    initializeForm();
});