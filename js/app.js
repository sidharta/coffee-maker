var app = angular.module('coffeeApp', ['ngResource', 'ngRoute']);

app.controller('MainCtrl', function ($scope, $filter, $timeout, $resource) {
	var serviceUrl = "./rest/request";
	$scope.currentUser = current_user;
	var Request = $resource("./rest/request", null, {
		'save':   {method:'POST', params: {"type": "full"} },
	});

	$.ajaxSetup({
		beforeSend: function(){
			$scope.loading = true;
		}, 
		complete: function(){
			$scope.loading = false;
			$scope.$apply();
		}
	});

	$scope.refresh = function(){
		Request.get({ordering:'request_date'}, function(data){
			var arr = data.list.request;
			var last = arr[arr.length - 1];
			refreshModel(last);
		});
	}

  	$scope.makeCoffee = function(){
  		newDate = new Date();
  		coffeeDate = new Date( newDate.getTime() + 15*60000 );	
  		
  		var request = new Request({
			"request" : {
				"user_name": $scope.currentUser, 
				"request_date": $filter('date')(newDate, "yyyy-MM-dd'T'HH:mm:ss"),
				"coffee_date": $filter('date')(coffeeDate, "yyyy-MM-dd'T'HH:mm:ss")
		}});

  		request.$save( function(req){
	  		refreshModel(req.request);
	  	});
	}

	function refreshModel(model) {
		newDate = new Date();
 		offsetStr = (newDate.getTimezoneOffset() / -60 > 0)?
 			"0" + newDate.getTimezoneOffset() / 60 + ":00":
 			"-0" + newDate.getTimezoneOffset() / 60 + ":00";

		$scope.latestCoffeeTime = new Date(model.coffee_date + offsetStr);
		$scope.latestRequester = model.user_name;
		
		refreshTime();
	}

	function refreshTime(){
		$scope.remaining = $filter('date')($scope.latestCoffeeTime - new Date(), 'm:ss');
		$scope.isMaking = $scope.latestCoffeeTime > new Date();
		$scope.isSameUser = $scope.latestRequester == $scope.currentUser;
	}

    var countUp = function() {
        refreshTime();
        $timeout(countUp, 1000);
    }

	$scope.refresh();
    $timeout(countUp, 1000);

    // obter foto do usuario do plus
    // criar navegacao por swipe
	// criar tela q responde a ultima data cadastrada
});

app.controller('ListCtrl', function ($scope, $resource) {
	var Request = $resource("./rest/request");

	Request.get({ordering:'request_date'}, function(data){
	    $scope.requests = data.list.request;
    });
});

app.config(function($interpolateProvider) {
	$interpolateProvider.startSymbol('{[{');
	$interpolateProvider.endSymbol('}]}');
});

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/List', {
		templateUrl: 'list.html',
		controller: 'ListCtrl'
	})
	.otherwise({
		templateUrl: 'home.html',
		controller: 'MainCtrl'
	});
});

app.controller('MenuCtrl', function ($scope, $location) {

    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'Home';
        return page === currentRoute ? 'active' : '';
    }; 

});