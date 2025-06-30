import OpenAI from 'openai'
import { Place, Route } from './maps'

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Interfaces pour les analyses IA
export interface PlaceAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  category: string
  highlights: string[]
  recommendations: string[]
  priceRange: string
  accessibility: string
  bestTimeToVisit: string
  summary: string
}

export interface RouteAnalysis {
  difficulty: 'easy' | 'moderate' | 'difficult'
  scenic_value: 'low' | 'medium' | 'high'
  traffic_prediction: string
  alternative_suggestions: string[]
  points_of_interest: string[]
  travel_tips: string[]
  summary: string
}

// Analyser un lieu avec OpenAI
export async function analyzePlaceWithAI(place: Place): Promise<PlaceAnalysis> {
  try {
    const prompt = `
Analyse ce lieu et fournis une analyse détaillée en JSON :

Lieu: ${place.name}
Adresse: ${place.address}
Note: ${place.rating || 'Non disponible'}/5
Types: ${place.types.join(', ')}
Avis: ${place.reviews?.slice(0, 3).map(r => r.text).join(' | ') || 'Aucun avis'}

Fournis une analyse JSON avec ces champs :
- sentiment: "positive", "negative", ou "neutral"
- category: catégorie principale du lieu
- highlights: array de 3-5 points forts
- recommendations: array de 3-4 recommandations
- priceRange: estimation du budget ("€", "€€", "€€€", "€€€€")
- accessibility: évaluation de l'accessibilité
- bestTimeToVisit: meilleur moment pour visiter
- summary: résumé en 2-3 phrases

Réponds uniquement avec le JSON, sans texte supplémentaire.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en analyse de lieux touristiques et commerciaux. Tu fournis des analyses détaillées et utiles pour les voyageurs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Pas de réponse de OpenAI')
    }

    try {
      return JSON.parse(response)
    } catch (parseError) {
      // Fallback si le JSON n'est pas valide
      return {
        sentiment: 'neutral',
        category: place.types[0] || 'Lieu',
        highlights: ['Lieu intéressant à visiter'],
        recommendations: ['Vérifiez les horaires d\'ouverture'],
        priceRange: '€€',
        accessibility: 'Information non disponible',
        bestTimeToVisit: 'Selon vos préférences',
        summary: `${place.name} est un lieu situé à ${place.address}.`
      }
    }

  } catch (error) {
    console.error('Erreur lors de l\'analyse du lieu:', error)
    
    // Analyse de fallback basée sur les données disponibles
    return {
      sentiment: place.rating && place.rating >= 4 ? 'positive' : 
                place.rating && place.rating < 3 ? 'negative' : 'neutral',
      category: place.types[0] || 'Lieu',
      highlights: [
        place.rating ? `Note de ${place.rating}/5` : 'Lieu à découvrir',
        'Situé dans un quartier accessible',
        'Informations détaillées disponibles'
      ],
      recommendations: [
        'Vérifiez les horaires d\'ouverture avant votre visite',
        'Consultez les avis récents',
        'Préparez votre itinéraire à l\'avance'
      ],
      priceRange: place.priceLevel ? '€'.repeat(place.priceLevel) : '€€',
      accessibility: 'Informations d\'accessibilité à vérifier sur place',
      bestTimeToVisit: 'Selon vos préférences et la météo',
      summary: `${place.name} est situé à ${place.address}. ${place.rating ? `Il a une note de ${place.rating}/5.` : ''}`
    }
  }
}

// Analyser un itinéraire avec OpenAI
export async function analyzeRouteWithAI(route: Route): Promise<RouteAnalysis> {
  try {
    const prompt = `
Analyse cet itinéraire et fournis une analyse détaillée en JSON :

Itinéraire: ${route.origin} → ${route.destination}
Distance: ${route.distance}
Durée: ${route.duration}
Nombre d'étapes: ${route.steps.length}

Principales étapes:
${route.steps.slice(0, 5).map((step, i) => `${i + 1}. ${step.instruction} (${step.distance})`).join('\n')}

Fournis une analyse JSON avec ces champs :
- difficulty: "easy", "moderate", ou "difficult"
- scenic_value: "low", "medium", ou "high"
- traffic_prediction: prédiction du trafic et conseils
- alternative_suggestions: array de 2-3 suggestions d'alternatives
- points_of_interest: array de 3-5 points d'intérêt sur le trajet
- travel_tips: array de 3-4 conseils de voyage
- summary: résumé en 2-3 phrases

Réponds uniquement avec le JSON, sans texte supplémentaire.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en navigation et planification d'itinéraires. Tu fournis des analyses détaillées pour optimiser les voyages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Pas de réponse de OpenAI')
    }

    try {
      return JSON.parse(response)
    } catch (parseError) {
      // Fallback si le JSON n'est pas valide
      return {
        difficulty: route.steps.length > 10 ? 'moderate' : 'easy',
        scenic_value: 'medium',
        traffic_prediction: 'Trafic variable selon l\'heure. Évitez les heures de pointe.',
        alternative_suggestions: [
          'Considérez les transports en commun',
          'Vérifiez les itinéraires alternatifs'
        ],
        points_of_interest: ['Aires de repos', 'Stations-service', 'Points de vue'],
        travel_tips: [
          'Préparez votre véhicule avant le départ',
          'Gardez de l\'eau et des collations',
          'Vérifiez la météo'
        ],
        summary: `Itinéraire de ${route.distance} en ${route.duration} de ${route.origin} vers ${route.destination}.`
      }
    }

  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'itinéraire:', error)
    
    // Analyse de fallback basée sur les données disponibles
    const distanceNum = parseFloat(route.distance.replace(/[^\d.]/g, ''))
    
    return {
      difficulty: distanceNum > 100 ? 'moderate' : 
                 distanceNum > 200 ? 'difficult' : 'easy',
      scenic_value: 'medium',
      traffic_prediction: 'Trafic variable selon l\'heure et le jour. Consultez les conditions en temps réel.',
      alternative_suggestions: [
        'Vérifiez les options de transport en commun',
        'Considérez les itinéraires secondaires pour éviter les bouchons'
      ],
      points_of_interest: [
        'Aires de repos sur autoroute',
        'Stations-service',
        'Points de vue panoramiques'
      ],
      travel_tips: [
        'Vérifiez l\'état de votre véhicule avant le départ',
        'Emportez de l\'eau et des collations',
        'Consultez la météo et les conditions de circulation',
        'Prévoyez des pauses régulières'
      ],
      summary: `Trajet de ${route.distance} estimé à ${route.duration}, reliant ${route.origin} à ${route.destination} avec ${route.steps.length} étapes principales.`
    }
  }
}

