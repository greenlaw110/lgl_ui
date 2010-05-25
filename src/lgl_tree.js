/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require none
 */
if (!LGL) var LGL={};

if (!LGL.UI) LGL.UI = {};

/**
 * Assumption of tree structure in HTML
 * <ul> // the root
 *   <li>some caption // the folder caption
 *     <ul> // folder content
 *       ...
 *     </ul>
 *   </li>
 *   <li class='folder'>some text</li> // class='folder' is mandatory when folder node has no children
 *   <li>some text</li>
 * </ul>
 *   
 */
LGL.UI.Tree = Class.create({
   initialize: function(root) {
      root = $(root);
      if (!root) return;
      this.rootElement = root;
      root.addClassName('tree').addClassName('root');
      this.children = new Array();
      LGL.UI.Tree.processUL(root, null, this);
      
      //bind event listener
      root.observe('click', function(ev){
         var handle = ev.findElement('.handle.folder');
         if (handle) {
            var f = handle.node.toggle.bind(handle.node);
            f();
         }
      });
   },
   /**
    * Expand tree to give level
    * if level == 0 then collapse all
    * if level == -1 then expand all 
    */
   expandTo: function(level) {
      if (level < 0) level = 99999;
      // collapse all first and then expand
      for (var i = 0; i < this.children.length; ++i) {
         this.children[i].collapse();
         this.children[i].expandTo(--level);
      }
   }
});
Object.extend(LGL.UI.Tree,{
   processUL: function(ul, parent, tree) {
      var children = parent ? parent.children : tree.children;
      for (var i = 0, array = ul.childElements(); i < array.length; ++i) {
         var el = array[i];
         if (el.tagName.toLowerCase() == 'li') {
            children.push(new LGL.UI.Tree.Node(el, parent, this));
         }
      }
   },
   Node: Class.create({
      /**
       * Create LI Node
       * @param el: the li element
       * @param parent: the parent node
       * @param tree: the tree object
       */
      initialize: function (el, parent, tree) {
         this.element = el;
         this.parent = parent;
         this.tree = tree;
         this.children = new Array();
         
         this.toggle_ = function(toExpand) {
            if (this.isLeave()) return;
            var toClassName = toExpand ? 'expanded' : 'collapsed';
            var fromClassName = toExpand ? 'collapsed' : 'expanded';
            var el = this.element;
            el.removeClassName(fromClassName).addClassName(toClassName);
            el.handle.removeClassName(fromClassName).addClassName(toClassName);
            var display = toExpand ? 'block' : 'none';
            if (el.subTree) {
               el.subTree.setStyle({display: display});
            }
         }.bind(this);
         this.expand = this.toggle_.curry(true).bind(this),
         this.collapse = this.toggle_.curry(false).bind(this),
         this.toggle = function() {
            this.isExpanded() ? this.collapse() : this.expand();
         }.bind(this);
         this.expandTo = function(level) {
            if (level < 0) return;
            this.expand();
            for (var i = 0; i < this.children.length; ++i) {
               this.children[i].expandTo(--level);
            }
         }.bind(this);
         
         el.addClassName('node');
         // determine if this is folder or leave
         if (el.hasClassName('folder') || el.select('ul').length > 0 ) {
            el.addClassName('folder').removeClassName('leave');
         } else {
            el.addClassName('leave').removeClassName('folder');
            var handle = new Element('span', {className: 'leave handle'});
            el.insert({top:handle});
            handle.node = this;
            return; // no further processing for leave node
         }
         
         // process folder caption and image handle
         // check if there is already <span class='caption'>caption</span> element
         var cap = el.down('.caption');
         if (!cap) {
            // try to use the first text node as the caption
            var cn = el.childNodes[0];
            if (!cn) return;
            if (cn.nodeName.toLowerCase() == '#text') {
               var txt = cn.nodeValue;
               cap = new Element('span', {className: 'caption'});
               cap.insert(txt);
               cn.nodeValue = '';
               el.insert({top:cap});
            } else {
               var ce = el.childElements()[0];
               if (ce.tagName.toLowerCase() != 'ul') {
                  ce.addClassName('caption');
               }
            }
         }
         // add image handle
         var handle = new Element('span', {className:'folder handle'});
         el.insert({top:handle});
         el.handle = handle;
         handle.node = this;
         
         // process sub tree
         var ul = el.down('ul');
         el.subTree = ul;
         if (ul) LGL.UI.Tree.processUL(ul, this, tree);
         
         // collapse/expand this node
         if (el.hasClassName('expanded')) {
            this.expand();
         } else {
            this.collapse();
         }
         
      },
      isFolder: function() {
         return this.element.hasClassName('folder');
      },
      isLeave: function() {
         return !this.isFolder();
      },
      isExpanded: function() {
         return this.element.hasClassName('expanded');
      },
      isCollapsed: function() {
         return !this.isExpanded();
      }
   })   
});

