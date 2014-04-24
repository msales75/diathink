///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var MoveBeforeAction = (function (_super) {
    __extends(MoveBeforeAction, _super);
    function MoveBeforeAction() {
        _super.apply(this, arguments);
        this.type = "MoveBeforeAction";
        this._validateOptions = {
            requireActive: true,
            requireReference: true,
            requireOld: true,
            requireNew: true
        };
    }
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    MoveBeforeAction.prototype.getNewContext = function () {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextBefore();
    };
    return MoveBeforeAction;
})(OutlineAction);
//# sourceMappingURL=MoveBeforeAction.js.map
