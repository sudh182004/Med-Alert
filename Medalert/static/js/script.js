const firebaseConfig = {
  apiKey: "AIzaSyDqgdLkG9KyuNU4hgRf2ZIvtzpnEGkmu8E",
  authDomain: "my-new-ae8f5.firebaseapp.com",
  projectId: "my-new-ae8f5",
  storageBucket: "my-new-ae8f5.firebasestorage.app",
  messagingSenderId: "1055383171756",
  appId: "1:1055383171756:web:0bcfa46ae246854af5e509"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();


const navBar = document.querySelector("nav");
const menuBtns = document.querySelectorAll(".menu-icon");
const overlay = document.querySelector(".overlay");

menuBtns.forEach(menuBtn => {
  menuBtn.addEventListener("click", () => {
    navBar.classList.toggle("open");
  });
});

overlay.addEventListener("click", () => {
  navBar.classList.toggle("remove");
});

 //Forgot password 
  
 function forgetpassword(){
  const email = useremail.value;

  if (email === "" ){
    alert("Enter Email");
  }else{

  firebase.auth().sendPasswordResetEmail(email)
  .then(() => {
    alert("Please check your email for password reset")
  })
  .catch((error) => {
    alert(error.message)
    btn_signup.innerHTML="Sign In"
  });
 }
}


//Logout user
function logout() {
(function confitmation() { // confirm(boolenas) is an function ()
  let text = ("Are you sure you want to logout");
  if(confirm(text)==true){

    firebase
      .auth()
      .signOut()
      .then(() => {
        window.location.href = "/"
        // checkbox empty 
        localStorage.setItem("userstatus", "logout");
      })
      .catch((error) => {
        alert(error);
      });
  }
})()
}

firebase.auth().onAuthStateChanged((user) => {
if (user) {
  // The user object has basic properties such as display name, email, etc.
  const displayName = user.displayName;
  const email = user.email;
  const photoURL = user.photoURL;
  const emailVerified = user.emailVerified;

  if (emailVerified != true) {
    document.querySelector(".verf_email_alert").innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show container mt-5 vem"" role="alert">
      <strong>Please verify your email, or refresh if you've already done so.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      `;


  }
} else {
  window.location.href="/"
}
});

function sendverifemailagain() {
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const emailVerified = user.emailVerified;
    console.log(emailVerified)
    if(emailVerified===true){
      alert("You have already verified your email")
    }else{
        firebase
          .auth()
          .currentUser.sendEmailVerification()
          .then(() => {
            alert("Verfication email has been send please verify first");
          })
          .catch((error)=>{
            alert(error)
          }
          )
    }

  }
});
}
