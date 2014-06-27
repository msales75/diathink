///<reference path="View.ts"/>
m_require("app/views/ToolbarView.js");

class HeaderToolbarView extends ToolbarView {
    parentView:DiathinkView;
    // anchorLocation:any = M.TOP;
    cssClass = 'ui-header ui-bar-a ui-header-fixed slidedown';
    title:HeaderTitleView;
    message:HeaderMessageView;
    searchbutton: SearchButtonView;
    undobuttons:UndoButtonContainerView;
    logo:LogoImageView;

    init() {
        this.childViewTypes = {
            title: HeaderTitleView,
            undobuttons: UndoButtonContainerView,
            message: HeaderMessageView,
            searchbutton: SearchButtonView,
            logo:LogoImageView
        };
    }
    layoutDown() {
        this.layout = {
            top: 0,
            left: 0,
            width: this.parentView.layout.width,
            height: 42
        };
    }
}
