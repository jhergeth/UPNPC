/**
 * Created by joachim on 01.07.2015.
 */
//angular.module('upnp', ['upnp.filters', 'upnp.services', 'upnp.directives']).
angular.module('upnp.controllers', []).controller('UpnpCtrl', function($scope){
    $scope.url = 'http://test.de/bild.jpg';
    $scope.rest = 5000;
    $scope.renderer = 'TV';
    $scope.list ='playlist27';
});


var ang = angular.module('upnp', [
    'upnp.controllers'
    //'ngAnimate',
    //'ngCookies',
    //'ngResource',
    //'ngRoute',
    //'ngSanitize',
    //'ngTouch',
    //'ngcrea.ngStrap'
]);
