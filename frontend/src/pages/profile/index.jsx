import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./styles.module.css";
import { Base_URL, clientServer } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { use, useEffect, useState } from "react";
import { getAboutUser } from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
import { getAllPosts, profilePicture } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const postReducer = useSelector((state) => state.posts);
  const router = useRouter();
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });
  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });


  }
  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, []);
  useEffect(() => {
    if (authState.user != undefined) {
      setUserProfile(authState.user);
      let post = postReducer.posts.filter((post) => {
        return post.userId.username === authState.user.userId.username;
      });
      setUserPosts(post);
    }
  }, [authState.user, postReducer.posts]);

  const uploadProfilePicture = async (file) => {
    await dispatch( profilePicture({token: localStorage.getItem("token"), file: file}));
    await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    console.log("upload successful");
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });
    const response = await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };
  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile.userId && (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <div className={styles.backDrop}>
                <label
                  htmlFor="profilePictureUpload"
                  className={styles.backDrop_overlay}
                >
                  <p>Edit</p>
                </label>
                <input
                  onChange={(e) => uploadProfilePicture(e.target.files[0])}
                  style={{ display: "none" }}
                  type="file"
                  id="profilePictureUpload"
                />

                <img src={userProfile.userId.profilePicture} />
              </div>
            </div>
            <div className={styles.profileContainer}>
              <div className={styles.profileContainer_Details}>
                <div style={{ display: "flex", gap: "0.7rem" }}>
                  <div style={{ flex: "0.8" }}>
                    <div
                      style={{
                        display: "flex",
                        width: "fit-content",
                        alignItems: "center",
                        gap: "1.2rem",
                      }}
                    >
                      <input
                        className={styles.nameEdit}
                        type="text"
                        value={userProfile.userId.name}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            userId: {
                              ...userProfile.userId,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                      <p style={{ color: "gray" }}>
                        @{userProfile.userId.username}
                      </p>
                    </div>

                    <div>
                      <textarea className={styles.textareaBio}
                        value={userProfile.bio}
                        onChange={(e) => {
                          setUserProfile({ ...userProfile, bio: e.target.value })
                        }}
                        row={Math.max(3, Math.ceil(userProfile.bio.length / 80))}
                      />
                    </div>
                  </div>
                  <div style={{ flex: "0.2" }}>
                    <h3>Recent Activity</h3>
                    {userPosts.map((post) => {
                      return (
                        <div key={post._id} className={styles.postCard}>
                          <div className={styles.card}>
                            <div className={styles.card_profileContainer}>
                              {post.media !== "" ? (
                                <img
                                  src={post.media}
                                  alt="recent added"
                                />
                              ) : (
                                <div
                                  style={{ width: "3.4rem", height: "3.4rem" }}
                                ></div>
                              )}
                            </div>
                            <p>{post.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.workHistory}>
              <h4>Work History</h4>
              <div className={styles.WorkHistoryContainer}>
                {userProfile.pastWork.map((work, index) => {
                  return (
                    <div key={index} className={styles.workHistoryCard}>
                      <h5>
                        {work.company}-{work.position}
                      </h5>
                      <p>{work.years}</p>
                    </div>
                  );
                })}
                <button onClick={() => setIsModelOpen(true)} className={styles.addWorkBtn}>Add Work</button>
              </div>
            </div>
            {userProfile != authState.user && (
              <div
                onClick={() => {
                  updateProfileData();
                }}
                className={styles.updateProfileBtn}
              >
                Update Profile
              </div>
            )}
          </div>
        )}





        <div>
          {isModelOpen && (
            <div
              onClick={() => {
                setIsModelOpen(false);
              }}
              className={styles.commentsContainer}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={styles.allCommentsContainer}
              >
                <input onChange={handleWorkInputChange} name="company" className={styles.inputField} type="text" placeholder="Enter Company" />
                <input onChange={handleWorkInputChange} name="position" className={styles.inputField} type="text" placeholder="Enter Position" />
                <input onChange={handleWorkInputChange} name="years" className={styles.inputField} type="number" placeholder="Enter Years" />
                <button onClick={() => {
                  setUserProfile({ ...userProfile, pastWork: [...userProfile.pastWork, inputData] })
                  setIsModelOpen(false);
                }} className={styles.updateProfileBtn}>Add Work</button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
