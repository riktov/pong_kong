/**
 * module to hook up the index.html DOM
 */


const buttonToggleColor = document.getElementById("button_toggle_color") ;
const buttonToggleBalls = document.getElementById("button_toggle_balls") ;
const buttonToggleSkipLoops = document.getElementById("button_toggle_skip_loops") ;

    
buttonToggleColor.addEventListener("click", toggleFlatColor) ;
buttonToggleBalls.addEventListener("click", toggleShowBalls) ;
buttonToggleSkipLoops.addEventListener("click", toggleSkipLoops) ;
