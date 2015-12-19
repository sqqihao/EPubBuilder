
zip.workerScriptsPath = "http://gildas-lormeau.github.io/zip.js/demos/";
/**
 * @desc 解压缩文件;
 * */
var UnZipArchive = function( blob ) {
    if( !blob ) {
        alert("参数不正确, 需要一个Blob类型的参数");
        return
    };
    if( !(blob instanceof Blob) ) {
        alert("参数不是Blob类型");
        return ;
    };

    function noop() {};
    this.entries = {};
    this.zipReader = {};
    var _this = this;
    this.length = 0;
    this.onend = noop;
    this.onerror = noop;
    this.onprogress = noop;
    //创建一个延迟对象;
    var def = this.defer = new $.Deferred();
    zip.createReader( new zip.BlobReader( blob ), function(zipReader) {
        _this.zipReader = zipReader;
        zipReader.getEntries(function(entries) {
            _this.entries = entries;
            //继续执行队列;
            def.resolve();
        });
    }, this.error.bind( _this ) );
};

/**
 * @desc 把blob文件转化为dataUrl;
 * */
UnZipArchive.readBlobAsDataURL = function (blob, callback) {
    var f = new FileReader();
    f.onload = function(e) {callback( e.target.result );};
    f.readAsDataURL(blob);
};

$.extend( UnZipArchive.prototype, {
    /**
     * @desc 获取压缩文件的所有入口;
     * @return ArrayList;
     * */
    "getEntries" : function() {
        var result = [];
        for(var i= 0, len = this.entries.length ; i<len;  i++ ) {
            result.push( this.entries[i].filename );
        }
        return result;
    },

    /**
     * @desc 获取文件Entry;
     * @return Entry
     * */
    "getEntry" : function ( filename ) {
        var entrie;
        for(var i= 0, len = this.entries.length ; i<len;  i++ ) {
            if( this.entries[i].filename === filename) {
                return this.entries[i];
            };
        }
    },

    /**
     * @desc 下载文件
     * @param filename;
     * @return void;
     * */
    "download" : function ( filename , cb , runoninit) {
        var _this = this;
        this.defer = this.defer.then(function() {
            var def = $.Deferred();
            if(!filename) return ;
            if(runoninit) {
                return runoninit();
            };
            var entry = _this.getEntry( filename );
            if(!entry)return;
            entry.getData(new zip.BlobWriter(zip.getMimeType(entry.filename)), function(data) {
                if( !cb ) {
                    UnZipArchive.readBlobAsDataURL(data, function( dataUrl ) {
                        var downloadButton = document.createElement("a"),
                            URL = window.webkitURL || window.mozURL || window.URL;
                        downloadButton.href = dataUrl;
                        downloadButton.download = filename;
                        downloadButton.click();
                        def.resolve( dataUrl );
                        _this.onend();
                    });
                }else{
                    cb( data );
                    def.resolve( data );
                }
            });
            return def;
        });
    },

    /**
     * @desc 获取对应的blob数据;
     * @param filename 文件名;
     * @param callback回调, 参数为 blob;
     * @desc 或者可以直接传一个函数作为zip解压缩完毕的回调;
     * */
    "getData" : function ( filename, fn ) {
        if( typeof filename === "string") {
            this.download(filename, function( blob ) {
                fn&&fn( blob );
            });
        }else if( typeof filename === "function") {
            this.download("test", null, function( blob ) {
                filename();
            });
        };
    },

    "error" : function() {
        this.onerror( this );
        throw new Error("压缩文件解压失败");
    }
});