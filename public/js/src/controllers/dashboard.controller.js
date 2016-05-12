angular.module("anacodeControllers", ["ngSanitize"]).controller("DashboardController", ["_", "$", "$scope", "$sce", "$timeout", "AnalysisDataModel", "ExampleModel",
    function (_, $, $scope, $sce, $timeout, AnalysisDataModel, ExampleModel) {

        $scope.initialize = function() {
            $scope.getExamples();
        };

        $scope.submit = function() {
            $("#btn-analyze").addClass("spinner");
            $(".disabling-overlay").removeClass("hidden");
            $scope.clearChart();
            $scope.getAnalysisData();
        };

        $scope.clear = function() {
            $scope.selectedExample = null;
            $scope.analysisSucceeded = undefined;
            $scope.clearChart();
            $scope.onSelectionUpdated();
        };

        $scope.getExamples = function() {
            $(".disabling-overlay").removeClass("hidden");

            ExampleModel.get({text: "this is a test text"}, function (response) {
                $(".disabling-overlay").addClass("hidden");
                $scope.examples = response.data;
                console.log("Examples: ", $scope.examples);
                $scope.selectedExample = $scope.examples[0];
                $scope.onSelectionUpdated();
                $scope.submit();
            });
        };

        $scope.getAnalysisData = function() {
            var textValue = $("#exampleText").val();

            AnalysisDataModel.get({text: textValue}, function (response) {
                console.log("Response retrieved: ", response);
                $("#btn-analyze").removeClass("spinner");
                $(".disabling-overlay").addClass("hidden");
                if(response.errors) {
                    $scope.analysisSucceeded = false;
                } else {
                    var analysisData = response.data;

                    $scope.highlightedText = $sce.trustAsHtml(analysisData.markup);
                    $scope.summary = analysisData.summary;
                    $scope.wordsCount = analysisData.word_count;
                    $scope.sentiments = _.map(analysisData.sentiment[0], function(sentiment) {
                        return {
                            label: sentiment.label,
                            value: sentiment.probability
                        }
                    });
                    $scope.industries = chunkIndustries(analysisData.industries[0]);
                    $scope.entityGroups = groupEntities(analysisData.entities);
                    $scope.nonEmptyEntityGroups = nonEmptyGroups($scope.entityGroups);
                    console.log("Entities: ", $scope.entityGroups);
                    console.log("Non Empty Groups: ", $scope.nonEmptyEntityGroups);

                    $scope.analysisSucceeded = true;
                    $timeout($scope.renderChart, 0);
                }
            });
        };

        $scope.onSelectionUpdated = function() {
            $("#exampleText").val($scope.selectedExample ? $scope.selectedExample.text : "");
        };

        $scope.clearChart = function() {
            $("#sentiment-analysis").empty();
        };

        $scope.renderChart = function() {
            Morris.Donut({
                element: "sentiment-analysis",
                data: $scope.sentiments.reverse(),
                colors: ["#AB001C", "#1CA861"],
                labelColor: "#70838d",
                topLabel: $scope.wordsCount,
                bottomLabel: "WORDS",
                formatter: function(value) { return value },
                resize: true
            });
        };

        function chunkIndustries(industries) {
            var chunkedIndustries = [[],[],[]];
            var itemsInColumn = Math.ceil(industries.length / 3);

            _.each(industries, function(industry, index) {
                if(index < 3) {
                    chunkedIndustries[index].push(industry);
                } else {
                    if(chunkedIndustries[0].length < itemsInColumn) chunkedIndustries[0].push(industry);
                    else if(chunkedIndustries[1].length < itemsInColumn) chunkedIndustries[1].push(industry);
                    else chunkedIndustries[2].push(industry);
                }
            });

            return chunkedIndustries;
        }

        function groupEntities(entities) {
            var apiToGroupMap = {
                producttypes: {group: "products", label: "Products and services"},
                productmodels: {group: "products", label: "Product models"},
                productversions: {group: "products", label: "Product versions"},
                features: {group: "products", label: "Product features"},

                brands: {group: "companies", label: "Brands"},

                persons: {group: "people", label: "Persons"},

                locations: {group: "contexts", label: "Locations"},
                dates: {group: "contexts", label: "Dates"},
                times: {group: "contexts", label: "Times"},
                holidays: {group: "contexts", label: "Holidays"},
                industrys: {group: "contexts", label: "Industries"},

                laws: {group: "other", label: "Laws"},
                documents: {group: "other", label: "Documents"},
                bodyparts: {group: "other", label: "Body parts"}
            };

            var groups = {
                products: {label: "Products", entities: []},
                companies: {label: "Organizations", entities: []},
                people: {label: "People", entities: []},
                contexts: {label: "Contexts", entities: []},
                other: {label: "Other", entities: []}
            };

            _.each(entities, function(entity, apiEntityName) {
                if(_.has(apiToGroupMap, apiEntityName)) {
                    var groupInfo = apiToGroupMap[apiEntityName];

                    groups[groupInfo.group].entities.push({
                        label: groupInfo.label,
                        value: entity
                    });
                } else {
                    groups.other.entities.push({
                        label: capitalizeFirstLetter(apiEntityName),
                        value: entity
                    });
                }
            });

            return groups;
        }

        function nonEmptyGroups(groups) {
            var nonEmptyGroups = _.pick(groups, function(value, key, object) {
                return value.entities.length > 0;
            });

            return nonEmptyGroups;
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
]);
