String.prototype.format = function () {
  var result = this;
  for (var ind in arguments) {
    result = result.replace("?", arguments[ind]);
  }
  return result;
};

$(document).bind("contextmenu", function () {
  return false;
});

function resize() {
  $(".frame").css({
    width: "?px".format(window.innerHeight * 0.8),
    height: "?px".format(window.innerHeight * 0.8),
  });
  $(".button").css({
    width: "?%".format((1 / Number($(".grid").val())) * 100),
    height: "?%".format((1 / Number($(".grid").val())) * 100),
  });
}

$(document).ready(function () {
  var boxSize = 10;
  var bombCounts = 20;
  var boxes = [];
  var bombPlaces = [];
  resize();
  $(window).resize(resize);

  $(".apply").click(function () {
    // generates boxes
    boxSize = Number($(".grid").val());
    bombCounts = Number($(".bombcount").val());
    $(".button").remove();
    for (var count = 1; count <= boxSize * boxSize; count++) {
      $(".frame").append("<div class='button'></div>");
    }
    resize();
    $(".button").mousedown(function (direc) {
      if (direc.which == 1) {
        // open box
        if (
          $(this).find(".flag").length == 0 &&
          $(this).find(".opened").length == 0
        ) {
          // not flagged and not opened
          var thisPos = 0;
          $(this).addClass("opening");
          // $(this).append("<div class='opened'></div>");

          if ($(".opened").length == 0) {
            // generate map
            bombPlaces = [];
            boxes = [];
            for (var ind = 1; ind <= boxSize; ind++) {
              var row = [];
              for (var ind2 = 1; ind2 <= boxSize; ind2++) {
                if (
                  $(".button")
                    .eq((ind - 1) * boxSize + ind2 - 1)
                    .hasClass("opening")
                ) {
                  thisPos = (ind - 1) * boxSize + ind2 - 1;
                  row.push(1);
                } else {
                  row.push(0);
                  bombPlaces.push((ind - 1) * boxSize + ind2 - 1);
                }
              }
              boxes.push(row);
            }
            for (var ind = 1; ind <= bombCounts; ind++) {
              var bombPlace = Math.floor(Math.random() * bombPlaces.length) + 1;
              $(".button").eq(bombPlaces[bombPlace]).addClass("bomb");
              boxes[Math.floor(bombPlaces[bombPlace] / boxSize)][
                bombPlaces[bombPlace] -
                  Math.floor(bombPlaces[bombPlace] / boxSize) * boxSize
              ] = 2;
              bombPlaces.splice(bombPlaces.indexOf(bombPlace), 1);
            }
          }

          for (var ind = 1; ind <= boxSize; ind++) {
            // get opening pos
            var row = [];
            for (var ind2 = 1; ind2 <= boxSize; ind2++) {
              if (
                $(".button")
                  .eq((ind - 1) * boxSize + ind2)
                  .hasClass("opening")
              ) {
                thisPos = (ind - 1) * boxSize + ind2;
              }
            }
          }

          function open(col, row) {
            if (boxes[col][row] != 2) {
              if (
                $(".button")
                  .eq(col * boxSize + row)
                  .find(".flag").length > 0
              ) {
                $(".button")
                  .eq(col * boxSize + row)
                  .find(".flag")
                  .remove();
              }
              boxes[col][row] = 1; // set box to opened
              var bombCount = 0;
              var openPlan = [];
              for (var ind = 1; ind <= 8; ind++) {
                // scan near blocks if bomb exists
                var openingPos = [0, 0];
                if (ind == 1) {
                  // scan left
                  openingPos = [0, -1];
                } else if (ind == 2) {
                  // scan left top
                  openingPos = [-1, -1];
                } else if (ind == 3) {
                  // scan top
                  openingPos = [-1, 0];
                } else if (ind == 4) {
                  // scan right top
                  openingPos = [-1, 1];
                } else if (ind == 5) {
                  // scan right
                  openingPos = [0, 1];
                } else if (ind == 6) {
                  // scan right bottom
                  openingPos = [1, 1];
                } else if (ind == 7) {
                  // scan bottom
                  openingPos = [1, 0];
                } else if (ind == 8) {
                  // scan left bottom
                  openingPos = [1, -1];
                }
                if (
                  col + openingPos[0] >= 0 &&
                  col + openingPos[0] < boxSize &&
                  row + openingPos[1] >= 0 &&
                  row + openingPos[1] < boxSize
                ) {
                  // if scanning box is not wall
                  if (boxes[col + openingPos[0]][row + openingPos[1]] == 2) {
                    // add bomb count if scanning block is bomb
                    bombCount++;
                  } else if (
                    boxes[col + openingPos[0]][row + openingPos[1]] == 0
                  ) {
                    // if scanning block is unopened, add to open list
                    openPlan.push([col + openingPos[0], row + openingPos[1]]);
                  }
                }
              }
              if (bombCount > 0) {
                $(".button")
                  .eq(col * boxSize + row)
                  .append("<div class='opened'>?</div>".format(bombCount));
              } else {
                for (var ind in openPlan) {
                  open(openPlan[ind][0], openPlan[ind][1]);
                }
                $(".button")
                  .eq(col * boxSize + row)
                  .append("<div class='opened'></div>");
              }
            } else {
              $(".button")
                .eq(col * boxSize + row)
                .addClass("active");
            }
          }

          open(Math.floor(thisPos / boxSize), thisPos % boxSize);
          $(this).removeClass("opening");
        }
      } else {
        // flag box
        if ($(this).find(".flag").length == 0) {
          // add flag
          $(this).append("<img class='flag' src='images/flag.png' alt='Flag'>");
        } else {
          // remove flag
          $(this).find(".flag").remove();
        }
      }
    });
  });
});
