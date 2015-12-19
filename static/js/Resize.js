/**
 * Created by qihao on 2015/12/7.
 */

window.nono = window.nono || {};

nono.Resize = function ( dom, options  ) {

    var defaultOptions = {
    };

    options = options || {};

    //需要jQuery的extend方法;
    options = jQuery.extend( defaultOptions, options);

    this.options = options;

    //this.dom， 起码要有个默认的父节点;
    this.dom = dom || document.getElementsByTagName("body")[0];

    //初始化dom和style标签;
    this.init();

    this.resizeEl = this.resizeEl = this.child;

    this.els = this.child.getElementsByClassName("drag-div");

    //绑定事件;
    this.bindEvent();

};

$.extend( nono.Resize.prototype, {

    /**
     * @desc 为dom的添加子节点;
     * @dsc 包括style标签和div标签;
     */
    "init" : function () {

        //要把父级设置成相对定位;
        this.dom.style.position = "relative";

        var style = document.createElement("style");
        style.innerHTML = ".resize{width:100px;height:100px;position:absolute;border:1px dashed #eee}.resize .tl,.resize .tm,.resize .tr,.resize .lm,.resize .lb,.resize .mb,.resize .rb,.resize .mr{position:absolute;width:6px;height:6px;background:#333;opacity:.6}.resize .tl{left:-3px;top:-3px}.resize .tm{left:50%;top:-3px;margin-left:-3px}.resize .tr{right:-3px;top:-3px}.resize .lm{left:-3px;top:50%;margin-top:-3px}.resize .lb{left:-3px;bottom:-3px}.resize .mb{left:50%;bottom:-3px;margin-left:-3px}.resize .rb{right:-3px;bottom:-3px}.resize .mr{right:-3px;top:50%;margin-top:-3px}";
        this.dom.appendChild( style );

        var child = document.createElement("div");
        child.className = "resize";
        child.innerHTML = ' <div class="tl drag-div"></div> '+
            '<div class="tm drag-div"></div>'+
            '<div class="tr drag-div"></div>'+
            '<div class="lm drag-div"></div>'+
            '<div class="lb drag-div"></div>'+
            '<div class="mb drag-div"></div>'+
            '<div class="rb drag-div"></div>'+
            '<div class="mr drag-div"></div>';
        this.child = child;
        this.dom.appendChild( child );
    },

    /**
     * @desc 为元素添加拖拽事件
     * @param [HTMLElement] dom;
     * @prarm [Function] callback元素发生拖拽时候的回调事件;
     * */
    "drag" : function ( dom  ) {
        var disX , disY = 0;  // 鼠标距离div的左距离和上距离
        var _this = this;

        this.parentLeft = _this.getStyle(_this.resizeEl.parentNode,"paddingLeft");
        this.parentTop = _this.getStyle(_this.resizeEl.parentNode,"paddingTop");

        // 鼠标按下dom时
        dom.onmousedown = function(e) {

            var left = _this.resizeEl.offsetLeft;
            var top = _this.resizeEl.offsetTop;
            var width = _this.resizeEl.offsetWidth;
            var height = _this.resizeEl.offsetHeight;
            var disX = e.clientX;
            var disY = e.clientY;

            _this.onstart();

            // 鼠标移动时
            document.onmousemove = function(e) {

                var x = e.clientX - disX;
                var y = e.clientY - disY;

                //重新计算拖拽元素的宽高和left和top
                _this.setRect(dom, left, top, width, height, disX, disY, x, y,  _this.parentLeft, _this.parentTop);

                //更新UI;
                _this.updateUI();

            };

            // 鼠标抬起时
            document.onmouseup = function() {

                document.onmousemove =null;
                document.onmouup = null;
                _this.onstop();

            };

            return false;
        };
    },

    "getStyle" : function ( obj, name ) {
        return parseInt(window.getComputedStyle( obj )[name]);
    },

    /**
     * @desc 为dom的子元素绑定拖拽事件;
     * */
    "bindEvent" : function () {
        var _this = this;
        Array.prototype.forEach.call(this.els, function(e, i) {
            _this.drag( e );
        });
    },

    /**
     * @desc 缩放resize的方框，
     * @desc 根据方块之间的距离， 设置resize方框的宽高(width, height);
     * @desc 根据方块的上左距离， 数组resize方框的左上距离(left, top);
     */
    "setRect" : function (dom, left, top, width, height, disX, disY, x, y, parentLeft, parentTop) {
        var _this = this;
        var resultLeft = left;
        var resultTop = top;
        var resultWidth = width;
        var resultHeight = height;

        if(dom.className.indexOf("tl")!==-1) {
            //定位是相对于content区域开始的;
            resultLeft = left+x- parentLeft;
            resultTop = top+y- parentTop;
            resultWidth = width - x;
            resultHeight = height - y;
        }else if(dom.className.indexOf("lm")!==-1) {
            resultLeft = left+x-parentLeft;
            resultTop = top+y-parentTop;
            resultWidth = width - x;
        }else if(dom.className.indexOf("lb")!==-1) {
            resultLeft = left+x-parentLeft;
            resultWidth = width - x;
            resultHeight = height + y;
            resultTop = top - parentTop;
        }else if(dom.className.indexOf("tm")!==-1) {
            resultTop = top+y-parentTop;
            resultHeight = height - y;
            resultLeft = left+x-parentLeft;
        }else if(dom.className.indexOf("tr")!==-1) {
            resultTop = top+y-parentTop;
            resultHeight = height - y;
            resultWidth = width + x ;
            resultLeft = left - parentLeft;
        }else if(dom.className.indexOf("mb")!==-1) {
            resultHeight = height + y;
            resultLeft = left+x-parentLeft;
            resultTop = top - parentTop;
        }else if(dom.className.indexOf("mr")!==-1) {
            resultTop = top+y-parentTop;
            resultWidth = width + x;
            resultLeft = left - parentLeft;
        }else if(dom.className.indexOf("rb")!==-1) {
            resultHeight = height + y;
            resultWidth = width + x;
            resultLeft = left - parentLeft;
            resultTop = top - parentTop;
        };

        //设置拖拽的最大的宽高;
        if(this.options.minWidth&&resultWidth<this.options.minWidth) resultWidth = this.options.minWidth;
        if(this.options.minHeight&&resultHeight<this.options.minHeight) resultHeight = this.options.minHeight;

        //限制拖拽所在上下宽高范围
        if(this.options.limit) {
            if(resultLeft<=this.options.limit.left) resultLeft = this.options.limit.left;
            if(resultTop<=this.options.limit.top) resultTop = this.options.limit.top;
            if(resultWidth>=this.options.limit.width) resultWidth = this.options.limit.width;
            if(resultHeight>=this.options.limit.height) resultHeight = this.options.limit.height;

            if(resultLeft+resultWidth>this.options.limit.width) resultLeft = this.options.limit.width - resultWidth;
            if(resultTop+resultHeight>this.options.limit.height) resultTop = this.options.limit.height - resultHeight;
        };

        this.left = resultLeft;
        this.top = resultTop
        this.width = resultWidth;
        this.height = resultHeight

        //自定义事件;
        this.ondrag();
    },

    /**
     * @desc 根据实例的属性实时更新dom的宽高和几何属性;
     * */
    "updateUI" : function () {
        var _this = this;
        _this.resizeEl.style.left = _this.left + "px";
        _this.resizeEl.style.top = _this.top + "px";
        _this.resizeEl.style.width = _this.width + "px";
        _this.resizeEl.style.height = _this.height +"px";
    },

    /**
     * @desc 当元素被拖拽的时候
     * */
    "ondrag" : function() {

    },

    /**
     * @desc 当元素开始拖拽的时候
     * */
    "onstart" : function () {

    },

    /**
     * @desc 当元素停止了拖拽的时候
     * */
    "onstop" : function() {

    }
});