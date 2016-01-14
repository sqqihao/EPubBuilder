/**
 * 使用了百度的编辑器， 大大简化了富文本编辑方面的开发
 * @desc 大概思路;
 * 解压和压缩的实现
 * 主要的main方法， 整个编辑器的初始化和事件的控制， 以及导出等；
 * 左侧的视图， 右侧的可编辑内容；
 * */
var editor = new Editor("#left-nav","#content-nav");
var epub = new EpubBuilder();
/*
epub.exportToEpub({
    contentArray : ["1","2"],
    tocArray : ["1","2"]
});
*/
function events() {
    $("#download").bind("click", function() {
        epub.exportToEpub(editor.getData());
    })
};

events();