var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
///<reference path="../views/OutlineView.ts"/>
//m_require('app/views/button.js');
var ListItemView = (function (_super) {
    __extends(ListItemView, _super);
    function ListItemView() {
        _super.apply(this, arguments);
        this.type = 'ListItemView';
        this.modelType = $D.OutlineNodeModel;
    }
    ListItemView.prototype.getChildTypes = function () {
        return {
            header: NodeHeaderContainer,
            children: RecurseListTemplate
        };
    };
    ListItemView.prototype.theme = function (elem) {
        if (!elem) {
            elem = $('#' + this.id)[0];
        }
        $(elem).addClass('ui-li ui-li-static ui-btn-up-c');
        this.themeChildViews(elem);

        // todo: will this propagate without elem?
        // fixHeight is only called on nonempty list-elements.
        if (this.header.name.text.value.length > 3) {
            this.header.name.text.fixHeight();
        }
    };

    ListItemView.prototype.render = function () {
        this.html = '<li id="' + this.id + '"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</li>';
        return this.html;
    };

    ListItemView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };

    // MS custom theme function to handle changes in list-sequence, active-status, etc.
    // todo: class-names should probably not be hard-coded
    // todo: position of ul inside list should probably not be hard-coded
    ListItemView.prototype.themeFirst = function () {
        var elem = $('#' + this.id);
        if (elem.prev('li').length > 0) {
            elem.removeClass('ui-first-child');
        } else {
            elem.addClass('ui-first-child');
        }
    };

    ListItemView.prototype.themeLast = function () {
        var elem = $('#' + this.id);
        if (elem.next('li').length > 0) {
            elem.removeClass('ui-last-child');
        } else {
            elem.addClass('ui-last-child');
        }
    };
    return ListItemView;
})(View);
//# sourceMappingURL=list_item.js.map
