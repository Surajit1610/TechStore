"use client";

import React, {useEffect} from 'react'
import { useAuthStore } from '@/store/Auth';
import { redirect } from 'next/navigation';
import { LoaderOne } from '@/components/ui/loader';
import { account } from '@/models/client/config';
import axios from 'axios';

import { userTable, db } from "@/models/name";
import { tablesDB, users } from "@/models/server/config";


function setSession() {
    let {setSession} = useAuthStore()

    const setAuth = async ()=>{
        const userData = await account.get();
        const sessionData = await account.getSession('current');
        const jwtData = await account.createJWT()

        console.log(sessionData, userData, jwtData);
        
        setSession(sessionData, userData, jwtData)


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
          
          const response = await axios.post("/api/user", {ID, name, email})

          console.log("user row created successfully",response.data);
        }


        return redirect("/")
    }

    useEffect(() => {
        setAuth()
    }, []);
  return (
    <div>
      <LoaderOne/>
    </div>
  )
}

export default setSession
