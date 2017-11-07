/** Region Selector */

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

var file_system = null;
var page_category = document.getElementById('category_page');
var page_roullete = document.getElementById('roulette_page');

var category_toggler = document.getElementById('category_new_toggler');
var category_input = document.getElementById('category_new_input');
var category_cancel = document.getElementById('category_new_cancel');
var categories = document.getElementById('category_list');
var category_addtext = document.getElementById('category_new_text');
var category_addbtn = document.getElementById('category_new_button');
var categories_clear = document.getElementById('category_clear_button');

var selected_category = '';

function select_category(new_category)
{
    selected_category = new_category;
    page_category.style.display = 'none';
    page_roullete.style.display = 'block';
    $('#name').focus();

    file_system.root.getFile('choices.txt', {create: true}, function(entry) {
        entry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                if(this.result != ''){
                    var stored_choices = this.result.split('\n');
                    var stored_choice = '';
                    for(var jj = 0; jj < stored_choices.length - 1; jj++)
                    {
                        if(choices.length == 0)
                        {
                            document.getElementById('action_panel').className = 'displayed';
                        }
                        choices.push(stored_choices[jj]);
                        arc = Math.PI / ( choices.length / 2 );
                        draw();
                    }
                }
            };
            reader.readAsText(file);
        }, error_handler);
    }, error_handler);

    file_system.root.getFile('boards.txt', {create: true}, function(entry) {
        entry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                if(this.result != ''){
                    var stored_boards = this.result.split('\n');
                    for(var jj = 0; jj < stored_boards.length - 1; jj++)
                    {
                        if(boards.length == 0)
                        {
                            document.getElementById('board_panel').className = 'displayed';
                            document.getElementById('action_board').className = 'displayed';
                        }
                        boards.push(stored_boards[jj]);
                        var new_board = '<div class="board_entry">';
                        new_board += '<div class="board_number">' + (jj + 1) + ". " + stored_boards[jj] + '</div>';
                        new_board += '<div class="clear"></div></div>';
                        document.getElementById('boards').innerHTML += new_board;
                    }

                    if(choices.length > 0 && choices.length == boards.length) {
                        document.getElementById('full_board').className = 'displayed';
                    }
                }
            };
            reader.readAsText(file);
        }, error_handler);
    }, error_handler);
}

function remove_category(category_name)
{
    if(!file_system){
        console.log('file system warning');
    }

    var category_data = [];
    $('.category_text_button').each(function(){
        var item_name = $(this).text().trim();
        if(item_name != category_name) {
            category_data.push(item_name);
        }
    });

    file_system.root.getFile('category.txt', {create: false}, function(entry) {
        entry.remove(function() {
            file_system.root.getFile('category.txt', {create: true}, function(created_entry) {
                created_entry.createWriter(function(writer) {
                    writer.seek(writer.length);
                    var new_categories = '';
                    var new_content = '';
                    for(var kk = 0; kk < category_data.length; kk++) {
                        new_categories += category_data[kk] + '\n';
                        new_content += '<li class="category_text">';
                        new_content += '<button id="category_button' + kk + '" class="category_text_button" onclick="select_category(\'' + category_data[kk] + '\')">' + category_data[kk] + '</button>'
                        new_content += '<button class="delete" onclick="remove_category(\'' + category_data[kk] + '\')"></button>';
                        new_content += '</li>';
                    }
                    categories.innerHTML = new_content;
                    var blob = new Blob([new_categories], {type: 'text/plain'});
                    writer.write(blob);
                }, error_handler);
            }, error_handler);
        }, error_handler);
    }, error_handler);
}

/** Region Data */
function error_handler(e){
    var error_message = String(e);
    console.log(error_message);
    if(error_message.indexOf('A requested file or directory could not be found') > -1) {
        window.location = window.location.href;
    } else {
        alert('Something Unexpected Happened, Please Refresh The Page');
    }
}

