"use client";

import React from "react";
import Navbar from "@/components/Navbar";


const Layout = ({children}: {children: React.ReactNode}) => {
    
  return (
    <div className="">
      <div className="">
        <Navbar/>
        {children}
      </div>
    </div>
  )
}


export default Layout
