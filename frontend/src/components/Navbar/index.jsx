// import React from "react";
// import { useRouter } from "next/router";
// import styles from "./styles.module.css";
// import { useDispatch, useSelector } from "react-redux";

// function NavBarComponent() {
//   const router = useRouter();

//   const authState = useSelector((state) => state.auth);
//   const dispatch = useDispatch()

//   return (
//     <div className={styles.container}>
//       <nav className={styles.Navbar}>
//         <div className={styles.Navbar_left_Component}>
//           <h1>Pro Connect</h1>
//         </div>
//         <div className={styles.Navbar_right_Component}>
//           {authState.profileFetched && (
//             <div style={{display:"flex",gap:"1.2rem"}}>
//               <p>Hey, {authState?.user?.userId?.name || "User"}</p>
//               <p style={{fontWeight:"bold",cursor:"pointer"}}>Profile</p>
//               <p onClick={()=>{
//                 localStorage.removeItem("token")
//                 router.push('/login')
//                 dispatch(reset())
//               }}
//                style={{fontWeight:"bold",cursor:"pointer"}}>Logout</p>
//             </div>
//           )}
//           {!authState.profileFetched && (
//             <div
//               onClick={() => {
//                 router.push("/login");
//               }}
//               className={styles.navbar_option_container}
//             >
//               <p>login</p>
//             </div>
//           )}
//         </div>
//       </nav>
//     </div>
//   );
// }

// export default NavBarComponent;
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { reset } from "@/config/redux/reducer/authReducer";

function NavBarComponent() {
  const router = useRouter();
  const disPatch = useDispatch()
  const authState = useSelector((state) => state.auth);
  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h1
          style={{ cursor: "pointer" }}
          onClick={() => {
            router.push("/");
          }}
        >
          Pro Connect
        </h1>

        <div className={styles.navBarOptionCOntainer}>
          {authState.profileFetched && (
            <div>
              <p>hey,{authState.user.userId.name}</p>
              <p onClick={()=>{
                router.push("/profile")
              }}>profile</p>
              <p style={{ fontWeight: "bold", cursor: "pointer" }} onClick={()=>{
                localStorage.removeItem("token")
                 router.push("/login")
                 disPatch(reset())
              }}>Logout</p>
            </div>
          )}




          {!authState.profileFetched && (
            <div
              onClick={() => {
                router.push("/login");
              }}
            >
              be a part
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default NavBarComponent;
