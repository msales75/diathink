///<reference path="View.ts"/>
m_require("app/views/View.js");
M.INPUT_TEXT = 'text';
M.INPUT_PASSWORD = 'password';
M.INPUT_NUMBER = 'number';
M.INPUT_TELEPHONE = 'tel';
M.INPUT_URL = 'url';
M.INPUT_EMAIL = 'email';
M.INPUT_TIME = 'time';
M.INPUT_DATE = 'date';
M.INPUT_MONTH = 'month';
M.INPUT_WEEK = 'week';
M.INPUT_DATETIME = 'datetime';
M.INPUT_DATETIME_LOCAL = 'datetime-local';
class TextAreaView extends View {
    name = null;
    initialText = '';
    isGrouped = NO;
    isEnabled = true;
    lastWidth:number = null;
    lastFont:number = null;
    hiddenDiv:JQuery = null;
    parentDiv:JQuery = null;
    lineHeight:number = null;
    paddingX:number = null;
    paddingY:number = null;
    lastValue:string = null;
    value:string;
    elem:HTMLTextAreaElement;
    /**
     * This property specifies the input type of this input field. Possible values are:
     *
     *   - M.INPUT_TEXT --> text input (default)
     *   - M.INPUT_PASSWORD --> password
     *   - M.INPUT_NUMBER --> number
     *   - M.INPUT_TELEPHONE --> tel
     *   - M.INPUT_URL --> url
     *   - M.INPUT_EMAIL --> email
     *
     * Note, that these types are not yet supported by all browsers!
     */
    inputType = M.INPUT_TEXT;
    useNativeImplementationIfAvailable = YES;
    hasAsteriskOnLabel = NO;
    cssClassForAsterisk = null;

    render() {
        var html = '';
        html = this.secure(this.value ? this.value: '');
        if ($D.is_android) {
            html = ' '+html;
        }
        this._create({
            type: 'textarea',
            classes: this.cssClass,
            html: html
        });
        this.elem.setAttribute('cols', '40');
        this.elem.setAttribute('rows', '1');
        this.elem.setAttribute('name', this.id);
        if (this.initialText) {
            this.elem.setAttribute('placeholder', this.initialText);
        }
        if (!this.isEnabled) {
            this.elem.setAttribute('disabled', 'disabled');
        }
        // divide setPosition into two pieces while fixing height
        this.positionChildren(null); // after dimensions are set
        this.setPosition();

        // todo: check if this is true/correct?
        /*
         if (this.elem && (typeof this.elem.autocorrect !== "undefined") &&
         !$.support.touchOverflow ) {
         this.elem.setAttribute( "autocorrect", "off" );
         this.elem.setAttribute( "autocomplete", "off" );
         }
         */
        return this.elem;
    }
    layoutDown() {
        if (!this.layout) {this.layout= {};}
        this.layout.top = 0;
        this.layout.left = 0;
        this.layout.width = this.parentView.layout.width;
    }
    getValue() {
        if ($D.is_android) {
            this.value = this.elem.value.substr(1);
        } else {
            this.value = this.elem.value;
        }
        return this.value;
    }

    setValue(val) {
        this.value = val;
        if ($D.is_android) {val = ' '+val;}
        var htmlval = View.escapeHtml(val);
        this.elem.value = val;
        this.elem.innerHTML = htmlval;
        return this;
    }
    setValueFromDOM() {
        if ($D.is_android) {
            this.value = this.elem.value.substr(1);
        } else {
            this.value = this.elem.value;
        }
    }


