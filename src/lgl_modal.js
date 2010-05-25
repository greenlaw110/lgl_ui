if (!LGL || !LGL.UI)
   throw "lgl_ui required";

LGL.UI.Overlay = {
   id : '_overlay',
   loaded : false,
   container : false,
   lastOpacity : 0,
   styles : {
      background : '#444',
      position : 'fixed',
      top : 0,
      left : 0,
      width : '100%',
      height : '100%',
      zIndex : LGL.UI.ZIndex.Overlay
   },
   ieStyles : {
      background : '#444',
      position : 'absolute',
      top : 0,
      left : 0,
      zIndex : LGL.UI.ZIndex.Overlay
   },
   effects : {
      fade : false,
      appear : false
   },
   load : function() {
      if (LGL.UI.Overlay.loaded)
         return false;
      LGL.UI.Overlay.loaded = true;
      LGL.UI.Overlay.container = new Element('div', {
         id : LGL.UI.Overlay.id
      });
      $(document.body).insert(LGL.UI.Overlay.container);
      if (Prototype.Browser.IE) {
         LGL.UI.Overlay.container.setStyle(LGL.UI.Overlay.ieStyles);
         Event.observe(window, 'scroll', LGL.UI.Overlay.positionOverlay);
         Event.observe(window, 'resize', LGL.UI.Overlay.positionOverlay);
      } else
         LGL.UI.Overlay.container.setStyle(LGL.UI.Overlay.styles);
      LGL.UI.Overlay.container.hide();
      return true;
   },
   unload : function() {
      if (!LGL.UI.Overlay.loaded)
         return false;
      Event.stopObserving(window, 'resize', LGL.UI.Overlay.positionOverlay);
      LGL.UI.Overlay.container.remove();
      LGL.UI.Overlay.loaded = false;
      return true;
   },
   show : function(opacity, fade) {
      LGL.UI.Overlay.lastOpacity = opacity;
      var c = LGL.UI.Overlay.container;
      if (Prototype.Browser.IE) {
         LGL.UI.setIEOpacity(c, opacity);
      }
      if (fade) LGL.UI.appear(c, {duration: .5, to: .5});
      else c.show(); 
      return true;
   },
   hide : function(fade) {
      var c = LGL.UI.Overlay.container;
      if (LGL.UI.Overlay.effects.appear)
         LGL.UI.Overlay.effects.appear.cancel();
      if (fade) {
         LGL.UI.fade(c, {duration: .5, from: .5});
      } else {
         c.hide();
      }
      return true;
   },
   // IE only
   positionOverlay : function() {
      LGL.UI.Overlay.container.setStyle( {
         width : document.body.clientWidth + 'px',
         height : document.body.clientHeight + 'px'
      });
   }
};

/**
 * Usage: call new LGL.UI.ModalWindow.show();
 */
LGL.UI.Modal = Class.create( {
   initialize : function(options) {
      var defOptions = {
         overlayOpacity : .5,
         id : '_modal',
         className : 'lgl-modal',
         closeOnClick : false,
         closeOnClickOverlay : true,
         /*
          * callback before modal window open. Good place to fillin content to
          * this window. @param: the modal window object
          */
         onBeforeShow : null,
         /*
          * callback after modal window open. @param: the modal window object
          */
         onAfterShow : null,
         /*
          * callback when modal window hide @param: the modal window object
          */
         onHide : null,
         /*
          * callback when 'enter' key pressed
          */
         onEnterKey : null,
         /*
          * call back when 'escape' key pressed
          */
         onEscapeKey : null
      };
      var opt = Object.extend(Object.extend( {}, defOptions), options || {});
      this.options = opt;
      var c
      if ($(opt.container)) {
         c = $(opt.container);
         c.addClassName(opt.className);
      } else {
         c = new Element('div', {
            id : opt.id,
            className : opt.className
         });
         c.insert('loading...');
      }
      c.setStyle( {
         position : 'fixed',
         zIndex : LGL.UI.ZIndex.Modal
      });
      if (opt.closeOnClick)
         c.observe('click', function(ev) {
            this.hide();
         });
      c.lglObj = this;
      if (!$(opt.container))
         $(document.body).insert(c);
      c.hide();
      this.container = c;
   },
   show : function() {
      var overlay = LGL.UI.Overlay;
      if (!overlay.load()) { 
         this.show.bind(this).delay(.5);
         return;
      }
      overlay.show(this.options.overlayOpacity, true);
      var c = this.container;
      if (this.options.onBeforeShow)
         this.options.onBeforeShow(this);
      Event.fire(c, 'lgl:beforeShow', this, false);
      this.refresh();
      if (this.options.closeOnClickOverlay)
         overlay.container.observe('click', this.hide.bind(this, true));
      this.onKeyDown = function(ev) {
         switch (ev.keyCode) {
         case Event.KEY_RETURN:
            if (this.options.onEnterKey)
               this.options.onEnterKey();
            break;
         case Event.KEY_ESC:
            if (this.options.onEscapeKey)
               this.options.onEscapeKey();
            break;
         default:
         }
      }.bind(this);
      document.observe('keydown', this.onKeyDown);
      if (this.options.onAfterShow)
         this.options.onAfterShow(this);
      Event.fire(c, 'lgl:afterShow', this, false);
      return this; // help to do something like var x = new modal().show();
   // x.doSthElse()...
},
refresh : function() {
   var c = this.container;
   var xy = document.viewport.getDimensions();
   xy = [ xy.width, xy.height ];
   var xyc = [ c.getWidth(), c.getHeight() ];
   var top = xy[1] / 2 - xyc[1] / 2;
   var left = xy[0] / 2 - xyc[0] / 2;
   c.setStyle( {
      top : top + 'px',
      left : left + 'px'
   });
   c.show();
},
hide : function() {
   var c = this.container;
   c.hide();
   LGL.UI.Overlay.hide(true);
   LGL.UI.Overlay.unload();
   c.stopObserving('keydown');
   if (this.options.onHide)
      this.options.onHide(this);
   Event.fire(c, 'lgl:hide', this, false);
   document.stopObserving('keydown', this.onKeyDown);
}
});
