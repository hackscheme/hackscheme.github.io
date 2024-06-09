
import { getFirestore, collection, doc, getDocs, setDoc, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"

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

  addPackageSubmitEvents(app)
}

export function closeDialog(id) {
  clearError('pkg')
  clearError('next')
  clearDialogFileds()
  document.getElementById(`${id}_dialog`).open = false;
}


function addPackageSubmitEvents(app) {
  document.getElementById('next').addEventListener('click', () => {
    let partial = makepartialPakage()
    if (partial == null)
      return 

    closeDialog('submit')
    console.log(partial)
    document.getElementById(`next_dialog`).open = true;
    document.getElementById('submit_pkg').addEventListener('click', () => {
      let complete = completePartial(partial)
      submitPackage(app, complete)
    })
  })

  document.getElementById(`close_next`).addEventListener('click', () => {
    document.getElementById(`next_dialog`).open = false;
  });
}


async function uploadFile(app, pkg, path) {
  let next_error = document.getElementById('_next_error_msg')
  next_error.style.color = 'green'
  next_error.innerHTML = 'Uploading...'
  next_error.style.display = 'block'

  let storage = getStorage()
  let name = pkg.package_name + '-' + pkg.package_version
  let file_ref = ref(storage, name + ".tar.gz")

  const metadata = {
    contentType: 'application/gzip'
  };
  const uploadTask = uploadBytesResumable(file_ref, path ,metadata);
  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      next_error.innerHTML = 'Upload is ' + progress + '% done';
      switch (snapshot.state) {
        case 'paused':
          next_error.innerHTML = 'Upload is paused';
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    }, 
    (error) => {
      switch (error.code) {
        case 'storage/unauthorized':
            console.log(error)
            next_error.innerHTML = 'User doesn\'t have permission to access the object'
            break;
        case 'storage/canceled':
          next_error.innerHTML = 'User canceled the upload'
          break;
        default:
          next_error.innerHTML = 'Unknown error occurred, inspect error.serverResponse'
          break;
      }
      return false; 
    }, 
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        const pack = package_without_file(pkg)
        pack.package_url = downloadURL
        const db = getFirestore(app);
        const doc_ref = doc(collection(db, "packages"));
        setDoc(doc_ref, pack);
        console.log("Done adding package")
        closeDialog('next')
        return downloadURL
      });
    }
  );
}

async function submitPackage(app, pkg) {
  console.log(pkg)
  await uploadFile(app, pkg, pkg.package_file)
}


function reportError(msg, id) {
  let pkg_error_msg = document.getElementById(`_${id}_error_msg`)
  pkg_error_msg.style.display = 'block'
  pkg_error_msg.innerHTML = msg
}

function clearError(id) {
  let pkg_error_msg = document.getElementById(`_${id}_error_msg`)
  pkg_error_msg.style.display = 'none'
  pkg_error_msg.innerHTML = ''
}

function clearDialogFileds() {
  document.getElementById(`_pkg_name`).value = ''
  document.getElementById(`_pkg_version`).value = ''
  document.getElementById(`_pkg_description`).value = ''
  document.getElementById(`_pkg_file`).value = ''

  document.getElementById('_next_author_name').value = ''
  document.getElementById('_next_author_url').value = ''
}

function makepartialPakage() {
  let packageName = document.getElementById('_pkg_name').value
  let packageVersion = document.getElementById('_pkg_version').value
  let packageDescription = document.getElementById('_pkg_description').value
  let packageFile = document.getElementById('_pkg_file').files[0]


  if (packageName == null || packageName == '') {
    reportError('Missing a package name', 'pkg')
    return null
  }

  if (packageVersion == null || packageVersion == '') {
    reportError('No package version provided', 'pkg')
    return null
  }

  if (packageDescription == null || packageDescription == '') {
    reportError('Package description not written', 'pkg')
    return null
  }

  if (packageFile == null || packageFile == '') {
    reportError('Not yet selected a packaged file', 'pkg')
    return null
  }

  return {
    package_name: packageName,
    package_version: packageVersion,
    package_description: packageDescription,
    package_file: packageFile
  }
}

function completePartial(partial) {
  
  let nm = document.getElementById('_next_author_name').value
  if (nm == null || nm == '') {
    reportError('No author name provided', 'next')
    return null
  }

  let gt = document.getElementById('_next_author_url').value
  if (gt == null || gt == '') {
    reportError('No github url provided', 'next')
    return null
  }

  let author = {
    name: nm,
    git: gt
  }
  return {
    package_name: partial.package_name,
    package_version: partial.package_version,
    package_description: partial.package_description,
    package_file: partial.package_file,
    package_author: author, 
    package_url: ""
  }
}

function package_without_file(pkg) {
  return {
    package_name: pkg.package_name,
    package_version: pkg.package_version,
    package_description: pkg.package_description,
    package_author: pkg.package_author,
    package_url: pkg.package_url
  }
}


