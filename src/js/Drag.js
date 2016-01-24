/**
 * @desc 基于js高级3拖拽案例实现扩展的拖拽插件
 * */

window.nono = window.nono || {};
/**
 * @desc 基于jQuery的拖拽插件， 支持限制拖拽分为， 限制拖拽方向， 点击和移动的鼠标样式， 自定义事件;
 * @param [Object]
 *      @param {
 *          如果有containment，那么拖拽的元素会被限制到containment这个dom节点中;
 *          containment : [ HTMLElement ],
 *
 *          拥有指定className的dom可以拖拽;
 *          className : [String] [Default] draggable
 *
 *          可选值为 x ， y， 限制div移动的方向;
 *          axis : [String] x  或者 [String] y, [Default] false
 *
 *          可选值为 鼠标移动上去的手型样式;
 *          cursor : [String] cursor 或者 [String] move ....  [Default] false
 *
 *          自定义事件, 元素被点击时候调用， 回调的this就是被拖拽的元素;;
 *          start : [Function]  [Default] noop
 *
 *          自定义事件, 元素被拖拽的时候调用， 回调的this就是被拖拽的元素;
 *          drag : [Function] [Default] noop
 *
 *          自定义事件, 元素停止拖拽的时候调用， 回调的this就是被拖拽的元素;
 *          stop : [Function] [Default] noop
 *
 *          表示捕获当前元素子孙元素所有有指定className全部可以拖拽 ,Default为document;
 *          dom : [HTMLElemnt] [Default] document
 *      }
 *      该插件支持IE8以上， 以及chrome和FF浏览器
 * */
nono.DragDrop = function ( options ) {

    var defaultOptions = {
        "dom" : document,
        "className" : "draggable",
        "containment" : false,
        "axis" : false
    };
    var _this = this;

    options = options || {};

    //需要jQuery的extend方法;
    this.options = jQuery.extend( defaultOptions, options);

    function addHandler(dom , name, fn) {
        dom.addEventListener(name, fn, false);
    };

    this.dragging = undefined;

    this.diffX = 0;

    this.diffY = 0;

    var handleFn = this.handleFn = this.handleEvent.bind(_this);

    addHandler(document, "mousedown", handleFn);
    addHandler(document, "mousemove", handleFn);
    addHandler(document, "mouseup", handleFn);

};

//需要jquery库;
$.extend( nono.DragDrop.prototype, {

    "handleEvent" : function (event) {

        event = event || window.event;
        var target = event.target || event.srcElement;
        switch (event.type) {
            case "mousedown":
                if (target.className.indexOf( this.options.className ) > -1) {
                    this.dragging = target;
                    if( this.options.cursor ) {
                        this.dragging.style.cursor = this.options.cursor;
                    };
                    if( this.options.start&&typeof this.options.start=="function" ) {
                        this.options.start.call(target, this.options);
                    };
                    this.diffX = event.clientX - target.offsetLeft;
                    this.diffY = event.clientY - target.offsetTop;
                }
                break;
            case "mousemove":
                if (this.dragging !== undefined) {
                    var xValue = event.clientX - this.diffX;
                    var yValue = event.clientY - this.diffY;
                    //限制拖拽的边界;
                    if( this.options.containment ) {
                        var objRect = this.dragging.getBoundingClientRect();
                        var targetRect = this.options.containment.getBoundingClientRect();
                        //限制子元素移动范围为：目标节点的内容宽度加上padding宽度；
                        var targetWidth = this.getStyle(this.options.containment,"width")+this.getStyle(this.options.containment,"paddingRight")+this.getStyle(this.options.containment,"paddingLeft");
                        var targetHeight = this.getStyle(this.options.containment,"height")+this.getStyle(this.options.containment,"paddingTop")+this.getStyle(this.options.containment,"paddingBottom");
                        //方向如果超出去的话那么就置0；
                        if( xValue < 0 ) {
                            xValue = 0;
                        };
                        if( yValue < 0 ) {
                            yValue = 0;
                        };
                        //计算浏览器元素节点是否超出父级元素由padding开始的盒模型;
                        if( (xValue+objRect.width) > targetWidth ) {
                            xValue  = (targetRect.width-objRect.width)
                        };
                        if( (yValue+objRect.height) > targetHeight ) {
                            yValue = (targetRect.height-objRect.height)
                        };
                    };
                    if( this.options.axis === "x" ) {
                        this.dragging.style.left = xValue + "px";
                    }else if( this.options.axis === "y" ) {
                        this.dragging.style.top = yValue + "px";
                    }else{
                        this.dragging.style.left = xValue + "px";
                        this.dragging.style.top = yValue + "px";
                    };

                    //自定义事件;
                    if( this.options.drag&&typeof this.options.drag=="function" ) {
                        this.options.drag.call(target, this.options);
                    };
                };
                break;
            case "mouseup":
                if(!this.dragging) return ;
                if( this.options.cursor&&this.dragging ) {
                    this.dragging.style.cursor = "";
                };
                if( this.options.stop&&typeof this.options.stop=="function" ) {
                    this.options.stop.call(target, this.options);
                };
                this.dragging = undefined;
                break;
        };
    },

    /**
     * @desc 判断元素obj是否在target里面，　这个方法目前没有用到;
     * @param [HTMLElement] obj
     * @param [HTMLElement] target
     * @return [boolean] true, false
     * */
    "rectInRect" : function (objRect, targetRect) {
        //不用;
    },
    /**
     * @desc  获取元素计算后样式;
     * */
    "getStyle" : function ( obj, name ) {
        return parseInt(window.getComputedStyle( obj )[name]);
    }
});