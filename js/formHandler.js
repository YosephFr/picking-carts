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
            // Ejemplo: shelfCheck.id = "shelf-4" => letters-for-shelf-4
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
