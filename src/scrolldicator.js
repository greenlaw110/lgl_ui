/**
 * @author Luo GeLin <greenlaw110@gmail.com>
 * @copyright 2010
 * @package LGL UI
 * @license MIT
 * @url http://github.com/greenlaw110/lgl_ui
 * @require prototype-element-extensions.js, lgl_ui.js
 */
LGL.UI.Scrolldicator = Class.create({
    initialize: function() {
        var args = $A(arguments); argL = args.length;
        var area = $(args[0]) || $$('.scrolldicatable').first();
        if (!area) return;
        area.scrolldicator = this;
        var defOptions = {
            capProvider: {
                upCaption: function() {return "Scroll Up";},
                downCaption: function() {return "Scroll Down";}
            },
            indicatorAlign: "right"
        };
        var options = Object.extend(Object.extend({ }, defOptions), args[1] || { });
        if (options.capProvider == 'form-label') options.capProvider = new LGL.UI.Scrolldicator.FormLabelCaptionProvider(area);
        this.setCaptionProvider = function (provider) {
            options.capProvider = provider;
        };
        this.setIndicatorAlign = function (align) {
            options.indicatorAlign = align;
        };
        //if (!area.needScroll()) return;
        var beacon = new Element('b', {className: 'scrolldicator-beacon'});
        area.appendChild(beacon);

        var up = new Element('b', {className: 'scrolldicator-up'});
        var down = new Element('b', {className: 'scrolldicator-down'});
        up.hide(); down.hide();
        area.parentNode.appendChild(up);
        area.parentNode.appendChild(down);
        up.style.zIndex = down.style.zIndex = area.style.zIndex + LGL.UI.ZIndexDelta.Scrolldicator;

        var top, top_, bottom, bottom_, right, vp, h, w, delta, showUp, showDown;
        top_ = top = area.viewportOffset()[1];
        function calcPos () {
            vp = document.viewport;
            h = vp.getHeight();
            w = vp.getWidth();
            right = (options.indicatorAlign == 'left') ? '100%' : w - (area.viewportOffset()[0] + area.getWidth()); 
            delta = area.offsetParent.cumulativeScrollOffset()[1];
            top = top_ - delta;
            bottom_ = bottom =  h - (top + area.getHeight());
            
            var scrOffset = beacon.cumulativeScrollOffset()[1] - delta;
            showUp = scrOffset > 10;
            showDown = area.scrollHeight > (scrOffset + area.clientHeight + 10);
        }
        function placeIndicator () {
            calcPos();
            up.setStyle({
                'top': top + 'px',
                'right': right + 'px'
            });
            down.setStyle({
                'bottom': bottom + 'px',
                'right': right + 'px'
            });
        }
        function updateUp () {
            var str = options.capProvider.upCaption(up.viewportOffset()[1] + delta);
            up.update(str);
        }
        function updateDown () {
            var str = options.capProvider.downCaption(down.viewportOffset()[1] + delta);
            down.update(str); 
        }
        function showIndicator () {
            if (!area.needScroll()) {return;}
            var delay;
            if (typeof Effect=='undefined') {
                window.setTimeout(function(){down.show();}, 1000);
                delay = 1001;
            } else {
                Effect.Appear(down, {duration: 1});
                delay = 100;
            }
            window.setTimeout(updateDown.bind(this), delay);
        }
        function handleScroll (ev) {
            placeIndicator();
            showUp ? up.show() && updateUp.bind(this).delay(0.01) : up.hide();
            showDown ? down.show() && updateDown.bind(this).delay(0.01) : down.hide();      
        }
        placeIndicator();
        showIndicator();
        var fireScroll = handleScroll.bindAsEventListener(this);
        area.observe('scroll', fireScroll);
        Event.observe(window, 'scroll', fireScroll);
        Event.observe(window, 'resize', fireScroll);
    }
});

