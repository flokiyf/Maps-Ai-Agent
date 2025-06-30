'use client'

import { useState } from 'react'
import { Route } from '@/lib/maps'
import { RouteAnalysis } from '@/lib/openai'

interface RouteCardProps {
  route: Route
  onAnalyze?: (route: Route, analysis: RouteAnalysis) => void
}

export default function RouteCard({ route, onAnalyze }: RouteCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null)

  const handleAnalyze = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/maps/analyze-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ route })
      })

      if (response.ok) {
        const analysisData = await response.json()
        setAnalysis(analysisData.analysis)
        onAnalyze?.(route, analysisData.analysis)
      } else {
        console.error('Erreur lors de l\'analyse')
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'difficult': return 'text-red-600 bg-red-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getScenicColor = (scenic: string) => {
    switch (scenic) {
      case 'high': return 'text-purple-600 bg-purple-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* En-tête de l'itinéraire */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">🗺️ Itinéraire</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600 text-sm">De :</span>
              <p className="font-medium">{route.origin}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Vers :</span>
              <p className="font-medium">{route.destination}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isAnalyzing ? '🤖 Analyse...' : '🤖 Analyser'}
        </button>
      </div>

      {/* Informations de base */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <span className="text-blue-600 text-sm font-medium">📏 Distance</span>
          <p className="text-lg font-bold text-blue-900">{route.distance}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <span className="text-green-600 text-sm font-medium">⏱️ Durée</span>
          <p className="text-lg font-bold text-green-900">{route.duration}</p>
        </div>
      </div>

      {/* Étapes principales */}
      {route.steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">🚗 Principales étapes :</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {route.steps.slice(0, 3).map((step, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: step.instruction }}></p>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span>📏 {step.distance}</span>
                  <span>⏱️ {step.duration}</span>
                </div>
              </div>
            ))}
            {route.steps.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                ... et {route.steps.length - 3} étapes supplémentaires
              </p>
            )}
          </div>
        </div>
      )}

      {/* Analyse IA */}
      {analysis && (
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">🤖 Analyse IA</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(analysis.difficulty)}`}>
              {analysis.difficulty === 'easy' ? '😊 Facile' : 
               analysis.difficulty === 'difficult' ? '😰 Difficile' : '😐 Modéré'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScenicColor(analysis.scenic_value)}`}>
              {analysis.scenic_value === 'high' ? '🌟 Panoramique' : 
               analysis.scenic_value === 'low' ? '🏙️ Urbain' : '🌲 Moyen'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">🚦 Trafic</h5>
              <p className="text-sm text-gray-600">{analysis.traffic_prediction}</p>
            </div>

            {analysis.alternative_suggestions.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-800 mb-2">🔄 Alternatives</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.alternative_suggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {analysis.points_of_interest.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 mb-2">🎯 Points d'intérêt</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.points_of_interest.slice(0, 4).map((poi, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    {poi}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.travel_tips.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 mb-2">💡 Conseils de voyage</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {analysis.travel_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-green-50 p-3 rounded-md">
            <h5 className="font-medium text-green-900 mb-1">📝 Résumé</h5>
            <p className="text-sm text-green-800">{analysis.summary}</p>
          </div>
        </div>
      )}
    </div>
  )
} 