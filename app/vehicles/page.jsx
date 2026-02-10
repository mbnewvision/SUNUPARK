'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VehicleCard from '@/components/VehicleCard'
import { Plus, Search } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, filterStatus])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
    setLoading(false)
  }

  const filterVehicles = () => {
    let filtered = vehicles

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.matricule.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus)
    }

    setFilteredVehicles(filtered)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setVehicles(vehicles.filter(v => v.id !== id))
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-dakar-gray">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dakar-dark">Véhicules</h1>
          <Link href="/vehicles/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter un véhicule
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou matricule..."
                className="input-field pl-10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous les statuts</option>
              <option value="Disponible">Disponible</option>
              <option value="Réservé">Réservé</option>
              <option value="En panne">En panne</option>
              <option value="Hors service">Hors service</option>
            </select>
          </div>
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chargement...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Aucun véhicule trouvé</p>
            <Link href="/vehicles/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Ajouter le premier véhicule
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
