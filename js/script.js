document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('picking-cart-form');
    const binsContainer = document.getElementById('bins-container');
    const addBinButton = document.getElementById('add-bin');
    const maxBins = 5;
    const dateSpan = document.getElementById('current-date');

    // Set current date
    dateSpan.textContent = new Date().toLocaleDateString();

    // Add bin functionality
    addBinButton.addEventListener('click', function () {
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

    // Form submission handling
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const selectedShelves = [...form.querySelectorAll('input[name="shelf"]:checked')].map(input => input.value);
        const bins = [...binsContainer.querySelectorAll('.bin-group')].map(bin => {
            return {
                type: bin.querySelector('input[name="bin-type"]').value,
                number: bin.querySelector('input[name="bin-number"]').value
            };
        });

        if (bins.length > maxBins) {
            alert('Exceeded maximum number of bins.');
            return;
        }

        data.shelves = selectedShelves;
        data.bins = bins;

        console.log('Form Submitted:', data);

        if (data['add-cart'] === 'yes') {
            alert('Please complete the next picking cart.');
            // Logic to reset the form for the next picking cart
            form.reset();
            binsContainer.innerHTML = '';
        } else {
            alert('Form submitted successfully!');
        }
    });
});
