angular.module("anacodeControllers", ["ngSanitize"]).controller("DashboardController", ["_", "$", "$scope", "$sce", "$timeout", "AnalysisDataModel",
    function (_, $, $scope, $sce, $timeout, AnalysisDataModel) {

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
                topLabel: "415",
                bottomLabel: "WORDS",
                formatter: function(value) { return value },
                resize: true
            });
        };

        $scope.examples = [
            {
                name: "EMAAR campaign snippet",
                text: "中国富人正在撤离国内房地产市场 一部分资产正在向这里转移2016-03-14最新报告显示：三月初，诺亚财富发布了《2016高端财富白皮书》，这份报告根据对大量中国“高净值人士”的调查显示，中国高端财富市场正在发生一些重要的变化，其中之一就是，中国的富人对投资国内房地产的兴趣正在大幅度下降，他们已在将财富向其他领域转移，或是在加速进行海外资产配置"
            },
            {
                name: "Real Estate (百度百科)",
                text: "房地产是指覆盖土地并永久附着于土地的一类实物，比如建筑物。房地产一般也被称为不动产（real property，也写作realty），与之相对应的是私产，即动产（personal property，也被称作chattel或者personalty）。在技术层面上，一些人试图将房地产与土地和设备等其他不动产相分离，同时将房地产所有权与房地产本身相分离。在不动产（immovable property）归于民法权限下的同时，普通法中使用的是房地产（real estate）和不动产（real property）来这类权利。可以有三种存在形态：即土地 、建筑物、房地合一的。在房地产拍卖中，其拍卖标的也可以有三种存在形态，即土地（或土地使用权），建筑物和房地合一状态下的物质实体及其权益，随着个人财产所有权的发展，房地产已经成为商业交易的主要组成部分。购买房地产是一种重要的投资方式。"
            },
            {
                name: "AlphaGo (Wikipedia)",
                text: "AlphaGo（阿尔法围棋，又昵称阿尔法狗或阿法狗）是由英国伦敦Google DeepMind开发的人工智能围棋程序。2015年10月，它成为第一个无需让子，即可在19路棋盘上击败围棋职业棋士的电脑围棋程序。2016年3月，在一场五番棋比赛中，AlphaGo于前三局以及最后一局均击败顶尖职业棋手李世乭，成为第一个不借助让子而击败围棋职业九段棋士的电脑围棋程序。五局赛后韩国棋院授予AlphaGo为有史以来第一位名誉职业九。专业术语上来说，AlphaGo其做法是使用了蒙地卡罗树状搜索与两个深度神经网络相结合方法，其中一个是以估值网络来评估大量的选点，而以走棋网络来选择落子。在这种设计下，电脑可以结合树状图的长远推断，又可像人类的大脑一样自发学习进行直觉训练，以提高下棋实力。"
            },
            {
                name: "Hotpot (Wikipedia)",
                text: "火锅一般而言，是以锅为器具，以热源烧锅，以水或汤导热，来涮煮食物的烹调方式，同时亦可指这种烹调方式所用的锅具。其特色为边煮边吃，或是小火让锅本身具有保温效果，吃的时候食物仍热气腾腾，汤物合一。世界各地均有类似的料理，但主要在东亚地方特别盛行。 典型的火锅食材包括各种肉片、海鲜、蔬菜、豆制品、菌菇类、蛋类制品、丸子等，将其放入煮开的清水或特制的高汤锅底[a]烫熟后食用。有些吃法还会蘸上调料[b]一起食用。一般来说，现在衍生出火锅的另一种形式“豆捞”。"
            },
            {
                name: "Automotive press release",
                text: "雷克萨斯发布RC 200t/RC 300 AWD官图2015-10-08 14:29:25 新浪汽车 1分享添加喜爱打印增大字体减小字体新浪汽车讯 近日，雷克萨斯正式发布了RC 200t和RC 300 AWD（四驱版）两款新增车型的官图，新车将进一步丰富雷克萨斯RC的产品线。外观方面，雷克萨斯RC 200t造型与现款RC 350基本保持一致，作为一款入门级车型，新车最大的区别是采用了更加传统的带透镜式前大灯组，并配备有LED日间行车灯。此外，该车还配备有F SPORT外观套件，使新车看起更加运动。而另一款雷克萨斯RC 300 AWD车型在外观方面并没有配备F SPORT外观套件，纺锤形前进气格栅采用竖条幅设计，前大灯组同样采用透镜式大灯，此外该车最大的变化在于采用了四驱布局。动力方面，雷克萨斯RC 200t搭载2.0T发动机，最大功率244马力，峰值扭矩350牛·米，传动方面，与发动机匹配的将是8速手自一体变速箱。而另一款雷克萨斯RC 300 AWD则搭载3.5L自然吸气V6发动机，最大功率259马力，峰值扭矩320牛·米。传动方面，与发动机匹配的将是6速手自一体变速箱。"
            },
            {
                name: "Mobile press release",
                text: "【手机中国 新闻】继月初的捷克布拉格发布会之后，7月15日努比亚在北京举行了新品发布会，正式在国内市场推出了智能新机——nubia My prague，并公布了该机的上市信息。在本次发布会之...综上，优质的内容，优秀的渠道资源，成就了靠谱的营销成果，春节期间，“2015新蒙迪欧·品味中国年”营销事件成功覆盖千万人群。可以说，钱在刃上，不任性也有好案例，值!。同时，还搭载 1.7GHz 四核 处理器，配备2GB RAM和32 GB机身内存，同时还拥有210万像素前置摄像头、HTC UltraPixel超像素相机以及2300 mAh大电池，整体配置十分出色，而三种制式版本并无差异。事实上，除了高配版之外，售价更亲民的联想K80标准版也正在京东商城现货发售中，感兴趣的朋友可以移步至京东商城详细了解下。"
            },
            {
                name: "Automotive test drive report",
                text: "试大众Passat GTE 有性格的好好先生2015年09月30日 00:33:04分享到：来源：凤凰汽车作者：蒋韬凤凰汽车·抢先试驾 无可置疑，目前最令人神往的一定是三种车，饱经岁月与沧桑的老爷车，令人血脉喷张的跑车以及带你翻山越岭的越野车。当然还有一类车，不一定会让你心动，却是各大厂商争相开垦的处女田，也就是我们常说的新能源汽车。的确，天不再那么蓝了，冬天也越来越温暖，和我们息息相关的油价也许最终只会让我们无奈的“呵呵”，这种种的种种迫使我们找到一种新的能源来代替现有的汽油与柴油。而我们目前能够想到的也许大体分为三种——核能、氢能、电能。前两种自然不用多想，抛开安全问题不谈，昂贵的制造成本也足以令你哑口无言。而纯电力目前来看貌似是靠谱的，但是想到漫长的充电过程，又有多少人会真的用它来充当首选的出行工具呢？所以就目前来看，油电混动技术仍旧是现阶段汽车最实际的能源过渡方案。那么回到之前说的，我们希望地球慢慢好起来，我们渴望蓝天白云，或者说的直白一些我们希望降低用车成本，但是我们是贪婪的人类，我们并不希望因此而失去半点车辆的实用性甚至驾驶乐趣，也许他能够帮助你，它就是Passat GTE。说到大众的GTI、GTD可能大家并不陌生，“GT”代表“Gran Tourismo”，意指汽车的运动性，而其中的“I”和“D”分别代表了车辆采用汽油发动机和柴油发动机，而GTE的名称也是一脉相承，不同之处在于它使用的是插电式混合动力系统。GTE采用的动力系统由一台1.4升缸内直喷涡轮增压发动机与一台三相永磁同步电机构成，综合最大功率160千瓦，最大扭矩400牛·米，在满油满电的情况下，综合续航里程可超过1000公里，也就是说在这种情况下，Passat GTE的百公里综合油耗会低于2升。与动力系统配合的是大众的6速DSG变速器，不过不同之处在于为了匹配混动车型，其中的离合器数量增加到了三个，这第三个离合器的作用是用于在纯电动模式以及车辆滑行时切断车轮与发动机之间的连接，以此来节省不必要的动力消耗。对于这套系统而言，除了拥有三个离合器，驱动电动机也是整合在了变速器中，并且锂电池模块被安置在了后排座椅下方，这不仅平衡了车辆前后轴的重量，也同时完美的解决了行李厢的空间问题。"
            },
            {
                name: "Camera forum contribution",
                text: "三款套装在 5 月 18 日至 6 月 3 日的预订期内附送专用外影袋丶专用电池及 8GB SD 记忆卡，预计於六月初正式发售。Sony 香港同时发布的还有全新 E-mount 镜头 SEL18200，其体积积较小，重量上也减少了 12%，并具备直接手动对焦功能，售价 HK$6,490，约 5,290 人民币，将於六月底发售。"
            },
            {
                name: "Camera press release",
                text: "苹果继续抢注新域名 均与照相机和摄影有关2014-02-07 08:44lydia_emyeu 威锋网 分享 1 4074收藏上周的报道称，互联网名称与数码地址分配机构(ICANN)宣布开放自定义顶级域名的申请，苹果先下手为强，注册了几个跟“.guru”有关的域名。现在苹果仍在抓紧时间抢注域名，这次注册了大...上周的报道称，互联网名称与数码地址分配机构(ICANN)宣布开放自定义顶级域名的申请，苹果先下手为强，注册了几个跟“.guru”有关的域名。现在苹果仍在抓紧时间抢注域名，这次注册了大量跟“.camera”和“.photography”有关的域名。"
            },
            {
                name: "Travel report",
                text: "我们的行程：D1:成都－－北京－－多伦多D2:多伦多－－阿尔冈昆省立公园     全程250公里   住亨茨维尔假日酒店D3：阿尔冈昆。住亨茨维尔速8酒店D4: 亨茨维尔－－诺斯贝 。全程166公里   住希尔顿酒店D5:  诺斯贝   住希尔顿酒店D6: 诺斯贝－－渥太华  。 全程360公里   住万豪酒店D7:渥太华      万豪酒店D8:渥太华－－蒙特利尔 。 全程200公里   住万豪酒店D9:蒙特利尔    住万豪酒店D10:蒙特利尔－－魁北克 。全程259公里   住费尔蒙芳提娜城堡酒店D11：魁北克 。住费尔蒙芳提娜城堡酒店D12:魁北克－－史密斯福尔斯 。全程460公里   住汽车旅馆D13:史密斯福尔斯 。住气场旅馆D14:史密斯福尔斯－－金斯顿 ，全程130公里   住气场旅馆D15:金斯顿  。 住汽车旅馆D16:金斯顿－－尼亚加拉瀑布 。 全程379公里   住汽车旅馆D17:尼亚加拉瀑布 住瀑景万豪酒店D18:尼亚加拉瀑布－－多伦多 。  全程120公里   住费尔蒙特皇家约克酒店D19:多伦多－－北京－－成都"
            },
            {
                name: "Finance snippet",
                text: "当市场朝您有利的方向发展时，我们的交易技术能够自动在一个更好的价位执行您的交易，以为您节约成本。在2013年, 65%限价单价格获得价格优化。"
            },
            {
                name: "Chanel market entry",
                text: "香奈儿奢华精萃精华油全新上市！为了缔造光泽美肌，香奈儿奢华精萃系列不断探索五月香草荚果中的活性成分，采撷珍贵的“绿色钻石”，为肌肤注入源自大自然的植物精萃。"
            },
            {
                name: "有爱的饭",
                text: "胃暖情更浓作为吃货的你，千万不可以轻易满足，今年，我们要换个吃法！恰逢感恩节之际，老板厨源烹饪文化体验馆携手豆果美食，举行了第六期“有爱的饭”烘焙课堂，给各位美食吃货送来了甜蜜与温暖，一道主食、一道甜食，即刻秒杀你的味蕾！那么，谁会是这次美食的掌舵之人呢？来看看照片吧~~一道主食——蔓越莓酱烤肋排，听名字就是一道让你欲罢不能的大菜，汁浓甜香的外表下裹着鲜嫩营养的肉质，搭配酸甜可口的柠檬，堪称肉食界之最！一道甜食——蛋白椰丝香橙生巧，细腻的蛋白之上覆盖着一层浓浓的巧克力慕斯，入口即化的美感我们不言而喻，加上精致小巧的包装算得上节日馈赠亲友的佳品，带上这样的感恩礼物，有谁会不感动呢？"
            },
            {
                name: "红糖姜丝炖蛋",
                text: "红糖姜丝炖蛋由于生活习惯问题，很多女性朋友都会宫寒。红糖、姜可以暖宫，让经血通常，改善痛经。鸡蛋中还有丰富的蛋白质和维生素a，很有营养，经期身体虚弱需要多补补。冬天经期来一碗红糖姜丝炖蛋，可是保护身体的好方法。红糖红枣黑米粥很多女孩子经期会出现浑身无力、腰酸背痛、精神散漫等现象，这都是因为营养确实导致的。黑米中含有蛋白质、碳水化合物、b族维生素、铁等都是经期非常需要补充的营养，红枣特点就是维生素含量高，这个组合肯定是经期必备的良品了。菠菜中富含铁，铁是人体造血原料之一，是女性经期时的好食品。经常吃菠菜的人面色红润、光彩照人，可远离缺铁性贫血。菠菜还可以清理人体肠胃里的热毒，避免便秘，保持排泄的通畅。"
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
