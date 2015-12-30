; (function ($) {
    var CowsBullsClient = function (container) {
        var jContainer = $(container);
        jContainer.show();
    };

    $('[cows-bulls-container]').each(function () {
        new CowsBullsClient(this);
    });
})(jQuery);