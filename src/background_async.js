(function() {
    var
        ac = new FastAverageColor(),
        items = document.querySelectorAll('.item');

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        ac.getColorAsync(item.querySelector('img'))
            .then(function(item, color) {
                item.style.backgroundColor = color.rgb;
                item.style.color = color.isDark ? 'white' : 'black';
            }.bind(this, item))
            .catch(function(error) {
                console.log(error);
            });
    }
})();
