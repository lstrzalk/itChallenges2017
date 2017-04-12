var animationTime = 200;
var mouseEntered = false;
$('#barTop').mouseenter(function() {
    if(!mouseEntered){
        mouseEntered = true;
        setTopEnter( $(this));
        setBottomEnter($("#barBottom"));
        $("#map").animate({top: '48px',height: '-=96px'},animationTime)
    }
});
$('#barTop').mouseleave(function() {
    if(mouseEntered){
        mouseEntered = false;
        setTopOut( $(this));
        setBottomOut($("#barBottom"));
        $("#map").animate({top: '0',height: '100%'},animationTime)
    }
});
$('#barBottom').mouseenter(function() {
    if(!mouseEntered){
        mouseEntered = true;
        setBottomEnter( $(this));
        setTopEnter($("#barTop"));
        $("#map").animate({top: '48px',height: '-=96px'},animationTime)
    }
});
$('#barBottom').mouseleave(function() {
    if(mouseEntered){
        mouseEntered = false;
        setBottomOut( $(this));
        setTopOut($("#barTop"));
        $("#map").animate({top: '0',height: '100%'},animationTime)
    }
});
var setTopEnter = function(elem){
    elem.css({left:'0'});
    elem.width('100%');
    elem.fadeTo(animationTime,1,"swing");
}
var setTopOut = function(elem){
    elem.fadeTo(animationTime,0,"swing");
    setTimeout(function(){
        elem.css({left:'10%'});
        elem.width('90%');
    }, animationTime);
    
}
var setBottomEnter = function(elem){
    elem.css({right:'0'});
    elem.width('100%');
    elem.fadeTo(animationTime,1,"swing");
}
var setBottomOut = function(elem){
    elem.fadeTo(animationTime,0,"swing");
    setTimeout(function(){
        elem.css({right:'4%'});
        elem.width('96%');
    }, animationTime);
}