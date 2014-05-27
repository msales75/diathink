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
interface NavigatorD extends Navigator {
    standalone?:boolean;
}
var nav:NavigatorD = navigator;
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
                    ]},
                {
                    text: "Child 1 2"
                }
            ]},
        {
            text: "Test 2",
            links: ["m_1","m_3"]
        }
    ]
});

$D.is_touch_device = 'ontouchstart' in document.documentElement;
var is_mobile_ios = (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i));
is_mobile_ios != null ? this.is_mobile_ios = true : this.is_mobile_ios = false;
$D.is_android= $D.is_touch_device && (! is_mobile_ios); // good enough for now...
$D.is_android = true; // for debugging

$(window).bind('load', function() {



        $D.router = new Router(document.body);
        new DiathinkView({});
        var grid:PanelGridView= View.currentPage.content.gridwrapper.grid;
        grid.updateCols();
        grid.append(new PanelView({parentView: grid, value: OutlineNodeModel.root}));
        grid.append(new PanelView({parentView: grid, value: OutlineNodeModel.root}));
        View.currentPage.prerender();
        setTimeout(function() { // give font time to load before rendering
            View.currentPage.render();
            var panels:LinkedList<PanelView> = grid.listItems;
            var p:string;
            for (p = panels.first(); p !== ''; p = panels.next[p]) {
                (<PanelView>View.get(p)).cachePosition();
            }
            fixFontSize();
            ActionManager.refreshButtons();
            grid.updatePanelButtons();
            // grid.resize();
            // $D.keyboard = new keyboardSetup();
            // $D.keyboard.init({});
            setTimeout(function() {
                // validate();
            }, 0);
        }, 50); // todo: don't hard-code 50ms load time for font
});

