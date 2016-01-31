define(function() {

    function Toc( ) {
    };

    /**
     * @desc 获取dublinCore
     * @return {Object}
     * */
    Toc.prototype.getDublinCore = function () {
        var data = {};
        $.each($(".export-div form").serializeArray(),function(i,e) {
            e.value&&(data[ e.name ] = e.value);
        });
        return data;
    };

    /**
     * @desc 设置dublinCore的核心到html中;
     * @param {name : "name" , value : "value" };
     * return void;
     * */
    Toc.prototype.setDublinCore = function ( obj ) {
        var form = $(".export-div form");
        $(obj).find("metadata").children().each(function(i, e) {
            var name = e.tagName.split(":").pop() || "";
            form.find("[name="+ name+"]").val( e.textContent || e.innerText );
        });
    };

    return Toc;

});