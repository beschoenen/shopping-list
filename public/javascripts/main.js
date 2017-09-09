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

socket.on('users-changed', data => {
  $('#users').text(data.users);
});

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
});

socket.on('cleared', () => {
  $('li.checked').remove();
});

/**
 * Event Handlers
 */

let oldValue = null;
let rowId = null;

resetInput();

$('#new-item').keyup(event => {
  const inputBox = $('#new-item');
  const newValue = inputBox.val();

  if (event.keyCode === 13 && newValue && socket.io.readyState === 'open') {
    socket.emit('saving', {
      text: newValue,
      id: rowId
    });

    return resetInput();
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
});

$('#clear-button').click(() => socket.emit('clearing'));

$(document).on('change', 'input[type=checkbox]', event => {
  socket.emit('checking', {
    id: $(event.target).closest('li').data('id'),
    state: event.target.checked
  });
});

/**
 * Helper methods
 */

function createRow(data, typing) {
  const li = $('<li class="list-group-item">').attr('data-id', data.id);
  
  if (typing) {
    li.addClass('typing');
  }

  li.append($('<input type="checkbox"/>').attr('id', `checkbox-${data.id}`).prop('disabled', typing));
  li.append('&nbsp;');
  li.append($('<label>').attr('for', `checkbox-${data.id}`).text(data.text + (typing ? '..' : '')));

  return li;
}

function resetInput() {
  oldValue = '';
  rowId = Math.random().toString(36).substring(7);
  $('#new-item').val('');
}
