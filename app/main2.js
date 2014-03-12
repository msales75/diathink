
m_require("app/OutlineController.js");
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


$D.updatePanelButtons = function () {
    var content = View.getCurrentPage().content;
    var l = $('#' + content.leftbutton.id);
    var r = $('#' + content.rightbutton.id);
    var n, p;
    var allowleft = false, allowright = false;
    var PM = $D.PanelManager;
    if (PM.leftPanel !== '') {
        if (PM.prevpanel[PM.leftPanel] !== '') {
            allowleft = true;
        }
        for (n = 1, p = PM.leftPanel; p !== ''; ++n, p = PM.nextpanel[p]) {
            if (n > PM.panelsPerScreen) {
                allowright = true;
                break;
            }
        }
    }
    if (allowleft) {
        l.css('visibility', 'visible');
    } else {
        l.css('visibility', 'hidden');
    }
    if (allowright) {
        r.css('visibility', 'visible');
    } else {
        r.css('visibility', 'hidden');
    }
};

$D.redrawPanels = function (dir) {
    var p, n;
    var PM = $D.PanelManager;

    for (p = PM.leftPanel, n = 1;
         (p !== '') && (n <= PM.panelsPerScreen);
         ++n, p = PM.nextpanel[p]) {
        if (dir === 'right') {
            $D.redrawPanel(n, p, false);
        }
    }
    var n2 = n;
    for (; n2 <= PM.panelsPerScreen; ++n2) {
        $D.removePanel(n2);
    }
    if (dir === 'left') {
        --n;
        p = PM.prevpanel[p];
        for (;
            (p !== '') && (n >= 1);
            --n, p = PM.prevpanel[p]) {
            $D.redrawPanel(n, p, false);
        }
    }

    PM.updateRoots();
};

$D.redrawPanel = function (n, p, firsttime) {
    // should changeRoot it instead?
    var c;
    var PM = $D.PanelManager;
    var grid = View.getCurrentPage().content.grid;
    if (grid['scroll' + String(n)]) {
        c = grid['scroll' + String(n)].destroy(); // save context for this
        // panel destroy() respects outline graveyard.
        grid['scroll' + String(n)] = null;
    } else {
        c = {
            prev: null,
            next: null,
            parent: $('#' + grid.id).children().get(n - 1)
        };
    }

    // create a new panel with right id, but wrong alist & breadcrumbs.
    grid['scroll' + String(n)] = new PanelView({
        id: p,
        parentView: grid,
        rootModel: null
    });
    grid['scroll' + String(n)].renderAt(c);

    // grid['scroll'+String(n)].theme();
    // grid['scroll'+String(n)].registerEvents();
    grid['scroll' + String(n)].changeRoot(
        PM.rootModels[p],
        PM.rootViews[p]
    );
};

$D.removePanel = function (n) {
    var grid = View.getCurrentPage().content.grid;
    grid['scroll' + String(n)].destroy();
    grid['scroll' + String(n)] = null;
};

$D.roundPixels = function() {
    var fontsize = Number($('body').css('font-size').replace(/px/, ''));
    var $textarea = $.stylesheet('li.ui-li .outline-header > div > textarea.outline-content.ui-input-text');
    $textarea.css({
        'min-height': String(Math.round(1.25 * fontsize)) + 'px',
        'line-height': String(Math.round(1.25 * fontsize)) + 'px',
        padding: String(Math.round(0.15 * fontsize)) + 'px ' + String(Math.round(0.18 * fontsize)) + 'px'
    });
    var $textareaParent = $.stylesheet('li.ui-li .outline-header > div.outline-content_container');
    $textareaParent.css({
        'height': String(Math.round(1.55 * fontsize)) + 'px'
    });
    var $hiddendiv = $.stylesheet('div.hiddendiv');
    $hiddendiv.css({
        'min-height': String(Math.round(1.25 * fontsize)) + 'px',
        'line-height': String(Math.round(1.25 * fontsize)) + 'px'
    });
    var $hiddendivSpan = $.stylesheet('div.hiddendiv > span.marker');
    $hiddendivSpan.css({
        'line-height': String(Math.round(1.25 * fontsize)) + 'px'
    });
}

$D.postRender = function () {
    // todo: here, set the outline-controller to correct collection
    var id = View.currentPage.id;
    var grid = this.content.grid;
    var grid_n = 1;
    while (grid['scroll' + String(grid_n)]) {
        grid['scroll' + String(grid_n)].outline.alist.postRender();
        ++grid_n;
    }
    $D.roundPixels();

    $D.ActionManager.refreshButtons();
    $D.updatePanelButtons();
    $D.keyboard = new keyboardSetup({});
    $D.keyboard.init();

};

$(function () {
    $D.router = new Router(document.body);
    new DiathinkView({});
// Update Panel-Manager with grid-panels
    $D.PanelManager.initFromDOM(View.currentPage.content.grid);
    View.currentPage.render();
    setTimeout(function() {
        $D.validateMVC();
    }, 0);
});

