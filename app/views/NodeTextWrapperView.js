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
    NodeTextWrapperView.prototype.resize = function () {
        this.textOffset = {
            top: Number($(this.elem).css('padding-top').replace(/px/, '')) + Number($(this.text.elem).css('padding-top').replace(/px/, '')),
            left: Number($(this.elem).css('padding-left').replace(/px/, '')) + Number($(this.text.elem).css('padding-left').replace(/px/, ''))
        };
    };
    return NodeTextWrapperView;
})(View);
//# sourceMappingURL=NodeTextWrapperView.js.map
