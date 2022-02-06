/*global io ,window,document,Swal*/
/*eslint no-undef: "error"*/
//TODO: create logic to update user data and desing it
io = io(window.location.origin);
const usersListDom = document.querySelector('.user-list');
//Notifications
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
//Scroll Smooth
var Scrollbar = window.Scrollbar;
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
//Class
const usersList = [];
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
    io.emit('updateUser', JSON.stringify({ id: _id, user }));
  }
  delete() {
    io.emit('deleteUser', { id: this._id });
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
function refreshUsersList() {
  const usersContainer = usersListDom.querySelector('.scroll-content');
  usersContainer.innerHTML = '';
  usersList.forEach((user) => {
    usersContainer.appendChild(user.elemenDOM);
  });
}
function deleteUserEvent() {
  const userId = this.parentElement.parentElement.getAttribute('user-id'); // *Get id from parent element
  usersList.find((user) => user._id === userId).delete(); //* Search for user and delete it
  refreshUsersList();
}

//Events
function createUser(user) {
  const { firstName, lastName, ...userData } = user;
  return new User({ ...userData, fullName: `${firstName} ${lastName}` });
}
io.on('connect', () => {
  usersList.splice(0, usersList.length);
  if (usersListDom) refreshUsersList();
});
io.on('getUsers', (data) => {
  const users = JSON.parse(data);
  if (usersListDom) {
    users.map((user) => {
      user = createUser(user);
      usersList.push(user);
      usersListDom.querySelector('.scroll-content').appendChild(user.draw());
    });
  }
});
io.on('userAdded', (data) => {
  const user = createUser(JSON.parse(data));
  usersList.push(user);
  user.draw();
  if (usersListDom) refreshUsersList();
});
io.on('userAddedStatus', (data) => {
  data = JSON.parse(data);
  usersCreatedNotification(data.error);
});
io.on('updateUser', (data) => {
  data = JSON.parse(data);
  const oldUserData = usersList.find((user) => user._id === data.id);
  const newUserData = new User(data.user);
  usersList.splice(usersList.indexOf(oldUserData), 1, newUserData);
  refreshUsersList();
});
io.on('deleteUser', (data) => {
  data = JSON.parse(data);
  try {
    const user = usersList.find((u) => u._id === data.id);
    usersList.splice(usersList.indexOf(user), 1);
    refreshUsersList();
  } catch (e) {
    console.error(e.message);
  }
});
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
    io.emit('add', user);
  });
}
