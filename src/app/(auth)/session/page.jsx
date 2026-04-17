"use client";

import React, {useEffect} from 'react'
import { useAuthStore } from '@/store/Auth';
import { redirect } from 'next/navigation';
import { LoaderOne } from '@/components/ui/loader';
import { account, avatars} from '@/models/client/config';
import axios from "@/lib/axios";

function setSession() {
    let {setSession} = useAuthStore()

    const setAuth = async ()=>{
        try {
            const userData = await account.get();
            const sessionData = await account.getSession('current');
            const jwtData = await account.createJWT()

            console.log(sessionData, userData, jwtData);
            
            setSession(sessionData, userData, jwtData.jwt)


            const ID = userData.$id
            const name = userData.name
            const email = userData.email
            // console.log(ID);
            

            const checkUser = await axios.put("/api/user", {ID})
            // console.log(checkUser);
            

            if(checkUser.data.exists){
              console.log("user row exists");
            }else{
              console.log("user not exists");

              const avatar = avatars.getInitials({
                name: name,
                width: 100,
                height: 100,
                background: "148F24",
              })
              
              const response = await axios.post("/api/user/register", {ID, name, email, avatar})

              console.log("user row created successfully",response.data);
            }


            return redirect("/")
        } catch (error) {
            console.error("Auth setup failed:", error);
            // Redirect to login with error
            return redirect("/login?error=Authentication failed. Please try again.");
        }
    }

    useEffect(() => {
        setAuth()
    }, []);
  return (
    <div className='h-screen flex items-center justify-center'>
      <LoaderOne/>
    </div>
  )
}

export default setSession
