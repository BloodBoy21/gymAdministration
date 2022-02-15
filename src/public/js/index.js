/*global io ,Swal*/
/*eslint no-undef: "error"*/
//TODO: create logic to update user data and desing it
const { Scrollbar } = window;
const ws = io(window.location.origin);
const usersListDom = document.querySelector('.user-list');
const usersList = [];
//*Userlist empty
function isUserListEmpty(users = usersList) {
  if (users.length === 0) {
    const container = document.createElement('div');
    container.classList.add('empty-list');
    container.innerHTML = `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-file-person-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm-1 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-3 4c2.623 0 4.146.826 5 1.755V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.245C3.854 11.825 5.377 11 8 11z"
              />
            </svg>
            <h2>Sin usuarios</h2>
  `;
    usersListDom.appendChild(container);
    return true;
  }
  return false;
}

//*Notifications
const notification = Swal.mixin({
  position: 'top-end',
  showConfirmButton: false,
  width: '350px',
  timer: 5000,
  toast: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});
function usersCreatedNotification(error) {
  notification.fire({
    icon: error ? 'error' : 'success',
    title: error ? 'Error al crear usuario' : 'Usuario creado',
    text: error ? error.toUpperCase() : ':)',
  });
}

function usersDeletedNotification(data) {
  notification.fire({
    icon: data.deleted ? 'success' : 'error',
    title: data.deleted ? 'Usuario eliminado' : 'Error al eliminar usuario',
    text: data.deleted
      ? `${data.user} eliminado`
      : `Error eliminado al usuario ${data.user}`,
  });
}

function userUpdatedNotification(data) {
  notification.fire({
    icon: data?.error ? 'error' : 'success',
    title: data?.error
      ? 'No se pudo actualizar el usuario'
      : 'Usuario actualizado',
    text: data?.error ?? data.message,
  });
}

//Scroll Smooth
const optionsBar = {
  damping: 0.09,
};
if (usersListDom) {
  Scrollbar.init(document.querySelector('#scroll'), optionsBar);
} else {
  Scrollbar.init(document.querySelector('#scroll-body'), optionsBar);
}

const addButton = document.querySelector('#add-button');
const formData = document.querySelector('#form-data');
const createUserCard = (user) => {
  const tempDiv = document.createElement('div');
  const template = ` <div class="user" user-id="${user._id}">
            <div class="datos">
              <h3 id="user-name">${user.fullName}</h3>
              <p id="user-status">${user.isActive ? 'Active' : 'Inactive'}</p>
              <p id="user-membership">${user.membership}</p>
              <p id="user-expiration">${user.expirationDate}</p>
            </div>
            <div class="user__options">
              <button  class="list-user" onclick="location.href = '/update-user/${
                user._id
              }';" title="Actualizar datos">
                <div class="option-svg">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
</svg>
                </div>
              </button>
              <button  class="list-user" id="renew-btn" title="Renovar membresia">
                <div class="option-svg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-check" viewBox="0 0 16 16">
  <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
</svg>
                </div>
              </button>
              <button class="delete-user" title="Eliminar usuario">
                <div class="option-svg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-x" viewBox="0 0 16 16">
  <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
  <path fill-rule="evenodd" d="M12.146 5.146a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708z"/>
</svg>
                </div>
              </button>
            </div>
          </div>`;
  tempDiv.innerHTML = template;
  return tempDiv.firstElementChild;
};
function showContent(users) {
  const usersContainer = usersListDom.querySelector('.scroll-content');
  usersContainer.innerHTML = '';
  users.forEach((user) => {
    usersContainer.appendChild(user.render);
  });
}
function refreshUsersList() {
  const emptyList = usersListDom.querySelector('.empty-list');
  if (emptyList) emptyList.remove();
  showContent(usersList);
}
function deleteUserEvent() {
  const userId = this.parentElement.parentElement.getAttribute('user-id'); // *Get id from parent element
  usersList.find((user) => user._id === userId).delete(); //* Search for user and delete it
  refreshUsersList();
  isUserListEmpty();
}
function renewUserEvent() {
  const userId = this.parentElement.parentElement.getAttribute('user-id'); // *Get id from parent element
  ws.emit('renewMembership', { id: userId });
}
//Class
class User {
  constructor({
    fullName,
    email,
    membership,
    membershipExpiration,
    isActive,
    id,
  } = {}) {
    this.fullName = fullName;
    this.email = email;
    this.membership = membership;
    this.expirationDate = new Date(membershipExpiration).toLocaleDateString();
    this.isActive = isActive;
    this._id = id;
  }
  update({ firstName, lastName, email, membership } = {}) {
    this.firstName = firstName || this.firstName;
    this.lastName = lastName || this.lastName;
    this.email = email || this.email;
    this.membership = membership || this.membership;
    const { _id, ...user } = this;
    ws.emit('updateUser', JSON.stringify({ id: _id, user }));
  }
  delete() {
    ws.emit('deleteUser', { id: this._id });
    usersList.splice(usersList.indexOf(this), 1);
  }
  draw() {
    const node = createUserCard(this);
    const deleteUser = node.querySelector('.delete-user');
    const renewUser = node.querySelector('#renew-btn');
    deleteUser.addEventListener('click', deleteUserEvent);
    renewUser.addEventListener('click', renewUserEvent);
    this.elemenDOM = node;
    return node;
  }
  get render() {
    if (!this.elemenDOM) this.draw();
    return this.elemenDOM;
  }
}

