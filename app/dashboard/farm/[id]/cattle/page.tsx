'use client'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const CattleList = () => {
  const { id } = useParams();
  const [cattles, setCattles] = useState(null) // Initialize cattles
  useEffect(() => {
    const fetchCattles = async () => {
      try {
        const res = await fetch(`/api/cattle?farm_id=${id}`)
        const cattleData = await res.json()
        console.log(cattleData) // Log the response data
        setCattles(cattleData)
      } catch (err) {
        console.error('Error in fetchCattles:', err)
        // Optional: Handle UI feedback, e.g., show an error message
      }
    }
    fetchCattles()
  }, [id])
  return (
    <div>
      {cattles && cattles.map((cattle) => (
        <div className="border p-4 flex gap-4" key={cattle.id} onClick={() => { window.location.href = `/dashboard/farms/${id}/cattle/${cattle.id}` }}>
          <h2 className="text-lg font-semibold">{cattle.breed}</h2>
          <p className="font-bold">{cattle.gender}</p>
          <p className="font-bold">{cattle.dob}</p>
          <p className="font-bold">{cattle.purchase_date ?? "--"}</p>
          <p className="font-bold">{cattle.purchase_price ?? "--"}</p>
          <p className="font-bold">{cattle.status}</p>
        </div>
      ))}
    </div>
  )
}

export default CattleList