const usersList = document.querySelector('.user-list');
const userBlock = document.querySelector('.user');

for (let index = 0; index < 10; index++) {
  const item = userBlock.cloneNode(true);
  usersList.appendChild(item);
}

//Scroll Smooth
var Scrollbar = window.Scrollbar;

const optionsBar = {
  damping: 0.09,
};

Scrollbar.init(document.querySelector('#scroll'), optionsBar);
Scrollbar.init(document.querySelector('#scroll-body'), optionsBar);

const addButton = document.querySelector('#add-button');
const formData = document.querySelector('#form-data');
//Class
const userList = [];
class User {
  constructor({
    fullName,
    email,
    membership,
    expirationDate,
    isActive,
    id,
  } = {}) {
    this.fullName = fullName;
    this.email = email;
    this.membership = membership;
    this.expirationDate = expirationDate;
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
    userList.splice(userList.indexOf(this), 1);
  }
  drawUser() {
    // TODO: write DOM elements to show the user
  }
}
//Events
io.on('connect', (data) => {
  console.log('Connected to server');
  data.forEach((user) => {
    const { firstName, lastName, ...user } = user;
    userList.push(new User({ fullName: `${firstName} ${lastName}`, ...user }));
  });
});
io.on('userAdded', (data) => {
  data = JSON.parse(data);
  console.log(data);
});
io.on('updateUser', (data) => {
  data = JSON.parse(data);
  const oldUserData = userList.filter((user) => user._id === data.id)[0];
  const newUserData = new User(data.user);
  userList.splice(userList.indexOf(oldUserData), 1, newUserData);
});
//DOM
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
