"use client"
import React from 'react'

function page() {
    const handleClick = ()=>{
        console.log("hello")
    }
  return (
    <div onClick={handleClick}>click</div>
  )
}

export default page