LGL.UI.Scrollbar = Class.create({
    initialize: function () {
        if (typeof(Control.ScrollBar)=='undefined') throw "scrollbar.js required.";
        var args = $A(arguments);
        var area = $(args[0]) || $$('.scrolldicatable').first();
        if (!area) return;
        var defOptions = {
                verticalAlign: "bottom",
                textAlign: "left",
                eof: ""
        };
        //TODO add horizontal scrollbar support
        var options = Object.extend(Object.extend({ }, defOptions), args[1] || { });
        var track = new Element('div', {className: 'scrollbar-track'});
        var handle = new Element('div', {className: 'scrollbar-handle'});
        var bar = new Element('div', {className: 'bar'});
        var line = new Element('div', {className: 'bg'});
        var container = new Element('div', {className: 'scrollbar-content-container clearfix'});
        container.insert(track.insert(handle.insert(bar).insert(line)));

        var p = area.parentNode;
        var els = p.immediateDescendants;
        var bro;
        for (var i = 0, l = els.length; i < l; ++i) {
            if (els[i] === area) {
                if (i > 0) bro = els[i--];
                break;
            }
        }
        container.insert(area.remove());
        if (bro) bro.insert({after: container});
        else p.insert({bottom: container});
        
        handle.style.zIndex = area.style.zIndex + LGL.UI.ZIndexDelta.Scrollbar;
        if (options.textAlign == 'left') {
            track.style.left = '5px';
        } else {
            track.style.right = '5px';
        }       
        
        var scrollbar = new Control.ScrollBar(area, track);
        area.scollbar = scrollbar;
        
        function updateScrollbar() {
            var offset = area.cumulativeScrollOffset()[1] - area.offsetParent.cumulativeScrollOffset()[1];
            scrollbar.slider.setValue(offset / scrollbar.getCurrentMaximumDelta());
        }
        area.observe('scroll', updateScrollbar);
    }
});

LGL.UI.Scrolldicator.FormLabelCaptionProvider = Class.create({
    initialize: function(c) {
        c = $(c);
        if (!c) return;
        var labels = c.select('label');
        /*
        var labels = new Array();
        $$('label').each(function (el){
            labels[labels.length] = el;
        });
        */
        labels.sortBy(function(el){return el.positionedOffset();});
        
        function _strip(lbl, dir) {
            lbl = $(lbl);
            if (!lbl) return 'scroll-' + dir;
            var s = lbl.innerHTML;
            return s.stripTags().truncate(18);
        }
        
        function _upCap(upTopOffset) {
            var e = labels[0], e1;
            for (var i = 0, l = labels.length; i < l; ++i){
                e1 = labels[i];
                if (upTopOffset < e1.viewportOffset()[1] + 5) {
                    break;
                }
                e = e1;
            }
            return _strip(e, 'up');
        }
        this.upCaption = _upCap.bind(this);
        
        function _downCap(downTopOffset) {
            var e = labels[labels.length - 1], e1;
            for (var i = labels.length - 1; i >= 0; --i){
                e1 = labels[i];
                if (e1.viewportOffset()[1] - 5 < downTopOffset) {
                    break;
                }
                e = e1;
            }
            return _strip(e, 'down');
        }
        this.downCaption = _downCap.bind(this);
        
        this.upMostCaption = labels[0].innerHTML;
        this.downMostCaption = labels[labels.length - 1].innerHTML;
    },
    eof: ''
});

var js = /scrolldicator\.js(\?.*)?$/;
$$('script[src]').findAll(function(s) {
  return s.src.match(js);
}).each(function(s) {
  autoload = s.src.match(/\?.*autoload.*/);
  if (autoload) {
    $$('.scrolldicatable').each(function(el){LGL.UI.Scrolldicator(el);});
  }
  scrollbar = s.src.match(/\?.*autoload=scrollbar*/);
  if (scrollbar) {
      $$('.scrolldicatable').each(function(el){LGL.UI.Scrollbar(el);});
  }
});
