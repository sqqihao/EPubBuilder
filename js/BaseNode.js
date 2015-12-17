var BaseNode = function () {
    //如果是元素的样式， 那就设置到this.value上;
    this.value = {};
    //如果是元素的属性， 那就设置到this.attr上;
    this.attr = {};
};

//默认类型
BaseNode.BareType = 0;

$.extend(BaseNode.prototype, {
    /**
     * @desc 为元素添加样式属性;
     * @param String , String || Number;
     * */
    "addProperty" : function ( name , value) {

        this.value[name] = value || 0;

    },

    /**
     * @desc 为元素添加属性;
     * @param String , String || Number;
     * */
    "addAttr" : function ( name , value) {

        this.attr[name] = value || 0;

    },

    /**
     * @desc 为元素添加一堆属性;
     * @param Array
     * */
    "addAttrs" : function ( arrs ) {

        var _this = this;
        arrs.forEach(function(e, i) {
            _this.addAttr(e.name, e.value)
        });

    },

    /**
     * @desc 为元素添加一堆属性;
     * @param Array
     * */
    "addProperties" : function ( arrs ) {

        var _this = this;
        arrs.forEach(function(e, i) {
            _this.addProperty(e.name, e.value)
        });

    },

    //这为元素添加几何属性
    "addGeomProperties" : function(top, right, bottom, left, width, height, zIndex) {

        var props = [
            { name : "left", value : left || "0px"},
            { name : "top", value : top || "0px"},
            { name : "width", value : width || "10px"},
            { name : "height", value : height || "10px"},
            //一般来说，rihgt和bottom设置为自动;
            { name : "right", value : right  || "auto"},
            { name : "bottom", value : bottom || "auto"},
            //默认的zIndex要为1;
            { name : "z-index" , value : zIndex || "1"}
        ];

        this.addProperties( props );

    },

    //为元素添加字体属性
    "addFontProperties" : function () {

        var props = [
            { name : "font-family" , value : "yahei"},
            { name : "font-size" , value : "16px"},
            { name : "font-style" , value : "normal"},
            { name : "font-weight" , value : "normal"}
        ];

        this.addProperties( props );

    },

    //为元素添加外边距属性
    "addMargin" : function (top, right, bottom, left) {

        var props = [
            { name : "marginTop" , value : top || "0px"},
            { name : "marginRight" , value :  right || "0px"},
            { name : "marginBottom" , value : bottom || "0px"},
            { name : "marginLeft" , value : left ||"0px"}
        ];

        this.addProperties( props );

    },

    //为元素添加内边距属性
    "addPadding" : function (top, right, bottom, left) {

        var props = [
            { name : "paddingTop" , value : top || "0px"},
            { name : "paddingRight" , value : right || "0px"},
            { name : "paddingBottom" , value : bottom || "0px"},
            { name : "paddingLeft" , value : left || "0px"}
        ];

        this.addProperties( props );

    },

    //为元素添加边框样式
    "addPadding" : function (top, right, bottom, left) {

        var props = [
            { name : "borderTop" , value : top || "0px"},
            { name : "borderRight" , value : right || "0px"},
            { name : "borderBottom" , value : bottom || "0px"},
            { name : "borderLeft" , value : left || "0px"}
        ];

        this.addProperties( props );

    },

    //添加href属性;
    "addHref" : function ( url ) {
        var props = [
            { name : "href" , value : url || "" }
            ];
        this.addAttrs( props );
    },

    //添加src属性;
    "addSrc" : function () {
        var props = [
            { name : "src" , value : url || "" }
        ];
        this.addAttrs( props );
    },

    //返回数据结构模型;
    "toString" : function () {
        return JSON.stringify( {value : this.value, attr : this.attr} );
    }

});

/**
 * @desc 这个是属于文本节点， 拥有大部分的文本编辑功能, 以及盒模型;
 * */
var TextNode = function () {
    this.apply(BaseNode, arguments);
};
TextNode.__proto__ = new BaseNode();
TextNode.addFontProperties();
TextNode.addGeomProperties();
TextNode.addMargin();
TextNode.addPadding();
