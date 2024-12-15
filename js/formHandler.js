import { MAX_BINS, MESSAGES } from './config.js';

function createBinGroup(canRemove = false) {
    const binGroup = document.createElement('div');
    binGroup.classList.add('bin-group');
    binGroup.innerHTML = `
        <div class="bin-line">
            <label class="test">Type of Bin:</label>
            <input type="text" name="bin-type" required>
        </div>
        <div class="bin-line" id="qty">
            <label>Qty:</label>
            <input type="number" name="bin-number" min="1" required>
        </div>
    `;

    const iconsContainer = document.createElement('span');
    iconsContainer.classList.add('bin-icons');
    const icons = canRemove
        ? `
            <i class="material-icons icon-remove" title="Remove this bin">remove_circle</i>
            <i class="material-icons icon-add" title="Add another bin">add_circle</i>
          `
        : `
            <i class="material-icons icon-clean" title="Clear fields">refresh</i>
            <i class="material-icons icon-add" title="Add another bin">add_circle</i>
          `;
    iconsContainer.innerHTML = icons;
    binGroup.appendChild(iconsContainer);

    return binGroup;
}

function toggleFade(element, show) {
    if (show) {
        element.classList.add('fade-in');
        element.classList.remove('fade-out');
        element.style.display = 'block';
    } else {
        element.classList.remove('fade-in');
        element.classList.add('fade-out');
        setTimeout(() => {
            if (element.classList.contains('fade-out')) {
                element.style.display = 'none';
            }
        }, 300);
    }
}

export function initializeForm() {
    const form = document.getElementById('picking-cart-form');
    const binsContainer = document.getElementById('bins-container');
    binsContainer.appendChild(createBinGroup());

    form.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('icon-add')) {
            if (binsContainer.children.length < MAX_BINS) {
                const newBin = createBinGroup(true);
                binsContainer.appendChild(newBin);
                newBin.classList.add('bin-group-animate');
                setTimeout(() => newBin.classList.remove('bin-group-animate'), 300);
            } else {
                alert(MESSAGES.maxBinsReached);
            }
        } else if (target.classList.contains('icon-remove')) {
            const binToRemove = target.closest('.bin-group');
            binToRemove?.remove();
        } else if (target.classList.contains('icon-clean')) {
            const binToClean = target.closest('.bin-group');
            if (binToClean) {
                binToClean.querySelectorAll('input').forEach(input => input.value = '');
            }
        }
    });

    form.querySelectorAll('input[name="shelf"]').forEach(shelfCheck => {
        shelfCheck.addEventListener('change', () => {
            const lettersContainer = document.getElementById(`letters-for-${shelfCheck.id}`);
            if (lettersContainer) {
                toggleFade(lettersContainer, shelfCheck.checked);
            }
        });
    });

    form.addEventListener('change', (e) => {
        if (e.target.classList.contains('letter-check')) {
            const extraFields = e.target.closest('.letter-box')?.querySelector('.letter-extra-fields');
            if (extraFields) {
                toggleFade(extraFields, e.target.checked);
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const requiredFields = ['line-number', 'pn-material', 'data-provider'];
        const isValid = requiredFields.every(name => {
            const field = form.querySelector(`[name="${name}"]`);
            return field && field.value.trim();
        }) && form.querySelectorAll('input[name="shelf"]:checked').length > 0;

        if (!isValid) {
            alert(MESSAGES.validationError);
            return;
        }

        const formData = new FormData(form);
        const data = {
            ...Object.fromEntries(formData.entries()),
            shelves: [...form.querySelectorAll('input[name="shelf"]:checked')].map(i => i.value),
            bins: [...binsContainer.querySelectorAll('.bin-group')].map(b => ({
                type: b.querySelector('input[name="bin-type"]').value,
                number: b.querySelector('input[name="bin-number"]').value
            }))
        };

        console.log('Form Submitted:', data);

        if (data['add-cart'] === 'yes') {
            alert(MESSAGES.fillNextCart);
            form.reset();
            binsContainer.innerHTML = '';
            binsContainer.appendChild(createBinGroup());
        } else {
            alert(MESSAGES.formSuccess);
        }
    });
}
