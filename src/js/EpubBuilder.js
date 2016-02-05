define(["Construct/DublinCore", "PubData"], function( DublinCore, PubData ) {
    
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
        "importEpub" : function( pubData ) {

            var _this = this;
            var $input = $("<input type='file' >");
            $input.bind("change", function( ev ) {
                util.readArrayBuffer( ev.target.files[0]).done(function( arrayBuffer ) {
                    var unzip = JSZip(arrayBuffer);
                    _this.readEpub( unzip, pubData );
                });
            });
            $input.trigger("click");

        },

        /**
         * @desc 读取epub文件并展示到界面中;
         * */
        "readEpub" : function ( unzip, pubData ) {

            var _this = this;
            var containerXml = unzip.file("META-INF/container.xml").asText();
            var domParser = new DOMParser;
            var xmlDoc = domParser.parseFromString(containerXml, 'text/xml');
            var fullPath  = xmlDoc.getElementsByTagName("rootfile")[0].getAttribute("full-path");
            var OEBPSFolderName = fullPath.split("/")[0];
            //读取contentOpt 文件;
            var contentOpt = unzip.file(fullPath).asText();
            //读取tocNcx 文件;
            var tocNcx =  unzip.file(OEBPSFolderName +"/toc.ncx").asText();
            var $tocNcx = $(tocNcx);

            var contentOptXmlDoc = domParser.parseFromString(contentOpt, 'text/xml');
            var elSpine = contentOptXmlDoc.getElementsByTagName("spine")[0];
            var getTocEl = function( href ) {
                var els = $tocNcx.find("content");
                for(var i=0; i<els.length ; i++ ) {
                    if(els[i].getAttribute("src") === href) {
                        return els[i];
                    };
                };
            };

            //设置dublinCore
            this.dublinCore.setDublinCore(contentOptXmlDoc);
            var navArray = [];
            var contentArray = [];
            var def = $.Deferred();
            var orginDef = def;
            $.each(elSpine.children, function( contentOpfSpinIndex , itemref ) {
                var idref = itemref.getAttribute("idref");
                var href = contentOptXmlDoc.getElementById( idref ).getAttribute("href");
                //获取文件的目录;
                var dir = href.split("/");
                dir.pop();
                var nav = getTocEl(href);
                var navText = "";
                var content = "";

                if(nav) {

                    navText = $(nav).prev("navlabel").text();
                    //console.log(navText);

                    content = unzip.file(OEBPSFolderName+"/"+href).asText();

                    var $content = $(content);
                    //获取content的image, 并转化为base64的格式;
                    var imgs = $content.find("image").add( $content.find("img") );
                    $.each(imgs, function (i,  img ) {
                        //把处理图片的罗家添加的延迟对象中;
                        def = def.then(function() {
                            var _def = $.Deferred();
                            var href = $(img).attr("xlink:href");
                            var src =  $(img).attr("src");
                            var url = OEBPSFolderName+"/"+dir.join("/")+"/"+ href || src;
                            var jpg = unzip.file( _this.toRelativeUrl(url) );
                            var imageType = _this.getImageType( url );
                            var oFReader = new FileReader();
                            oFReader.onload = function (oFREvent) {
                                //设置属性;
                                $(img).attr(href ? "xlink:href" : "src", oFREvent.target.result );
                                _def.resolve();
                            };
                            oFReader.readAsDataURL(new Blob([jpg.asArrayBuffer()], {type : 'image/'+imageType}));
                            return _def;
                        });
                    });

                    def.then(function() {
                        var $divContent =  $("<div>").append($content);
                        navArray[contentOpfSpinIndex] = navText
                        contentArray[contentOpfSpinIndex] =  $divContent.html();
                    });
                };
            });
            //最后， 当所有的数据处理成字符串以后， 把数据灌入view;
            def.then(function() {
                pubData.setData(navArray, contentArray);
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
            $html.find("image").add( $html.find("img")).each(function(i, e) {
                var href = $(e).attr("xlink:href") || $(e).attr("src");
                var dataUrl = href.split(",").pop();
                var imageType = href.match(/data:image\/([\w\W]+);/i).pop();
                var uuid = util.uuid()+"."+imageType;
                zipImageFolder.file(  uuid , dataUrl  , {base64: true});
                $(e).attr("xlink:href",  "images/" + uuid );
                $(e).attr("src", "images/" + uuid );
                //百度编辑器会设置一个_src属性和src一样； src如果为base64的话， 文件会很大;
                $(e).attr("_src","");
            });
            return $("<div>").html( $html).html();
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
                description : "description",
                language : "language",
                coverImage : "data:image/png;base64,R0lGODdhBQAFAIACAAAAAP/eACwAAAAABQAFAAACCIwPkWerClIBADs=",
                creator : "creator",
                author : "author",
                title : "title",
                contributor : "contributor",
                ISBN : "xxxx-xxxx"
            }, options);

            var zip = new JSZip();
            var OPSFolder = zip.folder("OPS");
            var imagesFolder = OPSFolder.folder("images");

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
                options.contentArray[i] = this.base64toImage(options.contentArray[i], imagesFolder);
                //生成html数据;
                OPSFolder.file("chapter" + i + ".html", Handlebars.compile(this.page)({ body : options.contentArray[i] }));
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

    return EpubBuilder;
})
