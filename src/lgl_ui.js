/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require none
 */
if (!LGL) var LGL={};

LGL.UI = {
	ZIndexDelta: {
		Scrolldicator: 20,
		Scrollbar: 10,
		Hover: 10,
		eof: 0
	},
	ZIndex: {
		Overlay: 9998,
		Modal: 9999
	},
	EffectOptions: {
	   duration: 2,
	},
	appear: function(el, options) {
	   el = $(el);
	   if (!el) return;
	   if (!Effect) {
	      el.show();
	   } else {
	      el.appear(Object.extend(Object.extend(Object.clone(LGL.UI.EffectOptions),{to:1.0}), options || {}));
	   }
	},
	fade: function(el, options) {
      el = $(el);
      if (!el) return;
      if (!Effect) {
         el.hide();
      } else {
         el.fade(Object.extend(Object.clone(LGL.UI.EffectOptions), options || {}));
      }
	},
	disappear: function(el, options) {
	   LGL.UI.fade(el, Object.extend({to: 0}, options || {}));
	},
	show: function(el) {
		el = $(el);
		if (el) el.show();
	},
	hide: function(el) {
		el = $(el);
		if (el) el.hide();
	},
	getIEOpacity: function(opacity) {
		if (Prototype.Browser.IE) {
			return 'alpha(opacity =' + 100 * opacity + ')';
		} else {
			return opacity;
		}
	},
	setIEOpacity: function(element, opacity){
		if (Prototype.Browser.IE) {
			Element.setStyle(element, {filter: LGL.UI.getIEOpacity(opacity)});
		} else {
			// do nothing
		}
	},
	eof:''
};
