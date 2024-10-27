// const login = ()=>{
//     const username = usernameInput.value
//     const password = pswdInput.value

//     if(username && password){
//         // store username & password permananetly
//         localStorage.setItem("username",username)
//         localStorage.setItem("password",password)
//         // navigate to dashboard
//         window.location = "dashbord.html"

//     }else{
//         alert("please fill the form completely!!!!")
//     }
// }


const login = () => {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("pswdInput").value;

    if (username && password) {
        localStorage.setItem("username", username);
        window.location = "dashbord.html"; // make sure the filename matches exactly
    } else {
        alert("Please fill out the form completely!");
    }
};
