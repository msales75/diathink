///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/AnimatedAction.js");

var DockAnimAction = (function (_super) {
    __extends(DockAnimAction, _super);
    function DockAnimAction() {
        _super.apply(this, arguments);
    }
    /*
    getObjectParams(obj, textobj) {
    // * Currently unused, precisely orients text in object-boundaries
    // if old-type = new-type, don't need to deal with this
    var oldParams = {};
    oldParams.elem = oldObject;
    var offset = $(oldObject).offset();
    oldParams.top = offset.top;
    oldParams.left = offset.left;
    var textoffset = $(textobj).offset();
    oldParams.textTop = textoffset.top - offset.top;
    oldParams.textLeft = textoffset.left - offset.left;
    oldParams.fontSize = Number($(textobj).css('font-size').replace(/px/,''));
    oldParams.textWidth = $(textobj).width();
    oldParams.textHeight = $(textobj).height();
    oldParams.color = $(textobj).css('color');
    return oldParams;
    } */
    DockAnimAction.prototype.dockAnimStep = function (frac, o) {
    };
    DockAnimAction.prototype.animFadeEnv = function () {
    };

    DockAnimAction.prototype.createDockElem = function () {
    };

    // this seems the same for PanelRootAction panel-docking
    // todo: for non-docking, start fade-in after restoreContext before focus
    // dock the dragged-helper
    DockAnimAction.prototype.dockAnim = function (newRoot) {
    };
    return DockAnimAction;
})(AnimatedAction);
//# sourceMappingURL=DockAnimAction.js.map
