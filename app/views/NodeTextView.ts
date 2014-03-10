///<reference path="View.ts"/>
m_require("app/views/TextAreaView.js");

class NodeTextView extends TextAreaView {
    parentView:NodeTextWrapperView;
    init() {
        this.valuePattern = '<%= text %>';
        this.Class = NodeTextView;
    }
    updateValue() {
        this.setValuePatterns(this.parentView.parentView.parentView.value);
    }
    cssClass = 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset';
    hasMultipleLines = true;
}

