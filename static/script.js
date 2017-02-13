turns = 0;
playerWin1 = 0;
playerWin2 = 0;

$(document).ready(function() {
    allHighscores();

    // Empties session storage if user reloads page
    sessionStorage.clear();

    $("#startGame").click(function(event){
        event.preventDefault();
        log("A new game has been started.");
        players = $("#welcome form").serializeArray();

        // Create unique ID:s for the players
        $.get("/new_id", function (data) {
            var twoID = JSON.stringify(data);
            sessionStorage.setItem('json_id', twoID);
        }). done( function(twoID) {
            // Saves users on server
            saveHighscore(twoID.id1, players[0].value, playerWin1);
            saveHighscore(twoID.id2, players[1].value, playerWin2);
        });

        play();
    });
});

/**
    Starts game
*/
function play() {
    // Show game section and print game board
    $("#welcome").hide();
    $("#game").show();
    gameBoard();
    printCurrentHighscores();

    // Print out which color each player has
    $('#game').prepend("<p>" + players[0].value + ", you are <span class='yellow'>yellow</span>. "
    + players[1].value + ", you are <span class='red'>red</span>.");

    move();
};

/**
    Prints out gameboard
*/
function gameBoard() {
    // 6 rows
    for (var i = 0; i < 6; i++) {

        var $row = $("<div class='row'></div>");

        // 7 columns per row
		for (var j = 0; j < 7; j++) {
            var $circle = $("<div class='circle'></div>");
			$row.append($circle[0]);
		};

        var $board = $("#board");
        $board.append($row[0]);
	};
};

/**
Get's all highscores from server
*/
function allHighscores() {
    $.get("/get_highscores").done(function (data) {
        highscores = JSON.stringify(data);
        highscores = JSON.parse(highscores);
        printAllHighscores(highscores);
    });
};

/**
Prints out all highscores on page
*/
function printAllHighscores(highscores) {
    var highscoreBoard = $("#results article:first-child").children();
    $("#results article:first-child").find("li").remove();
    $.each(highscores, function(index, object) {
        $(object).each(function(key, player) {
            $(highscoreBoard[1]).append("<li>" + player.name + ": " + player.score + " wins</li>")
        });
    });
};
/**
Prints out highscores for current players
*/
function printCurrentHighscores() {
    var currentPlayersHighscores = $("#results article:nth-child(2)").children();
    $(currentPlayersHighscores).find("li").remove();
    $(currentPlayersHighscores[1]).append("<li>" + players[0].value + ": " + playerWin1 + " wins</li>");
    $(currentPlayersHighscores[1]).append("<li>" + players[1].value + ": " + playerWin2 + " wins</li>");
};

/**
Saves the player's highscores on server
*/
function saveHighscore(id, name, highscore) {
    $.ajax({
        url: "/save_highscore",
        type: 'POST',
        data:{
            'id': id,
            'name': name,
            'score': highscore
            },
        dataType: 'text',
        success: function (response) {
        console.log(response);
        allHighscores();
        }
    });
};

/**
    Let's the player make it's move.
    Each time a move is made, checks if they have four in a row, or if all
    cirles on the board are filled, otherwise switches turns to next player.
*/
function move() {
    $circles = $("#board").children().children();
    // Player 1 always starts
    var playersTurn = 1;
    $("#name").html(players[0].value);

    // Make all circles on the board clickable
    $circles.each(function() {
            $(this).click(function(event) {

                if ((playersTurn == 1) && ($(this).css("background-color") == "rgb(255, 255, 255)")) {
                    var columnIndex = $(event.target).index();
                    var $rows = $("#board").children();

                    // Puts mark on the bottom circle of clicked column
                    for (i = 5; i >= 0; i--) {
                        columns = $($rows[i]).children();
                        if ($(columns[columnIndex]).css("background-color") == "rgb(255, 255, 255)") {
                            $(columns[columnIndex]).css('background-color', "rgb(225, 223, 0)");
                            var rowIndex = $($rows[i]).index();
                            log(players[0].value + " has put a pawn on column " + (columnIndex+1) + ", row " + (rowIndex+1) + ".");
                            break;
                        }
                    };

                    checkForWin(rowIndex, columnIndex, "rgb(225, 223, 0)", playersTurn);
                    playersTurn = switchTurns(playersTurn);
                    return;

                } else if ((playersTurn == 2) && ($(this).css("background-color") == "rgb(255, 255, 255)")) {
                    var columnIndex = $(event.target).index();
                    var $rows = $("#board").children();

                    for (i = 5; i >= 0; i--) {
                        columns = $($rows[i]).children();
                        if ($(columns[columnIndex]).css("background-color") == "rgb(255, 255, 255)") {
                            $(columns[columnIndex]).css('background-color', "rgb(239, 72, 54)");
                            var rowIndex = $($rows[i]).index();
                            log(players[1].value + " has put a pawn on column " + (columnIndex+1) + ", row " + (rowIndex+1) + ".");
                            break;
                        }
                    };

                    checkForWin(rowIndex, columnIndex, "rgb(239, 72, 54)", playersTurn);
                    playersTurn = playersTurn = switchTurns(playersTurn);
                    return;
                };

            });
    });
};

