

$D.validateMVC = function () {
    assert(Backbone.Relational.store._collections.length === 1);
    var outlines = $D.OutlineManager.outlines;
    var models = Backbone.Relational.store._collections[0]._byId;
    var views = View.viewList;

    $('[id]').each(function(){
        var ids = $('[id="'+this.id+'"]');
        assert(ids.length===1,
            "There is more than one DOM element with id="+this.id);
    });

    for (var o in outlines) {
        assert(typeof outlines[o] === 'object',
            "Outline ID " + o + " is not an object");
        assert(outlines[o] instanceof OutlineRootView,
            "Outline ID " + o + " is not an OutlineRootView");
        assert(outlines[o].rootID === o,
            "Outline " + o + " does not have a valid rootID");
        assert(views[o] === outlines[o],
            "Outline " + o + " does not point to the corresponding view");
        assert(views[o].id === o,
            "Outline " + o + " points to a view with an invalid id");

        //assert(views[o].childViews === null,
            // "Outline "+o+" points to a view with childViews");
        // temporary constraint until references: parent should be a panel
        assert(views[o].parentView.parentView instanceof PanelOutlineView,
            "Outline view "+o+" does not have parent-parent-view a panel");
        assert(views[o].parentView.parentView.outline.alist === views[o],
            "Outline view "+o+" does not match parent.parent.outline.alist in a panel");
    }

    var collections = {};
    var modelBase = $D.data._byId;
    // collections[0] = $D

    for (var m in modelBase) {
        assert(models[m] !== undefined,
            "modelBase "+m+" does not exist in model list");
        assert(models[m] === modelBase[m],
            "modelBase "+m+" does not match model in model list");
    }
    for (var m in models) { // find the root-node
        // parent is only undefined for this one node
        assert(typeof models[m] === 'object',
            "Model " + m + " is not an object");
        assert(models[m] instanceof $D.OutlineNodeModel,
            "Model " + m + " is not an OutlineNodeModel");
        assert(models[m].cid === m,
            "Model " + m + " does not have a valid cid");
        assert(typeof models[m].attributes === 'object',
            "Model " + m + " does not have an attributes field");

        if (models[m].deleted === false) {
            if (models[m].attributes.parent == null) {
                assert(modelBase[m] != null,
                    "Unable to find model "+m+" in top-level of $D.data, despite having parent=null");
            } else {
                assert(modelBase[m] === undefined,
                    "Model "+m+" has a parent but is not in $D.data");
            }
            if (models[m].attributes.children) {
                collections[m] = models[m].attributes.children;
            }
        } else { // deleted model
            assert(models[m].attributes.parent === null,
                "Deleted model "+m+" has a parent not null");
            assert(models[m].attributes.children.length === 0,
                "Deleted model "+m+" has children not empty");
            assert(models[m].views === null,
                "Deleted model "+m+" has views not null");
        }
    }

    // ignore deleted models from model-list for rest of tests
    var models2 = {};
    for (var m in models) {
        if (models[m].deleted === false) {
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
            var parents = [m];
            var pt = p.cid;
            while (pt && (modelBase[pt] === undefined) && (!_.contains(parents, pt))) {
                parents.push(pt);
                pt = models[pt].attributes.parent.cid;
            }
            assert(modelBase[pt] !== undefined,
                "The model " + m + " does not have ancestry to a root model ");
            // (proves parent-refs are connected & acyclic)

            assert(p.attributes.children instanceof $D.OutlineNodeCollection,
                "Parent-model " + p + " does not have children of type OutlineNodeCollection");
            var foundit = false;
            for (var cp in p.attributes.children._byId) {
                if (p.attributes.children._byId[cp] === models[m]) {
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
        assert(c instanceof $D.OutlineNodeCollection,
            "The children of model " + m + " are not an OutlineNodeCollection");
        for (var cm in c._byId) {
            var obj = c._byId[cm];
            assert(obj instanceof Backbone.RelationalModel,
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
        for (var i in models[m].views) {
            assert(outlines[i] != null,
                "The key " + i + " in the views of model " + m + " is not in the outline list");
            assert(models[m].views[i] instanceof ListItemView,
                "The view in outline " + i + " for model " + m + " is not of type ListItemView");
            assert(models[m].views[i] === views[models[m].views[i].id],
                "The view in outline " + i + " for model " + m + " is not in the views list");
            assert(models[m].views[i].value.cid === m,
                "The view " + models[m].views[i].id + " in model " + m + " and outline " + i + " does not have model Id=" + m);
        }
    }

    // identify view-root and validate view-tree
    var pages = {}, panels = {};
    var numpages = 0;
    for (v in views) {
        assert(views[v].id === v,
            "View " + v + " does not have a valid id");
        assert(views[v].isView === true,
            "View " + v + " does not have isView==true");
        if (views[v] instanceof PageView) {
            pages[v] = views[v];
            ++numpages;
            assert(views[v].parentView === null,
                "PageView " + v + " has parentView not-null (pages can't have parents)");
            assert(views[v].rootID === null,
                "PageView " + v + " has rootID not-null (pages can't be in outlines)");
            assert(views[v].value === null,
                "PageView "+v+" has a value that's not null");
            assert($('#'+views[v].id).parent().get(0) === $('body').get(0),
                "Page "+v+" is not immediately inside body");
        }
        if (views[v] instanceof PanelOutlineView) {
            panels[v] = views[v];
            assert(panels[v].rootID === null, // panel is not inside an outline-view
                "Panel "+v+" has rootID defined");
            assert(panels[v].breadcrumbs instanceof BreadcrumbView,
                "Panel "+v+" does not have breadcrumbs of correct type");
            assert(panels[v].outline instanceof ScrollView,
                "Panel "+v+ " does not have outline of type ScrollView");
            assert(panels[v].outline.alist instanceof ListView,
                "Panel "+v+" has outline.alist without type listview");
            if (panels[v].value !== null) {
                assert(panels[v].value=== models[panels[v].value.cid],
                    "Panel "+v+" does not have a valid value");
                assert(panels[v].value.get('children') === panels[v].outline.alist.value,
                    "Panel "+v+" does not have value match outline.alist.value");
            } else {
                assert($D.data === panels[v].outline.alist.value,
                    "Panel "+v+" does not have value match outline.alist.value");
            }
            assert(panels[v].outline.alist.id === panels[v].outline.alist.rootID,
                "Panel "+v+" does not have outline.alist with id=rootID for an outline");
            assert(panels[v].outline.value === null,
                "Panel "+v+" outline-value is not null");

            var crumb, bvalue = [];
            if (panels[v].value !== null) {
                crumb = panels[v].value;
                while (crumb != null) {
                    bvalue.unshift(crumb);
                    crumb = crumb.get('parent');
                }
            }
            assert(panels[v].breadcrumbs.value.length === bvalue.length,
                "Panel "+v+" does not have breadcrumbs value match length="+bvalue.length);
            for (var i=0; i<bvalue.length; ++i) {
                assert(panels[v].breadcrumbs.value[i] === bvalue[i],
                    "Panel "+v+" does not have breadcrumbs value "+i+" match "+bvalue[i].cid);
            }
            var count = 0;
            $('#'+panels[v].breadcrumbs.id).children('a').each(function() {
                if (count>0) {
                    assert($(this).attr('data-href') === bvalue[count-1].cid,
                        "Panel "+v+" does not have breadcrumb value "+count+" match view");
                }
                ++count;
            });
            if (bvalue.length>0) {
                assert(bvalue.length === count,
                    "Panel "+v+" does not have breadcrumb count "+bvalue.length+" match view-length "+count);
            } else {
                assert(bvalue.length === count-1,
                    "Panel "+v+" does not have breadcrumb count "+bvalue.length+" match view-length "+(count-1));
            }
        }
    }

    for (v in views) {
        // deal with deleted outlines
        if ($D.OutlineManager.deleted[v] !== undefined) {
            continue;
        }
        // validate childViews exist and have matching parentView
        var cViews={}, cViewsI = null;
        if (typeof views[v].childViews === 'string') {
            cViewsI = views[v].childViews.split(' ');
            for (var i in cViewsI) {
                cViews[cViewsI[i]] = views[v][cViewsI[i]];
            }
        }
        if (cViews != null) {
            for (var i in cViews) {
                if (cViews[i] != null) { // allow empty child-views
                assert(typeof cViews[i] === 'object',
                    "childView " + i + " of view " + v + " is not an object");
                assert(cViews[i].isView === true,
                    "childView " + i + " of view " + v + " does not have isView=1");
                assert(cViews[i].id != null,
                    "childView " + i + " of view " + v + " does not have a valid id");
                assert(views[cViews[i].id] === cViews[i],
                    "childView " + i + " with id=" + cViews[i].id + " under parent " + v +
                        " is not in the views list");
                assert(cViews[i].parentView === views[v],
                    "childView " + i + " with id=" + cViews[i].id + " under parent " + v +
                        " does not have matching parentView");
            }
            }
        }

        if (pages[v] === undefined) { // if this is not a page-root
            assert(views[v].parentView != null,
                "View " + v + " has no parentView, but is of type " + views[v].type);
            assert(views[v].parentView.isView === true,
                "View " + v + " has a parentView without isView=true");
            assert(typeof views[v].parentView.id === 'string',
                "View " + v + " has a parentView without any id");
            assert(views[views[v].parentView.id] === views[v].parentView,
                "View " + v + " has a parentView that is not in the view-list");

            var p = views[v].parentView;
            var parents = [v];
            var pt = p.id;
            while (pt && (pages[pt] === undefined) && (!_.contains(parents, pt))) {
                parents.push(pt);
                pt = views[pt].parentView.id;
            }
            assert(pages[pt] != null,
                "View " + v + " does not have ancestry to a page");
            // (proves each page's parent-tree is connected & acyclic)


            // prove the child-list includes all views claiming this as a parent
            var foundit = false;
            if (p instanceof ListView) {
                assert(typeof p.rootID === 'string',
                    "Parent ListView "+p+" has invalid rootID (not a string)");
                assert(typeof p.value === 'object',
                    "Parent ListView "+p+" has invalid value (not an object)");
                assert(p.value instanceof $D.OutlineNodeCollection,
                    "Parent ListView "+p+" has a value that's not an OutlineNodeCollection");
                assert(typeof p.value._byId === 'object',
                    "Parent ListView "+p+" has a value without _byId");
                for (var i in p.value._byId) {
                    assert(typeof p.value._byId[i] === 'object',
                        "Parent ListView "+p+" has a child-model "+i+" that is not an object");
                    assert(typeof p.value._byId[i].views === 'object',
                        "Parent ListView "+p+" has a child-model "+i+" without views");
                    assert(typeof p.value._byId[i].views[p.rootID] === 'object',
                        "Parent ListView "+p+" has a child-model "+i+" without rootID "+ p.rootID+" listed in views");
                    if (p.value._byId[i].views[p.rootID] === views[v]) {
                        foundit = true;
                    }
                }
            } else { // all views must be in childViews list
                var cViews={};
                for (var name in p.childViewTypes) {
                    cViews[name] = p[name];
                    if (cViews[name] != null) { // allow empty childViews
                    assert(typeof cViews[name] === 'object',
                        "childView " + i + " of view " + v + " is not an object");
                    assert(cViews[name].isView === true,
                        "childView " + i + " of view " + v + " does not have isView=1");
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
                "View "+v+" has parent "+p+" of type "+ p.type+" but none of parent's children reference "+v);

            if (views[v] instanceof BreadcrumbView) {
                assert(views[v].parentView instanceof PanelOutlineView,
                    "Breadcrumb view "+v+" does not have paneloutlineview parent");
                assert(views[v].parentView.breadcrumbs === views[v],
                    "Breadcrumb view "+v+" does not match parentview.breadcrumbs");
            }
            if (views[v] instanceof ScrollView) {
                assert(views[v].parentView instanceof PanelOutlineView,
                    "ScrollView "+v+" does not have paneloutlineview parent");
                assert(views[v].parentView.outline === views[v],
                    "ScrollView "+v+" does not have match parentview.outline");
            }
            if (views[v].rootID == null) { // outside the outlines in the page
                if (views[v].parentView != null) {
                    assert(views[v].parentView.rootID === null,
                        "View "+v+" has null rootID but parent's rootID is not null");
                }
                if (!(views[v] instanceof SpanView)&&!(views[v] instanceof BreadcrumbView)) {
                    assert(views[v].value === null,
                        "View "+v+" has null rootID but value is not null");
                }
                assert(! (views[v] instanceof ListView),
                    "View "+v+" has null rootID but it is a ListView");
                assert(! (views[v] instanceof ListItemView),
                    "View "+v+" has null rootID but it is a ListItemView");
            } else { // we are inside one of the outlines
                if (outlines[v]===undefined) { // if we are not at the root
                    assert(views[v].id != views[v].rootID,
                        "View "+v+" is not in root-list, but has id=rootID");
                    assert(views[v].rootID === views[v].parentView.rootID,
                        "View "+v+" is not in root-list, but has rootID different than parent");
                }
                if (views[v] instanceof ListView) {
                    assert(_.size(views[v].childViewTypes) === 0,
                        "View "+v+" has type ListView but has more than zero childViewsTypes");
                    assert(typeof views[v].value === 'object',
                        "ListView "+v+" does not have a value");
                    assert(views[v].value instanceof $D.OutlineNodeCollection,
                        "ListView "+v+" value is not a OutlineNodeCollection");
                    assert(typeof views[v].value._byId === 'object',
                        "ListView "+v+" value does not have _byId attribute");
                    if (views[v].value === $D.data) {

                    } else {
                        assert(_.contains(collections, views[v].value),
                            "ListView "+v+" value is not in the model-collections list");
                    }
                    // make sure all children are represented in model
                    for (var i in views[v].value._byId) {
                        assert(views[v].value._byId[i] instanceof $D.OutlineNodeModel,
                            "ListView "+v+" has child-model rank "+i+" is not an OutlineNodeModel");
                        assert(models[views[v].value._byId[i].cid] === views[v].value._byId[i],
                            "ListView "+v+" child-model "+views[v].value._byId[i].cid+" is not in the models list");
                    }
                    var vElemParent = $('#'+v).parent('li');
                    if ((vElemParent.length===0)||(vElemParent.hasClass('expanded'))) {
                        if (vElemParent.length>0) {
                            assert(! vElemParent.hasClass('collapsed'),
                                "List-item "+vElemParent[0].id+" has collapsed and expanded classes");
                        }
                        for (var i in views[v].value.models) {
                            // rank is i
                            var vid = $($('#'+v).children().get(i)).attr('id');
                            assert(typeof vid === 'string',
                                "Unable to find id of DOM-child "+i+" of view "+v);
                            assert(views[vid] !== undefined,
                                "DOM-child "+i+" of view "+v+" is not in the views list: "+vid);
                        }
                    } else {
                        assert(vElemParent.hasClass('collapsed'),
                           "List-item "+vElemParent[0].id+" has neither collapsed or expanded class");
                        // no children should be defined
                        assert($('#'+v).children().length===0,
                            "Collapsed list "+v+" still has children");
                    }

                } else if (views[v] instanceof ListItemView) {

                    assert(views[v].value != null,
                        "ListItemView "+v+" has null value");

                    assert(models[views[v].value.cid].attributes.children === views[v].children.value,
                       "ListItemView "+v+" has value-children different than children-value");

                    assert(views[v].parentView instanceof ListView,
                        "View "+v+" has type ListItemView but parentView is not a ListView");

                    assert(views[v].parentView.value instanceof $D.OutlineNodeCollection,
                        "ListItemView "+v+" parent view does not have value OutlineNodeCollection");

                    assert(views[v].parentView.value._byId[views[v].value.cid] === models[views[v].value.cid],
                        "ListItemView "+v+" parent view's collection does not include item's model ID "+views[v].value.cid);

                    assert(views[v].value != null,
                        "ListItemView "+v+" has no value");
                    assert(typeof views[v].value === 'object',
                        "ListItemView "+v+" has invalid value (not an object)");
                    foundit=false;
                    for (var i in views[v].value.views) {
                        if (views[v].value.views[i] === views[v]) {
                            foundit=true;
                        }
                    }
                    assert(foundit,
                        "View "+v+" is not found in corresponding model "+views[v].value.cid+" views-list");

                    // view rootID must be correct for the view it's in
                    assert(views[v].value.views[views[v].rootID] === views[v],
                        "View "+v+" has a model without corresponding view under rootID "+views[v].rootID);

                    if (views[v].value.attributes.parent != null) {
                        if (outlines[views[v].parentView.id] != null) { // parent-list is outline-root
                        } else { // parent list is inside of another list
                            assert(views[v].parentView.parentView != null,
                                "ListItemView "+v+" does not have a valid parent's parent though it is not the outline-root");
                            assert(views[v].parentView.parentView  instanceof ListItemView,
                                "ListItemView "+v+" does not have a parent's parent that is also a ListItemView, nor is it the outline-root");
                            assert(models[views[v].parentView.parentView.value.cid] === views[v].value.attributes.parent,
                                "ListItemView "+v+" has a parent ListItemView with model id "+views[v].parentView.parentView.value.cid+
                                    " which does not match model-parent");
                        }
                    } else {
                        assert(outlines[views[v].parentView.id]!=null,
                           "View "+v+" has root-model but is not an outline root");
                    }
                } else if (views[v] instanceof TextEditView) { // todo: obsolete
                    assert(views[v].parentView.parentView.parentView instanceof ListItemView,
                        "TextEditView "+v+" does not appear inside a ListItem View");
                    assert(views[v].parentView.parentView.parentView.value != null,
                        "TextEditView "+v+" parent-parent has no value");
                    assert(views[v].value === views[v].parentView.parentView.parentView.value.attributes.text,
                        "TextEditView "+v+" does not match value "+views[v].value+" with listitem-parent");
                } else {
                }
            }
        }

        assert($('#' + v).length === 1,
            "View "+v+" is not in the DOM"); // require rendering for now
        if (views[v].parentView != null) {
            var pid = views[v].parentView.id;
            assert($('#'+v).parents('#'+pid).length === 1,
                "View "+v+" does not have parent-view "+pid);
        }

        assert($D.OutlineManager.deleted[v]===undefined,
            "");
        assert($D.PanelManager.deleted[v]===undefined,
            "");
    }

    var PM = $D.PanelManager;
    var grid = View.getCurrentPage().content.grid;

    assert(PM.panelsPerScreen === $('#'+grid.id).children().length,
      "Wrong number of grid-children for panel manager");
    assert(_.size(PM.nextpanel) === PM.count+1,
        "Wrong size for PM.nextpanel");
    assert(_.size(PM.prevpanel) === PM.count+1,
        "Wrong size for PM.prevpanel");
    assert(PM.nextpanel[PM.leftPanel]!==undefined,
        "leftPanel not found in nextpanel");
    assert(PM.nextpanel['']!==undefined,
        "empty not found in nextpanel");
    assert(PM.prevpanel[PM.leftPanel]!==undefined,
        "leftPanel not found in prevpanel");
    assert(PM.prevpanel['']!==undefined,
        "empty not found in prevpanel");
    var leftRank;
    for (var n= 0, p=PM.nextpanel['']; p!==''; p=PM.nextpanel[p], ++n) {
        assert(PM.nextpanel[PM.prevpanel[p]] === p,
            "nextpanel and prevpanel don't match at "+p);
        assert(PM.prevpanel[PM.nextpanel[p]] === p,
            "nextpanel and prevpanel don't match at "+p);
        assert(PM.deleted[p]===undefined,
            "Non-deleted view in PM.deleted "+p);
        if (p===PM.leftPanel) {
            leftRank = n;
            assert($('#'+grid.id).children(':first').children().get(0).id === p,
                "leftPanel does not match first panel in grid");
        }
        if ((n>=leftRank)&&(n<leftRank+PM.panelsPerScreen)) {
            var pview = grid['scroll'+String(n-leftRank+1)];
            assert(pview.id === p,
                "View doesn't match panelmanager for n="+n+" with p="+p+
                    " and pview.id="+pview.id);
            assert(pview.outline.alist.id===PM.rootViews[p],
                "RootView doesn't match panelmanager for panel "+p);
            assert(pview.value===PM.rootModels[p],
                "RootModel doesn't match panelmanager for panel "+p);
        }
    }
    assert(n===PM.count,
        "Not all panels in array are accessed through nextpanel loop");

    for (n=1; grid['scroll'+String(n+1)]!==undefined; ++n) {;}
    assert(n === PM.panelsPerScreen,
        "scrolln "+n+" doesn't match panelsPerScreen "+PM.panelsPerScreen);
    for (n=1; n<=PM.panelsPerScreen; ++n) {
        assert($($('#'+grid.id).children().get(n-1)).children().length===1,
            "More than one second-level child of grid for scrolln="+n);
        assert($($('#'+grid.id).children().get(n-1)).children().get(0).id ===
            grid['scroll'+n].id,
            "grid scrolln "+n+" id doesn't match DOM");
    }

    // validate panel-button status

    // check listview's and list-elements
    $('.ui-listview').each(function() {
        assert(this.nodeName.toLowerCase() === 'ul',
            "Element with ui-listview does not have tag ul");
    });

    $('ul').each(function() {
        if ($(this).closest('#debuglog').length>0) {return;}
        assert(typeof $(this).attr('id') === 'string',
            "List does not have a string for an id");
        assert($(this).attr('id').length>=3,
            "List does not have a long enough id");
        assert($(this).hasClass('ui-listview'),
            "List "+$(this).attr('id')+" does not have class ui-listview");
        assert($(this).hasClass('ui-corner-all'),
            "List "+$(this).attr('id')+" does not have class ui-corner-all");
        assert($(this).hasClass('ui-shadow'),
            "List "+$(this).attr('id')+" does not have class ui-shadow");


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

    $('.ui-li').each(function() {
        // either li or immediately under li
        if (this.nodeName.toLowerCase() !== 'li') {
            assert($(this).parent().get(0).nodeName.toLowerCase() === 'li',
                "Non-list element with ui-li class");
        }
    });

    $('li').each(function() {
        if ($(this).closest('#debuglog').length>0) {return;}
        assert(typeof $(this).attr('id') === 'string',
            "List-item does not have a string for an id");
        assert($(this).attr('id').length>=3,
            "List-item does not have a long enough id");
        assert($(this).hasClass('ui-li'),
            "List-item "+$(this).attr('id')+" does not ahve class ui-li");

        if ($(this).next().length>0) {
            assert(! $(this).hasClass('ui-last-child'),
                "LI "+$(this).attr('id')+" is not at end but has class ui-last-child");
        } else {
            assert($(this).hasClass('ui-last-child'),
                "LI "+$(this).attr('id')+" is at end but does not have class ui-last-child");
        }
        if ($(this).prev().length>0) {
            assert(! $(this).hasClass('ui-first-child'),
                "LI "+$(this).attr('id')+" is not at beginning but has class ui-first-child");
        } else {
            assert($(this).hasClass('ui-first-child'),
                "LI "+$(this).attr('id')+" is at beginning but does not have class ui-first-child");
        }

        var childlist = $(this).children('ul');
        assert(childlist.length===1,
            "Child list ul not found inside li "+$(this).attr('id'));

        if (childlist.children().length>0) {
            assert($(this).hasClass('branch'),
                "LI "+$(this).attr('id')+" has children but does not have branch class");
            assert(! $(this).hasClass('leaf'),
                "LI "+$(this).attr('id')+" has children but has leaf class");
        } else {
            if ($(this).hasClass('expanded')) {
                assert(! $(this).hasClass('branch'),
                    "LI "+$(this).attr('id')+" has no children but has branch class");
                assert($(this).hasClass('leaf'),
                    "LI "+$(this).attr('id')+" has no children but does not have leaf class");
            } else {
                assert($(this).hasClass('branch'),
                    "LI "+$(this).attr('id')+" has no children but has branch class");
                assert(! $(this).hasClass('leaf'),
                    "LI "+$(this).attr('id')+" has no children but does not have leaf class");
            }
        }

        assert($(this).hasClass('expanded') || $(this).hasClass('collapsed'),
            "li "+$(this).attr('id')+" doesn't have expanded or collapsed class.");
        assert(!($(this).hasClass('expanded') && $(this).hasClass('collapsed')),
            "li "+$(this).attr('id')+" has both expanded and collapsed class.");

        if ($(this).is(':visible')) {
            if ($(this).hasClass('expanded')) {
                assert(childlist.is(':visible'),
                    "Expanded list under "+$(this).attr('id')+" is not visible");
            } else {
                assert(!childlist.is(':visible'),
                    "Collapsed list under "+$(this).attr('id')+" is visible");
            }
        } else {
            assert(! $(this).parent().is(':visible'),
                "LI "+$(this).attr('id')+" is not visible though parent ul is");
        }
        // validate that all lists are unique inside their li
        assert($(this).children('ul').length===1,
            "List-item "+$(this).attr('id')+" does not have exactly one ul inside it");

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
    $('.ui-focus-parent').each(function() {
        assert($(this).find('.ui-focus').length>0,
            "Unable to find ui-focus inside ui-focus-parent with id="+$(this).attr('id'));
    });

    $('.ui-focus').each(function() {
        // test that all parents have ui-focus-parent if they are li or ul
        $(this).parents().each(function() {
            if ((this.nodeName.toLowerCase==='li')||(this.nodeName.toLowerCase==='ul')) {
                assert($(this).hasClass('ui-focus-parent'),
                    "Missing ui-focus-parent on focus-parent node "+$(this).attr('id'));
            }
        });
    });


    var actions = $D.ActionManager.actions;
    var lastaction = $D.ActionManager.lastAction;
    if (actions.length>0) {
        assert(lastaction !== null,
            "Actions.length>0 but lastaction is null");
        assert(actions.at(lastaction).lost === false,
            "Last action cannot be lost");
        for (var i=0; i<actions.length; ++i) {
            var act = actions.at(i);
            if (i >= lastaction+1) {
                assert(actions.at(i).undone === true,
                    "Action at "+i+" is after last-action "+lastaction+", but is not undone");
            }
            assert(_.size(act.runtime.queue)===0,
                "Action at "+i+" has non-empty runtime queue");
            if (act.parentAction) {
                assert(act.parentAction.subactions.length>0,
                    "Parent action of "+i+" has no subactions");
                foundit=false;
                for (var j=0; j<act.parentAction.subactions.length; ++j) {
                    var subact = act.parentAction.subactions[j].action;
                    if (subact === act) {
                        foundit=true;
                        assert(actions.at(i-j-1) === act.parentAction,
                            "Action at "+i+" does not have parent-action at "+(i-j-1));
                        break;
                    }
                }
                assert(foundit, "Action at "+i+" is not on list of subactions for parentAction");
            }
            if (act.subactions.length>0) {
                for (var j=0; j<act.subactions.length; ++j) {
                    var subact = act.subactions[j].action;
                    assert(actions.at(i+j+1) === subact,
                        "Action at "+i+" cannot find subaction offset by "+j);
                    assert(subact.parentAction === act,
                        "Action "+i+" subaction "+j+" does not have matching parentAction");
                }
            }
        }
    } else {
        assert(lastaction === null,
            "There are no actions, but lastaction is not null")
    }
    assert(_.size($D.ActionManager.queue)===0,
        "$D.ActionManager.queue is not empty");

    // undo-buttons should be up to date
    var b = View.getCurrentPage().header.undobuttons;
    assert(b.undobutton != null,
        "Cannot find undo button view");
    assert(b.redobutton!= null,
        "Cannot find redo button view");
    assert($('#'+b.undobutton.id).length===1,
        "Cannot find undo button element");
    assert($('#'+b.redobutton.id).length===1,
        "Cannot find redo button element");
    assert(
        (($D.ActionManager.nextUndo()===false)&&
            ($('#'+ b.undobutton.id).children('div.ui-disabled').length===1)) ||
        (($D.ActionManager.nextUndo()!==false)&&
            ($('#'+ b.undobutton.id).children('div.ui-disabled').length===0)),
        "Undo button does not match nextUndo()");
    assert(
        (($D.ActionManager.nextRedo()===false)&&
            ($('#'+ b.redobutton.id).children('div.ui-disabled').length===1)) ||
            (($D.ActionManager.nextRedo()!==false)&&
                ($('#'+ b.redobutton.id).children('div.ui-disabled').length===0)),
        "Redo button does not match nextRedo()");

    function footprint(elem) {
        var obj = {};
        var offset = $(elem).offset();
        var paddingtop = Number($(elem).css('padding-top').replace(/px/,''));
        var margintop = Number($(elem).css('margin-top').replace(/px/,''));
        var bordertop = Number($(elem).css('border-top-width').replace(/px/,''));
        if ($(elem).css('border-top-style')==='none') {bordertop = 0;}
        var paddingleft = Number($(elem).css('padding-left').replace(/px/,''));
        var marginleft = Number($(elem).css('margin-left').replace(/px/,''));
        var borderleft = Number($(elem).css('border-left-width').replace(/px/,''));
        if ($(elem).css('border-left-style')==='none') {borderleft = 0;}
        obj.top = offset.top - margintop;
        obj.left = offset.left - marginleft;
        obj.bottom = obj.top + $(elem).outerHeight(true);
        obj.right = obj.left + $(elem).outerWidth(true);
        return obj;
    }
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
    // todo: $D.focused should be focused and match hiddendiv
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