//Events
function createUser(user) {
  const { firstName, lastName, ...userData } = user;
  return new User({ ...userData, fullName: `${firstName} ${lastName}` });
}
ws.on('connect', () => {
  usersList.splice(0, usersList.length);
  if (usersListDom) refreshUsersList();
});
ws.on('getUsers', (data) => {
  const users = JSON.parse(data);
  if (usersListDom) {
    users.forEach((u) => {
      const user = createUser(u);
      usersList.push(user);
      usersListDom.querySelector('.scroll-content').appendChild(user.draw());
    });
    isUserListEmpty();
  }
});
ws.on('userAdded', (data) => {
  const user = createUser(JSON.parse(data));
  usersList.push(user);
  user.draw();
  if (usersListDom) refreshUsersList();
});
ws.on('userAddedStatus', (data) => {
  const res = JSON.parse(data);
  usersCreatedNotification(res.error);
});
ws.on('updateUser', (data) => {
  const user = JSON.parse(data);
  const oldUserData = usersList.find((u) => u._id === user.id);
  const newUserData = createUser(user);
  usersList.splice(usersList.indexOf(oldUserData), 1, newUserData);
  refreshUsersList();
});
ws.on('deleteUser', (data) => {
  const res = JSON.parse(data);
  try {
    const user = usersList.find((u) => u._id === res.id);
    usersList.splice(usersList.indexOf(user), 1);
    refreshUsersList();
  } catch (e) {
    console.error(e.message);
  }
});
ws.on('deleteUserStatus', (data) => {
  const res = JSON.parse(data);
  usersDeletedNotification(res);
});
ws.on('renewMembershipStatus', (data) => {
  const res = JSON.parse(data);
  userUpdatedNotification(res);
});
//Searchbar
function parseQuery(queryObj) {
  let query = Object.keys(queryObj).filter(
    (key) => queryObj[key] && queryObj[key].length > 0,
  );
  query = query.map((key) => `${key}=${queryObj[key]}`).join('&');
  debugger;
  return query;
}
async function searchRequest(query) {
  const data = await fetch(`/search?${query}`);
  return await data.json();
}

const searchbarBtn = document.querySelector('#searchbar-btn');
const filterQuery = document.querySelectorAll('.query-filter');
if (searchbarBtn) {
  searchbarBtn.addEventListener('click', async () => {
    //* Get all checked checkboxes  and create a query
    const queryList = Object.values(filterQuery).reduce((carry, query) => {
      let inputs = query.getElementsByTagName('input');
      const dropMenu = query.querySelectorAll('select');
      inputs = [...inputs, ...dropMenu];
      debugger;
      const blockTF = /(true|false|null)/i;
      return {
        ...carry,
        [query.getAttribute('id')]:
          Object.values(inputs).filter((i) => {
            if ((i.checked || !blockTF.test(i.value)) && i.value !== 'all') {
              return true;
            }
            return false;
          })[0]?.value ?? null,
      };
    }, {});
    const query = parseQuery(queryList); //* Parse query to url
    const users = await searchRequest(query); //* Make request to server
    if (!isUserListEmpty(users)) {
      const resultList = users.map((user) => createUser(user));
      showContent(resultList);
    }
  });
}

//DOM
if (addButton) {
  addButton.addEventListener('click', (e) => {
    e.preventDefault();
    const user = {
      firstName: formData.name.value,
      lastName: formData.lastName.value,
      email: formData.email.value,
      membership: formData.membership.value,
    };
    e.target.parentElement.reset();
    ws.emit('add', user);
  });
}