/**
Checks who's turn it is and print it out.
*/
function switchTurns(playersTurn) {
    if (playersTurn == 1) {
        $("#name").html(players[1].value);
        return playersTurn = 2;
    } else {
        $("#name").html(players[0].value);
        return playersTurn = 1;
    };
};

/**
Checks if players has 4 circles marked in a row, column or diagonally,
or if board is full
*/
function checkForWin(rowIndex, columnIndex, color, playersTurn) {

    turns ++;
    var $rows = $("#board").children();

    // Check vertical direction
    var verticalInRow = checkVertical($rows, rowIndex, columnIndex, color);
    // Check horistontal direction
    var horistontalInRow = checkHorisontal($rows, rowIndex, columnIndex, color);
    // Check diagonal direction
    var diagonalInRow = checkDiagonal($rows, rowIndex, columnIndex, color);

    var over = false;

    if ((verticalInRow >= 4) || (horistontalInRow >= 4) || (diagonalInRow[0] >= 4) || (diagonalInRow[1] >= 4)) {
        over = true;
        $("#game p.turn").html(players[playersTurn - 1].value + " has won!");
        log(players[playersTurn - 1].value + " won the game.");

        if (playersTurn == 1) {
            playerWin1 ++;
            var id = JSON.parse(sessionStorage.getItem('json_id'));
            saveHighscore(id.id1, players[0].value, playerWin1);
        } else {
            playerWin2 ++;
            var id = JSON.parse(sessionStorage.getItem('json_id'));
            saveHighscore(id.id2, players[1].value, playerWin2);
        };

        printCurrentHighscores();
    };

    if (turns == 42) {
        over = true;
    };

    if (over == true) {
        // Disabled click event for the circles
        $circles = $("#board").children().children();
        $circles.each(function() {
            $(this).off('click');
        });

        // Display reset button and clear board
        $("#game").append("<button id='clearButton'>Play again</button>");
        $("#clearButton").click(function() {
            clear();
            newGame();
        });
    };

};

/**
Check if four circles in vertical direction are marked by player
*/
function checkVertical($rows, rowIndex, columnIndex, color) {
    var verticalInRow = 1;

    for (i = (rowIndex + 1); i < ($rows.length); i++) {
        var columns = $($rows[i]).children();
        if ($(columns[columnIndex]).css("background-color") == color) {
            verticalInRow ++;
        } else {
            break;
        };
    };
    return verticalInRow;
};
/**
Check if four circles in horistontal direction are marked by player
*/
function checkHorisontal($rows, rowIndex, columnIndex, color) {
    var horistontalInRow = 1;
    var rowColumns = $($rows[rowIndex]).children();

    for (i = columnIndex; i >= 0; i--) {
        if ($(rowColumns[i]).prev().css("background-color") == color) {
            horistontalInRow ++;
        } else {
            break;
        };
    };

    for (i = columnIndex; i < (rowColumns.length - 1); i++) {
        if ($(rowColumns[i]).next().css("background-color") == color) {
            horistontalInRow ++;
        } else {
            break;
        };
    };

    return horistontalInRow;
};

/**
Check if four circles in diagonal direction are marked by player
*/
function checkDiagonal($rows, rowIndex, columnIndex, color) {
    var diagonalInRow = 1;
    var newColumnIndex = columnIndex;

    for (i = (rowIndex  - 1); i >= 0; i--) {
        var columns = $($rows[i]).children();
        newColumnIndex = newColumnIndex - 1;
        if ($(columns[newColumnIndex]).css("background-color") == color) {
            diagonalInRow ++;
        } else {
            break;
        };
    };

    newColumnIndex = columnIndex;

    for (i = (rowIndex + 1); i < $rows.length; i++) {
        var columns = $($rows[i]).children();
        newColumnIndex = newColumnIndex + 1;
        if ($(columns[newColumnIndex]).css("background-color") == color) {
            diagonalInRow ++;
        } else {
            break;
        };
    };

    var diagonalInRow2 = 1;
    newColumnIndex = columnIndex;

    for (i = (rowIndex - 1); i >= 0; i--) {
        var columns = $($rows[i]).children();
        newColumnIndex = newColumnIndex + 1;
        if ($(columns[newColumnIndex]).css("background-color") == color) {
            diagonalInRow2 ++;
        } else {
            break;
        };
    };

    newColumnIndex = columnIndex;

    for (i = (rowIndex + 1); i < $rows.length; i++) {
        var columns = $($rows[i]).children();
        newColumnIndex = newColumnIndex - 1;
        if ($(columns[newColumnIndex]).css("background-color") == color) {
            diagonalInRow2 ++;
        } else {
            break;
        };
    };

    return [diagonalInRow, diagonalInRow2];
};

/**
    Clear board
*/
function clear() {
    $circles = $("#board").children().children();

    $circles.each(function() {
        $(this).css('background-color', '#FFF');
    });

    $("#clearButton").remove();
};

/**
Starts new game.
*/
function newGame() {
    $("#game p.turn").html("<span id='name'></span>, it's your turn.");
    log("A new game has been started.");
    turns = 0;
    move();
}

/**
Logs users' actions to log file.
*/
function log(text) {
    $.ajax({
        url: "/log",
        type: 'POST',
        data: {'text': text},
        dataType: 'text',
        success: function (response) {
        console.log(response);
        }
    });
};
