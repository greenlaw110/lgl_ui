/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require lgl_hover
 */
if (!LGL || !LGL.UI || !LGL.UI.Hover) throw "lgl_hover required";

LGL.UI.Tip = Class.create(LGL.UI.Hover, {
	initialize:function($super, hoverOn, options) {
		$super(hoverOn, Object.extend(Object.clone(LGL.UI.Tip.defaultOptions),options || {}));
		this.container.addClassName('lgl-tip');
		this.container.observe('lgl:beforeShow', function(ev){
			var ev0 = ev.memo;
			var hoverOn = ev0.target;
			hoverOn.lglObj = this;
			hoverOn.observe('mousemove', function(ev){
				var xy = [ev.pointerX(), ev.pointerY()];
				this.position(xy);
			}.bind(this));
			hoverOn.observe('mouseleave', function(ev){
				var hoverOn = ev.target;
				var obj = hoverOn.lglObj;
				obj.hide();
				hoverOn.stopObserving('mousemove');
				hoverOn.stopObserving('mouseleave');
			});
		}.bind(this));
	}
});

Object.extend(LGL.UI.Tip,{
    defaultOptions: {
		delay: 0,
		onBeforeShow: function(ev, lglObj){
         lglObj.container.update('');
			var hoverOn = ev.target;
			var tip = hoverOn.title;
			if (tip) {
			   hoverOn.tip = tip;
				lglObj.container.update(tip);
				hoverOn.title = '';
			}
		},
		onHide: function(lglObj) {
		   var hoverOn = lglObj.currentElement;
		   if (!hoverOn) return;
		   var tip = hoverOn.tip;
		   hoverOn.title = tip;
		   lglObj.container.update('');
		}
    },
    bind: function (onHover) {
    	if (!LGL.UI.Tip.global) {
    		LGL.UI.Tip.global = new LGL.UI.Tip('*[title]');
    	}
    	LGL.UI.Tip.global.bind(onHover);
    }
});

document.observe('dom:loaded', function() {LGL.UI.Tip.global = new LGL.UI.Tip('*[title]');});
