define(["Construct/DublinCore"], function( DublinCore ) {
    
    //压缩成zip的工具:   JSZIP;
    var EpubBuilder = function () {
        this.init();
        this.dublinCore = new DublinCore;
    };

    $.extend(EpubBuilder.prototype, {
        "init" : function () {
            var _this = this;
            $.ajax({async:false, type:"get", dataType :"text" ,url:"./epub/mimetype", "success":function(data) {
                _this.mimetype = data;
            }});
            $.ajax({async:false, type:"get", dataType :"text" ,url:"./epub/META-INF/container.xml", "success":function(data) {
                _this.container = data;
            }});
            $.ajax({async:false, type:"get", dataType :"text" ,url:"./epub/OPS/toc.ncx", "success":function(data) {
                _this.toc = data;
                _this.tocTemplate = data;
            }});
            $.ajax({async:false, type:"get", dataType :"text" ,url:"./epub/OPS/content.opf", "success":function(data) {
                _this.contentOpt = data;
            }});
            $.ajax({async:false, type:"get", dataType :"text" ,url:"./epub/OPS/coverpage.html", "success":function(data) {
                _this.coverpage = data;
            }});
            $.ajax({async:false, type:"get", dataType :"text" ,url:"./epub/OPS/page.html", "success":function(data) {
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
            // 清理当当网等非标准 encrypt/files 属性，防止 XML 解析失败
            containerXml = containerXml.replace(/<files[^>]*>[\s\S]*?<\/files>/gi, '');
            containerXml = containerXml.replace(/\s*encrypt\s*=\s*["'][^"']*["']/gi, '');
            var domParser = new DOMParser;
            var xmlDoc = domParser.parseFromString(containerXml, 'text/xml');
            //fullPath.split("/")[0] == "content.opf" ? "" :
            var rootfiles = xmlDoc.getElementsByTagName("rootfile");
            if (!rootfiles || rootfiles.length === 0) {
                setData({ title: "EPUB 解析失败", content: [], cover: "" });
                return;
            }
            var fullPath  =  rootfiles[0].getAttribute("full-path");
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

            var $tocNcx = $( domParser.parseFromString(tocNcx.replace(/^\uFEFF/, '').trim(), "text/xml") );

            // Strip BOM (\uFEFF) and leading whitespace/newlines before XML declaration
            var contentOptClean = contentOpt.replace(/^\uFEFF/, '').trim();
            var contentOptXmlDoc = domParser.parseFromString(contentOptClean, 'text/xml');
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

                var chapterFile = unzip.file( _this.toRelativeUrl(OEBPSFolderName+"/"+href));
                try {
                    content = chapterFile ? chapterFile.asText() : "";
                } catch(e) {
                    content = "";
                    console.log("章节文件读取失败: " + href);
                }
                //获取content的image, 并转化为base64的格式;
                var domParser = new DOMParser();
                var $content = $( domParser.parseFromString(content, 'text/html') );
                //var $content = $( domParser.parseFromString(content, 'text/xml') ); 如果使用parsexml的方式， 如果标签不合法，会报错;
                // 用 .contents() 取 body/html 的子节点（不含外层标签），避免 <body> 本身被当成子元素塞进 page.html 的 <body> 导致双重 body
                var $target = $content.find("body");
                if (!$target.length && $content.find("html").length) {
                    $target = $content.find("html");
                }
                $content = $target.contents();
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
                        if (!jpg) {
                            _def.resolve();
                            return;
                        }
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
                    var $divContent = $("<div>").append($content);
                    var html = $divContent.html();
                    // 删除嵌入在 body 里的 XML 声明（从 readEpub 解析时带进来的）
                    html = html.replace(/<\/?xml[^>]*>/gi, '');
                    // 删除嵌入在 body 里的 <link> CSS 引用（CSS 已在 page.html 的 <head> 里，manifest 注册的是 css/main.css）
                    html = html.replace(/<\/?link[^>]*>/gi, '');
                    navArray[contentOpfSpinIndex] = navText;
                    contentArray[contentOpfSpinIndex] = html;
                });

            });

            //读取coverpage和coverpage到options;
            def = def.then(function() {
                var _def = $.Deferred();
                try{
                    //找到cover背景图片的item, 因为不规范, 所以要处理多种情况;
                    var coverMeta = $(contentOptXmlDoc).find("meta[name*=cover]").attr("content") || "";
                    var url =  $(contentOptXmlDoc).find("item[id*="+coverMeta.split(".")[0]+"]").attr("href") || "";
                    var imageType = _this.getImageType( url );
                    var jpg = unzip.file( _this.toRelativeUrl(_this.toRelativeUrl(OEBPSFolderName+"/"+url)) );
                    if (!jpg) {
                        _this.dublinCore.setCover("");
                        console.log("封面图片未找到: " + url);
                        _def.resolve();
                        return;
                    }
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
         * @param {String} content - HTML内容
         * @param {JSZip} zipImageFolder - 图片写入目标文件夹
         * @return {[String, Array]} - [处理后的HTML, 图片文件名数组]
         * */
        "base64toImage" : function ( content, zipImageFolder ) {
            var _this = this;
            var $html = $(content);
            var wrap = $("<div>").append( $html );
            var imageFilenames = [];
            var MAX_W = 800, MAX_H = 800, QUALITY = 0.8;

            wrap.find("image").add( wrap.find("img")).each(function(i, e) {
                var href = $(e).attr("xlink:href") || $(e).attr("src");
                var dataUrl = href.split(",").pop();
                var imageType = href.match(/data:image\/([\w\W]+);/i);
                imageType = imageType && imageType.pop() || "";
                if( imageType ) {
                    var originalData = href; // full data:image/... URL
                    var isPng = imageType.toLowerCase().indexOf("png") !== -1;
                    var outputType = isPng ? "image/png" : "image/jpeg";
                    var outputExt = isPng ? "png" : "jpg";
                    var dataUrl = href.split(",").pop();

                    // --- 压缩大图：data URL 直接画 canvas，浏览器同步处理 ---
                    try {
                        var img = new Image();
                        img.src = originalData;
                        // data URL 在 canvas.drawImage 时浏览器可同步解码（img 已在内存）
                        var w = img.naturalWidth || img.width;
                        var h = img.naturalHeight || img.height;
                        var ratio = 1;
                        if (w > 0 && h > 0 && (w > MAX_W || h > MAX_H)) {
                            ratio = Math.min(MAX_W / w, MAX_H / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }
                        if (w > 0 && h > 0 && ratio < 1) {
                            var canvas = document.createElement("canvas");
                            canvas.width = w;
                            canvas.height = h;
                            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                            dataUrl = canvas.toDataURL(outputType, QUALITY).split(",").pop();
                        }
                    } catch(err) {
                        console.warn("图片压缩失败，使用原图:", err);
                    }
                    var uuid = util.uuid() + "." + outputExt;
                    zipImageFolder.file(uuid, dataUrl, {base64: true});
                    imageFilenames.push(uuid);
                    $(e).attr("src", "../images/" + uuid);
                    if($(e).closest("svg").size()) {
                        $(e).attr("xlink:href", "../images/" + uuid);
                        $(e).attr("src", "");
                    }
                    $(e).attr("_src", "");
                };
            });
            return [wrap.html(), imageFilenames];
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

            // ISBN 为空时生成 UUID，避免 dc:identifier 空白
            if (!options.ISBN || $.trim(options.ISBN) === "") {
                options.ISBN = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }

            // 转义 XML 特殊字符（& < >）和 Handlebars 分隔符 {{ }}
            // Handlebars {{}} 在 XML 文本内容里是非法的，必须转义
            // XML 特殊字符必须先转，否则 & 转完后 < > 又被错误替换
            var esc = function(s) {
                if (!s) return "";
                s = s.replace(/&/g, '&amp;');
                s = s.replace(/</g, '&lt;');
                s = s.replace(/>/g, '&gt;');
                // Handlebars 分隔符：插入零宽字符破坏 {{}} 完整性
                // 零宽字符在 XML 解析后仍然存在，但浏览器显示时不可见
                s = s.replace(/\{\{/g, '\u200B{{').replace(/\}\}/g, '}}\u200B');
                return s;
            };
            options.title = esc(options.title);
            options.author = esc(options.author);
            options.publisher = esc(options.publisher);
            options.description = esc(options.description);
            options.contributor = esc(options.contributor);

            // 图片 manifest 条目：跟踪 base64toImage 写入的所有图片文件名
            var imageManifestItems = [];

            //循环contentArray和tocArray， 生成html字符串
            var chapterLength = options.contentArray.length;
            var tocItem = [];
            var contentItem = [];

            //防止创建书籍封面时意外的发生;
            try{
                //创建书籍的封面;
                if(options.coverImage.length) {
                    // base64toImage 将 base64 图片写入 imagesFolder，返回 [html, filenames]
                    // 封面页需要引用同一张图片，路径相对于 Text/coverpage.html，即 ../Images/uuid.ext
                    var coverResult = this.base64toImage($("<img>").attr("src",options.coverImage), imagesFolder);
                    var imgTag = coverResult[0];
                    var coverFilename = coverResult[1][0] || "";
                    imageManifestItems = imageManifestItems.concat(coverResult[1]);
                    var match = imgTag.match(/src=["']([^"']+)["']/);
                    // base64toImage 返回 ../images/uuid（相对于 Text/coverpage.html）
                    // coverpage.html img src 路径 → 相对于 Text/，需要 ../images/uuid
                    // manifest href 路径 → 相对于 OPS/，需要 images/uuid（去掉 ../）
                    options._coverImageSrc = match ? match[1] : "";  // 原始 ../images/uuid
                    var coverHref = match ? match[1].replace(/^\.\.\//, "") : "";  // images/uuid
                    options.coverImage = coverHref;
                    options._coverImageName = coverFilename;
                    var ext = coverFilename.split(".").pop().toLowerCase();
                    options._coverImageMediaType = ext === "png" ? "image/png" : "image/jpeg";
                };
            }catch(e) {
                options.coverImage = "";
            }

            /*
            if (options.coverImage.length) {
                textFolder.file("coverpage.html", Handlebars.compile(this.coverpage)({ options: options }));
            }
            */
                try{
                    for(var i=0; i< chapterLength; i++) {
                        // 提取二级目录：从 content 中解析 h2/h3 标签生成子章节
                        var children = [];
                        var rawContentForParse = options.contentArray[i] || "";
                        // 提取 h2/h3 子标题（处理各种格式）
                        var headingMatches = rawContentForParse.match(/<h([23])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi) || [];
                        for (var hi = 0; hi < headingMatches.length; hi++) {
                            var m = headingMatches[hi].match(/<h[23][^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/i);
                            if (m && m[1] && m[2]) {
                                // 清理 HTML 标签获取纯文本
                                var text = m[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
                                if (text.length > 0) {
                                    children.push({
                                        name: text,
                                        href: "chapter" + i + ".html",
                                        anchor: m[1],
                                        playOrder: i * 100 + children.length
                                    });
                                }
                            }
                        }
                        //生成章节数据
                        tocItem.push({
                            name : options.tocArray[i].replace(/^\s+|\s+$/g, ''),
                            href : i === 0 ? "coverpage.html" : "chapter" + i + ".html",
                            playOrder: i,
                            //如果页面的标题叫做封面，那么EB就认为， 这个是封面， 不把页面生成到toc.ncx中，但是生成到content.opf当中;
                            isCoverPage : $.trim(options.tocArray[i]) === "封面",
                            children: children.length > 0 ? children : null
                        });
                        var result = this.base64toImage(options.contentArray[i], imagesFolder);
                        options.contentArray[i] = result[0];
                        imageManifestItems = imageManifestItems.concat(result[1]);
                        // 剥离 <body> 和 </body> 标签，避免 page.html 模板产生双重 <body>
                        var rawContent = options.contentArray[i];
                        // 剥离 <html>...</html> 外层（粘贴内容时带入的完整 HTML 文档结构），
                        // 避免插入 page.html 模板后产生双重 <html> 标签，导致 Acrobat/Foxit XML 解析失败
                        rawContent = rawContent.replace(/<\/?html[^>]*>/gi, '');
                        rawContent = rawContent.replace(/<\/?head[^>]*>/gi, '');
                        rawContent = rawContent.replace(/<\/?body[^>]*>/gi, '');
                        // 删除嵌入在 body 里的 XML 声明（从 readEpub 解析时带进来的）
                        rawContent = rawContent.replace(/<\/?xml[^>]*>/gi, '');
                        // 删除嵌入在 body 里的 <link> CSS 引用（CSS 已在 page.html 的 <head> 里，manifest 注册的是 css/main.css）
                        rawContent = rawContent.replace(/<\/?link[^>]*>/gi, '');
                        // 对所有自闭合标签做规范化：<br> → <br/>、<br/><br/> → <br/>、<br class="x"/> → <br class="x"/>
                        // 避免苹果 Books 的 XML 解析器将 <br> 当作未闭合标签，导致 "Opening and ending tag mismatch: br line 11 and div"
                        rawContent = rawContent.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*?)>/gi, function(match, tag, attrs) {
                            return '<' + tag + attrs + '/>';
                        });
                        // 将 content 中的绝对 URL 链接替换为相对路径（chapterN.html#anchor）
                        rawContent = rawContent.replace(/href=["']http:\/\/chapter(\d+)\.html#([^"']+)["']/gi, function(match, num, anchor) {
                            return 'href="chapter' + (parseInt(num) + 1) + '.html#' + anchor + '"';
                        });
                        rawContent = rawContent.replace(/href=["']http:\/\/chapter(\d+)\.html["']/gi, function(match, num) {
                            return 'href="chapter' + (parseInt(num) + 1) + '.html"';
                        });
                        // 删除空白的 h2/h3 标签（只有空白文字的标题）
                        rawContent = rawContent.replace(/<h[23][^>]*>\s*<\/h[23]>/gi, '');
                        if(i==0){
                            if (options.coverImage.length) {
                                rawContent = "<p><img src='../"+options.coverImage+"' /> </p>"  // 图片路径可能不对
                            }else{
                                rawContent = rawContent.match(/<img[^>]+>/i)?.[0] || '';  // 无图时只留 img
                            }
                        }

                        //生成html数据;
                        textFolder.file(i==0?"coverpage.html":"chapter" + i + ".html", Handlebars.compile(this.page)({ body : rawContent, options: options }));
                    }
                } catch(e) {
                    console.error("章节内容处理失败:", e);
                }

            var MeTaFolder = zip.folder("META-INF");
            MeTaFolder.file("container.xml", this.container);
            zip.file("mimetype", this.mimetype, { compression: "STORE" });

            // 生成 content.opf 之前，注入图片 manifest 条目
            var imageManifestHtml = "";
            // deduplicate + 生成 manifest item 标签
            var seenImages = {};
            imageManifestItems.forEach(function(fname) {
                if (fname && !seenImages[fname]) {
                    seenImages[fname] = true;
                    var ext = fname.split(".").pop().toLowerCase();
                    var mediaType = "image/jpeg";
                    if (ext === "png") mediaType = "image/png";
                    else if (ext === "gif") mediaType = "image/gif";
                    else if (ext === "svg") mediaType = "image/svg+xml";
                    imageManifestHtml += '\n            <item id="img_' + fname + '" href="images/' + fname + '" media-type="' + mediaType + '"/>';
                }
            });

            // 在 content.opf 的 </manifest> 之前注入图片条目
            var compiledContentOpf = Handlebars.compile(this.contentOpt)({ tocItem : tocItem, options : options });
            compiledContentOpf = compiledContentOpf.replace(/(<\/manifest>)/, imageManifestHtml + "\n        $1");
            
            // 添加 guide 引用（导航页跳转支持）
            // 找到目录页（chapter3.html，即第4个章节，索引为3）
            var tocIndex = -1;
            for (var ti = 0; ti < tocItem.length; ti++) {
                if (tocItem[ti].name && tocItem[ti].name.indexOf("目录") !== -1) {
                    tocIndex = ti;
                    break;
                }
            }
            if (tocIndex === -1 && tocItem.length >= 4) {
                tocIndex = 3; // 默认第4个章节为目录页
            }
            var guideHtml = "";
            if (tocIndex >= 0 && tocItem[tocIndex]) {
                guideHtml = '\n    <reference type="toc" href="Text/' + tocItem[tocIndex].href + '" title="目录"/>';
            }
            compiledContentOpf = compiledContentOpf.replace(/(<\/guide>)/, guideHtml + "\n    $1");
            
            OPSFolder.file("content.opf", compiledContentOpf);
            OPSFolder.file("toc.ncx", Handlebars.compile(this.tocTemplate)({ title: options.title, author: options.author, tocItem: tocItem }));

            
            options.coverImage = this.base64toImage($("<img>").attr("src",options.coverImage), imagesFolder);
            
            var content = zip.generate({type:"blob"});
            // see FileSaver.js
            saveAs(content, options.fileName + '.epub');

            return ;
        }
    });

    return EpubBuilder;
})
