function scrollContainer(containerId,direction){
    const container = document.getElementById(containerId);
    const card = container.querySelector('.card');
    const cardWidth = card.offsetWidth;
    const scrollAmt = (cardWidth*3)+24
    if(direction === 'left'){
        container.scrollBy({left: -scrollAmt, behavior: 'smooth'});
    }
    else{
        container.scrollBy({left: scrollAmt, behavior: 'smooth'});
    }
}