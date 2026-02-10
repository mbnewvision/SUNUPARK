'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Car, Calendar, CheckCircle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalReservations: 0,
    availableVehicles: 0,
    confirmedReservations: 0,
  })
  const [recentReservations, setRecentReservations] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchStats()
    fetchRecentReservations()
    fetchMonthlyData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }

  const fetchStats = async () => {
    try {
      const { data: vehicles } = await supabase.from('vehicles').select('*')
      const { data: reservations } = await supabase.from('reservations').select('*')
      
      setStats({
        totalVehicles: vehicles?.length || 0,
        totalReservations: reservations?.length || 0,
        availableVehicles: vehicles?.filter(v => v.status === 'Disponible').length || 0,
        confirmedReservations: reservations?.filter(r => r.status === 'Confirmée').length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentReservations = async () => {
    try {
      const { data } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicles (name, matricule)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      setRecentReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
    setLoading(false)
  }

  const fetchMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const data = months.map((month, index) => ({
      name: month,
      réservations: Math.floor(Math.random() * 20) + 5,
    }))
    setMonthlyData(data)
  }

  const statusColors = {
    'Confirmée': 'bg-green-100 text-green-800',
    'En attente': 'bg-yellow-100 text-yellow-800',
    'Annulée': 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-dakar-gray">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-dakar-dark">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-dakar-green to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Véhicules</p>
                <p className="text-4xl font-bold">{stats.totalVehicles}</p>
              </div>
              <Car className="w-16 h-16 text-white/30" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-dakar-yellow to-yellow-500 text-dakar-dark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dakar-dark/80 text-sm mb-1">Total Réservations</p>
                <p className="text-4xl font-bold">{stats.totalReservations}</p>
              </div>
              <Calendar className="w-16 h-16 text-dakar-dark/30" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Véhicules Disponibles</p>
                <p className="text-4xl font-bold">{stats.availableVehicles}</p>
              </div>
              <CheckCircle className="w-16 h-16 text-white/30" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Réservations Confirmées</p>
                <p className="text-4xl font-bold">{stats.confirmedReservations}</p>
              </div>
              <TrendingUp className="w-16 h-16 text-white/30" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Réservations par mois</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="réservations" fill="#00843D" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Reservations */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Réservations récentes</h2>
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : recentReservations.length === 0 ? (
            <p className="text-gray-500">Aucune réservation</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Véhicule</th>
                    <th className="text-left py-3 px-4">Début</th>
                    <th className="text-left py-3 px-4">Fin</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((res) => (
                    <tr key={res.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">
                        {res.vehicles?.name} - {res.vehicles?.matricule}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(res.start_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(res.end_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">{res.description || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[res.status]}`}>
                          {res.status}
                        </span>
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
  )
}
