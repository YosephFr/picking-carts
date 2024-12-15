function createBinGroup(canRemove=false){
    const binGroup=document.createElement('div');
    binGroup.classList.add('bin-group');
    binGroup.innerHTML=`
        <div class="bin-line">
            <label>Type of Bin:</label>
            <input type="text" name="bin-type" required>
        </div>
        <div class="bin-line">
            <label>Quantity:</label>
            <input type="number" name="bin-number" min="1" required>
        </div>
    `;
    if(canRemove){
        const removeBtn=document.createElement('button');
        removeBtn.type='button';
        removeBtn.textContent='X';
        removeBtn.classList.add('remove-bin-btn');
        removeBtn.addEventListener('click',()=>binGroup.remove());
        binGroup.appendChild(removeBtn);
    }
    return binGroup;
}

export function initializeForm(){
    const form=document.getElementById('picking-cart-form');
    const binsContainer=document.getElementById('bins-container');
    const addBinButton=document.getElementById('add-bin');

    // Agregamos primer bin sin botón de remover
    binsContainer.appendChild(createBinGroup());

    addBinButton.addEventListener('click',()=>{
        if(binsContainer.querySelectorAll('.bin-group').length>=5){
            alert('You can only add up to 5 bins.');
            return;
        }
        binsContainer.appendChild(createBinGroup(true));
    });

    // Lógica para shelves y letters rows
    const shelfCheckboxes = form.querySelectorAll('input[name="shelf"]');
    shelfCheckboxes.forEach(shelfCheck => {
        shelfCheck.addEventListener('change', () => {
            const shelfId = shelfCheck.id;
            const lettersContainer = document.getElementById(`letters-for-${shelfId}`);
            if (lettersContainer) {
                lettersContainer.style.display = shelfCheck.checked ? 'block' : 'none';
            }
        });
    });

    // Lógica para las letter-checks dentro de cada letter-box
    form.addEventListener('change', (e) => {
        if (e.target.classList.contains('letter-check')) {
            const letterBox = e.target.closest('.letter-box');
            if (letterBox) {
                const extraFields = letterBox.querySelector('.letter-extra-fields');
                if (extraFields) {
                    extraFields.style.display = e.target.checked ? 'block' : 'none';
                }
            }
        }
    });

    // Marcar el checkbox al hacer click en letter-box (fuera del checkbox)
    const letterBoxes = form.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        const check = box.querySelector('.letter-check');
        if (check) {
            box.addEventListener('click', e => {
                if (e.target !== check) {
                    check.checked = true;
                    const changeEvent = new Event('change', { bubbles: true });
                    check.dispatchEvent(changeEvent);
                }
            });
            check.addEventListener('click', e => {
                e.stopPropagation();
            });
        }
    });

    // =========== LÓGICA DE UNIFICACIÓN DE LETTER-BOXES ===========

    // Guardar el estado original de cada letter-box para restaurarlo luego.
    // Clonaremos el HTML original al cargar la página.
    const originalBoxesState = {};
    function storeOriginalState() {
        form.querySelectorAll('.letter-box').forEach(box => {
            const shelfContainer = box.closest('.letters-row-container');
            if (!shelfContainer) return;
            const shelfId = shelfContainer.id.replace('letters-for-','');
            const letter = box.dataset.letter;
            originalBoxesState[`${shelfId}-${letter}`] = box.outerHTML;
        });
    }
    storeOriginalState();

    let isDraggingForUnify = false;
    let unifyStartBox = null;
    let unifySelectedBoxes = [];

    // Función para verificar si las letras son contiguas
    function areLettersContiguous(boxes) {
        const letters = boxes.map(b=>b.dataset.letter.charCodeAt(0)).sort((a,b)=>a-b);
        for(let i=0;i<letters.length-1;i++){
            if(letters[i+1]!==letters[i]+1) return false;
        }
        return true;
    }

    // Re-inicializar eventos tras restaurar
    function reinitLetterBoxEvents() {
        // Marcar check al hacer click en letter-box
        form.querySelectorAll('.letter-box').forEach(box => {
            const check = box.querySelector('.letter-check');
            if (check) {
                box.addEventListener('click', e => {
                    if (e.target !== check) {
                        check.checked = true;
                        const changeEvent = new Event('change', { bubbles: true });
                        check.dispatchEvent(changeEvent);
                    }
                });
                check.addEventListener('click', e => {
                    e.stopPropagation();
                });
            }
        });
        // Reasignar eventos de arrastre/unión
        assignUnifyEvents();
    }

    function assignUnifyEvents() {
        form.querySelectorAll('.letter-handle-radio').forEach(handleRadio => {
            const box = handleRadio.closest('.letter-box');
            handleRadio.addEventListener('mousedown', e => {
                e.stopPropagation();
                e.preventDefault();
                isDraggingForUnify = true;
                unifyStartBox = box;
                unifySelectedBoxes = [box];
                handleRadio.checked = true;
            });
        });
    }

    assignUnifyEvents();

    form.addEventListener('mousemove', e => {
        if (!isDraggingForUnify) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const letterBox = target?.closest('.letter-box');
        if (letterBox && letterBox !== unifyStartBox && !unifySelectedBoxes.includes(letterBox)) {
            // Verificar contigüidad y tamaño
            const tempBoxes = [...unifySelectedBoxes, letterBox];
            if (tempBoxes.length<=3 && areLettersContiguous(tempBoxes)) {
                unifySelectedBoxes.push(letterBox);
                const handle = letterBox.querySelector('.letter-handle-radio');
                if (handle) handle.checked = true;
            }
        }
    });

    form.addEventListener('mouseup', e => {
        if (!isDraggingForUnify) return;
        isDraggingForUnify = false;
        if (unifySelectedBoxes.length < 2) {
            // Desmarcar si fue solo una
            const handle = unifyStartBox.querySelector('.letter-handle-radio');
            if (handle) handle.checked = false;
            unifySelectedBoxes = [];
            unifyStartBox = null;
            return;
        }
        unifyBoxes(unifySelectedBoxes);
        unifySelectedBoxes = [];
        unifyStartBox = null;
    });

    function unifyBoxes(boxes) {
        boxes.sort((a,b)=> a.dataset.letter.charCodeAt(0)-b.dataset.letter.charCodeAt(0));
        const firstBox = boxes[0];
        const lastBox = boxes[boxes.length-1];
        const combinedLetters = boxes.map(b=>b.dataset.letter).join('-');
        const shelfContainer = firstBox.closest('.letters-row-container');
        const shelfId = shelfContainer.id.replace('letters-for-','');

        // Tomamos el estado original del primer box para no perder su estructura
        // Luego ajustamos su contenido para reflejar la unión
        // Guardamos sus inputs y ajustamos el name.
        const letterLabel = firstBox.querySelector('.letter-label');
        const letterCheck = firstBox.querySelector('.letter-check');
        const extraFields = firstBox.querySelector('.letter-extra-fields');

        letterLabel.textContent = combinedLetters;

        // Ajustar names de los campos internos para reflejar el rango de letras
        const inputs = extraFields.querySelectorAll('input[type="text"]');
        if (inputs.length>0) {
            inputs[0].name = `item-number-${shelfId}-${combinedLetters}`;
        }
        if (inputs.length>1) {
            inputs[1].name = `sort-string-${shelfId}-${combinedLetters}`;
        }

        // Eliminar las otras cajas excepto la primera
        for (let i=1; i<boxes.length; i++) {
            boxes[i].remove();
        }

        firstBox.dataset.combined = "true";
        firstBox.dataset.combinedLetters = combinedLetters;

        // Añadir listener para deshacer la unificación
        const handleRadio = firstBox.querySelector('.letter-handle-radio');
        if (handleRadio) {
            handleRadio.addEventListener('click', restoreBoxes, { once: true });
        }

        // Al hacer click en la caja con el handle, restaurar
        function restoreBoxes(e) {
            e.stopPropagation();
            if (firstBox.dataset.combined==="true") {
                const letters = combinedLetters.split('-');
                // Remover la caja actual
                firstBox.remove();
                const parentGrid = shelfContainer.querySelector('.letters-grid');
                // Restaurar las cajas individuales a partir del originalBoxesState
                letters.forEach(letter => {
                    const originalHTML = originalBoxesState[`${shelfId}-${letter}`];
                    parentGrid.insertAdjacentHTML('beforeend', originalHTML);
                });
                // Re-inicializar eventos
                reinitLetterBoxEvents();
            }
        }
    }

    form.addEventListener('submit',e=>{
        e.preventDefault();
        const formData=new FormData(form);
        const data={
            ...Object.fromEntries(formData.entries()),
            shelves:[...form.querySelectorAll('input[name="shelf"]:checked')].map(i=>i.value),
            bins:[...binsContainer.querySelectorAll('.bin-group')].map(b=>({
                type:b.querySelector('input[name="bin-type"]').value,
                number:b.querySelector('input[name="bin-number"]').value
            }))
        };

        console.log('Form Submitted:',data);

        if(data['add-cart']==='yes'){
            alert('Please fill in the details for the next picking cart.');
            form.reset();
            binsContainer.innerHTML='';
        }else{
            alert('Form submitted successfully!');
        }
    });
}
