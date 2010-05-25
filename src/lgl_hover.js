/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require lgl_ui
 */
if (!LGL || !LGL.UI) throw "lgl_ui required";

/**
 * Usage
 * 1. passing hoverOn element in the constructor, meaning each hoverOn element 
 * 	  will have a distinct instance of hover window be created
 *    
 * 2. create a single hover window instance and bind this instance with multiple
 *    element. Could be done by passing a CSS selector in the constructor or
 *    call bind method directly in client code
 * 
 * @hoverOn optional, the element on which this hover window will be triggered
 * @options 
 * 		- className: the className to set on the container, default to 'hover-window'
 * 		- closeOnLeave: hide hover when mouse leave the hover window ?
 * 		- closeOnClick: hide hover when mouse click on the hover window ?
 * 		- onBeforeShow: callback before hover window show. Good place to put into the
 * 						content of the window. Acceptable parameter: event, this (hoverwindow)
 * 		- onAfterShow: callback after hover window show
 * 		- onHide: callback when hover window hide
 */
LGL.UI.Hover = Class.create({
	initialize: function(hoverOn, options) {
		var defOptions = {
			className: 'lgl-hover',
    		offsetDown: 20,
	    	offsetLeft: 12,
			closeOnLeave: true,
			closeOnClick: true,
			onBeforeShow: null,
			onAfterShow: null,
			onHide: null,
			delay: 1,
			content: null,
			getContent: null
		};
		var opt = Object.extend(Object.extend({}, defOptions), options || {});
		
      c = new Element('div', {className: opt.className + ' clearfix'});
      var content = $(opt.content)
		if (!content) {
		   if (opt.getContent) {
		      c.insert(opt.getContent());
		   } else {
		      c.insert('loading...');
		   }
		} else {
		   content.show();
		   c.insert(content);
		}
		c.lglObj = this;
		c.setStyle({position:'fixed'});
		if (opt.closeOnLeave)
			c.observe('mouseleave', function(ev){this.hide();});
		if (opt.closeOnClick)
			c.observe('click', function(ev){this.hide();});
		this.options = opt;
		this.container = c; 
		if (hoverOn) this.bind(hoverOn);
	},
	
	/**
	 * bind this to hoverOn 
	 */
	bind: function(hoverOn) {
		var bind_ = function(el) {
			//el.lglObj = this;
			el.observe('mouseenter', function(ev){
			   this.timer = this.show.bind(this, ev).delay(this.options.delay);
			}.bindAsEventListener(this));
			el.observe('mouseleave', function(ev){
			   if (this.timer) {
			      try {
			         window.clearTimeout(this.timer);
			      } catch (e) {/*ignore*/}
			   }
			}.bindAsEventListener(this));
		}.bind(this);
		if ($(hoverOn))
			bind_($(hoverOn));
		else
			//try to bind to group of elements using selector
			$$(hoverOn).each(function(el){
				bind_(el);
			});
	},
	
	/**
	 * Show hover window
	 * @event the mouseover event triggered this method
	 */
	show: function(event) {
	   try {
	      if (this.options.onBeforeShow) this.options.onBeforeShow(event, this);
	      Event.fire(this.container, 'lgl:beforeShow', event, false);
	   } catch (e) {
	      if (e != $break) throw e;
	      else return;
	   }
		var a = event.target;
		var xy = a.cumulativeOffset()
		this.position(xy);
		this.container.setStyle({
			zIndex: a.style.zIndex + LGL.UI.ZIndexDelta.Hover			
		});
		a.up().insert(this.container);
		this.container.show();
      this.currentElement = a;
      try {
         if (this.options.onAfterShow) this.options.onAfterShow(event, this);
         Event.fire(this.container, 'lgl:afterShow', event, false);
      } catch (e) {
         if (e != $break) throw e;
         else this.hide(); 
      }
	},
	position: function(xy) {
		var offsetLeft = this.options.offsetLeft;
		var offsetDown = this.options.offsetDown;
		var left = xy[0] + offsetLeft;
		var top = xy[1] + offsetDown;
		var w = this.container.getWidth();
		var h = this.container.getHeight();
		if (xy[1] + h > document.viewport.getHeight()) {
			top = xy[1] - (h + offsetDown); 
		}
		if (xy[0] + w > document.viewport.getWidth()) {
			left = xy[0] - (w + offsetLeft);
		}
		this.container.setStyle({
			top: top + 'px',
			left: left + 'px'
		});
	},
	hide: function() {
		var c = this.container.hide();
		if (this.options.onHide) this.options.onHide(this);
		Event.fire(this.container, 'lgl:hide', null, false);
	}
});

