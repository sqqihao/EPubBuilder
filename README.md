#一款在线的epub格式书籍编辑器    
在线epub书籍的编辑;

#浏览器支持    
chrome; firefox; IE9+


#src目录    
源代码目录，包含所有的js和css文件;
Builder依赖

dependencies | ·
------------- |
bootstrap      |
umeditor编辑器 |
require       |
jszip         |


src/epub文件夹包含了epub文件需要的模板文件, 包含：
    mimetype,  container.xml,  content.opf,  toc.ncx,  coverpage.html....

src/js/Construct文件夹包含了两个构造函数;
src/js/tpl文件夹包含了的基础模板;

#test目录    
测试用例文件夹， 一些小demo

#语言    
src/js/config.js为项目语言的目录, 目前提供英语和中文两种语言， 默认为中文的配置如下;
```
var EBConfig = {
        "lang" : "zh-cn"
};
```
如果要使用英语的话，src/js/config.js要改成这样:
```
var EBConfig = {
        "lang" : "en"
};
```

#约定    
电子书编辑器中的标题不能随便命名为"封面"， 名字为"封面"的标题只能出现一次;

#演示地址    
[http://sqqihao.github.io/EPubBuilder/src/index.html](http://sqqihao.github.io/EPubBuilder/src/index.html)
