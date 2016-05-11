angular.module("anacodeControllers", ["ngSanitize"]).controller("WeatherDashboardController", ["_", "$", "$scope", "$sce", "$timeout", "$filter", "WeatherDataModel",
    function (_, $, $scope, $sce, $timeout, $filter, WeatherDataModel) {

        $scope.initialize = function() {
            $scope.selectedCity = $scope.cities[0];
            $scope.submit();
        };

        $scope.submit = function() {
            $("#weather-chart").empty();
            $(".disabling-overlay").removeClass("hidden");
            $scope.getAnalysisData();
        };

        $scope.getAnalysisData = function() {
            WeatherDataModel.get({cityId: $scope.selectedCity.code}, function (response) {
                $(".disabling-overlay").addClass("hidden");
                $scope.chartData = [];
                $scope.conditionsData = [];
                $scope.humidityData = [];
                $scope.windData = [];

                _.each(response.list, function(item) {
                    var label = $filter('date')(item.dt * 1000, "MMM d, HH:mm");

                    $scope.chartData.push({label: label, value: $filter('number')(item.main.temp, 0)});
                    $scope.conditionsData.push({label: label, value: item.weather[0].main});
                    $scope.humidityData.push({label: label, value: $filter('number')(item.main.humidity, 0)});
                    $scope.windData.push({label: label, value: $filter('number')(item.wind.speed, 2)});
                });

                $timeout($scope.renderChart, 0);
            });
        };

        $scope.onSelectionUpdated = function() {
            $("#exampleText").val($scope.selectedCity ? $scope.selectedCity.text : "");
        };

        $scope.renderChart = function() {
            Morris.Bar({
                element: 'weather-chart',
                data: $scope.chartData,
                xkey: 'label',
                ykeys: ['value'],
                labels: ["Temperature"],
                barColors: ["#607D8B"],
                hideHover: true,
                xLabelAngle: 30,
                resize: true
            });
        };

        $scope.cities = [
            {
                name: "Kyiv",
                code: 703448
            },
            {
                name: "Lviv",
                code: 702550
            },
            {
                name: "Odessa",
                code: 698740
            }
        ];
    }
]);
