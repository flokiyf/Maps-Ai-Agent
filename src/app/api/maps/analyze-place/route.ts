import { NextRequest, NextResponse } from 'next/server'
import { analyzePlaceWithAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { place } = await request.json()

    if (!place) {
      return NextResponse.json(
        { error: 'Lieu manquant dans la requête' },
        { status: 400 }
      )
    }

    // Analyser le lieu avec OpenAI
    const analysis = await analyzePlaceWithAI(place)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Erreur lors de l\'analyse du lieu:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'analyse du lieu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
} 