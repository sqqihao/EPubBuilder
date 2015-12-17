var uiList = document.getElementById("ui-list");
uiList.addEventListener("click", function ( event ) {
    event = window.event || event;
    var role = "";
    if( event.target&&event.target.tagName.toLowerCase()=="a"&&(role = event.target.getAttribute("data-role")) ) {
        document.execCommand(role, false, null);
    }else if(event.target&&(role = event.target.parentNode.getAttribute("data-role"))){
        document.execCommand(role, false, null);
    };
}, false);