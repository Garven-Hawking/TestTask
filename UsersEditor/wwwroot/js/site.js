// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let userTypes = null
const delay = 5000
let usersTableBody = null
let editUserForm = null
let filterForm = null
let mainErrorBox = null
let modalErrorBox = null
let editUserModal = null

$(function () {
    fetchUserTypes()

    usersTableBody = $(".table tbody")
    editUserForm = $("#edit-add-user-form")
    filterForm = $("#filter-form")
    mainErrorBox = $("#main-error-box")
    modalErrorBox = $("#modal-error-box")
    editUserModal = $("#edit-user-dialog")

    $("#apply-filters-btn").on("click", function () {
        let formData = new FormData(filterForm[0])
        let filter = Object.fromEntries(formData)

        if (filter.fromDate !== "" && filter.untilDate !== "") {
            let difference = moment(filter.untilDate).diff(moment(filter.fromDate), 'days')
            if (difference < 0) {
                mainErrorBox.text("'Дата с' должна быть меньше или равна 'Дата по'")
                return
            }
        }
        
        fetchUsers(filter)
    })

    $("#remove-filters-btn").on("click", function () {
        filterForm[0].reset()
        mainErrorBox.text("")

        fetchUsers(null)
    })

    $("#edit-btn").on("click", function () {
        displayEditForm($(".table tbody tr.selected"))
    })

    $("#delete-btn").on("click", function () {
        let selectedRow = $(".table tbody tr.selected")
        deleteUser(selectedRow)
    })

    $("#cancel-editing-btn").click(function () {
        editUserModal[0].close()
    })

    $("#save-changes-btn").click(function () {
        editUser(getUserFromForm())
    })

    $("#add-btn").on("click", function () {
        editUserForm[0].reset()
        showModal($("#save-user-btn"), $("#save-changes-btn"), false)
    })

    $("#save-users-btn").click(function () {
        saveUsers()
    })

    $("#save-user-btn").click(function () {
        addUser(getUserFromForm())
    })

    bindEventHandlersForUsersTableRow($('.table tbody tr'));   
})

const fetchUserTypes = function () {
    $.post('/Home/GetUserTypes', { }, function (data, textStatus, xhr) {
        userTypes = data
    }).fail(function (response) {
        console.log(response)
    })
}

const fetchUsers = function (filter) {
    let users = null
    displaySpinner()

    setTimeout(function () {
        if (users == null) {
            displayRequestError()
            return
        }
        displayUsers(users)
    }, delay)

    $.post('/Home/GetFilteredUsers', { filter: filter }, function (data, textStatus, xhr) {
        users = data
    }).fail(function (response) {
        displayRequestError()
    })
}

const displaySpinner = function () {
    usersTableBody.empty()
    usersTableBody.append(
        "<tr><td colspan='6'>" +
        "<div class='spinner'></div>" +
        "</td></tr> "
    )
}

const displayRequestError = function () {
    usersTableBody.empty()
    mainErrorBox.text("Ошибка запроса")
}

const displayUsers = function (users) {

    usersTableBody.empty()

    if (users.length === 0) {
        usersTableBody.append("<tr><td colspan='6' class='text-center'>Пусто</td></tr>")
        return
    }

    for (let i = 0; i < users.length; i++) {
        appendUsersTable(users[i])
    }
}

const appendUsersTable = function (user) {
    let row = $(
        "<tr>" +
            "<td id='id-cell'>" + user.id + "</td>" +
            "<td id='login-cell'>" + user.login + "</td>" +
            "<td id='password-cell'>" + user.password + "</td>" +
            "<td id='name-cell'>" + user.name + "</td>" +
            "<td id='type-cell'>" + getTypeNameById(user.typeId) + "</td>" +
            "<td id='last-visit-cell'>" + moment(user.lastVisitDate, "YYYY-MM-DDTHH:mm:SS").format("DD.MM.yyyy") + "</td>" +
        "</tr>"
    )
    usersTableBody.append(row)

    bindEventHandlersForUsersTableRow(row)
}

const bindEventHandlersForUsersTableRow = function (row) {
    row.dblclick(function () {
        displayEditForm($(this))
    })

    row.click(function () {
        $(".table tbody tr.selected").removeClass("selected")
        $(this).addClass("selected")
        disableControlButtons(false)
    })
}

const displayEditForm = function (row) {
    editUserForm.find("#edit-id-input").val(row.find("#id-cell").text())
    editUserForm.find("#edit-login-input").val(row.find("#login-cell").text())
    editUserForm.find("#edit-password-input").val(row.find("#password-cell").text())
    editUserForm.find("#edit-name-input").val(row.find("#name-cell").text())
    editUserForm.find("#edit-type-select").val(getTypeIdByName(row.find("#type-cell").text()))
    editUserForm.find("#last-visit-input").val(moment(row.find("#last-visit-cell").text(), "DD.MM.yyyy").format("yyyy-MM-DD"))

    showModal($("#save-changes-btn"), $("#save-user-btn"), true)
}

const showModal = function (btnToShow, btnToHide, isIdReadonly) {
    btnToShow.removeClass("d-none")
    btnToHide.addClass("d-none")
    $("#edit-id-input").prop('readonly', isIdReadonly)
    modalErrorBox.text("")
    editUserModal[0].showModal()
}

const deleteUser = function (selectedRow) {
    let id = selectedRow.find("#id-cell").text()
    $.post('/Home/DeleteUser', { id: id }, function (data, textStatus, response) {
        selectedRow.remove()
        disableControlButtons(true)
        disableSaveUsersButton(false)
        mainErrorBox.text(response.responseText)
    }).fail(function (response) {
        mainErrorBox.text(response.responseText)
    })
}

const disableControlButtons = function (disabled) {
    $("#edit-btn").prop('disabled', disabled)
    $("#delete-btn").prop('disabled', disabled)
}

const disableSaveUsersButton = function (disabled) {
    $("#save-users-btn").prop("disabled", disabled)
}

const getUserFromForm = function () {
    let formData = new FormData(editUserForm[0])
    let user = Object.fromEntries(formData)

    return user
}

const editUser = function (user) {
    $.post('/Home/SaveChanges', { user: user }, function (data, textStatus, response) {
        let selectedRow = $(".table tbody tr.selected")
        
        updateRow(selectedRow, user)
        disableSaveUsersButton(false)
        modalErrorBox.text(response.responseText)
    }).fail(function (response) {
        modalErrorBox.text(response.responseText)
    })
}

const updateRow = function (row, user) {
    row.find("#login-cell").text(user.login)
    row.find("#password-cell").text(user.password)
    row.find("#name-cell").text(user.name)
    row.find("#type-cell").text(getTypeNameById(user.typeId))
    row.find("#last-visit-cell").text(moment(user.lastVisitDate, "YYYY-MM-DD").format("DD.MM.yyyy"))
}

const saveUsers = function () {
    $.post('/Home/SaveUsers', {}, function (data, textStatus, response) {
        disableSaveUsersButton(true)
        mainErrorBox.text(response.responseText)
    }).fail(function (response) {
        mainErrorBox.text(response.responseText)
    })
}

const addUser = function (user) {
    $.post('/Home/AddUser', { user: user }, function (data, textStatus, response) {
        appendUsersTable(user)
        disableSaveUsersButton(false)
        modalErrorBox.text(response.responseText)
    }).fail(function (response) {
        modalErrorBox.text(response.responseText)
    })
}

const getTypeIdByName = function (name) {
    let type = userTypes.find(x => x.name === name)
    return type.id
}

const getTypeNameById = function (id) {
    let type = userTypes.find(x => x.id === parseInt(id))
    return type.name
}