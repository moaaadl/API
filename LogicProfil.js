
// this function is for toggelLoader
function toggleLoader(show = true) {
    let loader = document.getElementById("loader");
    if (show) {
        loader.style.visibility = "visible";
    } else {
        loader.style.visibility = "hidden";
    }
}

// this part is for get the user id from the url
const urlParams = new URLSearchParams(window.location.search)
const ID = urlParams.get("userId");

// this function is used to get the information of the user to profile
function getUserProfile() {
    toggleLoader(true);
     // Replace with the actual user ID if needed
    const url = `https://tarmeezacademy.com/api/v1/users/${ID}`; // Replace with your actual API endpoint

    axios.get(url, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(function (response) {
        const user = response.data.data;
        // Update the UI with the user profile data
        document.getElementById("username-profil").innerText = user.username;
        document.getElementById("email-user-profil").innerText = user.email;
        document.getElementById("name-user-profil").innerText = user.name;
        document.getElementById("img-profil").src = typeof user.profile_image === "string" && user.profile_image.trim() !== "" ? user.profile_image : "man.png";
        document.getElementById("comment-count").innerHTML = user.comments_count;
        document.getElementById("post-count").innerHTML = user.posts_count;
        document.getElementById("title-profil").innerHTML = user.username;
        // Add more fields as needed
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
getUserProfile();

// this function is used to get the post of the user to profile
function getPost() {
    toggleLoader(true);
    axios.get(`https://tarmeezacademy.com/api/v1/users/${ID}/posts`)
        .then(function (response) {

            let posts = response.data.data;

            document.getElementById("post-profil").innerHTML = "";

            for (let id = 0; id < posts.length; id++) { 
                let imageUrl = posts[id].image;
                let author = posts[id].author;

                const profileImage =
                    author?.profile_image && typeof author.profile_image === "string" && author.profile_image.trim()
                        ? author.profile_image
                        : "./man.png";

                let user = getUser();
                
                let isMypost = user && user.id === author.id;
                
                let iconEdit = ``;
                let iconDelete = ``;

                if (isMypost) {
                    iconEdit = `<i class="bi bi-pen" style="cursor: pointer;" onclick="editPostCliked('${encodeURIComponent(JSON.stringify(posts[id]))}')"></i>`;
                    iconDelete = `<i class="bi bi-trash" style="cursor: pointer;color:red;" onclick="showDeleteConfirmation(${posts[id].id})"></i>`;
                }

                let postTitle = posts[id].title || "";
                
                if (imageUrl && typeof imageUrl === "string" && imageUrl !== ""){
                    let content = `
                            <div class="card shadow my-3">
                                <div class="card-header d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <img src="${profileImage}" class="img-thumbnail rounded-circle border" style="width: 40px; height: 40px; object-fit: contain;">
                                        <b style="margin-left: 8px;">${author.username}</b>
                                    </div>
                                    <div class="d-flex">
                                        ${iconEdit}
                                        <span style="margin-left: 8px;"></span>
                                        ${iconDelete}
                                    </div>
                                </div>

                                <div class="card-body" onclick="postCliked(${posts[id].id})" style="cursor: pointer;">
                                    <img src="${imageUrl}" style="width: 100%;">
                                    <h6 style="color: #918787d5;" class="mt-1">
                                        ${posts[id].created_at}
                                    </h6>
                                    <h5>
                                        ${postTitle}
                                    </h5>
                                    <p>
                                        ${posts[id].body}
                                    </p>
                                    <hr>
                                    <div>
                                        <i class="bi bi-chat"></i>
                                        <span>
                                            (${posts[id].comments_count}) Comments
                                        </span>
                                    </div>
                                </div>
                            </div>
                    `;
                    document.getElementById("post-profil").innerHTML += content;
                }
            }
        })
        .catch(function (error) {
            showAlert(error.response?.data?.message); 
        })
        .finally(function () {
            toggleLoader(false);
        });
}
getPost();