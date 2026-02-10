'use client'

import Link from 'next/link'
import { Car, Calendar, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dakar-green to-green-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-6xl font-bold mb-4">SUNUPARKING</h1>
          <p className="text-2xl mb-8">Gestion de Parc Automobile Intelligente</p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login" className="bg-white text-dakar-green px-8 py-4 rounded-lg font-bold text-lg hover:bg-dakar-yellow hover:text-dakar-dark transition-colors">
              Se Connecter
            </Link>
            <Link href="/auth/register" className="bg-dakar-yellow text-dakar-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-white transition-colors">
              S'Inscrire
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-white rounded-lg p-8 text-center">
            <Car className="w-16 h-16 text-dakar-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Gestion de Véhicules</h3>
            <p className="text-gray-600">Suivez et gérez votre flotte en temps réel</p>
          </div>

          <div className="bg-white rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-dakar-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Réservations</h3>
            <p className="text-gray-600">Planifiez vos réservations facilement</p>
          </div>

          <div className="bg-white rounded-lg p-8 text-center">
            <Users className="w-16 h-16 text-dakar-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Multi-Utilisateurs</h3>
            <p className="text-gray-600">Gestion des rôles et permissions</p>
          </div>

          <div className="bg-white rounded-lg p-8 text-center">
            <Shield className="w-16 h-16 text-dakar-yellow mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Sécurisé</h3>
            <p className="text-gray-600">Authentification et données protégées</p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-dakar-dark">Inspiré de Dakar Mobilité</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une solution moderne et intuitive pour la gestion de votre parc automobile, 
            conçue avec les couleurs et l'esprit de Dakar Mobilité.
          </p>
        </div>
      </div>
    </div>
  )
}
