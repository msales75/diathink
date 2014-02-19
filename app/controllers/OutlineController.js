

$D.PanelManager = M.Object.extend({
  type: 'PanelManager',
  nextpanel: {'': ''},
  prevpanel: {'': ''},
  rootViews: {},
  rootModels: {},
  count: 0,
  leftPanel: '',
  panelsPerScreen: 2,
  deleted: {},
  updateRoots: function() {
      var p=this.leftPanel;
      while ((p !== '')&&(M.ViewManager.getViewById(p))) {
          this.rootViews[p] = M.ViewManager.getViewById(p).outline.alist.id;
          this.rootModels[p] = M.ViewManager.getViewById(p).rootModel;
          p = this.nextpanel[p];
      }
  },
  getRank: function(id) {
      var n, panel = this.nextpanel[''];
      for (n=1; panel !== ''; ++n) {
          if (panel === id) { return n; }
          panel = this.nextpanel[panel];
      }
      return -1;
  },
  initFromDOM: function(grid) {
      this.insertAfter(grid.scroll2.id, '');
      this.insertAfter(grid.scroll1.id, '');
      this.updateRoots();

  },
  insertAfter: function(newid, previousid) {
      if ((this.nextpanel[newid]!==undefined) ||
          (this.prevpanel[newid]!==undefined) || (newid === '')) {
          console.log('Error inserting invalid id'); // error
          debugger;
          return;
      }
      if ((this.nextpanel[previousid]===undefined)||
          (this.prevpanel[previousid]===undefined)) {
          console.log('Error inserting panel previous-id'); // error
          debugger;
          return;
      }

      var oldnext = this.nextpanel[previousid];
      this.nextpanel[previousid] = newid;
      this.prevpanel[newid] = previousid;
      this.nextpanel[newid] = oldnext;
      this.prevpanel[oldnext] = newid;
      ++this.count;
      if (this.deleted[newid]) {
          delete this.deleted[newid];
      }

      // this.updateRoots();

      // Update leftPanel if necessary
      // decide whether we push-right or push-left?
      if (this.count===1) { // first panel
          this.leftPanel = newid;
          return 'right';
      }
      var leftOffset = this.getRank(this.leftPanel);
      var newOffset = this.getRank(newid);
      if ((leftOffset<1)||(newOffset<1)) {
          console.log("leftOffset or newOffset not defined for insert");
          debugger;
      }
      if (newOffset < leftOffset) {
          this.leftPanel = newid;
          return 'right'; // push panels to right
      } else if (newOffset >= leftOffset + this.panelsPerScreen) {
          this.leftPanel = this.nextpanel[this.leftPanel];
          return 'left'; // push panels to left
      } else {
          return 'right'; // push right with no change to leftPanel
      }
  },
  remove: function(id) {
      if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
          console.log('Error removing panel');
          debugger;
          return;
      }

      // Update leftPanel after removal
      // if there are enough panels
      // to the right to fill the screen,
      // move them left.  else fill from right, changing leftPanel.
      var direction = 'left';
      var offset = this.getRank(this.leftPanel);
      if (this.leftPanel === id) { // if leftPanel is being removed
          if ((this.prevpanel[this.leftPanel]==='') ||
              (this.count-1 >= this.panelsPerScreen + (offset-1))) {
              this.leftPanel = this.nextpanel[this.leftPanel];
              direction = 'left';
          } else {
              this.leftPanel = this.prevpanel[this.leftPanel];
              direction = 'right';
          }
      } else { // we are not deleting the leftPanel, but might change it
          if ((this.prevpanel[this.leftPanel]!=='') &&
              (this.count-1 < this.panelsPerScreen + (offset-1))) {
              this.leftPanel = this.prevpanel[this.leftPanel];
              direction = 'right';
          }
      }

      var next = this.nextpanel[id];
      var prev = this.prevpanel[id];
      --this.count;
      this.nextpanel[prev] = next;
      this.prevpanel[next] = prev;
      delete this.nextpanel[id];
      delete this.prevpanel[id];
      this.deleted[id] = id;
      return direction;
  },
  moveAfter: function(id, previousid) {
      if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
          console.log('Error moving panel');
          debugger;
          return;
      }
      if ((this.nextpanel[previousid]===undefined)||
          (this.prevpanel[previousid]===undefined)) {
          console.log('Error moving panel after previous-id'); // error
          debugger;
          return;
      }
      // remove id
      var next = this.nextpanel[id];
      var prev = this.prevpanel[id];
      this.nextpanel[prev] = next;
      this.prevpanel[next] = prev;

      // add-in after previousid
      var oldnext = this.nextpanel[previousid];
      this.nextpanel[previousid] = id;
      this.prevpanel[id] = previousid;
      this.nextpanel[id] = oldnext;
      this.prevpanel[oldnext] = id;
  }
});

// Note that controllers must be defined before view.
// TODO later support partial-list loading?

$D.OutlineManager = M.Object.extend({
    type: 'OutlineManager',
    outlines: {},
    deleted: {},
    add: function(id, controller) {
        if (this.deleted[id]) {
            if (controller !== this.deleted[id]) {
                console.log('ERROR: incompatible deleted outline');
                debugger;
            }
            this.outlines[id] = this.deleted[id];
            delete this.deleted[id];
        } else {
            this.outlines[id] = controller;
        }
    },
    remove: function(id) {
        this.deleted[id] = this.outlines[id];
        delete this.outlines[id];
    }

});


$D.OutlineController = M.Controller.extend({
    type: '$D.OutlineController',
    rootID: null,
    bindView: function(view) { // bind this constructor-instance to this view
        this.rootID = view.id;
        view.setRootID();
        this.rootModel = view.rootModel;
        this.deleted = false;
        $D.OutlineManager.add(this.rootID, this);
    },
    destroy: function() {
        var i, v, view, models;
        $D.OutlineManager.remove(this.rootID);
        this.deleted = true;
        // destroy the outline-entries but not the root
        view = M.ViewManager.getViewById(this.rootID);
        if (view.value) {
            models = view.value.models;
            for (i=0; i<models.length; ++i) {
                models[i].views[this.rootID].destroy();
            }
        }
        // don't destroy outline-ul-shell-view?
    },
    setData: function(key, val) {
        if (!this.data) {this.data = {};}
        if (val!=null) {
            this.data[key] = val;
        } else {
            delete this.data[key];
        }
    },
    getData: function(key) {
        if (!this.data) {return null;}
        else if (this.data[key] == null) {return null;}
        else {return this.data[key];}
    },
    listObject: [] // list-data for top-level of outline
});

$D.dummyController = M.Controller.extend({
    dummyListClicked:function (id, nameId) {
        //console.log('You clicked on the list item with the DOM id: ', id, 'and has the name', nameId);
    },
    listObject:[]
});

// nest horizontal pages, expand/contract? drag/drop?
// save perspectives? hmm.
// TODO: Where do we store and check for triggers?


