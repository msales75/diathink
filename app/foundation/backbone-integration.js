
Backbone.RelationalModel.prototype.addView = function(view) {
    if (!this.views) {this.views = {};}
    if (view.rootID && !this.views[view.rootID]) {
        this.views[view.rootID] = view;
    }
}

Backbone.RelationalModel.prototype.dropView = function(view) {
    if (this.views && view.rootID && this.views[view.rootID]) {
        delete this.views[view.rootID];
    }
}