// Répondre aux questions géographiques avec OpenAI
export async function answerGeographicQuestion(
  question: string,
  places: Place[],
  routes: Route[],
  userLocation?: { lat: number; lng: number } | null
): Promise<string> {
  try {
    const contextPlaces = places.slice(0, 5).map(place => 
      `- ${place.name} (${place.address}) - Note: ${place.rating || 'N/A'}/5`
    ).join('\n')

    const contextRoutes = routes.slice(0, 3).map(route => 
      `- ${route.origin} → ${route.destination} (${route.distance}, ${route.duration})`
    ).join('\n')

    const locationContext = userLocation ? 
      `Position actuelle: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
      'Position non disponible'

    const prompt = `
Tu es un assistant Maps IA spécialisé dans la navigation et les recommandations géographiques.

Question: ${question}

Contexte disponible:
${locationContext}

Lieux récents:
${contextPlaces || 'Aucun lieu récent'}

Itinéraires récents:
${contextRoutes || 'Aucun itinéraire récent'}

Réponds de manière utile et concise en français. Si tu n'as pas assez d'informations spécifiques, donne des conseils généraux pertinents.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant Maps IA expert en navigation, recommandations de lieux et planification d'itinéraires. Tu réponds toujours en français de manière utile et concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    return completion.choices[0]?.message?.content || 
           'Désolé, je n\'ai pas pu traiter votre question. Pouvez-vous la reformuler ?'

  } catch (error) {
    console.error('Erreur lors de la réponse à la question:', error)
    
    // Réponse de fallback
    if (question.toLowerCase().includes('restaurant')) {
      return 'Pour trouver des restaurants, utilisez la recherche avec "restaurant" suivi de votre localisation. Je peux vous aider à analyser les options trouvées !'
    } else if (question.toLowerCase().includes('itinéraire') || question.toLowerCase().includes('aller')) {
      return 'Pour calculer un itinéraire, entrez votre point de départ et votre destination. Je peux ensuite analyser le trajet et vous donner des conseils !'
    } else if (question.toLowerCase().includes('parking')) {
      return 'Recherchez "parking" près de votre destination. Les parkings publics sont généralement indiqués sur la carte avec des informations tarifaires.'
    } else {
      return 'Je peux vous aider avec la recherche de lieux, le calcul d\'itinéraires, et l\'analyse de vos trajets. Que souhaitez-vous faire ?'
    }
  }
} 