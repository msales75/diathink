///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var MoveAfterAction = (function (_super) {
    __extends(MoveAfterAction, _super);
    function MoveAfterAction() {
        _super.apply(this, arguments);
        this.type = "MoveAfterAction";
        this._validateOptions = {
            requireActive: true,
            requireReference: true,
            requireOld: true,
            requireNew: true
        };
    }
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    MoveAfterAction.prototype.getNewContext = function () {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    };
    return MoveAfterAction;
})(OutlineAction);
//# sourceMappingURL=MoveAfterAction.js.map
