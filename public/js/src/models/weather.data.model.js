angular.module('anacodeModels').factory('WeatherDataModel', ['$resource',
    function($resource) {
        var WeatherDataModel = $resource('http://api.openweathermap.org/data/2.5/forecast?id=:cityId&APPID=213e251ff3a49ca9ce95b4340d491b62&units=metric&cnt=10');

        return WeatherDataModel;
    }
]);
