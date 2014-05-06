var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");

var NodeLinkView = (function (_super) {
    __extends(NodeLinkView, _super);
    function NodeLinkView() {
        _super.apply(this, arguments);
    }
    NodeLinkView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: 'node-link',
            html: this.value.get('text')
        });
        return this.elem;
    };
    NodeLinkView.prototype.setOffset = function (offset) {
        this.top = offset.top;
        this.left = offset.left;
        if (this.parentView.textOffset.left === undefined) {
            this.parentView.resize();
        }
        $(this.elem).css({
            top: String(this.top + this.parentView.textOffset.top) + 'px',
            left: String(this.left + this.parentView.textOffset.left) + 'px'
        });
    };
    return NodeLinkView;
})(View);
//# sourceMappingURL=NodeLinkView.js.map