    // trigger-events:
    //   keyup change input paste
    //   mobile.document pagechange, mobile.window load
    fixHeight() {
        // don't execute before element is visible, e.g.
        //   on startup before calling resize()
        // if ($(elem).css('visibility') !== 'visible') {return;}
        /*
         if (this.value.length<4) {
         // todo: could optimize without looking at width here.
         this.lineHeight = Number(hiddendiv.css('line-height').replace(/px/,''));
         this.padding = Number(thisel.css('padding-top').replace(/px/,'')) +
         Number(thisel.css('padding-bottom').replace(/px/,''));
         this.parentDiv.height(this.lineHeight + this.padding);
         return;
         } */

        if (this.value.length<5) { // quickly handle short lines
            if (!(<NodeTextWrapperView>this.parentView).listItems ||
                ((<NodeTextWrapperView>this.parentView).listItems.count===0)) {
                this.layout.height = Math.round(1.25*View.fontSize) +
                     2*Math.round(.3*View.fontSize);
                console.log("Quickly handling short line");
                return;
            }
        }
        var currentWidth = this.layout.width; // elem.clientWidth;
        var currentFont = View.fontSize; // $(elem).css('font-size');
       // if ((this.lastWidth === currentWidth) &&
          //  (this.lastFont === currentFont) &&
          //  (this.lastValue === this.value)) {
            // todo: check if links have changed, and provide escape here?
            // return;
        //}
        var hiddendiv = (<DiathinkView>(View.currentPage)).hiddendiv.elem;
        if (!hiddendiv) {
            console.log("Calling fixHeight before defining hiddendiv!!");
            return;
        }
        assert(this.parentView instanceof View, "ERROR: textedit parentDiv not found in fixHeight");
       // var parentdiv = this.parentView.elem;
        //if (this.lastFont !== currentFont) {
            this.lineHeight = Math.round(1.25*View.fontSize);
            this.paddingX = 2*Math.round(.18*View.fontSize);
            this.paddingY = 2*Math.round(.3*View.fontSize);
        //}
        var lineHeight = this.lineHeight;
        var paddingX = this.paddingX;
        var paddingY = this.paddingY;
        hiddendiv.style.width = String(currentWidth - paddingX - 1) + 'px';
        // console.log("Defined hiddendiv width = "+hiddendiv.style.width);

        if (this.parentView && (this.parentView instanceof NodeTextWrapperView) &&
            (<NodeTextWrapperView>this.parentView).listItems &&
            ((<NodeTextWrapperView>this.parentView).listItems.count>0)) {
            var content:string = this.value;
            if ($D.is_android) {
                content = ' '+content;
            }
            var links:LinkedList<NodeLinkView> = <LinkedList<NodeLinkView>>(<NodeTextWrapperView>this.parentView).listItems;
            var l:string;
            for (l=links.first(); l!==''; l=links.next[l]) {
                var link:NodeLinkView = <NodeLinkView>links.obj[l];
                var linktext:string = link.getText();
                if (links.next[l]==='') { // last one gets marker class
                    content += ' <span id="tmp_'+link.id+'" class="marker node-link">'+linktext+'</span>';
                } else {
                    content += ' <span id="tmp_'+link.id+'" class="node-link">'+linktext+'</span>';
                }
            }
            hiddendiv.innerHTML = content;
        } else {
            var lastchar = this.value.substr(this.value.length - 1, 1);
            var rest = this.value.substr(0, this.value.length - 1);
            if ($D.is_android) {
                rest = ' '+rest;
            }
            hiddendiv.innerHTML = this.secure(rest) + '<span class="marker">' +
                this.secure(lastchar) + '</span>';
        }


        var nlines = Math.round(($(hiddendiv).children('.marker').position().top / lineHeight) - 0.4) + 1;

        var height = nlines * lineHeight;
        // console.log("Got nlines = "+nlines+'; height = '+height+'; paddingY = '+paddingY);
        // if (Math.abs(parentdiv.clientHeight - height - paddingY) > 0.5) {
            this.layout.height = height + paddingY;
        // }

        if (this.parentView && (this.parentView instanceof NodeTextWrapperView) &&
            (<NodeTextWrapperView>this.parentView).listItems &&
            ((<NodeTextWrapperView>this.parentView).listItems.count>0)) {
            var children = hiddendiv.children;
            var i:number;
            if (children && (children.length>0)) {
                for (i=0; i<children.length; ++i) {
                    if (children[i].tagName.toLowerCase()==='span') {
                        var id:string = (<HTMLElement>children[i]).id;
                        if (id && id.substr(0,4)==='tmp_') {
                            var pos = $(children[i]).position();
                            pos.left = Math.round(pos.left);
                            pos.top = Math.round(pos.top);
                            (<NodeLinkView>View.get(id.substr(4))).setOffset(pos);
                        }
                    }
                }
            }
        }

        this.lastValue = this.value;
        this.lastWidth = currentWidth;
        this.lastFont = currentFont;
    }

    focus() {
        this.addClass('ui-focus');
        this.nodeView.addClass('ui-focus');
        return this;
    }

    blur() {
        var that:TextAreaView = this;
        this.removeClass('ui-focus');
        this.nodeView.removeClass('ui-focus');
        this.setValueFromDOM();
        ActionManager.schedule(function() {
            return Action.checkTextChange(that.id);
        });
        return this;
    }

    selectAllText() {
        console.log("Selecting all text");
        var range, selection, element = this.elem;
        if (window.getSelection) {
            selection = window.getSelection();
            if (selection.rangeCount>0) {
                range = selection.getRangeAt(0);
            } else {
                range = document.createRange();
            }
            range.selectNodeContents(element);
            // selection.removeAllRanges();
            // selection.addRange(range);
        }
        return this;
    }

    setSelection(selectionStart, selectionEnd) {
        var elem = this.elem;
        if (elem.setSelectionRange) {
            elem.focus();
            elem.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
        return this;
    }

    setCursor(pos:number) {
        console.log("Setting cursor/text-selection and focusing on "+this.id);
        this.setSelection(pos, pos);
        return this;
    }

    getSelection() {
        var elem = this.elem;
        return [elem.selectionStart, elem.selectionEnd];
    }
    validate() {
        super.validate();
        assert(this.nodeRootView !=  null,"TextAreaView cannot have null nodeRootView");
        assert(this.parentView.parentView.parentView instanceof NodeView,
            "TextAreaView " + this.id + " does not appear inside a ListItem View");
        assert(this.parentView.parentView.parentView.value != null,
            "TextAreaView " + this.id + " parent-parent has no value");
        assert(this.value === this.parentView.parentView.parentView.value.attributes.text,
            "TextAreaView " + this.id + " does not match value " + this.value + " with listitem-parent");
    }
}
