var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

M.TOP = 'header';
M.BOTTOM = 'footer';
M.LEFT = 'LEFT';
M.CENTER = 'CENTER';
M.RIGHT = 'RIGHT';

var ToolbarView = (function (_super) {
    __extends(ToolbarView, _super);
    function ToolbarView() {
        _super.apply(this, arguments);
        this.type = 'ToolbarView';
        this.anchorLocation = M.TOP;
        this.showBackButton = NO;
        this.isFixed = YES;
        this.isPersistent = YES;
        this.toggleOnTap = NO;
    }
    ToolbarView.prototype.render = function () {
        this.html = '<div id="' + this.id + '" data-role="' + this.anchorLocation + '" data-tap-toggle="' + this.toggleOnTap + '"' + this.style();

        if (this.isFixed) {
            this.html += ' data-position="fixed"';
        }

        if (this.isPersistent) {
            if (typeof (this.isPersistent) === "string") {
                this.html += ' data-id="' + this.isPersistent + '"';
            } else {
                this.html += ' data-id="themprojectpersistenttoolbar"';
            }
        }

        this.html += '>';

        this.renderChildViews();

        this.html += '</div>';

        return this.html;
    };

    ToolbarView.prototype.renderChildViews = function () {
        if (this.value) {
            this.html += '<h1>' + this.value + '</h1>';
        } else {
            var viewPositions = {};
            for (var v in this.childViewTypes) {
                var view = this[v];
                view._name = v;
                view.parentView = this;
                if (viewPositions[view.anchorLocation]) {
                    M.Logger.log('ToolbarView has two items positioned at M.' + view.anchorLocation + '.  Only one item permitted in each location', M.WARN);
                    return null;
                }
                viewPositions[view.anchorLocation] = YES;
                switch (view.anchorLocation) {
                    case M.LEFT:
                        this.html += '<div class="ui-btn-left">';
                        this.html += view.render();
                        this.html += '</div>';
                        break;
                    case M.CENTER:
                        this.html += '<h1>';
                        this.html += view.render();
                        this.html += '</h1>';
                        break;
                    case M.RIGHT:
                        this.html += '<div class="ui-btn-right">';
                        this.html += view.render();
                        this.html += '</div>';
                        break;
                    default:
                        M.Logger.log('ToolbarView children must have an anchorLocation of M.LEFT, M.CENTER, or M.RIGHT', M.WARN);
                        return null;
                }
            }
        }
        return this.html;
    };

    ToolbarView.prototype.style = function () {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    };
    return ToolbarView;
})(View);
//# sourceMappingURL=toolbar.js.map
