'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Calendar from '@/components/Calendar'
import ReservationForm from '@/components/ReservationForm'
import { Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function ReservationsPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    checkAuth()
    fetchReservations()
    fetchVehicles()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    } else {
      setCurrentUser(session.user)
    }
  }

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicles (name, matricule)
        `)
        .order('start_at', { ascending: true })

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
    setLoading(false)
  }

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const checkVehicleAvailability = async (vehicleId, startAt, endAt, excludeId = null) => {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .neq('status', 'Annulée')
        .or(`start_at.lte.${endAt},end_at.gte.${startAt}`)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error
      return data.length === 0
    } catch (error) {
      console.error('Error checking availability:', error)
      return false
    }
  }

  const handleCreateReservation = async (formData) => {
    if (!currentUser) return

    const isAvailable = await checkVehicleAvailability(
      formData.vehicle_id,
      formData.start_at,
      formData.end_at
    )

    if (!isAvailable) {
      alert('Ce véhicule est déjà réservé pour cette période')
      return
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          ...formData,
          user_id: currentUser.id,
        }])

      if (error) throw error

      await fetchReservations()
      setShowForm(false)
      setSelectedReservation(null)
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Erreur lors de la création de la réservation')
    }
  }

  const handleUpdateReservation = async (formData) => {
    if (!selectedReservation?.id) return

    const isAvailable = await checkVehicleAvailability(
      formData.vehicle_id,
      formData.start_at,
      formData.end_at,
      selectedReservation.id
    )

    if (!isAvailable) {
      alert('Ce véhicule est déjà réservé pour cette période')
      return
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .update(formData)
        .eq('id', selectedReservation.id)

      if (error) throw error

      await fetchReservations()
      setShowForm(false)
      setSelectedReservation(null)
      setShowDetails(false)
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Erreur lors de la modification de la réservation')
    }
  }

  const handleDeleteReservation = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchReservations()
      setShowDetails(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEventClick = (event) => {
    const reservation = reservations.find(r => r.id === event.id)
    setSelectedEvent(reservation)
    setShowDetails(true)
  }

  const handleDateSelect = (selectInfo) => {
    setSelectedReservation({
      start: selectInfo.start,
      end: selectInfo.end,
    })
    setShowForm(true)
  }

  const handleEventDrop = async (info) => {
    const reservation = reservations.find(r => r.id === info.id)
    if (!reservation) return

    const isAvailable = await checkVehicleAvailability(
      reservation.vehicle_id,
      info.start.toISOString(),
      info.end.toISOString(),
      info.id
    )

    if (!isAvailable) {
      alert('Ce véhicule est déjà réservé pour cette période')
      await fetchReservations()
      return
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          start_at: info.start.toISOString(),
          end_at: info.end.toISOString(),
        })
        .eq('id', info.id)

      if (error) throw error
      await fetchReservations()
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Erreur lors du déplacement')
      await fetchReservations()
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dakar-dark">Réservations</h1>
          <button
            onClick={() => {
              setSelectedReservation(null)
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle réservation
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chargement...</p>
          </div>
        ) : (
          <Calendar
            reservations={reservations}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            onEventDrop={handleEventDrop}
          />
        )}

        {showForm && (
          <ReservationForm
            reservation={selectedReservation}
            vehicles={vehicles}
            onSubmit={selectedReservation?.id ? handleUpdateReservation : handleCreateReservation}
            onClose={() => {
              setShowForm(false)
              setSelectedReservation(null)
            }}
          />
        )}

        {showDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Détails de la réservation</h2>
                <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Véhicule</p>
                  <p className="font-semibold">
                    {selectedEvent.vehicles?.name} - {selectedEvent.vehicles?.matricule}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Date de début</p>
                  <p className="font-semibold">
                    {new Date(selectedEvent.start_at).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Date de fin</p>
                  <p className="font-semibold">
                    {new Date(selectedEvent.end_at).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="font-semibold">{selectedEvent.description || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedEvent.status]}`}>
                    {selectedEvent.status}
                  </span>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setSelectedReservation(selectedEvent)
                      setShowDetails(false)
                      setShowForm(true)
                    }}
                    className="btn-primary flex-1"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteReservation(selectedEvent.id)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex-1"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
