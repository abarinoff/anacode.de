angular.module('anacodeModels').factory('SentimentDataModel', ['$resource',
    function($resource) {
        var SentimentDataModel = $resource('http://81.169.214.217:5000/kol/v1.1/sentiment?text=:text');

        return SentimentDataModel;
    }
]);
