/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require lgl_modal
 */
if (!LGL || !LGL.UI || !LGL.UI.Modal) throw "lgl_modal required";

LGL.UI.Dialog = Class.create(LGL.UI.Modal, {
	initialize: function($super, message, options) {
		$super(Object.extend(Object.clone(LGL.UI.Dialog.defaultOptions),options || {}));
		var c = this.container;
		c.addClassName('dialog');

		var content = new Element('div', {className: 'content clearfix'});
		c.update(content);
		c.content = content;
		c.setStyle({
		   maxWidth: '400px'
		});

		var p = new Element('p');p.update(message);
		content.insert(p);
		
		// for sub class usage
		if (this.addContent) this.addContent(content);
		
		var footer = new Element('div', {className: 'footer clearfix'});
		content.insert(footer);
		c.footer = footer;
		
		var ul = new Element('ul', {className: 'actions'});
		footer.update(ul);
		
		if (this.options.onFinally) {
		   if (this.options.onHide) {
		      var f1 = this.options.onHide;
		      var f2 = this.options.onFinally;
		      this.options.onHide = function() {
		         f1();
		         f2();
		      }
		   } else {
		      this.options.onHide = this.options.onFinally;
		   }
		}
		
		document.observe('lgl:hide', function(ev){
		   if (ev.memo == this) {
		      this.container.remove();
		   }
		}.bind(this));
	},
	addButton: function(btn) {
		var footer = this.container.footer;
		
		var li = new Element('li');
		li.insert(btn);
		footer.down('ul').insert(li);
		if (btn.title && LGL.UI.Tip)
			LGL.UI.Tip.bind(btn);
	},
	/**
	 * Usage: dialog.addHandler({ caption: 'Yes', //default to 'Okay' value:
	 * true, //default to true closeDialog: true, //default to true callback:
	 * function(){...} //default to null });
	 */
	addHandler: function(handler) {
		var defHandler = {
			caption: 'Okay',
			value: true,
			closeDialog: true,
			title: '',
			callback: false
		};
		var h = Object.extend(defHandler, handler || {});
		var btn = new Element('input', {type: 'button', value: h.caption, title: h.title});
		btn.lglHandler = h;
		btn.lgl_dialog = this;
		btn.observe('click', function() {
			var h = this.lglHandler;
			if (h) {
				if (h.callback) h.callback.defer();
				if (h.closeDialog) this.lgl_dialog.hide();
			} else this.hide();
			Event.fire(document, 'lgl:dialog:action', this.lgl_dialog, false);			
		}.bind(btn));
		this.addButton(btn);
	}
});

Object.extend(LGL.UI.Dialog,{
    defaultOptions: {
		overlayOpacity: .5,
    },
    onFinally: null
});

Object.extend(LGL.UI, {
    alert: function(message) {
    	new LGL.UI.Alert(message).show();
    },
    /**
     * Usage: LGL.UI.alertAjaxError('error loading message...', error);
     * @message: the message
     * @error: could be ajax transport or exception
     * @require: accordion.js and accordion.css
     */
    alertAjaxError: function(message, error) {
       new LGL.UI.AjaxErrorAlert(message, error).show();
    },
    confirm: function(message, options) {
    	new LGL.UI.Confirm(message, options).show();
    },
    input: function(message, options) {
       new LGL.UI.Input(message, options).show();
    }
});

LGL.UI.Alert = Class.create(LGL.UI.Dialog, {
	initialize: function($super, message, options) {
		$super(message, Object.extend({
         closeOnClickOverlay: false,
         onEnterKey: this.hide.bind(this),
         onEscapeKey: this.hide.bind(this)
      }, options || {}));
		this.container.addClassName('alert');
		this.addHandler({caption: 'Okay'});
	}
});

LGL.UI.AjaxErrorAlert = Class.create(LGL.UI.Alert, {
   initialize: function($super, message, error, options) {
      if (error) {
         errMsg = error.responseText ? error.responseText : error.message ? error.message : error;
         message = message + "<ul id='alert_ajax_error' style='margin:1em 0 .5em 0;font-weight:normal'><li class='section'><a href='#' class='title'>show error details</a><div class='toggle' style='display:none;padding:.5em;color:#c00;background:whitesmoke;'>" + errMsg + '</div></li></ul>' ;
         message = message + "<script type='text/javascript'>new Accordion('alert_ajax_error');</script>";
      }
      $super(message, options);
   }
});

/**
 * Usage:
 * 
 * new LGL.UI.Confirm('Do you want to continue ?', { onYes: function() {...},
 * onNo: function() {...} });
 */
LGL.UI.Confirm = Class.create(LGL.UI.Dialog, {
	initialize: function($super, message, options) {
		$super(message, Object.extend({
		   closeOnClickOverlay: false,
		   onEnterKey: function(){
		      if (this.onYes) this.OnYes.defer();
		      this.hide();
		   }.bind(this),
		   onEscapeKey: function() {
		      if (this.onNo) this.onNo.defer();
		      this.hide();
		   }.bind(this)
		}, options || {}));
		this.container.addClassName('confirm');
		this.onYes = options.onYes;
		this.onNo = options.onNo;
		this.addHandler({
			caption: 'Yes',
			callback: function() {
				if (this.onYes) this.onYes();
			}.bind(this)
		});
		this.addHandler({
			caption: 'No',
			title: 'Click to say bye!',
			callback: function() {
				if (this.onNo) this.onNo();
			}.bind(this)
		});
	}
});


/**
 * Usage:
 * 
 * new LGL.UI.Input('Input this field', {onOkay: function(){...}});
 */
LGL.UI.Input = Class.create(LGL.UI.Dialog, {
   addContent: function(container) {
      this.input = new Element('input', {type:'text', size:50});
      this.input.setStyle({marginBottom:'1em'});
      container.insert(this.input);
      this.input.observe('change', function(ev){
         var input = this.container.down('input');
         if (input)
            this.value=input.value;
      }.bind(this));
   },
   initialize: function($super, message, options) {
      $super(message, Object.extend({
         closeOnClickOverlay: false, 
         onAfterShow: function() {
            this.input.focus();
         }.bind(this),
         onEnterKey: function() {
            this.value = this.input.value;
            if (this.onOkay) this.onOkay(this.value);
            this.hide();
         }.bind(this),
         onEscapeKey: function() {
            if (this.onCancel) this.onCancel();
            this.hide();
         }.bind(this)
      }, options || {}));
      this.container.addClassName('input');
      this.onOkay = this.options.onOkay;
      this.onCancel = this.options.onCancel;
      this.addHandler({
         caption: 'Okay',
         callback: function() {
            if (this.onOkay) this.onOkay(this.value);
         }.bind(this)
      });
      this.addHandler({
         caption: 'Cancel',
         callback: function() {
            if (this.onCancel) this.onCancel();
         }.bind(this)
      });
   }
});

