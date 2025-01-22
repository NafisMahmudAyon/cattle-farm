"use client";

import QRCodeGenerator from "@/components/QRCodeGenerator";
import { supabase } from "@/components/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { ArrowRightStartOnRectangleIcon, PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, DatePicker, Input, Modal, ModalAction, ModalContent, TabContent, TabItem, TabList, Tabs } from "aspect-ui";
import { Divider } from "aspect-ui/Divider";
import { Sidebar, SidebarContainer, SidebarFooter, SidebarHeader, SidebarItem } from "aspect-ui/Sidebar";
import { Spinner } from "aspect-ui/Spinner";
import { Table, TableBody, TableCell, TableHeadCell, TableHeader, TableRow } from "aspect-ui/Table";
import { Typography } from "aspect-ui/Typography";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Cattle {
  id: string;
  breed: string;
  gender: string;
  dob: string;
  purchase_date: string | null;
  purchase_price: number | null;
  status: string;
  name: string;
  nick_name: string;
  image_url: string;
}

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
}

interface HealthRecord {
  id: string;
  date: string;
  type: string;
  description: string;
}

interface ReproductiveRecord {
  id: string;
  breeding_date: string | null;
  calving_date: string | null;
  calf_gender: string | null;
}

interface MilkRecord {
  id: string;
  date: string;
  quantity: number;
}

interface CattleDetails {
  weightRecords: WeightRecord[];
  healthRecords: HealthRecord[];
  reproductiveRecords: ReproductiveRecord[];
  milkRecords: MilkRecord[];
}

