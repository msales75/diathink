///<reference path="../foundation/view.ts"/>
///<reference path="../views/list.ts"/>
///<reference path="../views/list_item.ts"/>
///<reference path="../views/image.ts"/>
///<reference path="../views/container.ts"/>
///<reference path="../views/textedit.ts"/>

m_require("app/views/list.js");
m_require("app/views/list_item.js");
m_require("app/views/image.js");
m_require("app/views/textedit.js");
m_require("app/views/container.js");


class RecurseListTemplate extends ListView {
    isInset=true;
    listItemTemplateView=MyListItem;
    items= 'models'; // for Backbone.Collection compatibility
    idName='cid'; // for Backbone.Collection compatibility
}

class NodeHeaderImage extends ImageView {
    value='theme/images/drag_icon.png';
    cssClass='drag-handle disclose ui-disable-scroll';
}

class NodeHeaderNameText extends TextEditView {
    cssClass= 'outline-content ui-input-text ui-body-c ui-corner-all ui-shadow-inset';
    hasMultipleLines= true;
    valuePattern='<%= text %>';
}

class NodeHeaderName extends ContainerView {
    text:NodeHeaderNameText;
    getChildTypes():ViewTypeList {
        return {
            text: NodeHeaderNameText
        };
    }
}

class NodeHeaderContainer extends ContainerView {
    cssClass ='outline-header';
    handle: NodeHeaderImage;
    name: NodeHeaderName;
    getChildTypes():ViewTypeList {
        return {
            handle: NodeHeaderImage,
            name: NodeHeaderName
        };
    }
}


class MyListItem extends ListItemView {
}

RecurseListTemplate.prototype.listItemTemplateView = MyListItem;

