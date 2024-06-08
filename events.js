
function search(app) {
  let search = document.getElementById('search_bar').value
  if (search == '' || search == null) {
    return
  }

  window.location.href = `/search.html?search=${search}`

  console.log(search, app)
}

export function addEvents(app) {
  document.getElementById('search_bar').onkeyup = (e) => {
    if (e.key == 'Enter')
      search(app)
  }
  document.getElementById('btn2').addEventListener('click', () => {
    search(app)
  })
}


