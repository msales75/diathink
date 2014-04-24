///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

// todo: merge outdent with moveafter action?
var OutdentAction = (function (_super) {
    __extends(OutdentAction, _super);
    function OutdentAction() {
        _super.apply(this, arguments);
        this.type = "OutdentAction";
        this._validateOptions = {
            requireActive: true,
            requireReference: true,
            requireOld: true,
            requireNew: true
        };
    }
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    OutdentAction.prototype.getNewContext = function () {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    };
    return OutdentAction;
})(OutlineAction);
//# sourceMappingURL=OutdentAction.js.map
