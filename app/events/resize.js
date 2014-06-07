///<reference path="../views/View.ts"/>
// correct height of scrollview on resize
window.addEventListener("orientationchange", function () {
    // Announce the new orientation number
    $(window).resize();
}, false);

$(window).resize(function () {
    // avoid class-based jQuery selections
    // only call fixHeight if scroll-container width or font-size has changed
    // only update margins if font-size has changed
    // only update scroll-heights if height has changed
    var newHeight, newWidth, newFont, changeHeight, changeWidth, changeFont;
    console.log("Processing resize event");

    if (!($D.ready === 1)) {
        return;
    }
    if ($D.router.dragMode === 2) {
        return;
    }

    /*
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
    //return; // todo: horrible for performance to comment this out - need cached dimensions
    }
    */
    // get scroll-container
    ActionManager.schedule(function () {
        var page = View.getCurrentPage();
        if (!page) {
            return;
        }
        var grid = page.content.gridwrapper.grid;
        var oldCols = grid.numCols;
        page.content.gridwrapper.grid.updateCols();
        var newCols = grid.numCols;
        grid.numCols = oldCols; // don't stick to change yet

        if (newCols > oldCols) {
            // check if empty panels would be created to the right if we preserve leftPanel
            console.log("Change in columns from " + oldCols + " to " + newCols);
            var p = grid.listItems.first();
            var i;
            for (i = 0; (i < newCols) && (p !== ''); ++i) {
                p = grid.value.next[p];
            }
            if (i < newCols) {
                // we need (newCols-i) slide actions
                var j;
                for (j = 0; j < newCols - i; ++j) {
                    ActionManager.schedule(function () {
                        if (grid.listItems.first() === grid.value.first()) {
                            return null;
                        }
                        console.log("Calling Slide right for resize");
                        return {
                            actionType: SlidePanelsAction,
                            name: 'Slide right for resize',
                            direction: 'right',
                            focus: false
                        };
                    });
                }
            }
        }
        ActionManager.schedule(function () {
            grid.numCols = newCols;
            console.log("Resizing with numCols = " + newCols);
            if (oldCols > newCols) {
                console.log("Clipping right panel for column-change");
                if (grid.listItems.count > newCols) {
                    grid.clipPanel('right');
                }
            } else if (oldCols < newCols) {
                console.log("Filling right panel for column-change");
                grid.fillPanel('right', true);
            }
            View.currentPage.resize();
            if (View.focusedView != null) {
                if (!View.viewList[View.focusedView.id]) {
                    View.focusedView = null;
                }
            }
            grid.updatePanelButtons();
            return null;
        });
        return null;
    });
    /*
    var scrollContainer = $('#'+page.content.gridwrapper.grid.id);
    if (scrollContainer.length===0) {return;}
    var panels = page.content.gridwrapper.grid.listItems;
    var m:string;
    var scrollviews=[];
    var scrollspacers=[];
    for (m=panels.first();m!=='';m=panels.next[m]) {
    scrollviews.push(panels.obj[m].outline.elem);
    scrollspacers.push(panels.obj[m].outline.scrollSpacer.elem);
    }
    var scrollViews = $(scrollviews);
    var scrollSpacer = $(scrollspacers);
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
    
    View.currentPage.content.gridwrapper.grid.resize();
    
    var scrollViewOffset = scrollViews.offset().top - headerHeight;
    scrollViews.height(height-mtop-mbottom-scrollViewOffset);
    scrollSpacer.height(Math.round(height*0.8));
    
    //if (changeWidth || changeFont) {
    (function() {
    $('textarea').each(function() {
    (<TextAreaView>View.get($(this).attr('id'))).fixHeight();
    });
    })();
    // }
    
    $D.lastHeight = newHeight;
    $D.lastWidth = newWidth;
    $D.lastFont = newFont;
    */
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
//# sourceMappingURL=resize.js.map
