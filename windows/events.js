///<reference path="../app/foundation/view.ts"/>
///<reference path="./model2.ts"/>

function assert(test, mesg) {
}

var LinkedList = (function () {
    function LinkedList() {
    }
    return LinkedList;
})();

var Router = (function () {
    function Router(rootElement, controllers) {
        this.rootElement = rootElement;
        this.controllers = controllers;
        this.dragMode = false;
        this.scrollMode = false;
        this.dragStart = null;
        this.hoverTimer = null;
        var is_touch_device = 'ontouchstart' in document.documentElement;
        var press = is_touch_device ? 'touchstart' : 'mousedown';
        var self = this;
        Router.bind(rootElement, press, function (e) {
            var preventDefault = true;
            var view = View.getFromElement(Router.getTarget(e));
            self.scrollMode = false;
            self.dragMode = false;

            if (view.handleView != null) {
                self.dragMode = true;
                self.dragStart.handler = view.handleView.dragStart();
            } else if (view.scrollView != null) {
                self.scrollMode = true;
                self.dragStart.handler = view.scrollView.scrollStart();
                if (view.nodeView != null) {
                    if (View.focused) {
                        if (View.focused !== view.nodeView) {
                            View.focused.header.name.text.blur(); // call view.blur()
                        }
                    }
                    View.focused = view.nodeView;
                    View.focused.header.name.text.focus();
                    if (view.type === 'textedit') {
                        // need native event to capture cursor position, even if we're not focusing
                        preventDefault = false;
                        this.hidingFocus = view; // todo: make sure we don't need earlier delayed-focus list?
                        view.removeClass('hide-selection');
                    } else {
                        view.nodeView.header.name.text.addClass('hide-selection').selectText().focus().selectText();
                    }
                }
            }
            if (preventDefault) {
                e.preventDefault();
            }
        });
        var move = is_touch_device ? 'touchmove' : 'mousemove';
        Router.bind(rootElement, move, function (e) {
            if (!self.dragMode && !self.scrollMode) {
                return;
            }
            if (self.dragMode) {
                self.dragStart.handler.drag();
            } else if (self.scrollMode) {
                self.dragStart.handler.scroll();
            }
        });

        // handle mouse-only hover-effects for nodes
        if (!is_touch_device) {
            Router.bind(rootElement, 'mouseover', function (e) {
                var view = View.getFromElement(Router.getTarget(e));
                var node = view.nodeView;
                if (!node) {
                    return;
                }
                if (self.hoverTimer) {
                    clearTimeout(self.hoverTimer);
                }
                if (node !== View.hovering) {
                    View.hovering.removeClass('ui-btn-hover-c');
                }
                node.addClass('ui-btn-hover-c');
                View.hovering = view.nodeView;
            });
            Router.bind(rootElement, 'mouseout', function (e) {
                var view = View.getFromElement(Router.getTarget(e));
                var node = view.nodeView;
                if (!node) {
                    return;
                }
                if (self.hoverTimer) {
                    clearTimeout(self.hoverTimer);
                }
                if (view.nodeView === View.hovering) {
                    self.hoverTimer = setTimeout(function () {
                        node.removeClass('ui-btn-hover-c');
                    }, 500);
                }
            });
        }

        var release = is_touch_device ? 'touchend' : 'mouseup';
        Router.bind(rootElement, release, function (e) {
            var view = View.getFromElement(Router.getTarget(e));
            var change = false;
            if (self.scrollMode) {
                change = self.dragStart.handler.scrollStop();
            }
            if (self.dragMode) {
                change = self.dragStart.handler.dragStop();
            }

            // handle click, double-click
            if (!change && view.clickView) {
                if (view === self.dragStart.view) {
                    view.clickView.onClick();
                }
                // todo: check time/location against
            }
            // todo: preventDefault? if we clicked on text?
        });
        Router.bind(rootElement, 'keydown', function (e) {
            var keyDownCodes = { 8: 8, 9: 9, 13: 13 };
            if (!keyDownCodes[e.which]) {
                return true;
            }
            console.log('Acknowledging keydown, code=' + e.which);
            if ($D.ActionManager.queue.length === 0) {
                // retain browser-default behavior
                if ($D.focused) {
                    $D.handleKeydown($D.focused, e);
                    console.log('Handled keydown, code=' + e.which);
                } else {
                    console.log('Missed keydown, nothing focused');
                }
            } else {
                console.log('Delaying keydown, code=' + e.which);
                $D.ActionManager.schedule(function () {
                    if ($D.focused) {
                        e.simulated = true;
                        $D.handleKeydown($D.focused, e);
                        console.log('Handled delayed keydown, code=' + e.which);
                    } else {
                        console.log('Missed delayed keydown, nothing focused');
                    }
                    return null;
                });
                e.preventDefault();
            }
            e.stopPropagation();
            // possibly change focus
        });
        Router.bind(rootElement, 'keypress', function (e) {
            // if textarea is focused
            console.log('Acknowledging keypress, char="' + String.fromCharCode(e.charCode) + '"');
            if ($D.ActionManager.queue.length === 0) {
                // retain browser-default behavior
                if ($D.focused) {
                    $D.handleKeypress($D.focused, e);
                    console.log('Handled keypress, char=' + String.fromCharCode(e.charCode));
                } else {
                    console.log('Lost keypress with nothing focused');
                }
            } else {
                console.log("Delaying keypress, char=" + String.fromCharCode(e.charCode));
                $D.ActionManager.schedule(function () {
                    if ($D.focused) {
                        e.simulated = true;
                        $D.handleKeypress($D.focused, e);
                        console.log('Handled delayed keypress, char=' + String.fromCharCode(e.charCode));
                    } else {
                        console.log('Lost keypress with nothing focused');
                    }
                    return null;
                });
                e.preventDefault();
            }
            e.stopPropagation();
        });
        Router.bind(rootElement, 'keyup', function (e) {
            // todo: keyup catch a mobile paste?
            if (View.focused != null) {
                View.focused.setValueFromDOM();
                View.focused.themeUpdate();
            }
        });
        Router.bind(window, 'load', function (e) {
            Router.resize();
        });
        // todo: swiping and scroll-wheel
    }
    Router.getTarget = function (e) {
        if (e.target) {
            if (e.target.nodeType === 3) {
                // Support: Chrome 23+, Safari?
                return e.target.parentNode;
            }
            return e.target;
        }
        if (e.srcElement) {
            return e.srcElement;
        }
        return null;
    };
    Router.getPosition = function (e) {
        var p = null;

        // Calculate pageX/Y if missing and clientX/Y available
        if (e.pageX != null) {
            p.x = e.pageX;
            p.y = e.pageY;
        } else if (e.clientX != null) {
            var eventDoc = Router.getTarget(e).ownerDocument || document;
            var doc = eventDoc.documentElement;
            var body = eventDoc.body;

            p.x = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
            p.y = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }
        return p;
    };

    Router.bind = function (elem, type, eventHandle) {
        if (elem.addEventListener) {
            elem.addEventListener(type, eventHandle, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, eventHandle);
        }
    };

    Router.prototype.resize = function () {
        // avoid class-based jQuery selections
        // only call fixHeight if scroll-container width or font-size has changed
        // only update margins if font-size has changed
        // only update scroll-heights if height has changed
        var newHeight, newWidth, newFont, changeHeight, changeWidth, changeFont;

        (function () {
            newHeight = $(document.body).height();
            newWidth = $(document.body).width();
            newFont = $(document.body).css('font-size');
            changeHeight = false;
            changeWidth = false;
            changeFont = false;
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
        var page = M.ViewManager.getCurrentPage();
        if (!page) {
            return;
        }
        var scrollContainer = $('#' + page.content.grid.id);
        if (scrollContainer.length === 0) {
            return;
        }
        var scrollViews = $([
            $('#' + page.content.grid.scroll1.outline.id).get(0),
            $('#' + page.content.grid.scroll2.outline.id).get(0)
        ]);
        var scrollSpacer = $([
            $('#' + page.content.grid.scroll1.outline.scrollSpacer.id).get(0),
            $('#' + page.content.grid.scroll2.outline.scrollSpacer.id).get(0)
        ]);
        var header = $('#' + page.header.id);

        // might header-height have changed?
        var headerHeight, height, mtop, mbottom;

        (function () {
            headerHeight = header.height();
            height = Math.round(newHeight - headerHeight);
            mtop = Number(scrollContainer.css('margin-top').replace(/px/, ''));
            mbottom = Number(scrollContainer.css('margin-bottom').replace(/px/, ''));
        })();

        if (changeHeight || changeFont) {
            scrollContainer.height(height - mtop - mbottom);
        }

        var scrollViewOffset = scrollViews.offset().top - headerHeight;
        scrollViews.height(height - mtop - mbottom - scrollViewOffset);
        scrollSpacer.height(Math.round(height * 0.8));

        if (changeWidth || changeFont) {
            (function () {
                $('textarea').each(function () {
                    M.ViewManager.getViewById($(this).attr('id')).fixHeight();
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
        var input = $('#'+M.ViewManager.getCurrentPage().hiddeninput.id);
        if (input && $D.focused) {
        input.css('left', Math.round($($D.focused).offset().left)+'px')
        .css('top', Math.round($($D.focused).offset().top)+'px')
        .width($($D.focused).width())
        .height($($D.focused).height());
        }
        */
    };
    Router.prototype.fixHeight = function () {
        var thisel = $('#' + this.id);

        // don't execute before element is visible, e.g.
        //   on startup before calling resize()
        if (thisel.css('visibility') !== 'visible') {
            return;
        }

        /*
        if (this.value.length<4) {
        // todo: could optimize without looking at width here.
        this.lineHeight = Number(hiddendiv.css('line-height').replace(/px/,''));
        this.padding = Number(thisel.css('padding-top').replace(/px/,'')) +
        Number(thisel.css('padding-bottom').replace(/px/,''));
        this.parentDiv.height(this.lineHeight + this.padding);
        return;
        } */
        var currentWidth = thisel[0].clientWidth;
        if (!(currentWidth > 0)) {
            return;
        }
        var currentFont = thisel.css('font-size');
        if ((this.lastWidth === currentWidth) && (this.lastFont === currentFont) && (this.lastValue === this.value)) {
            return;
        }

        if (!this.hiddenDiv) {
            this.hiddenDiv = $('.hiddendiv');
            if (this.hiddenDiv.length !== 1) {
                this.hiddenDiv = null;
                return;
            }
        }
        var hiddendiv = this.hiddenDiv;
        if (!this.parentDiv) {
            this.parentDiv = thisel.parent('div');
            if (this.parentDiv.length !== 1) {
                alert("ERROR: parentDiv not found");
            }
        }

        if (this.lastFont !== currentFont) {
            this.lineHeight = Number(hiddendiv.css('line-height').replace(/px/, ''));
            this.paddingY = Number(thisel.css('padding-top').replace(/px/, '')) + Number(thisel.css('padding-bottom').replace(/px/, ''));
            this.paddingX = Number(thisel.css('padding-left').replace(/px/, '')) + Number(thisel.css('padding-right').replace(/px/, ''));
        }
        var lineHeight = this.lineHeight;
        var paddingX = this.paddingX;
        var paddingY = this.paddingY;

        hiddendiv.css('width', String(currentWidth - paddingX - 1) + 'px');
        var lastchar = this.value.substr(this.value.length - 1, 1);
        var rest = this.value.substr(0, this.value.length - 1);
        hiddendiv.html($.escapeHtml(rest) + '<span class="marker">' + $.escapeHtml(lastchar) + '</span>');

        //hiddendiv.html($.escapeHtml(rest)+'<span class="marker">'+
        //    $.escapeHtml(lastchar).replace(/ /g, "&nbsp;").replace(/  /g, " &nbsp;") +'</span>');
        // cache lineHeight if font-size hasn't changed?
        // cache parent-div
        var nlines = Math.round((hiddendiv.children('span').position().top / lineHeight) - 0.4) + 1;
        var height = nlines * lineHeight;
        if (Math.abs(this.parentDiv[0].clientHeight - height - paddingY) > 0.5) {
            //console.log("Setting id="+thisel.parent('div').attr('id')+" to height "+
            //  height+" plus padding "+padding);
            this.parentDiv.css('height', String(height + paddingY) + 'px');
        }
        this.lastValue = this.value;
        this.lastWidth = currentWidth;
        this.lastFont = currentFont;
    };
    return Router;
})();
//# sourceMappingURL=events.js.map
