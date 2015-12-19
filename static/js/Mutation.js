/**
 * @desc MutationJs， 使用了DOM3的新事件 MutationObserve； 通过监听指定节点元素， 监听内部dom属性或者dom节点的更改， 并执行相应的回调；
 * */

window.nono = window.nono || {};

/**
 * @desc
 * */
nono.MutationJs = function( dom ) {

    //统一兼容问题
    var MutationObserver = this.MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver;

    //判断浏览器是或否支持MutationObserver;
    this.mutationObserverSupport = !!MutationObserver;

    if(!this.mutationObserverSupport) return alert("浏览器不支持mutationObserverSupport");
    //默认监听子元素， 子元素的属性， 属性值的改变;
    this.options = {
        'childList': true,
        'subtree': true,
        'attributes' : true,
        'characterData' : true,
        'attributeOldValue' : true,
        'characterDataOldValue' : true
    };

    //这个保存了MutationObserve的实例;
    this.muta = {};

    //list这个变量保存了用户的操作;
    this.list = [];

    //当前回退的索引
    this.index = 0;

    //如果没有dom的话，就默认监听body;
    this.dom = dom|| document.documentElement.body || document.getElementsByTagName("body")[0];

    //马上开始监听;
    this.observe( );

};

$.extend(nono.MutationJs.prototype, {

    //节点发生改变的回调, 要把redo和undo都保存到list中;
    "callback" : function ( records , instance ) {
        //要把索引后面的给清空;
        this.list.splice( this.index+1 );

        var _this = this;
        records.map(function(record) {
            var target = record.target;
            console.log(record);
            //删除元素或者是添加元素;
            if( record.type === "childList" ) {
                //如果是删除元素;
                if(record.removedNodes.length !== 0) {
                    //获取元素的相对索引;
                    var indexs = _this.getIndexs(target.children , record.removedNodes );
                    _this.list.push({
                        "undo" : function() {
                            _this.disconnect();
                            _this.addChildren(target,  record.removedNodes ,indexs );
                            _this.reObserve();
                        },
                        "redo" : function() {
                            _this.disconnect();
                            _this.removeChildren(target,  record.removedNodes );
                            _this.reObserve();
                        }
                    });
                    //如果是添加元素;
                };

                if(record.addedNodes.length !== 0) {
                    //获取元素的相对索引;
                    var indexs = _this.getIndexs(target.children , record.addedNodes );
                    _this.list.push({
                        "undo" : function() {
                            _this.disconnect();
                            _this.removeChildren(target,  record.addedNodes );
                            _this.reObserve();
                        },
                        "redo" : function () {
                            _this.disconnect();
                            _this.addChildren(target,  record.addedNodes ,indexs);
                            _this.reObserve();
                        }
                    });
                };
                //@desc characterData是什么鬼;
                //ref :  http://baike.baidu.com/link?url=Z3Xr2y7zIF50bjXDFpSlQ0PiaUPVZhQJO7SaMCJXWHxD6loRcf_TVx1vsG74WUSZ_0-7wq4_oq0Ci-8ghUAG8a
            }else if( record.type === "characterData" ) {
                var oldValue = record.oldValue;
                var newValue = record.target.textContent //|| record.target.innerText, 不准备处理IE789的兼容，所以不用innerText了;
                _this.list.push({
                    "undo" : function() {
                        _this.disconnect();
                        target.textContent = oldValue;
                        _this.reObserve();
                    },
                    "redo" : function () {
                        _this.disconnect();
                        target.textContent = newValue;
                        _this.reObserve();
                    }
                });
                //如果是属性变化的话style, dataset, attribute都是属于attributes发生改变, 可以统一处理;
            }else if( record.type === "attributes" ) {
                var oldValue = record.oldValue;
                var newValue = record.target.getAttribute( record.attributeName );
                var attributeName = record.attributeName;
                _this.list.push({
                    "undo" : function() {
                        _this.disconnect();
                        target.setAttribute(attributeName, oldValue);
                        _this.reObserve();
                    },
                    "redo" : function () {
                        _this.disconnect();
                        target.setAttribute(attributeName, newValue);
                        _this.reObserve();
                    }
                });
            };
        });

        //重新设置索引;
        this.index = this.list.length-1;

    },

    "removeChildren" : function ( target, nodes ) {

        for(var i= 0, len= nodes.length; i<len; i++ ) {
            target.removeChild( nodes[i] );
        };

    },

    "addChildren" : function ( target, nodes ,indexs) {

        for(var i= 0, len= nodes.length; i<len; i++ ) {
            if(target.children[ indexs[i] ]) {
                target.insertBefore( nodes[i] , target.children[ indexs[i] ])  ;
            }else{
                target.appendChild( nodes[i] );
            };
        };

    },

    //快捷方法,用来判断child在父元素的哪个节点上;
    "indexOf" : function ( target, obj ) {

        return Array.prototype.indexOf.call(target, obj)

    },

    "getIndexs" : function (target, objs) {
        var result = [];
        for(var i=0; i<objs.length; i++) {
            result.push( this.indexOf(target, objs[i]) );
        };
        return result;
    },

    /**
     * @desc 指定监听的对象
     * */
    "observe" : function( ) {

        if( this.dom.nodeType !== 1) return alert("参数不对，第一个参数应该为一个dom节点");
        this.muta = new this.MutationObserver( this.callback.bind(this) );
        //马上开始监听;
        this.muta.observe( this.dom, this.options );

    },

    /**
     * @desc 重新开始监听;
     * */
    "reObserve" : function () {

        this.muta.observe( this.dom, this.options );

    },

    /**
     *@desc 不记录dom操作， 所有在这个函数内部的操作不会记录到undo和redo的列表中;
     * */
    "without" : function ( fn ) {

        this.disconnect();
        fn&fn();
        this.reObserve();

    },

    /**
     * @desc 取消监听;
     * */
    "disconnect" : function () {

        return this.muta.disconnect();

    },

    /**
     * @desc 保存Mutation操作到list;
     * */
    "save" : function ( obj ) {

        if(!obj.undo)return alert("传进来的第一个参数必须有undo方法才行");
        if(!obj.redo)return alert("传进来的第一个参数必须有redo方法才行");
        this.list.push(obj);

    },

    /**
     * @desc  ;
     * */
    "reset" : function () {
        //清空数组;
        this.list = [];
        this.index = 0;
    },

    /**
     * @desc 把指定index后面的操作删除;
     * */
    "splice" : function ( index ) {

        this.list.splice( index );

    },

    /**
     * @desc 往回走， 回退
     * */
    "undo" : function () {

        if( this.canUndo() ) {
            this.list[this.index].undo();
            this.index--;
        };

    },

    /**
     * @desc 往前走， 重新操作
     * */
    "redo" : function () {

        if( this.canRedo() ) {
            this.index++;
            this.list[this.index].redo();
        };

    },

    /**
     * @desc 判断是否可以撤销操作
     * */
    "canUndo" : function () {

        return this.index !== -1;

    },

    /**
     * @desc 判断是否可以重新操作;
     * */
    "canRedo" : function () {

        return this.list.length-1 !== this.index;

    }
});