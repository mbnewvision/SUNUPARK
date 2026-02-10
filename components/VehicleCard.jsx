'use client'

import { Car, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function VehicleCard({ vehicle, onDelete }) {
  const statusColors = {
    'Disponible': 'bg-green-100 text-green-800',
    'Réservé': 'bg-yellow-100 text-yellow-800',
    'En panne': 'bg-red-100 text-red-800',
    'Hors service': 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="relative h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden">
        {vehicle.image_url ? (
          <Image
            src={vehicle.image_url}
            alt={vehicle.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car className="w-24 h-24 text-gray-400" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
      <p className="text-gray-600 mb-2">Matricule: {vehicle.matricule}</p>
      <p className="text-gray-600 mb-4">Type: {vehicle.type}</p>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[vehicle.status]}`}>
          {vehicle.status}
        </span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-dakar-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
        <button
          onClick={() => onDelete(vehicle.id)}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
