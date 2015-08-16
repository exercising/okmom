angular.module('unicornguide', ['firebase', 'ui.router', 'ngSanitize', 'ngSlider'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "/partials/home.html",
        controller: "homeController",
        controllerAs: "home"
      })
      .state('login', {
        url: "/login",
        templateUrl: "/partials/login.html",
        controller: "loginController",
        controllerAs: "login"
      })
      .state('goals', {
        url: "/goals",
        templateUrl: "/partials/goals.html",
        controller: "goalsController",
        controllerAs: "goals"
      });
  })
  .factory('FB', function () {
    return new Firebase("https://okmom.firebaseio.com");
  })
  .factory('User', function (FB) {
    var authData = FB.getAuth();
    return {
      loggedin: false,
      data: authData
    };
  })
  .controller('homeController', function (FB, $firebaseArray) {
    var home = this;
  })
  .controller('goalsController', function (FB, User, $firebaseArray) {
    var goals = this;
    goals.list = $firebaseArray(FB.child("goals/" + User.data.uid));

    goals.clearNew = function () {
      goals.new = {
        text: '',
        progress: 10,
        isPrivate: false
      };
    };
    goals.clearNew();

    goals.addNew = function () {
      goals.list.$add(goals.new);
      goals.clearNew();
    };

    goals.delete = function (goal) {
      goals.list.$remove(goal);
    };
  
    goals.save = function (goal) {
      goals.list.$save(goal);
    };
  
    goals.progress = 10;
  
    // https://www.npmjs.com/package/ng-slider
    goals.options = {
      from: 0,
      to: 100,
      step: 10,
      dimension: '%',
      round: 0,
      scale: []
    };
  })
  .controller('loginController', function (FB, $state, User) {
    var login = this;

    if (User.loggedin === true) {
      $state.go('home');
    }

    login.user = {};

    login.login = function () {
      FB.authWithPassword({
        email: login.user.email,
        password: login.user.password
      }, function (error, authData) {
        if (error) {
          console.log("Error creating user:", error);
          return;
        }
        $state.go('home');
        User.loggedin = true;
        User.data = authData;
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
          return;
        }
        $state.go('goals');
        User.loggedin = true;
        console.log("Successfully created user account with uid:", userData.uid);
      });
    };

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