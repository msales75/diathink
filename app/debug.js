$(function () {
    $D.log = function() {};
    return;
/*    var lastwtop = 0, lastdtop = 0, lastbtop = 0, lastptop = 0, last1top = 0, last2top = 0;
    var scroll = setInterval(function() {
        if ($(window).scrollTop()!=lastwtop) {
            // clearInterval(scroll);
            $D.log(["debug"],"window scrolltop = "+$(window).scrollTop());
            lastwtop = $(window).scrollTop();
        }
        if ($(document).scrollTop()!=lastdtop) {
            // clearInterval(scroll);
            $D.log(["debug"],"document scrolltop = "+$(document).scrollTop());
            lastdtop = $(document).scrollTop();
        }
        if ($('body').scrollTop()!=lastbtop) {
            // clearInterval(scroll);
            $D.log(["debug"],"body scrolltop = "+$('body').scrollTop());
            lastbtop = $('body').scrollTop();
        }
        if ($D.app && $D.app.pages) {
            for (var i in $D.app.pages) {
                var pid = $D.app.pages[i].id;
                if ($('#'+pid).scrollTop()!=lastptop) {
                    // clearInterval(scroll);
                    $D.log(["debug"],"page "+pid+" scrolltop = "+$('#'+pid).scrollTop());
                }
            }
        }

        $('.ui-scrollview-clip').each(function() {
            if ($(this).scrollTop()!=0) {
                clearInterval(scroll);
                $D.log(['debug'],"ui-scrollable scrolltop= "+$(this).scrollTop());
            }
        });
    }, 200);
*/
    function randomString(size) {
        if (!size) {
            size = 12;
        }
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charlist = [];
        for (var i = 0; i < size; i++)
            charlist.push(possible.charAt(Math.floor(Math.random() * possible.length)));
        return charlist.join('');
    }

    var debugopen = $('<div></div>').attr('id', 'debugopen').appendTo('body');
    var debuglog = $('<div></div>').attr('id', 'debuglog').appendTo('body');

    /*
     Debugger console:

     Keyword-tagging
     buttons for include/exclude
     keywords for Warning/Error/validation
     Indenting opening/closing
     calculate time-diff
     Allow scrolling of log
     Record timestamp, target, state-parameters
     Exclude log-events

     */


    var logCount = 0;
    var log = [];
    var tags = {};
    var blocks = {'main':log};
    var logstack = ['main']; // list of references to the cursor of each nested layer of the logs

    $D.logReset = function () {
        log = [];
        tags = {};
        blocks = {'main':log};
        logstack = ['main'];
        logCount = 0;
    };

    $D.logCount = function () {
        return logCount;
    };

    $D.logStart = function (t, mesg, id) {
        if (!id) {
            id = randomString(16);
        }
        if (blocks[id] !== undefined) {
            $D.log(['error', 'log'],
                "Same start-id given twice for logStart message: ");
            $D.log(t, mesg);
            return null;
        }
        var newblock = [];
        blocks[id] = newblock;
        logstack.push(id);
        $D.log(t, mesg, id);
        return id;
    };

    $D.logEnd = function (t, mesg, id) {
        if (blocks[i] === undefined) {
            $D.log(['error', 'log'],
                "logEnd called without matching logStart: ");
            $D.log(t, mesg);
            return null;
        }
        logstack.pop();
        $D.log(t, mesg, id);
    };

    $D.log = function (t, mesg, id) {
        var now = (new Date()).getTime();
        for (var i = 0; i < t.length; ++i) {
            tags[t[i]] = true;
        }
        var lastcursor = blocks[logstack[logstack.length - 1]];
        ++logCount;
        if (id) {
            lastcursor.push([logCount, now, t, mesg, id]);
        } else {
            lastcursor.push([logCount, now, t, mesg]);
        }
        // console.log('DEBUG: '+mesg);
    };

    function drawlog(tags, elem, blockid) {
        // loop over block items
        var block = blocks[blockid];
        for (var i = 0; i < block.length; ++i) {
            var el = $('<li></li>');
            var n = block[i][0];
            var now = block[i][1];
            var t = block[i][2];
            var mesg = block[i][3];
            // check if t is in tags?
            el.html('<span>' + String(n) + String(now) + mesg + '</span><ul></ul>');
            el.appendTo(elem);
            if (block[i].length > 4) {
                showlog(tags, el.children('ul'), block[i][4]);
            }
        }
    }

// todo: cluster lots of similar/mousemove events

    $D.showlog = function () {
        $('#debuglog').html('');
        $('<div></div>').addClass('kill').appendTo('#debuglog');
        drawlog({}, '#debuglog', 'main');
        $('#debuglog').css('display', 'block');
    }

    $('#debuglog').on('tap', '.kill', function () {
        $('#debuglog').css('display', 'none');
    });

    $('#debugopen').tap(function () {
        $D.showlog();
    });

/*
    $(window).error(function(e) {
        console.log("throwing error:");
        console.log(e);
        $D.log(['error','browser'],"Uncaught exception");
    });
*/

// $('.ui-header').css('position', 'fixed');

    /*
    $(window).click(function (e) {
        if (e.target && e.target.nodeName && e.target.nodeName.toUpperCase() === 'TEXTAREA') {
            setTimeout(function () {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
            }, 0);
        }
    });
*/

    // bind to textarea, window and document
/*
    $('textarea').bind('focus blur mousedown mouseup click tap touchstart touchend',
        function (e) {
            $D.log([], "textarea event "+e.type+" with textarea-start="+e.target.selectionStart);
        });

    $(window).bind('focus blur mousedown mouseup click tap touchstart touchend',
        function (e) {
            if (($(e.target).closest('#debuglog').length > 0) || ($(e.target).closest('#debugopen').length>0)) {
                return;
            }

            if (!e.target || !e.target.nodeName) {
                $D.log([],"Window event " + e.type);
                return;
            }
            if (e.target.nodeName.toUpperCase() === 'TEXTAREA') {
                $D.log([],"Window event " + e.type + " with textarea-start=" + e.target.selectionStart);
                if (e.type === 'click') {
                    setTimeout(function () {
                        window.scrollTo(0, 0);
                        document.body.scrollTop = 0;
                        $D.log([],"Set scroll to 0 by window click-event");
                    }, 0);
                }
            } else {
                $D.log([],"Window event " + e.type);
            }
        });


    $(document).bind('focus blur mousedown mouseup click tap touchstart touchend',
        function (e) {
            if (($(e.target).closest('#debuglog').length > 0) || $(e.target).hasClass('kill')) {
                return;
            }

            if ((e.type == 'touchstart')) {
                // e.preventDefault();
                // e.stopPropagation();
            } else {
                if (e.type == 'tap') { // can we get the coordinates?

                }
                if (e.type === 'mousedown') {
                    // e.stopPropagation();
                    // e.preventDefault();
                    // can't lose header at top when scrolling - maybe try static?

                    // if not clicking on a textarea, suppress propagation,
                    //   but must allow mousedown to get textarea position,
                    //   then re-calling focus
                }
                // alert("Window-event of type "+e.type);
            }
        });
*/

});
