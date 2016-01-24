/**
 * @desc 因为整个界面要使用angularJS, 所以我们需要一个数据模型, 界面是一个view,
 * 事件是路由， 而model是一整个数据结构， 我们要的就是修改这个数据模型;
 * @desc 七牛sdk:http://developer.qiniu.com/docs/v6/sdk/javascript-sdk.html;
 * */
var model = {
    /**
     * @desc 柏林核心的15个要素
     * */
    "Dublin Core" : {
        "Title" : "主题",
        "Creator" : "作者",
        "Subject and Keywords" : "资源内容的主题",
        "Description" : "有关资源内容的说明",
        "Publisher" : "如包括个人、组织或机构的出版者",
        "Contributor" : "发行者包括个人、组织或机构",
        "Date" : "与资源使用期限相关的日期、时间",
        "Type" : "资源内容方面的特征或体裁",
        "Format" : "资源物理或数字化的特有表示",
        "Identifier" : "依据有关规定分配给资源的标识性信息ISBN等",
        "Source" : "可获取现存资源的有关信息",
        "Language" : "资源知识内容使用的语种",
        "Relation" : "对相关资源的参照",
        "Coverage" : "范围包括空间定位（地名或地理坐标），时代（年代、日期或日期范围）或权限范围",
        "Rights" : "版权项包括资源版权管理的说明"
    },
    /**
     * @desc 页面列表, pages 是一组page组成的数组;
     * */
    "pages" : [
        //page
        {
            "title" : "章节名字",
            "data" : [
                {
                    //控件类型为字段
                    "Com": "NoParagraph",
                    //内部内容
                    "html": "content这里面是控件的内容",
                    //各种样式
                    //需要一种几何的NNode, 让NoParagraph继承他，
                    //需要一种padding和margin的NNode，让NoParagraph继承他，
                    //需要font的NNode，让NoParagraph继承他；
                    "style": {
                        "left": 0,
                        "top": 0,
                        "font" : ""
                    }
                },
                {
                    "Com" : "NoImages",
                    //需要一个特殊的属性, "src"
                    "src" : "图片地址",
                    //各种样式
                    //需要一种几何的NNode, 让NoImages继承他，
                    "style" : {
                        left : 0,
                        top : 0,
                        width : 100,
                        height : 100
                    }
                },
                {
                    "Com" : "NAudio",
                    //因为浏览器原因， 所以要多种地址;
                    "src" : {
                        "mp3" : "mp3"
                    },
                    //各种样式
                    //需要一种几何的NNode, 让NoImages继承他
                    "style" : {
                        left : 0,
                        top : 0
                    }
                },/*
                {
                    "Com" : "NPaint",
                    //我们就把这些数据上传到七牛云存储
                    //因为canvas的缩放会导致界面的重新绘， 所以这个组件就先不要啦;
                    //http://developer.qiniu.com/docs/v6/sdk/javascript-sdk.html
                    "data" : {
                        "src" : "七牛云地址"
                    },
                    //需要一种几何的NNode, 让NoImages继承他
                    "style" : {
                        "left" : 0
                    }
                },*/
                {
                    "Com" : "ANode",
                    "src" : {
                        "href" : "http://www.baidu.com/"
                    }
                },
                {
                    // 这个实现是翻卡片，
                    // 当用户点击这个卡片的时候，会实现翻数据;
                    "Com" : "NCard",
                    //点击实现翻卡片;
                    //需要一种几何的NNode, 让NoImages继承他， 点击的时候发生变化;
                    "data" : ["aaaa","bbbb"]
                }
                //综合以上几个元素， 我们需要
                // 1 : 一个抽象类Abstruct Class；
                // 2 : 需要一个EventListenter， 实现自定义事件;

                //当元素重新加载的时候， 即重新编辑的时候， 能够还原原来的界面;
                //查看的时候实现查看， 而不是可以编辑的状态, 所以各个节点需要一个edit()的方法， 当我们实例了这个方法就可以让元素成为可编辑的状态;
                //如果没有执行这个方法，那么元素默认是不可以编辑， 不可以拖拽， 无法改变属性等;
            ]
        }
    ]
};