function init_filesystem() {
    window.requestFileSystem(window.TEMPORARY, 1024*1024, function(filesystem) {
        file_system = filesystem;
        file_system.root.getFile('category.txt', {create: true}, null, error_handler);
        file_system.root.getFile('choices.txt', {create: true}, null, error_handler);
        file_system.root.getFile('boards.txt', {create: true}, null, error_handler);
        file_system.root.getFile('category.txt', {}, function(entry) {
            entry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    if(this.result != ''){
                        var categories = document.getElementById('category_list');
                        var categories_text = this.result.split('\n');
                        new_categories = '';
                        for(var ii = 0; ii < categories_text.length - 1; ii++){
                            new_categories += '<li class="category_text">';
                            new_categories += '<button id="category_button' + ii + '" class="category_text_button" onclick="select_category(\'' + categories_text[ii] + '\')">' + categories_text[ii] + '</button>'
                            new_categories += '<button class="delete" onclick="remove_category(\'' + categories_text[ii] + '\')"></button>';
                            new_categories += '</li>';
                        }
                        categories.innerHTML = new_categories;
                    }
                };
                reader.readAsText(file);
            }, error_handler);
        }, error_handler);
    }, error_handler);
}

category_toggler.addEventListener('click', function(e){
    category_input.style.display = 'block';
    category_toggler.style.display = 'none';
    category_addtext.focus();
}, false);

category_cancel.addEventListener('click', function(e){
    category_addtext.value = '';
    category_input.style.display = 'none';
    category_toggler.style.display = 'block';
}, false);

category_addbtn.addEventListener('click', function(e){
    if(!file_system){
        return;
    }
    if(category_addtext.value != '')
    {
        file_system.root.getFile('category.txt', {create: false}, function(entry) {
            entry.createWriter(function(writer) {
                writer.seek(writer.length);
                var blob = new Blob([category_addtext.value + '\n'], {type: 'text/plain'});
                writer.write(blob);
                category_addtext.value = '';
                file_system.root.getFile('category.txt', {}, function(new_entry) {
                    new_entry.file(function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(e) {
                            if(this.result != ''){
                                var categories_text = this.result.split('\n');
                                new_categories = '';
                                category_input.style.display = 'none';
                                category_toggler.style.display = 'block';
                                for(var ii = 0; ii < categories_text.length - 1; ii++){
                                    new_categories += '<li class="category_text">';
                                    new_categories += '<button id="category_button' + ii + '" class="category_text_button" onclick="select_category(\'' + categories_text[ii] + '\')">' + categories_text[ii] + '</button>'
                                    new_categories += '<button class="delete" onclick="remove_category(\'' + categories_text[ii] + '\')"></button>';
                                    new_categories += '</li>';
                                }
                                categories.innerHTML = new_categories;
                            }
                        };
                        reader.readAsText(file);
                    }, error_handler);
                }, error_handler);
            }, error_handler);

        }, error_handler);
    }
}, false);

categories_clear.addEventListener('click', function(e){
    if(!file_system){
        return;
    }
    file_system.root.getFile('category.txt', {create: false}, function(entry) {
        entry.remove(function() {
            categories.innerHTML = '';
            file_system.root.getFile('category.txt', {create: true}, null, error_handler);
        }, error_handler);
    }, error_handler);
    file_system.root.getFile('choices.txt', {create: false}, function(entry) {
        entry.remove(function() {
            file_system.root.getFile('choices.txt', {create: true}, null, error_handler);
        }, error_handler);
    }, error_handler);
}, false);

if (window.requestFileSystem) {
    init_filesystem();
}

/** Region Roulette */
var choices = [];
var boards = [];

var canvas = document.getElementById("wheelcanvas");

var start_angle = 0;
var arc = Math.PI / 6;
var spin_timeout = null;

var spin_start = 10;
var spin_time = 0;
var spin_total = 0;

var ctx;

function draw() {
    draw_roullete();
}

