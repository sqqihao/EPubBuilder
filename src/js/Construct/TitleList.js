/**
 * @desc 初始化导航列表;
 * @example new TitleView({el : "div0"})
 * Created by nono on 16-2-19.
 */
define(["tpl/tpl"],function(tpl) {

    //初始的TitleMode的值
    var TitleModel = Backbone.Model.extend({
        "defaults" : function() {
            return {
                "title" : ""
            };
        }
    });

    //初始Collection， 数据模型为TitleModel;
    var TitleCollection = Backbone.Collection.extend({
        "model" : TitleModel
    });

    //实例化Items， 作为临时数据表;
    var titleCollection = new TitleCollection();

    var TitleView = Backbone.View.extend({

        //el作为参数传进来
        el : "",

        tpl : tpl.leftTpl,

        //初始数据组;
        items : titleCollection,

        render : function() {
            console.log(this);
        },

        /**
         * @desc 绑定事件，包括：1：删除， 2：添加， 3：复制， 4：创建， 5：点击 ，6：输入
         * */
        events : {
            "click .addli" : "create",
            "click .fa-trash" : "remove",
            "click .fa-clone" : "clone",
            "click li" : "liclick",
            "input" : "input"
        },

        /**
         * @desc 为模型绑定变化事件， 然后渲染到界面中;
         * */
        initialize : function() {
            var _this = this;
            //为model绑定添加的事件;
            this.items.bind("add", function( model , items, options) {
                //(typeof options.index !=="undefined")&&console.log("添加的索引是 ："+ options.index );
                //console.log("添加一个 ："+ model.get("title") );
                var li = $( Handlebars.compile(_this.tpl)( model.get("title") ) );
                if(model.get("title") === "封面") li.find("input").bind("focus", function() { this.blur() }).end().find("a").remove();
                if( typeof options.index !=="undefined" ) {
                    _this.$el.find(".left-nav").children("li").eq( options.index ).before( li );
                }else{
                    _this.$el.find(".left-nav").append( li );
                };
            });
        },

        /**
         * @desc, 事件
         * */
        input : function( ev ) {
            var li = $(ev.target).closest("li");
            var index = li.index();
            this.items.at(index).set("title", ev.target.value );
        },

        /**
         * @desc, 事件
         * */
        remove : function( ev ) {
            var li = $(ev.target).closest("li");
            var index = li.index();
            li.remove();
            //需要读取model的cid才能把这个item给删了;
            this.items.remove( this.items.at(index).cid );
            this.trigger("remove", index);
        },

        /**
         * @desc, 事件
         * */
        clone : function( ev ) {
            var target = $(ev.target);
            var li = target.closest("li");
            var val = li.find("input").val();
            var index = li.index();
            this.add(val, index);("");
            //触发自己的自定义事件;
            this.trigger("clone", index);
            this.trigger("click", index);
        },

        /**
         * @desc, 事件
         * */
        liclick : function( ev ) {
            var target = $(ev.target);
            var li = target.closest("li");
            var index = li.index();
            li.addClass("active").siblings().removeClass("active");
            this.trigger("click", index);
        },

        /**
         * @desc, 事件
         * */
        create : function(ev) {
            var target = $(ev.target);
            var li = target.closest("li");
            var index = li.index();
            this.add("");
            //触发自己的自定义事件;
            this.trigger("create");
            this.trigger("click", index);
        },

        /**
         * @desc添加元素, 感觉我写的mode层就是service层， 什么情况....;
         * */
        add : function( obj ,insertIndex) {
            var val;
            var _this = this;
            if(typeof obj === "string"){
                val = obj;
                var arg = (typeof insertIndex ==="number")&&({ at :  insertIndex});
                //对封面的val进行特殊处理;
                if( this.items.length === 0  ) {
                    this.items.add({ title : "封面" }, arg);
                }else{
                    this.items.add({ title : val }, arg);
                };
            }else if($.isArray(obj)) {
                //如果是数组的话 ， 就迭代自己;
                $.each(obj, function( valIndex, val) {
                    _this.add(val , (typeof insertIndex ==="number")&& insertIndex);
                });
            };
        }
    });

    return {
        TitleView : TitleView
    };
})