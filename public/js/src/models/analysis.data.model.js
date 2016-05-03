angular.module('anacodeModels').factory('AnalysisDataModel', ['$resource',
    function($resource) {
        var AnalysisDataModel = $resource('http://81.169.214.217:5000/kol/v1.1/analyze?text=:text');

        return AnalysisDataModel;
    }
]);
