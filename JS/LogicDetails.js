// this function is for toggelLoader
function toggleLoader(show = true) {
    let loader = document.getElementById("loader");
    if (show) {
        loader.style.visibility = "visible";
    } else {
        loader.style.visibility = "hidden";
    }
}


const urlParams = new URLSearchParams(window.location.search)
const Id = urlParams.get("postId")


function getOnePost() {
    toggleLoader(true);
    axios.get(`https://tarmeezacademy.com/api/v1/posts/${Id}`)
        .then(function (response) {
            const post = response.data.data;
            const comments = post.comments
            
            document.getElementById("one-post").innerHTML = "";

            let profileImage =
                post?.author?.profile_image && typeof post.author.profile_image === "string" && post.author.profile_image.trim()
                    ? post.author.profile_image
                    : "man.png";
            
            let commentsContent = ``

            for (cmnt of comments){

                let profileImageComment = cmnt.author.profile_image && typeof cmnt.author.profile_image === "string" && cmnt.author.profile_image.trim()
                    ? cmnt.author.profile_image
                    : "man.png";

                commentsContent += `
                    <div class="p-3 comment shadow rounded" style="background-color: #ffffff;">
                            <img src="${profileImageComment}" alt="" class="img-thumbnail rounded-circle border" style="width: 40px; height: 40px; object-fit: contain; cursor: pointer;">
                            <b style="margin-left: 4px;">${cmnt.author.username}</b>
                            <p style="margin-top:10px;margin-left:5px;">${cmnt.body}</p>
                    </div>
                `
            }

            const token = localStorage.getItem('token');
            const addCommentDiv = token ? `
                <div class="mb-2 mt-2 input-group" id="add-comment-div">
                    <input type="text" class="form-control" id="comment" placeholder="Add a comment" aria-label="Add a comment" aria-describedby="button-addon2">
                    <button class="btn btn-outline-primary" type="button" id="button-addon2" onclick="addComment(${Id})">Add</button>
                </div>
            ` : '';

            let content = `
                <div class="d-flex justify-content-center mt-4">
                    <div class="col-9">
                        <h1>
                        <span>
                            ${post.author.username}'s
                        </span>
                        Post
                        </h1>
                    </div>
                </div>
                <div class="d-flex justify-content-center mt-2">
                    <div class="col-9">
                        <div id="posts">
                        <div class="card shadow my-2">
                            <div class="card-header">
                                <img src="${profileImage}" class="img-thumbnail rounded-circle border" style="width: 40px;height: 40px;object-fit: contain;cursor: pointer;">
                                <b style="padding-left: 5px;">${post.author.username}</b>
                            </div>
                            <div class="card-body">
                                <img src="${post.image}" style="width: 100%;">
                                <h6 style="color: #918787d5;" class="mt-1">
                                    ${post.created_at}
                                </h6>
                                <h5>
                                    ${post.title}
                                </h5>
                                <p>
                                    ${post.body}
                                </p>
                                <hr>
                                <div>
                                    <i class="bi bi-chat"></i>
                                    <span>
                                        (${post.comments_count}) Comments
                                    </span>
                                </div>
                            </div>
                        </div>
                        </div>

                          <div id="comments">
                            ${commentsContent}
                          </div>

                          ${addCommentDiv}
                    </div>
                </div>
            `
            document.getElementById("one-post").innerHTML = content;
        })
        .catch(function (error) {
            showAlert(error.response?.data?.message);
        })
        .finally(function () {
            toggleLoader(false);
        });
}
getOnePost();

function addComment() {
    toggleLoader(true);
    let commentElement = document.getElementById("comment"); 
    let commentBody = commentElement.value;
    let formData = new FormData();
    formData.append("body", commentBody);
    axios.post(`https://tarmeezacademy.com/api/v1/posts/${Id}/comments`, formData, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })
    .then(function (response) {
        getOnePost();
        showAlert("Comment added successfully", "success");
    })
    .catch(function (error) {
        showAlert(error.response?.data?.message , "danger");
    })
    .finally(function () {
        toggleLoader(false);
    });
}