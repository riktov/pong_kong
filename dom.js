/**
 * module to hook up the index.html DOM
 */


const buttonToggleColor = document.getElementById("button_toggle_color") ;
const buttonToggleBalls = document.getElementById("button_toggle_balls") ;
    
buttonToggleColor.addEventListener("click", toggleFlatColor) ;
buttonToggleBalls.addEventListener("click", toggleShowBalls) ;
