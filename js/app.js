'use strict';
var app = angular.module('itChallenges',[]);
app.controller('mainController', function($scope){
    var cracov = new google.maps.LatLng(50.021, 19.885);
    var mapOptions = {
        zoom: 10,
        center: cracov,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.markes = [];
});