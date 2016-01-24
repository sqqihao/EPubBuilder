/*
* @desc 提供增删，初始化;
* */
var Left = function ( left , options) {
    util.EventBase.apply(this, arguments);
    this.left = $(left);
    this.options = $.extend({}, {
    }, options);
    this.init();
    this.events();
};

//继承事件原型;
Left.prototype = new util.EventBase();

$.extend(Left.prototype, {
    /*
    * @desc 初始化
    * */
    "init" : function () {

    },

    /*
    * @desc 添加li点击事件;
    * */
    "addonliclick" : function ( fn ) {
        this.addListener("onliclick", $.proxy( fn, this));
    },

    /*
    * @desc li上的删除被点击的时候
    * */
    "addonremove" : function ( fn ) {
        this.addListener("onremove", $.proxy( fn, this));
    },

    /*
    * @desc 添加自定义事件onclone;
    * */
    "addonclone" : function ( fn ) {
        this.addListener("onclone", $.proxy( fn, this));
    },

    /**
     * @desc
     * */
    "addonaddli" : function ( fn ) {
        this.addListener("onaddli", $.proxy( fn, this));
    },

    /*
    * @desc 绑定事件
    * */
    "events" : function () {
        var _this = this;
        //当li被点击的话;
        this.left&&this.left.delegate("li", "click", function ( event ) {
            _this.fireEvent("onliclick", $(this).index(), this );
        });
        this.left&&this.left.delegate("button.addli", "click", function ( event ) {
            //$.proxy(_this.options.onaddli, _this)( $(this).index() );
            _this.fireEvent("onaddli", $(this).index() );
        });
        //当点击删除的话;
        this.left&&this.left.delegate("a.trash", "click", function ( event ) {
            _this.fireEvent("onremove", $(this).closest("li").index() );
        });
        //单点击复制按钮的话;
        this.left&&this.left.delegate("a.clone", "click", function ( event ) {
            _this.fireEvent("onclone",  $(this).closest("li").index()  );
            //$.proxy(_this.options.onclone, _this)( $(this).closest("li").index() );
        });

    }
})
