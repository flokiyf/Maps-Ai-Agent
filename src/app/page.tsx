'use client'

import { useState, useEffect, useCallback } from 'react'
import GoogleMap from '@/components/GoogleMap'
import PlaceCard from '@/components/PlaceCard'
import MapsChatBot from '@/components/MapsChatBot'
import { Place, Route } from '@/lib/maps'
import { PlaceAnalysis } from '@/lib/openai'

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialisation stable
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handlers stables avec useCallback
  const handlePlacesFound = useCallback((foundPlaces: Place[]) => {
    try {
      setPlaces(foundPlaces)
      setSelectedPlace(foundPlaces[0] || null)
    } catch (error) {
      console.error('Erreur lors de la gestion des lieux:', error)
    }
  }, [])

  const handleRouteCalculated = useCallback((route: Route) => {
    try {
      setRoutes(prev => [route, ...prev.slice(0, 4)]) // Garder les 5 derniers itinéraires
      setSelectedRoute(route)
    } catch (error) {
      console.error('Erreur lors de la gestion des itinéraires:', error)
    }
  }, [])

  const handleLocationChanged = useCallback((location: { lat: number; lng: number }) => {
    try {
      setUserLocation(location)
    } catch (error) {
      console.error('Erreur lors de la gestion de la localisation:', error)
    }
  }, [])

  const handlePlaceAnalyzed = useCallback((place: Place, analysis: PlaceAnalysis) => {
    try {
      console.log('Analyse du lieu:', place.name, analysis)
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de Maps Agent IA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🗺️ Maps Agent IA</h1>
              <p className="text-gray-600 mt-1">
                Assistant intelligent pour Google Maps avec analyse IA des lieux et itinéraires
              </p>
            </div>
            {userLocation && (
              <div className="text-sm text-gray-500">
                📍 Position: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carte Google Maps */}
          <div className="lg:col-span-2">
            <GoogleMap
              onPlacesFound={handlePlacesFound}
              onRouteCalculated={handleRouteCalculated}
              onLocationChanged={handleLocationChanged}
            />
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Statistiques</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieux trouvés :</span>
                  <span className="font-medium">{places.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Itinéraires calculés :</span>
                  <span className="font-medium">{routes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position connue :</span>
                  <span className="font-medium">{userLocation ? '✅ Oui' : '❌ Non'}</span>
                </div>
              </div>
            </div>

            {/* Itinéraire sélectionné */}
            {selectedRoute && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Itinéraire actuel</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">De :</span>
                    <p className="font-medium">{selectedRoute.origin}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vers :</span>
                    <p className="font-medium">{selectedRoute.destination}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Distance :</span>
                      <p className="font-medium">{selectedRoute.distance}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Durée :</span>
                      <p className="font-medium">{selectedRoute.duration}</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    🤖 Analyser l'itinéraire
                  </button>
                </div>
              </div>
            )}

            {/* Lieux récents */}
            {places.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Lieux trouvés</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {places.slice(0, 5).map((place) => (
                    <div
                      key={place.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedPlace?.id === place.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <h3 className="font-medium text-gray-900 text-sm">{place.name}</h3>
                      <p className="text-gray-600 text-xs">{place.address}</p>
                      {place.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs">⭐</span>
                          <span className="text-xs">{place.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lieu sélectionné */}
        {selectedPlace && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏢 Détails du lieu</h2>
            <PlaceCard
              place={selectedPlace}
              onAnalyze={handlePlaceAnalyzed}
            />
          </div>
        )}
      </main>

      {/* ChatBot flottant */}
      <MapsChatBot
        places={places}
        routes={routes}
        userLocation={userLocation}
      />
    </div>
  )
} 