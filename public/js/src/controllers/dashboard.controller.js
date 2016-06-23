angular.module("anacodeControllers").controller("DashboardController", ["_", "$", "$q", "$scope", "$sce", "$cookies",
    "$timeout", "$translate", "ExampleModel", "AnalysisDataModel", "SentimentDataModel",
    function (_, $, $q, $scope, $sce, $cookies, $timeout, $translate, ExampleModel, AnalysisDataModel, SentimentDataModel) {

        $scope.languages = [{label: "English (EN)", value: "en"}, {label: "Chinese (中文)", value: "ch"}];

        $scope.initialize = function() {
            var lang = $translate.proposedLanguage() || $translate.use();
            $scope.language = _.findWhere($scope.languages, {value: lang});

            _.each(["syndepsCollapsed", "summaryCollapsed",
                "categorizationCollapsed", "entitiesCollapsed"], $scope.readToggle);
            $scope.getExamples();
        };

        $scope.onLanguageUpdated = function() {
            $translate.use($scope.language.value);
            $scope.submit();
        };

        $scope.readToggle = function(toggleName) {
            var cookieValue = $cookies.get(toggleName);
            $scope[toggleName] = cookieValue ? cookieValue === "true" : false;
            console.log(toggleName + ": ", $scope[toggleName]);
        };

        $scope.toggle = function(toggleName) {
            $scope[toggleName] = !$scope[toggleName];
            $cookies.put(toggleName, $scope[toggleName]);
        };

        $scope.toggleCategorization = function() {
            $scope.toggle("categorizationCollapsed");
            if(!$scope.categorizationCollapsed) {
                $scope.clearChart();
                $timeout($scope.renderChart, 100);
            }
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

            ExampleModel.get({}, function (response) {
                $(".disabling-overlay").addClass("hidden");
                $scope.examples = response.data;
                $scope.selectedExample = $scope.examples[0];
                $scope.onSelectionUpdated();
                $scope.submit();
            });
        };

        $scope.getAnalysisData = function() {
            var textValue = $("#exampleText").val();

            $q.all(
                [
                    AnalysisDataModel.get({text: textValue, lang: $scope.language.value}).$promise,
                    SentimentDataModel.get({text: textValue, lang: $scope.language.value}).$promise])
                .then(function (response) {
                    var analysisData = response[0], sentimentData = response[1];

                    $("#btn-analyze").removeClass("spinner");
                    $(".disabling-overlay").addClass("hidden");
                    if(analysisData.errors || sentimentData.errors) {
                        $scope.analysisSucceeded = false;
                    } else {
                        processAnalysisData(analysisData);
                        processSentimentData(sentimentData);
                    }
                });

            function processAnalysisData(response) {
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

                $scope.analysisSucceeded = true;
                $timeout($scope.renderChart, 0);
            }

            function processSentimentData(response) {
                $scope.sentences = _.map(response.data, function(sentence) {
                    return _.map(sentence.chunks, function(chunk, index) {
                        var dependency = _.findWhere(sentence.dependencies, {to: index});
                        var parent = _.isUndefined(dependency) ? null : dependency.from;
                        var label = _.isUndefined(dependency) ? "" : dependency.label;

                        return {
                            "id": index,
                            "word": sentence.raw.substring(chunk.start, chunk.end),
                            "parent": parent,
                            "dependency": label,
                            "level": 1,
                            "background": chunk.color
                        }
                    });
                });

                $("#syndeps").empty();
                _.each($scope.sentences, function(sentence, index) {
                    d3.select("#syndeps")
                        .append("div").attr("class", "panel panel-default")
                        .append("div").attr("class", "tree")
                        .append("svg").attr("id", "svg" + index).attr("class", "syndeps").attr("height", 0);
                    d3.drawTree('#syndeps #svg' + index,  $scope.sentences[index]);
                });
            }
        };

        $scope.onSelectionUpdated = function() {
            $("#exampleText").val($scope.selectedExample ? $scope.selectedExample.text : "");
        };

        $scope.clearChart = function() {
            $("#sentiment-analysis").empty();
        };

        $scope.renderChart = function() {
            var wordsLabel = $translate.instant("dashboard.section.categorization.panel.sentiments.words.label");
            Morris.Donut({
                element: "sentiment-analysis",
                data: $scope.sentiments.reverse(),
                colors: ["#AB001C", "#1CA861"],
                labelColor: "#70838d",
                topLabel: $scope.wordsCount,
                bottomLabel: wordsLabel,
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
