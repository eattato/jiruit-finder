String.prototype.format = function () {
  var result = this;
  for (var ind in arguments) {
    result = result.replace("?", arguments[ind]);
  }
  return result;
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

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

  var timerId = -1;
  $(".apply").click(function () {
    if (timerId != -1) {
      clearInterval(timerId);
    }
    $(".timer").text("0");
    // generates boxes
    boxSize = Number($(".grid").val());
    bombCounts = Number($(".bombcount").val());
    console.log(bombCounts);
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
            var timer = 0;
            timerId = setInterval(function () {
              timer += 1;
              $(".timer").text(timer);
            }, 1000);

            bombPlaces = [];
            boxes = [];

            // get this pos
            for (var ind = 1; ind <= boxSize; ind++) {
              for (var ind2 = 1; ind2 <= boxSize; ind2++) {
                if (
                  $(".button")
                    .eq((ind - 1) * boxSize + ind2 - 1)
                    .hasClass("opening")
                ) {
                  thisPos = (ind - 1) * boxSize + ind2 - 1;
                }
              }
            }

            var safeLength = Math.floor(
              Math.sqrt(boxSize * boxSize - bombCounts)
            );

            for (var ind = 1; ind <= boxSize; ind++) {
              var row = [];
              for (var ind2 = 1; ind2 <= boxSize; ind2++) {
                currentPos = (ind - 1) * boxSize + ind2 - 1;
                if ($(".button").eq(currentPos).hasClass("opening")) {
                  thisPos = currentPos;
                  row.push(1);
                } else {
                  row.push(0);
                  bombPlaces.push((ind - 1) * boxSize + ind2 - 1);
                }
              }
              boxes.push(row);
            }

            // console.log("bomb:", bombPlaces.length);
            var safeDirection = 1;
            var safePos = thisPos;
            var safeStack = 1;
            // console.log("safe zone", safeLength);
            while (safeLength > 0) {
              // wraps clicked position and makes safe zone near spawn
              for (var stack = 1; stack <= 2; stack++) {
                if (safeLength > 0) {
                  for (var count = 1; count <= safeStack; count++) {
                    if (safeLength > 0) {
                      if (safeDirection == 1) {
                        // right
                        safePos += 1;
                      } else if (safeDirection == 2) {
                        // down
                        safePos += boxSize;
                      } else if (safeDirection == 3) {
                        // left
                        safePos -= 1;
                      } else if (safeDirection == 4) {
                        // down
                        safePos -= boxSize;
                      }
                      var col = Math.floor(safePos / boxSize);
                      var row = safePos - col * (boxSize - 1);

                      if (
                        row < boxSize &&
                        row >= 0 &&
                        col < boxSize &&
                        col >= 0
                      ) {
                        bombPlaces.splice(bombPlaces.indexOf(safePos), 1);
                        safeLength -= 1;
                        $(".button").eq(safePos).addClass("wrap");
                      }
                    } else {
                      break;
                    }
                  }
                  safeDirection += 1;
                  if (safeDirection > 4) {
                    safeDirection = 1;
                  }
                } else {
                  break;
                }
              }
              safeStack += 1;
            }

            // console.log("clicked:", thisPos);
            // console.log("safezone left:", safeLength);
            console.log("bomb placeable:", bombPlaces.length);
            // console.log("place gogogo");
            // console.log("placeable bombs:", bombCounts);
            console.log(bombPlaces);
            var placedBomb = 0;
            for (var ind = 1; ind <= bombCounts; ind++) {
              placedBomb += 1;
              var bombPlace = rand(0, bombPlaces.length - 1);
              // var bombPlace = Math.floor(Math.random() * bombPlaces.length);
              // console.log(bombPlace, bombPlaces[bombPlace], bombPlaces);
              // console.log("placing:", bombPlaces[bombPlace]);
              $(".button").eq(bombPlaces[bombPlace]).addClass("bomb");
              boxes[Math.floor(bombPlaces[bombPlace] / boxSize)][
                bombPlaces[bombPlace] -
                  Math.floor(bombPlaces[bombPlace] / boxSize) * boxSize
              ] = 2;
              var before = bombPlaces.length;
              bombPlaces.splice(bombPlace, 1);
              console.log(bombPlaces.length - before);
            }
            // console.log("placed all bomb", placedBomb);
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
              $(".button").addClass("active");
              if (timerId != -1) {
                clearInterval(timerId);
              }
            }
          }

          open(Math.floor(thisPos / boxSize), thisPos % boxSize);
          $(this).removeClass("opening");
          var clear = true;
          for (var col = 1; col <= boxSize; col++) {
            for (var row = 1; row <= boxSize; row++) {
              if (boxes[ind - 1][row - 1] == 0) {
                console.log("block not opened");
                clear = false;
                break;
              } else if (
                boxes[col - 1][row - 1] == 2 &&
                $(".button")
                  .eq(ind - 1)
                  .find(".flag").length == 0
              ) {
                console.log("bomb not flagged");
                clear = false;
                break;
              }
            }
          }
          if (clear == true) {
            window.alert("클리어!");
          }
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
        var clear = true;
        for (var col = 1; col <= boxSize; col++) {
          for (var row = 1; row <= boxSize; row++) {
            if (boxes[ind - 1][row - 1] == 0) {
              console.log("block not opened");
              clear = false;
              break;
            } else if (
              boxes[col - 1][row - 1] == 2 &&
              $(".button")
                .eq(ind - 1)
                .find(".flag").length == 0
            ) {
              console.log("bomb not flagged");
              clear = false;
              break;
            }
          }
        }
        if (clear == true) {
          window.alert("클리어!");
        }
      }
    });
  });
});

$().ready(() => {
  let boxSize = 10;
  let bombCount = 20;
  let boxes = [];

  // col, row 값으로 박스 리턴해주는 함수
  const getBox = (col, row) => {
    return boxes[row * boxSize + col];
  };

  // 입력 시 숫자 아닌 값 들어가면 다시 되돌려 버림
  $("input").each((ind, obj) => {
    let input = $(obj);
    let oldValue = input.val();
    input.change(() => {
      let newValue = input.val();
      if (isNaN(newValue)) {
        input.val(oldValue);
      }
    });
  });

  // 적용 버튼 클릭
  $(".apply").click(() => {
    // 초기화
    boxes = [];
    boxSize = Number($(".grid").val());
    bombCount = Number($(".bombcount").val());

    // 상자 생성
    for (let col = 1; col <= boxSize; col++) {
      for (let row = 1; row <= boxSize; row++) {
        let htmlBox =
          '<div class="button" style="width: ?%; height: ?%;"></div>'.format(
            (1 / boxSize) * 100
          );
        let box = $($.parseHTML(htmlBox)); // $()로 감싸서 바닐라 element에서 jquery element로 변경
        let boxData = {
          box: box,
          col: col,
          row: row,
        };
        boxes.append(boxData);
      }
    }
  });
});
