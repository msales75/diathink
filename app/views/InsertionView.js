var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ImageView.js");

var InsertionView = (function (_super) {
    __extends(InsertionView, _super);
    function InsertionView() {
        _super.apply(this, arguments);
        this.cssClass = "insertion-button";
        this.value = 'theme/images/plus.png';
    }
    InsertionView.prototype.init = function () {
        this.isHidden = true;
        this.isClickable = true;
    };

    InsertionView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.left = p.width - Math.round(2.5 * View.fontSize), this.layout.width = Math.round(1.5 * View.fontSize), this.layout.height = Math.round(1.5 * View.fontSize);
    };
    InsertionView.prototype.layoutUp = function () {
    };
    InsertionView.prototype.updateValue = function () {
        if (this.panelView.value.attributes.children.count > 0) {
            this.isHidden = true;
        } else {
            this.isHidden = false;
        }
    };
    InsertionView.prototype.hide = function () {
        if (!this.isHidden) {
            this.isHidden = true;
            this.elem.style.display = 'none';
        }
    };
    InsertionView.prototype.show = function () {
        if (this.isHidden) {
            this.isHidden = false;
            this.elem.style.display = 'block';
        }
    };
    InsertionView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.elem.style.zIndex = '1'; // in front of outline
        if (this.isHidden) {
            this.elem.style.display = 'none';
        } else {
            this.elem.style.display = 'block';
        }
        return this.elem;
    };
    InsertionView.prototype.onClick = function (params) {
        if (!this.panelView) {
            return;
        }
        var that = this;
        var panel = this.panelView;
        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            return {
                actionType: InsertIntoAction,
                referenceID: panel.value.cid,
                oldRoot: panel.outline.alist.id,
                newRoot: panel.outline.alist.id,
                focus: true
            };
        });
    };
    InsertionView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        if (this.panelView.value.attributes.children.count > 0) {
            assert(this.isHidden === true, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display') === 'none', "Wrong display for insertionview");
        } else {
            assert(this.isHidden === false, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display') === 'block', "Wrong display for insertionview");
        }
    };
    return InsertionView;
})(ImageView);
//# sourceMappingURL=InsertionView.js.map
