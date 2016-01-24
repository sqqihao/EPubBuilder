
zip.workerScriptsPath = "http://gildas-lormeau.github.io/zip.js/demos/";
/**
 * @desc 压缩文件;
 * @event onprogress, onend, onerror;
 * */
var ZipArchive = function() {
    function noop() {};
    this.name = "未命名文件";
    this.zippedBlob = {};
    var _this = this;
    this.length = 0;
    this.onend = noop;
    this.onerror = noop;
    this.onprogress = noop;
    //创建一个延迟对象;
    var def = this.defer = new $.Deferred();
    zip.createWriter( new zip.BlobWriter("application/zip"), function(zipWriter) {
        _this.zipWriter = zipWriter;
        //继续执行队列;
        def.resolve();
    }, this.error.bind(_this) );
};

ZipArchive.blob = function (filename, content) {
    return new Blob([ content ], {
        type : zip.getMimeType(filename)
    });
};

$.extend( ZipArchive.prototype, {
    /**
     * @desc 添加文件， 实际上是串行执行压缩， 因为使用了jQ的延迟对象，
     * @param String filename为文件的名字;
     * @param String content;
     * @param Object options 传参
     *      例如：{ level  : 0} 压缩的等级，0 到 9, 0 为不压缩， 9为最大压缩；
     *      例如：{ comment : "提示文字" }
     *      例如：{ lastModDate : "最后编辑时间" }
     * */
    "addFile" : function ( filename , content, options) {
        var _this = this;
        blob = ZipArchive.blob(filename, content);
        //为了产生链式的效果， 必须把deferrer赋值给新的defer
        this.defer = this.defer.then(function() {
            //创建延迟对象
            var def = $.Deferred();
            _this.zipWriter.add(filename, new zip.BlobReader(blob)
                ,function() { // reader
                    console.log("addFile success!!");
                    def.resolve();
                    //zipWriter.close(callback);
                }, function (size, total) { //onend
                    _this.onend(filename, blob, total);
                    _this.length += total;
                }, function () { //onprogress
                    _this.onprogress(filename, blob, total);
                },options || {
                    //options
                });
            //把延迟对象返回是为了实现串行执行进度的问题， 因为zip.js使用了webworker， 是异步的， 只能基于回调去执行;
            return def;
        });
    },

    /**
     * @desc 添加文件夹, 我发现这个文件无法创建;
     * @desc 创建文件夹功能不好用, 需要创建文件夹你通过 zipWriter.addFile("directory/filename.txt", blob())创建文件夹和对应文件;;
     * */
    "_addFolder" : function (foldername , options) {
        //创建文件夹功能目前不能用;
        //创建文件夹功能不好用, 直接通过 zipWriter.addFile("directory/filename.txt", blob())创建文件夹和文件
        return this;
    },

    "size" : function () {
        return this.length;
    },

    /**
     * @desc 获取blob文件
     * */
    "get" : function () {
        return this.zippedBlob;
    },

    /**
     * @desc 导出为zip文件
     * */
    "export" : function ( name ) {
        name = name || this.name;
        var _this = this;
        this.defer.then(function() {
            _this.zipWriter.close(function( zippedBlob ) {
                if( typeof name === "string" || typeof name === "number") {
                    var downloadButton = document.createElement("a"),
                        URL = window.webkitURL || window.mozURL || window.URL;
                    downloadButton.href = URL.createObjectURL( zippedBlob );
                    downloadButton.download = name + ".zip";
                    downloadButton.click();
                }else{
                    name( zippedBlob );
                };
            });
        });
    },

    "error" : function() {
        this.onerror( this );
        throw new Error("压缩文件创建失败");
    }
});