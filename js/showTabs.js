var animationTime = 200
$( "md-tab" ).mouseover(function() {
  console.log("jestem")
});
$('#barTop').hover(function() {
    setTopEnter( $(this));
    setBottomEnter($("#barBottom"));
    $("#map").animate({top: '48px',height: '-=96px'},animationTime)
},function() {
    setTopOut( $(this));
    setBottomOut($("#barBottom"));
    $("#map").animate({top: '0',height: '100%'},animationTime)
});
$('#barBottom').hover(function() {
    setBottomEnter( $(this));
    setTopEnter($("#barTop"));
    $("#map").animate({top: '48px',height: '-=96px'},animationTime)
},function() {
    setBottomOut( $(this));
    setTopOut($("#barTop"));
    $("#map").animate({top: '0',height: '100%'},animationTime)
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