import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  return (
    <UserLayout className={styles.image_container}>
      <div className={styles.container}>
        <div className={styles.maincontainer}>
          <div className={styles.maincontainerleft}>
            <p>Connect with friends without Exaggeration</p>
            <p>A true social meadia platform, with stories no blufs !</p>
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <p>Join Now</p>
            </div>
          </div>
          <div className={styles.maincontainerright}>
            <img
              src="https://static.licdn.com/aero-v1/sc/h/dxf91zhqd2z6b0bwg85ktm5s4"
              width={"80%"}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
