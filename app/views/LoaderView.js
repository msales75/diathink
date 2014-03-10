var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
var LoaderView = (function (_super) {
    __extends(LoaderView, _super);
    function LoaderView() {
        _super.apply(this, arguments);
        this.isInitialized = NO;
        this.refCount = 0;
        this.defaultTitle = 'loading';
    }
    LoaderView.prototype.initialize = function () {
        if (!this.isInitialized) {
            this.refCount = 0;

            //$.mobile.showPageLoadingMsg();
            //$.mobile.hidePageLoadingMsg();
            this.isInitialized = YES;
        }
    };

    LoaderView.prototype.show = function (title, hideSpinner) {
        this.refCount++;
        var title = title && typeof (title) === 'string' ? title : this.defaultTitle;
        if (this.refCount == 1) {
            //$.mobile.showPageLoadingMsg('a', title, hideSpinner);
            var loader = $('.ui-loader');
            loader.removeClass('ui-loader-default');
            loader.addClass('ui-loader-verbose');

            /* position alert in the center of the possibly scrolled viewport */
            var screenSize = M.Environment.getSize();
            var scrollYOffset = window.pageYOffset;
            var loaderHeight = loader.outerHeight();
            var yPos = scrollYOffset + (screenSize[1] / 2);
            loader.css('top', yPos + 'px');
            loader.css('margin-top', '-' + (loaderHeight / 2) + 'px');
        }
    };

    LoaderView.prototype.changeTitle = function (title) {
        $('.ui-loader h1').html(title);
    };

    LoaderView.prototype.hide = function (force) {
        if (force || this.refCount <= 0) {
            this.refCount = 0;
        } else {
            this.refCount--;
        }
        if (this.refCount == 0) {
            //$.mobile.hidePageLoadingMsg();
        }
    };
    return LoaderView;
})(View);
//# sourceMappingURL=LoaderView.js.map
