angular.module("anacodeControllers").controller("DashboardController", ["$", "$scope",
    function ($, $scope) {

        $scope.examples = [
            {
                name: "Real Estate",
                text: "房地产是指覆盖土地并永久附着于土地的一类实物，比如建筑物。房地产一般也被称为不动产（real property，也写作realty），与之相对应的是私产，即动产（personal property，也被称作chattel或者personalty）。在技术层面上，一些人试图将房地产与土地和设备等其他不动产相分离，同时将房地产所有权与房地产本身相分离。在不动产（immovable property）归于民法权限下的同时，普通法中使用的是房地产（real estate）和不动产（real property）来这类权利。可以有三种存在形态：即土地 、建筑物、房地合一的。在房地产拍卖中，其拍卖标的也可以有三种存在形态，即土地（或土地使用权），建筑物和房地合一状态下的物质实体及其权益，随着个人财产所有权的发展，房地产已经成为商业交易的主要组成部分。购买房地产是一种重要的投资方式。",
                categories: [
                    {value: 84.363, label: 'realestate'}, {value: 6.504, label: 'digital'}, {value: 1.407, label: 'finance'},
                    {value: 1.343, label: 'books'}, {value: 1.178, label: 'furniture'}, {value: 0.879, label: 'internet'},
                    {value: 0.866, label: 'education'}, {value: 0.637, label: 'ce'}, {value: 0.460, label: 'hotel'},
                    {value: 0.386, label: 'fitness'}, {value: 0.329, label: 'travel'}, {value: 0.256, label: 'entertainment'},
                    {value: 0.181, label: 'camera'}, {value: 0.141, label: 'mobile'}, {value: 0.128, label: 'food'},
                    {value: 0.121, label: 'auto'}, {value: 0.115, label: 'sports'}, {value: 0.113, label: 'games'}, 
                    {value: 0.108, label: 'babies'}, {value: 0.106, label: 'health'}, {value: 0.099, label: 'fashion'},
                    {value: 0.095, label: 'beauty'}, {value: 0.095, label: 'music'}, {value: 0.070, label: 'appliances'},
                    {value: 0.020, label: 'airline'}
                ],
                sentiments: [
                    {value: 88.683, label: 'positive'},
                    {value: 11.317, label: 'negative'}
                ]
            },
            {
                name: "Automotive Press Release",
                text: "雷克萨斯发布RC 200t/RC 300 AWD官图2015-10-08 14:29:25 新浪汽车 1分享添加喜爱打印增大字体减小字体新浪汽车讯 近日，雷克萨斯正式发布了RC 200t和RC 300 AWD（四驱版）两款新增车型的官图，新车将进一步丰富雷克萨斯RC的产品线。外观方面，雷克萨斯RC 200t造型与现款RC 350基本保持一致，作为一款入门级车型，新车最大的区别是采用了更加传统的带透镜式前大灯组，并配备有LED日间行车灯。此外，该车还配备有F SPORT外观套件，使新车看起更加运动。而另一款雷克萨斯RC 300 AWD车型在外观方面并没有配备F SPORT外观套件，纺锤形前进气格栅采用竖条幅设计，前大灯组同样采用透镜式大灯，此外该车最大的变化在于采用了四驱布局。动力方面，雷克萨斯RC 200t搭载2.0T发动机，最大功率244马力，峰值扭矩350牛·米，传动方面，与发动机匹配的将是8速手自一体变速箱。而另一款雷克萨斯RC 300 AWD则搭载3.5L自然吸气V6发动机，最大功率259马力，峰值扭矩320牛·米。传动方面，与发动机匹配的将是6速手自一体变速箱。",
                categories: [
                    {value: 88.133, label: 'auto'}, {value: 5.234, label: 'digital'}, {value: 2.304, label: 'mobile'},
                    {value: 1.897, label: 'ce'}, {value: 0.300, label: 'furniture'}, {value: 0.245, label: 'appliances'},
                    {value: 0.222, label: 'hotel'}, {value: 0.193, label: 'camera'}, {value: 0.190, label: 'sports'},
                    {value: 0.187, label: 'fitness'}, {value: 0.156, label: 'games'}, {value: 0.143, label: 'education'},
                    {value: 0.138, label: 'realestate'}, {value: 0.119, label: 'internet'}, {value: 0.119, label: 'airline'},
                    {value: 0.099, label: 'beauty'}, {value: 0.071, label: 'fashion'}, {value: 0.056, label: 'finance'},
                    {value: 0.051, label: 'entertainment'}, {value: 0.039, label: 'music'}, {value: 0.031, label: 'food'},
                    {value: 0.027, label: 'babies'}, {value: 0.022, label: 'books'}, {value: 0.015, label: 'travel'},
                    {value: 0.006, label: 'health'}                    
                ],
                sentiments: [
                    {value: 83.831, label: 'positive'},
                    {value: 16.169, label: 'negative'}
                ]
            }
        ];

        $scope.submit = function() {
            $scope.clearCharts();
            $scope.renderCharts();
        };

        $scope.clear = function() {
            $scope.selectedExample = null;
            $scope.onSelectionUpdated();
        };

        $scope.onSelectionUpdated = function() {
            $("#exampleText").val($scope.selectedExample ? $scope.selectedExample.text : "");
            $scope.clearCharts();
            $scope.renderCharts();
        };

        $scope.clearCharts = function() {
            clearChart("sentiment-analysis");
            clearChart("category-analysis");
        };

        $scope.renderCharts = function() {
            if($scope.selectedExample) {
                renderChart("sentiment-analysis", $scope.selectedExample.sentiments);
                renderChart("category-analysis", $scope.selectedExample.categories);
            }
        };

        function clearChart(chartId) {
            $("#" + chartId).empty();
        }

        function renderChart(chartId, chartData) {
            Morris.Donut({element: chartId, data: chartData, formatter: function(value) {return value + "%"}});
        }
    }
]);
