/*
* @desc 右侧编辑区域;
* */
define(["tpl/tpl"], function(TEMPLATE) {

    var Content = function ( content, options ) {
        util.EventBase.apply(this, arguments);
        this.content = $( content );
        this.init();
        this.events();
        this.options = $.extend({}, options);
    };

//继承事件原型;
    Content.prototype = new util.EventBase();

    $.extend(Content.prototype, {

        "init" : function () {

        },
        "addonclick" : function ( fn ) {
            this.addListener("onclick", $.proxy(fn, this));
        },
        "addonremove" : function ( fn ) {
            this.addListener("onremove", $.proxy(fn, this));
        },

        "addonclone" : function ( fn ) {
            this.addListener("onclone", $.proxy(fn, this));
        },

        "addonshow" : function ( fn ) {
            this.addListener("onshow", $.proxy(fn, this));
        },
        "events" : function () {
            var _this = this;
            this.content.delegate(".edui-container", "click", function () {
                _this.fireEvent("onclick", $(this.parentNode).index());
            });
        },
        /**
         * @desc 添加编辑器的内容;
         * */
        "addContent" : function ( index, html ) {
            //生成静态结构
            var content = $( TEMPLATE.contentTpl );
            content.find("div").attr("id", util.uuid());
            if( index!==undefined ) {
                $(this.content.children()[index]).after( content );
            }else{
                content.appendTo( this.content );
            };
            //渲染成编辑器;
            UM.getEditor( content.find("div")[0].id ).ready(function() {
                html&&this.setContent(html);
            });

        },
        /*
         * @desc 获取编辑器中的html;
         * @return Array[string...]
         * */
        "getHtmlArray" : function ( ) {
            var ids = [], result = [];
            this.content.find(".edui-body-container").each(function() {
                ids.push( this.id );
            });
            $.map(ids, function(e) {
                UM.getEditor( e ).ready(function() {
                    result.push( this.getContent() );
                });
            });

            return result;
        }
    })
    return Content;
})