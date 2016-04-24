/**
 * Created by nono on 16-2-19.
 * 作为titleList和contentList的桥接
 *
 * 使用了百度的编辑器， 简化了富文本编辑方面的开发
 * @desc 大概思路;
 * 解压和压缩的实现
 * 主要的main方法， 整个编辑器的初始化和事件的控制， 以及导出等；
 * 左侧的视图， 右侧的可编辑内容；
 * 约定标题名不能为"封面";
 * */
define(["Construct/TitleList", "Construct/ContentList", "EpubBuilder", "Construct/DublinCore", "Construct/Preview" , "Construct/Lang"], function( TitleList,  ContentList, EpubBuilder , DublinCore, Preview, Lang) {

    var epub = new EpubBuilder();

    var dublinCore  = new DublinCore();

    var titleView = new TitleList.TitleView({
        el :  $("#left-nav")
    });

    var contentListView = new ContentList.ContentListView({
        el : $("#content-nav")
    });

    titleView.bind("create", function( index ) {
        contentListView.create("", index);
    });

    titleView.bind("clone", function( index ) {
        contentListView.clone(index);
    });

    titleView.bind("remove", function( index ) {
        contentListView.remove(index);
    });

    titleView.bind("click", function( index ) {
        contentListView.click(index);
    });

    titleView.create("");

    /**
     * @desc 获取界面编辑器的数据, 作为titleListView和ContntListView的辅助方法;
     * @return {Object} {tocArray:[],  contentArray:[]};
     * */
    function getData() {
        var tocArray = titleView.$el.find("ul input").map(function() {
            return this.value;
        });

        var contentArray = contentListView.$el.find(".edui-body-container").map(function() {
            return UM.getEditor(this.id).getContent();
        });

        return {
            tocArray : tocArray,
            contentArray : contentArray
        }
    }

    /**
     * @desc 设置数据到view中, 作为titleListView和ContntListView的辅助方法;
     * @param {Array}, {Array}
     *      [], []
     * @example setData( [1,2,3,4], [11,22,33,44] );
     * */
    function setData( tocArray, contentArray ) {
        var _this = this;
        titleView.$el.find("ul").html("");
        contentListView.$el.html("");
        $.each(tocArray, function (i, e) {

            //添加左侧nav
            titleView.add($.trim(e));

            //添加右侧内容;
            contentListView.create( contentArray[i] );

        });
    }

    $("input[name*=coverImage]").change(function() {
        var _this = this;
        if( util.isImage(_this.files[0].type) ) {
            var file = _this.files[0];
            //判断文件格式是否是image/*
            var fileReader = new FileReader();
            fileReader.readAsDataURL( file );
            fileReader.onload = function () {
                $(_this).attr("coverImage", arguments[0].target.result);
            };
        }
    });

    $("#build").bind("click", function( ev ) {

        var data = getData();
        ev.stopPropagation();
        ev.preventDefault();

        //获取目录结构，并合并到data中;
        $.extend(data, dublinCore.getDublinCore());

        epub.exportToEpub(data);

    });

    $("#open").click(function() {

        epub.importEpub(setData);

    });

    //初始化默认语言;
    new Lang().init();

    new Preview();
});