///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var CopyAfterAction = (function (_super) {
    __extends(CopyAfterAction, _super);
    function CopyAfterAction() {
        _super.apply(this, arguments);
        this.type = "CopyAfterAction";
        this._validateOptions = {
            requireActive: false,
            requireReference: true,
            requireOld: false,
            requireNew: true
        };
    }
    // options:ActionOptions= {activeID: null, referenceID: null, transition: false};
    CopyAfterAction.prototype.getNewContext = function () {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    };
    return CopyAfterAction;
})(OutlineAction);
//# sourceMappingURL=CopyAfterAction.js.map
