'use client'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'


const SingleCattle = () => {
  const { cattle_id } = useParams();
  const [cattleData, setCattleData] = useState(null);
  useEffect(() => {
    const fetchCattle = async () => {
      try {
        const res = await fetch(`/api/cattle/${cattle_id}`)
        const cattleData = await res.json()
        // console.clear()
        // console.table(cattleData) // Log the response data
        setCattleData(cattleData)
        // if(cattleData){
        //   try {
        //     const res = await fetch(`/api/cattle-health?id=${cattle_id}`)
        //     const cattleHealthData = await res.json()
        //     // console.log(cattleHealthData) // Log the response data
        //     const weight = await fetch(`/api/cattle-weight?id=${cattle_id}`)
        //     const weightData = await weight.json()
        //     // console.log(weightData) // Log the response data
        //     const milk = await fetch(`/api/cattle-milk?id=${cattle_id}`)
        //     const milkData = await milk.json()
        //     // console.log(milkData) // Log the response data
        //     const reproductiveHistory = await fetch(`/api/cattle-reproductive-history?id=${cattle_id}`)
        //     const reproductiveData = await reproductiveHistory.json()
        //     // console.log(reproductiveData) // Log the response data
        //     setCattleData({ ...cattleData, cattleHealthData, weightData, milkData, reproductiveData })
        //   }
        //   catch (err) {
        //     console.error('Error in fetchCattle:', err)
        //     // Optional: Handle UI feedback, e.g., show an error message
        //   }
        // }
      } catch (err) {
        console.error('Error in fetchCattle:', err)
        // Optional: Handle UI feedback, e.g., show an error message
      }
    }
    fetchCattle()
  }, [cattle_id])
// console.clear()
  console.table(cattleData)

  return (
    <div>
      {cattleData && <pre>{JSON.stringify(cattleData, null, 2)}</pre>}
      {cattleData && <>
      <div className='flex items-center gap-3'>
        <p>Breed: {cattleData.cattle.breed}</p>
        <p>Gender: {cattleData.cattle.gender}</p>
        <p>Date of Birth: {cattleData.cattle.dob}</p>
      </div>
      </>}
    </div>
  )
}

export default SingleCattle