"use client"
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./store/slices/authSlice";
import Loader from "@/components/Loader";

export default function Home() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
      async function getUser(){
        const res = await axios.get('/api/auth/get-user')
        const user = res.data?.user || null
        return user
      }

      const fetchUserData = async () => {
        const userData = await getUser()
        dispatch(setUser(userData))
        console.log(userData)
      }
      fetchUserData()
      setLoading(false)
  }, [])

  if(loading) return <Loader/>
  else
    return (
    <div>Home</div>
  );
}
