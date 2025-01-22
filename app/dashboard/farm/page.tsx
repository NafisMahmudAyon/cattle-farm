'use client'
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const page = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [farms, setFarms] = useState([]);
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && user.primaryEmailAddress) {
        try {
          const res = await fetch(`/api/get-user?clerk_user_id=${user.id}`);
          const getUserData = await res.json();
          setUserData(getUserData);

          if (getUserData.length === 0) {
            // User does not exist, insert into the database
            const postRes = await fetch(`/api/get-user`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                clerk_user_id: user.id,
                email: user.primaryEmailAddress.emailAddress,
                name: user.fullName,
                first_name: user.firstName,
                last_name: user.lastName,
              }),
            });

            const postData = await postRes.json();
            console.log("Inserted user:", postData);

            if (!postRes.ok) {
              throw new Error(postData.message || "Failed to add user");
            }
          } else {
            console.log("User found:", getUserData);
          }
        } catch (err) {
          console.error("Error in fetchUserRole:", err);
        }
      }
    };

    fetchUserRole();
  }, [user]);
  console.log(user)
  useEffect(() => {
    if (userData) {
      const owner = userData[0]
      const fetchFarms = async () => {
        try {
          const res = await fetch(`/api/get-farm?owner_id=${owner?.id}`)
          const farmsData = await res.json()
          setFarms(farmsData)
        }
        catch (err) {
          console.error("Error in fetch farms:", err);
        }
      }

      fetchFarms()
    }
  }, [userData]);
  return (
    <div>
      {farms.map((farm) => (
        <div key={farm.id}>
          <h2><Link href={`/dashboard/farms/${farm.id}`}>{farm.name}</Link></h2>
          <p>{farm.location}</p>
        </div>
      ))}
    </div>
  )
}

export default page