function draw_roullete() {
    if (canvas.getContext) {

        if((choices.length > 0) && ($('#wheelcanvas').css('display') == 'none'))
        {
            $('#wheelcanvas').css('display', 'block');
        }

        var max_radius = 215;
        var out_radius = 200;
        var text_radius = 165;
        var in_radius = 105;
        var mid_radius = 80;
        var center_radius = 40;

        ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        ctx.font = 'bold 12px sans-serif';
        document.getElementById('choices').innerHTML = '';

        /* Draw Outer */
        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 0, 0.7853981633974483, false);
        ctx.arc(250, 250, mid_radius, 0.7853981633974483, 0, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 0.7853981633974483, 1.5707963267948966, false);
        ctx.arc(250, 250, mid_radius, 1.5707963267948966, 0.7853981633974483, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 1.5707963267948966, 2.356194490192345, false);
        ctx.arc(250, 250, mid_radius, 2.356194490192345, 1.5707963267948966, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 2.356194490192345, 3.141592653589793, false);
        ctx.arc(250, 250, mid_radius, 3.141592653589793, 2.356194490192345, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 3.141592653589793, 3.9269908169872414, false);
        ctx.arc(250, 250, mid_radius, 3.9269908169872414, 3.141592653589793, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 3.9269908169872414, 4.71238898038469, false);
        ctx.arc(250, 250, mid_radius, 4.71238898038469, 3.9269908169872414, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 4.71238898038469, 5.497787143782138, false);
        ctx.arc(250, 250, mid_radius, 5.497787143782138, 4.71238898038469, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(250, 250, in_radius, 5.497787143782138, 6.283185307179586, false);
        ctx.arc(250, 250, mid_radius, 6.283185307179586, 5.497787143782138, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        /* Draw Inside */
        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 0, 0.7853981633974483, false);
        ctx.arc(250, 250, center_radius, 0.7853981633974483, 0, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 0.7853981633974483, 1.5707963267948966, false);
        ctx.arc(250, 250, center_radius, 1.5707963267948966, 0.7853981633974483, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 1.5707963267948966, 2.356194490192345, false);
        ctx.arc(250, 250, center_radius, 2.356194490192345, 1.5707963267948966, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 2.356194490192345, 3.141592653589793, false);
        ctx.arc(250, 250, center_radius, 3.141592653589793, 2.356194490192345, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 3.141592653589793, 3.9269908169872414, false);
        ctx.arc(250, 250, center_radius, 3.9269908169872414, 3.141592653589793, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 3.9269908169872414, 4.71238898038469, false);
        ctx.arc(250, 250, center_radius, 4.71238898038469, 3.9269908169872414, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 4.71238898038469, 5.497787143782138, false);
        ctx.arc(250, 250, center_radius, 5.497787143782138, 4.71238898038469, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#b2dfdb";
        ctx.beginPath();
        ctx.arc(250, 250, mid_radius, 5.497787143782138, 6.283185307179586, false);
        ctx.arc(250, 250, center_radius, 6.283185307179586, 5.497787143782138, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        /* Draw Centre */
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 0, 0.7853981633974483, false);
        ctx.arc(250, 250, 0, 0.7853981633974483, 0, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 0.7853981633974483, 1.5707963267948966, false);
        ctx.arc(250, 250, 0, 1.5707963267948966, 0.7853981633974483, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 1.5707963267948966, 2.356194490192345, false);
        ctx.arc(250, 250, 0, 2.356194490192345, 1.5707963267948966, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 2.356194490192345, 3.141592653589793, false);
        ctx.arc(250, 250, 0, 3.141592653589793, 2.356194490192345, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 3.141592653589793, 3.9269908169872414, false);
        ctx.arc(250, 250, 0, 3.9269908169872414, 3.141592653589793, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 3.9269908169872414, 4.71238898038469, false);
        ctx.arc(250, 250, 0, 4.71238898038469, 3.9269908169872414, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 4.71238898038469, 5.497787143782138, false);
        ctx.arc(250, 250, 0, 5.497787143782138, 4.71238898038469, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(250, 250, center_radius, 5.497787143782138, 6.283185307179586, false);
        ctx.arc(250, 250, 0, 6.283185307179586, 5.497787143782138, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        for(var i = 0; i < choices.length; i++) {

            var new_class = 'roullete_choice odd_choice';
            var new_color = "#e91e63";
            if(i == 0)
            {
                new_color = "#9c27b0";
                new_class = 'roullete_choice empty_choice';
            }
            else if((i % 2) == 0)
            {
                new_color = "#8bc34a";
                new_class = 'roullete_choice even_choice';
            }

            var new_content = '<div id="choice_' + i + '">';
            new_content += '<div class="' + new_class + '">' + (i + 1) + ". " + choices[i] + '</div>';
            new_content += '<input type="button" value="Delete Choice" onclick="remove_option(\'' + i + '\');" class="btn_option btn_remove" />';
            new_content += '<div class="clear"></div></div>';
            document.getElementById('choices').innerHTML += new_content;

            var angle = start_angle + i * arc;

            ctx.fillStyle = new_color;
            ctx.beginPath();
            ctx.arc(250, 250, out_radius, angle, angle + arc, false);
            ctx.arc(250, 250, in_radius, angle + arc, angle, true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            ctx.save();
            ctx.shadowOffsetX = -1;
            ctx.shadowOffsetY = -1;
            ctx.shadowBlur    = 0;
            ctx.shadowColor   = "rgb(35,35,35)";
            ctx.fillStyle = "#ffffff";
            ctx.translate(250 + Math.cos(angle + arc / 2) * text_radius, 250 + Math.sin(angle + arc / 2) * text_radius);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            ctx.fillText((i + 1), -ctx.measureText(i).width / 1, 0);
            ctx.restore();
            ctx.restore();
        }

        if(choices.length > 0)
        {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(250 - 4, 270 - (out_radius + 25));
            ctx.lineTo(250 + 4, 270 - (out_radius + 25));
            ctx.lineTo(250 + 4, 270 - (out_radius - 5));
            ctx.lineTo(250 + 9, 270 - (out_radius - 5));
            ctx.lineTo(250 + 0, 270 - (out_radius - 13));
            ctx.lineTo(250 - 9, 270 - (out_radius - 5));
            ctx.lineTo(250 - 4, 270 - (out_radius - 5));
            ctx.lineTo(250 - 4, 270 - (out_radius + 25));
            ctx.closePath();
            ctx.stroke();
            ctx.fill();


            ctx.fillStyle = "#82e9de";
            ctx.beginPath();
            ctx.arc(250, 250, max_radius, 0,Math.PI*2, false);
            ctx.arc(250, 250, out_radius, 0,Math.PI*2, true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
}

function spin_roullete(distance) {
    spin_start = distance * 10 + 10;
    spin_time = 0;
    spin_total = 1.3*(distance * 1000 + 3 * 1000);
    start_rotate();
}

function start_rotate() {
    spin_time += 30;
    if(spin_time >= spin_total) {
        stop_rotate();
        return;
    }
    var spinAngle = spin_start - easing(spin_time, 0, spin_start, spin_total);
    start_angle += (spinAngle * Math.PI / 180);
    draw_roullete();
    spin_timeout = setTimeout('start_rotate()', 30);
}

function stop_rotate() {
    clearTimeout(spin_timeout);
    var degrees = start_angle * 180 / Math.PI + 90;
    var arcd = arc * 180 / Math.PI;
    var index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    ctx.font = 'bold 30px sans-serif';
    ctx.restore();

    var new_choice = choices[index];
    if(boards.indexOf(new_choice) > -1) {
        alert('Result choice has already been chosen, please spin again')
    } else {
        var $selected_choice = $('#choice_' + index).find('div.roullete_choice');
        $selected_choice.addClass('selected_choice');
        $('div.roullete_choice').each(function(){
            if($(this).hasClass('selected_choice'))
            {
                if(boards.length == 0)
                {
                    document.getElementById('board_panel').className = 'displayed';
                    document.getElementById('action_board').className = 'displayed';
                }
                boards.push(new_choice);
                var new_board = '<div class="board_entry">';
                new_board += '<div class="board_number">' + (boards.length) + ". " + new_choice + '</div>';
                new_board += '<div class="clear"></div></div>';
                document.getElementById('boards').innerHTML += new_board;

                file_system.root.getFile('boards.txt', {create: true}, function(entry) {
                    entry.createWriter(function(writer) {
                        writer.seek(writer.length);
                        var blob = new Blob([new_choice + '\n'], {type: 'text/plain'});
                        writer.write(blob);
                    }, error_handler);

                }, error_handler);
            }
            else
            {
                $(this).css('opacity', '0.3');
                $(this).next().css('opacity', '0.3');
            }
        });
    }
}

function easing(t, b, c, d) {
    var ts = (t/=d)*t;
    var tc = ts*t;
    return b+c*(tc + -3*ts + 3*t);
}

function add_option()
{
    var new_option = document.getElementById("name");
    if(new_option.value != '')
    {
        if(choices.length == 0)
        {
            document.getElementById('action_panel').className = 'displayed';
        }
        choices.push(new_option.value);
        file_system.root.getFile('choices.txt', {create: true}, function(entry) {
            entry.createWriter(function(writer) {
                writer.seek(writer.length);
                var blob = new Blob([new_option.value + '\n'], {type: 'text/plain'});
                writer.write(blob);
                new_option.value = '';
            }, error_handler);

        }, error_handler);
        arc = Math.PI / ( choices.length / 2 );
        draw();
    }
}

function remove_option(index)
{
    if(choices.length > 0)
    {
        var board_index = boards.indexOf(choices[index]);
        if(board_index > -1) {
            boards.splice(board_index, 1);
        }
        choices.splice(index, 1);

        file_system.root.getFile('choices.txt', {create: false}, function(entry) {
            entry.remove(function() {
                file_system.root.getFile('choices.txt', {create: true}, function(created_entry) {
                    created_entry.createWriter(function(writer) {
                        writer.seek(writer.length);
                        var new_choices = '';
                        for(var kk = 0; kk < choices.length; kk++) {
                            new_choices += choices[kk] + '\n';
                        }
                        var blob = new Blob([new_choices], {type: 'text/plain'});
                        writer.write(blob);
                    }, error_handler);
                }, error_handler);
            }, error_handler);
        }, error_handler);

        file_system.root.getFile('boards.txt', {create: false}, function(entry) {
            entry.remove(function() {
                file_system.root.getFile('boards.txt', {create: true}, function(created_entry) {
                    created_entry.createWriter(function(writer) {
                        writer.seek(writer.length);
                        var new_boards = '';
                        document.getElementById('boards').innerHTML = '';
                        for(var kk = 0; kk < boards.length; kk++) {
                            new_boards += boards[kk] + '\n';
                            var new_board = '<div class="board_entry">';
                            new_board += '<div class="board_number">' + (kk + 1) + ". " + boards[kk] + '</div>';
                            new_board += '<div class="clear"></div></div>';
                            document.getElementById('boards').innerHTML += new_board;
                        }
                        var blob = new Blob([new_boards], {type: 'text/plain'});
                        writer.write(blob);
                    }, error_handler);
                }, error_handler);
            }, error_handler);
        }, error_handler);

        if(choices.length > 0)
        {
            arc = Math.PI / ( choices.length / 2 );
            draw();
        }
        else
        {
            reset();
        }
    }
}

function reset(){
    $('#wheelcanvas').css('display', 'none');
    stop_rotate();
    choices = [];
    ctx = canvas.getContext("2d");
    document.getElementById('choices').innerHTML = '';
    document.getElementById('action_panel').className = 'hidden';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function reset_board(){
    boards = [];
    document.getElementById('board_panel').className = 'hidden';
    document.getElementById('boards').innerHTML = '';

    file_system.root.getFile('boards.txt', {create: false}, function(entry) {
        entry.remove(function() {
            file_system.root.getFile('boards.txt', {create: true}, null, error_handler);
        }, error_handler);
    }, error_handler);
}

(function ($) {
    var $start_point = 0;
    var $end_point = 0;
    var $canvas_el = $(canvas);
    var maxed_out = false;
    $canvas_el.on('hold tap swipe doubletap transformstart transform transformend dragstart drag dragend swipe release', function (event) {
        event.preventDefault();

        if(choices.length > 0 && choices.length == boards.length) {
            document.getElementById('full_board').className = 'displayed';
        } else {
            document.getElementById('full_board').className = 'hidden';
            if(event.type == 'dragstart') {
                $start_point = event.distance;
            }
            else if(event.type == 'dragend') {
                $end_point = event.distance;
                var $distance = ($end_point - $start_point) / 40;
                spin_roullete($distance);
            }
        }

    });

    // this is how you unbind an event
    /*$sw.on('swipe', function (event) {
    event.preventDefault();

    $sw.off('tap');
});*/
}(jQuery));


$(document).ready(function (){
    $('#wheelcanvas').css('display', 'none');
    $('#name').keypress(function(event){
        if(event.which == 13)
        {
            add_option();
        }
    });
    $('#header').on('click', function(){
        document.location = document.location.href;
    });
});
