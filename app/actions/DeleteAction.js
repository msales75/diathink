///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var DeleteAction = (function (_super) {
    __extends(DeleteAction, _super);
    function DeleteAction() {
        _super.apply(this, arguments);
        this.disableAnimation = true;
        this.type = "DeleteAction";
        this._validateOptions = {
            requireActive: true,
            requireReference: false,
            requireOld: true,
            requireNew: false
        };
    }
    // options:ActionOptions = {activeID: null, transition: false};
    DeleteAction.prototype.getNewContext = function () {
        this.newModelContext = null;
    };
    return DeleteAction;
})(OutlineAction);
//# sourceMappingURL=DeleteAction.js.map
