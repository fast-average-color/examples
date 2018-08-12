(function() {
    var ac = new FastAverageColor();
    var rows = document.querySelectorAll('.row');
    var listAlgorithms = ['simple', 'sqrt', 'dominant'];

    for (var i = 0; i < rows.length; i++) {
        for (var algorithm = 0; algorithm < listAlgorithms.length; algorithm++) {
          var algorithmName = listAlgorithms[algorithm];
          var resource = rows[i].querySelector('.item_image');
          if (!resource) {
              continue;
          }
          var color = ac.getColorAsync(rows[i].querySelector('.item_image'), function(color, data) {
              var alogrithmItem = data.row.querySelector('.item_' + data.algorithm);

              alogrithmItem.style.backgroundColor = color.rgb;
              alogrithmItem.style.color = color.isDark ? '#fff' : '#000';
              alogrithmItem.innerText = color.hex;
          }, {
              data: {
                  row: rows[i],
                  algorithm: algorithmName
              },
              algorithm: algorithmName
          });
        }
    }
})();
