document.onkeydown = checkKey;
function checkKey(e) {
    toggleIcons('kb');
    e = e || window.event;
    if (e.keyCode == '37') {
        previousSlide();
    } else if (e.keyCode == '39') {
        nextSlide();
    } else if (e.keyCode == '13') {
        runGame();
    } else if (e.keyCode == '18') {
        toggleFilter();
        filterKeyDown = false;
        // Unlike the gampad for keyboard were just looking for key down so we don't have to use 
        // our own key down system
    } else if (e.keyCode == '16') {
        toggleFav();
        keyDown = false;
        // Unlike the gampad for keyboard were just looking for key down so we don't have to use 
        // our own key down system
    }
}
