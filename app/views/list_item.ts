///<reference path="../foundation/view.ts"/>
///<reference path="../views/OutlineView.ts"/>
//m_require('app/views/button.js');
class ListItemView extends View {
    type = 'ListItemView';
    modelType= $D.OutlineNodeModel;  // pointer to class of model, used with modelId
    header: NodeHeaderContainer;
    children: RecurseListTemplate;
    getChildTypes():ViewTypeList {
        return {
            header: NodeHeaderContainer,
            children:RecurseListTemplate
        };
    }
    theme(elem) {
        if (!elem) {
            elem = $('#' + this.id)[0];
        }
        $(elem).addClass('ui-li ui-li-static ui-btn-up-c');
        this.themeChildViews(elem);
        // todo: will this propagate without elem?
        // fixHeight is only called on nonempty list-elements.
        if (this.header.name.text.value.length > 3) {
            this.header.name.text.fixHeight();
        }
    }

    render() {
        this.html = '<li id="' + this.id + '"' + this.style() + '>';
        this.renderChildViews();
        this.html += '</li>';
        return this.html;
    }


    style() {
        var html = '';
        if (this.cssClass) {
            html += ' class="' + this.cssClass + '"';
        }
        return html;
    }

    // MS custom theme function to handle changes in list-sequence, active-status, etc.
    // todo: class-names should probably not be hard-coded
    // todo: position of ul inside list should probably not be hard-coded
    themeFirst() {
        var elem = $('#' + this.id);
        if (elem.prev('li').length > 0) {
            elem.removeClass('ui-first-child');
        } else {
            elem.addClass('ui-first-child');
        }
    }

    themeLast() {
        var elem = $('#' + this.id);
        if (elem.next('li').length > 0) {
            elem.removeClass('ui-last-child');
        } else {
            elem.addClass('ui-last-child');
        }
    }

}
