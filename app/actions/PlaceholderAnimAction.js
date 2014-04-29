var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="Action.ts"/>
m_require("app/actions/DockAnimAction.js");

var PlaceholderAnimAction = (function (_super) {
    __extends(PlaceholderAnimAction, _super);
    function PlaceholderAnimAction() {
        _super.apply(this, arguments);
    }
    PlaceholderAnimAction.prototype.oldLinePlace = function (outline) {
    };
    PlaceholderAnimAction.prototype.newLinePlace = function (outline) {
    };
    PlaceholderAnimAction.prototype.linePlaceAnim = function (outline) {
    };

    // animation-step if the oldLinePlaceholder is animated
    PlaceholderAnimAction.prototype.oldLinePlaceAnimStep = function (frac, o) {
    };

    PlaceholderAnimAction.prototype.newLinePlaceAnimStep = function (frac, o) {
    };

    PlaceholderAnimAction.prototype.contextParentVisible = function (a, b) {
        return null;
    };
    return PlaceholderAnimAction;
})(DockAnimAction);
//# sourceMappingURL=PlaceholderAnimAction.js.map
