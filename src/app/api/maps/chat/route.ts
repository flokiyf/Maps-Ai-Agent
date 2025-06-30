import { NextRequest, NextResponse } from 'next/server'
import { answerGeographicQuestion } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, places, routes, userLocation } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message manquant ou invalide' },
        { status: 400 }
      )
    }

    // Répondre à la question géographique avec OpenAI
    const response = await answerGeographicQuestion(
      message,
      places || [],
      routes || [],
      userLocation || null
    )

    return NextResponse.json({
      success: true,
      response
    })

  } catch (error) {
    console.error('Erreur lors de la réponse géographique:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement de votre question',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
} 