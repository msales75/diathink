function fixFontSize() {
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
//# sourceMappingURL=fixFontSize.js.map
