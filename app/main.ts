///<reference path="views/View.ts"/>
///<reference path="PanelManager.ts"/>
///<reference path="keyboard.ts"/>
///<reference path="events/Router.ts"/>
///<reference path="util/fixFontSize.ts"/>
///<reference path="actions/actionManager.ts"/>
///<reference path="validate.ts"/>

m_require("app/PanelManager.js");
m_require("app/views/DiathinkView.js");
m_require("app/views/PanelView.js");
m_require("app/events/Router.js");
m_require("app/actions/actionManager.js");

var nav = navigator;
if (nav.userAgent.match(/iPhone/i) ||
    nav.userAgent.match(/iPad/i) ||
    nav.userAgent.match(/iPod/i)) {

    if (!nav.standalone) {
        $D.isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
        var OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
        $D.OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;
        // show message & abort application.
    }
}
$D.is_touch_device = 'ontouchstart' in document.documentElement;


$D.data = new $D.OutlineNodeCollection([
    {text: "Test 1",
        children: [
            {text: "Child 1 1",
                children: [
                    {text: "Child 1 1 - 1"}
                ]},
            {text: "Child 1 2"}
        ]},
    {text: "Test 2"}
]);

$(function () {
    $D.router = new Router(document.body);
    new DiathinkView({});
// Update Panel-Manager with grid-panels
    PanelManager.initFromDOM((<DiathinkView>View.currentPage).content.grid);
    View.currentPage.render();
    var grid = (<DiathinkView>View.currentPage).content.grid, grid_n = 1;
    while (grid['scroll' + String(grid_n)]) {
        grid['scroll' + String(grid_n)].cachePosition();
        ++grid_n;
    }
    fixFontSize();
    ActionManager.refreshButtons();
    $D.updatePanelButtons();
    $D.keyboard = new keyboardSetup();
    $D.keyboard.init({});
    setTimeout(function() {
        validate();
    }, 0);
});

