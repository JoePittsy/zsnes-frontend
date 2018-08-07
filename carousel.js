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