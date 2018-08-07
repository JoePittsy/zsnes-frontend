var keyDown = false;
var leftAno = []; //Left Analog
var dPad = []; //D-PAD
var filterKeyDown;
var repGP;


// Is a gamepad init?
function canGame() {
    return "getGamepads" in navigator;
}
//Grab Gamepad controlls 
function reportOnGamepad() {
    gp = navigator.getGamepads()[0];
    if (!gameRunning) {
        if (gp.buttons[14].pressed) {
            toggleIcons('gp');
            dPad[0] = -1
        } else if (gp.buttons[15].pressed) {
            toggleIcons('gp');
            dPad[0] = 1
        } else {
            dPad[0] = 0
        }
        leftAno[0] = Math.round(gp.axes[0]);
        leftAno[1] = Math.round(gp.axes[1]);
        if (dPad[0] === -1 || leftAno[0] === -1) {
            toggleIcons('gp');
            previousSlide();
        } else if (dPad[0] === 1 || leftAno[0] === 1) {
            toggleIcons('gp');
            nextSlide();
        } else if (gp.buttons[0].pressed === true) {
            toggleIcons('gp');
            runGame();
        } else if (gp.buttons[1].pressed === true) {
            toggleIcons('gp');
            toggleFilter();
        } else if (gp.buttons[3].pressed === true) {
            toggleIcons('gp');
            toggleFav();
        }
        if (gp.buttons[3].pressed === false) {
            keyDown = false;
        }
        if (gp.buttons[1].pressed === false) {
            filterKeyDown = false;
        }
    }
}

//Set up code needed to pair gamepad
$(document).ready(function() {
    var gamepadPrompt = $("#gamepadPrompt")
    if (canGame()) {
        gamepadPrompt.html("&nbspDisconnected&nbsp");
        $(window).on("gamepadconnected", function() {
            console.log("connection event");
            gp = navigator.getGamepads()[0];
            repGP = window.setInterval(reportOnGamepad, 100);
            hasGP = true;           

            gamepadPrompt.html("&nbspConnected&nbsp");
            toggleIcons('gp');
        });
        $(window).on("gamepaddisconnected", function() {
            console.log("disconnection event");
            gamepadPrompt.html("&nbspDisconnected&nbsp");
            window.clearInterval(repGP);
        });
        //setup an interval for Chrome
        var checkGP = window.setInterval(function() {
            if (navigator.getGamepads()[0]) {
                if (!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }
});