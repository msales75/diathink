///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var InsertAfterAction = (function (_super) {
    __extends(InsertAfterAction, _super);
    function InsertAfterAction() {
        _super.apply(this, arguments);
        this.type = "InsertAfterAction";
        this.disableAnimation = true;
        // options:ActionOptions= {activeID: null, referenceID: null, text: ""};
        this._validateOptions = {
            requireActive: false,
            requireReference: true,
            requireOld: false,
            requireNew: true
        };
    }
    InsertAfterAction.prototype.getNewContext = function () {
        this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
    };
    return InsertAfterAction;
})(OutlineAction);
//# sourceMappingURL=InsertAfterAction.js.map
