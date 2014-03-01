///<reference path="../foundation/view.ts"/>
///<reference path="../views/scroll.ts"/>
///<reference path="../views/container.ts"/>
///<reference path="../views/list.ts"/>
///<reference path="../views/button.ts"/>
///<reference path="../views/span.ts"/>
///<reference path="../views/toolbar.ts"/>
///<reference path="../views/grid.ts"/>
///<reference path="../views/page.ts"/>
///<reference path="../views/PanelOutlineView.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
m_require("app/views/container.js");
m_require("app/views/scroll.js");
m_require("app/views/button.js");
m_require("app/views/span.js");
m_require("app/views/page.js");

var DropLayerView = (function (_super) {
    __extends(DropLayerView, _super);
    function DropLayerView() {
        _super.apply(this, arguments);
        this.cssClass = 'droplayer';
    }
    return DropLayerView;
})(ContainerView);

var ScrollSpacerView = (function (_super) {
    __extends(ScrollSpacerView, _super);
    function ScrollSpacerView() {
        _super.apply(this, arguments);
        this.cssClass = 'scroll-spacer';
    }
    return ScrollSpacerView;
})(ContainerView);

var OutlineScrollView = (function (_super) {
    __extends(OutlineScrollView, _super);
    function OutlineScrollView() {
        _super.apply(this, arguments);
    }
    OutlineScrollView.prototype.getChildTypes = function () {
        return {
            alist: OutlineRootView,
            scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    };
    return OutlineScrollView;
})(ScrollView);

var UndoButtonView = (function (_super) {
    __extends(UndoButtonView, _super);
    function UndoButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'undo-button';
    }
    return UndoButtonView;
})(ButtonView);
var RedoButtonView = (function (_super) {
    __extends(RedoButtonView, _super);
    function RedoButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'redo-button';
    }
    return RedoButtonView;
})(ButtonView);

var UndoButtonContainerView = (function (_super) {
    __extends(UndoButtonContainerView, _super);
    function UndoButtonContainerView() {
        _super.apply(this, arguments);
        this.anchorLocation = M.RIGHT;
        this.cssClass = 'undo-container';
    }
    UndoButtonContainerView.prototype.getChildTypes = function () {
        return {
            undobutton: UndoButtonView,
            redobutton: RedoButtonView
        };
    };
    return UndoButtonContainerView;
})(ContainerView);

var HeaderTitleView = (function (_super) {
    __extends(HeaderTitleView, _super);
    function HeaderTitleView() {
        _super.apply(this, arguments);
        this.anchorLocation = M.LEFT;
        this.value = "";
    }
    return HeaderTitleView;
})(SpanView);

var HeaderToolbarView = (function (_super) {
    __extends(HeaderToolbarView, _super);
    function HeaderToolbarView() {
        _super.apply(this, arguments);
        this.anchorLocation = M.TOP;
        this.cssClass = 'ui-header ui-bar-a ui-header-fixed slidedown';
    }
    HeaderToolbarView.prototype.getChildTypes = function () {
        return {
            title: HeaderTitleView,
            undobuttons: UndoButtonContainerView
        };
    };
    return HeaderToolbarView;
})(ToolbarView);

var DrawLayerView = (function (_super) {
    __extends(DrawLayerView, _super);
    function DrawLayerView() {
        _super.apply(this, arguments);
        this.cssClass = 'drawlayer';
    }
    return DrawLayerView;
})(ContainerView);

var PanelGridView = (function (_super) {
    __extends(PanelGridView, _super);
    function PanelGridView() {
        _super.apply(this, arguments);
        this.cssClass = "scroll-container";
        this.panelManager = $D.PanelManager;
        this.layout = TWO_COLUMNS;
    }
    PanelGridView.prototype.getChildTypes = function () {
        return {
            scroll1: PanelOutlineView,
            scroll2: PanelOutlineView
        };
    };
    return PanelGridView;
})(GridView);

var LeftButtonView = (function (_super) {
    __extends(LeftButtonView, _super);
    function LeftButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'left-button';
        this.value = '<';
    }
    return LeftButtonView;
})(SpanView);
var RightButtonView = (function (_super) {
    __extends(RightButtonView, _super);
    function RightButtonView() {
        _super.apply(this, arguments);
        this.cssClass = 'right-button';
        this.value = '>';
    }
    return RightButtonView;
})(SpanView);

var PageContentView = (function (_super) {
    __extends(PageContentView, _super);
    function PageContentView() {
        _super.apply(this, arguments);
        this.cssClass = "grid-wrapper";
    }
    PageContentView.prototype.getChildTypes = function () {
        return {
            leftbutton: LeftButtonView,
            rightbutton: RightButtonView,
            grid: PanelGridView
        };
    };
    return PageContentView;
})(ContainerView);
var HiddenDivView = (function (_super) {
    __extends(HiddenDivView, _super);
    function HiddenDivView() {
        _super.apply(this, arguments);
        this.cssClass = 'hiddendiv';
    }
    return HiddenDivView;
})(ContainerView);

var MyPageView = (function (_super) {
    __extends(MyPageView, _super);
    function MyPageView() {
        _super.apply(this, arguments);
        this.cssClass = 'ui-page ui-body-c ui-page-header-fixed ui-page-active ui-sortable';
        this.postRender = $D.postRender;
    }
    MyPageView.prototype.getChildTypes = function () {
        return {
            hiddendiv: HiddenDivView,
            header: HeaderToolbarView,
            content: PageContentView,
            drawlayer: DrawLayerView
        };
    };
    return MyPageView;
})(PageView);
//# sourceMappingURL=subviews.js.map
