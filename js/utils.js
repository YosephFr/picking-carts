export function setCurrentDate(elementId) {
    const dateElement = document.getElementById(elementId);
    if (dateElement) {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric', 
            hour12: true 
        };
        const formattedDate = now.toLocaleString('en-US', options);

        if (dateElement.tagName === 'INPUT') {
            dateElement.value = formattedDate;
        } else {
            dateElement.textContent = formattedDate;
        }
    }
}
