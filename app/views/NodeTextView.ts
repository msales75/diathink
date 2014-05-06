///<reference path="View.ts"/>
m_require("app/views/TextAreaView.js");

class NodeTextView extends TextAreaView {
    parentView:NodeTextWrapperView;
    updateValue() {
        // this.setValuePatterns(this.parentView.parentView.parentView.value);
        this.value = this.nodeView.value.get('text');
    }
    cssClass = 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset';
    hasMultipleLines = true;
}

