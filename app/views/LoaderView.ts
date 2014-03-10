///<reference path="View.ts"/>
m_require("app/views/View.js");
class LoaderView extends View {
    isInitialized = NO;
    refCount = 0;
    defaultTitle = 'loading';

    initialize() {
        if (!this.isInitialized) {
            this.refCount = 0;
            //$.mobile.showPageLoadingMsg();
            //$.mobile.hidePageLoadingMsg();
            this.isInitialized = YES;
        }
    }

    show(title, hideSpinner) {
        this.refCount++;
        var title = title && typeof(title) === 'string' ? title : this.defaultTitle;
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
    }

    changeTitle(title) {
        $('.ui-loader h1').html(title);
    }

    hide(force) {
        if (force || this.refCount <= 0) {
            this.refCount = 0;
        } else {
            this.refCount--;
        }
        if (this.refCount == 0) {
            //$.mobile.hidePageLoadingMsg();
        }
    }
}