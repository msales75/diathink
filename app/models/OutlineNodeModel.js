
diathink.OutlineNodeModel = M.Model.create({
    __name__:'OutlineNode',
    // server_id: M.Model.attr('String', {}),
    text: M.Model.attr('String', {}),
    parent: M.Model.hasOne('OutlineNode', {}),
    reference:M.Model.hasOne('OutlineNode', {}),
    children: M.Model.attr('ReferenceList', {}),
    tags: M.Model.attr('ReferenceList', {}),
    triggers:M.Model.attr('ReferenceList', {}),
    importJSON: function(json) {
        if( Object.prototype.toString.call( json ) === '[object Array]' ) {
            for (var i=0; i<json.length; ++i) {
                // this.importJSON(json[i]);
            }
        } else {
            if (json['name']) {
                // this.importJSON(json[i]);
            }
        }
    }
});
