import { MAX_BINS, MESSAGES } from './config.js';

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
        if (binsContainer.querySelectorAll('.bin-group').length >= MAX_BINS) {
            alert(MESSAGES.maxBinsReached);
            return;
        }
        binsContainer.appendChild(createBinGroup(true));
        const newBin = binsContainer.lastElementChild;
        newBin.classList.add('bin-group-animate');
        setTimeout(() => newBin.classList.remove('bin-group-animate'), 300);
    });

    // Lógica para shelves y letras
    const shelfCheckboxes = form.querySelectorAll('input[name="shelf"]');
    shelfCheckboxes.forEach(shelfCheck => {
        shelfCheck.addEventListener('change', () => {
            const shelfId = shelfCheck.id; // Por ejemplo, "shelf-4"
            const lettersContainer = document.getElementById(`letters-for-${shelfId}`);
            if (lettersContainer) {
                if (shelfCheck.checked) {
                    lettersContainer.classList.add('fade-in');
                    lettersContainer.classList.remove('fade-out');
                    lettersContainer.style.display = 'block';
                } else {
                    lettersContainer.classList.remove('fade-in');
                    lettersContainer.classList.add('fade-out');
                    setTimeout(()=>{
                        if (lettersContainer.classList.contains('fade-out')) {
                            lettersContainer.style.display = 'none';
                        }
                    },300);
                }
            }
        });
    });

    // Lógica para mostrar/ocultar extra fields de letras
    form.addEventListener('change', (e) => {
        if (e.target.classList.contains('letter-check')) {
            const letterBox = e.target.closest('.letter-box');
            if (letterBox) {
                const extraFields = letterBox.querySelector('.letter-extra-fields');
                if (extraFields) {
                    if (e.target.checked) {
                        extraFields.classList.add('fade-in');
                        extraFields.classList.remove('fade-out');
                        extraFields.style.display = 'block';
                    } else {
                        extraFields.classList.remove('fade-in');
                        extraFields.classList.add('fade-out');
                        setTimeout(()=>{
                            if (extraFields.classList.contains('fade-out')) {
                                extraFields.style.display = 'none';
                            }
                        },300);
                    }
                }
            }
        }
    });

    form.addEventListener('submit',e=>{
        e.preventDefault();
        // Validaciones robustas
        const requiredFields = ['line-number', 'pn-material', 'data-provider'];
        let valid = true;

        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.value.trim()) {
                valid = false;
            }
        });

        // Validar que al menos un shelf esté seleccionado
        const anyShelfSelected = form.querySelectorAll('input[name="shelf"]:checked').length > 0;
        if (!anyShelfSelected) valid = false;

        if (!valid) {
            alert(MESSAGES.validationError);
            return;
        }

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
            alert(MESSAGES.fillNextCart);
            form.reset();
            binsContainer.innerHTML='';
        } else {
            alert(MESSAGES.formSuccess);
        }
    });
}
