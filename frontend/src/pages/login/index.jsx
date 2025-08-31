import UserLayout from "@/layout/UserLayout";
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { EmptyMessage } from "@/config/redux/reducer/authReducer";

function Login() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const [userLoginMethod, setUserLoginMethod] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🙈 state
  const disPath = useDispatch();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);
  useEffect(()=>{
    disPath(EmptyMessage())
  },[userLoginMethod])
  useEffect(()=>{
    if(localStorage.getItem("token")){
      router.push("/dashboard")
    }
  },[])

  const handleRegister = () => {
    // handle register logic here
    console.log("registering...");
    disPath(registerUser({ username, email, password, name }));
  };

  const handleLogin =() => {
    console.log("login ....")
    disPath(loginUser({email,password}))
  }
  return (
    <>
      <div className={styles.container}>
        <div className={styles.card_container}>
          <div className={styles.card_container_left}>
            <p className={styles.cardleft_heading}>
              {userLoginMethod ? "Sign in" : "Sign Up"}
            </p>
            <p style={{ color: authState.isError ? "red" : "green" }}>
              {authState.message.message}
            </p>
            <div className={styles.input_Containers}>
              {!userLoginMethod && <div className={styles.input_row}>
                <input
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  className={styles.inputField}
                  type="text"
                  placeholder="Username"
                />
                <input
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className={styles.inputField}
                  type="text"
                  placeholder="Name"
                />
              </div>}
              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className={styles.inputField}
                type="email"
                placeholder="Email"
              />

              {/* 👁️ Password field with toggle */}
              <div className={styles.passwordContainer}>
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className={styles.inputField}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                />
                <span
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>

              <button
                onClick={() => {
                  if (userLoginMethod){
                    handleLogin()
                  }else{
                    handleRegister();
                  }
                }}
                className={styles.Button_withOutline}
              >
                {userLoginMethod ? "Sign in" : "Sign Up"}
              </button>
            </div>
            <br/>
            <div onClick={()=>{
              setUserLoginMethod(!userLoginMethod)
            }} className={styles.login_toggle_text}>
              <p>{!userLoginMethod ? "Already have an account ?" : "For new user"}</p>
            </div>
          </div>
          
          <div className={styles.card_container_right}>

          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