export default function FarmDetailsPage() {
  const router = useRouter()
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const [cattles, setCattles] = useState<Cattle[]>([]);
  const [cattleSpinner, setCattleSpinner] = useState<boolean>(false);
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cattleDetails, setCattleDetails] = useState<CattleDetails>({
    weightRecords: [],
    healthRecords: [],
    reproductiveRecords: [],
    milkRecords: []
  });

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

  const [farm, setFarm] = useState({});
  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const res = await fetch(`/api/get-farm?id=${id}`);
        const farmData = await res.json();
        setFarm(farmData);
      } catch (err) {
        console.error("Error in fetchFarm:", err);
        // Optional: Handle UI feedback, e.g., show an error message
      }
    };
    fetchFarm();
  }, [id]);

  // const fetchCattles = async () => {
  //   try {
  //     setCattleSpinner(true);
  //     const res = await fetch(`/api/cattle?farm_id=${id}`);
  //     const cattleData = await res.json();
  //     console.log(cattleData);  // Log the response data
  //     setCattles(cattleData);
  //     setCattleSpinner(false);
  //   } catch (err) {
  //     console.error("Error in fetchCattles:", err);
  //     // Optional: Handle UI feedback, e.g., show an error message
  //   }
  // }
  // useEffect(() => {
  //   fetchCattles();
  // }, []);

  useEffect(() => {
    if (id) {
      loadCattle();
    }
  }, [id]);

  const loadCattle = async () => {
    const { data, error } = await supabase
      .from('cattle')
      .select('*')
      .eq('farm_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading cattle:', error);
      return;
    }

    setCattles(data || []);
  };

  const loadCattleDetails = async (cattleId: string) => {
    // Load weight records
    const { data: weightData } = await supabase
      .from('cattle_weight_records')
      .select('*')
      .eq('cattle_id', cattleId)
      .order('date', { ascending: false });

    // Load health records
    const { data: healthData } = await supabase
      .from('cattle_health_records')
      .select('*')
      .eq('cattle_id', cattleId)
      .order('date', { ascending: false });

    // Load reproductive records
    const { data: reproductiveData } = await supabase
      .from('reproductive_history')
      .select('*')
      .eq('cattle_id', cattleId)
      .order('breeding_date', { ascending: false });

    // Load milk records
    const { data: milkData } = await supabase
      .from('milk_production')
      .select('*')
      .eq('cattle_id', cattleId)
      .order('date', { ascending: false });

    setCattleDetails({
      weightRecords: weightData || [],
      healthRecords: healthData || [],
      reproductiveRecords: reproductiveData || [],
      milkRecords: milkData || []
    });
  };

  const [cattleEdit, setCattleEdit] = useState(null)
  const [editOn, setEditOn] = useState(false)

  useEffect(() => {
    if (cattleEdit) {
      setEditOn(true)
    }
  }, [cattleEdit]);

  const handleViewDetails = async (cattle: Cattle) => {
    setSelectedCattle(cattle);
    await loadCattleDetails(cattle.id);
    setShowDetailsModal(true);
  };

  console.log(cattleEdit)

  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createCattle, setCreateCattle] = useState(false);
  const [createCattleFormData, setCreateCattleFormData] = useState({
    farm_id: id, // Ensure `id` is defined in your component or passed as a prop
    breed: '',
    gender: 'Male',
    dob: '',
    name: '',
    nick_name: '',
    purchase_date: '',
    purchase_price: '',
    status: 'Active',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async (): Promise<string | null> => {
    if (!file) {
      alert('Please select a file first.');
      return null;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setUploadResult(result);
      return result.url; // Return the image URL
    } catch (error: any) {
      alert(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCattle = async (data: typeof createCattleFormData) => {
    const imageUrl = await handleUpload(); // Wait for the image upload to complete
    if (!imageUrl) {
      console.error('Image upload failed, cattle creation aborted.');
      return;
    }

    // Add the uploaded image URL to the cattle data
    const formattedData = {
      ...data,
      image_url: imageUrl, // Add the image URL here
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : null,
      purchase_date: data.purchase_date ? new Date(data.purchase_date).toISOString().split('T')[0] : null,
    };

    try {
      const res = await fetch(`/api/cattle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!res.ok) throw new Error('Failed to create cattle');

      const cattleData = await res.json();
      fetchCattles();
      setUploadResult(null);
      setCreateCattle(false);
      console.log('Cattle created successfully:', cattleData);
    } catch (err) {
      console.error('Error in handleCreateCattle:', err);
    }
  };

  const [newWeight, setNewWeight] = useState({ date: new Date().toISOString().split('T')[0], weight: '' });
  const [newHealth, setNewHealth] = useState({ date: new Date().toISOString().split('T')[0], type: '', description: '' });
  const [newReproductive, setNewReproductive] = useState({
    breeding_date: new Date().toISOString().split('T')[0],
    calving_date: new Date().toISOString().split('T')[0],
    calf_gender: ''
  });
  const [newMilk, setNewMilk] = useState({ date: new Date().toISOString().split('T')[0], quantity: '' });

  const handleAddRecord = async (type: string) => {
    if (!selectedCattle) return;

    try {
      switch (type) {
        case 'weight':
          await supabase.from('cattle_weight_records').insert({
            cattle_id: selectedCattle.id,
            date: newWeight.date,
            weight: parseFloat(newWeight.weight)
          });
          setNewWeight({ date: new Date().toISOString().split('T')[0], weight: '' });
          loadCattleDetails(selectedCattle.id);
          break;

        case 'health':
          await supabase.from('cattle_health_records').insert({
            cattle_id: selectedCattle.id,
            date: newHealth.date,
            type: newHealth.type,
            description: newHealth.description
          });
          setNewHealth({ date: new Date().toISOString().split('T')[0], type: '', description: '' });
          break;

        case 'reproductive':
          await supabase.from('reproductive_history').insert({
            cattle_id: selectedCattle.id,
            breeding_date: newReproductive.breeding_date || null,
            calving_date: newReproductive.calving_date || null,
            calf_gender: newReproductive.calf_gender || null
          });
          setNewReproductive({ breeding_date: new Date().toISOString().split('T')[0], calving_date: new Date().toISOString().split('T')[0], calf_gender: '' });
          break;

        case 'milk':
          await supabase.from('milk_production').insert({
            cattle_id: selectedCattle.id,
            date: newMilk.date,
            quantity: parseFloat(newMilk.quantity)
          });
          setNewMilk({ date: new Date().toISOString().split('T')[0], quantity: '' });
          break;
      }

      // await loadCattleDetails(cattleEdit.id);
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const convertToDate = (isoString: Date): string => {
    const date = isoString // Convert ISO string to Date object
    const year = date.getFullYear(); // Get year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based index, so add 1)
    const day = String(date.getDate()).padStart(2, '0'); // Get day

    return `${year}-${month}-${day}`;
  };


  return (
    <div className="flex gap-4 w-full max-w-screen">
      <Sidebar className="px-0">
        <SidebarHeader className="text-h3 px-4">
          Cattle Farm
        </SidebarHeader>
        <SidebarContainer className="px-4">
          <SidebarItem>Dashboard</SidebarItem>
          <SidebarItem>Farms</SidebarItem>
          <Divider />
          <div className="max-h-[100px] overflow-y-scroll light-scrollbar pr-3">
            {cattleSpinner && <Spinner />}
            {cattles && cattles.map((cattle) => <SidebarItem key={cattle.id} onClick={() => {
              // setSelectedcattle(cattle)
              router.push(`/dashboard/cattle/${cattle.id}`)
            }} className="capitalize flex items-center">{cattle.name}
              {/* <span className="text-xs">[{cattle.cattleList.length}]</span> */}
            </SidebarItem>)}
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

      <div className="flex-1 overflow-x-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{farm.name} Details</h1>
            <p>Here you can manage the farm and its data.</p>
          </div>
          <Button className="mt-4" onClick={() => { setCreateCattle(true) }}>Add New Cattle</Button>
        </div>
        {/* Cattle Register Form */}
        {createCattle && (
          <Modal isOpenExternal={createCattle}>
            {/* <ModalAction>Open Modal</ModalAction> */}
            <ModalContent>
              <div className='border p-4 rounded-md bg-primary-100 text-primary-800'>
                <h2 className='mb-2 text-2xl font-bold'> Create Cattle Form</h2>
                <form className="p-6 bg-white shadow-md rounded">
                  <input type="text" placeholder="Cattle Name" name="name" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, name: e.target.value }))} />
                  <input type="text" placeholder="Nick Name" name="nick_name" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, nick_name: e.target.value }))} />
                  <input type="text" placeholder="Breed" name="breed" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, breed: e.target.value }))} />
                  <input type="date" placeholder="Date of Birth" name="dob" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, dob: e.target.value }))} />
                  <select name="gender" id="" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, gender: e.target.value }))}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <input type="date" placeholder="Purchase Date" name="purchase_date" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, purchase_date: e.target.value }))} />
                  <input type="number" placeholder="Purchase Price" name="purchase_price" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, purchase_price: e.target.value }))} />
                  <select name="status" id="" className="mb-4 w-full" onChange={(e) => setCreateCattleFormData((prev) => ({ ...prev, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4 w-full"
                  />
                  <Button className="mt-4" onClick={() => handleCreateCattle(createCattleFormData)}>Create Cattle</Button>
                </form>


                <ModalAction onClick={() => setCreateCattle(null)}>Close</ModalAction>
              </div>
            </ModalContent>
          </Modal>
        )}

        {/* {cattles && cattles.map((cattle) => (
          <div className="border p-4" key={cattle.id}>
            <h2 className="text-lg font-semibold">{cattle.breed}</h2>
            <p className="font-bold">{cattle.gender}</p>
            <p className="font-bold">{cattle.dob}</p>
            <p className="font-bold">{cattle.purchase_date ?? "--"}</p>
            <p className="font-bold">{cattle.purchase_price ?? "--"}</p>
            <p className="font-bold">{cattle.status}</p>
          </div>
        ))} */}
        <div className="relative overflow-x-auto w-full">
          <Table className="table-auto w-full">
            <TableHeader>
              <TableRow>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Breed</TableHeadCell>
                <TableHeadCell>Gender</TableHeadCell>
                <TableHeadCell>Date of Birth</TableHeadCell>
                {/* <TableHeadCell>Purchase Date</TableHeadCell>
                <TableHeadCell>Purchase Price</TableHeadCell> */}
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cattles && cattles.map((cattle) => (
                <TableRow key={cattle.id} className="hover:bg-primary-800 dark:hover:bg-primary-100">
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.name ?? '--'}</TableCell>
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.breed}</TableCell>
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.gender}</TableCell>
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.dob}</TableCell>
                  {/* <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.purchase_date ?? "--"}</TableCell>
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.purchase_price ?? "--"}</TableCell> */}
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{cattle.status}</TableCell>
                  <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>
                    <button
                      onClick={() => {
                        handleViewDetails(cattle)
                      }}
                      className="text-green-600 hover:text-green-300 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => { //handleDelete(cattle.id)
                      }}
                      className="text-red-600 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {showDetailsModal && selectedCattle && (
          <Modal isOpenExternal={showDetailsModal ?? false}>
            {/* <ModalAction>Open Modal</ModalAction> */}
            <ModalContent>
              <div className='border p-4 rounded-md bg-primary-100 text-primary-800'>
                <h2 className='mb-2 text-2xl font-bold'>{selectedCattle.name ?? 'Cattle'} Details</h2>
                <Tabs defaultActive='item-1' className='mx-auto'>
                  <TabList className="border-b border-primary-200">
                    <TabItem id='item-1' className="text-body2 text-nowrap" activeClassName="border-b border-primary-600 rounded-b-none ">General</TabItem>
                    <TabItem id='item-2' className="text-body2 text-nowrap" activeClassName="border-b border-primary-600 rounded-b-none ">Weight Records</TabItem>
                    <TabItem id='item-3' className="text-body2 text-nowrap" activeClassName="border-b border-primary-600 rounded-b-none ">Health Records</TabItem>
                    <TabItem id='item-4' className="text-body2 text-nowrap" activeClassName="border-b border-primary-600 rounded-b-none ">Reproductive Records</TabItem>
                    <TabItem id='item-5' className="text-body2 text-nowrap" activeClassName="border-b border-primary-600 rounded-b-none ">Milk Records</TabItem>
                  </TabList>
                  <TabContent id='item-1'>
                    {/* {cattleEdit.cattle.id} */}
                    <div className="relative">
                      <div className="flex gap-4 justify-start items-start">
                        <div>
                          <Image src={selectedCattle.image_url ?? "https://picsum.photos/200"} alt={selectedCattle.name ?? "Cattle"} width={150} height={150} quality={75} className="p-2 bg-primary-900 dark:bg-primary-100 rounded-lg shadow-md" />
                          <QRCodeGenerator id={selectedCattle.id} />
                        </div>
                        <div className="">
                          <h3><strong>Name: </strong>{selectedCattle.name ?? "unknown"} - ({selectedCattle.nick_name ?? ""})</h3>
                          <p><strong>Gender: </strong>{selectedCattle.gender}</p>
                          <p><strong>Breed: </strong>{selectedCattle.breed}</p>
                          <p><strong>Date of Birth: </strong>{selectedCattle.dob}</p>
                          <p><strong>Purchase Date: </strong>{selectedCattle.purchase_date}</p>
                          <p><strong>Purchase Price: </strong>{selectedCattle.purchase_price}</p>
                          <p><strong>Status: </strong>{selectedCattle.status}</p>
                        </div>
                      </div>
                    </div>
                  </TabContent>
                  <TabContent id='item-2'>
                    <div>
                      <h3>Add Weight Records</h3>
                      <div className="mt-2 flex gap-4">
                        <DatePicker initialDates={newWeight.date ? [new Date(newWeight.date)] : []} onChange={(e) => { console.log(e); 
                          //getting e [
//     "2025-01-14T18:00:00.000Z"
// ]
// make this into a string
                          const date = convertToDate(e[0]);
                          setNewWeight({ ...newWeight, date: date }) }} />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Weight (kg)"
                          value={newWeight.weight}
                          onChange={(e) => setNewWeight({ ...newWeight, weight: e.target.value })}
                          className="text-primary-800 dark:text-primary-200 border-primary-500 bg-primary-200 dark:bg-primary-800 outline-none focus-visible:outlined ps-4"
                          icon={false}
wrapperClassName="mb-0"
                        />
                        <button
                          onClick={() => handleAddRecord('weight')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" /> Add
                        </button>
                      </div>
                      <Table className="mt-4">
                        <TableHeader>
                          <TableRow className="bg-primary-800 dark:bg-primary-100 hover:bg-primary-800 dark:hover:bg-primary-100">
                            <TableHeadCell className="bg-transparent dark:bg-transparent text-primary-100">Date</TableHeadCell>
                            <TableHeadCell className="bg-transparent dark:bg-transparent text-primary-100">Weight</TableHeadCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cattleDetails.weightRecords.map((record, index) => (
                            <TableRow key={index} className="bg-primary-800 dark:bg-primary-100 hover:bg-primary-800 dark:hover:bg-primary-100">
                              <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{record.date}</TableCell>
                              <TableCell className='whitespace-nowrap text-primary-200 dark:text-primary-900'>{record.weight}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabContent>
                  <TabContent id='item-3'>Blog content goes here...</TabContent>
                  <TabContent id='item-4'>Github content goes here...</TabContent>
                  <TabContent id='item-5'>Github content goes here...</TabContent>
                </Tabs>

                <ModalAction onClick={() => setShowDetailsModal(false)}>Close</ModalAction>
              </div>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
}
