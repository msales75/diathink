///<reference path="View.ts"/>
m_require("app/views/View.js");
class BreadcrumbView extends View {
    isAbsolute = false;
    parentView:PanelView;

    init() {
        this.isClickable = true;
    }

    updateValue() {
        if (this.parentView) {
            var crumb, model = this.parentView.value;
            this.value = [];
            if (model != null) {
                crumb = model;
                while (crumb != null) {
                    this.value.unshift(crumb);
                    crumb = crumb.get('parent');
                }
            }
        }
    }

    getInnerHTML() {
        var i, html = '';
        if (this.value.length > 0) {
            for (i = 0; i < this.value.length - 1; ++i) {
                // todo: secure displayed text
                html += '<a class="ui-breadcrumb-link ui-link" data-href="' + this.value[i].cid + '">' + this.value[i].get('text') + '</a><span>&gt;</span>';
            }
            html += ' <a class="panel-name">' + this.value[i].get('text') + '</a><span>&nbsp;</span>';
        } else {
            html = ' <a class="panel-name">Matches</a><span>&nbsp;</span>';
        }
        return html;
    }

    render() {
        this._create({type: 'div', classes: 'ui-breadcrumb', html: this.getInnerHTML()});
        this.positionChildren(null);
        this.setPosition();
        return this.elem;
    }
    fixHeight(validate?:boolean) {
        var currentWidth = this.layout.width; // elem.clientWidth;
        var currentFont = View.fontSize; // $(elem).css('font-size');
        var hiddendiv = (<DiathinkView>(View.currentPage)).hiddendiv.elem;
        assert(hiddendiv!=null, "fixHeight called before defined hiddendiv");
        assert(this.parentView instanceof View, "ERROR: textedit parentDiv not found in fixHeight");
        var lineHeight = Math.round(1.25*View.fontSize);
        // var paddingX = 0; // 2*Math.round(.15*View.fontSize);
       //  var paddingY = 0; // 2*Math.round(.18*View.fontSize);
        hiddendiv.style.width = String(currentWidth - 1) + 'px';
        // console.log("Defined hiddendiv width = "+hiddendiv.style.width);
        hiddendiv.innerHTML = this.getInnerHTML();
        var nlines = Math.round(($(hiddendiv).children('.panel-name').next().position().top / lineHeight) - 0.4) + 1;
        var height = nlines * lineHeight;
        // console.log("Got nlines = "+nlines+'; height = '+height+'; paddingY = '+paddingY);
        if (validate) {
            assert(this.layout.height===height+Math.round(0.3*View.fontSize), "Breadcrumbs have invalid height");
        }
        this.layout.height = height+Math.round(0.3*View.fontSize); // padding below breadcrumbs
    }

    layoutDown() {
        var p:Layout = this.parentView.layout;
        if (this.layout==null) {this.layout = {};}
        this.layout.top = 0;
        this.layout.left = Math.round(0.8*View.fontSize);
        this.layout.width = p.width-Math.round(2.8*View.fontSize);
    }
    layoutUp() {
        /*
        if (this.dirtyHeight) {
            this.layout.height = Number(this.elem.style.height.replace(/px/,''));
            this.dirtyHeight = false;
        }
        */
    }
    positionChildren(v:View, v2?:string, validate?:boolean) {
        this.fixHeight(validate);
    }

    renderUpdate() {
        this.elem.innerHTML = this.getInnerHTML();
        this.resizeUp();
    }

    onClick(params:DragStartI) {
        var elem = $(params.elem);
        if (! elem.hasClass('ui-breadcrumb-link')) {return;}
        var modelid = elem.attr('data-href');
        var panelview:PanelView = this.panelView;
        ActionManager.schedule(
            function():SubAction {
                if (!View.focusedView) {return null;}
                return Action.checkTextChange(View.focusedView.header.name.text.id);
            },
            function():SubAction {
                return {
                    actionType: PanelRootAction,
                    name: 'Breadcrumb click',
                    activeID: modelid,
                    oldRoot: panelview.outline.alist.nodeRootView.id,
                    newRoot: 'new',
                    anim: 'none'
                };
            });
    }
    validate() {
        super.validate();
        var v = this.id;
        assert(this.parentView instanceof PanelView,
            "Breadcrumb view " + v + " does not have paneloutlineview parent");
        assert(this.parentView.breadcrumbs === this,
            "Breadcrumb view " + v + " does not match parentview.breadcrumbs");
        assert(this.parentView === this.panelView,
            "Breadcrumb view " + v + " does not have panelView set to parent");
        // breadcrumbs
        var crumb, bvalue:OutlineNodeModel[] = [];
        crumb = this.panelView.value;
        while (crumb != null) {
            bvalue.unshift(crumb);
            crumb = crumb.get('parent');
        }

        assert(this.value.length === bvalue.length,
            "Breadcrumbs " + v + " does not have breadcrumbs value match length=" + bvalue.length);
        for (var i:number = 0; i < bvalue.length; ++i) {
            assert(this.value[i] === bvalue[i],
                "Breadcrumbs " + v + " does not have breadcrumbs value " + i + " match " + bvalue[i].cid);
        }
        // todo: re-enable this once resolved
        /*
        var count:number = 0;
        $(this.elem).children('a.ui-breadcrumb-link').each(function () {
                assert($(<HTMLElement>this).attr('data-href') === bvalue[count].cid,
                    "Panel " + v + " does not have breadcrumb value " + count + " match view");
            ++count;
        });
        assert(bvalue.length === count + 1,
            "Breadcrumbs " + v + " does not have breadcrumb count " + bvalue.length + " match view-length " + count);
            */
    }

}
