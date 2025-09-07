import { Base_URL } from "../../config";
import styles from "./styles.module.css";

import { getAboutUser, getAllUsers } from "../../config/redux/action/authAction";
import {
  getAllPosts,
  createPost,
  deletePost,
  incrementPostLike,
  getAllComments,
  postComment,
} from "../../config/redux/action/postAction";
import {
  setTokenIsNotThere,
  setTokenIsThere,
} from "../../config/redux/reducer/authReducer";
import { resetPostId } from "../../config/redux/reducer/postReducer";

import DashboardLayout from "../../layout/DashboardLayout";
import UserLayout from "../../layout/UserLayout";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);
  const [commentText, setCommentText] = useState("");
  const [Loading, setLoading] = useState(false);
  const Loader = () => {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="25" 
        cy="25" 
        r="20" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeDasharray="31.4 31.4"
      >
        <animateTransform 
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};


  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    }
    setTokenIsNotThere;
  });
  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere]);
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        dispatch(resetPostId());
      }
    };

    if (postState.postId !== "") {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [postState.postId, dispatch]);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);

  const handleUpload = async () => {
  setLoading(true);  // ✅ Set Loading to true when starting the upload
  try {
    await dispatch(createPost({
      token: localStorage.getItem("token"),
      file: fileContent,
      body: postContent
    }));
    console.log("Post sent successfully from dashboard");
    setPostContent("");
    setFileContent(null);
    await dispatch(getAllPosts());  // ✅ Optionally wait before finishing
  } catch (error) {
    console.error("Error posting:", error);
  } finally {
    setLoading(false);  // ✅ Set Loading to false after finishing
  }
};

  // useState(()=>{
  //   setInterval(()=>{
  //     dispatch(getAllPosts())
  //   },900)
  // })

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.scrollComponent}>
            {/* Create Post */}
            <div className={styles.createPostContainer}>
              <img style={{cursor:"pointer"}} onClick={()=>{router.push(`/view_profile/${authState.user.userId.username}`)}}
                className={styles.profilePic}
                src={authState.user.userId.profilePicture}
                alt="profile"
              />
              <textarea
                className={styles.postInput}
                onChange={(e) => setPostContent(e.target.value)}
                value={postContent}
                placeholder="What's on your mind?"
              ></textarea>
              <label htmlFor="fileUpload" className={styles.iconButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </label>
              <input
                type="file"
                id="fileUpload"
                hidden
                onChange={(e) => setFileContent(e.target.files[0])}
              />
              {postContent.length > 0 && (
                <button onClick={handleUpload} className={styles.uploadButton}>
                  {Loading? <Loader /> : "Post"}
                </button>
              )}
            </div>

            {/* Posts */}
            <div className={styles.postContainer}>
              {postState.posts.map((post) => (
                <div key={post._id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <img style={{cursor:"pointer"}} onClick={()=>{router.push(`/view_profile/${post.userId.username}`)}}
                      className={styles.profilePic}
                      src={post.userId.profilePicture}
                      alt="user"
                    />
                    <div className={styles.postUserInfo}>
                      <div className={styles.userTop}>
                        <p style={{cursor:"pointer"}} onClick={()=>{router.push(`/view_profile/${post.userId.username}`)}} className={styles.userName}>{post.userId.name}</p>
                        {post.userId._id === authState.user.userId._id && (
                          <button
                            onClick={async () => {
                              await dispatch(
                                deletePost({
                                  post_id: post._id,
                                  token: localStorage.getItem("token"),
                                })
                              );
                              await dispatch(getAllPosts());
                            }}
                            className={styles.deleteBtn}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21
                         c.342.052.682.107 1.022.166m-1.022-.165L18.16
                         19.673a2.25 2.25 0 0 1-2.244
                         2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772
                         5.79m14.456 0a48.108 48.108 0 0
                         0-3.478-.397m-12 .562c.34-.059.68-.114
                         1.022-.165m0 0a48.11 48.11 0 0
                         1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964
                         51.964 0 0 0-3.32 0c-1.18.037-2.09
                         1.022-2.09 2.201v.916m7.5 0a48.667
                         48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p style={{cursor:"pointer"}} onClick={()=>{router.push(`/view_profile/${post.userId.username}`)}} className={styles.userHandle}>
                        @{post.userId.username}
                      </p>
                    </div>
                  </div>

                  <p className={styles.postBody}>{post.body}</p>

                  {post.media && (
                    <div className={styles.postMedia}>
                      <img src={post.media} alt="post media" />
                    </div>
                  )}
                  <div className={styles.optionsContainer}>
                    <div
                      onClick={async () => {
                        await dispatch(
                          incrementPostLike({ post_id: post._id })
                        );
                        dispatch(getAllPosts());
                      }}
                      className={styles.SingleOption_optionsContainer}
                    >
                      <div className={styles.LikeButton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                          />
                        </svg>
                      </div>
                      <p style={{ color: "black" }}>{post.likes}</p>
                    </div>
                    <div
                      onClick={() => {
                        dispatch(getAllComments({ post_id: post._id }));
                      }}
                      className={styles.SingleOption_optionsContainer}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                      </svg>
                    </div>
                    <div
                      onClick={() => {
                        const text = encodeURIComponent(post.body);
                        const url = encodeURIComponent("apnaCollege.in");
                        const twitterURL = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                        window.open(twitterURL, "_blank");
                      }}
                      className={styles.SingleOption_optionsContainer}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {postState.postId !== "" && (
              <div
                onClick={() => {
                  dispatch(resetPostId());
                }}
                className={styles.commentsContainer}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={styles.allCommentsContainer}
                >
                  {postState.comments.length === 0 && <h2>No Comments</h2>}
                  {postState.comments.length > 0 && <h2>Comments</h2>}
                  {postState.comments.length > 0 && postState.comments.map((comment) => (
                    <div key={comment._id} className={styles.singleComment}>
                      <img src={`${Base_URL}/${comment.userId.profilePicture}`} alt="" />
                      <div>
                        <p style={{ fontWeight: "bold" }}>{comment.userId.name}</p>
                        <p>{comment.body}</p>
                      </div>
                    </div>
                  ))}
                  <div className={styles.postCommentContainer}>
                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="comment" />
                    <div onClick={async ()=>{
                      await dispatch(postComment({post_id:postState.postId,body:commentText}))
                      await dispatch(getAllComments({ post_id: postState.postId }));
                      setCommentText("");
                    }} className={styles.postCommentContainer_button}>
                      <p>Comment</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.scrollComponent}>Loading...</div>
        </DashboardLayout>
      </UserLayout>
    );
  }
}

export default Dashboard;
