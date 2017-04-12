var app = angular.module('itChallenges',['ngMaterial']);

/*******************************
**********MARKES SERVICE********
*******************************/
app.service('Markers',function(){
    this.getID = function(){
        var id = localStorage.getItem("id");
        if(!id){
            id = "0";
            localStorage.setItem("id",id);
        }
        localStorage.removeItem("id")
        localStorage.setItem("id", JSON.stringify(parseInt(id) + 1));
		return id

    }
	this.loadMarkers = function(){
	    var markers = localStorage.getItem("markers");
	    if(!markers){
            localStorage.setItem("markers",JSON.stringify([]))
	    	return [];
	    }
	    return JSON.parse(markers);
	}
	this.getMarkerByName = function(value){//To easier mocking campaigns objects
		var markers = this.loadMarkers();	
    	for(var i=0;i<markers.length;i++){
    		if(markers[i].name === value){
    			return markers[i];
    		}
    	}
	}
	this.createMarker = function(name, title, location){
		var markers = JSON.parse(localStorage.getItem("markers"));
		markers.push({name: name, title:title, location: location});
        localStorage.removeItem("markers");
		localStorage.setItem("markers", JSON.stringify(markers));
		return markers;
	}
    this.deleteMarker = function(name){
        var markers = this.loadMarkers();
        var i = this.getMarkerPositionByName(name)
        markers.splice(i,1);
        localStorage.removeItem("markers");
        localStorage.setItem("markers", JSON.stringify(markers));
        return markers;
    }
    this.getMarkerPositionByName = function(name){//To Check if Campaign is on Campaings list
    	var markers = this.loadMarkers();
    	for(var i=0;i<markers.length;i++){
    		if(markers[i].name === name){
    			return i;
    		}
    	}
    	return -1;
    }
    this.update = function(marker, newTitle){
        var marker = this.getMarkerByName(marker.name)
        this.deleteMarker(marker.name)
        marker.title = newTitle;
        this.createMarker(marker.name, marker.title, marker.location);
        return this.loadMarkers();
    }	
});

app.config(function($mdThemingProvider) {
$mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('green')
    .accentPalette('brown');
});

app.controller('mainController', function($scope, $window, $mdDialog, Markers){
    $scope.markers = Markers.loadMarkers();
    var cracov = new google.maps.LatLng(50.021, 19.885);
    $window.map = new google.maps.Map(document.getElementById('map'), {
        center: cracov,
        zoom: 15
    });
    $scope.markersObjects = {};
    loadMarkers($window.map, $scope, Markers);
    google.maps.event.addListener($window.map, 'click', function(event) {
        var newMarker = placeMarker($scope, event.latLng, Markers);
        $scope.markersObjects[newMarker.label] = newMarker;
        $scope.$apply();
    });
    $scope.rename = function(marker){
        var confirm = $mdDialog.prompt()
        .title('Rename place')
        .textContent('Put new place name')
        .placeholder('place name')
        .ariaLabel('place name')
        .initialValue(marker.name)
        .ok('change')
        .cancel('cancel');
        $mdDialog.show(confirm).then(function(result) {
            $scope.markers = Markers.update(marker, result);
            $scope.markersObjects[marker.name].title = result;
            $scope.markersObjects[marker.name].setMap(null);
            $scope.markersObjects[marker.name].setMap($window.map);
            }, function() {
        });
    }
    $scope.delete = function(marker){
        $scope.markersObjects[marker.name].setMap(null);
        delete $scope.markersObjects[marker.name];
        $scope.markers = Markers.deleteMarker(marker.name);
    }
});

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
function findIndex(list, node){
    for(var i = 0; i < list.length;i++){
        console.log(list[i].name +" "+ node + " t/f  "+ (list[i].name == node));
        if(list[i].name == node){
            return i;
        }
    }
    return -1;
}
function placeMarker($scope, location, Markers) {
    var id = Markers.getID();
    var marker = new google.maps.Marker({
        position: location,
        title:id,
        label: id,
        map: map
    })
    $scope.markers = Markers.createMarker(marker.label, marker.title, location);
    marker.addListener('dblclick', function(){
        $scope.delete(Markers.getMarkerByName(this.label))
        $scope.$apply();
    });
    return marker;
}
function loadMarkers(map, $scope, Markers){
    for(var i = 0; i< $scope.markers.length ; i = i +1){
        var marker = new google.maps.Marker({
        position: $scope.markers[i].location,
        title: $scope.markers[i].title,
        label: $scope.markers[i].name,
        map: map
    })
    $scope.markersObjects[$scope.markers[i].name] = marker;
    $scope.markersObjects[$scope.markers[i].name].addListener('dblclick', function(){
        $scope.delete(Markers.getMarkerByName(this.label))
        $scope.$apply();
        });
    }
}