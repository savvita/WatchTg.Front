const api = 'https://localhost:7142/api';

const tokenKey = 'accessToken';
const categoryKey = 'category';

let categoryid;

$( document ).ready(function() {
    initializeButtons();
  });

function initializeButtons() {
    $('#signInBtn').click(function(event) {
        event.stopPropagation();
        signIn();
        return false;
    });

    $('#cancelSignInBtn').click(function(event) {
        event.stopPropagation();
        $('#signin_login').val('');
        $('#signin_password').val('');

        return false;
    });

    $('#signUpBtn').click(function(event) {
        event.stopPropagation();
        signUp();

        return false;
    });

    $('#cancelSignUpBtn').click(function(event) {
        event.stopPropagation();
        $('#signup_login').val('');
        $('#signup_password').val('');
        $('#signup_confirmpassword').val('');
        return false;
    });

    $('#logout').click(function() {
        logOut();
        return true;
    });

    $('#okBtn').click(function(event) {
        event.stopPropagation();
        event.preventDefault();
        editCategory();
        $('#editForm').hide();
        return false;
    });

    $('#cancelBtn').click(function(event) {
        event.stopPropagation();
        $('#editForm').hide();
        return false;
    });
}



function setToken(token){
    sessionStorage.setItem(tokenKey, token.token);
}

function getToken(){
    return sessionStorage.getItem(tokenKey);
}

