///<reference path="View.ts"/>
m_require("app/views/View.js");

class NodeView extends View {
    modelType;
    header:NodeHeaderView;
    children:OutlineListView;
    parentView:ListView;
    value:NodeModel;
    isCollapsed:boolean;
    init() {
        this.Class = NodeView;
        this.modelType = OutlineNodeModel;
        this.childViewTypes = {
            header: NodeHeaderView,
            children: OutlineListView
        };
    }

    updateValue() {
        if (this.value) {
            this.modelType.findOrCreate(this.value.cid).addView(this); // register view.id in model
        }
        // check outline and value for collapse-status
        this.isCollapsed = this.value.get('collapsed');
        var outline = OutlineManager.outlines[this.nodeRootView.id];
        var collapseTest = this.nodeRootView.getData(this.value.cid);
        if (collapseTest != null) {
            this.isCollapsed = collapseTest;
        }
    }

    render() {
        this._create({
            type: 'li',
            classes: 'ui-li ui-li-static ui-btn-up-c ' + this.cssClass
        });

        // todo: make list-children rendering contingent on collapsed-value
        this.renderChildViews();
        for (var name in this.childViewTypes) {
            this.elem.appendChild((<View>(this[name])).elem);
        }

        if (this.isCollapsed) {
            this.addClass('branch').removeClass('leaf').
                addClass('collapsed').removeClass('expanded');
        } else {
            if (this.children.elem.children.length > 0) {
                // this is defined because rendering is bottom-up
                this.addClass('branch').removeClass('leaf').
                    addClass('expanded').removeClass('collapsed');
            } else {
                this.addClass('leaf').removeClass('branch').
                    addClass('expanded').removeClass('collapsed');
            }
        }

        if (this.header.name.text.value.length > 3) {
            this.header.name.text.fixHeight();
        }

        return this.elem;
    }

    // todo: manual list-checking shouldn't be necessary for first/last
    themeFirst() {
        var elem = $(this.elem);
        if (elem.prev('li').length > 0) {
            this.removeClass('ui-first-child');
        } else {
            this.addClass('ui-first-child');
        }
    }

    themeLast() {
        var elem = $(this.elem);
        if (elem.next('li').length > 0) {
            elem.removeClass('ui-last-child');
        } else {
            elem.addClass('ui-last-child');
        }
    }
}

