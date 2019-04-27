(function() {
    var fac = new FastAverageColor();
    var rows = document.querySelectorAll('.row');
    var listAlgorithms = ['simple', 'sqrt', 'dominant'];

    for (var i = 0; i < rows.length; i++) {
        for (var algorithm = 0; algorithm < listAlgorithms.length; algorithm++) {
          var algorithmName = listAlgorithms[algorithm];
          var resource = rows[i].querySelector('.item_image');
          if (!resource) {
              continue;
          }
          
          fac.getColorAsync(rows[i].querySelector('.item_image'), { algorithm: algorithmName })
            .then(function(data, color) {
                var alogrithmItem = data.row.querySelector('.item_' + data.algorithm);

                alogrithmItem.style.backgroundColor = color.rgb;
                alogrithmItem.style.color = color.isDark ? '#fff' : '#000';
                alogrithmItem.innerText = color.hex;
            }.bind(this, { row: rows[i], algorithm: algorithmName }))
            .catch(function(e) {
                console.log(e);
            });
        }
    }
})();