function signIn() {
    if($('#signin_login').val() == '') {
        $('#signInErrorTxt').text('Enter your login');
        return false;
    }

    if($('#signin_password').val() == '') {
        $('#signInErrorTxt').text('Enter your password');
        return false;
    }

    $.ajax({
        type: "POST",
        url: `${api}/users/signin`,
        data: JSON.stringify(
            {
                "login": $('#signin_login').val(),
                "password": $('#signin_password').val()
            }
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        success: function(data) {
            if(data.token != null) {
                setToken(data.token);
                $('#signInErrorTxt').text('');
                $(location).attr('href', 'watches.html');
            }
            else {
                $('#signInErrorTxt').text('Invalid login and/or password');
            }
        },
        error: function(data) {
            $('#signInErrorTxt').text('Something went wrong. Try again later');
        }
    });
}


function signUp() {
    if($('#signup_login').val() == '') {
        $('#signUpErrorTxt').text('Enter login');
        return false;
    }

    if($('#signup_password').val() == '') {
        $('#signUpErrorTxt').text('Enter password');
        return false;
    }
    else if($('#signup_password').val() != $('#signup_confirmpassword').val()) {
        $('#signUpErrorTxt').text('Passwords do not match');
        return false;
    }

    var user = {
        'login': $('#signup_login').val(),
        'password': $('#signup_password').val()
    };

    $.ajax({
        type: "POST",
        url: `${api}/users/`,
        data: JSON.stringify(user),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        success: function(data) {
            if(data.token != null) {
                setToken(data.token);
                $('#signUpErrorTxt').text('');
                $(location).attr('href', 'watches.html');
            }
            else {
                $('#signUpErrorTxt').text('Login is already used');
                return false;
            }
        },
        error: function(data) {
            $('#signUpErrorTxt').text('Something went wrong. Try again later');
            return false;
        }
    });
}


function logOut() {
    sessionStorage.removeItem(tokenKey);
    $(location).attr('href', 'index.html');
}



function loadWatches() {
    $('#error').text('');
    $('#links').hide();
    $('#logout').hide();
    let container = $('#container');
    container.empty();

    let url = `${api}/watches`;

    $.ajax({
        type: 'GET',
        url: url,
        headers: {
          'Authorization': "Bearer " + getToken()
        },

        success: response => {
            $('#logout').show();
            $('#links').hide();
            if(response.token != null) {
                setToken(response.token);
            }
            if(response.value != null && response.value.length > 0) {
                for(item of response.value) {
                    container.append(addCard(item));
                }
            }
            
            else  {
                container.append(`<p class="text-white m-3">Not found. Sorry :(</p>`);
            }
        },
        error: data => {
            if(data.status == 401) {
                container.empty();
                $('#error').text('You need to authorize first');
                $('#logout').hide();
                $('#links').show();
            }
        }
    });
}

function loadWatchesTable() {
    categoryid = sessionStorage.getItem(categoryKey);
    sessionStorage.removeItem(categoryKey);
    if(categoryid == null) {
        return;
    }
    $('#error').text('');
    $('#links').hide();
    $('#logout').hide();
    let container = $('#watch_list');
    container.empty();

    let url = `${api}/watches/category/${categoryid}`;

    $.ajax({
        type: 'GET',
        url: url,
        headers: {
          'Authorization': "Bearer " + getToken()
        },

        success: response => {
            $('#logout').show();
            $('#links').hide();
            if(response.token != null) {
                setToken(response.token);
            }
            if(response.value != null && response.value.length > 0) {
                for(item of response.value) {
                    container.append(`<tr>
                                    <th scope="row">${item.id}</th>
                                    <td>${item.title}</td>
                                    <td>${item.price}</td>
                                    <td>@mdo</td>
                                </tr>`);
                }
            }
            
            else  {
                container.append(`<p class="text-white m-3">Not found. Sorry :(</p>`);
            }
        },
        error: data => {
            if(data.status == 401) {
                container.empty();
                $('#error').text('You need to authorize first');
                $('#logout').hide();
                $('#links').show();
            }
        }
    });
}

function loadCategories() {
    $('#editForm').hide();
    $('#error').text('');
    $('#links').hide();
    $('#logout').hide();
    let container = $('#categories');
    container.empty();

    let url = `${api}/categories`;

    $.ajax({
        type: 'GET',
        url: url,
        headers: {
          'Authorization': "Bearer " + getToken()
        },

        success: response => {
            $('#logout').show();
            $('#links').hide();
            if(response.token != null) {
                setToken(response.token);
            }
            if(response.value != null && response.value.length > 0) {
                addCategoriesTable(container, response.value);
            }
            
            else  {
                container.append(`<p class="text-white m-3">Not found. Sorry :(</p>`);
            }
        },
        error: data => {
            if(data.status == 401) {
                container.empty();
                $('#error').text('You need to authorize first');
                $('#logout').hide();
                $('#links').show();
            }
        }
    });
}

function addCard(item) {
    let img;
    if(item.image != null) {
        img = `<img src="data:image/png;base64,${item.image}" class="card-img-top" alt="${item.title}">`;
    }
    else {
        img = `<img src="images/No_image_available.png" class="card-img-top" alt="${item.title}">`;
    }
    return `<div class="card text-white bg-dark m-3 border-light" style="width: 18rem;">
                <p class="d-none">${item.Id}</p>
                ${img}
                <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">Category: ${item.category.categoryName}</p>
                <p class="card-text">Producer: ${item.producer.producerName}</p>
                </div>
                <ul class="list-group list-group-flush">
                <li class="list-group-item">Price: ${item.price}</li>
                </ul>
            </div>`;
}

function addCategoriesTable(container, categories) {

  const cont = $('#categories');

  for(item of categories) {
    container.append(`<tr data-id="${item.key.id}" data-name="${item.key.categoryName}" onclick="setCategory(event)">
                    <th scope="row">${item.key.id}</th>
                    <td>${item.key.categoryName}</td>
                    <td>${item.value}</td>
                    <td><img class="icon" src="/images/edit_icon.svg" title="Edit" onclick="showEditForm(event)"></td>
                    <td><img class="icon" src="/images/delete_icon.svg" title="Delete" onclick="deleteCategory(event)"></td>
                    <td><img class="icon" src="/images/hide_icon.svg" title="Hide" onclick="hideCategory(event)"></td>
                </tr>`);
  }
}

function showEditForm(event) {
    $('#categoryname').val(event.target.closest('tr').getAttribute('data-name'));
    categoryid = event.target.closest('tr').getAttribute('data-id');
    $('#editForm').show();
    event.stopPropagation();
}

function setCategory(event) {
    categoryid = event.target.closest('tr').getAttribute('data-id');
    sessionStorage.setItem(categoryKey, categoryid);
    $(location).attr('href', 'category.html');
}

function deleteCategory(event) {
    categoryid = event.target.closest('tr').getAttribute('data-id');
    event.stopPropagation();

    $.ajax({
        type: 'DELETE',
        url: `${api}/categories/${categoryid}`,
        headers: {
          'Authorization': "Bearer " + getToken()
        },

        success: response => {
            if(response.value != null) {
                if(response.value == true) {
                    location.reload();
                }
                else {
                    $('#error').text('Ooops');
                }
            }
            
            else  {
                container.append(`<p class="text-white m-3">Not found. Sorry :(</p>`);
            }
        },
        error: data => {
            if(data.status == 401) {
                container.empty();
                $('#error').text('You need to authorize first');
                $('#logout').hide();
                $('#links').show();
            }
        }
    });
}

function hideCategory(event) {
    event.stopPropagation();

    $(event.target.closest('tr')).hide();
}

function showAllCategories(event) {
    event.stopPropagation();

    let rows = $('#categories tr');
    for(item of rows) {
        $(item).show();
    }
}

function editCategory() {
    let category = {
        id: categoryid,
        categoryName: $('#categoryname').val()
    }
    $.ajax({
        type: 'PUT',
        url: `${api}/categories`,
        data: JSON.stringify(category),
        headers: {
          'Authorization': "Bearer " + getToken(),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        success: response => {
            $('#error').text();
            if(response.token != null) {
                setToken(response.token);
            }
            if(response.value != null) { 
                    loadCategories();
            }
            else {
                $('#error').text('Ooops');
            }
            $('#editForm').hide();
        },
        error: data => {
            if(data.status == 401) {
                container.empty();
                $('#error').text('You need to authorize first');
                $('#logout').hide();
                $('#links').show();
            }
            $('#editForm').hide();
        }
    });
}