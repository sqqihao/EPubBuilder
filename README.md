#一款在线的epub格式书籍编辑器1
方便在线epub书籍的编辑;

#浏览器支持;
chrome; firefox; IE9+


#src目录
源代码目录，包含所有的js和css文件;
Builder依赖

dependencies         |
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
=====
测试用例文件夹， 一些小demo

#演示地址
[http://sqqihao.github.io/EPubBuilder/src/index.html](http://sqqihao.github.io/EPubBuilder/src/index.html)
