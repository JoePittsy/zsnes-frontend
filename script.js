const exec = require('child_process').exec;
const remote = require('electron').remote
var gameRunning = false;
let w = remote.getCurrentWindow()
var repGP;
var dPad = []; //D-PAD
var leftAno =[]; //Left Analog


//Runs the ZSNES Emulator and sets the gameRunning flag so we dont steal inuput form ZSNES
function execute(command) {
    gameRunning = true;
    exec(command, (error, stdout, stderr) => { 
        gameRunning = false;
    });
};




// Initilizes the carousel of games
function startSlick(){ 
    $(".center").slick({
        accessibility: true,
        arrows: false,
        centerMode:true,
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        infinite: true,
        cssEase: 'linear',
        variableWidth: true,
        variableHeight: true
    });
}

// Needed to ensure that Slick is not init before images are loaded
function resolve() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1);
  });
}

// Loads the games.json file and populates the carousel with images then inits Slick
async function getGames() {
    $.getJSON('games.json', function(data) {
        games = data.games;
        console.log(games);
        var slider = $("#gameCar")
        $("#name").html(games[0][0]);
        for (var i = 0; i <= games.length; i++) {
            slider.append("<div><img class = 'gameImage' src = '"+games[i][1]+"'></div>");
        };
    });
  var result = await resolve();
  startSlick();
}

getGames();
    

// Used to catch keyboard instead of Gamepad
document.onkeydown = checkKey;
function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '37') {
       $("#gameCar").slick('slickPrev');
    }
    else if (e.keyCode == '39') {
       $("#gameCar").slick('slickNext');
    }
    else if (e.keyCode == '13'){
        var num = Number($('#sneaky').html())
        var code = "zsnes "+"'"+__dirname+"/"+games[num][2]+"'"
        console.log(code)
        execute(code);
    }
}



// Is a gamepad init?
function canGame() {
    return "getGamepads" in navigator;
}

//Grab Gamepad controlls 
function reportOnGamepad() {
    gp = navigator.getGamepads()[0];
    // var html = "";
    //     html += "id: "+gp.id+"<br/>";
    if (!gameRunning){
        if (isFirefox){
            dPad[0] = gp.axes[6];
            dPad[1] = gp.axes[7];

            leftAno[0] = Math.round(gp.axes[0]);
            leftAno[1] = Math.round(gp.axes[1]);
        }

        else{
            if (gp.buttons[14].pressed){
                dPad[0] = -1
            }else if (gp.buttons[15].pressed){
                dPad[0] = 1
            } else{
                dPad[0] = 0
            }

            leftAno[0] = Math.round(gp.axes[0]);
            leftAno[1] = Math.round(gp.axes[1]);
        }


        if (dPad[0] === -1 || leftAno[0] === -1){
             $("#gameCar").slick('slickPrev');
        }

        if (dPad[0] === 1 || leftAno[0] === 1){
             $("#gameCar").slick('slickNext');
        }

        if (gp.buttons[0].pressed == true){
            var num = Number($('#sneaky').html())
            var code = "zsnes "+"'"+__dirname+"/"+games[num][2]+"'"
            console.log(code)
            execute(code);
        }
    }
}


//Set up code needed to pair gamepad
$(document).ready(function() {
    isFirefox = typeof InstallTrigger !== 'undefined';
    isChrome = !!window.chrome && !!window.chrome.webstore;

    if(canGame()) {

        var prompt = "Press any button";
        $("#gamepadPrompt").text(prompt);

        $(window).on("gamepadconnected", function() {
            hasGP = true;
            $("#gamepadPrompt").html("Gamepad connected");
            console.log("connection event");
            gp = navigator.getGamepads()[0];
            repGP = window.setInterval(reportOnGamepad,100);
        });

        $(window).on("gamepaddisconnected", function() {
            console.log("disconnection event");
            $("#gamepadPrompt").text(prompt);
            window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function() {
            console.log('checkGP');
            if(navigator.getGamepads()[0]) {
                if(!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }

});