/**
 * Created by joachim on 01.07.2015.
 */
function UpnpCtrl($scope, $http) {
    $http.get('/upnpstatus').
        success(function(data, status, headers, config) {
            $scope.status = data.posts;
        });
}

