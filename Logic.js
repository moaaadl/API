 
// this part is for scrolling and fetching more posts
let currentPage = 1;
let isFetching = false;
window.addEventListener("scroll", function () {
    let endOfPage =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1;

    if (endOfPage && !isFetching) {
        isFetching = true;
        currentPage += 1;
        getPost(false, currentPage);
    }
});
toggleLoader(true);
// this function is to get the posts
function getPost(reload = true, page = 1) {
    axios.get(`https://tarmeezacademy.com/api/v1/posts?limit=3&page=${page}`)
        .then(function (response) {
            toggleLoader(false);
            let posts = response.data.data;

            if (reload) {
                document.getElementById("posts").innerHTML = "";
            }
            
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
                                    <div class="d-flex align-items-center" style="cursor: pointer;" onclick="userCliked(${author.id})">
                                        <img src="${profileImage}" class="img-thumbnail rounded-circle border" style="width: 40px; height: 40px; object-fit: contain; cursor: pointer;">
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
                    document.getElementById("posts").innerHTML += content;
                }
            }
            isFetching = false;
        })
        .catch(function (error) {
            showAlert(error.response?.data?.message); 
            isFetching = false;
        });
}
getPost();
 
// the function of creating a new post
function createNewPostCliked() {
    toggleLoader(true);
    let postId = document.getElementById("userId").value;
    let isCreate = postId === "" || postId === null || postId === undefined;
    let title = document.getElementById("title").value;
    let body = document.getElementById("body-post").value;
    let image = document.getElementById("image").files[0]; 
    let existingImageUrl = document.getElementById("existing-image-url").value;

    let formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);

    if (isCreate || image) {
        formData.append("image", image); 
    } else if (!isCreate && existingImageUrl) {
        formData.append("existing_image_url", existingImageUrl);
    }

    let token = localStorage.getItem("token");

    let url = 'https://tarmeezacademy.com/api/v1/posts';

    if (!isCreate) {
        url = `https://tarmeezacademy.com/api/v1/posts/${postId}`;
        formData.append("_method", "PUT");
    }
    
    axios.post(url, formData, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    })
    .then(function (response) {
        const loginModal = document.getElementById('creat-post-modal');
        if (loginModal) {
            const modal = bootstrap.Modal.getInstance(loginModal);
            if (modal) modal.hide();
        }
        getPost();
        if (isCreate) {
            showAlert("Post created successfully!", "success");
        } else {
            showAlert("Post updated successfully!", "success");
        }
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

// this function is to return the modal to create a new post
function addBtnModal() {
    document.getElementById("userId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("body-post").value = "";
    document.getElementById("post-modal-creat").innerHTML = "Create A new Post";
    document.getElementById("creat-modal-btn").innerHTML = "Create";
    let postModal = new bootstrap.Modal(document.getElementById("creat-post-modal"), {});
    postModal.toggle();
}

// this function is for toggelLoader
function toggleLoader(show = true) {
    let loader = document.getElementById("loader");
    if (show) {
        loader.style.visibility = "visible";
    } else {
        loader.style.visibility = "hidden";
    }
}