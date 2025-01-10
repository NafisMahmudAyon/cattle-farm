'use client'
import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useUser();

  // const [role, setRole] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchUserRole = async () => {
  //     if (user) {
  //       try {
  //         const res = await fetch(`/api/get-user-role?clerk_user_id=${user.id}`);
  //         const data = await res.json();
  //         setRole(data.role);
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     }
  //   };
  //   fetchUserRole();
  // }, [user]);

  if (!user) {
    return <div>Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      {/* <p>Your role: {role || "Loading..."}</p> */}
    </div>
  );
};

export default Dashboard;
