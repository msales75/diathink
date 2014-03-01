
///<reference path="../foundation/view.ts"/>

m_require("app/foundation/view.js");

class ScrollView extends View {
    type= 'ScrollView';
    scrollview=null; // scroll handler
    render() {
        this.html = '<div id="' + this.id + '" data-role="content"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        return this.html;
    }

    style() {
        var html = '';
        if(this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }

    // MS addition for scrollview from jquery-mobile splitscreen
    theme() {
        // todo: this needs to be implemented without jquery-mobile
      this.scrollview = new $D.scrollview({
            element: $('#'+this.id).get(0),
            direction: 'y',
            delayedClickEnabled: false
            // MS - prevents double-handling of tap when using bubbling/delegated
            // updateScroll: this.updateScroll
      });
      this.themeChildViews(null); // MS fix to avoid list2view bug
    }

    themeUpdate() {
        // todo: call after changing height of content?
        /*
        var scrolltop = $('#' + this.id).children('.ui-scrollview-view').position().top;
        $('#' + this.id).scrollTop(0);
        $('#'+this.id).scrollview('scrollTo', 0, scrolltop);
        */
    }

}