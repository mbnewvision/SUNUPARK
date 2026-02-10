'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Car, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Car className="w-8 h-8 text-dakar-green" />
            <span className="text-2xl font-bold text-dakar-green">SUNUPARKING</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-dakar-dark hover:text-dakar-green font-semibold transition-colors">
              Dashboard
            </Link>
            <Link href="/vehicles" className="text-dakar-dark hover:text-dakar-green font-semibold transition-colors">
              Véhicules
            </Link>
            <Link href="/reservations" className="text-dakar-dark hover:text-dakar-green font-semibold transition-colors">
              Réservations
            </Link>
            
            <div className="flex items-center gap-2 ml-4">
              <User className="w-5 h-5 text-dakar-green" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
