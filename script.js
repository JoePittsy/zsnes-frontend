const exec = require('child_process').exec;
const remote = require('electron').remote;
var fs = require('file-system');
var Datastore = require('nedb');
let w = remote.getCurrentWindow();
var gameRunning = false;
var filtered = false;
var games = [];
var tempGames;
var carousel;

//Runs the ZSNES Emulator and sets the gameRunning flag so we dont steal inuput form ZSNES
function execute(command) {
    gameRunning = true;
    exec(command, (error, stdout, stderr) => {
        gameRunning = false;
    });
};

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


function restartSlick(){
    carousel.slick("unslick");
    carousel.empty();
    getGames();
}
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}
function buildDB(db, count){ 


    folders = getDirectories("SNES/");
    for (let id = 0; id < folders.length; id++) {
        const element = folders[id]; 

        db.find({ name: element }, function (err, docs) {
            console.log(docs);
            if (docs.length === 0){
                var game = new Object({
                    "_id": null,
                    "name": null,
                    "picPath": null,
                    "romPath": null,
                    "favStatus":null
                }); 
                       
                game["_id"] = id+1+count;
                game["name"] = element;
                game["favStatus"] = 0;
                fs.readdirSync("SNES/" + element).forEach(file => {            
                    ext = file.split('.').pop();
                    if ( ext === "sfc" || ext === "smc" ){
                        // We have a SNES game
                        game["romPath"] = "SNES/" + element + "/"+ file;               
                    }
                    if (ext === "jpg" || ext === "jpeg" || ext === "JPG" || ext == "JPEG"){
                        // We have a Image game
                        game["picPath"] = "SNES/" + element + "/"+ file;
                    }
                });
                console.log(game);
                db.insert(game);
            }
        });
       
    };    
}


// Loads the games.json file and populates the carousel with images then inits Slick
async function getGames() {
    db = new Datastore({
        filename: 'games.db'
    });
    // buildDB();
    db.loadDatabase(function(err) { // Callback is optional
        // Find all documents in the collection
        db.find({}, function(err, docs) {
            buildDB(db, docs.length);
        });
        

        db.find({}, function(err, docs) {
            console.log(docs.length);

            for (var i = 0; i < docs.length; i++) {
                games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus'], docs[i]['_id']])
            };
            if (docs.length <= 3 ){
                for (var i = 0; i < docs.length; i++) {
                    games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus'], docs[i]['_id']])
                };
                for (var i = 0; i < docs.length; i++) {
                    games.push([docs[i]['name'], docs[i]['picPath'], docs[i]['romPath'], docs[i]['favStatus'], docs[i]['_id']])
                };
            }
            console.log(games);
            if (games.length !== 0){
                if (games[0][3] === 0) {
                    $("#name").html(games[0][0] + " ☆");
                } else {
                    $("#name").html(games[0][0] + " ★");
                }
                for (var i = 0; i < games.length; i++) {
                    console.log(games[i]);
                    carousel.append("<div><img class = 'gameImage' src = '" + games[i][1] + "'></div>");
                    if (i === games.length - 1) {
                        startSlick();
                    }
                };
            } else{
                console.log("No Games!");
            }
            
        });
    });
};

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

$(document).ready(function() {
    carousel = $("#gameCar");
    getGames();
});