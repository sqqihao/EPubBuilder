/**
 * @desc 提供所有的工具方法;
 * */
window.util = window.util || {};
$.extend(window.util, {
    /***
     * @desc 添加制表符;
     * 通过设置whiteSpace实现防indent的效果;
     */
    "addIndent" : function() {
        var sel = window.getSelection();
        //0 到offset为， 不包含offset的位数;
        var start = sel.anchorNode.textContent.substr(0,sel.anchorOffset);
        var end = sel.anchorNode.textContent.substr(sel.anchorOffset);
        var newStartNode = document.createTextNode( start );
        var newIndentNode = document.createElement( "span" );
        var newEndNode = document.createTextNode( end );
        newIndentNode.className = "Apple-tab-span";
        newIndentNode.style.whiteSpace = "pre";
        newIndentNode.innerText = "		";
        sel.anchorNode.parentNode.insertBefore(newStartNode, sel.anchorNode)
        sel.anchorNode.parentNode.insertBefore(newIndentNode, sel.anchorNode)
        sel.anchorNode.parentNode.insertBefore(newEndNode, sel.anchorNode);
        sel.anchorNode.parentNode.removeChild(sel.anchorNode);
        sel.collapse(newEndNode, 0);
    },
    on:function (obj, type, handler) {
        var types = this.isArray(type) ? type : [type],
            k = types.length,
            d;
        if (!obj.addEventListener) {
            //绑定obj 为this
            d = function (evt) {
                evt = evt || window.event;
                var el = evt.srcElement;
                return handler.call(el, evt);
            };
            handler._d = d;
        }
        if (k) while (k--) {
            type = types[k];
            if (obj.addEventListener) {
                obj.addEventListener(type, handler, false);
            } else {
                obj.attachEvent('on' + type, d);
            }
        }
        obj = null;
    },
    un:function (obj, type, handler) {
        var types = this.isArray(type) ? type : [type],
            k = types.length;
        if (k) while (k--) {
            type = types[k];
            if (obj.removeEventListener) {
                obj.removeEventListener(type, handler, false);
            } else {
                obj.detachEvent('on' + type, handler._d || handler);
            }
        }
    },
    isEmpty:function (data) {
        return data.replace(/[ ]/g, "") != "" ? data : "无";
    },
    getEvent:function (event) {
        return event ? event : window.event;
    },
    getTarget:function (event) {
        return event.target || event.srcElement;
    },
    setInnerText:function (element, text) {
        if (typeof element.textContent == "string")
            element.textContent = text;
        else
            element.innerText = text;
    },
    $G:function (id) {
        return document.getElementById(id)
    },
    getFirstNode:function (ele) {
        return ele.firstChild.nodeType == 1 ? ele.firstChild : ele.firstElementChild;
    },
    getElementsByClassName:function (clsName) {
        var doc = document;
        if (!doc.getElementsByClassName) {
            var clsArr = [];
            var reg = new RegExp("\\b" + clsName + "\\b");
            var eleArr = doc.getElementsByTagName("*");
            for (var i = 0, eleobj; eleobj = eleArr[i++];) {
                if (reg.test(eleobj.className))
                    clsArr.push(eleobj);
            }
            return clsArr;
        }
        else {
            return doc.getElementsByClassName(clsName);
        }
    },
    getCharCode:function (event) {
        return event.keyCode || event.which || event.charCode;
    },
    getStyleValue:function(ele,attr){
        var doc=document;
        var style=ele.currentStyle||doc.defaultView.getComputedStyle(ele,null);
        return parseInt(style[attr].replace(/px/g,""));
    },
    getBrowerVersion:function(){
        var agent = navigator.userAgent.toLowerCase(),
            opera = window.opera,
            browser = {
                ie		: !!window.ActiveXObject,
                webkit	: ( agent.indexOf( ' applewebkit/' ) > -1 ),
                quirks : ( document.compatMode == 'BackCompat' ),
                opera	: ( !!opera && opera.version )
            };
        if ( browser.ie ){
            browser.version = parseFloat( agent.match( /msie (\d+)/ )[1] );
        }
        browser.gecko = ( navigator.product == 'Gecko' && !browser.webkit && !browser.opera );
        return browser;
    },
    isArray:function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    request:function (option) {
        var ajaxRequest = this.creatAjaxRequest();
        if (ajaxRequest == null) {
            alert("您的浏览器不支持AJAX！");
            return;
        }
        ajaxRequest.onreadystatechange = function () {
            if (ajaxRequest.readyState == 4) {
                if (ajaxRequest.status >= 200 && ajaxRequest.status < 300 || ajaxRequest.status == 304) {
                    option.onSuccess(ajaxRequest.responseText);
                }
            }
            else {
                if (option.hasLoading)
                    util.$G(option.loading_Id).innerHTML = "<div class='hook_con'><img class='loading_pic' src='images/loading.gif'/></div>";
            }
        };
        ajaxRequest.open("post", option.url, option.async || true);
        ajaxRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        ajaxRequest.send(option.param);
    },

    /**
     * 创建一个ajaxRequest对象
     */
    creatAjaxRequest : function () {
        var xmlHttp = null;
        if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        } else {
            try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                }
            }
        }
        return xmlHttp;
    },

    uuid : function () {
       var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());

    },

    readArrayBuffer : function ( file ) {
        var def = $.Deferred();
        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function() {
            arrayBuffer = this.result;
            def.resolve( arrayBuffer );
        };
        fileReader.readAsArrayBuffer( file );
        return def;
    },

    "isImage" : function ( filename ) {
        var rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
        return rFilter.test(filename);
    },

    clearArray : function(array) {
        if ( typeof array === "object" ) {
            return array.filter(function(html) {return html})
        }else{
            return [];
        }
    }
});