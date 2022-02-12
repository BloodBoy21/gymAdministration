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
function usersCreatedNotification(error) {
  Swal.fire({
    position: 'top-end',
    icon: error ? 'error' : 'success',
    title: error ? 'Error al crear usuario' : 'Usuario creado',
    text: error ? error.toUpperCase() : ':)',
    showConfirmButton: false,
    width: '350px',
    timer: 5000,
    toast: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
}

function usersDeletedNotification(data) {
  Swal.fire({
    position: 'top-end',
    icon: data.deleted ? 'success' : 'error',
    title: data.deleted ? 'Usuario eliminado' : 'Error al eliminar usuario',
    text: data.deleted
      ? `${data.user} eliminado`
      : `Error eliminado al usuario ${data.user}`,
    showConfirmButton: false,
    width: '350px',
    timer: 5000,
    toast: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
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
              <button id="update-btn" class="list-user" onclick="location.href = '/update-user/${
                user._id
              }';" title="Mostrar datos">
                <p>Datos</p>

                <div class="option-svg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <button class="delete-user" title="Eliminar usuario">
                <p>Eliminar</p>
                <div class="option-svg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
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
    deleteUser.addEventListener('click', deleteUserEvent);
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
  const res = JSON.parse(data);
  const oldUserData = usersList.find((user) => user._id === res.id);
  const newUserData = new User(res.user);
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
