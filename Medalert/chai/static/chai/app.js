const firebaseConfig = {
  apiKey: "Api_key",
  authDomain: "....",
  projectId: "....",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...."
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
  
  // overlay.addEventListener("click", () => {
  //   navBar.classList.toggle("remove");
  // });
  
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
      const emailVerified = user.emailVerified;
  
      // Firestore reference
      const db = firebase.firestore();
  
      // Fetch user data from Firestore
      db.collection("users").doc(user.email).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          let email = document.querySelector('.email')
          let emergency_contact_number = document.querySelector('.emergency_contact_number')
          let gender = document.querySelector('.gender')
          let address = document.querySelector('.address')
          
          let username = document.querySelector(".username")
          // s means data which is hidden onyl to send data in django from post
          let usernames = document.querySelector(".usernames")
          let genders = document.querySelector(".genders")
          let allergies = document.querySelector(".allergies")
          let medicalConditions = document.querySelector(".medicalConditions")
          let emergency_contact_numbers = document.querySelector(".emergency_contact_numbers")
          let emergency_contact_relationships = document.querySelector(".emergency_contact_relationships")

          usernames.value = `${userData.name}`
          genders.value = `${userData.gender}`
          allergies.value = `${userData.allergies}`
          medicalConditions.value = `${userData.medicalConditions}`
          emergency_contact_numbers.value = `${userData.emergencyContact.phone}`
          emergency_contact_relationships.value = `${userData.emergencyContact.relationship}`

          console.log(userData.email)
          username.innerHTML = `Name:${userData.name}`
          email.innerHTML = `Email: ${userData.email}`
          emergency_contact_number.innerHTML = `Emg. Contact: ${userData.emergencyContact.phone}`
          gender.innerHTML = `Sex: ${userData.gender}`
          address.innerHTML = `Adrress: ${userData.address}`
          

          } else {
            alert("No user found")
            console.warn("No user data found in Firestore.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
  
      // Handle email verification status
      if (!emailVerified) {
        document.querySelector(".verf_email_alert").innerHTML = `
          <div class="alert alert-warning alert-dismissible fade show vem" role="alert">
            <strong>Please verify your email to access the website.</strong>
            <button class="btn btn-dark btn-sm" id="resend-email">Resend Verification Email</button>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;
  
        // Resend verification email
        document.getElementById("resend-email").addEventListener("click", () => {
          user.sendEmailVerification()
            .then(() => {
              alert("Verification email sent successfully!");
            })
            .catch((error) => {
              console.error("Error sending verification email: ", error);
            });
        });
      }
    } else {
      // Redirect unauthenticated users
      window.location.href = "/";
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

  // Notrication for location
  let message = document.querySelector('.messages')
  // let latitude = document.querySelector('.latitude')
  // let longitude = document.querySelector('.longitude')
  let latitude = document.querySelector('.latitude')
  let longitude = document.querySelector('.longitude')
 
 
  function checkLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude.value=`${position.coords.latitude}`
          longitude.value=`${position.coords.longitude}`
          alert("Location access granted!");
          // message.value = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
          message.value = `https://www.google.com/maps?q=${latitude.value},${longitude.value}`
 

        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
            // Show the modal
            document.getElementById("modal").style.display = "flex";
          }
        },{
          maximumAge: 60000, // Cache positions for up to 60 seconds
          timeout: 5000,     // Wait 5 seconds for a response
          enableHighAccuracy: true // Request high accuracy
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  // Event listeners
  document.addEventListener("DOMContentLoaded", () => {
    checkLocation(); // Check location on page load

    // Turn on button
    document.getElementById("enableLocation").addEventListener("click", () => {
      // Ask the user to turn on location manually
      alert("Please enable your location from device settings.");
      checkLocation(); // Retry checking location
      window.location.reload()
    });
    
    // Cancel button
    document.getElementById("cancel").addEventListener("click", () => {
      alert("You need to enable location to proceed.");
      window.location.reload()
      // Optionally redirect to an error page or block access
    });
  });
