var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
var TextAreaView = (function (_super) {
    __extends(TextAreaView, _super);
    function TextAreaView() {
        _super.apply(this, arguments);
        this.name = null;
        this.initialText = '';
        this.isGrouped = NO;
        this.isEnabled = true;
        this.hasMultipleLines = NO;
        this.lastWidth = null;
        this.lastFont = null;
        this.hiddenDiv = null;
        this.parentDiv = null;
        this.lineHeight = null;
        this.paddingX = null;
        this.paddingY = null;
        this.lastValue = null;
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
        this.inputType = M.INPUT_TEXT;
        this.useNativeImplementationIfAvailable = YES;
        this.hasAsteriskOnLabel = NO;
        this.cssClassForAsterisk = null;
    }
    TextAreaView.prototype.render = function () {
        var html = '';
        this._create({
            type: 'textarea',
            classes: this.cssClass,
            html: this.secure(this.value ? this.value : '')
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

        // $(this.elem).trigger('keyup');
        this.fixHeight(); // after dimensions are set

        // todo: check if this is true/correct?
        /*
        if (this.elem && (typeof this.elem.autocorrect !== "undefined") &&
        !$.support.touchOverflow ) {
        this.elem.setAttribute( "autocorrect", "off" );
        this.elem.setAttribute( "autocomplete", "off" );
        }
        */
        return this.elem;
    };

    TextAreaView.prototype.setValueFromDOM = function () {
        this.value = this.secure(this.elem.innerHTML);
    };

    // trigger-events:
    //   keyup change input paste
    //   mobile.document pagechange, mobile.window load
    TextAreaView.prototype.fixHeight = function () {
        // don't execute before element is visible, e.g.
        var elem = this.elem;

        //   on startup before calling resize()
        if (elem.style.visibility !== 'visible') {
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
        var currentWidth = elem.clientWidth;
        if (!(currentWidth > 0)) {
            return;
        }
        var currentFont = elem.style.fontSize;
        if ((this.lastWidth === currentWidth) && (this.lastFont === currentFont) && (this.lastValue === this.value)) {
            return;
        }
        var hiddendiv = (View.currentPage).hiddendiv.elem;
        assert(this.parentView instanceof ContainerView, "ERROR: textedit parentDiv not found in fixHeight");
        var parentdiv = this.parentView.elem;
        if (this.lastFont !== currentFont) {
            this.lineHeight = Number(hiddendiv.style.lineHeight.replace(/px/, ''));
            this.paddingY = Number(elem.style.paddingTop.replace(/px/, '')) + Number(elem.style.paddingBottom.replace(/px/, ''));
            this.paddingX = Number(elem.style.paddingLeft.replace(/px/, '')) + Number(elem.style.paddingRight.replace(/px/, ''));
        }
        var lineHeight = this.lineHeight;
        var paddingX = this.paddingX;
        var paddingY = this.paddingY;
        hiddendiv.style.width = String(currentWidth - paddingX - 1) + 'px';
        var lastchar = this.value.substr(this.value.length - 1, 1);
        var rest = this.value.substr(0, this.value.length - 1);
        hiddendiv.innerHTML = this.secure(rest) + '<span class="marker">' + this.secure(lastchar) + '</span>';
        var nlines = Math.round(($(hiddendiv).children('span').position().top / lineHeight) - 0.4) + 1;
        var height = nlines * lineHeight;
        if (Math.abs(parentdiv.clientHeight - height - paddingY) > 0.5) {
            parentdiv.style.height = String(height + paddingY) + 'px';
        }
        this.lastValue = this.value;
        this.lastWidth = currentWidth;
        this.lastFont = currentFont;
    };

    TextAreaView.prototype.focus = function () {
        this.addClass('ui-focus');
        this.parentView.parentView.parentView.addClass('ui-focus');
    };

    TextAreaView.prototype.blur = function () {
        var that = this;
        this.removeClass('ui-focus');
        this.parentView.parentView.parentView.removeClass('ui-focus');
        this.setValueFromDOM();
        $D.ActionManager.schedule(function () {
            return $D.Action.checkTextChange(that.id);
        });
    };
    return TextAreaView;
})(View);
//# sourceMappingURL=TextAreaView.js.map
