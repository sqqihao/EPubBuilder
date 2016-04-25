define(["Construct/DublinCore"], function( DublinCore ) {
    
    //压缩成zip的工具:   JSZIP;
    var EpubBuilder = function () {
        this.init();
        this.dublinCore = new DublinCore;
    };

    $.extend(EpubBuilder.prototype, {
        "init" : function () {
            var _this = this;
            $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/mimetype", "success":function(data) {
                _this.mimetype = data;
            }});
            $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/META-INF/container.xml", "success":function(data) {
                _this.container = data;
            }});
            $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/toc.ncx", "success":function(data) {
                _this.toc = data;
            }});
            $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/content.opf", "success":function(data) {
                _this.contentOpt = data;
            }});
            $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/coverpage.html", "success":function(data) {
                _this.coverpage = data;
            }});
            $.ajax({async:false, type:"get", dataType : "text" ,url:"./epub/OPS/page.html", "success":function(data) {
                _this.page = data;
            }});
        },

        /**
         * @desc 转化为绝对的地址;
         * @param {String}
         * @return {String}
         * */
        toRelativeUrl: function( url ) {
            if( url ) {
                /*
                * 处理 /text/../这种情况
                * */
                url = url.replace(/\/[^\/]+\/\.\./g,"");
                /*
                * 处理 //// , //这种情况
                * */
                url = url.replace(/\/+/g,"/");

                //处理只有一个正斜杠的情况、
                //  "/sfdsf" , $1为匹配的第一个子元素;
                url = url.replace(/^\/([^\/])/,"$1");
            };
            return url || "";
        },
        /**
         * @desc 获取image图片的类型;
         * @param {String} fileurl
         * */
        "getImageType" : function ( fileurl ) {
            if(!fileurl)return ;
            return fileurl.split(".").pop() || "";
        },
        /**
         * @desc 导入epub文件
         * @param {Object} pubData把数据导入到pubdata中;
         * */
        "importEpub" : function( setData ) {

            var _this = this;
            var $input = $("<input type='file' >");
            $input.bind("change", function( ev ) {
                util.readArrayBuffer( ev.target.files[0]).done(function( arrayBuffer ) {
                    var unzip = JSZip(arrayBuffer);
                    _this.readEpub( unzip, setData );
                });
            });
            $input.trigger("click");

        },

        /**
         * @desc 读取epub文件并展示到界面中;
         * */
        "readEpub" : function ( unzip, setData ) {

            var _this = this;
            var containerXml = unzip.file("META-INF/container.xml").asText();
            var domParser = new DOMParser;
            var xmlDoc = domParser.parseFromString(containerXml, 'text/xml');
            //fullPath.split("/")[0] == "content.opf" ? "" :
            var fullPath  =  xmlDoc.getElementsByTagName("rootfile")[0].getAttribute("full-path") ;
            var OEBPSFolderName =  fullPath.split("/")[0] === "content.opf" ? "" :  fullPath.split("/")[0];
            //读取contentOpt 文件;
            var contentOpt = unzip.file(fullPath).asText();
            //读取tocNcx 文件, tocNcx名字可能不用， 要做特殊处理;
            var tocName = fullPath.match(/\/?(\w+?)\.opf/)[1]  || "";
            var tocNcx =  "";
            //toc.ncx这个文件名字不一定对;
            try{
                tocNcx = unzip.file( _this.toRelativeUrl(OEBPSFolderName +"/"+ tocName +".ncx") ).asText();
            }catch(e) {
                tocNcx = unzip.file( _this.toRelativeUrl(OEBPSFolderName +"/toc.ncx") ).asText();
            };

            var $tocNcx = $(tocNcx);

            var contentOptXmlDoc = domParser.parseFromString(contentOpt, 'text/xml');
            var elSpine = contentOptXmlDoc.getElementsByTagName("spine")[0];
            var getTocEl = function( href ) {
                var els = $tocNcx.find("content");
                for(var i=0; i<els.length ; i++ ) {
                    //if(els[i].getAttribute("src") === href) {
                    if( els[i].getAttribute("src").indexOf(href) === 0 ) {
                        return els[i];
                    };
                };
            };

            //设置dublinCore
            this.dublinCore.setDublinCore(contentOptXmlDoc);
            //$(contentOptXmlDoc).find("#"+$(contentOptXmlDoc).find("meta[name*=cover]").attr("content")).attr("href");
            var navArray = [];
            var contentArray = [];
            var def = $.Deferred();
            var orginDef = def;
            /**
             *  通过spines的顺序 获取目录对应的章节名字和文件路径, 对于多navPoint的Epub文件也能正常处理;
             */
            $.each($(elSpine).children(), function( contentOpfSpinIndex , itemref ) {
                var idref = itemref.getAttribute("idref");
                var href = contentOptXmlDoc.getElementById( idref ).getAttribute("href");
                //获取文件的目录;
                var dir = href.split("/");
                dir.pop();
                var nav = getTocEl(href);
                var navText = "";
                var content = "";

                navText = $(nav).prev("navlabel").text();
                if(!nav&&contentOpfSpinIndex===0)navText="封面";

                content = unzip.file( _this.toRelativeUrl(OEBPSFolderName+"/"+href)).asText();
                //获取content的image, 并转化为base64的格式;
                var domParser = new DOMParser();
                var $content = $( domParser.parseFromString(content, 'text/html') );
                //var $content = $( domParser.parseFromString(content, 'text/xml') ); 如果使用parsexml的方式， 如果标签不合法，会报错;
                if($content.find("body").size()) { $content = $content.find("body") };
                var imgs = $content.find("image").add( $content.find("img") );
                $.each(imgs, function (i,  img ) {
                    //把处理图片的逻辑添加的延迟对象中;
                    def = def.then(function() {
                        var _def = $.Deferred();
                        var href = $(img).attr("xlink:href");
                        var src =  $(img).attr("src");
                        var url = OEBPSFolderName+"/"+dir.join("/")+"/"+ (href || src);
                        var jpg = unzip.file( _this.toRelativeUrl(url) );
                        var imageType = _this.getImageType( url );
                        try{
                            var oFReader = new FileReader();
                            oFReader.onload = function (oFREvent) {
                                //设置属性;
                                $(img).attr("src", oFREvent.target.result );
                                //对svg中的image做特殊处理 , 这本书#Rabbit, Run.epub#;
                                if($(img).closest("svg").size()) {
                                    $(img).attr("xlink:href",oFREvent.target.result)
                                    $(img).attr("src","");
                                };
                                _def.resolve();
                            };
                            oFReader.readAsDataURL(new Blob([jpg.asArrayBuffer()], {type : 'image/'+imageType}));
                        }catch(e) {
                            _def.resolve();
                        };
                        return _def;
                    });
                });

                def.then(function() {
                    var $divContent =  $("<div>").append($content);
                    navArray[contentOpfSpinIndex] = navText;
                    contentArray[contentOpfSpinIndex] =  $divContent.html();
                });

            });

            //读取coverpage和coverpage到options;
            def = def.then(function() {
                var _def = $.Deferred();
                try{
                    //找到cover背景图片的item, 因为不规范, 所以要处理多种情况;
                    var url =  $(contentOptXmlDoc).find("item[id*="+$(contentOptXmlDoc).find("meta[name*=cover]").attr("content").split(".")[0]+"]").attr("href");
                    var imageType = _this.getImageType( url );
                    var jpg = unzip.file( _this.toRelativeUrl(_this.toRelativeUrl(OEBPSFolderName+"/"+url)) );
                    var oFReader = new FileReader();
                    oFReader.onload = function (oFREvent) {
                        //设置属性;
                        _this.dublinCore.setCover( oFREvent.target.result );
                        _def.resolve();
                    };
                    oFReader.readAsDataURL(new Blob([jpg.asArrayBuffer()], {type : 'image/'+imageType}));
                    return _def;
                }catch(e) {
                    _this.dublinCore.setCover("");
                    console.log("封面图片加载失败");
                    _def.resolve();
                };
            });
            //最后， 当所有的数据处理成字符串以后， 把数据灌入view;
            def.then(function() {
                setData(navArray, contentArray);
            });
            //延迟对象马上开始迭代;
            orginDef.resolve();
        },

        /**
         * @desc 把base64的图片转化为文件流;
         * @return html;
         * */
        "base64toImage" : function ( content, zipImageFolder ) {
            var $html = $(content);
            var wrap = $("<div>").append( $html );
            wrap.find("image").add( wrap.find("img")).each(function(i, e) {
                var href = $(e).attr("xlink:href") || $(e).attr("src");
                var dataUrl = href.split(",").pop();
                /*
                */
                var imageType = href.match(/data:image\/([\w\W]+);/i);
                imageType = imageType&&imageType.pop() || "";
                if( imageType ) {
                    var uuid = util.uuid()+"."+imageType;
                    zipImageFolder.file(  uuid , dataUrl  , {base64: true});
                    $(e).attr("src", "../images/"+uuid );
                    //对svg中的image做特殊处理 , 这本书#Rabbit, Run.epub#;
                    if($(e).closest("svg").size()) {
                        $(e).attr("xlink:href",  "../images/"+uuid);
                        $(e).attr("src", "" );
                    };
                    //百度编辑器会设置一个_src属性和src一样； src如果为base64的话， 文件会很大;
                    $(e).attr("_src","");
                };
            });
            return wrap.html();
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
         * @desc 因为有很多电子书的内部文档结构没有按照标准走, 可能导致一些加载失败的问题, 在EpubBuilder导出的epub文件已对所有的文件目录进行统一的规划;
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
                description : "description",
                language : "language",
                creator : "creator",
                author : "author",
                title : "title",
                contributor : "contributor",
                ISBN : "xxxx-xxxx",
                coverImage : ""
            }, options);

            var zip = new JSZip();
            var OPSFolder = zip.folder("OPS");
            var imagesFolder = OPSFolder.folder("images");
            var textFolder = OPSFolder.folder("Text");

            //循环contentArray和tocArray， 生成html字符串
            var chapterLength = options.contentArray.length;
            var tocItem = [];
            var contentItem = [];

            try{
                for(var i=0; i< chapterLength; i++) {
                    //生成章节数据
                    tocItem.push({
                        name : options.tocArray[i],
                        href : "chapter" + i + ".html",
                        //如果页面的标题叫做封面，那么EB就认为， 这个是封面， 不把页面生成到toc.ncx中，但是生成到content.opf当中;
                        isCoverPage : $.trim(options.tocArray[i]) === "封面"
                    });
                    options.contentArray[i] = this.base64toImage(options.contentArray[i], imagesFolder);
                    //对img标签做闭合处理,  比如， 图片是<img src=""> 改成这样<img src=""/>
                    options.contentArray[i] = options.contentArray[i].replace(/<img [^>]+[^\/](>){1}/gi, function($0,$1,$2){
                        var obj = $0.split("");
                        obj.pop()
                        obj.push("\/\>");
                        return obj.join("")
                    });
                    //生成html数据;
                    textFolder.file("chapter" + i + ".html", Handlebars.compile(this.page)({ body : options.contentArray[i] }));
                };
            }catch(e) {
                console.log(e);
            };

            var MeTaFolder = zip.folder("META-INF");
            MeTaFolder.file("container.xml", this.container);
            zip.file("mimetype", this.mimetype);

            //防止创建书籍封面时意外的发生;
            try{
                //创建书籍的封面;
                if(options.coverImage.length) {
                    //生成缩略图图片, 并把生成的图片的地址获取到;
                    var imgSrc = this.base64toImage($("<img>").attr("src",options.coverImage), imagesFolder) ;
                    options.coverImage = imgSrc.match(/src=\"\.\.([^"]*)"/)[1];;
                };
            }catch(e) {
                options.coverImage = "";
            }

            //生成toc和opt文件
            OPSFolder.file("content.opf", Handlebars.compile(this.contentOpt)({ tocItem : tocItem, options : options}) );
            OPSFolder.file("toc.ncx", Handlebars.compile(this.toc)(tocItem));

            /*
            options.coverImage = this.base64toImage($("<img>").attr("src",options.coverImage), imagesFolder);
            */
            var content = zip.generate({type:"blob"});
            // see FileSaver.js
            saveAs(content, options.fileName + '.epub');

            return ;
        }
    });

    return EpubBuilder;
})
