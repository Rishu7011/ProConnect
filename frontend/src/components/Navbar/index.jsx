import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { reset } from "../../config/redux/reducer/authReducer";

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
