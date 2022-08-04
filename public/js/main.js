const socket = io(`${window.location.host}?room=${room}`);

const listGroup = $('#list-group');
const itemInput = $('#new-item');
const statusIcon = $('#status');
const userCount = $('#users');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(`/${room}/sw.js`).then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

/**
 * Socket Events
 */

socket.on('connected', connected);
socket.on('disconnect', disconnect);
socket.on('users-changed', usersChanged);
socket.on('suggestions-changed', suggestionsChanged);
socket.on('typed', typed);
socket.on('saved', saved);
socket.on('checked', checked);
socket.on('removed', removed);
socket.on('cleared', cleared);

/**
 * Socket Handlers
 */

function connected (data) {
  listGroup.find('li').remove();

  data.entries.forEach(entry => saved({ tempId: null, entry: entry }));

  toggleClearButton();
  sortItems();

  itemInput.prop('disabled', false).focus();
  statusIcon.removeClass('red').addClass('green');
}

function disconnect () {
  itemInput.prop('disabled', true).attr('placeholder', '');
  statusIcon.removeClass('green').addClass('red');
  userCount.text(0);
}

function usersChanged (data) {
  userCount.text(data);
}

function suggestionsChanged (data) {
  let placeholder = data[Math.floor(Math.random() * data.length)] || 'Eggs';

  itemInput.attr('placeholder', `${placeholder}...`);
  itemInput.autocomplete({ lookupLimit: 5, lookup: data });
}

function typed (data) {
  const oldRow = listGroup.find(`li[data-id=${data.id}]`);
  const newRow = createRow(data, true);

  if (!oldRow.length) {
    return listGroup.prepend(newRow);
  }

  if (data.text.length < 1) {
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
  const oldRow = listGroup.find(`li[data-id=${data.tempId}]`);
  const newRow = createRow(data.entry);

  if (oldRow.length) {
    oldRow.replaceWith(newRow);
  } else {
    listGroup.prepend(newRow);
  }
}

function checked (data) {
  const row = listGroup.find(`li[data-id=${data.id}]`);

  row.toggleClass('checked', data.checked);
  row.find('input[type=checkbox]').prop('checked', data.checked);

  toggleClearButton();
  sortItems();
}

function removed (data) {
  listGroup.find(`li[data-id=${data.id}]`).remove();
  toggleClearButton();
}

function cleared () {
  listGroup.find('li.checked').remove();
  toggleClearButton();
}

/**
 * Event Handlers
 */

let oldValue = null;
let rowId = null;

itemInput.keyup(event => {
  const newValue = itemInput.val().trim();

  if (event.key === "Enter" && newValue) {
    return saveNewItem(newValue);
  }

  if (newValue !== oldValue) {
    oldValue = newValue;
    socket.emit('typing', { id: rowId, text: newValue });
  }
}).focusout(() => {
  const originalValue = itemInput.val().trim();

  setTimeout(() => {
    const newValue = itemInput.val().trim();

    if (originalValue === newValue && newValue) {
      saveNewItem(newValue);
    }
  }, 100);
});

$(document).on('click', '#clear-button', () => socket.emit('clearing'));

$(document).on('click', '#clear-suggestions', () => socket.emit('clearing-suggestions'));

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

  itemInput.val(text).focus();

  socket.emit('removing', { id: target.parent().data('id') });
  socket.emit('typing', { id: rowId, text: text });
});

$(document).on('click', '.autocomplete-suggestion', () => itemInput.focus());

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

  li.append($('<input type="checkbox" class="item-check"/>').attr('id', `checkbox-${data.id}`).prop('disabled', typing).prop('checked', data.checked));
  li.append('&nbsp;');
  li.append($('<label class="item-text">').attr('for', `checkbox-${data.id}`).text(data.text + (typing ? '..' : '')));
  li.append('&nbsp;');
  li.append($('<i class="fas fa-pencil-alt pull-right item-edit">'));

  return li;
}

function createClearButton () {
  const button = $('<button type="button" id="clear-button">');

  button.text('Clear Checked');
  button.addClass('list-group-item list-group-item-danger');

  return button;
}

function resetInput () {
  oldValue = '';
  rowId = Math.random().toString(36).substring(7);
  itemInput.val('');
}

function saveNewItem (text) {
  socket.emit('saving', { id: rowId, text: text });
  resetInput();
}

function toggleClearButton () {
  const clearButton = $('#clear-button');

  if ($('input[id^=checkbox-]:checked').length > 0) {
    if (!clearButton.length) {
      listGroup.append(createClearButton());
    }
  } else if (clearButton.length) {
    clearButton.remove();
  }
}

function sortItems () {
  const children = listGroup.children('li').sort((a, b) => {
    let a_checked = $(a).find('input[type=checkbox]:checked').length;
    let b_checked = $(b).find('input[type=checkbox]:checked').length;

    return a_checked - b_checked || ($(a).attr('data-id') > $(b).attr('data-id') ? -1 : 1);
  });

  listGroup.children('li').remove();
  listGroup.prepend(children);
}

resetInput();
