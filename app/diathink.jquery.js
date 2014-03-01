
var escapeHtml = function(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

jQuery.fn.selectText = function() {
    var doc = document
        , element = this[0]
        , range, selection
        ;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    return this;
};

$.randomString = function(size) {
    if (!size) {
        size = 12;
    }
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charlist = [];
    for (var i = 0; i < size; i++)
        charlist.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    return charlist.join('');
};

function getTextNodesIn(node) {
    var textNodes = [];
    if (node.nodeType == 3) {
        textNodes.push(node);
    } else {
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; ++i) {
            textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
        }
    }
    return textNodes;
}

function setSelectionRange(el, start, end) {
    if (document.createRange && window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var textNodes = getTextNodesIn(el);
        var foundStart = false;
        var charCount = 0, endCharCount;

        for (var i = 0, textNode; textNode = textNodes[i++]; ) {
            endCharCount = charCount + textNode.length;
            if (!foundStart && start >= charCount
                && (start < endCharCount ||
                (start == endCharCount && i < textNodes.length))) {
                range.setStart(textNode, start - charCount);
                foundStart = true;
            }
            if (foundStart && end <= endCharCount) {
                range.setEnd(textNode, end - charCount);
                break;
            }
            charCount = endCharCount;
        }

        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(true);
        textRange.moveEnd("character", end);
        textRange.moveStart("character", start);
        textRange.select();
    }
}

jQuery.fn.disableSelection = function() {
        return this
            .attr('unselectable', 'on')
            .css('user-select', 'none')
            .on('selectstart', false);
};

jQuery.fn.mouseIsOver = function () {
    return $(this).parent().find($(this).selector + ":hover").length > 0;
};

function animStep(f, duration, start, end) {
    var frac = ((new Date()).getTime()-start)/duration;
    if (frac >= 1) {frac=1;}
    f(frac);
    if (frac===1) {
        end();
    } else {
        setTimeout(function() {
          animStep(f, duration, start, end);
        }, 20);
    }
}

jQuery.anim = function(f, duration, end) {
    // f receives a fractional argument between 0 and 1,
    //  indicating how close it is to the end.
    var start = (new Date()).getTime();
    setTimeout(function() {
        animStep(f, duration, start, end);
    }, 0);

},
// MS utility addition for finding a child/parent at a fixed-depth.
jQuery.fn.childDepth = function(n) {
        var i, that = this;
        for (i=0; i<n; ++i) {
            that = that.children(':first');
            if (that.length===0) {return that;}
        }
        return that;
};

jQuery.fn.parentDepth = function(n) {
        var i, that = this;
        for (i=0; i<n; ++i) {
            that = that.parent();
            if (that.length===0) {return that;}
        }
        return that;
};

// correct height of scrollview on resize
$(window).resize(function() {
    // avoid class-based jQuery selections
    // only call fixHeight if scroll-container width or font-size has changed
    // only update margins if font-size has changed
    // only update scroll-heights if height has changed
    var newHeight, newWidth, newFont, changeHeight, changeWidth, changeFont;

    (function() { // anonymous function for profiling
    newHeight = $(document.body).height();
    newWidth = $(document.body).width();
    newFont = $(document.body).css('font-size');
    changeHeight=false;
    changeWidth=false;
    changeFont=false;
    if (newHeight !== $D.lastHeight) {
        changeHeight = true;
    }
    if (newWidth !== $D.lastWidth) {
        changeWidth = true;
    }
    if (newFont !== $D.lastFont) {
        changeFont = true;
    }
    })();
    if (!changeHeight && !changeWidth && !changeFont) {
        return;
    }
    // get scroll-container
    var page = View.getCurrentPage();
    if (!page) {return;}
    var scrollContainer = $('#'+page.content.grid.id);
    if (scrollContainer.length===0) {return;}
    var scrollViews = $([
        $('#'+page.content.grid.scroll1.outline.id).get(0),
        $('#'+page.content.grid.scroll2.outline.id).get(0)
    ]);
    var scrollSpacer = $([
        $('#'+page.content.grid.scroll1.outline.scrollSpacer.id).get(0),
        $('#'+page.content.grid.scroll2.outline.scrollSpacer.id).get(0)
    ]);
    var header = $('#'+page.header.id);
    // might header-height have changed?

    var headerHeight, height, mtop, mbottom;

    (function() {
    headerHeight = header.height();
    height = Math.round(newHeight - headerHeight);
    mtop = Number(scrollContainer.css('margin-top').replace(/px/,''));
    mbottom = Number(scrollContainer.css('margin-bottom').replace(/px/,''));
    })();

    if (changeHeight || changeFont) {
        scrollContainer.height(height-mtop-mbottom);
    }

    var scrollViewOffset = scrollViews.offset().top - headerHeight;
    scrollViews.height(height-mtop-mbottom-scrollViewOffset);
    scrollSpacer.height(Math.round(height*0.8));

    if (changeWidth || changeFont) {
        (function() {
            $('textarea').each(function() {
                View.get($(this).attr('id')).fixHeight();
            });
        })();
    }

    $D.lastHeight = newHeight;
    $D.lastWidth = newWidth;
    $D.lastFont = newFont;
    // 10px for .scroll-container margin
    // Textarea position/size update

    // check only if the width or #panels or fontsize has changed?

    // move textarea to current location
    //    (near screen top if focus is working)
    /*
    var input = $('#'+View.getCurrentPage().hiddeninput.id);
    if (input && $D.focused) {
        input.css('left', Math.round($($D.focused).offset().left)+'px')
            .css('top', Math.round($($D.focused).offset().top)+'px')
            .width($($D.focused).width())
            .height($($D.focused).height());
    }
    */
});
