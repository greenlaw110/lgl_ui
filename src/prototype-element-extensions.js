/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require prototype
 */
if (!LGL) var LGL={};
LGL.Element = {
	Methods: {
		needScroll: function(element) {
		    var el = $(element);
		    if (!el) return false;
		    return (el.scrollHeight && el.clientHeight) && (10 < (el.scrollHeight - el.clientHeight));
		},
		eof: Prototype.emptyFunction
	},
	eof: ''
};

Element.addMethods(LGL.Element.Methods);