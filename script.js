const exec = require('child_process').exec;
const remote = require('electron').remote;
var Datastore = require('nedb');
let w = remote.getCurrentWindow();
var gameRunning = false;
var filtered = false;
var keyDown = false;
var leftAno = []; //Left Analog
var dPad = []; //D-PAD
var games = [];
var filterKeyDown;
var tempGames;
var carousel;
var repGP;




//Runs the ZSNES Emulator and sets the gameRunning flag so we dont steal inuput form ZSNES
function execute(command) {
    gameRunning = true;
    exec(command, (error, stdout, stderr) => {
        gameRunning = false;
    });
};
//==================================================================================================//
// Initilizes the carousel of games
async function startSlick() {
    var result = await resolve();
    $(".center").slick({
        accessibility: true,
        arrows: false,
        centerMode: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        infinite: true,
        cssEase: 'linear',
        variableWidth: true,
        variableHeight: true,
    });
}
// Needed to ensure that Slick is not init before images are loaded
function resolve() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 100);
    });
}
// ==================================================================================================//
function reloadGames(num) {
    games = []
    db.loadDatabase(function(err) {
        db.find({}, function(err, docs) {
            for (var i = 0; i < docs.length; i++) {
                games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus'], docs[i]['_id']])
                if (i === docs.length - 1) {
                    if (games[num][3] === 0) {
                        $("#name").html(games[num][0] + " ☆");
                    } else {
                        $("#name").html(games[num][0] + " ★");
                    }
                }
            };
        });
    });
}
// Loads the games.json file and populates the carousel with images then inits Slick
async function getGames() {
    db = new Datastore({
        filename: 'games.db'
    });
    db.loadDatabase(function(err) { // Callback is optional
        // Find all documents in the collection
        db.find({}, function(err, docs) {
            for (var i = 0; i < docs.length; i++) {
                games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus'], docs[i]['_id']])
            };
            if (games[0][3] === 0) {
                $("#name").html(games[0][0] + " ☆");
            } else {
                $("#name").html(games[0][0] + " ★");
            }
            for (var i = 0; i <= games.length; i++) {
                carousel.append("<div><img class = 'gameImage' src = '" + games[i][1] + "'></div>");
                if (i === games.length - 1) {
                    startSlick();
                }
            };
        });
    });
};
// ==================================================================================================//
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
// Used to catch keyboard instead of Gamepad
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

function toggleIcons(device) {
    var gpIcons = $("[name='gamePadIcon']");
    var kbIcons = $("[name='keyBoardIcon']");
    if (device === "gp") {
        for (var i = 0; i < gpIcons.length; i++) {
            $(gpIcons[i]).show()
        }
        for (var i = 0; i < kbIcons.length; i++) {
            $(kbIcons[i]).hide()
        }
    } else if (device === 'kb') {
        for (var i = 0; i < gpIcons.length; i++) {
            $(gpIcons[i]).hide()
        }
        for (var i = 0; i < kbIcons.length; i++) {
            $(kbIcons[i]).show()
        }
    }
}
//Set up code needed to pair gamepad
$(document).ready(function() {
    var gamepadPrompt = $("#gamepadPrompt")
    carousel = $("#gameCar");
    getGames();
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