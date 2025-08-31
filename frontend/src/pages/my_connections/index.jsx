import { Base_URL } from "@/config";
import { AcceptConnection, getAboutUser, getAllUsers, getMyConnectionRequests } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.css"
import { useRouter } from "next/router";

export default function MyConnectionPage() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }))
  },[])
  useEffect(() => {
    if(authState.connectionRequest !=0){
      console.log(authState.connectionRequest)
    }else{
      console.log("No connection requests")
    }

  },[authState.connectionRequest])

  // useEffect(() => {
  //   if (!authState.all_profiles_fetched) {
  //     dispatch(getAllUsers());
  //   }
    
  // }, [authState.all_profiles_fetched,dispatch]);
  //   useEffect(() => {
  //     if (authState.isTokenThere) {
  //       dispatch(getAllPosts());
  //       dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  //     }
  //     if (!authState.all_profiles_fetched) {
  //       dispatch(getAllUsers());
  //     }
  //   }, [authState.isTokenThere]);
  // useEffect(()=>{
  //   if (authState.profileFetched) {
  //     dispatch(getAboutUser());
  //   }
  // },[authState.profileFetched,dispatch])
  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{display:"flex",flexDirection:"column",gap:"1.7rem"}}>
          <h4>Connections</h4>
          <h1>{authState.connectionRequest.length ==0 && "No connection requests"}</h1>
          {authState.connectionRequest.length != 0 &&  authState.connectionRequest.filter((connection)=>connection.status_accepted === null).map((user,index)=>{
            return(
              <div onClick={()=>{
                router.push(`/view_profile/${user.userId.username}`)
              }} className={styles.userCard} key={index}>
                <div className={styles.profilePicture}><img src={`${Base_URL}/${user.userId.profilePicture}`} alt={user.userId.name} /></div>
                <div className={styles.userInfo}>
                  <h3>{user.userId.name}</h3>
                  <p>{user.userId.username}</p>
                </div>
                <button onClick={(e)=>{
                  e.stopPropagation();
                  dispatch(AcceptConnection({connectionId:user._id,token:localStorage.getItem("token"),action:"accept"}))
                }} className={styles.connectedButton}>Accept</button>
              </div>
            )
          })}
          <h4>My Network</h4>
          {authState.connectionRequest.filter((connection)=>connection.status_accepted !== null).map((user,index)=>{
            return(
              <div onClick={()=>{
                router.push(`/view_profile/${user.userId.username}`)
              }} className={styles.userCard} key={index}>
                <div className={styles.profilePicture}><img src={`${Base_URL}/${user.userId.profilePicture}`} alt={user.userId.name} /></div>
                <div className={styles.userInfo}>
                  <h3>{user.userId.name}</h3>
                  <p>{user.userId.username}</p>
                </div>
                
              </div>
            )
          })}

        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
