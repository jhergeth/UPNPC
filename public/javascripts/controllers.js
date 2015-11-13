/**
 * Created by joachim on 01.07.2015.
 */
function UpnpCtrl($scope, $http) {
    $http.get('/upnpstatus').
        success(function(data, status, headers, config){
            $scope.upnpStatus = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });


}


