var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/View.js");
M.TOP = 'header';
M.BOTTOM = 'footer';
M.LEFT = 'LEFT';
M.CENTER = 'CENTER';
M.RIGHT = 'RIGHT';
var ToolbarView = (function (_super) {
    __extends(ToolbarView, _super);
    function ToolbarView() {
        _super.apply(this, arguments);
    }
    // anchorLocation = M.TOP;
    // showBackButton = NO;
    // isFixed = YES;
    // isPersistent = YES;
    // toggleOnTap = NO;
    ToolbarView.prototype.render = function () {
        this._create({
            type: 'div',
            classes: this.cssClass
        });

        // this.elem.setAttribute('data-role', this.anchorLocation);
        //if (this.isFixed) {
        // this.elem.setAttribute('data-position', "fixed");
        //}
        // if (this.isPersistent) {
        // this.elem.setAttribute('data-id',"themprojectpersistenttoolbar");
        // }
        this.renderChildViews();
        this.setPosition();
        var viewPositions = {};
        for (var v in this.childViewTypes) {
            var child = this[v];
            this.elem.appendChild(child.elem);
            /*
            assert(!viewPositions[child.anchorLocation],
            'ToolbarView has two items positioned at M.' + child.anchorLocation +
            '.  Only one item permitted in each location');
            viewPositions[child.anchorLocation] = YES;
            switch (child.anchorLocation) {
            case M.LEFT:
            this.elem.children[0].appendChild(child.elem);
            break;
            case M.CENTER:
            this.elem.children[1].appendChild(child.elem);
            break;
            case M.RIGHT:
            this.elem.children[2].appendChild(child.elem);
            break;
            default:
            assert(false,
            'ToolbarView children must have an anchorLocation of M.LEFT, M.CENTER, or M.RIGHT');
            return null;
            }
            */
        }
        return this.elem;
    };
    return ToolbarView;
})(View);
//# sourceMappingURL=ToolbarView.js.map
