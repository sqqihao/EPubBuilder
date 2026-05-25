/**
 * Created by nono on 16-2-21.
 */
define(["Construct/Lang"], function( Lang ) {
    var lang = new Lang();
    var Preview = function() {

        /**
         * @desc 设置编辑器为可编辑状态;
         * */
        function setEnabled() {
            var editors = UM.getEditors();
            for(var editor in editors) {
                try{
                    editors[editor].setEnabled('fullscreen');
                }catch(e){}
            };
            $("#left-nav").find("a").show().end().find("input").removeAttr("readonly").end().find("button").show();
        }

        /**
         * @desc 设置编辑器为不可编辑状态;
         * */
        function setDisabled() {
            var editors = UM.getEditors();
            for(var editor in editors) {
                try{
                    editors[editor].setDisabled('fullscreen');
                }catch(e){}
            };
            $("#left-nav").find("a").hide().end().find("input").attr("readonly","true").end().find("button").hide();
        }

        //toggle插件的js代码
        var toggleHandler = function(toggle) {
            var toggle = toggle;
            var radio = $(toggle).find("input");

            var checkToggleState = function() {
                if (radio.eq(0).is(":checked")) {
                    $(toggle).removeClass("toggle-off");
                } else {
                    $(toggle).addClass("toggle-off");
                }
            };

            checkToggleState();

            radio.eq(0).click(function() {
                $(toggle).toggleClass("toggle-off");
                setEnabled();
                lang.setState(true);
            });

            radio.eq(1).click(function() {
                $(toggle).toggleClass("toggle-off");
                setDisabled();
                lang.setState(false);
            });
        };
        $(".toggle").each(function(index, toggle) {
            toggleHandler(toggle);
        });
        //toggle插件的js代码 ----end

    }
    return Preview;
})