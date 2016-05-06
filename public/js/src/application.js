var anacode = angular.module('anacode', ["anacodeModels", "anacodeControllers", "anacodeServices"]);


(function($, viewport) {
    $(document).ready(function() {
        // Execute code each time window size changes
        $(window).resize(
            viewport.changed(function() {
                var $sentiments = $('#sentiments'),
                    $industries = $('#industries');

                $sentiments.removeAttr('style');
                $industries.removeAttr('style');

                if (viewport.is('md') || viewport.is('lg')) {
                    var height = $industries.height();

                    $sentiments.height(height);
                    $industries.height(height);
                }
            })
        );

    });
})(jQuery, ResponsiveBootstrapToolkit);
