///<reference path="../foundation/view.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/foundation/view.js");

var ScrollView = (function (_super) {
    __extends(ScrollView, _super);
    function ScrollView() {
        _super.apply(this, arguments);
        this.type = 'ScrollView';
        this.scrollview = null;
    }
    ScrollView.prototype.render = function () {
        this.html = '<div id="' + this.id + '" data-role="content"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        return this.html;
    };

    ScrollView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };

    // MS addition for scrollview from jquery-mobile splitscreen
    ScrollView.prototype.theme = function () {
        // todo: this needs to be implemented without jquery-mobile
        this.scrollview = new $D.scrollview({
            element: $('#' + this.id).get(0),
            direction: 'y',
            delayedClickEnabled: false
        });
        this.themeChildViews(null); // MS fix to avoid list2view bug
    };

    ScrollView.prototype.themeUpdate = function () {
        // todo: call after changing height of content?
        /*
        var scrolltop = $('#' + this.id).children('.ui-scrollview-view').position().top;
        $('#' + this.id).scrollTop(0);
        $('#'+this.id).scrollview('scrollTo', 0, scrolltop);
        */
    };
    return ScrollView;
})(View);
//# sourceMappingURL=scroll.js.map
