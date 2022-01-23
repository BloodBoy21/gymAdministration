const usersList = document.querySelector('.user-list');
const userBlock = document.querySelector('.item');

for (let index = 0; index < 10; index++) {
  const item = userBlock.cloneNode(true);
  usersList.appendChild(item);
}

//Scroll Smooth
var Scrollbar = window.Scrollbar;

const optionsBar = {
  damping: 0.08,
  alwaysShowTracks: true,
};

Scrollbar.init(document.querySelector('#scroll'), optionsBar);
Scrollbar.init(document.querySelector('#scroll-body'), optionsBar);

const addButton = document.querySelector('#add-button');
const formData = document.querySelector('#form-data');
//Class
class User {
  constructor(firstName, lastName, email, membership) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.membership = membership;
  }
  updateUser({ firstName, lastName, email, membership } = {}) {
    this.firstName = firstName || this.firstName;
    this.lastName = lastName || this.lastName;
    this.email = email || this.email;
    this.membership = membership || this.membership;
    io.emit('updateUser', this);
  }
  deleteUser() {
    io.emit('deleteUser', this);
  }
}
//Events
io.on('userAdded', (data) => {
  data = JSON.parse(data);
  console.log(data);
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
