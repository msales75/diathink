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
        // Handle cursor splitting/merging in OutlineAction
        // test if children are visible
        var rootid = this.options.oldRoot;
        var ref = OutlineNodeModel.getById(this.options.referenceID);
        assert(ref.views[rootid], "Spawning line is not available in insertion");
        var childlist = ref.views[rootid].children;
        if (!childlist.listItems || (childlist.listItems.count === 0)) {
            this.newModelContext = OutlineNodeModel.getById(this.options.referenceID).getContextAfter();
        } else {
            this.newModelContext = childlist.listItems.obj[childlist.listItems.first()].value.getContextBefore();
        }
        // otherwise create new visible child
    };
    return InsertAfterAction;
})(OutlineAction);
//# sourceMappingURL=InsertAfterAction.js.map
