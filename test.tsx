import { ArrowLeft, Edit2, Eye, Plus, PlusCircle, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Cattle {
  id: string;
  breed: string;
  gender: string;
  dob: string;
  purchase_date: string | null;
  purchase_price: number | null;
  status: string;
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

export default function CattleManagement() {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [cattleDetails, setCattleDetails] = useState<CattleDetails>({
    weightRecords: [],
    healthRecords: [],
    reproductiveRecords: [],
    milkRecords: []
  });
  const [activeTab, setActiveTab] = useState('weight');
  const [formData, setFormData] = useState({
    breed: '',
    gender: 'Male',
    dob: '',
    purchase_date: '',
    purchase_price: '',
    status: 'Active'
  });

  // New record form states
  const [newWeight, setNewWeight] = useState({ date: '', weight: '' });
  const [newHealth, setNewHealth] = useState({ date: '', type: '', description: '' });
  const [newReproductive, setNewReproductive] = useState({
    breeding_date: '',
    calving_date: '',
    calf_gender: ''
  });
  const [newMilk, setNewMilk] = useState({ date: '', quantity: '' });

  useEffect(() => {
    if (farmId) {
      loadCattle();
    }
  }, [farmId]);

  const loadCattle = async () => {
    const { data, error } = await supabase
      .from('cattle')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading cattle:', error);
      return;
    }

    setCattle(data || []);
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

  const handleViewDetails = async (cattle: Cattle) => {
    setSelectedCattle(cattle);
    await loadCattleDetails(cattle.id);
    setShowDetailsModal(true);
  };

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
          setNewWeight({ date: '', weight: '' });
          break;

        case 'health':
          await supabase.from('cattle_health_records').insert({
            cattle_id: selectedCattle.id,
            date: newHealth.date,
            type: newHealth.type,
            description: newHealth.description
          });
          setNewHealth({ date: '', type: '', description: '' });
          break;

        case 'reproductive':
          await supabase.from('reproductive_history').insert({
            cattle_id: selectedCattle.id,
            breeding_date: newReproductive.breeding_date || null,
            calving_date: newReproductive.calving_date || null,
            calf_gender: newReproductive.calf_gender || null
          });
          setNewReproductive({ breeding_date: '', calving_date: '', calf_gender: '' });
          break;

        case 'milk':
          await supabase.from('milk_production').insert({
            cattle_id: selectedCattle.id,
            date: newMilk.date,
            quantity: parseFloat(newMilk.quantity)
          });
          setNewMilk({ date: '', quantity: '' });
          break;
      }

      await loadCattleDetails(selectedCattle.id);
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cattleData = {
      farm_id: farmId,
      breed: formData.breed,
      gender: formData.gender,
      dob: formData.dob,
      purchase_date: formData.purchase_date || null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      status: formData.status
    };

    const { error } = selectedCattle
      ? await supabase
        .from('cattle')
        .update(cattleData)
        .eq('id', selectedCattle.id)
      : await supabase
        .from('cattle')
        .insert([cattleData]);

    if (error) {
      console.error('Error saving cattle:', error);
      return;
    }

    setShowModal(false);
    setSelectedCattle(null);
    setFormData({
      breed: '',
      gender: 'Male',
      dob: '',
      purchase_date: '',
      purchase_price: '',
      status: 'Active'
    });
    loadCattle();
  };

  const handleEdit = (cattle: Cattle) => {
    setSelectedCattle(cattle);
    setFormData({
      breed: cattle.breed,
      gender: cattle.gender,
      dob: cattle.dob,
      purchase_date: cattle.purchase_date || '',
      purchase_price: cattle.purchase_price?.toString() || '',
      status: cattle.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cattle?')) return;

    const { error } = await supabase
      .from('cattle')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cattle:', error);
      return;
    }

    loadCattle();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Farms
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Cattle Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your farm&apos;s cattle inventory and records.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedCattle(null);
              setFormData({
                breed: '',
                gender: 'Male',
                dob: '',
                purchase_date: '',
                purchase_price: '',
                status: 'Active'
              });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Cattle
          </button>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Breed</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Gender</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date of Birth</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Purchase Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Purchase Price</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {cattle.map((cattle) => (
                      <tr key={cattle.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{cattle.breed}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{cattle.gender}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {new Date(cattle.dob).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {cattle.purchase_date ? new Date(cattle.purchase_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {cattle.purchase_price ? `$${cattle.purchase_price.toFixed(2)}` : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${cattle.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : cattle.status === 'Sold'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {cattle.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleViewDetails(cattle)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(cattle)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cattle.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedCattle && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {selectedCattle.breed} - Details
                    </h3>
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {['weight', 'health', 'reproductive', 'milk'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab
                              ? 'border-green-500 text-green-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                          >
                            {tab} Records
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                      {/* Weight Records */}
                      {activeTab === 'weight' && (
                        <div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Add Weight Record</h4>
                            <div className="mt-2 flex gap-4">
                              <input
                                type="date"
                                value={newWeight.date}
                                onChange={(e) => setNewWeight({ ...newWeight, date: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Weight (kg)"
                                value={newWeight.weight}
                                onChange={(e) => setNewWeight({ ...newWeight, weight: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <button
                                onClick={() => handleAddRecord('weight')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </button>
                            </div>
                          </div>
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Weight (kg)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {cattleDetails.weightRecords.map((record) => (
                                <tr key={record.id}>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {record.weight}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Health Records */}
                      {activeTab === 'health' && (
                        <div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Add Health Record</h4>
                            <div className="mt-2 flex gap-4">
                              <input
                                type="date"
                                value={newHealth.date}
                                onChange={(e) => setNewHealth({ ...newHealth, date: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <select
                                value={newHealth.type}
                                onChange={(e) => setNewHealth({ ...newHealth, type: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              >
                                <option value="">Select Type</option>
                                <option value="Vaccination">Vaccination</option>
                                <option value="Treatment">Treatment</option>
                                <option value="Check-up">Check-up</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Description"
                                value={newHealth.description}
                                onChange={(e) => setNewHealth({ ...newHealth, description: e.target.value })}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <button
                                onClick={() => handleAddRecord('health')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </button>
                            </div>
                          </div>
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {cattleDetails.healthRecords.map((record) => (
                                <tr key={record.id}>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {record.type}
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-900">
                                    {record.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Reproductive Records */}
                      {activeTab === 'reproductive' && (
                        <div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Add Reproductive Record</h4>
                            <div className="mt-2 flex gap-4">
                              <input
                                type="date"
                                placeholder="Breeding Date"
                                value={newReproductive.breeding_date}
                                onChange={(e) => setNewReproductive({ ...newReproductive, breeding_date: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <input
                                type="date"
                                placeholder="Calving Date"
                                value={newReproductive.calving_date}
                                onChange={(e) => setNewReproductive({ ...newReproductive, calving_date: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <select
                                value={newReproductive.calf_gender}
                                onChange={(e) => setNewReproductive({ ...newReproductive, calf_gender: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              >
                                <option value="">Select Calf Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                              <button
                                onClick={() => handleAddRecord('reproductive')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </button>
                            </div>
                          </div>
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Breeding Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Calving Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Calf Gender</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {cattleDetails.reproductiveRecords.map((record) => (
                                <tr key={record.id}>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {record.breeding_date ? new Date(record.breeding_date).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {record.calving_date ? new Date(record.calving_date).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {record.calf_gender || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Milk Production Records */}
                      {activeTab === 'milk' && (
                        <div>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900">Add Milk Production Record</h4>
                            <div className="mt-2 flex gap-4">
                              <input
                                type="date"
                                value={newMilk.date}
                                onChange={(e) => setNewMilk({ ...newMilk, date: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Quantity (L)"
                                value={newMilk.quantity}
                                onChange={(e) => setNewMilk({ ...newMilk, quantity: e.target.value })}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              />
                              <button
                                onClick={() => handleAddRecord('milk')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </button>
                            </div>
                          </div>
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity (L)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {cattleDetails.milkRecords.map((record) => (
                                <tr key={record.id}>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                    {record.quantity}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>



              </div>
            </div>
          </div>
        )}

        {/* Keep existing Add/Edit Cattle Modal */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                        Breed
                      </label>
                      <input
                        type="text"
                        id="breed"
                        required
                        value={formData.breed}
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        id="gender"
                        required
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="dob"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        id="purchase_date"
                        value={formData.purchase_date}
                        onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                        Purchase Price
                      </label>
                      <input
                        type="number"
                        id="purchase_price"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Sold">Sold</option>
                        <option value="Deceased">Deceased</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                    >
                      {selectedCattle ? 'Update' : 'Add'} Cattle
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}





      </div>
      {/* main */}
    </div>
  );
}