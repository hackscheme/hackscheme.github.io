
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js'
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, setPersistence, browserSessionPersistence} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'
import { getFirestore, collection, doc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
import { closeDialog } from "/events.js"

export function addFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyAxU273yLLi-d2yqyez3_UKvM49ST5R2IQ",
    authDomain: "hackschemedb.firebaseapp.com",
    projectId: "hackschemedb",
    storageBucket: "hackschemedb.appspot.com",
    messagingSenderId: "773032859995",
    appId: "1:773032859995:web:78fbaed99ddfcc640e227e",
    measurementId: "G-2NBHEYL166"
  };
  const defaultProject = initializeApp(firebaseConfig);
  console.log("Connected to firebase: " + defaultProject.name);  // "[DEFAULT]"
  sessionStorage.setItem('app', JSON.stringify(defaultProject))
  return defaultProject;
}


export function addLogins() {
  // Sign in with Github
  document.getElementById('github_btn').addEventListener('click', () => {
    const provider = new GithubAuthProvider();
    const auth = getAuth();
    setPersistence(auth, browserSessionPersistence)
    
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log('Login successful: ' + user);
        closeDialog('login');
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GithubAuthProvider.credentialFromError(error);
        console.err("Error: login failed, "+errorMessage);
        closeDialog('login');
      });
  })

  // Sign in with Google
  document.getElementById('google_btn').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    setPersistence(auth, browserSessionPersistence)

    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;

        console.log('Login successful: ' + user);
        closeDialog('login');
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.err("Error: login failed, "+errorMessage);
        closeDialog('login');
      });
  })
}

async function listAll(db) {
  const querySnapshot = await getDocs(collection(db, "packages"));
  querySnapshot.forEach((doc) => {
    let data = doc.data(); 
    addCard(data)
  });
}

function addCard(data) {
  let div = document.getElementById('results')
  let package_name = data.package_name
  let package_version = data.package_version
  let package_description = data.package_description
  let author = data.package_author
  let name = author.name
  let git = author.git

  let card =
    `<wired-card elevation="3">
      <p><i class="fa-solid fa-box"></i> ${package_name}</p>
      <p>
        <i class="fa-solid fa-user-secret"></i> 
        <wired-link href="${git}" target="_blank">${name}</wired-link> 
      </p>
      <p><i class="fa-solid fa-code-compare"></i> ${package_version}</p> 
      <p><i class="fa-solid fa-circle-info"></i> ${package_description}</p>
    </wired-card>`

  div.innerHTML += card
}

function noResultCard(search) {
  let card =
`<wired-card elevation="3">
  <p> No results found for "${search}"</p>    
</wired-card>`

  div.innerHTML += card
}

export async function getResults(app) {
  const db = getFirestore(app);
 
  const urlParams = new URLSearchParams(window.location.search);
  let search = urlParams.get('search');

  if (search == null || search == undefined || search == "*") {
    listAll(db)
    return
  }
  const q = query(collection(db, "packages"), where("package_name", "==", search));
  const querySnapshot = await getDocs(q);
  let len = querySnapshot.docs.length
  

  if (len == 0) {
    noResultCard(search)
    return 
  }


  querySnapshot.forEach((doc) => {
    let data = doc.data(); 
    addCard(data)
    console.log(data)
  });
}



