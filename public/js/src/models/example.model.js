angular.module('anacodeModels').factory('ExampleModel', ['$resource',
    function($resource) {
        var ExampleModel = $resource('http://81.169.214.217:5000/kol/v1.1/demotexts');

        return ExampleModel;
    }
]);
