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

function enterLinkMode(form, letterBox) {
    form.classList.add('linking');
    letterBox.classList.add('selected-letter-box');
    document.querySelectorAll('.letter-box').forEach(box=>{
        if(box!==letterBox) box.classList.add('link-mode-target');
    });
}

function exitLinkMode(form) {
    form.classList.remove('linking');
    document.querySelectorAll('.letter-box').forEach(box=>{
        box.classList.remove('selected-letter-box','link-mode-target');
    });
}

function getLettersFromBox(box) {
    const label = box.querySelector('.letter-label');
    if(!label) return [];
    return label.textContent.trim().split('-');
}

function isCombined(box) {
    return box.classList.contains('combined');
}

function createCombinedBox(lettersArray, origin) {
    const lettersStr = lettersArray.join('-');
    const box = document.createElement('div');
    box.classList.add('letter-box','combined','linked');
    box.setAttribute('data-origin', origin);
    box.innerHTML = `
        <div class="letter-label">${lettersStr}</div>
        <input type="checkbox" class="letter-check">
        <span class="link-trigger" data-link-mode="off">
            <i class="material-icons link-icon">link_off</i>
        </span>
        <div class="letter-extra-fields" style="display:none;">
            <label><input type="text" class="extra-field" placeholder="item #"></label>
            <label><input type="text" class="extra-field" placeholder="sort string"></label>
        </div>
    `;
    return box;
}

function createSingleBox(letter) {
    const single = document.createElement('div');
    single.classList.add('letter-box');
    single.innerHTML=`
        <div class="letter-label">${letter}</div>
        <input type="checkbox" class="letter-check">
        <span class="link-trigger" data-link-mode="off">
            <i class="material-icons link-icon">link</i>
            <small>Link</small>
        </span>
        <div class="letter-extra-fields" style="display:none;">
            <label><input type="text" class="extra-field" placeholder="item #"></label>
            <label><input type="text" class="extra-field" placeholder="sort string"></label>
        </div>
    `;
    return single;
}

function areAdjacent(parent, box1, box2) {
    const boxes = [...parent.querySelectorAll('.letter-box')];
    const i1 = boxes.indexOf(box1);
    const i2 = boxes.indexOf(box2);
    return Math.abs(i1 - i2) === 1;
}

function unlinkCombinedBox(form, box) {
    const letters = getLettersFromBox(box);
    const origin = box.getAttribute('data-origin');
    const parent = box.parentNode;
    const index = [...parent.children].indexOf(box);
    box.remove();
    if(origin==='single-single') {
        let pos = index;
        letters.forEach(l=>{
            const single = createSingleBox(l);
            const children = [...parent.children];
            if(pos>=children.length) parent.appendChild(single);
            else parent.insertBefore(single, children[pos]);
            pos++;
        });
    } else if(origin==='combined-single') {
        const l = letters[letters.length-1];
        const single = createSingleBox(l);
        const children = [...parent.children];
        if(index>=children.length) parent.appendChild(single);
        else parent.insertBefore(single, children[index]);
    } else if(origin==='single-combined') {
        const l = letters[0];
        const single = createSingleBox(l);
        const children = [...parent.children];
        if(index>=children.length) parent.appendChild(single);
        else parent.insertBefore(single, children[index]);
    }
}

function combineLetterBoxes(form, box1, box2) {
    const parent = box1.parentNode;
    if(!areAdjacent(parent, box1, box2)) {
        exitLinkMode(form);
        return;
    }
    const boxes = [...parent.querySelectorAll('.letter-box')];
    const i1 = boxes.indexOf(box1);
    const i2 = boxes.indexOf(box2);
    const leftBox = i1<i2?box1:box2;
    const rightBox = leftBox===box1?box2:box1;
    const leftLetters = getLettersFromBox(leftBox);
    const rightLetters = getLettersFromBox(rightBox);
    const leftCombined = isCombined(leftBox);
    const rightCombined = isCombined(rightBox);

    if(!leftCombined && !rightCombined && leftLetters.length===1 && rightLetters.length===1) {
        const combined = createCombinedBox([leftLetters[0], rightLetters[0]], 'single-single');
        const leftIndex = boxes.indexOf(leftBox);
        leftBox.remove();
        const afterRemove = [...parent.querySelectorAll('.letter-box')];
        rightBox.remove();
        const finalChildren = [...parent.querySelectorAll('.letter-box')];
        if(finalChildren.length===0 || leftIndex>=finalChildren.length) parent.appendChild(combined);
        else parent.insertBefore(combined, finalChildren[leftIndex]);
    } else if(leftCombined && !rightCombined && rightLetters.length===1) {
        const origin='combined-single';
        const leftIndex = boxes.indexOf(leftBox);
        const newCombined = createCombinedBox([leftLetters[leftLetters.length-1], rightLetters[0]], origin);
        rightBox.remove();
        const finalChildren = [...parent.querySelectorAll('.letter-box')];
        if(leftIndex+1>finalChildren.length-1) parent.appendChild(newCombined);
        else parent.insertBefore(newCombined, finalChildren[leftIndex+1]);
    } else if(!leftCombined && rightCombined && leftLetters.length===1) {
        const origin='single-combined';
        const rightIndex = boxes.indexOf(rightBox);
        const newCombined = createCombinedBox([leftLetters[0], rightLetters[0]], origin);
        leftBox.remove();
        const finalChildren = [...parent.querySelectorAll('.letter-box')];
        if(rightIndex>=finalChildren.length) parent.appendChild(newCombined);
        else parent.insertBefore(newCombined, finalChildren[rightIndex]);
    }
    exitLinkMode(form);
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

        const letterBox = target.closest('.letter-box');
        const linkTrigger = target.closest('.link-trigger');

        if(form.classList.contains('linking')) {
            if(!letterBox) exitLinkMode(form);
            else {
                const selected = form.querySelector('.selected-letter-box');
                if(selected && letterBox!==selected) {
                    combineLetterBoxes(form, selected, letterBox);
                } else if(selected && letterBox===selected) {
                    exitLinkMode(form);
                }
            }
        } else {
            if(linkTrigger) {
                if(letterBox.classList.contains('linked')) {
                    unlinkCombinedBox(form, letterBox);
                } else {
                    enterLinkMode(form, letterBox);
                }
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
            if (extraFields) toggleFade(extraFields, e.target.checked);
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
            bins: [...form.querySelectorAll('.bin-group')].map(b => ({
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
