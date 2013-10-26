
jQuery.escapeHtml = function(text) {
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
    if ($('.scroll-container').length>0) {
        var height = Math.round($('body').height() -
            $('.ui-header').height());
        // keep margins on scroll-container
        var mtop = Number($('.scroll-container').css('margin-top').replace(/px/,''));
        var mbottom = Number($('.scroll-container').css('margin-bottom').replace(/px/,''));
        $('.scroll-container').height(height-mtop-mbottom);
        $('.ui-scrollview-clip').height(height-mtop-mbottom -
            ($('.ui-scrollview-clip').offset().top -
                $('.scroll-container').offset().top) );
        $('.scroll-spacer').height(Math.round(height*0.8));
        $('textarea').each(function() {
            M.ViewManager.getViewById($(this).attr('id')).fixHeight();
        });
    }
    // 10px for .scroll-container margin
    // Textarea position/size update

    // check only if the width or #panels or fontsize has changed?

    // move textarea to current location
    //    (near screen top if focus is working)
    /*
    var input = $('#'+M.ViewManager.getCurrentPage().hiddeninput.id);
    if (input && diathink.focused) {
        input.css('left', Math.round($(diathink.focused).offset().left)+'px')
            .css('top', Math.round($(diathink.focused).offset().top)+'px')
            .width($(diathink.focused).width())
            .height($(diathink.focused).height());
    }
    */
});
