const login = ()=>{
    const username = usernameInput.value
    const password = pswdInput.value

    if(username && password){
        // store username & password permananetly
        localStorage.setItem("username",username)
        localStorage.setItem("password",password)
        // navigate to dashboard
        window.location = "dashbord.html"

    }else{
        alert("please fill the form completely!!!!")
    }
}