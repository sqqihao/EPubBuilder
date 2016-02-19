define(function() {
    var template = {
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