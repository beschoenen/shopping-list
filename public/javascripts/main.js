const socket = io(window.location.host);

let userId = null;

/**
 * Socket Responses
 */

socket.on('connected', data => {
  userId = data.id;

  $('#status').removeClass('red').addClass('green');
});

socket.on('disconnect', () => {
  $('#status').removeClass('green').addClass('red');
  $('#users').text(0);
});

socket.on('users-changed', data => $('#users').text(data.users));

socket.on('typed', data => {
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
});

socket.on('saved', data => {
  const oldRow = $(`li[data-id=${data.tempId}]`);
  const newRow = createRow(data.entry);

  if (oldRow.length) {
    oldRow.replaceWith(newRow);
  } else {
    $('ul').prepend(newRow);
  }
});

socket.on('checked', data => {
  const row = $(`li[data-id=${data.id}]`);

  row.toggleClass('checked', data.checked);
  row.find('input[type=checkbox]').prop('checked', data.checked);

  toggleClearButton();
  sortItems();
});

socket.on('removed', data => {
  $(`li[data-id=${data.id}]`).remove();
  toggleClearButton();
});

socket.on('cleared', () => {
  $('li.checked').remove();
  toggleClearButton();
});

/**
 * Event Handlers
 */

let oldValue = null;
let rowId = null;

resetInput();

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

  $('#new-item').val(target.siblings('label').text()).focus();
  socket.emit('removing', { id: target.parent().data('id') });
});

/**
 * Helper methods
 */

function createRow (data, typing) {
  const li = $('<li class="list-group-item">').attr('data-id', data.id);

  if (typing) {
    li.addClass('typing');
  }

  li.append($('<input type="checkbox"/>').attr('id', `checkbox-${data.id}`).prop('disabled', typing));
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
