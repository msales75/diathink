/**
 * Created by Mark on 2/24/14.
 */
class Model {
    public static type = 'Model';
    private static modelList = {};
    private static nextCid:number = 0;
    private static getNextCid() {
        this.nextCid = this.nextCid + 1;
        return 'c' + this.nextCid;
    }
    public static get(cid) {
        return this.modelList[cid];
    }
}
