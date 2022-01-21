const addButton = document.getElementById('add-button');
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
  preventDefault(e);
  const user = {
    firstName: formData.name.value,
    lastName: formData.lastName.value,
    email: formData.email.value,
    membership: formData.membership.value,
  };
  io.emit('add', user);
});
