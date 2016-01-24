//压缩成zip的工具:   JSZIP;
var EpubBuilder = function () {
    this.init();
};

$.extend(EpubBuilder.prototype, {
    "init" : function () {
        var _this = this;
        $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/mimetype", "success":function(data) {
            _this.mimetype = data;
        }})
        $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/META-INF/container.xml", "success":function(data) {
            _this.container = data;
        }})
        $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/toc.ncx", "success":function(data) {
            _this.toc = data;
        }})
        $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/content.opf", "success":function(data) {
            _this.contentOpt = data;
        }});
        $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/coverpage.html", "success":function(data) {
            _this.coverpage = data;
        }});
    },
    /**
    * @param {OBJECT} OPTIONS
    *       @param {String} coverpage
    *       @param {Blob} coverImage
    *       @param {String} publisher
    *       @param {String} description
    *       @param {String} language
    *       @param {String} creator
    *       @param {String} author
    *       @param {String} title
    *       @param {String} date
    *       @param {String} contributor
    *       @param {String} ISBN
    *       @param {Array} tocArray
    *       @param {Array} contentArray
     *       @param {String} name
    * */
    "exportToEpub" : function ( options ) {
        options = $.extend({
            tocArray : [
                "章节0",
                "章节1"
            ],
            contentArray : [
                "测试数组1",
                "测试数据2"
            ],
            fileName : "default",
            coverpage : "coverpage",
            publisher : "publisher",
            coverImage : "images/cover.jpg",
            description : "description",
            language : "language",
            creator : "creator",
            author : "author",
            title : "title",
            contributor : "contributor",
            ISBN : "xxxx-xxxx"

        }, options);

        var zip = new JSZip();
        var OPSFolder = zip.folder("OPS");

        //循环contentArray和tocArray， 生成html字符串
        var chapterLength = options.contentArray.length;
        var tocItem = [];
        var contentItem = [];

        for(var i=0; i< chapterLength; i++) {
            //生成章节数据
            tocItem.push({
                name : options.tocArray[i],
                href : "chapter" + i + ".html"
            });
            //生成html数据;
            OPSFolder.file("chapter" + i + ".html",options.contentArray[i] );
        };

        var MeTaFolder = zip.folder("META-INF");
        MeTaFolder.file("container.xml", this.container);
        zip.file("mimetype", this.mimetype);

        //生成toc和opt文件
        OPSFolder.file("content.opf", Handlebars.compile(this.contentOpt)({ tocItem : tocItem, options : options}) );
        OPSFolder.file("toc.ncx", Handlebars.compile(this.toc)(tocItem));
        OPSFolder.file("coverpage.html", Handlebars.compile(this.coverpage)( {options : options}  ));

        var content = zip.generate({type:"blob"});
        // see FileSaver.js
        saveAs(content, options.fileName + '.epub');

        return ;
    }
});