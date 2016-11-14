var mainApp = angular.module('MainApp', ['ngResource']);

mainApp.factory('PostModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/posts/:id', {'id': '@id'}, {});
}]);

mainApp.factory('AuthModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/token/:id', {'id': '@id'}, {
        'login': {'method': 'POST'}
    });
}]);

mainApp.factory('jwtInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
    return {
        request: function (config) {
            var token = window.localStorage.getItem('auth_token');
            config.headers = config.headers || {};
            if (token != 'undefined' && angular.isDefined(token)) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                // handle the case where the user is not authenticated
            }
            return response || $q.when(response);
        }
    };
}]);

mainApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
}]);



mainApp.controller('MainController', ['$scope', 'PostModel', function ($scope, PostModel) {
    $scope.answer = ' - ';

    $scope.setAnswer = function (answer) {
        $scope.answer = answer;
    };

    $scope.getPosts = function (answer) {
        PostModel.get(function (res) {
            console.log('res', res.data);
            $scope.posts = res.data;
        });
    };
}]);


mainApp.controller('LoginController', ['$scope', 'AuthModel', function ($scope, AuthModel) {
    $scope.user = {};

    $scope.login = function () {
        console.log('user', $scope.user);

        AuthModel.login($scope.user, function (res) {
            console.log('res', res.toJSON());
            window.localStorage.setItem('auth_token', res.toJSON().token);
        }, function (err) {
            console.log('err', err.data);
        });
    };
}]);