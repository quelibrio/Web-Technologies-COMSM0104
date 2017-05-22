var numbers = new Array(16);
var dirty = new Array(16);
var empty_x;
var empty_y;
var scramble_seed = 173;  // [0 .. 299]
var move_count = -1;
var move = 0;

function init() {
    checkUser();
    createGame();
  
}
function createGame() {
    var token = localStorage.getItem("token");
    var result;
    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:9999/game",
        headers: {
            Authorization: 'Bearer ' + token
        },
        contentType: 'application/x-www-form-urlencoded',
        //Add form data
        data: {
            "field": "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,x"
        },
        success: function (response) {
            gameId = response.result.id;
        },
        error: function (xhr, status, error) {
            $('#errorMessage').innerHTML = error;
            return -1;
        },
        done: function (response) {
        }
    });
}

function postSetup() {
    var username = localStorage.getItem("username");
    $('#username').text('Hello ' + username);

    $("#logout").click(function () {
        localStorage.setItem("token", "");
        localStorage.setItem("username", "");
        $(location).attr('href', 'login.html');
    });
    scramble_numbers();
}

function checkUser() {
    var token = localStorage.getItem("token");
    var user = localStorage.getItem("username");
    if (!user || !token)
        $(location).attr('href', 'login.html');
}

function get_image_name(n) {
    return "f" + (n <= 9 ? ("0" + n) : n);
}

function get_image_src(n) {
    if (n == 0) return "img/" + imageFolder + "_.gif";
    else return "img/" + imageFolder + n + ".jpg";
}

function get_number_at_position(y, x) {
    i = (y - 1) * 4 + x - 1;
    return numbers[i];
}

function set_number_at_position(y, x, n) {
    i = (y - 1) * 4 + x - 1;
    numbers[i] = n;
    dirty[i] = 1;
}

function get_sign(d) {
    if (d < 0) return -1;
    if (d > 0) return 1;
    return 0;
}

function process_move(y, x) {
    step_x = get_sign(empty_x - x);
    step_y = get_sign(empty_y - y);
    if (step_x != 0 && step_y != 0)
        return;
    while (empty_x != x || empty_y != y) {
        set_number_at_position(empty_y, empty_x, get_number_at_position(
            empty_y - step_y, empty_x - step_x));
        empty_x -= step_x;
        empty_y -= step_y;
        if (move_count >= 0) move_count++;
    }
    set_number_at_position(empty_y, empty_x, 0);
}

function update_board() {
    for (i = 0; i < 16; i++) {
        if (dirty[i]) {
            //alert("in=" + get_image_name(i) + ", i=" + i + ", is=" + get_image_src(numbers[i]));
            var imageName = get_image_name(i);
            var imageSrc = get_image_src(numbers[i]);
            if (document.images[imageName]) {
                document.images[imageName].src = imageSrc;
                document.images[imageName].title = numbers[i];
            }
            dirty[i] = 0;
        }
    }
}

function check_victory() {
    if (move_count < 0)
        return;
    for (i = 0; i < 16; i++) {
        if (i == 13 && numbers[i] == 15 && numbers[i + 1] == 14) {
            alert("Nice, you almost solved it in " + move_count
                + " moves.\nYour prize is almost on the way.\n"
                + "Try a little harder. :)");
            move_count = -1;
            return;
        }
        if (numbers[i] != i + 1 && i != 15)
            return;
    }
    $('img').addClass('tile');
    $('#winMessage').text('Congratulation, you did it in ' + move_count + ' moves!"')
    saveToDb(move_count, move_count);
    move_count = -1;
}

function process_click(y, x) {
    if (x != empty_x && y != empty_y) {
        //alert("This piece can not move");
        window.status = "This piece can not move";
        return;
    }

    //var name = tcol1;
    //$('img[name=' + name + ']')
    

    process_move(y, x);
    update_board();

    check_victory();
}

function saveToDb(y, x) {
    var token = localStorage.getItem("token");
    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:9999/game/" + gameId + "/move/" + move,
        headers: {
            Authorization: 'Bearer ' + token
        },
        contentType: 'application/x-www-form-urlencoded',
        //Add form data
        data: {
            "posX" : y,
            "posY" : x
        },
        success: function (response) {
        },
        error: function (xhr, status, error) {
            $('#errorMessage').innerHTML = error;
        },
        done: function (response) {
        }
    });
    move = move + 1;
}


function reset_numbers() {
    for (y = 1; y <= 4; y++) {
        for (x = 1; x <= 4; x++) {
            n = (y - 1) * 4 + x;
            if (n == 16) n = 0;
            set_number_at_position(y, x, n);
        }
    }
    empty_x = 4;
    empty_y = 4;
    update_board();
    move_count = -1;
}

function pseudo_reset_numbers() {
    for (y = 1; y <= 4; y++) {
        for (x = 1; x <= 4; x++) {
            n = (y - 1) * 4 + x - 1;
            set_number_at_position(y, x, n);
        }
    }
    empty_x = 1;
    empty_y = 1;
    update_board();
    move_count = 0;
}

function scramble_numbers() {
    rand_x = 4;
    rand_y = 4;
    scramble_seed = (scramble_seed + 95) % 300;
    for (r = 0; r < 250 + scramble_seed; r++) {
        if (r % 2) {
            rand_x = empty_x;
            rand_y = (rand_y + (r * (r + 1) % 3)) % 4 + 1;
        } else {
            rand_x = (rand_x + (r * (r + 1) % 3)) % 4 + 1;
            rand_y = empty_y;
        }
        process_move(rand_y, rand_x);
    }
    update_board();
    move_count = 0;
}

reset_numbers();
