'use client'
import CattleForm from "@/components/CattleForm";
import { Farms, Location } from "@/components/Icons";
import { useUser } from "@clerk/nextjs";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "aspect-ui/Button";
import { Divider } from "aspect-ui/Divider";
import { Input } from "aspect-ui/Input";
import { Sidebar, SidebarContainer, SidebarFooter, SidebarHeader, SidebarItem } from "aspect-ui/Sidebar";
import { Spinner } from "aspect-ui/Spinner";
import { Typography } from "aspect-ui/Typography";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter()
  const { user } = useUser();
  console.log(user)

  const [userData, setUserData] = useState(null);
  const [farm, setFarm] = useState({ name: "", location: "" });
  const [farms, setFarms] = useState([]);
  const [farmsSpinner, setFarmsSpinner] = useState<boolean>(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [cattles, setCattles] = useState(null);

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

  console.log(userData)

  useEffect(() => {
    if (userData) {
      const owner = userData[0]
      const fetchFarms = async () => {
        try {
          setFarmsSpinner(true)
          const res = await fetch(`/api/get-farms?owner_id=${owner?.id}`)
          const farmsData = await res.json()
          setFarms(farmsData)
          setFarmsSpinner(false)
        }
        catch (err) {
          console.error("Error in fetch farms:", err);
        }
      }

      fetchFarms()
    }
  }, [userData]);

  const handleSubmit = async (data) => {
    // Format dates to 'YYYY-MM-DD' before sending
    const formattedData = {
      ...data,
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : null,
      purchase_date: data.purchase_date ? new Date(data.purchase_date).toISOString().split('T')[0] : null,
    };

    try {
      const res = await fetch(`/api/cattle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      if (!res.ok) throw new Error("Failed to create cattle");

      const cattleData = await res.json();
      console.log("Cattle created successfully:", cattleData);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    }
  };
  useEffect(() => {
    if (selectedFarm?.id) {
      const fetchCattle = async () => {
        try {
          const res = await fetch(`/api/cattle?farm_id=${selectedFarm.id}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch cattle: ${res.statusText}`);
          }
          const cattleData = await res.json();
          console.log(cattleData)
          setCattles(cattleData);
        } catch (err) {
          console.error("Error in fetchCattle:", err);
          // Optional: Handle UI feedback, e.g., show an error message
        }
      };
      fetchCattle();
    }
  }, [selectedFarm?.id]);

  console.log(cattles)

  if (!user) {
    return <div>Please log in.</div>;
  }
  console.log(userData)
  console.log(farm)
  console.log(farms)
  console.log(selectedFarm)

  return (
    <div className="flex gap-4">
      <Sidebar className="px-0">
        <SidebarHeader className="text-h3 px-4">
          Cattle Farm
        </SidebarHeader>
        <SidebarContainer className="px-4">
          <SidebarItem>Dashboard</SidebarItem>
          <SidebarItem>Farms</SidebarItem>
          <Divider />
          <div className="max-h-[100px] overflow-y-scroll light-scrollbar pr-3">
            {farmsSpinner && <Spinner />}
            {farms && farms.map((farm) => <SidebarItem key={farm.id} onClick={() => {
              // setSelectedFarm(farm)
              router.push(`/dashboard/farm/${farm.id}`)
              }} className="capitalize flex items-center">{farm.name} <span className="text-xs">[{farm.cattleList.length}]</span></SidebarItem>)}
          </div>
        </SidebarContainer>
        <SidebarFooter className="flex justify-between items-center w-full px-4">
          <div className="flex-1">
            <Typography>{userData && userData[0].name}</Typography>
            <Typography variant="caption" className="text-ellipsis overflow-hidden">{userData && userData[0].email}</Typography>
          </div>
          <ArrowRightStartOnRectangleIcon className="size-5" />
          {/* <pre>{userData}</pre> */}
        </SidebarFooter>
      </Sidebar>
      {/* Sidebar */}
      {/* <nav className="w-1/4 bg-gray-100 h-screen p-4">
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard">Dashboard Home</Link>
          </li>
          <li>
            <Link href="/dashboard/farms">Farms</Link>
          </li>
        </ul>
      </nav> */}
      <main className="flex-1 px-6 pt-4">
        <h1>Your Farms</h1>
        {/* <p>Your role: {role || "Loading..."}</p> */}
        {farmsSpinner && (
          <Spinner />
        )}
        {!selectedFarm && (<>
          <div className="flex flex-wrap gap-4 my-6">
            {farms && farms.map((farm) => <div className="border p-4 min-w-[200px] max-w-[240px] rounded-lg shadow-lg bg-primary-200 dark:bg-primary-900 text-primary-900 dark:text-primary-200 cursor-pointer" key={farm.id} onClick={() => setSelectedFarm(farm)}>
              <div className="flex items-center gap-2">
                <Farms />
                <h3 className="text-2xl capitalize text-ellipsis overflow-hidden whitespace-nowrap">{farm.name}</h3>
              </div>
              <p className="flex items-center gap-2 text-sm"><Location /> {farm.location}</p>
            </div>)}
          </div>
          <div className="border">
            <Input value={farm.name} onChange={(event: ChangeEvent<HTMLInputElement>) => setFarm({
              ...farm,
              name: (event.target as HTMLInputElement).value
            })} />
            <Input value={farm.location} onChange={(event: ChangeEvent<HTMLInputElement>) => setFarm({
              ...farm,
              location: (event.target as HTMLInputElement).value
            })} />
            <Button onClick={async () => {
              const res = await fetch(`/api/get-farm`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: farm.name,
                  location: farm.location,
                  owner_id: userData[0].id
                }),
              });
              const data = await res.json();
              console.log(data)
            }}>Add Farm</Button>
          </div></>)}
        {selectedFarm && (<>
          <h3>{selectedFarm.name}</h3>
          <CattleForm onSubmit={handleSubmit} farm_id={selectedFarm.id} />
          {cattles && cattles.map((cattle) => <React.Fragment key={cattle.breed}></React.Fragment>)}
        </>)}
      </main>
    </div>
  );
};

export default Dashboard;
