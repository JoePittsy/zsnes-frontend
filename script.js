const exec = require('child_process').exec;
const remote = require('electron').remote;
var Datastore = require('nedb')
var gameRunning = false;
let w = remote.getCurrentWindow()
var repGP;
var dPad = []; //D-PAD
var leftAno =[]; //Left Analog
var games = [];
var filtered = false;
var filterKeyDown;
var tempGames;

//Runs the ZSNES Emulator and sets the gameRunning flag so we dont steal inuput form ZSNES
function execute(command) {
    gameRunning = true;
    exec(command, (error, stdout, stderr) => { 
        gameRunning = false;
    });
};




// Initilizes the carousel of games
async function startSlick(){ 
    var result = await resolve();
    $(".center").slick({
        accessibility: true,
        arrows: false,
        centerMode:true,
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


function reloadGames(num){
    games = []
    db.loadDatabase(function (err) {    
        db.find({}, function (err, docs) {
            for (var i = 0; i < docs.length; i++) {
                games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus']])
                if (i == docs.length-1){
                    if(games[num][3] == 0){
                        $("#name").html(games[num][0]+" ☆");
                    } else {
                        $("#name").html(games[num][0]+" ★");
                    }
                }
            };

        });
        
    });
}



// Loads the games.json file and populates the carousel with images then inits Slick
async function getGames() {
    db = new Datastore({ filename: 'games.db' });
    db.loadDatabase(function (err) {    // Callback is optional
        // Find all documents in the collection
        db.find({}, function (err, docs) {
            for (var i = 0; i < docs.length; i++) {
                games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus']])
            };
            var slider = $("#gameCar")
            if(games[0][3] == 0){
                $("#name").html(games[0][0]+" ☆");
            } else {
                $("#name").html(games[0][0]+" ★");
            }
            
            for (var i = 0; i <= games.length; i++) {
                slider.append("<div><img class = 'gameImage' src = '"+games[i][1]+"'></div>");
                if (i == games.length-1){

                    startSlick();
                  
                } 
            };                        
        });
        
    });


}


    

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
        execute(code);
    }
}



// Is a gamepad init?
function canGame() {
    return "getGamepads" in navigator;
}
var keyDown = false

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
            execute(code);

        }
        if (gp.buttons[1].pressed == true){
            if (!filterKeyDown){
                filterKeyDown = true;
                if (filtered === false) {
                    $('.center').slick('slickFilter',function(index){
                        return (games[index][3])

                    });
                    // $('.center').slick('slickFilter',":even");
                    tempGames = games
                    games = games.filter(function(index){
                        return index[3]
                    });
                    filtered = true;

            
                    // Number($("#sneaky").text())
                } else {
                    $('.center').slick('slickUnfilter');
                    filtered = false;
                    games = tempGames;
                
                }
                
            }
        }


        if (gp.buttons[3].pressed == false){
            keyDown = false;
        }
        if (gp.buttons[1].pressed == false){
            filterKeyDown = false;
        }

        if (gp.buttons[3].pressed == true){
            console.log(keyDown)
            if (keyDown == false){
                keyDown = true;
                console.log(keyDown)
                console.log("Fav!")
                var num = Number($('#sneaky').html())
                db.find({ _id: num+1 }, function (err, docs) {
                    newDoc = docs[0]
                    console.log(Math.abs(newDoc['favStatus']-1))
                    db.update({ _id: num+1 }, { $set: {favStatus:Math.abs(newDoc['favStatus']-1)}},{});
                    reloadGames(num);


                  // docs is an array containing documents Mars, Earth, Jupiter
                  // If no document is found, docs is equal to []
                });

            }
        }
    }
}


//Set up code needed to pair gamepad
$(document).ready(function() {
    getGames();
    isFirefox = typeof InstallTrigger !== 'undefined';
    isChrome = !!window.chrome && !!window.chrome.webstore;

    if(canGame()) {

        
        $("#gamepadPrompt").html("&nbspDisconnected&nbsp");

        $(window).on("gamepadconnected", function() {
            hasGP = true;
            $("#gamepadPrompt").html("&nbspConnected&nbsp");
            console.log("connection event");
            gp = navigator.getGamepads()[0];
            repGP = window.setInterval(reportOnGamepad,100);
        });

        $(window).on("gamepaddisconnected", function() {
            console.log("disconnection event");
            $("#gamepadPrompt").html("&nbspDisconnected&nbsp");
            window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function() {
            if(navigator.getGamepads()[0]) {
                if(!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }


});







