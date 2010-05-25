if (!LGL) var LGL = {}

if (!LGL.UI) LGL.UI = {}

/**
 * Usage:
 * 
 * var radio = new LGL.UI.Radio(
 * 	host, 
 * 	caption, 
 * 	name, 
 * 	[
 * 		{value: v1, caption: c1}, 
 * 		{value: v1, caption: c1}, 
 * 		...],
 * 	defVal);
 * 
 * ...
 * var myval = radio.value;
 *  
 */
LGL.UI.Radio = Class.create({
	initialize: function(host, caption, name, options, defVal) {
		host = $(host);
		if (!host) throw "host element required";
		if (!name) throw "please specify name";
		if (!Object.isArray(options)) throw "values must be array";
		
		this.host = host;
		this.caption = caption;
		this.name = name;
		this.options = new Hash();
		this.value = defVal;
		
		var div = new Element("div", {className: 'radio-caption'});
		div.insert(caption);
		host.insert(div);
		
		this.hidden = new Element("input", {type: "hidden", name: name, value: defVal});
		host.insert(this.hidden);
		
		var opg = new Element('div', {className: 'radio-option-group clearfix'});
		host.insert(opg);
		
		var option;
		for (var i = 0; i < options.length, option = options[i]; ++i) {
			var val = option.value
			var cap = option.caption;	
			div = new Element('div', {className: 'radio-option'});
			div.insert(cap);
			div.radio = this;
			div.value = val;
			opg.insert(div);
			this.options.set(val, div);
			
			if (defVal == val) div.addClassName('selected');
		}
		
		opg.observe('click', function(ev){
			var opt = ev.findElement('div.radio-option');
			if (!opt) return;
			
			var func = opt.radio.setValue.bind(opt.radio);
			func(opt.value);
		});
		
		// APIs
		this.setValue = function(value) {
			var opt = this.options.get(value);
			if (!opt) return false;
			
			// unselect previous
			var opt0 = this.options.get(this.value);
			if (opt0) // the radio control might have no initial value
				opt0.removeClassName('selected');
			
			// select current
			opt.addClassName('selected');
			this.hidden.value = value;
			this.value = value;
			
			Event.fire(opt, 'lgl_radio:change', value);
		}
	}
});