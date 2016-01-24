
(function() {
    window.util = window.util || {};

    //class操作;
    util.hasClass = function(e, arg) {
        return e.className.indexOf(arg)!==-1 ? true : false;
    };

    //添加class;
    util.addClass = function(e, arg) {
        if( !util.hasClass(e, arg) ) {
            e.className = e.className+" "+arg;
        };
    };

    //删除class
    util.removeClass = function(e, arg) {
        if(!arg) {
            e.className = "";
        }else{
            if( !util.hasClass(e, arg) )return;
            if(e.className.indexOf( arg )!=-1) {
                if( e.className.split(" ").indexOf( arg ) !== -1) {
                    e.className = e.className.replace(new RegExp(arg,"gi"), "");
                };
            };
        };
    };

    util.shallowClone =  function (obj) {
        var c = Object.create(Object.getPrototypeOf(obj));
        Object.getOwnPropertyNames(obj).forEach(function (k) {
            return c[k] = obj[k];
        });
        return c;
    };

    //匹配className匹配的父级节点；
    util.closest = function (obj, className ) {
        if(!obj||!className)return;
        if(obj.nodeName.toLowerCase() === "body") return;
        if( util.hasClass(obj.parentNode, className) ) {
            return obj.parentNode;
        }else{
            return util.closest(obj.parentNode, className);
        };
    };

    //underscore抄的模板引擎;
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    var escapes = {
        "'":      "'",
        '\\':     '\\',
        '\r':     'r',
        '\n':     'n',
        '\t':     't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    util.templateSettings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape      : /<%-([\s\S]+?)%>/g
    };

    util.template = function(text, data) {
        var render;
        settings = util.templateSettings;

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function(match) { return '\\' + escapes[match]; });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function(data) {
            return render.call(this, data);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    /**
     * @desc 从jQuery里面拷贝了一个extends;
     * @desc 当第一个参数为boolean值时候，可以实现深度继承;
     * @param (boolean, result, obj)
     * @param (result, obj, obj, obj)
     * @return result;
     */
    util.cloneProps = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
            isArray = function( arr ){
                return Object.prototype.toString.call( arr ) === "[object Array]";
            },
            core_hasOwn = {}.hasOwnProperty,
            isPlainObject = function( obj ) {
                if ( !obj || (typeof obj !== "object") || obj.nodeType ) {
                    return false;
                }

                try {
                    // Not own constructor property must be Object
                    if ( obj.constructor &&
                        !core_hasOwn.call(obj, "constructor") &&
                        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                        return false;
                    }
                } catch ( e ) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return false;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.

                var key;
                for ( key in obj ) {}

                return key === undefined || core_hasOwn.call( obj, key );
            };
        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        };

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && typeof target !== "function" ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( isPlainObject(copy) || (copyIsArray =  isArray(copy) ) )) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];

                        } else {
                            clone = (src && (typeof src === "object")) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = util.cloneProps( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    //EventBase;
    /**
     * @example
     var obj = Object.create( new EventBase )
     obj.addListener("click", function(type) {
            console.log(type)
         })
     obj.fireEvent("click");
     * */
    var EventBase = function () {};

    EventBase.prototype = {
        /**
         * 注册事件监听器
         * @name addListener
         * @grammar editor.addListener(types,fn)  //types为事件名称，多个可用空格分隔
         * @example
         * })
         * editor.addListener('beforegetcontent aftergetcontent',function(type){
             *         if(type == 'beforegetcontent'){
             *             //do something
             *         }else{
             *             //do something
             *         }
             *         console.log(this.getContent) // this是注册的事件的编辑器实例
             * })
         */
        addListener:function (types, listener) {
            types = types.split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                if(typeof listener === "function") {
                    getListener(this, ti, true).push(listener);
                }else{
                    for(var j=0 ;j<listener.length; j++) {
                        getListener(this, ti, true).push(listener[j]);
                    };
                };
            };
        },

        /**
         * 移除事件监听器
         * @name removeListener
         * @grammar editor.removeListener(types,fn)  //types为事件名称，多个可用空格分隔
         * @example
         * //changeCallback为方法体
         */
        removeListener:function (types, listener) {
            types = types.trim().split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                removeItem(getListener(this, ti) || [], listener);
            }
        },

        /**
         * 触发事件
         * @name fireEvent
         * @grammar
         * @example
         */
        fireEvent:function () {
            var types = arguments[0];
            types = types.trim().split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                var listeners = getListener(this, ti),
                    r, t, k;
                if (listeners) {
                    k = listeners.length;
                    while (k--) {
                        if(!listeners[k])continue;
                        t = listeners[k].apply(this, arguments);
                        if(t === true){
                            return t;
                        }
                        if (t !== undefined) {
                            r = t;
                        }
                    }
                }
                if (t = this['on' + ti.toLowerCase()]) {
                    r = t.apply(this, arguments);
                }
            }
            return r;
        }
    };

    util.EventBase = EventBase;

    /**
     * 获得对象所拥有监听类型的所有监听器
     * @public
     * @function
     * @param {Object} obj  查询监听器的对象
     * @param {String} type 事件类型
     * @param {Boolean} force  为true且当前所有type类型的侦听器不存在时，创建一个空监听器数组
     * @returns {Array} 监听器数组
     */
    function getListener(obj, type, force) {
        var allListeners;
        type = type.toLowerCase();
        return ( ( allListeners = ( obj.__allListeners || force && ( obj.__allListeners = {} ) ) )
            && ( allListeners[type] || force && ( allListeners[type] = [] ) ) );
    };

    function removeItem(array, item) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
                i--;
            };
        };
    };

    /**
     * 继承的基本类;
     * */
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
            this.constructor = d;
        }

        __.prototype = b.prototype;
        d.prototype = new __();
    };

    var nono =  {};
    /**
     * 组件
     * */
    nono.Dom = function( opt ) {
        opt = opt || {};
        //继承eventBase;
        EventBase.apply(this, arguments);
        this.doc = opt&&opt.doc || document;
        this.opt = opt || {};
    };
    //继承EventBase的原型;
    __extends( nono.Dom, EventBase);

    /**
     * @desc 绑定自定义事件, Dom初始化即可绑定自定义事件;;
     *
     * */
    nono.Dom.prototype.initEmiter = function (evs) {
        for(var e in evs) {
            this.addListener(e, evs[e]);
        };
    };

    /**
     * 主逻辑， 渲染界面;
     * @param 虚拟DOM
     * @param 目标节点
     * @param true的是时候不会绑定事件和属性
     * @return 虚拟DOM
     * */
    nono.Dom.prototype.render = function( vEl, tar , flag) {
        if( tar ) {
            //把目标内部的所有节点删除;
            this._assignChildren( tar );
        };
        return this._render( vEl, tar ,flag);
    };

    /**
     * @desc 更新dom的时候调用改方法;
     * */
    nono.Dom.prototype.update = function ( tar ) {
        if( tar ) {
            //把目标内部的所有节点删除;
            this._assignChildren( tar );
        };
        this.render(this.vEl, tar , true);
    };

    /**
     * @desc 迭代并生成子元素;
     * @return void;
     * */
    nono.Dom.prototype.renderKids = function ( kids, tar ) {
        for(var i=0 ,len = kids.length; i< len ;i++ ) {
            var dom = new nono.Dom();
            //dom.render(kids[i], tar);
            //this._render( kids[i] , tar);
            dom._render(kids[i], tar);
        };
    };

    /**
     * @desc 内部用的渲染;
     * @param 虚拟DOM
     * @param 目标节点
     * @param true的是时候不会绑定事件和属性
     * */
    nono.Dom.prototype._render = function(  vEl, tar , flag) {
        //缓存虚拟元素和目标节点;
        if(vEl) this.vEl = vEl;
        if(tar) this.tar = tar;

        var nNode, tag,  isFlag = false;
        //初始化要渲染到的父级节点;
        tar = (tar&&tar.nodeType === 1 ? tar : undefined );

        //如果是字符串的话
        this.fireEvent("beforerender", tar);
        if( typeof vEl === "string" || typeof vEl === "number" ) {

            isFlag = true;
            var string = "";
            try{
                //如果是以#开头认为他是模板引擎的标记;
                if(vEl.indexOf("##")==0) {
                    var html = document.getElementById(vEl.substr(2)).innerHTML;
                    string = util.template( html )( tar&&tar.dom&&tar.dom.vEl&&tar.dom.vEl.model );
                }else{
                    string = util.template( vEl )( tar&&tar.dom&&tar.dom.vEl&&tar.dom.vEl.model );
                };

            }catch(e) {
                string = "util.template string error";
            };
            nNode = document.createTextNode( string );

            //如果是一个可以渲染的组件
        }else if( typeof vEl === "object" && vEl.Class ){

            //通过组件渲染; 组件渲染属于迭代渲染， 会自动渲染子组件;
            //生成新元素， 该元素要添加到目标节点中;
            nNode = this.addComponent( vEl );

            //如果只是一个单纯的对象, 我们认为这是一个元素;
        }else if( typeof vEl === "object" ) {

            //tag的名称;
            tag = vEl.name || "div";
            nNode = document.createElement( tag );

            //绑定属性,　事件，　自定义事件;
            if( !flag ) {
                this._assignProps( nNode, vEl&&vEl.model );
            };
            nNode.dom = this;
            nNode.dom.nNode = nNode;

            //如果有子元素的话, 就迭代渲染子元素;;
            if( nNode&&vEl&&vEl.kids ) {
                this.renderKids( vEl.kids ,nNode );
            };

        }else if(typeof vEl === "undefined"){
            return
        };

        //如果有目标元素， 那就把所有的子元素先删了吧;
        if( tar ) {
            this.fireEvent("beforeappend", nNode, tar);
            if( isFlag ) {
                tar.innerHTML+=(nNode.textContent||nNode.innerText);
            }else{
                tar.appendChild( nNode );
            };
            this.fireEvent("afterappend", nNode, tar);
        };
        this.fireEvent("afterrender", tar);

        return tar || nNode;

    };

    /**
     * @public
     * @desc 通过组件渲染;
     * @param vEle 虚拟DOM
     * @return DOM;
     * */
    nono.Dom.prototype.addComponent = function ( vEle ) {
        var Class = vEle.Class;
        var kids = Array.prototype.concat.call([],Class.settings.kids || [],  vEle.kids||  []);
        //把Component中的配置加载到vEle上;
        vEle.kids = kids;

        vEle.model = vEle.model || {};
        util.cloneProps(true, vEle.model , Class.settings.model);

        vEle.name = vEle.name || Class.settings.name;
        Class.init&&Class.init();
        var dom = new nono.Dom();
        //delete vEle.Class;
        vEle.Class = undefined;
        return dom.render(vEle);
    };

    /**
     * 添加属性到虚拟DOM中;
     * @param target
     * @param { key : value };
     * */
    nono.Dom.prototype._assignProps = function(tar, props) {
        var fc, val;
        for( var p in props ) {
            fc = p.charAt(0);
            val = props[p];
            switch (fc) {
                case "#" :
                    tar.setAttribute("id", val);
                    break;
                case "@":
                    tar.setAttribute(p.slice(1), val);
                    break;
                case "-":
                    tar.style.setProperty(p.slice(1), val);
                    break;
                case ".":
                    tar.className += val;
                    break;
                case "!" :
                    //绑定事件;
                    this._assignEv( tar,  p.slice(1), props[p] );
                    break;
                case "*" :
                    this.initEmiter( props[p] || [] );
                    break;
                default:
                    props.tplData = props.tplData || {};
                    //把数据保存到tplData这个对象里面;
                    props.tplData[p] = props[p];
            };
        };
    };

    /**
     * 添加绑定事件;
     *
     * */
    nono.Dom.prototype._assignEv = function(tar,e, fn) {
        eventHandlers(tar, e, fn ,false);

        function cancel(ev) {
            ev.returnValue = false;
            ev.cancelBubble = true;
            ev.preventDefault&&ev.preventDefault();
            ev.stopPropagation&&ev.stopPropagation();
        };

        /**
         * @desc 事件绑定;
         * @param 元素
         * @param 事件名字
         * @param 绑定的事件或者事件数组
         * @param 是否捕获
         * */
        function eventHandlers(realElem, evName, fns, capture) {
            if (typeof fns === "object" ) {
                for (var i = 0, n = fns.length; i < n; i++) {
                    (function(i) {
                        fns[i] && realElem.addEventListener(evName, function(ev) {
                            //如果返回false就不自动刷新界面;
                            if( !fns[i].apply(realElem, Array.prototype.slice.apply(arguments).concat( realElem.dom.vEl )) ) {
                                cancel(ev);
                                return
                            };
                            //作用域被我们捕获;
                            try{
                                realElem.dom.update(realElem);
                            }catch(e) {
                                console.log("realElem.dom.update(); error");
                            };
                        }, capture);
                    })(i);
                };

            }else if (fns && (typeof fns === "function")) {
                realElem.addEventListener(evName, function(ev) {
                    //如果返回false就不自动刷新界面;
                    if( !fns.apply(realElem, Array.prototype.slice.apply(arguments).concat( realElem.dom.vEl )) ) {
                        cancel(ev);
                        return;
                    };
                    //每次执行事件的时候都会重新刷新dom, 作用域被我们捕获;
                    try{
                        realElem.dom.update(realElem);
                    }catch(e) {
                        console.log("realElem.dom.update(); error");
                    };
                }, capture);
            };
        };
    };

    /**
     * @desc 要把目标元素中节点全部删除;
     * @param tar 目标节点;
     * */
    nono.Dom.prototype._assignChildren = function( tar ) {
        //所有的NODE节点;
        var child, name;
        while(child = tar.lastChild) {
            name = (child.tagName || child.nodeName || "").toLocaleLowerCase();
            if(name === "script" || name === "link" || name === "style") break;
            this.fireEvent("beforeremovechild" ,child);
            //如果fireEvent返回值为false，那么就不删除元素;
            if( this.fireEvent("removechild" ,child) !== false ) {
                tar.removeChild( child );
            };
            this.fireEvent("afterremovechild" ,child);
        };
    };

    /**
     * @desc更新model模型， 到view中?
     *
     * */
    nono.Dom.prototype.setState = function( key, value) {

    };

    /**
     * @desc 创建DOM组件， 可以进行复用, COM组件主要是用来保存参数;
     * @return Constructor;
     * */
    nono.Component = function ( settings ) {
        //这样可以使用无new的方式使用Component组件
        if( this === window) {
            return new nono.Component( settings );
        };
        this.settings = util.cloneProps(true, {}, settings);//util.shallowClone(settings);
    };

    /**
     * @desc 初始化设置;
     * */
    nono.Component.prototype.init = function(  ) {
    };

    /**
     * @desc 为元素附加视图;
     * @param 参数为函数或者一个对象；
     * @return this;
     * */
    nono.Component.prototype.extendView = function ( obj ) {
        if( typeof obj === "function") {
            obj.call(this,this.settings.kids);
        }else if( typeof obj === "object" ) {
            this.setting.kids.push( obj );
        };
        return this;
    };

    window.nono = nono;
})();