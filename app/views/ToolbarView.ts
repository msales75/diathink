///<reference path="View.ts"/>
m_require("app/views/View.js");
M.TOP = 'header';
M.BOTTOM = 'footer';
M.LEFT = 'LEFT';
M.CENTER = 'CENTER';
M.RIGHT = 'RIGHT';
class ToolbarView extends View {
    // anchorLocation = M.TOP;
   // showBackButton = NO;
    // isFixed = YES;
    // isPersistent = YES;
    // toggleOnTap = NO;

    render() {
        this._create({
            type: 'div',
            classes: this.cssClass
            // html: '<div class="ui-btn-left"></div><h1></h1><div class="ui-btn-right"></div>'
        });
        // this.elem.setAttribute('data-role', this.anchorLocation);
        //if (this.isFixed) {
            // this.elem.setAttribute('data-position', "fixed");
        //}
       // if (this.isPersistent) {
            // this.elem.setAttribute('data-id',"themprojectpersistenttoolbar");
       // }
        this.renderChildViews();
        this.setPosition();
        var viewPositions = {};
        for (var v in this.childViewTypes) {
            var child = this[v];
            this.elem.appendChild(child.elem);
            /*
            assert(!viewPositions[child.anchorLocation],
                'ToolbarView has two items positioned at M.' + child.anchorLocation +
                    '.  Only one item permitted in each location');
            viewPositions[child.anchorLocation] = YES;
            switch (child.anchorLocation) {
                case M.LEFT:
                    this.elem.children[0].appendChild(child.elem);
                    break;
                case M.CENTER:
                    this.elem.children[1].appendChild(child.elem);
                    break;
                case M.RIGHT:
                    this.elem.children[2].appendChild(child.elem);
                    break;
                default:
                    assert(false,
                        'ToolbarView children must have an anchorLocation of M.LEFT, M.CENTER, or M.RIGHT');
                    return null;
            }
            */
        }
        return this.elem;
    }
}