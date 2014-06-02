///<reference path="View.ts"/>
m_require("app/views/View.js");
class HeaderMessageView extends View {
    parentView:HeaderToolbarView;
    value:string = "";
    type:string = "";
    isActive:boolean = false;
    timer:number = null;
    layoutDown() {
        this.layout = {
            top: 4,
            left: Math.round(0.3*(this.parentView.layout.width-110)),
            height: this.parentView.layout.height-8,
            width: Math.round(0.6*(this.parentView.layout.width-110))
        }
    }
    render() {
        this._create({
            type: 'div',
            classes: 'message',
            html: this.value
        });
        this.setPosition();
        return this.elem;
    }
    renderUpdate() {
        this.elem.innerHTML = this.value;
        if (this.type==='action') {
            this.removeClass('hover');
        } else if (this.type==='hover') {
            this.addClass('hover');
        }
    }
    setValue(val:string, type:string) {
        var self:HeaderMessageView = this;
        if (this.isActive) {
            clearTimeout(this.timer);
            this.value= "";
            this.renderUpdate();
            this.timer = setTimeout(function() {
                self.isActive=false;
                self.setValue(val, type);
            }, 20);
        } else {
            this.isActive = true;
            this.value = val;
            this.type = type;
            this.renderUpdate();
            this.timer = setTimeout(function() {
                self.isActive = false;
                self.clearValue();
            }, 600);
        }
    }
    clearValue() {
        this.value= "";
        this.timer = null;
        this.isActive=false;
        this.renderUpdate();
    }
}

