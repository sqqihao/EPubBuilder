/*
var qiniuDomain = "http://7xpbs2.com1.z0.glb.clouddn.com/";

//文件上传成功的回调;
function  fileUploadSuccess() {

};
*/

/*

var uploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'pickfiles',
    drop_element: 'container',
    max_file_size: '100mb',
    multi_selection : false,
    flash_swf_url: 'third/js-sdk-master/js-sdk-master/src/plupload/Moxie.swf',
    dragdrop: true,
    chunk_size: '4mb',
    uptoken_url: $('#uptoken_url').val(),
    domain: $('#domain').val(),
    get_new_uptoken: false,
    auto_start: true,
    init: {
        "FileUploaded" : function (up , files, info) {
            try{
                if( JSON.parse(info).key ) {
                    fileUploadSuccess( JSON.parse(info).key  )
                };
                uploader.refresh();
            }catch( e ) {
                alert("文件上传失败");
            };
        }
    }
});

function uploadFn () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image*/
/*";
    input.onchange = function ( ev ) {
        uploader.addFile(ev.target.files[0], [ ev.target.files[0].filename ]);
        uploader.start();
        input = null;
    };
    input.click();
};
*/


/*
var uiList = document.getElementById("ui-list");
uiList.addEventListener("click", function ( event ) {
    event = event || window.event;
    var role = "";
    var elA;
    elA = util.closest(event.target,"btn");
    if(!elA)return ;
    role = elA.getAttribute("data-role");

    if( role === "insertImage" ) {
        //设置回调， 如果文件上传成功就会执行这里;
        fileUploadSuccess = function ( src ) {
            document.execCommand(role, false, qiniuDomain + src );
        };
        uploadFn();
    }else if( elA  &&  role) {
        document.execCommand(role, false, null);
    };
}, false);

var editDiv = document.getElementById("edit-div");
editDiv.addEventListener("keydown", function ( event ) {
    event = event || window.event;
    if(event.keyCode === 9 ) {
        util.addIndent();
        event.preventDefault();
        event.stopPropagation();
    }
});

var client = new ZeroClipboard( document.getElementById("copy") );

client.on( "ready", function( readyEvent ) {
    client.on( "copy", function( event ) {
        ZeroClipboard.setData("text/plain", window.getSelection().toString());
    } );
});
*/
/*
var paste = document.getElementById("paste");
paste.addEventListener("click", function (event) {
    var s = window.getSelection();
    if( s ) {

    };
}, false);
*/
