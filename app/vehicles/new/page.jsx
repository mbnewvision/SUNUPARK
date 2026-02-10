'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function NewVehiclePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    matricule: '',
    type: '',
    status: 'Disponible',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `vehicles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = formData.image_url

      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const { error } = await supabase
        .from('vehicles')
        .insert([{
          name: formData.name,
          matricule: formData.matricule,
          type: formData.type,
          status: formData.status,
          image_url: imageUrl || '',
        }])

      if (error) throw error

      router.push('/vehicles')
    } catch (error) {
      console.error('Error creating vehicle:', error)
      alert('Erreur lors de la création du véhicule')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dakar-gray">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/vehicles" className="inline-flex items-center gap-2 text-dakar-green hover:text-green-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Retour aux véhicules
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-dakar-dark">Nouveau véhicule</h1>

          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Nom du véhicule</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="ex: Toyota Corolla"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Matricule</label>
              <input
                type="text"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                className="input-field"
                placeholder="ex: DK-1234-AB"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="Berline">Berline</option>
                <option value="SUV">SUV</option>
                <option value="Camionnette">Camionnette</option>
                <option value="Utilitaire">Utilitaire</option>
                <option value="Mini-bus">Mini-bus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="Disponible">Disponible</option>
                <option value="Réservé">Réservé</option>
                <option value="En panne">En panne</option>
                <option value="Hors service">Hors service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Image</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 btn-outline cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Choisir une image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <span className="text-sm text-gray-600">{imageFile.name}</span>
                )}
              </div>
              {formData.image_url && (
                <div className="mt-4">
                  <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer le véhicule'}
              </button>
              <Link href="/vehicles" className="btn-outline flex-1 text-center">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
