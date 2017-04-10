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
	this.createMarker = function(name, location){
		var markers = JSON.parse(localStorage.getItem("markers"));
		markers.push({name: name, location: location});
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
    this.update = function(marker, newName){
        var marker = this.getMarkerByName(marker.name)
        this.deleteMarker(marker.name)
        marker.name = newName;
        this.createMarker(marker.name, marker.location);
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
    $scope.top = $scope.markers;
    $scope.bottom = $scope.markers;
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
    $scope.topDisplay = function(marker){
        if($scope.bottomSelected!=null && marker!=null){
            if($scope.markers[marker] == $scope.markers[$scope.bottomSelected]){
                return false;
            } else{
                return true
            }
        } else{
            return true;
        }
    }
    $scope.bottomDisplay = function(marker){
        if($scope.topSelected!=null && marker!=null){
            if($scope.markers[marker] == $scope.markers[$scope.topSelected]){
                return false;
            } else{
                return true
            }
        } else{
            return true;
        }
    }
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
            $scope.markersObjects[marker.name].label = result;
            $scope.markersObjects[marker.name].setMap(null);
            $scope.markersObjects[marker.name].setMap($window.map);
            }, function() {
        });
    }
    $scope.delete = function(marker){
        $scope.markersObjects[marker.name].setMap(null);
        delete $scope.markersObjects[marker.name];
        $scope.markers = Markers.deleteMarker(marker.name);
        $scope.$apply();
    }
    $scope.$watch("topSelected", function(){
        if($scope.markers[$scope.topSelected] != null){
            console.log($scope.markers[$scope.topSelected])
            $scope.notForBottom = $scope.markers[$scope.topSelected]
        }
    });
    $scope.$watch("bottomSelected", function(){
        if($scope.markers[$scope.bottomSelected] != null){
            console.log($scope.markers[$scope.bottomSelected])
            $scope.notForTop = $scope.markers[$scope.bottomSelected]
        }
    });
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

function placeMarker($scope, location, Markers) {
    var id = Markers.getID();
    var marker = new google.maps.Marker({
        position: location,
        label: id,
        map: map
    })
    $scope.markers = Markers.createMarker(marker.label, location);
    marker.addListener('dblclick', function(){
        marker.setMap(null);
        delete $scope.markersObjects[marker.label];
        $scope.markers = Markers.deleteMarker(marker.label);
        $scope.$apply();
    });
    return marker;
}
function loadMarkers(map, $scope, Markers){
    for(var i = 0; i< $scope.markers.length ; i = i +1){
        var marker = new google.maps.Marker({
        position: $scope.markers[i].location,
        label: $scope.markers[i].name,
        map: map
    })
    $scope.markersObjects[$scope.markers[i].name] = marker;
    $scope.markersObjects[$scope.markers[i].name].addListener('dblclick', function(){
        this.setMap(null);
        $scope.markers = Markers.deleteMarker(this.label);
        delete this;
        $scope.$apply();
        });
    }
}