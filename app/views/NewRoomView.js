///<reference path="View.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/views/ImageView.js");

var NewRoomView = (function (_super) {
    __extends(NewRoomView, _super);
    function NewRoomView() {
        _super.apply(this, arguments);
        this.cssClass = "insertion-button";
        this.value = 'theme/images/plus.png';
    }
    NewRoomView.prototype.init = function () {
        this.isHidden = true;
        this.isClickable = true;
    };

    NewRoomView.prototype.layoutDown = function () {
        var p = this.parentView.layout;
        if (!this.layout) {
            this.layout = {};
        }
        this.layout.left = Math.round(View.fontSize), this.layout.width = Math.round(1.5 * View.fontSize), this.layout.height = Math.round(1.5 * View.fontSize);
    };
    NewRoomView.prototype.updateValue = function () {
        if (this.panelView.value && (this.panelView.value.attributes.text === 'Browse')) {
            this.isHidden = false;
        } else {
            this.isHidden = true;
        }
    };
    NewRoomView.prototype.hide = function () {
        if (!this.isHidden) {
            this.isHidden = true;
            this.elem.style.display = 'none';
        }
    };
    NewRoomView.prototype.show = function () {
        if (this.panelView.value && (this.panelView.value.attributes.owner !== $D.userID)) {
            return;
        }
        if (this.isHidden) {
            this.isHidden = false;
            this.elem.style.display = 'block';
        }
    };
    NewRoomView.prototype.render = function () {
        _super.prototype.render.call(this);
        this.elem.style.zIndex = '1'; // in front of outline
        if (this.isHidden) {
            this.elem.style.display = 'none';
        } else {
            this.elem.style.display = 'block';
        }
        return this.elem;
    };
    NewRoomView.prototype.onClick = function (params) {
        if (!this.panelView) {
            return;
        }
        var that = this;
        var panel = this.panelView;
        var lastID = View.get(panel.outline.alist.listItems.last()).value.cid;
        var str = '(   1/   0) ';
        this.hide();
        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            return {
                actionType: InsertAfterAction,
                name: 'Append room',
                referenceID: lastID,
                oldRoot: panel.outline.alist.id,
                newRoot: panel.outline.alist.id,
                text: str,
                focus: true,
                cursor: [str.length, str.length]
            };
        }, function () {
            var newID = View.get(panel.outline.alist.listItems.last()).value.cid;
            return {
                actionType: InsertIntoAction,
                name: 'Create room outline',
                referenceID: newID,
                oldRoot: panel.outline.alist.id,
                newRoot: panel.outline.alist.id,
                text: 'Outline',
                focus: false
            };
        }, function () {
            var newID = View.get(panel.outline.alist.listItems.last()).value.cid;
            return {
                actionType: MoveIntoAction,
                name: 'Transfer room chat',
                activeID: 'chatroot',
                referenceID: newID,
                focus: false
            };
        });
        // create two children for this node
    };
    NewRoomView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        if ((this.panelView.value == null) || (this.panelView.value.attributes.children.count > 0) || (this.panelView.value.attributes.owner !== $D.userID)) {
            assert(this.isHidden === true, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display') === 'none', "Wrong display for insertionview");
        } else {
            assert(this.isHidden === false, "isHidden is wrong for insertionview");
            assert($(this.elem).css('display') === 'block', "Wrong display for insertionview");
        }
    };
    return NewRoomView;
})(ImageView);
//# sourceMappingURL=NewRoomView.js.map
