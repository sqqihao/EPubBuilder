define(function() {
    var template = {
        "coverTpl" : '<li>' +
            '<input value="封面" readonly="true"> ' +
            '</li>',
        "leftTpl" : '<li>' +
            '<a href="###" class="clone">' +
            '<i class="fa fa-clone"></i>' +
            '</a>' +
            '<a href="###" class="trash">' +
            '<i class="fa fa-trash"></i>' +
            '</a>' +
            '<input value="{{this}}">' +
            '</li>',
        "contentTpl" : '<li>' +
            '<div></div>' +
            '</li>'
    };

    return template;
})