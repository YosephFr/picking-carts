export function initializeForm() {
    const form = document.getElementById('picking-cart-form');
    const binsContainer = document.getElementById('bins-container');
    const addBinButton = document.getElementById('add-bin');
    const maxBins = 5;

    addBinButton.addEventListener('click', () => {
        if (binsContainer.children.length >= maxBins) {
            alert('You can only add up to 5 bins.');
            return;
        }

        const binGroup = document.createElement('div');
        binGroup.classList.add('bin-group');
        binGroup.innerHTML = `
            <label>Type of Bin:</label>
            <input type="text" name="bin-type" required>
            <label>Number of Bins:</label>
            <input type="number" name="bin-number" min="1" required>
        `;
        binsContainer.appendChild(binGroup);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);

        const selectedShelves = [...form.querySelectorAll('input[name="shelf"]:checked')].map(input => input.value);
        const bins = [...binsContainer.querySelectorAll('.bin-group')].map(bin => ({
            type: bin.querySelector('input[name="bin-type"]').value,
            number: bin.querySelector('input[name="bin-number"]').value
        }));

        const data = {
            ...Object.fromEntries(formData.entries()),
            shelves: selectedShelves,
            bins
        };

        console.log('Form Submitted:', data);

        if (data['add-cart'] === 'yes') {
            alert('Please fill in the details for the next picking cart.');
            form.reset();
            binsContainer.innerHTML = '';
        } else {
            alert('Form submitted successfully!');
        }
    });
}
