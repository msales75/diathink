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

function saveSnapshot() {
    (<JQueryStaticD>$).postMessage((<JQueryStaticD>$).toJSON({
        command: 'saveSnapshot',
        mesg: OutlineNodeModel.root.toJSON()
    }), 'http://diathink.com/', window.frames['forwardIframe']);
}
function createPage() {
    new DiathinkView({});
    var grid:PanelGridView = View.currentPage.content.gridwrapper.grid;
    grid.updateCols();
    grid.append(new PanelView({parentView: grid, value: OutlineNodeModel.root}));
    // grid.append(new PanelView({parentView: grid, value: OutlineNodeModel.root}));
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
}
$D.is_touch_device = 'ontouchstart' in document.documentElement;
var is_mobile_ios = (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i));
is_mobile_ios != null ? this.is_mobile_ios = true : this.is_mobile_ios = false;
$D.is_android = $D.is_touch_device && (!is_mobile_ios); // good enough for now...
$D.is_android = true; // for debugging
$(window).bind('load', function() {
    $D.sessionID = ActionManager.randomString(12);
    (<JQueryStaticD>$).receiveMessage(
        function(e) {
            var mesgObj = (<JQueryStaticD>$).secureEvalJSON(e.data);
            if (mesgObj.type === 'ready') {
                // load the app
                (<JQueryStaticD>$).postMessage((<JQueryStaticD>$).toJSON({
                    command: 'loadSnapshot',
                    mesg: ''
                }), 'http://diathink.com/', window.frames['forwardIframe']);
            } else if (mesgObj.type == "realtime") {
                // create new action and see if it's
                Action.remoteExec(mesgObj);
                console.log("Processing realtime message");
            } else if (mesgObj.type === 'save') {
                View.currentPage.header.message.setValue('Saved', 'action');
            } else if (mesgObj.type === 'load') {
                // destroy prior model?
                var i:string;
                if (View.currentPage) {
                    View.currentPage.destroy();
                    View.currentPage.elem.parentNode.removeChild(View.currentPage.elem);
                    View.currentPage = undefined;
                }
                for (i in OutlineNodeModel.modelsById) {
                    OutlineNodeModel.modelsById[i].attributes = {};
                    delete OutlineNodeModel.modelsById[i];
                }
                DeadView.viewList = {};
                OutlineNodeModel.root = new OutlineNodeModel({cid: mesgObj.cid});
                OutlineNodeModel.root.fromJSON(mesgObj);
                createPage();
            }
        }, function(d) {
            if ((d === 'http://diathink.com') || (d === 'http://diathink.com:8080')) {
                return true;
            } else {
                assert(false, "Invalid domain is trying to send a postMessage");
                return false;
            }
        });
    $(document.body).append('<iframe ' +
        'src="http://diathink.com:8080/comet.html?context=' +
        encodeURIComponent((<JQueryStaticD>$).toJSON({conversation_code: '99', fullpage_url: location.href})) +
        '" scrolling="no" frameborder="0" style="display:none;"></iframe>');
    $(document.body).append('<iframe name="forwardIframe" src="http://diathink.com/forward/#' + encodeURIComponent(location.href) +
        '" scrolling="no" frameborder="0" style="display:none;"></iframe>');
    $D.router = new Router(document.body);
});

