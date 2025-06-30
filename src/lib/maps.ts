import { Loader } from '@googlemaps/js-api-loader'

// Configuration du loader Google Maps
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry', 'routes']
})

// Interfaces pour les types de données
export interface Place {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number }
  rating?: number
  priceLevel?: number
  types: string[]
  photos?: string[]
  openingHours?: string[]
  phoneNumber?: string
  website?: string
  reviews?: {
    author: string
    rating: number
    text: string
    time: number
  }[]
}

export interface Route {
  id: string
  origin: string
  destination: string
  distance: string
  duration: string
  steps: RouteStep[]
  overview_polyline: string
}

export interface RouteStep {
  instruction: string
  distance: string
  duration: string
  start_location: { lat: number; lng: number }
  end_location: { lat: number; lng: number }
}

// Classe principale pour gérer Google Maps
export class MapsService {
  private map: google.maps.Map | null = null
  private placesService: google.maps.places.PlacesService | null = null
  private directionsService: google.maps.DirectionsService | null = null
  private directionsRenderer: google.maps.DirectionsRenderer | null = null
  private geocoder: google.maps.Geocoder | null = null

  // Initialiser Google Maps avec gestion d'erreur améliorée
  async initializeMap(container: HTMLElement, center: { lat: number; lng: number }) {
    try {
      // Validation des paramètres
      if (!container) {
        throw new Error('Conteneur manquant pour la carte')
      }

      if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
        throw new Error('Coordonnées invalides')
      }

      if (isNaN(center.lat) || isNaN(center.lng)) {
        throw new Error('Coordonnées non numériques')
      }

      if (center.lat < -90 || center.lat > 90 || center.lng < -180 || center.lng > 180) {
        throw new Error('Coordonnées hors limites')
      }

      console.log('Chargement de Google Maps...')
      console.log('Centre:', center)
      
      const google = await loader.load()
      console.log('Google Maps chargé avec succès')
      
      // Créer la carte avec des paramètres validés
      this.map = new google.maps.Map(container, {
        center: new google.maps.LatLng(center.lat, center.lng),
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      })

      this.placesService = new google.maps.places.PlacesService(this.map)
      this.directionsService = new google.maps.DirectionsService()
      this.directionsRenderer = new google.maps.DirectionsRenderer()
      this.directionsRenderer.setMap(this.map)
      this.geocoder = new google.maps.Geocoder()

      return this.map
    } catch (error) {
      console.error('Erreur Google Maps:', error)
      
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #dc3545;">❌ Erreur Google Maps</h3>
          <p>Impossible de charger Google Maps.</p>
          <p style="font-size: 12px; color: #666;">${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
          <div style="margin: 15px 0; padding: 15px; background: #fff; border-radius: 5px;">
            <h4>🔧 Solutions :</h4>
            <p>1. Activez les APIs dans Google Cloud Console</p>
            <p>2. Ajoutez http://localhost:3000/* aux restrictions</p>
            <p>3. Vérifiez la facturation</p>
          </div>
        </div>
      `
      
      throw error
    }
  }

  // Rechercher des lieux
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<Place[]> {
    if (!this.placesService || !this.map) {
      throw new Error('Service Places non initialisé')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query,
        location: location ? new google.maps.LatLng(location.lat, location.lng) : undefined,
        radius: 5000,
      }

      this.placesService!.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: Place[] = results.map((place, index) => ({
            id: place.place_id || `place-${index}`,
            name: place.name || 'Lieu sans nom',
            address: place.formatted_address || 'Adresse non disponible',
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            },
            rating: place.rating,
            priceLevel: place.price_level,
            types: place.types || [],
            photos: place.photos?.map(photo => photo.getUrl({ maxWidth: 400 })) || []
          }))

          // Ajouter des marqueurs sur la carte
          places.forEach(place => {
            new google.maps.Marker({
              position: place.location,
              map: this.map,
              title: place.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
              }
            })
          })

          resolve(places)
        } else {
          reject(new Error(`Erreur de recherche: ${status}`))
        }
      })
    })
  }

  // Obtenir les détails d'un lieu
  async getPlaceDetails(placeId: string): Promise<Place | null> {
    if (!this.placesService) {
      throw new Error('Service Places non initialisé')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: [
          'place_id', 'name', 'formatted_address', 'geometry',
          'rating', 'price_level', 'types', 'photos',
          'opening_hours', 'formatted_phone_number', 'website', 'reviews'
        ]
      }

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const placeData: Place = {
            id: place.place_id || placeId,
            name: place.name || 'Lieu sans nom',
            address: place.formatted_address || 'Adresse non disponible',
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            },
            rating: place.rating,
            priceLevel: place.price_level,
            types: place.types || [],
            photos: place.photos?.map(photo => photo.getUrl({ maxWidth: 400 })) || [],
            openingHours: place.opening_hours?.weekday_text || [],
            phoneNumber: place.formatted_phone_number,
            website: place.website,
            reviews: place.reviews?.map(review => ({
              author: review.author_name,
              rating: review.rating || 0,
              text: review.text,
              time: review.time
            })) || []
          }

          resolve(placeData)
        } else {
          resolve(null)
        }
      })
    })
  }

  // Calculer un itinéraire
  async calculateRoute(origin: string, destination: string): Promise<Route> {
    if (!this.directionsService || !this.directionsRenderer) {
      throw new Error('Service Directions non initialisé')
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }

      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer!.setDirections(result)

          const route = result.routes[0]
          const leg = route.legs[0]

          const routeData: Route = {
            id: `route-${Date.now()}`,
            origin: leg.start_address,
            destination: leg.end_address,
            distance: leg.distance?.text || 'Distance inconnue',
            duration: leg.duration?.text || 'Durée inconnue',
            steps: leg.steps.map(step => ({
              instruction: step.instructions,
              distance: step.distance?.text || '',
              duration: step.duration?.text || '',
              start_location: {
                lat: step.start_location.lat(),
                lng: step.start_location.lng()
              },
              end_location: {
                lat: step.end_location.lat(),
                lng: step.end_location.lng()
              }
            })),
            overview_polyline: route.overview_polyline
          }

          resolve(routeData)
        } else {
          reject(new Error(`Erreur de calcul d'itinéraire: ${status}`))
        }
      })
    })
  }

  // Obtenir la position actuelle
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            
            // Validation des coordonnées
            if (isNaN(lat) || isNaN(lng) || 
                lat < -90 || lat > 90 || 
                lng < -180 || lng > 180) {
              console.warn('Coordonnées invalides de la géolocalisation, utilisation de Paris')
              resolve({ lat: 48.8566, lng: 2.3522 })
            } else {
              console.log('Position obtenue:', { lat, lng })
              resolve({ lat, lng })
            }
          },
          (error) => {
            console.warn('Erreur de géolocalisation:', error.message)
            // Position par défaut (Paris) si erreur
            resolve({ lat: 48.8566, lng: 2.3522 })
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        console.warn('Géolocalisation non supportée, utilisation de Paris')
        resolve({ lat: 48.8566, lng: 2.3522 })
      }
    })
  }

  // Centrer la carte sur une position
  panToLocation(location: { lat: number; lng: number }) {
    if (this.map) {
      this.map.panTo(location)
      this.map.setZoom(15)
    }
  }

  // Nettoyer les marqueurs et itinéraires
  clearDirections() {
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections({ routes: [] } as any)
    }
  }
} 