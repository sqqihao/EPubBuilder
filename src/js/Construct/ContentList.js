/**
 * Created by nono on 16-2-19.
 */
define(["tpl/tpl"], function( tpl ) {

/*
    var ContentModel = Backbone.Model.extend({
        "defaults" : function() {
            return {}
        }
    });

    var ContentCollection = Backbone.Collection.extend({
        "model" : ContentModel
    });
*/

    //内容编辑器的区域并不适合mvc;
    var ContentListView = Backbone.View.extend({
        el : "",
        tpl : tpl.contentTpl,

        /**
         * @desc 给外部的接口, 创建一个view;
         * */
        create : function( html, index) {
            //生成静态结构
            var content = $( this.tpl );
            content.find("div").attr("id", util.uuid());
            if(index === false || typeof  index === "undefined") {
                content.appendTo(  this.$el  );
            }else{
                this.$el.children("li").eq(index).after( content );
            }
            //渲染成编辑器;
            UM.getEditor( content.find("div")[0].id ).ready(function() {
                html&&this.setContent(html);
            });
        },

        /**
         * @desc
         * */
        clone : function( index ) {
            var attrId = this.$el.children("li").eq(index).find(".edui-body-container").attr("id");
            var allHtml = UM.getEditor(  attrId  ).getContent();
            this.create( allHtml, index );
        },

        /**
         * @desc
         * */
        remove : function( index ) {
            (typeof index=="undefined")&&(index=0);
            this.$el.children("li").eq(index).remove();
        },

        /**
         * @desc
         * */
        click : function( index ) {
            var content = this.$el.children("li").eq(index);
            $(content).show().siblings().hide();
        }

    });

    return {
        ContentListView : ContentListView
    }
})