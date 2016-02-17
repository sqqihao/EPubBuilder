
/**
 * @desc 依赖于conifg.js， 使用之前必须先引用config.js;
 * */

 define(function() {

    var LangFn = function() {

    };

    LangFn.prototype.init = function() {
        var lang = EBConfig.lang;
        var langObj = this.langObj = nono.I18N[lang];
        if(!langObj)return;
        for( var p in langObj ) {
            try{
                document.getElementById("lang-"+p).innerHTML = langObj[p];
            }catch(e) {
                console.log(e);
            }
        };
    };

    LangFn.prototype.getProperty = function( prop ) {
        var lang = EBConfig.lang;
        var langObj = this.langObj = nono.I18N[lang];
        if( langObj[prop] ) {
           return langObj[prop];
        };
        return "";
    };

    return LangFn;
})