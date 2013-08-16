
$.fn.setSelection = function(selectionStart, selectionEnd) {
    if (this.setSelectionRange) {
        this.focus();
        this.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (this.createTextRange) {
        var range = this.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
};

$.fn.setCursor = function(pos) {
    $(this).setSelection(pos, pos);
};

$.fn.selection = function() {
    var start, end;
    return [this[0].selectionStart, this[0].selectionEnd];
/*
 if (typeof window.getSelection === "undefined") {
 return null;
 }
    var sel = window.getSelection();
    if (sel.rangeCount>0) {
        var selrange = sel.getRangeAt(0);
        if ((selrange.startContainer === this[0])&&(selrange.endContainer === this[0])) {
            return [selrange.startOffset, selrange.endOffset];
        } else if ((selrange.startContainer.children[0] === this[0])&&(selrange.endContainer.children[0] === this[0])) {
            return [selrange.startOffset, selrange.endOffset];
        }
    }
    return null;
    */
};
