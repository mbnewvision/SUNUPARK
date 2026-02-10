'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function ReservationForm({ reservation, vehicles, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    start_at: '',
    end_at: '',
    description: '',
    status: 'En attente',
  })

  useEffect(() => {
    if (reservation) {
      setFormData({
        vehicle_id: reservation.vehicle_id || '',
        start_at: reservation.start_at ? new Date(reservation.start_at).toISOString().slice(0, 16) : '',
        end_at: reservation.end_at ? new Date(reservation.end_at).toISOString().slice(0, 16) : '',
        description: reservation.description || '',
        status: reservation.status || 'En attente',
      })
    } else if (reservation?.start && reservation?.end) {
      setFormData(prev => ({
        ...prev,
        start_at: new Date(reservation.start).toISOString().slice(0, 16),
        end_at: new Date(reservation.end).toISOString().slice(0, 16),
      }))
    }
  }, [reservation])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {reservation?.id ? 'Modifier la réservation' : 'Nouvelle réservation'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Véhicule</label>
            <select
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.filter(v => v.status === 'Disponible').map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - {vehicle.matricule}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Date de début</label>
            <input
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Date de fin</label>
            <input
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Objet de la réservation..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="En attente">En attente</option>
              <option value="Confirmée">Confirmée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {reservation?.id ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
