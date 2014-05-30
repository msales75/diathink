///<reference path="Action.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/actions/OutlineAction.js");

var InsertIntoAction = (function (_super) {
    __extends(InsertIntoAction, _super);
    function InsertIntoAction() {
        _super.apply(this, arguments);
        this.type = "InsertIntoAction";
        this.disableAnimation = true;
        // options:ActionOptions= {activeID: null, referenceID: null, text: ""};
        this._validateOptions = {
            requireActive: false,
            requireReference: true,
            requireOld: false,
            requireNew: false
        };
    }
    InsertIntoAction.prototype.getNewContext = function () {
        var parent = View.get(this.options.newRoot).panelView;
        assert(parent != null, "Invalid newRoot for InsertIntoAction");
        var next = null;
        var children = parent.value.get('children');
        if (children.count > 0) {
            next = children.first();
        }
        this.newModelContext = {
            prev: null,
            next: next,
            parent: parent.value.cid
        };
    };
    return InsertIntoAction;
})(OutlineAction);
//# sourceMappingURL=InsertIntoAction.js.map
