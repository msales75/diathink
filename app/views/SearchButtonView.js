var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="View.ts"/>
m_require("app/views/ButtonView.js");
var SearchButtonView = (function (_super) {
    __extends(SearchButtonView, _super);
    function SearchButtonView() {
        _super.apply(this, arguments);
        this.value = 'theme/images/search.png';
        this.cssClass = 'undo-button';
    }
    SearchButtonView.prototype.init = function () {
        this.isClickable = true;
    };
    SearchButtonView.prototype.onClick = function (params) {
        if (this.isEnabled) {
            this.start();
        }
        var collection = new OutlineNodeCollection();
        collection.append('j7oV1V6W8M26_490', OutlineNodeModel.getById('j7oV1V6W8M26_490'));

        ActionManager.schedule(function () {
            if (!View.focusedView) {
                return null;
            }
            return Action.checkTextChange(View.focusedView.header.name.text.id);
        }, function () {
            return {
                actionType: PanelCreateAction,
                name: 'Create search panel',
                activeID: 'search',
                prevPanel: View.getCurrentPage().content.gridwrapper.grid.listItems.last(),
                focus: false,
                searchList: collection
            };
        });
    };
    SearchButtonView.prototype.suggest = function () {
        this.value = 'theme/images/search-1.png';
        this.elem.innerHTML = '<img src="' + this.value + '" alt="' + this.value + '"/>';
    };
    SearchButtonView.prototype.layoutDown = function () {
        this.layout = {
            top: 4,
            left: this.parentView.layout.width - 105 - 36 - 5,
            width: 36,
            height: 36
        };
    };
    return SearchButtonView;
})(ButtonView);
//# sourceMappingURL=SearchButtonView.js.map
