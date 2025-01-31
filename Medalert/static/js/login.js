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
  
  // Dom Selector 
  
  let useremail = document.querySelector(".input_user");
  let userpassord = document.querySelector(".input_password");
  let btn_signup = document.querySelector(".btn_signup");
  let btn_signin = document.querySelector(".btn_signin");
  let rember_checkbox = document.querySelector(".rember_checkbox");
  
  
  //When page load check user is signin or not for send him to main page
  
  if (localStorage.getItem("userstatus") === "signin") {
    window.location.href = "home";
  }else{
    useremail.value = localStorage.getItem("useremail")
    userpassord.value = localStorage.getItem("userpassword")
  }
  
  
  // Create account for a new user
  function signup() {
    const email = useremail.value; // Ensure useremail exists and is a valid input
    const password = userpassord.value; // Ensure userpassord exists and is a valid input

    // Check if any field is empty
    if (email === "" || password === "") {
        alert("Enter Email and Password");
    } else if (password.length < 8) {
        alert("Password must contain at least 8 characters");
    } else {
        btn_signup.innerHTML = "Signing Up......";

        // Firebase Authentication: Create User
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert("Your account is successfully created");
                localStorage.setItem("userstatus", "signin");

                // Send Verification Email
                firebase.auth().currentUser.sendEmailVerification()
                    .then(() => {
                        alert("Verification email has been sent. Please verify first.");
                        document.getElementById("nameModal").style.display = "block";
                        const nameModal = new bootstrap.Modal(document.getElementById("nameModal"));
                        nameModal.show();

                        // Attach Event Listener for Save Button (Only Once)
                        const saveNameBtn = document.getElementById("saveDetails");
                        if (!saveNameBtn.getAttribute("data-listener")) {
                            saveNameBtn.setAttribute("data-listener", "true");
                            saveNameBtn.addEventListener("click", async () => {
                          
                                const username = document.getElementById("username").value.trim();
                                const dob = document.getElementById("dob").value;
                                const gender = document.getElementById("gender").value;
                                const emergencyName = document.getElementById("emergencyName").value.trim();
                                const relationship = document.getElementById("relationship").value.trim();
                                const emergencyPhone = document.getElementById("emergencyPhone").value.trim();
                                const address = document.getElementById("address").value.trim();
                                const allergies = document.getElementById("allergies").value.trim();
                                const medicalConditions = document.getElementById("medicalConditions").value.trim();
                            

                              if (!username || !dob || !gender || !emergencyName || !relationship || !emergencyPhone || !address || emergencyPhone.length<10) {
                                  alert("Please fill in all required fields.");
                                  return;
                                }

                                // Save Name to Firestore
                                const db = firebase.firestore();
                                const user = firebase.auth().currentUser;

                                try {
                                    await db.collection("users").doc(user.email).set({
                                      email: user.email,
                                      name: username,
                                      dob: dob,
                                      gender: gender,
                                      emergencyContact: {
                                          name: emergencyName,
                                          relationship: relationship,
                                          phone: emergencyPhone,
                                      },
                                      address: address,
                                      allergies: allergies,
                                      medicalConditions: medicalConditions,
                          
                                    });

                                    alert("Details saved successfully!");
                                    document.getElementById("nameModal").style.display = "none";
                                    window.location.href = "home";
                                } catch (error) {
                                    alert("Error saving name: " + error.message);
                                    // localStorage.setItem("userstatus", "logout");

                                }
                            });
                        }
                    })
                    .catch((error) => {
                        alert("Error sending verification email: " + error.message);
                    });
            })
            .catch((error) => {
                btn_signup.innerHTML = "Sign Up"; // Reset button text
                alert(error.message);
            });
    }
}

btn_signup.addEventListener("click", signup);

  
  //Login/ Signin
  
  function signin() {
    const email = useremail.value;
    const password = userpassord.value;
  
    if (email === "" || password === "") {
      alert("Enter Email And Password");
    } else {
      btn_signin.innerHTML="Signing In......"
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          //store user eamil and password for checkbox sign in
          if(rember_checkbox.checked){
            localStorage.setItem("useremail",email)
            localStorage.setItem("userpassword",password)
          }
          window.location.href =  "/home/"
  
         
          
          localStorage.setItem("userstatus", "signin");
                
        })
        .catch((error) => {
          btn_signin.innerHTML="Sign In"
          alert(error.message);
  
        });
    }
  }
  btn_signin.addEventListener("click", signin);
  
  function forgetpassword(){
    document.querySelector(".forgot-password").style.display = 'none';
    const email = useremail.value;
  
    if (email === "" ){
      alert("Enter Email");
    }else{
  
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Please check your email for password reset")
      setTimeout(function() {
        document.querySelector(".forgot-password").style.display = 'block';
    }, 30000);
    
    })
    .catch((error) => {
      alert(error.message)
      btn_signup.innerHTML="Sign In"
    });
   }
}
