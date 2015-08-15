angular.module('unicornguide', ['firebase', 'ui.router', 'ngSanitize'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "/partials/home.html",
        controller: "homeController",
        controllerAs: ""
      })
      .state('login', {
        url: "/login",
        templateUrl: "/partials/login.html",
        controller: "loginController",
        controllerAs: "login"
      })
      .state('accelerators', {
        url: "/accelerators",
        templateUrl: "/partials/accelerators.html",
        controller: "accelController",
        controllerAs: "accelerators"
      })
      .state('accelerator', {
        url: "/accelerator/:slug",
        templateUrl: '/partials/accelerator.details.html',
        controller: function ($stateParams, FB, $firebaseObject) {
          var _self = this;
          _self.data = {};
          FB.child("accelerators").orderByChild("slug")
          _self.data = $firebaseObject(FB.child("accelerators/" + $stateParams.slug));
        },
        controllerAs: "accelerator"
      });
  })
  .factory('FB', function () {
    return new Firebase("https://okmom.firebaseio.com");
  })
  .factory('User', function () {
    return {
      loggedin : false,
    };
  })
  .controller('homeController', function (FB, $firebaseArray) {
    var _self = this;
    _self.data = $firebaseArray(FB.child("accelerators"));
  })
  .controller('loginController', function (FB, $state, User) {
    var login = this;

    login.user = {};

    login.login = function () {
      FB.authWithPassword({
        email: login.user.email,
        password: login.user.password
      }, function (error, authData) { 
        $state.go('home');
        User.loggedin = true;
      }, {
        remember: "sessionOnly"
      });

    };

    login.signup = function () {
      FB.createUser({
        email: login.user.email,
        password: login.user.password
      }, function (error, userData) {
        if (error) {
          console.log("Error creating user:", error);
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
        }
      });
    };

  })
  .controller('accelController', function (FB, $firebaseArray) {
    var _self = this;
    _self.data = $firebaseArray(FB.child("accelerators"));
  })
  .filter('firstParagraph', function () {
    return function (input) {
      return input ? input.replace(/\..*|\n.*/g, '.') : "";
    };
  })
  .filter('nl2p', function () {
    return function (text) {
      text = text !== undefined ? String(text).trim() : "";
      return (text.length > 0 ? '<p>' + text.replace(/[\r\n]+/g, '</p><p>') + '</p>' : "");
    };
  });