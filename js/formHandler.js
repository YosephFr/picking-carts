function createBinGroup(canRemove = false) {
    const binGroup = document.createElement('div');
    binGroup.classList.add('bin-group');
    binGroup.innerHTML = `
        <div class="bin-line">
            <label>Type of Bin:</label>
            <input type="text" name="bin-type" required>
        </div>
        <div class="bin-line">
            <label>Quantity:</label>
            <input type="number" name="bin-number" min="1" required>
        </div>
    `;
    if (canRemove) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-bin-btn');
        removeBtn.addEventListener('click', () => {
            binGroup.remove();
        });
        binGroup.appendChild(removeBtn);
    }
    return binGroup;
}
export function initializeForm() {
    const form = document.getElementById('picking-cart-form');
    const binsContainer = document.getElementById('bins-container');
    const addBinButton = document.getElementById('add-bin');
    const maxBins = 5;

    // Crear primer bin por defecto sin botón X
    binsContainer.appendChild(createBinGroup(false));

    addBinButton.addEventListener('click', () => {
        if (binsContainer.querySelectorAll('.bin-group').length >= maxBins) {
            alert('You can only add up to 5 bins.');
            return;
        }
        binsContainer.appendChild(createBinGroup(true));
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
