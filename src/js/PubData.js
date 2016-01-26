//Epub的nav以及content的处理， 依赖于Content.js和Left.js;
define(["Construct/Content", "Construct/Left", "tpl/tpl"],function(Content, Left, TEMPLATE) {
    var PubData = function(strLeft, strContent) {
        var _this = this;

        //实例化编辑区域;
        this.content = new Content( strContent );
        //为编辑区域绑定自定义事件;
        this.content.addonremove(function( type,index ) {
            $( _this.content.content.children( )[index] ).remove();
        });
        /*
         * @desc 为编辑区域绑定自定义事件;
         * @desc 通过触发onclone执行该事件;
         * */
        this.content.addonclone(function ( type,index ) {
            var allHtml = UM.getEditor( $(_this.content.content.children( )[index]).find(".edui-body-container").attr("id") ).getContent();
            _this.content.addContent( index ,allHtml);
        });
        /*
         * @desc 通过fireEvent("onshow", index)调用, 会跳转到编辑区域;
         * */
        this.content.addonshow(function(type, index) {
            $(_this.content.content.children()[index]).addClass("active").siblings().removeClass("active");
            var content = _this.content.content.children( )[index];
            content&&content.scrollIntoView&&content.scrollIntoView();
        });
        /*
         * @desc 当右侧编辑区域被点击的时候;
         * */
        this.content.addonclick(function(type, index) {
            _this.left.fireEvent("onliclick", index);
        });

        //初始化左侧内容区域;
        this.left = new Left( strLeft );
        this.left.addonliclick(function ( type, index, el ) {
            _this.content.fireEvent("onshow", index);
            $(_this.left.left.find(".left-nav>li")[index]).addClass("active").siblings().removeClass("active");
        });
        /*
         * @desc 当用户点击创建导航的时候会调用这个方法;
         * @desc 左侧会添加一个li， 右侧添加一个编辑区;
         * */
        this.left.addonaddli(function ( type,index ) {
            _this.left.left.find("ul").append( TEMPLATE.leftTpl );
            _this.content.addContent();
        });

        /*
         * @desc 为导航列表绑定自定义事件，当删除按钮被点击的时候;
         * */
        this.left.addonremove(function ( type, index ) {
            $( _this.left.left.find("ul").children()[index] ).remove();
            _this.content.fireEvent("onremove", index );
        });

        /*
         * @desc 为导航列表绑定自定义事件;
         * */
        this.left.addonclone(function ( type, index ) {
            _this.left.left.find("ul").append( template.leftTpl );
            _this.content.fireEvent("onclone", index );
        });

        this.init();

    };

    $.extend(PubData.prototype, {
        /*
         * @desc 元素初始化的时候出发一次“创建”的点击事件;
         * */
        "init" : function () {
            this.left.left.find(".addli").trigger("click");
        },

        /**
         * @desc 获取界面编辑器的数据;
         * @return {Object} {tocArray:[],  contentArray:[]};
         * */
        "getData" : function() {

            var tocArray = this.left.left.find("ul input").map(function() {
                return this.value;
            });

            var contentArray = this.content.content.find(".edui-body-container").map(function() {
                return UM.getEditor(this.id).getContent();
            });

            return {
                tocArray : tocArray,
                contentArray : contentArray
            }
        }
    })

    return PubData;
})