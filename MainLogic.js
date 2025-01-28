// this function is for toggelLoader
function toggleLoader(show = true) {
    let loader = document.getElementById("loader");
    if (show) {
        loader.style.visibility = "visible";
    } else {
        loader.style.visibility = "hidden";
    }
} 

// the function of setting up the UI
function situpUI() {
    let token = localStorage.getItem('token');
    const addBtn = document.getElementById("add-btn");

    if (token) {
        if (addBtn) addBtn.style.display = 'block';
        document.getElementById('btn').style.display = 'none';
        document.getElementById('btnn').style.display = 'none';
        document.getElementById('btnOut').style.display = 'block';
        const user = getUser();
        document.getElementById("navUsername").innerHTML = user.username;
        document.getElementById("img-nav").src = 
            typeof user.profile_image === "string" && user.profile_image.trim() 
                ? user.profile_image 
                : "man.png";


    } else {
        if (addBtn) addBtn.style.display = 'none';
        document.getElementById('btn').style.display = 'block';
        document.getElementById('btnn').style.display = 'block';
        document.getElementById('btnOut').style.display = 'none';
        document.getElementById('logout-div').style.setProperty('display', 'none', 'important'); 
    }
}
situpUI();

// the function of edit post
function editPostCliked(postObject) {
    let post = JSON.parse(decodeURIComponent(postObject));
    document.getElementById("userId").value = post.id;
    document.getElementById("title").value = post.title;
    document.getElementById("body-post").value = post.body;
    document.getElementById("post-modal-creat").innerHTML = "Edit Post";
    document.getElementById("creat-modal-btn").innerHTML = "Update";
    let postModal = new bootstrap.Modal(document.getElementById("creat-post-modal"), {});
    postModal.toggle();
}

let postIdToDelete = null;

// the function to show the delete confirmation
function showDeleteConfirmation(postId) {
    postIdToDelete = postId;
    let deleteModal = new bootstrap.Modal(document.getElementById("delete-confirmation-modal"), {});
    deleteModal.show();
}

// call the function to delete the post
function yesToDelete(){
    toggleLoader(true);
    deletePostCliked(postIdToDelete)
}
// the function to delete the post

function deletePostCliked(postId) {
    toggleLoader(true);
    axios.delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(function (response) {
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById("delete-confirmation-modal"));
        if (deleteModal) {
            deleteModal.hide();
        }
        getPost();
        getUserProfile();
        showAlert("Post deleted successfully!", "success");
    })
    .catch(function (error) {
        if (error.response && error.response.data && error.response.data.message) {
            showAlert(error.response.data.message, "danger");
        } else {
            console.error("Unexpected error:", error);
            showAlert("An unexpected error occurred. Please try again later.", "danger");
        }
    })
    .finally(() => {
        toggleLoader(false);
    });
}

// the function to login
function loginBtnClick() {
    toggleLoader(true)
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value; 

    if (!username || !password) {
        showAlert("Please fill in all fields", "danger");
        return;
    }

    const params = {
        "username": username,
        "password": password
    };

    axios.post('https://tarmeezacademy.com/api/v1/login', params, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(function (response) {
        if (response.data && response.data.token) {
            let token = response.data.token;
            let user = JSON.stringify(response.data.user);
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', user);
            
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                const modal = bootstrap.Modal.getInstance(loginModal);
                if (modal) modal.hide();
            }
            
            const logoutDiv = document.getElementById('logout-div');
            if (logoutDiv) logoutDiv.style.display = 'block';
            
            showAlert('Login successful!');
            situpUI();
            getPost();


        } else {
            showAlert("Login error: Missing token in response", "danger");
        }
    })
    .catch(function (error) {
        let errorMessage = "Login error";
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        showAlert(errorMessage, "danger");
    })
    .finally(() => {
        toggleLoader(false);
    });
}

// function to get user
function getUser() {
    let user = null;
    const storageUser = localStorage.getItem("user");

    if (storageUser != null) {
        user = JSON.parse(storageUser);
    }

    return user;
}
//function to logout
function logout() {
    toggleLoader(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    let logout = document.getElementById('logout-div');
    logout.style.setProperty('display', 'none', 'important');
    showAlert("Log out successful!");
    situpUI();
    getPost();
}
// the alert function
function showAlert(msg, type = "success") {
    const alertPlaceholder = document.getElementById('successAlert');

    alertPlaceholder.innerHTML = '';

    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('alert');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');
        alertPlaceholder.append(wrapper);
    };

    alertPlaceholder.style.display = 'block';

    appendAlert(msg, type);

    setTimeout(() => {
        alertPlaceholder.style.display = 'none'; 
    }, 3300);

    setTimeout(() => {
        alertPlaceholder.style.display = 'block';
    }, 0);
}
// the function to register
function registerBtnClick() {
    toggleLoader(true);
    let username = document.getElementById("username1").value;
    let password = document.getElementById("password1").value;
    let name = document.getElementById("name").value;
    let profileImage = document.getElementById("profil-image").files[0];

    if (!username || !password || !name) {
        showAlert("Please fill in all the information", "danger");
        return;
    }

    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("image", profileImage);

    axios.post('https://tarmeezacademy.com/api/v1/register', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
        .then(function (response) {
            let token = response.data.token;
            let user = JSON.stringify(response.data.user);

            localStorage.setItem("token", token);
            localStorage.setItem("user", user);
            console.log(response.data)
            let modal = bootstrap.Modal.getInstance(document.getElementById("register-modal"));
            modal.hide();

            let logout = document.getElementById("logout-div");
            logout.style.display = "block";
            showAlert("Registration successful!", "success");
            situpUI();
        })
        .catch(function (error) {
            console.error(error);
            const message = error.response?.data?.message || "An error occurred during registration.";
            showAlert(message, "danger");
        })
        .finally( () => {
            toggleLoader(false);
        });
}
// the function to see the post
function postCliked(postId){
    window.location.href = `PostDetails.html?postId=${postId}`
    toggleLoader(true);
}

function userCliked(userId){
    window.location.href = `Profil.html?userId=${userId}`
    toggleLoader(true);
}

function profileCliked(){
    window.location.href = `Profil.html?userId=${getUser().id}`
    toggleLoader(true);
}

