/**
 * 使用了百度的编辑器， 简化了富文本编辑方面的开发
 * @desc 大概思路;
 * 解压和压缩的实现
 * 主要的main方法， 整个编辑器的初始化和事件的控制， 以及导出等；
 * 左侧的视图， 右侧的可编辑内容；
 * */
define(["PubData", "EpubBuilder"], function(PubData, EpubBuilder) {
    var pubData = new PubData("#left-nav","#content-nav");
    var epub = new EpubBuilder();

    $("#build").bind("click", function(  ) {

        var data = pubData.getData();
        var coverImages =  $("#coverImage").next()[0].files.length;
        $.each($(".export-div form").serializeArray(),function(i,e) {
            e.value&&(data[ e.name ] = e.value);
        });

        if( coverImages ) {
            var file = $("#coverImage").next()[0].files[0];
            //判断文件格式是否是image/*
            var fileReader = new FileReader();
            fileReader.readAsDataURL( file );
            fileReader.onload = function () {
                data.coverImage = arguments[0].target.result;
                epub.exportToEpub(data);
            };
        }else{
            epub.exportToEpub(data);
        };

        return false;

    })
})