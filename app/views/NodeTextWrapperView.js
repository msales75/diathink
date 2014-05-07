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
    NodeTextWrapperView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((this[name]).elem);
        }
        this.insertListItems();
        return this.elem;
    };
    NodeTextWrapperView.prototype.redrawLinks = function () {
        this.removeListItems();
        this.createListItems();
        this.insertListItems();
        this.text.fixHeight();
    };
    NodeTextWrapperView.prototype.resize = function () {
        this.textOffset = {
            top: Number($(this.elem).css('padding-top').replace(/px/, '')) + Number($(this.text.elem).css('padding-top').replace(/px/, '')),
            left: Number($(this.elem).css('padding-left').replace(/px/, '')) + Number($(this.text.elem).css('padding-left').replace(/px/, ''))
        };
    };
    NodeTextWrapperView.prototype.validate = function () {
        _super.prototype.validate.call(this);
        assert(this.value === this.nodeView.value.attributes.links, "NodeTextWrapper has wrong value");

        // value must match with listItems
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
    };
    return NodeTextWrapperView;
})(View);
//# sourceMappingURL=NodeTextWrapperView.js.map
