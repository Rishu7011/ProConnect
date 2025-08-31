import { store } from "../config/redux/store.js";
// import UserLayout from "@/layout/UserLayout";
import "@/styles/globals.css";
import { Provider } from "react-redux";


export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps}
       />
      
    </Provider>
    
  )
}
