
// todo: do linePlaceholderAnimFlag (for each view)

/*
* 'dock or indent' should be combined.
 *   helper -> dockElem
* oldContext/newContext --> oldModelContext/newModelContext
*   rOldModelContext, rNewModelContext,
*   oldView/newView-> oldRoot/newRoot;
*   rOldRoot, rNewRoot, rOldType,+ rNewType
*   performDock; createDockElem
*   createModel, destroyModel
* rOldPanelPlaceholder, rNewPanelPlaceholder (once)

* activeElem (line or panel, for animation)
 *     createActiveLineView -> createLineElem/destroyLineElem (per-root)
 *     rOldLinePlaceholder, rNewLinePlaceholder (per-root)
 *     neighbor -> rOldViewNeighbor

 preDock-

Rename:
 contextParentVisible / newParentView ?
 newContext = ?
 (collapse-stuff is still messy?)

* all non-create/delete ops should have oldContext and newContext not-null

anim=dock or indent -> dockAnim requires old and newContext
oldView and newView define (outline)-view? --> change to oldRoot and newRoot
similarly oldContext and newContext
flag options.focus
activeLineView != null
if that.options.helper
if createActiveLineView (newContext is not null, newParentView is not null, but view doesn't exist)
newParentView (contextParentVisible for newContext)
if (this.runtime.activeElem[view.rootID]
if (that.runtime.newLinePlaceholder[outline.rootID]) (where to put active-elem)
if (that.runtime.rOldLinePlaceholder[outline.rootID]) (need to remove it)
if (neighbor) (fixup old location)
// if oldParentView & (collapsed)
if (!activeLineView) - if view's not inside panel, check for panel-breadcrumb modifications
if oldType==line and/or newType==='line'

 if ((this.runtime.rOldLinePlaceholder[outline.rootID] || this.runtime.newLinePlaceholder[outline.rootID])&&
 (this.options.anim !== 'indent')) {

animation-tests: startColor/endCOlor; startSize/endSize

 activeID, referenceID
if  options.focus that.focus() (uses undo for newView & getLineView)

// get context if not first-run (not undo-redo)
// dockAnim.newView depends on undo (newVIew/oldView)



Options: activePanel, helper
newPanelContext, oldPanelContext,
oldType, newType
drawlayer
oldLinePlace, newPlace (lines-only)
hiddenbread (fades in to show new panel-title)
endBreadcrumbHeight

rOldLinePlaceholder

activeLineView?

    What do these mean?
Data:
*/

// these functions are extended onto the Action prototype.
