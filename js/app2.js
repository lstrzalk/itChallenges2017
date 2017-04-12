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
    $scope.topEnv = Markers.loadMarkers();
    $scope.bottomEnv = Markers.loadMarkers();   
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
            if(findIndex($scope.topEnv, marker)>=0){
                $scope.topEnv[findIndex($scope.topEnv, marker)].title = result;
            }
            if(findIndex($scope.bottomEnv, marker)>=0){
                $scope.bottomEnv[findIndex($scope.bottomEnv, marker)].title = result;
            }
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
        if(findIndex($scope.topEnv, marker)>=0){
            $scope.topEnv.splice(findIndex($scope.topEnv, marker),1)
        }
        if(findIndex($scope.bottomEnv, marker)>=0){
            $scope.bottomEnv.splice(findIndex($scope.bottomEnv, marker),1)
        }
    }
    $scope.$watch("bottomSelected",  function(newValue, oldValue){
        if(newValue != -1 && newValue != oldValue){
            $scope.updateTop();
        }
    });
    $scope.$watch("topSelected", function(newValue, oldValue){
        if(newValue != -1 && newValue != oldValue){
            $scope.updateBottom();
        }
    });
    // $scope.updateBottom = function(){
    //     if($scope.topSelected != null && $scope.topSelected != -1){
    //         console.log("top after bottom change: "+$scope.topSelected)
    //         var old;
    //         if($scope.bottomSelected != null && $scope.bottomSelected != -1 && $scope.topSelected < $scope.bottomSelected){
    //             // console.log($scope.bottomSelected)
    //             old = $scope.bottomEnv[$scope.bottomSelected];
    //         }
    //         $scope.bottomEnv.splice(0, $scope.bottomEnv.length);
    //         for(var i = 0; i < $scope.markers.length; i = i +1){
    //             if($scope.markers[i].name != $scope.topEnv[$scope.topSelected].name){
    //                 // console.log($scope.topEnv[$scope.topSelected].name)
    //                 // console.log($scope.markers[i].name)
    //                 $scope.bottomEnv.push($scope.markers[i]);
    //                 // if(old != null && $scope.markers[i].name == old.name){
    //                 //     console.log("bottom: "+old.name);
    //                 //     console.log("bottom: "+$scope.markers[i].name)
    //                 //     console.log("bottom: "+($scope.bottomEnv.length-1))
    //                 //     $scope.bottomSelected = $scope.bottomEnv.length-1;
    //                 // }
    //             }
    //         }
    //         if(old != null && old.name != $scope.bottomEnv[$scope.bottomSelected].name){
    //             console.log(old.name != $scope.bottomEnv[$scope.bottomSelected].name);
    //             $scope.bottomSelected = findIndex($scope.bottomEnv, old);
    //         }
    //     }
    // }
    $scope.updateBottom = function(){
        var top = $scope.topSelected
        if(top != null && top != -1){
            var bottom = $scope.bottomSelected
            if(bottom != null && bottom != -1){
                if(true){
                    var oldBottom = $scope.bottomEnv[bottom].name;
                    var oldTop = $scope.topEnv[top].name;
                    var newBottomEnv = updateEnv(oldTop);
                    var newSelectedBottom = findIndex(newBottomEnv, oldBottom);
                    console.log(newSelectedBottom)
                    console.log(oldBottom)
                    console.log(newBottomEnv)
                    var newTopEnv = updateEnv(newBottomEnv[newSelectedBottom].name);
                    var newSelectedTop = findIndex(newTopEnv, oldTop);
                    $scope.bottomEnv = newBottomEnv;
                    $scope.topEnv = newTopEnv;
                    $scope.bottomSelected = newSelectedBottom;
                    $scope.topSelected = newSelectedTop;

                }
                // var oldVal = $scope.bottomEnv[bottom].name;
                // var newEnv = updateEnv($scope.topEnv[top].name);
                // var newSelected = findIndex(newEnv, oldVal);
                // $scope.bottomEnv = newEnv;
                // if(newSelected != bottom){
                //     $scope.bottomSelected = newSelected;
                // }
            }else{
                $scope.bottomEnv = updateEnv($scope.topEnv[top].name);
            }
        }
    }
    $scope.updateTop = function(){
        var bottom = $scope.bottomSelected
        if(bottom != null && bottom != -1){
            var top = $scope.topSelected
            if(top != null && top != -1){
                if(true){
                    var oldBottom = $scope.bottomEnv[bottom].name;
                    var oldTop = $scope.topEnv[top].name;
                    var newTopEnv = updateEnv(oldBottom);
                    var newSelectedTop = findIndex(newTopEnv, oldTop);
                    var newBottomEnv = updateEnv(newTopEnv[newSelectedTop].name);
                    var newSelectedBottom = findIndex(newBottomEnv, oldBottom);
                    $scope.topEnv = newTopEnv;
                    $scope.bottomEnv = newBottomEnv;
                    $scope.topSelected = newSelectedTop;
                    $scope.bottomSelected = newSelectedBottom;

                }
                // var oldVal = $scope.topEnv[top].name;
                // var newEnv = updateEnv($scope.bottomEnv[bottom].name);
                // var newSelected = findIndex(newEnv, oldVal);
                // $scope.topEnv = newEnv;
                // if(newSelected != top){
                //     $scope.topSelected = newSelected;
                // }
            }else{
                $scope.topEnv = updateEnv($scope.bottomEnv[bottom].name);
            }
        }
    }

    // $scope.updateTop = function(){
    //     if($scope.bottomSelected != null && $scope.bottomSelected != -1){
    //         console.log("bottom after top change: "+$scope.bottomSelected)
    //         var old;
    //         if($scope.topSelected != null && $scope.topSelected != -1 && $scope.topSelected > $scope.bottomSelected){
    //             // console.log($scope.topSelected)
    //             old = $scope.topEnv[$scope.topSelected];
    //         }
    //         $scope.topEnv.splice(0, $scope.topEnv.length);
    //         for(var i = 0; i < $scope.markers.length; i = i +1){
    //             if($scope.markers[i].name != $scope.bottomEnv[$scope.bottomSelected].name){
    //                 // console.log($scope.bottomEnv[$scope.bottomSelected].name)
    //                 // console.log($scope.markers[i].name)
    //                 $scope.topEnv.push($scope.markers[i])
    //                 // if(old != null && $scope.markers[i].name == old.name && $scope.topSelected != null && $scope.topSelected != -1){
    //                 //     console.log("top: "+old.name);
    //                 //     console.log("top: "+$scope.markers[i].name)
    //                 //     console.log("top: "+($scope.topEnv.length-1))
    //                 //     $scope.topSelected = $scope.topEnv.length-1;
    //                 // }
    //             }
    //         }
    //         if(old != null && old.name != $scope.topEnv[$scope.topSelected].name){
    //             console.log(old.name != $scope.topEnv[$scope.topSelected].name);
    //             $scope.topSelected = findIndex($scope.topEnv, old);
    //         }
    //     }
    // }
    function updateEnv(oppositeName){
        if(oppositeName == null){
            console.log("NULL!!")
        }
        var env = [];
        for(var i = 0; i < $scope.markers.length;i = i + 1){
            if($scope.markers[i].name != oppositeName){
                env.push($scope.markers[i]);
            }
        }
        return env;
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
    $scope.topEnv.push($scope.markers[$scope.markers.length-1])
    $scope.bottomEnv.push($scope.markers[$scope.markers.length-1])
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