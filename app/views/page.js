m_require("app/foundation/view.js");

M.PageView = M.View.subclass({
    type: 'M.PageView',
    isFirstLoad: YES,
    hasTabBarView: NO,
    tabBarView: null,
    internalEvents: null,
    listList: null,
    orientation: null,
    render: function() {
        /* store the currently rendered page as a reference for use in child views */
        M.ViewManager.currentlyRenderedPage = this;
        this.html = '<div id="' + this.id + '" data-role="page"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</div>';
        this.writeToDOM();
        this.theme();
        this.postRender();
    },
    writeToDOM: function() {
        var html = $('html');
        html.addClass('ui-mobile landscape');
        var body = $('body');
        body.addClass('ui-mobile-viewport ui-overlay-c');

        body.append(this.html);
    },
    theme: function() {
        // $('#' + this.id).page();
        this.themeChildViews();
    },
    style: function() {
        var html = '';
        if(this.cssClass) {
            if(!html) {
                html += ' class="';
            }
            html += this.cssClass;
        }
        if(html) {
            html += '"';
        }
        return html;
    }
    
});