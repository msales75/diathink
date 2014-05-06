///<reference path="views/View.ts"/>
///<reference path="keyboard.ts"/>
///<reference path="events/Router.ts"/>
///<reference path="util/fixFontSize.ts"/>
///<reference path="actions/ActionManager.ts"/>
///<reference path="validate.ts"/>
m_require("app/views/DiathinkView.js");
m_require("app/views/PanelView.js");
m_require("app/events/Router.js");
m_require("app/actions/ActionManager.js");

var nav = navigator;
if (nav.userAgent.match(/iPhone/i) || nav.userAgent.match(/iPad/i) || nav.userAgent.match(/iPod/i)) {
    if (!nav.standalone) {
        $D.isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
        var OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
        $D.OSVersion = OSVersion && OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;
        // show message & abort application.
    }
}
$D.is_touch_device = 'ontouchstart' in document.documentElement;
OutlineNodeModel.root = new OutlineNodeModel();
OutlineNodeModel.root.fromJSON({
    text: 'Home',
    children: [
        {
            text: "Test 1",
            children: [
                {
                    text: "Child 1 1",
                    children: [
                        {
                            text: "Child 1 1 - 1",
                            links: ["m_6"]
                        }
                    ] },
                {
                    text: "Child 1 2"
                }
            ] },
        {
            text: "Test 2",
            links: ["m_1", "m_3"]
        }
    ]
});
$(function () {
    $D.router = new Router(document.body);
    new DiathinkView({});
    var grid = View.currentPage.content.gridwrapper.grid;
    grid.numCols = 2;
    grid.append(new PanelView({ parentView: grid, value: OutlineNodeModel.root }));
    grid.append(new PanelView({ parentView: grid, value: OutlineNodeModel.root }));
    View.currentPage.render();
    var panels = grid.listItems;
    var p;
    for (p = panels.first(); p !== ''; p = panels.next[p]) {
        View.get(p).cachePosition();
    }
    fixFontSize();
    ActionManager.refreshButtons();
    grid.updatePanelButtons();
    grid.resize();
    $D.keyboard = new keyboardSetup();
    $D.keyboard.init({});
    setTimeout(function () {
        validate();
    }, 0);
});
//# sourceMappingURL=main.js.map
