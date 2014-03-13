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
     if (input && View.focusedView) {
     input.css('left', Math.round($(View.focusedView).offset().left)+'px')
     .css('top', Math.round($(View.focusedView).offset().top)+'px')
     .width($(View.focusedView).width())
     .height($(View.focusedView).height());
     }
     */
});
