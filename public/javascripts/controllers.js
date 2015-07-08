/**
 * Created by joachim on 01.07.2015.
 */
function UpnpCtrl($scope, $http) {
    $http.get('/api/posts').
        success(function(data, status, headers, config) {
            $scope.posts = data.posts;
        });
}

