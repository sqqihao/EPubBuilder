
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
                document.getElementById("lang-"+p).innerHTML = typeof langObj[p] === "string" ? langObj[p] : langObj[p][0];
            }catch(e) {
                console.log(e);
            }
        };
    };

     LangFn.prototype.setState = function( flag ) {
         var lang = EBConfig.lang;
         var langObj = this.langObj = nono.I18N[lang];
        if(flag) {
            document.getElementById("lang-stateValue").innerHTML = langObj.stateValue[0];
        }else{
            document.getElementById("lang-stateValue").innerHTML = langObj.stateValue[1];
        }
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