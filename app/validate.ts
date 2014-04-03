///<reference path="actions/Action.ts"/>
///<reference path="models/OutlineNodeModel.ts"/>


function validate() {
    // assert(Backbone.Relational.store._collections.length === 1, "");
    var outlines:{[i:string]:OutlineRootView} = OutlineManager.outlines;
    var models:{[i:string]:OutlineNodeModel} = OutlineNodeModel.modelsById;
    var views = View.viewList;

    $('[id]').each(function () {
        var ids = $('[id="' + this.id + '"]');
        assert(ids.length === 1,
            "There is more than one DOM element with id=" + this.id);
    });

    for (var o in outlines) {
        assert(typeof outlines[o] === 'object',
            "Outline ID " + o + " is not an object");
        assert(outlines[o] instanceof OutlineRootView,
            "Outline ID " + o + " is not an OutlineRootView");
        assert(outlines[o].nodeRootView === outlines[o],
            "Outline " + o + " does not have a valid nodeRootView");
        assert(views[o] === outlines[o],
            "Outline " + o + " does not point to the corresponding view");
        assert(outlines[o].id === o,
            "Outline " + o + " points to a view with an invalid id");

        //assert(views[o].childViews === null,
        // "Outline "+o+" points to a view with childViews");
        // temporary constraint until references: parent should be a panel
        assert(outlines[o].parentView.parentView instanceof PanelView,
            "Outline view " + o + " does not have parent-parent-view a panel");
        assert(outlines[o].parentView.parentView.outline.alist === outlines[o],
            "Outline view " + o + " does not match parent.parent.outline.alist in a panel");
    }

    var collections = {};
    var modelBase = $D.data.modelsById;
    // collections[0] = $D

    for (var m in modelBase) {
        assert(models[m] !== undefined,
            "modelBase " + m + " does not exist in model list");
        assert(models[m] === modelBase[m],
            "modelBase " + m + " does not match model in model list");
    }
    for (var m in models) { // find the root-node
        // parent is only undefined for this one node
        assert(typeof models[m] === 'object',
            "Model " + m + " is not an object");
        assert(models[m] instanceof OutlineNodeModel,
            "Model " + m + " is not an OutlineNodeModel");
        assert(models[m].cid === m,
            "Model " + m + " does not have a valid cid");
        assert(typeof models[m].attributes === 'object',
            "Model " + m + " does not have an attributes field");

        if (models[m].attributes.deleted === false) {
            if (models[m].attributes.parent == null) {
                assert(modelBase[m] != null,
                    "Unable to find model " + m + " in top-level of $D.data, despite having parent=null");
            } else {
                assert(modelBase[m] === undefined,
                    "Model " + m + " has a parent but is not in $D.data");
            }
            if (models[m].attributes.children) {
                collections[m] = models[m].attributes.children;
            }
        } else { // deleted model
            assert(models[m].attributes.parent === null,
                "Deleted model " + m + " has a parent not null");
            assert(models[m].attributes.children.length === 0,
                "Deleted model " + m + " has children not empty");
            assert(models[m].views === null,
                "Deleted model " + m + " has views not null");
        }
    }

    // ignore deleted models from model-list for rest of tests
    var models2:{[i: string]: OutlineNodeModel} = {};
    for (var m in models) {
        if (models[m].attributes.deleted === false) {
            models2[m] = models[m];
        }
    }
    models = models2;

    assert(_.size(modelBase) > 0,
        "There is no root-node model without a parent");

    for (var m in models) {
        if (modelBase[m] === undefined) {
            var p = models[m].attributes.parent;
            assert(models[p.cid] === p,
                "The parent of model " + m + ", " + p.cid + ", does not point to a listed model");
            var parents:string[] = [m];
            var pt:string = p.cid;
            while (pt && (modelBase[pt] === undefined) && (!_.contains(parents, pt))) {
                parents.push(pt);
                pt = models[pt].attributes.parent.cid;
            }
            assert(modelBase[pt] !== undefined,
                "The model " + m + " does not have ancestry to a root model ");
            // (proves parent-refs are connected & acyclic)

            assert(p.attributes.children instanceof OutlineNodeCollection,
                "Parent-model " + p + " does not have children of type OutlineNodeCollection");
            var foundit = false;
            for (var cp in p.attributes.children.modelsById) {
                if (p.attributes.children.modelsById[cp] === models[m]) {
                    foundit = true;
                    break;
                }
            }
            assert(foundit,
                "Model " + m + " is not in the child-list of parent-model " + pt);
        }
        assert(models[m].attributes.text != null,
            "The model " + m + " does not have a text attribute");
        assert(typeof models[m].attributes.text === 'string',
            "The model " + m + " has a text-attribute that is not a string");
        // parent matches children
        var c = models[m].attributes.children;
        assert(c instanceof OutlineNodeCollection,
            "The children of model " + m + " are not an OutlineNodeCollection");
        for (var cm in c.modelsById) {
            var obj:OutlineNodeModel = <OutlineNodeModel>c.modelsById[cm];
            assert(obj instanceof OutlineNodeModel,
                "The child " + cm + " of model " + m + " is not a RelationalModel");
            assert(models[obj.cid] === obj,
                "The child " + cm + " of model " + m + " is not in the model list");
            assert(obj.attributes.parent === models[m],
                "The child " + cm + " of model " + m + " does not have the matching parent-field");
        }

        assert(models[m].views !== undefined,
            "The model " + m + " does not have a views array defined.");
        assert(typeof models[m].views === 'object',
            "The model " + m + " does not have a views-object");
        var k:string;
        for (k in models[m].views) {
            assert(outlines[k] != null,
                "The key " + k + " in the views of model " + m + " is not in the outline list");
            assert(models[m].views[k] instanceof NodeView,
                "The view in outline " + k + " for model " + m + " is not of type NodeView");
            assert(models[m].views[k] === views[models[m].views[k].id],
                "The view in outline " + k + " for model " + m + " is not in the views list");
            assert(models[m].views[k].value.cid === m,
                "The view " + models[m].views[k].id + " in model " + m + " and outline " + k + " does not have model Id=" + m);
        }
    }

    // identify view-root and validate view-tree
    var pages:{[k:string]:DiathinkView} = {}, panels:{[k:string]:PanelView} = {};
    var numpages:number = 0;
    var v:string;
    for (v in views) {
        assert(views[v].id === v,
            "View " + v + " does not have a valid id");
        assert(views[v] instanceof View,
            "View " + v + " is not an instance of View");
        if (views[v] instanceof PageView) {
            pages[v] = <DiathinkView>views[v];
            ++numpages;
            assert(views[v].Class === DiathinkView,
                "PageView " + v + " does not have class=diathinkview");
            assert(views[v].isFocusable === false,
                "PageView " + v + " does not have isFocuable===false");
            assert(views[v].isDragHandle === false,
                "PageView " + v + " does not have isFocuable===false");
            assert(views[v].isScrollable === false,
                "PageView " + v + " does not have isScrollable===false");
            assert(views[v].isSwipable === false,
                "PageView " + v + " does not have isSwipable===false");
            assert(views[v].parentView === null,
                "PageView " + v + " has parentView not-null");
            assert(views[v].nodeRootView === null,
                "PageView " + v + " has nodeRootView not-null");
            assert(views[v].nodeView === null,
                "PageView " + v + " has nodeView not-null");
            assert(views[v].scrollView === null,
                "PageView " + v + " has scrollView not-null");
            assert(views[v].handleView === null,
                "PageView " + v + " has handleView not-null");
            assert(views[v].panelView === null,
                "PageView " + v + " has panelView not-null");
            assert(views[v].clickView === null,
                "PageView " + v + " has clickView not-null");
            assert(views[v].value === null,
                "PageView " + v + " has a value that's not null");
            assert($('#' + views[v].id).parent().get(0) === $('body').get(0),
                "Page " + v + " is not immediately inside body");
        }
        if (views[v] instanceof PanelView) {
            panels[v] = <PanelView>views[v];
            assert(views[v].isFocusable === false,
                "PanelView " + v + " does not have isFocuable===false");
            assert(views[v].isDragHandle === false,
                "PanelView " + v + " does not have isFocuable===false");
            assert(views[v].isScrollable === false,
                "PanelView " + v + " does not have isScrollable===false");
            assert(views[v].isSwipable === false,
                "PanelView " + v + " does not have isSwipable===false");
            assert(views[v].nodeRootView === null,
                "PanelView " + v + " has nodeRootView not-null");
            assert(views[v].nodeView === null,
                "PanelView " + v + " has nodeView not-null");
            assert(views[v].scrollView === null,
                "PanelView " + v + " has scrollView not-null");
            assert(views[v].handleView === null,
                "PanelView " + v + " has handleView not-null");
            assert(views[v].panelView === views[v],
                "PanelView " + v + " has panelView not-self");
            assert(views[v].clickView === null,
                "PanelView " + v + " has clickView not-null");
            assert(panels[v].breadcrumbs instanceof BreadcrumbView,
                "Panel " + v + " does not have breadcrumbs of correct type");
            assert(panels[v].outline instanceof OutlineScrollView,
                "Panel " + v + " does not have outline of type OutlineScrollView");
            assert(panels[v].outline.alist instanceof OutlineRootView,
                "Panel " + v + " has outline.alist without type OutlineRootView");
            if (panels[v].value !== null) {
                assert(panels[v].value === models[panels[v].value.cid],
                    "Panel " + v + " does not have a valid value");
                assert(panels[v].value.get('children') === panels[v].outline.alist.value,
                    "Panel " + v + " does not have value match outline.alist.value");
            } else {
                assert($D.data === panels[v].outline.alist.value,
                    "Panel " + v + " does not have value match outline.alist.value");
            }
            assert(panels[v].outline.alist === panels[v].outline.alist.nodeRootView,
                "Panel " + v + " does not have outline.alist self=nodeRootView for an outline");
            assert(panels[v].outline.value === null,
                "Panel " + v + " outline-value is not null");

            var crumb, bvalue:Backbone.Model[] = [];
            if (panels[v].value !== null) {
                crumb = panels[v].value;
                while (crumb != null) {
                    bvalue.unshift(crumb);
                    crumb = crumb.get('parent');
                }
            }
            assert(panels[v].breadcrumbs.value.length === bvalue.length,
                "Panel " + v + " does not have breadcrumbs value match length=" + bvalue.length);
            for (var i:number = 0; i < bvalue.length; ++i) {
                assert(panels[v].breadcrumbs.value[i] === bvalue[i],
                    "Panel " + v + " does not have breadcrumbs value " + i + " match " + bvalue[i].cid);
            }
            var count:number = 0;
            $('#' + panels[v].breadcrumbs.id).children('a').each(function () {
                if (count > 0) {
                    assert($(<HTMLElement>this).attr('data-href') === bvalue[count - 1].cid,
                        "Panel " + v + " does not have breadcrumb value " + count + " match view");
                }
                ++count;
            });
            if (bvalue.length > 0) {
                assert(bvalue.length === count,
                    "Panel " + v + " does not have breadcrumb count " + bvalue.length + " match view-length " + count);
            } else {
                assert(bvalue.length === count - 1,
                    "Panel " + v + " does not have breadcrumb count " + bvalue.length + " match view-length " + (count - 1));
            }
        }
    }
    assert(numpages===1, "numpages = "+numpages+" instead of 1");
    for (v in views) {
        // deal with deleted outlines
        if (OutlineManager.deleted[v] !== undefined) {
            continue;
        }
        // validate childViews exist and have matching parentView
        var cViews:{[k:string]:View} = {}, cViewsI = null;
        var k:string;
        for (k in views[v].childViewTypes) {
            cViews[k] = views[v][k];
        }
        if (cViews != null) {
            for (k in cViews) {
                assert(cViews[k] instanceof View,
                    "childview "+k+" of view "+v+" is not a View");
                assert(cViews[k] instanceof views[v].childViewTypes[k],
                    "childview "+k+" of view "+v+" has wrong type");
                if (cViews[k] != null) { // allow empty child-views
                    assert(cViews[k].id != null,
                        "childView " + k + " of view " + v + " does not have a valid id");
                    assert(views[cViews[k].id] === cViews[k],
                        "childView " + i + " with id=" + cViews[k].id + " under parent " + v +
                            " is not in the views list");
                    assert(cViews[k].parentView === views[v],
                        "childView " + k + " with id=" + cViews[k].id + " under parent " + v +
                            " does not have matching parentView");
                }
            }
        }
        // todo: support listItems here too?

        if (pages[v] === undefined) { // if this is not a page-root
            assert(views[v].parentView != null,
                "View " + v + " has no parentView");
            assert(views[v].parentView instanceof View,
                "View " + v + " has a parentView that's not a View");
            assert(typeof views[v].parentView.id === 'string',
                "View " + v + " has a parentView without any id");
            assert(views[views[v].parentView.id] === views[v].parentView,
                "View " + v + " has a parentView that is not in the view-list");

            var pV:View = views[v].parentView;
            var parents:string[] = [v];
            var pt:string = pV.id;
            while (pt && (pages[pt] === undefined) && (!_.contains(parents, pt))) {
                parents.push(pt);
                pt = views[pt].parentView.id;
            }
            assert(pages[pt] != null,
                "View " + v + " does not have ancestry to a page");
            // (proves each page's parent-tree is connected & acyclic)

            // prove the child-list includes all views claiming this as a parent
            var foundit:boolean = false;
            if (pV instanceof ListView) {
                assert(pV.nodeRootView instanceof OutlineRootView,
                    "Parent ListView " + pV + " has invalid nodeRootView");
                assert(typeof pV.value === 'object',
                    "Parent ListView " + pV + " has invalid value (not an object)");
                assert(pV.value instanceof OutlineNodeCollection,
                    "Parent ListView " + pV + " has a value that's not an OutlineNodeCollection");
                assert(typeof pV.value.modelsById === 'object',
                    "Parent ListView " + pV + " has a value without modelsById");
                for (k in pV.value.modelsById) {
                    assert(typeof pV.value.modelsById[k] === 'object',
                        "Parent ListView " + pV + " has a child-model " + k + " that is not an object");
                    assert(typeof pV.value.modelsById[k].views === 'object',
                        "Parent ListView " + pV + " has a child-model " + k + " without views");
                    assert(typeof pV.value.modelsById[k].views[pV.nodeRootView.id] === 'object',
                        "Parent ListView " + pV + " has a child-model " + k + " without rootNodeView.id " + pV.nodeRootView.id + " listed in views");
                    if (pV.value.modelsById[k].views[pV.nodeRootView.id] === views[v]) {
                        foundit = true;
                    }
                }
            } else { // all views must be in childViews list
                cViews = {};
                for (var name in pV.childViewTypes) {
                    cViews[name] = pV[name];
                    if (cViews[name] != null) { // allow empty childViews
                        assert(typeof cViews[name] === 'object',
                            "childView " + i + " of view " + v + " is not an object");
                        assert(cViews[name] instanceof View,
                            "childView " + i + " of view " + v + " is not a View");
                        assert(cViews[name].id != null,
                            "childView " + i + " of view " + v + " does not have a valid id");
                        assert(views[cViews[name].id] === cViews[name],
                            "childView " + name + " with id=" + cViews[name].id + " under parent " + v +
                                " is not in the views list");
                        if (cViews[name] === views[v]) {
                            foundit = true;
                        }
                    }
                }
            }
            assert(foundit,
                "View " + v + " has parent " + pV + " but none of parent's children reference " + v);

            if (views[v] instanceof NodeView) {
                assert(views[v].nodeView === views[v],
                    "View "+v+" is a nodeView that doesn't know it");
            } else {
                assert(views[v].nodeView === views[v].parentView.nodeView,
                    "View "+v+" does not match its parents nodeView");
            }
            if (views[v] instanceof ScrollView) {
                assert(views[v].scrollView === views[v],
                    "View "+v+" is a scrollView that doesn't know it");
            } else {
                assert(views[v].scrollView === views[v].parentView.scrollView,
                    "View "+v+" does not match its parents scrollView");
            }
            if (views[v] instanceof PanelView) {
                assert(views[v].panelView === views[v],
                    "View "+v+" is a panelView that doesn't know it");
            } else {
                assert(views[v].panelView === views[v].parentView.panelView,
                    "View "+v+" does not match its parents panelView");
            }
            if (views[v] instanceof HandleImageView) {
                assert(views[v].handleView === views[v],
                    "View "+v+" is a nodeView that doesn't know it");
            } else {
                assert(views[v].handleView === views[v].parentView.handleView,
                    "View "+v+" does not match its parents handleView");
            }
            if (views[v] instanceof OutlineRootView) {
                // todo: check for expand/collapse data-consistency
                // views[v].data[key]=val
                // todo: check listItems for ListView's
                // check no-rendering twice or instantiating twice
                assert(views[v].nodeRootView === views[v],
                    "View "+v+" is a nodeRootView that doesn't know it");
            } else {
                assert(views[v].nodeRootView === views[v].parentView.nodeRootView,
                    "View "+v+" does not match its parents nodeRootView");
            }
            if (views[v].isClickable) {
                assert(views[v].clickView === views[v],
                    "View "+v+" is a clickView that doesn't know it");
            } else {
                assert(views[v].clickView === views[v].parentView.clickView,
                    "View "+v+" does not match its parents clickView");
            }

            if (views[v] instanceof BreadcrumbView) {
                var bView:BreadcrumbView = <BreadcrumbView>views[v];
                assert(bView.parentView instanceof PanelView,
                    "Breadcrumb view " + v + " does not have paneloutlineview parent");
                assert(bView.parentView.breadcrumbs === views[v],
                    "Breadcrumb view " + v + " does not match parentview.breadcrumbs");
            }
            if (views[v] instanceof ScrollView) {
                var sView = <OutlineScrollView>views[v];
                assert(sView.parentView instanceof PanelView,
                    "ScrollView " + v + " does not have paneloutlineview parent");
                assert(sView.parentView.outline === sView,
                    "ScrollView " + v + " does not have match parentview.outline");
            }
            if (views[v].nodeRootView == null) { // outside the outlines in the page
                if (views[v].parentView != null) {
                    assert(views[v].parentView.nodeRootView === null,
                        "View " + v + " has null nodeRootView but parent's nodeRootView is not null");
                }
                if (!(views[v] instanceof SpanView) && !(views[v] instanceof BreadcrumbView) && !(views[v] instanceof PanelView)) {
                    assert(views[v].value === null,
                        "View " + v + " has null nodeRootView but value is not null");
                }
                // todo: check panelview value.children against OutlineRoot.value
                assert(!(views[v] instanceof ListView),
                    "View " + v + " has null nodeRootView but it is a ListView");
                assert(!(views[v] instanceof NodeView),
                    "View " + v + " has null nodeRootView but it is a NodeView");
            } else { // we are inside one of the outlines
                if (outlines[v] === undefined) { // if we are not at the root
                    assert(views[v] != views[v].nodeRootView,
                        "View " + v + " is not in root-list, but is its own nodeRootView");
                    assert(views[v].nodeRootView === views[v].parentView.nodeRootView,
                        "View " + v + " is not in root-list, but has nodeRootView different than parent");
                }
                if (views[v] instanceof ListView) {
                    var lview:ListView = <ListView>views[v];
                    assert(_.size(lview.childViewTypes) === 0,
                        "View " + v + " has type ListView but has more than zero childViewsTypes");
                    assert(typeof views[v].value === 'object',
                        "ListView " + v + " does not have a value");
                    assert(views[v].value instanceof OutlineNodeCollection,
                        "ListView " + v + " value is not a OutlineNodeCollection");
                    assert(typeof lview.value.modelsById === 'object',
                        "ListView " + v + " value does not have modelsById attribute");
                    if (views[v].value === $D.data) {

                    } else {
                        assert(_.contains(collections, views[v].value),
                            "ListView " + v + " value is not in the model-collections list");
                    }
                    // make sure all children are represented in model
                    for ( k in lview.value.modelsById) {
                        assert(lview.value.modelsById[k] instanceof OutlineNodeModel,
                            "ListView " + v + " has child-model rank " + k + " is not an OutlineNodeModel");
                        assert(models[lview.value.modelsById[k].cid] === lview.value.modelsById[k],
                            "ListView " + v + " child-model " + lview.value.modelsById[k].cid + " is not in the models list");
                    }
                    var vElemParent = $('#' + v).parent('li');
                    if ((vElemParent.length === 0) || (vElemParent.hasClass('expanded'))) {
                        if (vElemParent.length > 0) {
                            assert(!vElemParent.hasClass('collapsed'),
                                "List-item " + vElemParent[0].id + " has collapsed and expanded classes");
                        }
                        for (i=0; i<lview.value.models.length; ++i) {
                            // rank is i
                            var vid = $($('#' + v).children().get(i)).attr('id');
                            assert(typeof vid === 'string',
                                "Unable to find id of DOM-child " + i + " of view " + v);
                            assert(views[vid] !== undefined,
                                "DOM-child " + i + " of view " + v + " is not in the views list: " + vid);
                        }
                    } else {
                        assert(vElemParent.hasClass('collapsed'),
                            "List-item " + vElemParent[0].id + " has neither collapsed or expanded class");
                        // no children should be defined
                        assert($('#' + v).children().length === 0,
                            "Collapsed list " + v + " still has children");
                    }

                } else if (views[v] instanceof NodeView) {
                    var nView = <NodeView>views[v];

                    assert(nView.value != null,
                        "NodeView " + v + " has null value");

                    assert(models[nView.value.cid].attributes.children === nView.children.value,
                        "NodeView " + v + " has value-children different than children-value");

                    assert(nView.parentView instanceof ListView,
                        "View " + v + " has type NodeView but parentView is not a ListView");

                    assert(nView.parentView.value instanceof OutlineNodeCollection,
                        "NodeView " + v + " parent view does not have value OutlineNodeCollection");

                    assert((<OutlineNodeCollection>nView.parentView.value).modelsById[nView.value.cid] === models[nView.value.cid],
                        "NodeView " + v + " parent view's collection does not include item's model ID " + views[v].value.cid);

                    assert(nView.value != null,
                        "NodeView " + v + " has no value");
                    assert(typeof nView.value === 'object',
                        "NodeView " + v + " has invalid value (not an object)");
                    foundit = false;
                    for (k in nView.value.views) {
                        if (nView.value.views[k] === nView) {
                            foundit = true;
                        }
                    }
                    assert(foundit,
                        "View " + v + " is not found in corresponding model " + views[v].value.cid + " views-list");

                    // view nodeRootView must be correct for the view it's in
                    assert(views[v].value.views[views[v].nodeRootView.id] === views[v],
                        "View " + v + " has a model without corresponding view under nodeRootView " + views[v].nodeRootView.id);

                    if (views[v].value.attributes.parent != null) {
                        if (outlines[views[v].parentView.id] != null) { // parent-list is outline-root
                        } else { // parent list is inside of another list
                            assert(views[v].parentView.parentView != null,
                                "NodeView " + v + " does not have a valid parent's parent though it is not the outline-root");
                            assert(views[v].parentView.parentView  instanceof NodeView,
                                "NodeView " + v + " does not have a parent's parent that is also a NodeView, nor is it the outline-root");
                            assert(models[views[v].parentView.parentView.value.cid] === views[v].value.attributes.parent,
                                "NodeView " + v + " has a parent NodeView with model id " + views[v].parentView.parentView.value.cid +
                                    " which does not match model-parent");
                        }
                    } else {
                        assert(outlines[views[v].parentView.id] != null,
                            "View " + v + " has root-model but is not an outline root");
                    }
                } else if (views[v] instanceof TextAreaView) {
                    assert(views[v].parentView.parentView.parentView instanceof NodeView,
                        "TextAreaView " + v + " does not appear inside a ListItem View");
                    assert(views[v].parentView.parentView.parentView.value != null,
                        "TextAreaView " + v + " parent-parent has no value");
                    assert(views[v].value === views[v].parentView.parentView.parentView.value.attributes.text,
                        "TextAreaView " + v + " does not match value " + views[v].value + " with listitem-parent");
                } else {
                }
            }
        }

        assert($('#' + v).length === 1,
            "View " + v + " is not in the DOM"); // require rendering for now
        if (views[v].parentView != null) {
            var pid = views[v].parentView.id;
            assert($('#' + v).parents('#' + pid).length === 1,
                "View " + v + " does not have parent-view " + pid);
        }

        assert(OutlineManager.deleted[v] === undefined,
            "View "+v+" is in outline deleted list but still exists");
        assert(PanelManager.deleted[v] === undefined,
            "View "+v+" is in panel deleted list but still exists");

        assert(views[v].elem !=null,
            "View "+v+" has no element");
        assert(views[v].elem instanceof HTMLElement,
            "View "+v+" has no valid element");
        assert(views[v].id === views[v].elem.id,
            "Element for view "+v+" has wrong id");
        assert($('#'+views[v].elem.id).length===1,
            "Element for views "+v+" not found in DOM");
        // todo: check elem existence and caching top/left/width/height
    }

    var PM:typeof PanelManager;
    PM = PanelManager;
    var grid = View.getCurrentPage().content.grid;
    // todo: check on properties of all deleted outlines/panels

    assert(PM.panelsPerScreen === $('#' + grid.id).children().length,
        "Wrong number of grid-children for panel manager");
    assert(_.size(PM.nextpanel) === PM.count + 1,
        "Wrong size for PM.nextpanel");
    assert(_.size(PM.prevpanel) === PM.count + 1,
        "Wrong size for PM.prevpanel");
    assert(PM.nextpanel[PM.leftPanel] !== undefined,
        "leftPanel not found in nextpanel");
    assert(PM.nextpanel[''] !== undefined,
        "empty not found in nextpanel");
    assert(PM.prevpanel[PM.leftPanel] !== undefined,
        "leftPanel not found in prevpanel");
    assert(PM.prevpanel[''] !== undefined,
        "empty not found in prevpanel");
    var leftRank;
    for (var n = 0, pname = PM.nextpanel['']; pname !== ''; pname = PM.nextpanel[pname], ++n) {
        assert(PM.nextpanel[PM.prevpanel[pname]] === pname,
            "nextpanel and prevpanel don't match at " + pname);
        assert(PM.prevpanel[PM.nextpanel[pname]] === pname,
            "nextpanel and prevpanel don't match at " + pname);
        assert(PM.deleted[pname] === undefined,
            "Non-deleted view in PM.deleted " + pname);
        if (pname === PM.leftPanel) {
            leftRank = n;
            assert($('#' + grid.id).children(':first').children().get(0).id === pname,
                "leftPanel does not match first panel in grid");
        }
        if ((n >= leftRank) && (n < leftRank + PM.panelsPerScreen)) {
            var pview = grid['scroll' + String(n - leftRank + 1)];
            assert(pview.id === pname,
                "View doesn't match panelmanager for n=" + n + " with p=" + pname +
                    " and pview.id=" + pview.id);
            assert(pview.outline.alist.id === PM.rootViews[pname],
                "RootView doesn't match panelmanager for panel " + pname);
            assert(pview.value === PM.rootModels[pname],
                "RootModel doesn't match panelmanager for panel " + pname);
        }
    }
    assert(n === PM.count,
        "Not all panels in array are accessed through nextpanel loop");

    for (n = 1; grid['scroll' + String(n + 1)] !== undefined; ++n) {
        ;
    }
    assert(n === PM.panelsPerScreen,
        "scrolln " + n + " doesn't match panelsPerScreen " + PM.panelsPerScreen);
    for (n = 1; n <= PM.panelsPerScreen; ++n) {
        assert($($('#' + grid.id).children().get(n - 1)).children().length === 1,
            "More than one second-level child of grid for scrolln=" + n);
        assert($($('#' + grid.id).children().get(n - 1)).children().get(0).id ===
            grid['scroll' + n].id,
            "grid scrolln " + n + " id doesn't match DOM");
    }

    // validate panel-button status

    // check listview's and list-elements
    $('.ui-listview').each(function () {
        assert(this.nodeName.toLowerCase() === 'ul',
            "Element with ui-listview does not have tag ul");
    });

    $('ul').each(function () {
        if ($(<HTMLElement>this).closest('#debuglog').length > 0) {
            return;
        }
        assert(typeof $(<HTMLElement>this).attr('id') === 'string',
            "List does not have a string for an id");
        assert($(<HTMLElement>this).attr('id').length >= 3,
            "List does not have a long enough id");
        assert($(<HTMLElement>this).hasClass('ui-listview'),
            "List " + $(<HTMLElement>this).attr('id') + " does not have class ui-listview");
        assert($(<HTMLElement>this).hasClass('ui-corner-all'),
            "List " + $(<HTMLElement>this).attr('id') + " does not have class ui-corner-all");
        assert($(<HTMLElement>this).hasClass('ui-shadow'),
            "List " + $(<HTMLElement>this).attr('id') + " does not have class ui-shadow");


        // todo: check for ui-sortable class for page
        // todo: validate that page.data('ui-sortable') has valid
        //    .panels and .items and
        // assert($(this).hasClass('ui-sortable'))

        /*
         // li,ul overflow is hidden unless :hover or .ui-focus-parent
         // ul z-index is always auto
         // li z-index is auto unless :hover of .ui-focus-parent
         if ($(this).is(':visible')) {
         if ($(this).hasClass('ui-focus-parent') || $(this).mouseIsOver()) {
         assert($(this).css('overflow') === 'visible',
         "List "+$(this).attr('id')+" does not have visible overflow, though it should");
         } else {
         assert($(this).css('overflow') === 'hidden',
         "List "+$(this).attr('id')+" does not have hidden overflow, though it should");
         }
         } */
    });

    $('.ui-li').each(function () {
        // either li or immediately under li
        if (this.nodeName.toLowerCase() !== 'li') {
            assert($(<HTMLElement>this).parent().get(0).nodeName.toLowerCase() === 'li',
                "Non-list element with ui-li class");
        }
    });

    $('li').each(function () {
        var self:HTMLElement = <HTMLElement>this;
        if ($(self).closest('#debuglog').length > 0) {
            return;
        }
        assert(typeof $(self).attr('id') === 'string',
            "List-item does not have a string for an id");
        assert($(self).attr('id').length >= 3,
            "List-item does not have a long enough id");
        assert($(self).hasClass('ui-li'),
            "List-item " + $(self).attr('id') + " does not ahve class ui-li");

        if ($(self).next().length > 0) {
            assert(!$(self).hasClass('ui-last-child'),
                "LI " + $(self).attr('id') + " is not at end but has class ui-last-child");
        } else {
            assert($(<HTMLElement>this).hasClass('ui-last-child'),
                "LI " + $(self).attr('id') + " is at end but does not have class ui-last-child");
        }
        if ($(self).prev().length > 0) {
            assert(!$(self).hasClass('ui-first-child'),
                "LI " + $(self).attr('id') + " is not at beginning but has class ui-first-child");
        } else {
            assert($(self).hasClass('ui-first-child'),
                "LI " + $(self).attr('id') + " is at beginning but does not have class ui-first-child");
        }

        var childlist = $(self).children('ul');
        assert(childlist.length === 1,
            "Child list ul not found inside li " + $(self).attr('id'));

        if (childlist.children().length > 0) {
            assert($(self).hasClass('branch'),
                "LI " + $(self).attr('id') + " has children but does not have branch class");
            assert(!$(self).hasClass('leaf'),
                "LI " + $(self).attr('id') + " has children but has leaf class");
        } else {
            if ($(self).hasClass('expanded')) {
                assert(!$(self).hasClass('branch'),
                    "LI " + $(self).attr('id') + " has no children but has branch class");
                assert($(self).hasClass('leaf'),
                    "LI " + $(self).attr('id') + " has no children but does not have leaf class");
            } else {
                assert($(self).hasClass('branch'),
                    "LI " + $(self).attr('id') + " has no children but has branch class");
                assert(!$(self).hasClass('leaf'),
                    "LI " + $(self).attr('id') + " has no children but does not have leaf class");
            }
        }

        assert($(self).hasClass('expanded') || $(self).hasClass('collapsed'),
            "li " + $(self).attr('id') + " doesn't have expanded or collapsed class.");
        assert(!($(self).hasClass('expanded') && $(self).hasClass('collapsed')),
            "li " + $(self).attr('id') + " has both expanded and collapsed class.");

        if ($(self).is(':visible')) {
            if ($(self).hasClass('expanded')) {
                assert(childlist.is(':visible'),
                    "Expanded list under " + $(self).attr('id') + " is not visible");
            } else {
                assert(!childlist.is(':visible'),
                    "Collapsed list under " + $(self).attr('id') + " is visible");
            }
        } else {
            assert(!$(self).parent().is(':visible'),
                "LI " + $(self).attr('id') + " is not visible though parent ul is");
        }
        // validate that all lists are unique inside their li
        assert($(self).children('ul').length === 1,
            "List-item " + $(self).attr('id') + " does not have exactly one ul inside it");

        /*
         // validate overflow and z-index, which can be programmatically changed
         if ($(this).is(":visible")) {
         if ($(this).hasClass('ui-focus-parent') || $(this).mouseIsOver()) {
         assert( $(this).css('overflow') === 'visible',
         "LI "+$(this).attr('id')+" does not have overflow visible");
         assert( $(this).css('z-index') === '10',
         "LI "+$(this).attr('id')+" does not have z-index=10");
         } else {
         assert( $(this).css('overflow') === 'hidden',
         "LI "+$(this).attr('id')+" does not have overflow hidden");
         assert( $(this).css('z-index') === 'auto',
         "LI "+$(this).attr('id')+" does not have z-index=auto");
         }
         }
         */
    });

    // validate that ui-focus-parent is used iff ui-focus is inside it
    $('.ui-focus-parent').each(function () {
        var self:HTMLElement = <HTMLElement>this;
        assert($(self).find('.ui-focus').length > 0,
            "Unable to find ui-focus inside ui-focus-parent with id=" + $(self).attr('id'));
    });

    $('.ui-focus').each(function () {
        var self:HTMLElement = <HTMLElement>this;
        // test that all parents have ui-focus-parent if they are li or ul
        $(self).parents().each(function () {
            if ((this.nodeName.toLowerCase === 'li') || (this.nodeName.toLowerCase === 'ul')) {
                assert($(self).hasClass('ui-focus-parent'),
                    "Missing ui-focus-parent on focus-parent node " + $(self).attr('id'));
            }
        });
    });


    var actions = ActionManager.actions;
    var lastaction:number = ActionManager.lastAction;
    if (actions.length > 0) {
        assert(lastaction !== null,
            "Actions.length>0 but lastaction is null");
        assert((<Action>actions.at(lastaction)).lost === false,
            "Last action cannot be lost");
        for (var i = 0; i < actions.length; ++i) {
            var act:Action = <Action>actions.at(i);
            if (i >= lastaction + 1) {
                assert((<Action>actions.at(i)).undone === true,
                    "Action at " + i + " is after last-action " + lastaction + ", but is not undone");
            }
            assert(_.size(act.runtime.queue) === 0,
                "Action at " + i + " has non-empty runtime queue");
            if (act.parentAction) {
                assert(act.parentAction.subactions.length > 0,
                    "Parent action of " + i + " has no subactions");
                foundit = false;
                for (var j = 0; j < act.parentAction.subactions.length; ++j) {
                    var subact = act.parentAction.subactions[j].action;
                    if (subact === act) {
                        foundit = true;
                        assert(actions.at(i - j - 1) === act.parentAction,
                            "Action at " + i + " does not have parent-action at " + (i - j - 1));
                        break;
                    }
                }
                assert(foundit, "Action at " + i + " is not on list of subactions for parentAction");
            }
            if (act.subactions.length > 0) {
                for (var j = 0; j < act.subactions.length; ++j) {
                    var subact = act.subactions[j].action;
                    assert(actions.at(i + j + 1) === subact,
                        "Action at " + i + " cannot find subaction offset by " + j);
                    assert(subact.parentAction === act,
                        "Action " + i + " subaction " + j + " does not have matching parentAction");
                }
            }
        }
    } else {
        assert(lastaction === null,
            "There are no actions, but lastaction is not null")
    }
    assert(_.size(ActionManager.queue) === 0,
        "ActionManager.queue is not empty");

    // undo-buttons should be up to date
    var b = View.getCurrentPage().header.undobuttons;
    assert(b.undobutton != null,
        "Cannot find undo button view");
    assert(b.redobutton != null,
        "Cannot find redo button view");
    assert($('#' + b.undobutton.id).length === 1,
        "Cannot find undo button element");
    assert($('#' + b.redobutton.id).length === 1,
        "Cannot find redo button element");
    assert(
        ((ActionManager.nextUndo() === -1) &&
            ($('#' + b.undobutton.id).children('div.ui-disabled').length === 1)) ||
            ((ActionManager.nextUndo() !== -1) &&
                ($('#' + b.undobutton.id).children('div.ui-disabled').length === 0)),
        "Undo button does not match nextUndo()");
    assert(
        ((ActionManager.nextRedo() === -1) &&
            ($('#' + b.redobutton.id).children('div.ui-disabled').length === 1)) ||
            ((ActionManager.nextRedo() !== -1) &&
                ($('#' + b.redobutton.id).children('div.ui-disabled').length === 0)),
        "Redo button does not match nextRedo()");

    function footprint(elem) {
        var obj:{top?:number;left?:number;bottom?:number;right?:number} = {};
        var offset = $(elem).offset();
        var paddingtop = Number($(elem).css('padding-top').replace(/px/, ''));
        var margintop = Number($(elem).css('margin-top').replace(/px/, ''));
        var bordertop = Number($(elem).css('border-top-width').replace(/px/, ''));
        if ($(elem).css('border-top-style') === 'none') {
            bordertop = 0;
        }
        var paddingleft = Number($(elem).css('padding-left').replace(/px/, ''));
        var marginleft = Number($(elem).css('margin-left').replace(/px/, ''));
        var borderleft = Number($(elem).css('border-left-width').replace(/px/, ''));
        if ($(elem).css('border-left-style') === 'none') {
            borderleft = 0;
        }
        obj.top = offset.top - margintop;
        obj.left = offset.left - marginleft;
        obj.bottom = obj.top + $(elem).outerHeight(true);
        obj.right = obj.left + $(elem).outerWidth(true);
        return obj;
    }


    $('*').each(function() {
        var withID:HTMLElement = <HTMLElement>this;
        while ((!withID.id)&&(withID.parentNode)) {
            withID = <HTMLElement>withID.parentNode;
        }
        if (withID.id) {
            assert(views[withID.id] != null,
            "Unable to find view for html element ID="+withID.id);
        }
    });
    /*
     $('*').each(function() {
     // validate that everything fits inside the parent-object, except
     // for scrollview-view height > inside scrollview-clip
     var type = this.nodeName.toLowerCase();
     if ((type==='html')||(type==='head')||(type==='meta')||
     (type==='script')||(type==='link')||(type==='style')||
     (type==='title')||(type==='base')||(type==='body')) {
     return;
     }
     var box = footprint(this);
     if ($(this).parent().length>0) {
     var pbox = footprint($(this).parent().get(0));
     assert(box.top >= pbox.top,
     "Object "+this.nodeName+'#'+String(this.id)+" has top="+box.top+" above parent="+pbox.top);
     assert(box.left >= pbox.left,
     "Object "+this.nodeName+'#'+String(this.id)+" has left="+box.left+" above parent="+pbox.left);
     if (box.right <= pbox.right,
     "Object "+this.nodeName+'#'+String(this.id)+" has right="+box.right+" above parent="+pbox.right);
     if (! $(this).hasClass('.ui-scrollview-clip')) {
     assert(box.bottom <= pbox.bottom,
     "Object "+this.nodeName+'#'+String(this.id)+" has bottom="+box.bottom+" above parent="+pbox.bottom);
     }
     }
     });
     */


    // todo: Need a optional debug-button in header,
    //     and log failed tests to a error-log.
    // todo: Need diagnostic output to see what is going on
    //    with dragging, scrolling, focusing, and keyboards?
    // diagnostics/assertions for keyboard/focus status

    // todo: action-state test to ensure actions can't overlap
    // todo: textarea not exceed height/width of parent boxes
    // todo: textarea height/width change must always match with content
    // todo: check height/width footprint of li and ul
    // todo: View.focusedView should be focused and match hiddendiv
    // todo: hiddendiv should have properties matching focused-div
    // todo: recalculated widths/heights should match up after resize
    // todo: ui-focus should always/only be on focused textarea and parent li.

    // nestedSortable items matches up with boxes etc. when dragging

    // todo: exec/undo and undo/redo should cancel for all actions
    // (part of a functional test)
    // functional tests that cover each contingency of each action?
    // Also check UI 'State' parameters in the view?
    // todo: check overflow on 'a' inner elem

    // todo: check html/css w3c validation?
    // todo: validate event-handlers:
    // $('*').each(function() {if ($._data(this,'events')!==undefined)
    //   {console.log([this.nodeName, this.id, this.className,
    //    $._data(this,'events')]);}});
    //  clean up and optimize events later
    // (maybe tie event handling to priority-queueing)
    // todo: can't check for unmatched tags or quotes or ampersands via javascript,
    //   though unmatched tags should mess up the view hierarchy and trigger other errors

    return "done";
}
