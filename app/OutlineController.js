
m_require("app/foundation/object.js");

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
      while ((p !== '')&&(View.get(p))) {
          this.rootViews[p] = View.get(p).outline.alist.id;
          this.rootModels[p] = View.get(p).value;
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

      // Update leftPanel if necessary
      // decide whether we push-right or push-left
      // MUST slide right if there is no rightPanel
      // SHOULD slide left if it's put after last panel
      // Default slide right
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
      } else if (newOffset >= leftOffset + this.panelsPerScreen) { // last panel on screen
          this.leftPanel = this.nextpanel[this.leftPanel];
          return 'left'; // push panels to left
      } else {
          return 'right'; // push right with no change to leftPanel
      }
  },
  remove: function(id, slide) {
      if ((this.nextpanel[id]===undefined) || (this.prevpanel[id]===undefined) || (id==='')) {
          console.log('Error removing panel');
          debugger;
          return;
      }

      // Update leftPanel after removal
      var offset = this.getRank(this.leftPanel)-1;
      var isPanelToLeft = !(this.prevpanel[this.leftPanel]==='');
      var isPanelToRight = (this.count - offset > this.panelsPerScreen);
      var direction = 'left'; // default
      if (!isPanelToLeft) { // must slide left
          direction = 'left';
      } else if (isPanelToLeft && !isPanelToRight) { // must slide right
          direction = 'right';
      } else {
          if (slide==='right') {
              direction='right';
          }
      }

      if (this.leftPanel === id) { // if leftPanel is being removed
          if (direction==='left') {
              this.leftPanel = this.nextpanel[this.leftPanel];
          } else {
              this.leftPanel = this.prevpanel[this.leftPanel];
          }
      } else {
          if (direction==='left') {
              // leftPanel is unchanged.
          } else if (direction==='right') {
              this.leftPanel = this.prevpanel[this.leftPanel];
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
  moveAfter: function(id, previousid) { // currently unused
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

// the delegation here is confusing: who is resposiblef or what?
$D.OutlineController = M.Object.extend({
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
        view = View.get(this.rootID);
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
    }
});

// nest horizontal pages, expand/contract? drag/drop?
// save perspectives? hmm.
// TODO: Where do we store and check for triggers?


