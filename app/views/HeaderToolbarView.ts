///<reference path="View.ts"/>
m_require("app/views/ToolbarView.js");

class HeaderToolbarView extends ToolbarView {
    anchorLocation:any = M.TOP;
    cssClass = 'ui-header ui-bar-a ui-header-fixed slidedown';
    title:HeaderTitleView;
    undobuttons:UndoButtonContainerView;

    init() {
        this.childViewTypes = {
            title: HeaderTitleView,
            undobuttons: UndoButtonContainerView
        };
    }
}
