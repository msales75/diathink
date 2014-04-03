///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var MoveIntoAction = (function (_super) {
    __extends(MoveIntoAction, _super);
    function MoveIntoAction() {
        _super.apply(this, arguments);
        this.type = "MoveIntoAction";
        this._validateOptions = {
            requireActive: true,
            requireReference: true,
            requireOld: true,
            requireNew: false,
            requireNewReference: true
        };
    }
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    MoveIntoAction.prototype.getNewContext = function () {
        this.newModelContext = this.getContextIn(this.options.referenceID);
    };
    return MoveIntoAction;
})(OutlineAction);
//# sourceMappingURL=MoveIntoAction.js.map
