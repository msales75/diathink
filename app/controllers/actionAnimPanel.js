
$D.animPanel = {
    panelPrep: function() {
        return;
        var r = this.runtime;

        if (r.rOldType !== 'panel') {return;}


        // todo: next:

        // similar to oldLinePlace and newLinePlace, but for only one view.
        // step 1: replace original with old-placeholder
        //    might animate to lose space if disappearing
        // step 2: create new-placeholder
        //    visual-placeholder rendered w/o children if panel

        // we need paneldock when moving to a panel, or when undoing back to a panel

        var panelContext = r.rNewPanelContext;

        var activeView = this.getLineView(this.options.activeID, this.options.oldRoot);
        var drawlayer = $('#'+M.ViewManager.getCurrentPage().drawlayer.id);

        // dock item to newPanel
        var hiddenbread = new M.BreadcrumbView;
        // .breadcrumbs-dock hides last breadcrumb-item
        hiddenbread.defineFromModel(this.getModel(this.options.activeID));
        var item = $(hiddenbread.render()).addClass('breadcrumbs-dock').appendTo(drawlayer);
        var endBreadcrumbHeight = item[0].clientHeight;

        // if there's no helper, create a docking-clone
        if (r.createDockElem) {
            activeView = activeView.header.name.text;
            this.options.dockElem = $('#'+activeLineView.id)[0].cloneNode(true);
        }
        // prepare to dock into panelContext
        // deal with panel-object-format for helper-object?

        // determine docking destination-coordinates
        // expand height of breadcrumb-box if needed
        // fade-in hidden breadcrumb-box over original
        // change DOM content at the end, destroying animated one

        // add destination-placeholder at activeID
        // mark title-text location in
        // fade out any lost-breadcrumbs; transform breadcrumb-hyperlink into text.
    }
};