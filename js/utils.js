export function setCurrentDate(elementId) {
    const dateElement = document.getElementById(elementId);
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString();
    }
}
