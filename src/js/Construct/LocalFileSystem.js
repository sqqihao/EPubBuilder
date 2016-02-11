define(function() {
    var LS = function() {
        this.clear = function() {
            localStorage.clear();
        };
    };
    return LS;
})