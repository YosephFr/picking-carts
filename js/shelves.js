const shelves=[
    {number:'4',letters:['A','B','C','D','E','F']},
    {number:'3',letters:['A','B','C','D','E','F']},
    {number:'2',letters:['A','B','C','D','E','F']},
    {number:'1',letters:['A','B','C','D','E','F']}
   ]
   const container=document.getElementById('dynamic-shelves-container')
   shelves.forEach(s=>{
    const shelfRow=document.createElement('div')
    shelfRow.className='shelf-row'
    shelfRow.innerHTML=`
      <input type="checkbox" id="shelf-${s.number}" name="shelf" value="${s.number}">
      <label for="shelf-${s.number}">Shelf ${s.number}</label>
    `
    const lettersContainer=document.createElement('div')
    lettersContainer.className='letters-row-container'
    lettersContainer.id=`letters-for-shelf-${s.number}`
    lettersContainer.style.display='none'
    const lettersGrid=document.createElement('div')
    lettersGrid.className='letters-grid'
    s.letters.forEach(l=>{
     const box=document.createElement('div')
     box.className=`letter-box shelf-${s.number}`
// Reemplaza el bloque innerHTML del letter-box por este:
box.innerHTML=`
  <div class="letter-label">${l}</div>
  <input type="checkbox" class="letter-check" id="shelf-${s.number}-${l}" name="letter-shelf-${s.number}-${l}">
  <span class="link-trigger" data-link-mode="off">
    <i class="material-icons link-icon">link</i>
    <small>Link</small>
  </span>
  <div class="letter-extra-fields" style="display:none;">
    <label><input type="text" name="item-number-shelf-${s.number}-${l}" class="extra-field" placeholder="item #"></label>
    <label><input type="text" name="sort-string-shelf-${s.number}-${l}" class="extra-field" placeholder="sort string"></label>
  </div>
`

     lettersGrid.appendChild(box)
    })
    lettersContainer.appendChild(lettersGrid)
    container.appendChild(shelfRow)
    container.appendChild(lettersContainer)
   })
   