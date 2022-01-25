const usersListDom = document.querySelector('.user-list');
const userBlock = document.querySelector('.user');
//Scroll Smooth
var Scrollbar = window.Scrollbar;

const optionsBar = {
  damping: 0.09,
};
if (userBlock) {
  Scrollbar.init(document.querySelector('#scroll'), optionsBar);
  for (let index = 0; index < 10; index++) {
    const item = userBlock.cloneNode(true);
    usersListDom.appendChild(item);
  }
} else {
  Scrollbar.init(document.querySelector('#scroll-body'), optionsBar);
}

const addButton = document.querySelector('#add-button');
const formData = document.querySelector('#form-data');
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
  updateUser({ firstName, lastName, email, membership } = {}) {
    this.firstName = firstName || this.firstName;
    this.lastName = lastName || this.lastName;
    this.email = email || this.email;
    this.membership = membership || this.membership;
    const { _id, ...user } = this;
    io.emit('updateUser', JSON.stringify({ id: _id, user }));
  }
  deleteUser() {
    io.emit('deleteUser', this);
    usersList.splice(usersList.indexOf(this), 1);
  }
  drawUser() {
    // TODO: write DOM elements to show the user
  }
}
//Events
function createUser(user) {
  const { firstName, lastName, ...userData } = user;
  return new User({ ...userData, fullName: `${firstName} ${lastName}` });
}
io.on('connect', () => {
  console.log('Connected to server');
});
io.on('getUsers', (data) => {
  data = JSON.parse(data);
  data.forEach((user) => {
    usersList.push(createUser(user));
  });
  console.table(usersList);
});
io.on('userAdded', (data) => {
  const user = JSON.parse(data);
  usersList.push(createUser(user));
});
io.on('updateUser', (data) => {
  data = JSON.parse(data);
  const oldUserData = usersList.filter((user) => user._id === data.id)[0];
  const newUserData = new User(data.user);
  usersList.splice(usersList.indexOf(oldUserData), 1, newUserData);
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
    io.emit('add', user);
  });
}
