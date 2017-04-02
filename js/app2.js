var app = angular.module('itChallenges',['ngMaterial']);
app.config(function($mdThemingProvider) {
$mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('green')
    .accentPalette('brown');
});
app.controller('mainController', function($scope, $window){
    $scope.markers = [];
    var cracov = new google.maps.LatLng(50.021, 19.885);
    $window.map = new google.maps.Map(document.getElementById('map'), {
        center: cracov,
        zoom: 15
    });
    google.maps.event.addListener($window.map, 'click', function(event) {
        placeMarker($scope.markers, event.latLng);
        $scope.$apply();
    });
    $scope.topDisplay = function(marker){
        if(typeof $scope.bottomSelected!='undefined'){
            if(marker == $scope.markers[$scope.bottomSelected]){
                return false;
            } else{
                return true
            }
        } else{
            return true;
        }
    }
    $scope.bottomDisplay = function(marker){
        if($scope.topSelected){
            if(marker == $scope.markers[$scope.topSelected]){
                return false;
            } else{
                return true
            }
        } else{
            return true;
        }
    }
});
function placeMarker(markers, location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(location);
}