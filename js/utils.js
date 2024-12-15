export function setCurrentDate(elementId){
    const dateElement=document.getElementById(elementId);
    if(dateElement){
        const today=new Date().toLocaleDateString();
        if(dateElement.tagName==='INPUT'){
            dateElement.value=today;
        }else{
            dateElement.textContent=today;
        }
    }
}