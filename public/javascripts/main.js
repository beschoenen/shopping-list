const socket = io(window.location.host);

let userId = null;

/**
 * Socket Events
 */

socket.on('connected', connected);
socket.on('disconnect', disconnect);
socket.on('users-changed', usersChanged);
socket.on('typed', typed);
socket.on('saved', saved);
socket.on('checked', checked);
socket.on('removed', removed);
socket.on('cleared', cleared);

/**
 * Socket Handlers
 */

function connected (data) {
  userId = data.id;

  data.entries.forEach(entry => {
    if ($(`li[data-id=${entry.id}]`).length > 0) return;

    saved({ tempId: null, entry: entry });
  });

  toggleClearButton();
  sortItems();

  let placeholder = "Eggs";
  if (data.suggestions.length > 0) {
    placeholder = data.suggestions[Math.floor(Math.random() * data.suggestions.length)];
  }

  $("#new-item")
    .attr('placeholder', `${placeholder}...`)
    .autocomplete({ lookupLimit: 5, lookup: data.suggestions })
    .prop('disabled', false)
    .focus();

  $('#status').removeClass('red').addClass('green');
}

function disconnect () {
  $('#status').removeClass('green').addClass('red');
  $('#users').text(0);
  $('#new-item').prop('disabled', true);
}

function usersChanged (data) {
  $('#users').text(data.users);
}

function typed (data) {
  if (data.userId === userId) return;

  const oldRow = $(`li[data-id=${data.data.id}]`);
  const newRow = createRow(data.data, true);

  if (!oldRow.length) {
    return $('ul').prepend(newRow);
  }

  if (data.data.text.length < 1) {
    return oldRow.remove();
  }

  oldRow.replaceWith(newRow);

  const interval = setInterval(() => {
    newRow.find('label').append('.');
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    newRow.remove();
  }, 5000);
}

function saved (data) {
  const oldRow = $(`li[data-id=${data.tempId}]`);
  const newRow = createRow(data.entry);

  if (oldRow.length) {
    oldRow.replaceWith(newRow);
  } else {
    $('ul').prepend(newRow);
  }
}

function checked (data) {
  const row = $(`li[data-id=${data.id}]`);

  row.toggleClass('checked', data.checked);
  row.find('input[type=checkbox]').prop('checked', data.checked);

  toggleClearButton();
  sortItems();
}

function removed (data) {
  $(`li[data-id=${data.id}]`).remove();
  toggleClearButton();
}

function cleared () {
  $('li.checked').remove();
  toggleClearButton();
}

/**
 * Event Handlers
 */

let oldValue = null;
let rowId = null;

$('#new-item').keyup(event => {
  const newValue = $('#new-item').val().trim();

  if (event.keyCode === 13 && newValue && socket.io.readyState === 'open') {
    return saveNewItem(newValue);
  }

  if (newValue !== oldValue) {
    oldValue = newValue;
    socket.emit('typing', {
      userId: userId,
      data: {
        text: newValue,
        id: rowId
      }
    });
  }
}).focusout(() => {
  const originalValue = $('#new-item').val().trim();

  setTimeout(() => {
    const newValue = $('#new-item').val().trim();

    if (originalValue === newValue && newValue !== '' && socket.io.readyState === 'open') {
      saveNewItem(newValue);
    }
  }, 100);
});

$(document).on('click', '#clear-button', () => socket.emit('clearing'));

$(document).on('change', 'input[type=checkbox]', event => {
  socket.emit('checking', {
    id: $(event.target).parent().data('id'),
    state: event.target.checked
  });
});

$(document).on('click', '.item-edit', event => {
  const target = $(event.target);

  if (target.siblings('input[type=checkbox]:checked').length) return;

  const text = target.siblings('label').text();

  $('#new-item').val(text).focus();
  socket.emit('removing', { id: target.parent().data('id') });
  socket.emit('typing', { userId: userId, data: { text: text, id: rowId } });
});

/**
 * Helper methods
 */

function createRow (data, typing) {
  const li = $('<li class="list-group-item">').attr('data-id', data.id);

  if (typing) {
    li.addClass('typing');
  }

  if (data.checked) {
    li.addClass('checked');
  }

  li.append($('<input type="checkbox"/>').attr('id', `checkbox-${data.id}`).prop('disabled', typing).prop('checked', data.checked));
  li.append('&nbsp;');
  li.append($('<label>').attr('for', `checkbox-${data.id}`).text(data.text + (typing ? '..' : '')));
  li.append('&nbsp;');
  li.append($('<i class="fas fa-pencil-alt pull-right item-edit">'));

  return li;
}

function createClearButton () {
  const button = $('<button type="button" id="clear-button">');

  button.text("Clear Checked");
  button.addClass("list-group-item list-group-item-danger");

  return button;
}

function resetInput () {
  oldValue = '';
  rowId = Math.random().toString(36).substring(7);
  $('#new-item').val('');
}

function saveNewItem (text) {
  socket.emit('saving', {
    text: text,
    id: rowId
  });

  return resetInput();
}

function toggleClearButton () {
  const clearButton = $("#clear-button");

  if ($("input[id^=checkbox-]:checked").length > 0) {
    if (!clearButton.length) {
      $("ul").append(createClearButton());
    }
  } else if (clearButton.length) {
    clearButton.remove();
  }
}

function sortItems () {
  const ul = $("div.item-container ul");

  const children = ul.children('li').sort((a, b) => {
    let a_checked = $(a).find('input[type=checkbox]:checked').length;
    let b_checked = $(b).find('input[type=checkbox]:checked').length;

    return a_checked - b_checked || ($(a).attr('data-id') > $(b).attr('data-id') ? -1 : 1);
  });

  ul.children("li").remove();
  ul.prepend(children);
}

resetInput();
