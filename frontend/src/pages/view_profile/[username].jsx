import { Base_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getAboutUser,
  getAllUsers,
  getConnectionRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.posts);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionRequest({ token: localStorage.getItem("token") })
    );
    await dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    console.log("connections:", authState.connections);
    if(authState.connections.some(user=>user.connectionId._id ===userProfile.userId._id)){
      setIsCurrentUserInConnection(true);
      if (authState.connections.find(user=>user.connectionId._id ===userProfile.userId._id).status_accepted === true) {
        setIsConnectionNull(false);
      } 
    }
    if(authState.connectionRequest.some(user=>user.userId._id ===userProfile.userId._id)){
      setIsCurrentUserInConnection(true);
      if (authState.connectionRequest.find(user=>user.userId._id ===userProfile.userId._id).status_accepted === true) {
        setIsConnectionNull(false);
      } 
    }
  }, [authState.connections,authState.connectionRequest]);

  useEffect(() => {
    getUserPost();
  }, []);

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);
  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere]);

  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("from View:View Profile");
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDropImage}
              src={`${Base_URL}/${userProfile.userId.profilePicture}`}
            />
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
                    <h2>{userProfile.userId.name}</h2>
                    <p style={{ color: "gray" }}>
                      @{userProfile.userId.username}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                    }}
                  >
                    {isCurrentUserInConnection ? (
                      <button className={styles.connectedButton}>
                        {isConnectionNull ? "pending" : "Connected"}
                      </button>
                    ) : (
                      <button
                        className={styles.connectedBtn}
                        onClick={() => {
                          dispatch(
                            sendConnectionRequest({
                              token: localStorage.getItem("token"),
                              user_Id: userProfile.userId._id,
                            })
                          );
                        }}
                      >
                        Connect
                      </button>
                    )}
                    <div
                      onClick={async () => {
                        const response = await clientServer.get(
                          `/user/download_resume?id=${userProfile.userId._id}`
                        );
                        window.open(
                          `${Base_URL}/${response.data.file}`,
                          "_blank"
                        );
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <svg
                        style={{ width: "1.5em", height: "1.5em" }}
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
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <p>{userProfile.bio}</p>
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
                                src={`${Base_URL}/${post.media}`}
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
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default ViewProfilePage;

export async function getServerSideProps(context) {
  console.log(context.query.username);
  const request = await clientServer.get(
    "/user/get_profile_based_on_username",
    {
      params: {
        username: context.query.username,
      },
    }
  );
  const response = await request.data;
  console.log(response);
  return { props: { userProfile: request.data.profile } };
}
