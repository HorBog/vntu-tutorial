var mainApp = angular.module('MainApp', ['ngResource']);

mainApp.factory('PostModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/posts/:id', {'id': '@id'}, {});
}]);

mainApp.factory('AuthModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/auth/:id', {'id': '@id'}, {
        'login': {'method': 'POST'}
    });
}]);

mainApp.factory('jwtInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
    return {
        request: function (config) {
            var token = window.localStorage.getItem('authToken');
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

mainApp.run(['$rootScope', function ($rootScope) {
    $rootScope.logout = function () {
        $rootScope.$user = null;
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
    }

    var authUser = window.localStorage.getItem('authUser');
    $rootScope.$user = authUser ? JSON.parse(authUser) : null;
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


mainApp.controller('LoginController', ['$scope', '$rootScope', 'AuthModel', function ($scope, $rootScope, AuthModel) {
    $scope.user = {};

    $scope.login = function () {
        console.log('user', $scope.user);

        AuthModel.login($scope.user, function (res) {
            res = res.toJSON();
            console.log('res', res);
            window.localStorage.setItem('authToken', res.token);
            window.localStorage.setItem('authUser', JSON.stringify(res.user));
            $rootScope.$user = res.user;
        }, function (err) {
            console.log('err', err.data);
        });
    };
}]);