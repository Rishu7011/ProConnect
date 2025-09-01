import { getAboutUser, getAllUsers } from "../../config/redux/action/authAction";
import DashboardLayout from "../../layout/DashboardLayout";
import UserLayout from "../../layout/UserLayout";
import styles from "./styles.module.css";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Base_URL } from "../../config";
import { getAllPosts } from "../../config/redux/action/postAction";
import { useRouter } from "next/router";
export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

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

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover</h1>
          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched &&
              authState.all_users.map((user) => {
                return (
                  <div onClick={()=>{router.push(`/view_profile/${user.userId.username}`)}} key={user._id} className={styles.userProfile}>
                    <img
                      src={user.userId.profilePicture}
                      alt="profile"
                    />
                    <h2>{user.userId.name}</h2>
                    <p>{user.userId.username}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
