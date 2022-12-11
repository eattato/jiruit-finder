// funcs
String.prototype.format = function () {
  var result = this;
  for (var ind in arguments) {
    result = result.replaceAll("?", arguments[ind]);
  }
  return result;
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

$(document).bind("contextmenu", function () {
  return false;
});

function resize() {
  $(".frame").css({
    width: "?px".format(window.innerHeight * 0.7),
    height: "?px".format(window.innerHeight * 0.7),
  });
  $(".button").css({
    width: "?%".format((1 / Number($(".grid").val())) * 100),
    height: "?%".format((1 / Number($(".grid").val())) * 100),
  });
}

function playSound(src, loop) {
  // js 기준이 아닌 HTML 기준으로 경로 전송해야함..
  let audioElement = null;
  if (loop == true) {
    audioElement = $($.parseHTML("<audio src='?' loop></audio>".format(src)));
  } else {
    audioElement = $($.parseHTML("<audio src='?'></audio>".format(src)));
  }

  $("body").append(audioElement);
  audioElement[0].play();
  return audioElement[0];
}

// main
$().ready(() => {
  let boxSize = 10;
  let bombCount = 20;
  let boxes = [];
  let timerCounter = null;
  let bgm = null;

  resize();
  $(window).resize(resize, true);

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

  // 좌표로 박스 데이터 가져오는 함수
  const getBoxWithLoc = (col, row) => {
    for (let ind in boxes) {
      let box = boxes[ind];
      if (box["col"] == col && box["row"] == row) {
        return box;
      }
    }
  };

  // 박스 버튼으로 데이터 가져오는 함수
  const getBoxWithButton = (button) => {
    for (let ind in boxes) {
      let box = boxes[ind];
      if (box["box"].attr("id") == button.attr("id")) {
        return box;
      }
    }
  };

  // 8칸 폭탄 탐지
  const searchBomb = (box, callback) => {
    bombFound = 0;
    for (let col = box["col"] - 1; col <= box["col"] + 1; col++) {
      for (let row = box["row"] - 1; row <= box["row"] + 1; row++) {
        let searching = getBoxWithLoc(col, row);
        if (searching != null && searching["opened"] == false) {
          if (searching["bomb"] == true) {
            bombFound += 1;
          }

          if (callback != null) {
            callback(searching);
          }
        }
      }
    }
    return bombFound;
  };

  // 상자 개방
  const openBox = (box) => {
    let bombFound = 0;
    box["opened"] = true;

    // 근처의 폭탄 수색
    bombFound = searchBomb(box);
    box["box"].addClass("opened");
    if (bombFound != 0) {
      box["box"].text(bombFound);
    }

    // 폭탄 안 찍히면 확대 수색
    if (bombFound == 0) {
      searchBomb(box, (box) => {
        openBox(box);
      });
    }
  };

  // 타이머 정지
  const stopTimer = () => {
    if (timerCounter != null) {
      clearInterval(timerCounter);
      timerCounter = null;
    }
  };

  // 타이머 초기화
  const resetTimer = () => {
    if (timerCounter != null) {
      stopTimer();
      $(".timer").text("0");
    }
  };

  // BGM 정지
  const stopBgm = () => {
    if (bgm != null) {
      $(bgm).remove();
      bgm = null;
    }
  };

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  timerId = null;

  // 적용 버튼 클릭
  $(".apply").click(() => {
    // 초기화
    resetTimer();
    $(".frame").empty();
    stopBgm();
    bgm = playSound("sounds/The Rakehornpipe.mp3");

    boxes = [];
    boxSize = Number($(".grid").val());
    bombCount = Number($(".bombcount").val());
    let dead = false;
    let firstOpen = true;
    let safeZoneSize = Math.floor(boxSize / 9) + 1;
    //let safeZoneSize = 2;

    // 상자 생성
    for (let col = 0; col < boxSize; col++) {
      for (let row = 0; row < boxSize; row++) {
        let htmlBox =
          '<div class="button" onselectstart="return false" style="width: ?%; height: ?%;"></div>'.format(
            (1 / boxSize) * 100
          );

        let btn = $($.parseHTML(htmlBox)); // $()로 감싸서 바닐라 element에서 jquery element로 변경
        btn.attr("id", "button?".format((col + 1) * (row + 1)));

        let boxData = {
          box: btn,
          col: col,
          row: row,
          opened: false,
          flag: false,
          bomb: false,
        };
        boxes.push(boxData);
        $(".frame").append(btn);

        btn.mousedown(function (direc) {
          if (dead == false) {
            let box = boxData;

            // 처음 연 상자면 폭탄 및 세이프존 생성
            if (firstOpen == true) {
              firstOpen = false;

              // 세이프존 제외
              colStart = box["col"] - safeZoneSize;
              colEnd = box["col"] + safeZoneSize;
              rowStart = box["row"] - safeZoneSize;
              rowEnd = box["row"] + safeZoneSize;
              let bombTargets = [];
              for (let col = 0; col < boxSize; col++) {
                for (let row = 0; row < boxSize; row++) {
                  // 세이프존으로 지정되지 않았다면 폭탄 대상이 될 수 있음
                  isSafe =
                    col > colStart &&
                    col < colEnd &&
                    row > rowStart &&
                    row < rowEnd;

                  if (isSafe == false) {
                    bombTargets.push([col, row]);
                  } else {
                    // getBoxWithLoc(col, row)["box"].css({
                    //   "background-color": "blue",
                    // });
                  }
                }
              }

              // 폭탄 생성
              for (let i = 1; i <= bombCount; i++) {
                if (bombTargets.length < 1) {
                  break;
                }
                let bombInd = rand(0, bombTargets.length - 1);
                let bombLoc = bombTargets[bombInd];
                let box = getBoxWithLoc(bombLoc[0], bombLoc[1]);
                box["bomb"] = true;
                //box["box"].addClass("bomb");
                bombTargets.splice(bombInd, 1);
              }

              // 타이머 진행
              resetTimer();
              var timer = 0;
              timerCounter = setInterval(function () {
                timer += 1;
                $(".timer").text(timer);
              }, 1000);
            }

            // 열기
            if (box["opened"] == false) {
              if (direc.which == 1) {
                if (box["flag"] == false) {
                  // 상자 개방
                  if (box["bomb"] == false) {
                    openBox(box);
                  }

                  // 게임 오버
                  else {
                    dead = true;
                    stopTimer();
                    stopBgm();

                    // 차례로 터지는 이펙트
                    waitTime = 750; // 누르고 난 뒤 대기 시간
                    fuseTime = 500; // 애니메이션 재생 시간
                    delayPerBomb = 30; // 각 폭탄별 대기 시간
                    afterDelay = 1000; // 다 불 붙은뒤 터지기 전 대기 시간
                    hitmarkerTime = 50;

                    // 히트 마커 이펙트
                    box["box"].css({ "background-color": "#ff0000" });
                    let hitmarker = $(
                      $.parseHTML(
                        "<img class='hitmarker' src='images/hitmarker.png' alt=''>"
                      )
                    );
                    box["box"].append(hitmarker);
                    setTimeout(() => {
                      hitmarker.remove();
                    }, hitmarkerTime);
                    playSound("sounds/hitmarker.wav");

                    // 폭탄 이펙트
                    bombs = [];
                    for (let ind in boxes) {
                      let bomb = boxes[ind];
                      if (bomb["bomb"] == true) {
                        bombs.push(bomb["box"]);
                      }
                    }
                    shuffle(bombs);
                    for (let ind in bombs) {
                      let bomb = bombs[ind];
                      setTimeout(() => {
                        //box.addClass("bomb");
                        bomb.animate(
                          { "background-color": "#ff0000" },
                          fuseTime
                        );
                      }, waitTime + ind * delayPerBomb);
                    }
                    setTimeout(() => {
                      playSound("sounds/explosion.ogg");
                      for (let ind in bombs) {
                        let bomb = bombs[ind];
                        let explosion = $(
                          $.parseHTML(
                            "<img class='explosion' src='images/explosion.gif' />"
                          )
                        );
                        bomb.append(explosion);
                      }
                    }, waitTime + (bombs.length - 1) * delayPerBomb + afterDelay);
                  }
                }
              }

              // 깃발 설치 & 제거
              else {
                // 깃발 설치
                if (box["flag"] == false) {
                  box["flag"] = true;
                  btn.append(
                    "<img class='flag' src='images/flag.png' alt='Flag'>"
                  );

                  let left = 0;
                  for (let ind in boxes) {
                    let box = boxes[ind];
                    if (box["bomb"] == false) {
                      if (box["open"] == false) {
                        left += 1;
                      }
                    } else {
                      if (box["flag"] == false) {
                        left += 1;
                      }
                    }
                  }
                  if (left == 0) {
                    stopTimer();
                    alert("클리어!");
                  }
                }

                // 깃발 제거
                else {
                  box["flag"] = false;
                  btn.find(".flag").remove();
                }
              }
            }
          }
        });
      }
    }
  });
});
