M.test = function (test, message) {
    if (!test) {
        if (message) {
            console.log("INVALID: " + message);
        } else {
            console.log("INVALID: Unspecified validation error");
        }
    }
};

diathink.validateMVC = function () {
    M.test(Backbone.Relational.store._collections.length === 1);
    var outlines = diathink.OutlineManager.outlines;
    var models = Backbone.Relational.store._collections[0]._byId;
    var views = M.ViewManager.viewList;

    for (var o in outlines) {
        M.test(typeof outlines[o] === 'object',
            "Outline ID " + o + " is not an object");
        M.test(outlines[o].type === 'diathink.OutlineController',
            "Outline ID " + o + " is not an OutlineController");
        M.test(outlines[o].rootID === o,
            "Outline " + o + " does not have a valid rootID");
        M.test(typeof views[o] === 'object',
            "Outline " + o + " does not have a corresponding view ID");
        M.test(views[o].type === 'M.ListView',
            "Outline " + o + " has a view ID which is not a listView, but:" + views[o].type);
        M.test(views[o].rootID === o,
            "Outline " + o + " points to a view with an invalid rootID");
        M.test(views[o].id === o,
            "Outline " + o + " points to a view with an invalid id");
        M.test(typeof views[o].rootController === 'object',
            "Outline "+o+" points to a view without a rootController");
        M.test(views[o].rootController.type === 'diathink.OutlineController',
            "Outline "+o+" points to a view without a rootController of the right type");
        M.test(views[o].rootController.rootID === o,
            "Outline "+o+" points to a view with a rootController with the wrong rootID");
        M.test(views[o].childViews === null,
            "Outline "+o+" points to a view with childViews");
        M.test(outlines[o].listObject instanceof diathink.OutlineNodeCollection,
            "Outline "+o+" has listObject that is not a diathink.OutlineNodeCollection");
        M.test(outlines[o].listObject === views[o].value,
            "Outline "+o+" has listObject that doesn't match the corresponding ListView-value");
    }

    var collections = {};
    var modelBase = diathink.data._byId;
    // collections[0] = diathink

    for (var m in modelBase) {
        M.test(models[m] !== undefined,
            "modelBase "+m+" does not exist in model list");
        M.test(models[m] === modelBase[m],
            "modelBase "+m+" does not match model in model list");
    }
    for (var m in models) { // find the root-node
        // parent is only undefined for this one node
        M.test(typeof models[m] === 'object',
            "Model " + m + " is not an object");
        M.test(models[m] instanceof diathink.OutlineNodeModel,
            "Model " + m + " is not an OutlineNodeModel");
        M.test(models[m].cid === m,
            "Model " + m + " does not have a valid cid");
        M.test(typeof models[m].attributes === 'object',
            "Model " + m + " does not have an attributes field");
        if (models[m].attributes.parent == null) {
            M.test(modelBase[m] != null,
                "Unable to find model "+m+" in top-level of diathink.data, despite having parent=null");
        } else {
            M.test(modelBase[m] === undefined,
                "Model "+m+" has a parent but is not in diathink.data");
        }
        if (models[m].attributes.children) {
            collections[m] = models[m].attributes.children;
        }
    }

    M.test(_.size(modelBase) > 0,
        "There is no root-node model without a parent");

    for (var m in models) {
        if (modelBase[m] === undefined) {
            var p = models[m].attributes.parent;
            M.test(models[p.cid] === p,
                "The parent of model " + m + ", " + p.cid + ", does not point to a listed model");
            var parents = [m];
            var pt = p.cid;
            while (pt && (modelBase[pt] === undefined) && (!_.contains(parents, pt))) {
                parents.push(pt);
                pt = models[pt].attributes.parent.cid;
            }
            M.test(modelBase[pt] !== undefined,
                "The model " + m + " does not have ancestry to a root model ");
            // (proves parent-refs are connected & acyclic)

            M.test(p.attributes.children instanceof diathink.OutlineNodeCollection,
                "Parent-model " + p + " does not have children of type OutlineNodeCollection");
            var foundit = false;
            for (var cp in p.attributes.children._byId) {
                if (p.attributes.children._byId[cp] === models[m]) {
                    foundit = true;
                    break;
                }
            }
            M.test(foundit,
                "Model " + m + " is not in the child-list of parent-model " + pt);
        }
        M.test(models[m].attributes.text != null,
            "The model " + m + " does not have a text attribute");
        M.test(typeof models[m].attributes.text === 'string',
            "The model " + m + " has a text-attribute that is not a string");
        // parent matches children
        var c = models[m].attributes.children;
        M.test(c instanceof diathink.OutlineNodeCollection,
            "The children of model " + m + " are not an OutlineNodeCollection");
        for (var cm in c._byId) {
            var obj = c._byId[cm];
            M.test(obj instanceof Backbone.RelationalModel,
                "The child " + cm + " of model " + m + " is not a RelationalModel");
            M.test(models[obj.cid] === obj,
                "The child " + cm + " of model " + m + " is not in the model list");
            M.test(obj.attributes.parent === models[m],
                "The child " + cm + " of model " + m + " does not have the matching parent-field");
        }

        M.test(models[m].views !== undefined,
            "The model " + m + " does not have a views array defined.");
        M.test(typeof models[m].views === 'object',
            "The model " + m + " does not have a views-object");
        for (var i in models[m].views) {
            M.test(outlines[i] != null,
                "The key " + i + " in the views of model " + m + " is not in the outline list");
            M.test(models[m].views[i].type === 'M.ListItemView',
                "The view in outline " + i + " for model " + m + " is not of type ListItemView");
            M.test(models[m].views[i] === views[models[m].views[i].id],
                "The view in outline " + i + " for model " + m + " is not in the views list");
            M.test(models[m].views[i].modelId === m,
                "The view " + models[m].views[i].id + " in model " + m + " and outline " + i + " does not have modelId=" + m);
        }
    }

    // identify view-root and validate view-tree
    var pages = {};
    var numpages = 0;
    for (v in views) {
        M.test(views[v].id === v,
            "View " + v + " does not have a valid id");
        M.test(views[v].isView === true,
            "View " + v + " does not have isView==true");
        if (views[v].type === 'M.PageView') {
            pages[v] = views[v];
            ++numpages;
            M.test(views[v].parentView === null,
                "PageView " + v + " has parentView not-null (pages can't have parents)");
            M.test(views[v].rootID === null,
                "PageView " + v + " has rootID not-null (pages can't be in outlines)");
            M.test(views[v].modelId === null,
                "PageView "+v+" has a modelId that's not null");
            M.test(views[v].value === null,
                "PageView "+v+" has a value that's not null");
            M.test(views[v].rootController === undefined,
                "PageView "+v+" has a rootController that's not null");
        }
    }
    // todo: allow multiple pages at body-level?
    M.test(numpages === 1,
        "There are " + numpages + " views of type PageView instead of 1");

    for (v in views) {
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
                M.test(typeof cViews[i] === 'object',
                    "childView " + i + " of view " + v + " is not an object");
                M.test(cViews[i].isView === true,
                    "childView " + i + " of view " + v + " does not have isView=1");
                M.test(cViews[i].id != null,
                    "childView " + i + " of view " + v + " does not have a valid id");
                M.test(views[cViews[i].id] === cViews[i],
                    "childView " + i + " with id=" + cViews[i].id + " under parent " + v +
                        " is not in the views list");
                M.test(cViews[i].parentView === views[v],
                    "childView " + i + " with id=" + cViews[i].id + " under parent " + v +
                        " does not have matching parentView");
            }
            }
        }

        if (pages[v] === undefined) { // if this is not a page-root
            M.test(views[v].parentView != null,
                "View " + v + " has no parentView, but is of type " + views[v].type);
            M.test(views[v].parentView.isView === true,
                "View " + v + " has a parentView without isView=true");
            M.test(typeof views[v].parentView.id === 'string',
                "View " + v + " has a parentView without any id");
            M.test(views[views[v].parentView.id] === views[v].parentView,
                "View " + v + " has a parentView that is not in the view-list");

            var p = views[v].parentView;
            var parents = [v];
            var pt = p.id;
            while (pt && (pages[pt] === undefined) && (!_.contains(parents, pt))) {
                parents.push(pt);
                pt = views[pt].parentView.id;
            }
            M.test(pages[pt] != null,
                "View " + v + " does not have ancestry to a page");
            // (proves each page's parent-tree is connected & acyclic)


            // prove the child-list includes all views claiming this as a parent
            var foundit = false;
            if (p.type === 'M.ListView') {
                M.test(typeof p.rootID === 'string',
                    "Parent ListView "+pt+" has invalid rootID (not a string)");
                M.test(typeof p.value === 'object',
                    "Parent ListView "+pt+" has invalid value (not an object)");
                M.test(p.value instanceof diathink.OutlineNodeCollection,
                    "Parent ListView "+pt+" has a value that's not an OutlineNodeCollection");
                M.test(typeof p.value._byId === 'object',
                    "Parent ListView "+pt+" has a value without _byId");
                for (var i in p.value._byId) {
                    M.test(typeof p.value._byId[i] === 'object',
                        "Parent ListView "+pt+" has a child-model "+i+" that is not an object");
                    M.test(typeof p.value._byId[i].views === 'object',
                        "Parent ListView "+pt+" has a child-model "+i+" without views");
                    M.test(typeof p.value._byId[i].views[p.rootID] === 'object',
                        "Parent ListView "+pt+" has a child-model "+i+" without rootID "+ p.rootID+" listed in views");
                    if (p.value._byId[i].views[p.rootID] === views[v]) {
                        foundit = true;
                    }
                }
            } else { // all views must be in childViews list
                var cViews={}, cViewsI = null;
                if (typeof p.childViews === 'string') {
                    cViewsI = p.childViews.split(' ');
                    for (var i in cViewsI) {
                        cViews[cViewsI[i]] = p[cViewsI[i]];
                    }
                }
                for (var i in cViews) {
                    if (cViews[i] != null) { // allow empty childViews
                    M.test(typeof cViews[i] === 'object',
                        "childView " + i + " of view " + v + " is not an object");
                    M.test(cViews[i].isView === true,
                        "childView " + i + " of view " + v + " does not have isView=1");
                    M.test(cViews[i].id != null,
                        "childView " + i + " of view " + v + " does not have a valid id");
                    M.test(views[cViews[i].id] === cViews[i],
                        "childView " + i + " with id=" + cViews[i].id + " under parent " + v +
                            " is not in the views list");
                    if (cViews[i] === views[v]) {
                        foundit = true;
                    }
                    }
                }
            }
            M.test(foundit,
                "View "+v+" has parent "+pt+" of type "+ p.type+" but none of parent's children reference "+v);

            if (views[v].rootID == null) { // outside the outlines in the page
                if (views[v].parentView != null) {
                    M.test(views[v].parentView.rootID === null,
                        "View "+v+" has null rootID but parent's rootID is not null");
                }
                M.test(views[v].modelId === null,
                    "View "+v+" has null rootID but modelId is not null");
                M.test(views[v].rootController == null,
                    "View "+v+" has null rootID but rootController is not null");
                M.test(views[v].type != 'M.ListView',
                    "View "+v+" has null rootID but it is a ListView");
                M.test(views[v].type != 'M.ListItemView',
                    "View "+v+" has null rootID but it is a ListItemView");
            } else { // we are inside one of the outlines
                if (outlines[v]===undefined) { // if we are not at the root
                    M.test(views[v].id != views[v].rootID,
                        "View "+v+" is not in root-list, but has id=rootID");
                    M.test(views[v].rootController == null,
                        "View "+v+" is not in root-list, but has rootController not null");
                    M.test(views[v].rootID === views[v].parentView.rootID,
                        "View "+v+" is not in root-list, but has rootID different than parent");
                }
                if (views[v].type === 'M.ListView') {
                    M.test(views[v].modelId == null,
                        "ListView "+v+" has a not-null modelId");
                    M.test(views[v].childViews === null,
                        "View "+v+" has type ListView but has childViews not null");
                    M.test(typeof views[v].value === 'object',
                        "ListView "+v+" does not have a value");
                    M.test(views[v].value instanceof diathink.OutlineNodeCollection,
                        "ListView "+v+" value is not a OutlineNodeCollection");
                    M.test(typeof views[v].value._byId === 'object',
                        "ListView "+v+" value does not have _byId attribute");
                    if (views[v].value === diathink.data) {

                    } else {
                        M.test(_.contains(collections, views[v].value),
                            "ListView "+v+" value is not in the model-collections list");
                    }
                    // make sure all children are represented in model
                    for (var i in views[v].value._byId) {
                        M.test(views[v].value._byId[i] instanceof diathink.OutlineNodeModel,
                            "ListView "+v+" has child-model rank "+i+" is not an OutlineNodeModel");
                        M.test(models[views[v].value._byId[i].cid] === views[v].value._byId[i],
                            "ListView "+v+" child-model "+views[v].value._byId[i].cid+" is not in the models list");
                    }
                } else if (views[v].type === 'M.ListItemView') {
                    M.test(views[v].modelId != null,
                        "ListItemView "+v+" has a null modelId");
                    M.test(models[views[v].modelId] !== undefined,
                        "View "+v+" has type ListView but modelId is not in models list");

                    M.test(models[views[v].modelId].attributes.children === views[v].children.value,
                       "ListItemView "+v+" has modelId-children differnet than view-children");

                    M.test(views[v].parentView.type === 'M.ListView',
                        "View "+v+" has type ListItemView but parentView is not a ListView");

                    M.test(views[v].parentView.value instanceof diathink.OutlineNodeCollection,
                        "ListItemView "+v+" parent view does not have value OutlineNodeCollection");

                    M.test(views[v].parentView.value._byId[views[v].modelId] === models[views[v].modelId],
                        "ListItemView "+v+" parent view's collection does not include item's model ID "+views[v].modelId);

                    M.test(views[v].value != null,
                        "ListItemView "+v+" has no value");
                    M.test(typeof views[v].value === 'object',
                        "ListItemView "+v+" has invalid value (not an object)");
                    M.test(views[v].value === models[views[v].modelId],
                        "ListItemView "+v+" has a value that doesn't match its modelId");
                    foundit=false;
                    for (var i in views[v].value.views) {
                        if (views[v].value.views[i] === views[v]) {
                            foundit=true;
                        }
                    }
                    M.test(foundit,
                        "View "+v+" is not found in corresponding model "+views[v].modelId+" views-list");
                    if (views[v].value.attributes.parent != null) {
                        if (outlines[views[v].parentView.id] != null) { // parent-list is outline-root
                        } else { // parent list is inside of another list
                            M.test(views[v].parentView.parentView != null,
                                "ListItemView "+v+" does not have a valid parent's parent though it is not the outline-root");
                            M.test(views[v].parentView.parentView.type === 'M.ListItemView',
                                "ListItemView "+v+" does not have a parent's parent that is also a ListItemView, nor is it the outline-root");
                            M.test(models[views[v].parentView.parentView.modelId] === views[v].value.attributes.parent,
                                "ListItemView "+v+" has a parent ListItemView with modelId "+views[v].parentView.parentView.modelId+" which does not match model-parent");
                        }
                    } else {
                        M.test(outlines[views[v].parentView.id]!=null,
                           "View "+v+" has root-model but is not an outline root");
                    }
                } else if (views[v].type === 'M.TextFieldView') {
                    M.test(views[v].parentView.parentView.type === 'M.ListItemView',
                        "TextFieldView "+v+" does not appear inside a ListItem View");
                    M.test(views[v].value === views[v].parentView.parentView.value.attributes.text,
                        "TextFieldView "+v+" does not match value "+views[v].value+" with listitem-parent");
                } else {
                    M.test(views[v].modelId === null,
                        "View "+v+" is of type "+views[v].type+" but has modelId not null");
                }
            }
        }

        M.test($('#' + v).length === 1,
            "View "+v+" is not in the DOM"); // require rendering for now
        if (views[v].parentView != null) {
            var pid = views[v].parentView.id;
            M.test($('#'+v).parents('#'+pid).length === 1,
                "View "+v+" does not have parent-view "+pid);
        }
    }

    // DOM children should match value=collection
    // check that view-parent matches nearest DOM-parent-view
    // Also check UI 'State' parameters in the view?
    for (d in $('body')) {
        // make sure all m_id's correspond to a view?
    }

    return "done";
}
