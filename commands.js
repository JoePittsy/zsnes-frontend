function previousSlide(){
    carousel.slick('slickPrev');
}
function nextSlide(){
    carousel.slick('slickNext');
}
function runGame(){
    var num = Number($('#sneaky').html())
    var code = "zsnes "+"'"+__dirname+"/"+games[num][2]+"'"
    execute(code);
}
function toggleFilter(){
    if (!filterKeyDown){
        filterKeyDown = true;
        if (filtered === false) {
            $("#fav").html("Show Favourites ON&nbsp")
            carousel.slick('slickFilter',function(index){
                return (games[index][3])
            });
            carousel.slick('slickGoTo', 0);
            tempGames = games
            games = games.filter(function(index){
                return index[3]
            });
            filtered = true;
            $("#name").html(games[0][0]+" ★");

        } else {
            $("#fav").html("Show Favourites OFF&nbsp")
            carousel.slick('slickUnfilter');
            filtered = false;
            games = tempGames;        
        }        
    }
}

function toggleFav(){
    if (keyDown === false){
        if (!filtered){
            keyDown = true;
            console.log(keyDown)
            var num = Number($('#sneaky').html())
            console.log("Fav!"+ games[num])

            db.find({ _id: num+1 }, function (err, docs) {
                newDoc = docs[0]
                console.log(Math.abs(newDoc['favStatus']-1))
                db.update({ _id: num+1 }, { $set: {favStatus:Math.abs(newDoc['favStatus']-1)}},{});
                reloadGames(num);
                // If no document is found, docs is equal to []
            });

        } else{
            var num = Number($('#sneaky').html())
            console.log(games[num][4])
            db.find({ _id: games[num][4] }, function (err, docs) {
                newDoc = docs[0]
                console.log(Math.abs(newDoc['favStatus']-1))
                db.update({ _id: games[num][4] }, { $set: {favStatus:Math.abs(newDoc['favStatus']-1)}},{});
                // reloadGames(num);
                tempGames[games[num][4]-1]['favStatus'] = Math.abs(newDoc['favStatus']-1)


              // If no document is found, docs is equal to []
            });
        }
    }
}