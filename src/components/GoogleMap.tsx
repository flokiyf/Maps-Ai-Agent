'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapsService, Place, Route } from '@/lib/maps'

interface GoogleMapProps {
  onPlacesFound?: (places: Place[]) => void
  onRouteCalculated?: (route: Route) => void
  onLocationChanged?: (location: { lat: number; lng: number }) => void
}

export default function GoogleMap({ 
  onPlacesFound, 
  onRouteCalculated, 
  onLocationChanged 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapsService = useRef<MapsService | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Stabiliser les callbacks pour éviter les re-renders
  const stableOnLocationChanged = useCallback((location: { lat: number; lng: number }) => {
    onLocationChanged?.(location)
  }, [onLocationChanged])

  const stableOnPlacesFound = useCallback((places: Place[]) => {
    onPlacesFound?.(places)
  }, [onPlacesFound])

  const stableOnRouteCalculated = useCallback((route: Route) => {
    onRouteCalculated?.(route)
  }, [onRouteCalculated])

  // Initialiser la carte - FIXÉ: sans dépendances changeantes
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || isLoaded) return

      try {
        setIsError(false)
        setErrorMessage('')
        mapsService.current = new MapsService()
        
        // Obtenir la position de l'utilisateur
        const location = await mapsService.current.getCurrentLocation()
        setUserLocation(location)
        stableOnLocationChanged(location)

        // Initialiser la carte
        await mapsService.current.initializeMap(mapRef.current, location)
        setIsLoaded(true)
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error)
        setIsError(true)
        setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue')
        setIsLoaded(false)
      }
    }

    // N'initialiser qu'une seule fois
    if (!isLoaded && !isError) {
      initMap()
    }
    
    // Cleanup function
    return () => {
      if (mapsService.current) {
        mapsService.current.clearDirections()
      }
    }
  }, []) // FIXÉ: tableau de dépendances vide pour éviter la boucle

  // Effet séparé pour notifier les changements de location
  useEffect(() => {
    if (userLocation) {
      stableOnLocationChanged(userLocation)
    }
  }, [userLocation, stableOnLocationChanged])

  // Rechercher des lieux
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapsService.current || isSearching) return

    setIsSearching(true)
    try {
      const places = await mapsService.current.searchPlaces(searchQuery, userLocation || undefined)
      stableOnPlacesFound(places)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Calculer un itinéraire
  const handleCalculateRoute = async () => {
    if (!origin.trim() || !destination.trim() || !mapsService.current || isCalculatingRoute) return

    setIsCalculatingRoute(true)
    try {
      const route = await mapsService.current.calculateRoute(origin, destination)
      stableOnRouteCalculated(route)
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error)
    } finally {
      setIsCalculatingRoute(false)
    }
  }

  // Centrer sur la position de l'utilisateur
  const handleCenterOnUser = async () => {
    if (!mapsService.current) return

    try {
      const location = await mapsService.current.getCurrentLocation()
      setUserLocation(location)
      mapsService.current.panToLocation(location)
    } catch (error) {
      console.error('Erreur lors de la géolocalisation:', error)
    }
  }

  // Nettoyer les directions
  const handleClearDirections = () => {
    if (mapsService.current) {
      mapsService.current.clearDirections()
    }
    setOrigin('')
    setDestination('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'search' | 'route') => {
    if (e.key === 'Enter') {
      if (action === 'search') {
        handleSearch()
      } else if (action === 'route' && origin && destination) {
        handleCalculateRoute()
      }
    }
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Barre d'outils */}
      <div className="bg-gray-50 p-4 border-b space-y-4">
        {/* Recherche de lieux */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'search')}
              placeholder="Rechercher un lieu, restaurant, attraction..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              disabled={!isLoaded}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching || !isLoaded}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSearching ? '⏳' : '🔍 Rechercher'}
          </button>
        </div>

        {/* Calcul d'itinéraire */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'route')}
            placeholder="Point de départ"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            disabled={!isLoaded}
          />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, 'route')}
            placeholder="Destination"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            disabled={!isLoaded}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCalculateRoute}
              disabled={!origin.trim() || !destination.trim() || isCalculatingRoute || !isLoaded}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isCalculatingRoute ? '⏳' : '🗺️ Itinéraire'}
            </button>
            <button
              onClick={handleClearDirections}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              disabled={!isLoaded}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleCenterOnUser}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            disabled={!isLoaded}
          >
            📍 Ma position
          </button>
          
          {userLocation && (
            <div className="text-xs text-gray-600">
              📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              isError ? 'bg-red-500' : 
              isLoaded ? 'bg-green-500' : 
              'bg-yellow-500 animate-pulse'
            }`}></div>
            <span className="text-gray-600">
              {isError ? 'Erreur de chargement' :
               isLoaded ? 'Carte chargée' : 
               'Chargement...'}
            </span>
          </div>
        </div>
      </div>

      {/* Carte Google Maps */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 md:h-[500px] lg:h-[600px]"
        />
        
        {!isLoaded && !isError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de Google Maps...</p>
              <p className="text-sm text-gray-500 mt-2">
                Initialisation de la carte en cours...
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Recharger la page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="bg-gray-50 px-4 py-2 border-t">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Lieux trouvés</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-blue-500"></div>
            <span>Itinéraire</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>Votre position</span>
          </div>
        </div>
      </div>
    </div>
  )
} 