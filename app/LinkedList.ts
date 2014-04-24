///<reference path="views/View.ts"/>
class LinkedList<T> {
    count:number;
    obj:{[k:string]:T};
    next:{[k:string]:string};
    prev:{[k:string]:string};
    deleted:{[k:string]:string};

    constructor() {
        this.reset();
    }

    get(id:string):T {
        return this.obj[id];
    }

    first():string {
        return this.next[''];
    }
    last():string {
        return this.prev[''];
    }

    reset() {
        this.obj = {};
        this.next = {'': ''};
        this.prev = {'': ''};
        this.count = 0;
        this.deleted = {};
    }

    /*
    getRank(id:string):number { // currently unused
        var n, panel = this.next[''];
        for (n = 1; panel !== ''; ++n) {
            if (panel === id) { return n; }
            panel = this.next[panel];
        }
        return -1;
    }
    */

    insertAfter(newid:string, obj:T, previousid:string) {
        assert((this.next[newid] === undefined) &&
            (this.prev[newid] === undefined) && (newid !== ''),
            "Error inserting invalid id");
        assert((this.next[previousid] !== undefined) &&
            (this.prev[previousid] !== undefined),
            "Error inserting panel previous-id");
        var oldnext = this.next[previousid];
        this.next[previousid] = newid;
        this.prev[newid] = previousid;
        this.next[newid] = oldnext;
        this.prev[oldnext] = newid;
        this.obj[newid] = obj;
        ++this.count;
        if (this.deleted[newid]) {
            delete this.deleted[newid];
        }
    }

    append(newid:string, obj:T) {
        assert((this.next[newid] === undefined) &&
            (this.prev[newid] === undefined) && (newid !== ''),
            "Error inserting invalid id");
        var oldlast = this.prev[''];
        this.next[oldlast] = newid;
        this.prev[newid] = oldlast;
        this.next[newid] = '';
        this.prev[''] = newid;
        this.obj[newid] = obj;
        ++this.count;
        if (this.deleted[newid]) {
            delete this.deleted[newid];
        }
    }

    remove(id:string) {
        if ((this.next[id] === undefined) || (this.prev[id] === undefined) || (id === '')) {
            console.log('Error removing panel');
            debugger;
            return;
        }
        var next = this.next[id];
        var prev = this.prev[id];
        --this.count;
        this.next[prev] = next;
        this.prev[next] = prev;
        delete this.next[id];
        delete this.prev[id];
        delete this.obj[id];
        this.deleted[id] = id;
    }

    moveAfter(id:string, previousid:string) { // currently unused
        if ((this.next[id] === undefined) || (this.prev[id] === undefined) || (id === '')) {
            console.log('Error moving panel');
            debugger;
            return;
        }
        if ((this.next[previousid] === undefined) ||
            (this.prev[previousid] === undefined)) {
            console.log('Error moving panel after previous-id'); // error
            debugger;
            return;
        }
        // remove id
        var next = this.next[id];
        var prev = this.prev[id];
        this.next[prev] = next;
        this.prev[next] = prev;
        // add-in after previousid
        var oldnext = this.next[previousid];
        this.next[previousid] = id;
        this.prev[id] = previousid;
        this.next[id] = oldnext;
        this.prev[oldnext] = id;
    }

    validate() {
        assert(_.size(this.obj)===this.count,
            "LinkedList does not have correct obj size");
        assert(_.size(this.next)===this.count+1,
            "LInkedList does not have correct next size");
        assert(_.size(this.prev)===this.count+1,
            "Linked List does not have correct prev size");
        assert(this.next[''] !== undefined, "Next does not have '' defined");
        assert(this.prev[''] !== undefined, "Prev does not have '' defined");
        assert(this.obj[''] === undefined, "obj cannot have '' defined");
        var next= this.next;
        var prev= this.prev;
        var k:string;
        for (k in next) {
            assert(next[next[k]]!==undefined, "LinkedList has next is not closed");
            assert(prev[k]!==undefined, "LinkedList has prev is not complete");

            assert(prev[next[k]] === k, "LinkedList prev*next is not identity")
            assert(next[prev[k]] === k, "LinkedList prev*next is not identity")
            assert(this.deleted[k]===undefined, "Deleted is defined in linked list for "+k);
            if (k!=='') {
                assert(this.obj[k]!==undefined, "LinkedList has obj is not complete");
                if (typeof this.obj[k]!=='boolean') { // allow null values for model-values not in view
                    if (this.obj[k] instanceof PModel) {
                        assert(this.obj[k]['cid'] === k, "LinkedList with OutlineNodeModel does not have cid="+k);
                    } else {
                        assert(this.obj[k]['id'] === k, "LinkedList does not have matching id="+k);
                    }
                }
            }
        }
        for (k in this.deleted) {
            assert(next[k]===undefined, "Deleted "+k+" is still in next");
            assert(prev[k]===undefined, "Deleted "+k+" is still in prev");
            assert(this.obj[k]===undefined, "Deleted "+k+" is still in obj");
        }
    }
}