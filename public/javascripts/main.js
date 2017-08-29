var userId = Math.random().toString(36).substring(7);

var socket = io(window.location.host);

socket.on('typed', function (data) {
  if (data.userId === userId) return;

  var oldRow = $('li[data-id=' + data.data.id + ']');
  var newRow = createRow(data.data, true);

  if (oldRow.length) {
    if (data.data.text.length < 1) {
      return oldRow.remove();
    }

    oldRow.replaceWith(newRow);
  } else {
    $('ul').prepend(newRow);
  }

  var interval = setInterval(function () {
    var label = newRow.find('label');
    label.text(label.text() + '.');
  }, 1000);

  setTimeout(function () {
    clearInterval(interval);
    newRow.remove();
  }, 5000);
});

socket.on('saved', function (data) {
  var oldRow = $('li[data-id=' + data.oldId + ']');
  var newRow = createRow(data.entry);

  if (oldRow.length) {
    oldRow.replaceWith(newRow);
  } else {
    $("ul").prepend(newRow);
  }
});

socket.on('checked', function (data) {
  var row = $('li[data-id=' + data._id + ']');

  row.find('input[type=checkbox]').prop('checked', data.checked);
  row.toggleClass('checked', data.checked);
});

socket.on('cleared', function () {
  $('li.checked').remove();
});

var oldValue = '';
var rowId = Math.random().toString(36).substring(7);
$('#new-item').keyup(function (event) {
  var newValue = $(this).val();

  if (event.keyCode === 13 && newValue) {
    socket.emit('saving', {
      text: newValue,
      id: rowId
    });

    oldValue = '';
    rowId = Math.random().toString(36).substring(7);
    $(this).val('');

    return;
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

$('#clear-button').click(function () {
  socket.emit('clearing');
});

$(document).on('change', 'input[type=checkbox]', function () {
  socket.emit('checking', {
    id: $(this).closest('li').data('id'),
    state: this.checked
  });
});

function createRow(data, typing) {
  var id = data._id || data.id;

  var li = $('<li class="list-group-item">').attr('data-id', id);

  if (typing) {
    li.addClass('typing');
  }

  li.append($('<input type="checkbox"/>').attr('id', 'checkbox-' + id).prop('disabled', typing));
  li.append('&nbsp;');
  li.append($('<label>').attr('for', 'checkbox-' + id).text(data.text + (typing ? '..' : '')));

  return li;
}
