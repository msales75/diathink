///<reference path="../foundation/view.ts"/>
m_require("app/foundation/view.js");

M.TOP = 'header';
M.BOTTOM = 'footer';
M.LEFT = 'LEFT';
M.CENTER = 'CENTER';
M.RIGHT = 'RIGHT';

class ToolbarView extends View {
    type = 'ToolbarView';
    anchorLocation = M.TOP;
    showBackButton = NO;
    isFixed = YES;
    isPersistent = YES;
    toggleOnTap = NO;

    render() {
        this.html = '<div id="' + this.id + '" data-role="' + this.anchorLocation + '" data-tap-toggle="' + this.toggleOnTap + '"' + this.style();

        if (this.isFixed) {
            this.html += ' data-position="fixed"';
        }

        if (this.isPersistent) {
            if (typeof(this.isPersistent) === "string") {
                this.html += ' data-id="' + this.isPersistent + '"';
            } else {
                this.html += ' data-id="themprojectpersistenttoolbar"';
            }
        }

        this.html += '>';

        this.renderChildViews();

        this.html += '</div>';

        return this.html;
    }

    renderChildViews():string {
        if (this.value) {
            this.html += '<h1>' + this.value + '</h1>';
        } else {
            var viewPositions = {};
            for (var v in this.childViewTypes) {
                var view = this[v];
                view._name = v;
                view.parentView = this;
                if (viewPositions[view.anchorLocation]) {
                    M.Logger.log('ToolbarView has two items positioned at M.' +
                        view.anchorLocation +
                        '.  Only one item permitted in each location', M.WARN);
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
    }

    style() {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }

}