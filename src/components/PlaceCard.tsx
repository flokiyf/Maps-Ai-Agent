'use client'

import { useState } from 'react'
import { Place } from '@/lib/maps'
import { PlaceAnalysis } from '@/lib/openai'

interface PlaceCardProps {
  place: Place
  onAnalyze?: (place: Place, analysis: PlaceAnalysis) => void
}

export default function PlaceCard({ place, onAnalyze }: PlaceCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PlaceAnalysis | null>(null)

  const handleAnalyze = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/maps/analyze-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ place })
      })

      if (response.ok) {
        const analysisData = await response.json()
        setAnalysis(analysisData.analysis)
        onAnalyze?.(place, analysisData.analysis)
      } else {
        console.error('Erreur lors de l\'analyse')
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getPriceColor = (priceRange: string) => {
    const level = priceRange.length
    if (level <= 1) return 'text-green-600'
    if (level <= 2) return 'text-yellow-600'
    if (level <= 3) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatTypes = (types?: string[]) => {
    if (!types || types.length === 0) return 'Lieu'
    return types.slice(0, 2).map(type => 
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* En-tête du lieu */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{place.name}</h3>
          <p className="text-gray-600 mb-3">{place.address}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {place.types.slice(0, 3).map((type, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isAnalyzing ? '🤖 Analyse...' : '🤖 Analyser'}
        </button>
      </div>

      {/* Informations de base */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {place.rating && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <span className="text-yellow-600 text-sm font-medium">⭐ Note</span>
            <p className="text-lg font-bold text-yellow-900">{place.rating}/5</p>
          </div>
        )}
        
        {place.priceLevel && (
          <div className="bg-green-50 p-3 rounded-md">
            <span className="text-green-600 text-sm font-medium">💰 Prix</span>
            <p className={`text-lg font-bold ${getPriceColor('€'.repeat(place.priceLevel))}`}>
              {'€'.repeat(place.priceLevel)}
            </p>
          </div>
        )}

        {place.phoneNumber && (
          <div className="bg-purple-50 p-3 rounded-md">
            <span className="text-purple-600 text-sm font-medium">📞 Téléphone</span>
            <p className="text-sm font-medium text-purple-900 truncate">{place.phoneNumber}</p>
          </div>
        )}

        {place.website && (
          <div className="bg-indigo-50 p-3 rounded-md">
            <span className="text-indigo-600 text-sm font-medium">🌐 Site web</span>
            <a 
              href={place.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-indigo-900 hover:underline block truncate"
            >
              Visiter
            </a>
          </div>
        )}
      </div>

      {/* Horaires d'ouverture */}
      {place.openingHours && place.openingHours.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">🕒 Horaires d'ouverture</h4>
          <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
            {place.openingHours.map((hour, index) => (
              <p key={index} className="text-sm text-gray-700">{hour}</p>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {place.photos && place.photos.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">📸 Photos</h4>
          <div className="flex gap-2 overflow-x-auto">
            {place.photos.slice(0, 4).map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo de ${place.name}`}
                className="w-24 h-24 object-cover rounded-md flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Avis récents */}
      {place.reviews && place.reviews.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">💬 Avis récents</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {place.reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900 text-sm">{review.author}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-xs">⭐</span>
                    <span className="text-xs">{review.rating}/5</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyse IA */}
      {analysis && (
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">🤖 Analyse IA</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(analysis.sentiment)}`}>
              {analysis.sentiment === 'positive' ? '😊 Positif' : 
               analysis.sentiment === 'negative' ? '😞 Négatif' : '😐 Neutre'}
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
              {analysis.category}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">✨ Points forts</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {analysis.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-800 mb-2">💡 Recommandations</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <h5 className="font-medium text-blue-900 mb-1">💰 Budget estimé</h5>
              <p className={`font-bold ${getPriceColor(analysis.priceRange)}`}>
                {analysis.priceRange}
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-md">
              <h5 className="font-medium text-green-900 mb-1">♿ Accessibilité</h5>
              <p className="text-sm text-green-800">{analysis.accessibility}</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-md">
              <h5 className="font-medium text-purple-900 mb-1">⏰ Meilleur moment</h5>
              <p className="text-sm text-purple-800">{analysis.bestTimeToVisit}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h5 className="font-medium text-gray-900 mb-2">📝 Résumé</h5>
            <p className="text-gray-700">{analysis.summary}</p>
          </div>
        </div>
      )}
    </div>
  )
} 