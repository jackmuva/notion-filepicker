"use client";

import useParagon from "@/hooks/useParagon";
import { paragon } from "@useparagon/connect";
import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { NotionFilepicker } from "./notion-filepicker";

export default function Home() {
  const { paragonUser } = useParagon();
  const [user, setUser] = useState<{ allowed: boolean, email: string }>({ allowed: false, email: "" });
  const [picker, setPicker] = useState<boolean>(false);

  useEffect(() => {
    const handleSession = () => {
      getSession().then((loggedInUser: any) => {
        if (!loggedInUser) {
          sessionStorage.setItem("jwt", "");
          setUser({ allowed: false, email: "" });
        } else if (sessionStorage.getItem("jwt") && loggedInUser) {
          if (loggedInUser?.user?.email?.split("@")[1] === (process.env.NEXT_PUBLIC_AUTHORIZED_DOMAIN ?? "useparagon.com")) {
            setUser({ allowed: true, email: loggedInUser.user.email });
          } else {
            setUser({ allowed: false, email: loggedInUser?.user?.email ?? "" });
          }
        } else {
          if (loggedInUser?.user?.email) {
            fetch(process.env.NEXT_PUBLIC_AUTH_BACKEND ?? "", {
              method: 'POST',
              body: JSON.stringify({ email: loggedInUser.user.email }),
              headers: {
                'content-type': 'application/json'
              }
            }).then((res) => {
              res.json().then((body) => {
                sessionStorage.setItem("jwt", body.jwt);
                if (loggedInUser?.user?.email?.split("@")[1] === (process.env.NEXT_PUBLIC_AUTHORIZED_DOMAIN ?? "useparagon.com")) {
                  setUser({
                    allowed: true,
                    email: loggedInUser?.user?.email ?? ""
                  });
                } else {
                  setUser({
                    allowed: false,
                    email: loggedInUser?.user?.email ?? ""
                  });
                }
              })
            })
          }
        }
      });
    }
    handleSession();
  }, []);

  const toggleFilePicker = () => {
    setPicker((prev) => (!prev));
  }

  console.log(user);
  console.log(sessionStorage.getItem("jwt"));
  console.log(paragonUser)

  return (
    <div>
      <main className="flex flex-col gap-8 row-start-2 items-center w-screen min-h-screen justify-center">
        {(!user.allowed || !user.email) &&
          <button onClick={() => signIn("google")}
            className="text-black p-2 px-4 text-center flex bg-gray-200 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica']">
            <Image
              className="rounded-xl"
              src="/google-icon.png"
              alt="Google Logo"
              width={40}
              height={40}
              priority
            />
            <div>Sign in with Google</div>
          </button>
        }
        {(user.allowed && user.email) &&
          <button onClick={() => paragonUser.integrations['notion'].enabled ? toggleFilePicker() : paragon.connect("notion", {})}
            className="text-black p-2 px-4 text-center flex bg-gray-200 shadow-2xl rounded-2xl items-center space-x-2 font-['Helvetica']">
            <Image
              className="rounded-xl"
              src="/notion-logo.png"
              alt="Notion Logo"
              width={40}
              height={40}
              priority
            />
            <div>Connect Notion</div>
          </button>
        }
        {picker && <NotionFilepicker toggle={toggleFilePicker} />}
      </main>
    </div>
  );
}
