angular.module("anacodeControllers", ["ngSanitize"]).controller("DashboardController", ["_", "$", "$scope", "$sce", "$timeout", "AnalysisDataModel",
    function (_, $, $scope, $sce, $timeout, AnalysisDataModel) {

        $scope.submit = function() {
            $scope.clearChart();
            $scope.getAnalysisData();
        };

        $scope.clear = function() {
            $scope.selectedExample = null;
            $scope.clearChart();
            $scope.onSelectionUpdated();
        };

        $scope.getAnalysisData = function() {
            var textValue = $("#exampleText").val();

            AnalysisDataModel.get({text: textValue}, function (response) {
                console.log("Response retrieved: ", response);
                if(response.errors) {
                    $scope.analysisSucceeded = false;
                } else {
                    var analysisData = response.data;

                    $scope.highlightedText = $sce.trustAsHtml(analysisData.markup);
                    $scope.sentiments = _.map(analysisData.sentiment[0], function(sentiment) {
                        return {
                            label: sentiment.label,
                            value: sentiment.probability
                        }
                    });
                    $scope.industries = chunkIndustries(analysisData.industries[0]);

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
            Morris.Donut({element: "sentiment-analysis", data: $scope.sentiments, formatter: function(value) {return value + "%"}});
        };

        $scope.examples = [
            {
                name: "Real Estate",
                text: "房地产是指覆盖土地并永久附着于土地的一类实物，比如建筑物。房地产一般也被称为不动产（real property，也写作realty），与之相对应的是私产，即动产（personal property，也被称作chattel或者personalty）。在技术层面上，一些人试图将房地产与土地和设备等其他不动产相分离，同时将房地产所有权与房地产本身相分离。在不动产（immovable property）归于民法权限下的同时，普通法中使用的是房地产（real estate）和不动产（real property）来这类权利。可以有三种存在形态：即土地 、建筑物、房地合一的。在房地产拍卖中，其拍卖标的也可以有三种存在形态，即土地（或土地使用权），建筑物和房地合一状态下的物质实体及其权益，随着个人财产所有权的发展，房地产已经成为商业交易的主要组成部分。购买房地产是一种重要的投资方式。"
            },
            {
                name: "Automotive Press Release",
                text: "雷克萨斯发布RC 200t/RC 300 AWD官图2015-10-08 14:29:25 新浪汽车 1分享添加喜爱打印增大字体减小字体新浪汽车讯 近日，雷克萨斯正式发布了RC 200t和RC 300 AWD（四驱版）两款新增车型的官图，新车将进一步丰富雷克萨斯RC的产品线。外观方面，雷克萨斯RC 200t造型与现款RC 350基本保持一致，作为一款入门级车型，新车最大的区别是采用了更加传统的带透镜式前大灯组，并配备有LED日间行车灯。此外，该车还配备有F SPORT外观套件，使新车看起更加运动。而另一款雷克萨斯RC 300 AWD车型在外观方面并没有配备F SPORT外观套件，纺锤形前进气格栅采用竖条幅设计，前大灯组同样采用透镜式大灯，此外该车最大的变化在于采用了四驱布局。动力方面，雷克萨斯RC 200t搭载2.0T发动机，最大功率244马力，峰值扭矩350牛·米，传动方面，与发动机匹配的将是8速手自一体变速箱。而另一款雷克萨斯RC 300 AWD则搭载3.5L自然吸气V6发动机，最大功率259马力，峰值扭矩320牛·米。传动方面，与发动机匹配的将是6速手自一体变速箱。"
            }
        ];

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
    }
]);
