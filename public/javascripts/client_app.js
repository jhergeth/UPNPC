/**
 * Created by joachim on 01.07.2015.
 */
//angular.module('upnp', ['upnp.filters', 'upnp.services', 'upnp.directives']).

angular.module('upnp.controllers', []).controller('UpnpCtrl', function($scope){
    // the last received msg
    $scope.msg = {};

    // handles the callback from the received event
    var handleCallback = function (msg) {
        $scope.$apply(function () {
            $scope.msg = JSON.parse(msg.data)
        });
    }

    var source = new EventSource('/stats');
    source.addEventListener('message', handleCallback, false);
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
