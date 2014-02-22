
m_require("app/foundation/view.js");

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

M.TextEditView = M.View.subclass({

        type: 'M.TextEditView',

        name: null,
        label: null,
        initialText: '',
        isGrouped: NO,
        isEnabled: true,
        hasMultipleLines: NO,

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
         *
         * @type String
         */
        inputType: M.INPUT_TEXT,

        numberOfChars: null,

        useNativeImplementationIfAvailable: YES,

        // MS: temporarily added keydown to list to suppress warnings
        hasAsteriskOnLabel: NO,
        cssClassForAsterisk: null,

        render: function() {
            this.computeValue();

            this.html = '';
            if(this.label) {
                this.html += '<label for="' + (this.name ? this.name : this.id) + '">' + this.label;
                if(this.hasAsteriskOnLabel) {
                    if(this.cssClassForAsterisk) {
                        this.html += '<span class="' + this.cssClassForAsterisk + '">*</span></label>';
                    } else {
                        this.html += '<span>*</span></label>';
                    }
                } else {
                    this.html += '</label>';
                }
            }

            // If the device supports placeholders use the HTML5 placeholde attribute else use javascript workarround
            var placeholder = '';
            if(this.initialText) {
                placeholder = ' placeholder="' + this.initialText + '" ';
            }

            if (this.hasMultipleLines) {
                this.html += '<textarea cols="40" rows="1" name="' +
                    (this.name ? this.name : this.id) + '" id="' + this.id + '"' +
                    this.style() + placeholder + '>' + (this.value ? this.value : '') +
                    '</textarea>';
            } else {
                var type = this.inputType;
                if(_.include(this.dateInputTypes, this.inputType) &&
                    !this.useNativeImplementationIfAvailable) {
                    type = 'text';
                }

                this.html += '<input ' + (this.numberOfChars ? 'maxlength="' + this.numberOfChars + '"' : '') + placeholder + 'type="' + type + '" name="' + (this.name ? this.name : this.id) + '" id="' + this.id + '"' + this.style() + ' value="' + (this.value ? this.value : '') + '" />';
            }

            return this.html;
        },

        // MS addition for focusing on textarea
        focus: function() {
            var focusedEl = $('#'+this.id);
            focusedEl.addClass( 'ui-focus' );
            var parentListId = M.ViewManager.getViewById(focusedEl.attr('id')).parentView.parentView.parentView.id;
            $('#'+parentListId).addClass('ui-focus');
        },
        blur: function() {
            // update value/listeners
            var that = this;
            var focusedEl = $('#'+this.id);
            focusedEl.removeClass( 'ui-focus' );
            var parentListId = M.ViewManager.getViewById(focusedEl.attr('id')).parentView.parentView.parentView.id;
            $('#'+parentListId).removeClass('ui-focus');
            this.setValueFromDOM();
            $D.ActionManager.schedule(function() {
                return $D.Action.checkTextChange(that.id);
            });
        },
        style: function() {
            var html = ' style="';
            if(this.isInline) {
                html += 'display:inline;';
            }
            html += '"';

            if(!this.isEnabled) {
                html += ' disabled="disabled"';
            }

            if(this.cssClass) {
                html += ' class="' + this.cssClass + '"';
            }

            return html;
        },

        // trigger-events:
        //   keyup change input paste
        //   mobile.document pagechange, mobile.window load
        fixHeight: function() {
            var thisel = $('#'+this.id);
            // don't execute before element is visible, e.g.
            //   on startup before calling resize()
            if (thisel.css('visibility') !== 'visible') {return;}

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
            if ((this.lastWidth===currentWidth)&&(this.lastFont===currentFont)&&(this.lastValue===this.value)) {
                return;
            }

            if (!this.hiddenDiv) {
                this.hiddenDiv = $('.hiddendiv');
                if (this.hiddenDiv.length!==1) {
                    this.hiddenDiv = null;
                    return;
                }
            }
            var hiddendiv = this.hiddenDiv;
            if (!this.parentDiv) {
                this.parentDiv = thisel.parent('div');
                if (this.parentDiv.length!==1) {
                    alert("ERROR: parentDiv not found");
                }
            }

            if (this.lastFont !== currentFont) {
                this.lineHeight = Number(hiddendiv.css('line-height').replace(/px/,''));
                this.paddingY = Number(thisel.css('padding-top').replace(/px/,'')) +
                    Number(thisel.css('padding-bottom').replace(/px/,''));
                this.paddingX = Number(thisel.css('padding-left').replace(/px/,'')) +
                    Number(thisel.css('padding-right').replace(/px/,''));
            }
            var lineHeight = this.lineHeight;
            var paddingX = this.paddingX;
            var paddingY = this.paddingY;


            hiddendiv.css('width',String(currentWidth-paddingX-1)+'px');
            var lastchar = this.value.substr(this.value.length-1,1);
            var rest = this.value.substr(0, this.value.length-1);
            hiddendiv.html($.escapeHtml(rest)+'<span class="marker">'+
                $.escapeHtml(lastchar) +'</span>');
            //hiddendiv.html($.escapeHtml(rest)+'<span class="marker">'+
            //    $.escapeHtml(lastchar).replace(/ /g, "&nbsp;").replace(/  /g, " &nbsp;") +'</span>');

            // cache lineHeight if font-size hasn't changed?
            // cache parent-div

            var nlines= Math.round((hiddendiv.children('span').position().top / lineHeight) - 0.4) + 1;
            var height = nlines * lineHeight;
            if (Math.abs(this.parentDiv[0].clientHeight-height-paddingY) > 0.5) {
                //console.log("Setting id="+thisel.parent('div').attr('id')+" to height "+
                  //  height+" plus padding "+padding);
                this.parentDiv.css('height', String(height+paddingY)+'px');
            }
            this.lastValue = this.value;
            this.lastWidth = currentWidth;
            this.lastFont = currentFont;
        },

        theme: function(elem) {
            // console.log('Theming textedit box')
            /* trigger keyup event to make the text field autogrow */
            if (!elem) {elem = $('#' + this.id)[0];}
            var jDom = $(elem);
            if (typeof this.value === 'string') { // MS edit for theming empty fields
                // jDom.trigger('keyup'); // .textinput2();
                if(!this.isEnabled){
                    // jDom.textinput2('disable');
                }
            }
            console.log('Adding container to parent-class');
            if (this.cssClass) {
                var firstclass = this.cssClass.split(' ')[0];
                /* add container-css class */
                jDom.parent().addClass(firstclass + '_container');
            }

            // jquery-mobile hack for correcting ios bug
            // todo: check if this is true/correct?
            if ( jDom[0] && (typeof jDom[0].autocorrect !== "undefined") && !$.support.touchOverflow ) {
                // Set the attribute instead of the property just in case there
                // is code that attempts to make modifications via HTML.
                jDom[0].setAttribute( "autocorrect", "off" );
                jDom[0].setAttribute( "autocomplete", "off" );
            }

            // this.fixHeight(); // dimensinos aren't defined until themeUpdate
        },
        themeUpdate: function() {
            this.fixHeight();
        },
        styleUpdate: function() {
            /* trigger keyup event to make the text field autogrow (enable fist, if necessary) */
            if(this.value) {
                $('#' + this.id).removeAttr('disabled');
                $('#'  + this.id).trigger('keyup');
            }

            if(this.isInline) {
                $('#' + this.id).attr('display', 'inline');
            } else {
                $('#' + this.id).removeAttr('display');
            }

            if(!this.isEnabled) {
                $('#' + this.id).attr('disabled', 'disabled');
            } else {
                $('#' + this.id).removeAttr('disabled');
            }
        },

        setValueFromDOM: function(id, event, nextEvent) {
            this.value = this.secure($('#' + this.id).val());
        },
        getValue: function() {
            return this.value;
        },
        setLabel: function(txt){
            if(this.label){
                $('label[for="' + this.id + '"]').html(txt);
            }
        }

    });
