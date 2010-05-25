if (!LGL || !LGL.UI || !LGL.UI.Hover) throw "lgl_modal required";

LGL.UI.HoverMenu = Class.create(LGL.UI.Hover, {
   /**
    * configure: [
    *    {caption: 'menu1', handler: function(){...}}
    *    {caption: 'menu2', handler: ...}
    * ]
    * 
    */
   initialize: function($super, hoverOn, options, configure) {
      if (!configure || configure.length < 1) throw 'bad menu configuration';
      var ul = new Element('ul', {className: 'menu'});
      for (var i = 0; i < configure.length; ++i) {
         var confItem = configure[i];
         var cap = confItem.caption; if (!cap) throw 'bad menu configuration';
         var h = confItem.handler; if (!h || !Object.isFunction(h)) throw 'bad menu configuration';
         var li = new Element('li', {className: 'item'});
         li.update(cap);
         li.handler = h;
         ul.insert(li);
      }
      ul.observe('click', function(ev){
         var li = ev.findElement('li.item');
         if (li) {
            if (li.handler) li.handler.bind(this)();
            else LGL.UI.alert('Error: no handler registered to [' + li.innerHTML + ']');
         }
      });
      this.menuUI = ul;
      
      $super(hoverOn, Object.extend({
         getContent: function() {return this.menuUI;}.bind(this),
         offsetLeft: 18,
         offsetDown: 8,
      }, options || {}));
   }
});

