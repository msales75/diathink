///<reference path="../foundation/view.ts"/>
///<reference path="../views/list.ts"/>
///<reference path="../views/list_item.ts"/>
///<reference path="../views/image.ts"/>
///<reference path="../views/container.ts"/>
///<reference path="../views/textedit.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/views/list.js");
m_require("app/views/list_item.js");
m_require("app/views/image.js");
m_require("app/views/textedit.js");
m_require("app/views/container.js");

var RecurseListTemplate = (function (_super) {
    __extends(RecurseListTemplate, _super);
    function RecurseListTemplate() {
        _super.apply(this, arguments);
        this.isInset = true;
        this.listItemTemplateView = MyListItem;
        this.items = 'models';
        this.idName = 'cid';
    }
    return RecurseListTemplate;
})(ListView);

var NodeHeaderImage = (function (_super) {
    __extends(NodeHeaderImage, _super);
    function NodeHeaderImage() {
        _super.apply(this, arguments);
        this.value = 'theme/images/drag_icon.png';
        this.cssClass = 'drag-handle disclose ui-disable-scroll';
    }
    return NodeHeaderImage;
})(ImageView);

var NodeHeaderNameText = (function (_super) {
    __extends(NodeHeaderNameText, _super);
    function NodeHeaderNameText() {
        _super.apply(this, arguments);
        this.cssClass = 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset';
        this.hasMultipleLines = true;
        this.valuePattern = '<%= text %>';
    }
    return NodeHeaderNameText;
})(TextEditView);

var NodeHeaderName = (function (_super) {
    __extends(NodeHeaderName, _super);
    function NodeHeaderName() {
        _super.apply(this, arguments);
    }
    NodeHeaderName.prototype.getChildTypes = function () {
        return {
            text: NodeHeaderNameText
        };
    };
    return NodeHeaderName;
})(ContainerView);

var NodeHeaderContainer = (function (_super) {
    __extends(NodeHeaderContainer, _super);
    function NodeHeaderContainer() {
        _super.apply(this, arguments);
        this.cssClass = 'outline-header';
    }
    NodeHeaderContainer.prototype.getChildTypes = function () {
        return {
            handle: NodeHeaderImage,
            name: NodeHeaderName
        };
    };
    return NodeHeaderContainer;
})(ContainerView);

var MyListItem = (function (_super) {
    __extends(MyListItem, _super);
    function MyListItem() {
        _super.apply(this, arguments);
    }
    return MyListItem;
})(ListItemView);

RecurseListTemplate.prototype.listItemTemplateView = MyListItem;
//# sourceMappingURL=OutlineView.js.map
