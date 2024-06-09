

const addBtn = (id) => {
  document.getElementById(`open_${id}`).addEventListener('click', () => {
    document.getElementById(`${id}_dialog`).open = true;
  });
  document.getElementById(`close_${id}`).addEventListener('click', () => {
    document.getElementById(`${id}_dialog`).open = false;
  });
}


const loadPage = () => {
  addBtn('login')
  addBtn('submit')
}


