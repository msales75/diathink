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

m_require("app/views/container.js");
m_require("app/views/scroll.js");
m_require("app/views/button.js");
m_require("app/views/span.js");
m_require("app/views/page.js");

class DropLayerView extends ContainerView {
    cssClass = 'droplayer';
}

class ScrollSpacerView extends ContainerView {
    cssClass= 'scroll-spacer';
}

class OutlineScrollView extends ScrollView {
    alist:OutlineRootView;
    scrollSpacer:ScrollSpacerView;
    droplayer:DropLayerView;

    getChildTypes():ViewTypeList {
        return {
            alist: OutlineRootView,
            scrollSpacer: ScrollSpacerView,
            droplayer: DropLayerView
        };
    }
    /* updateScroll: $D.updateScroll, */ // called whenever scrollview changes
}

class UndoButtonView extends ButtonView {
    cssClass = 'undo-button';
}
class RedoButtonView extends ButtonView {
    cssClass = 'redo-button';
}

class UndoButtonContainerView extends ContainerView {
    anchorLocation:any = M.RIGHT; // for placement within toolbar (todo: phase this out)
    cssClass = 'undo-container';
    undobutton:UndoButtonView;
    redobutton:RedoButtonView;
    getChildTypes():ViewTypeList {
        return {
            undobutton:UndoButtonView,
            redobutton:RedoButtonView
        };
    }
}

class HeaderTitleView extends SpanView {
    anchorLocation:any = M.LEFT;
    value = "";
}

class HeaderToolbarView extends ToolbarView {
    anchorLocation:any = M.TOP;
    cssClass = 'ui-header ui-bar-a ui-header-fixed slidedown';
    title: HeaderTitleView;
    undobuttons: UndoButtonContainerView;
    getChildTypes():ViewTypeList {
        return {
            title: HeaderTitleView,
            undobuttons: UndoButtonContainerView
        };
    }
}

class DrawLayerView extends ContainerView {
    cssClass= 'drawlayer';
}

class PanelGridView extends GridView {
    cssClass = "scroll-container";
    panelManager:any = $D.PanelManager;
    layout = TWO_COLUMNS;
    scroll1:PanelOutlineView;
    scroll2:PanelOutlineView;
    getChildTypes():ViewTypeList {
        return {
            scroll1:PanelOutlineView,
            scroll2:PanelOutlineView
        };
    }
}

class LeftButtonView extends SpanView {
    cssClass='left-button';
    value='<';
}
class RightButtonView extends SpanView {
    cssClass='right-button';
    value='>';
}

class PageContentView extends ContainerView {
    cssClass = "grid-wrapper";
    leftbutton:LeftButtonView;
    rightbutton:RightButtonView;
    grid:PanelGridView;
    getChildTypes():ViewTypeList {
        return {
            leftbutton:LeftButtonView,
            rightbutton:RightButtonView,
            grid:PanelGridView
        };
    }
}
class HiddenDivView extends ContainerView {
    cssClass='hiddendiv';
}

class MyPageView extends PageView {
    cssClass = 'ui-page ui-body-c ui-page-header-fixed ui-page-active ui-sortable';
    postRender = $D.postRender;
    public hiddendiv : HiddenDivView;
    public header : HeaderToolbarView;
    public content : PageContentView;
    public drawlayer : DrawLayerView;
    getChildTypes():ViewTypeList {
        return {
            hiddendiv: HiddenDivView,
            header: HeaderToolbarView,
            content: PageContentView,
            drawlayer: DrawLayerView
        };
    }
}