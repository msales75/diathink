var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ContainerView.js");

var NodeTextWrapperView = (function (_super) {
    __extends(NodeTextWrapperView, _super);
    function NodeTextWrapperView() {
        _super.apply(this, arguments);
        this.cssClass = 'outline-content_container link-list';
        this.textOffset = {};
    }
    NodeTextWrapperView.prototype.init = function () {
        this.childViewTypes = {
            text: NodeTextView
        };
        this.listItemTemplate = NodeLinkView;
    };
    NodeTextWrapperView.prototype.updateValue = function () {
        this.value = this.nodeView.value.attributes.links;
    };
    NodeTextWrapperView.prototype.layoutDown = function () {
        if (!this.layout) {
            this.layout = {};
        }
        var w = Math.round(1.4 * View.fontSize);
        this.layout.top = 0;
        this.layout.left = w;
        this.layout.width = this.parentView.layout.width - w;
    };
    NodeTextWrapperView.prototype.positionChildren = function (v, v2, validate) {
        var l = this.text.saveLayout();
        this.text.fixHeight();
        this.text.updateDiffs(l, validate);
    };
    NodeTextWrapperView.prototype.layoutUp = function () {
        this.layout.height = this.text.layout.height;
    };
    NodeTextWrapperView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        if (this.listItems && this.listItems.count) {
            this.insertListItems();
        } else {
            this.positionChildren(null); // need to fix height, even if there's no child-links
        }
        this.setPosition();
        return this.elem;
    };
    NodeTextWrapperView.prototype.redrawLinks = function () {
        this.removeListItems();
        this.createListItems();
        this.insertListItems();
        this.text.resizeUp();
    };
    NodeTextWrapperView.prototype.updateTextOffset = function () {
        this.textOffset = {
            left: Math.round(.18 * View.fontSize),
            top: Math.round(.15 * View.fontSize)
        };
    };
    NodeTextWrapperView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.value === this.nodeView.value.attributes.links, "NodeTextWrapper has wrong value");

        // value must match with listItems
        if (this.value != null) {
            assert(this.listItems.count === this.value.count, "Length of link listItems does not match value");
            var o;
            for (o in this.listItems.obj) {
                var cid = this.listItems.obj[o].value.cid;
                assert(this.value.obj[cid] === this.listItems.obj[o].value, "value not found in link list");

                // ensure sequence also matches
                if (this.value.next[cid] !== '') {
                    assert(this.value.next[cid] === this.listItems.obj[this.listItems.next[o]].value.cid, "Sequence does not match links");
                }
            }
        } else {
            assert((this.listItems == null) || (this.listItems.count === 0), "");
        }
    };
    return NodeTextWrapperView;
})(View);
//# sourceMappingURL=NodeTextWrapperView.js.map
