import { NextRequest, NextResponse } from 'next/server'
import { analyzeRouteWithAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { route } = await request.json()

    if (!route) {
      return NextResponse.json(
        { error: 'Itinéraire manquant dans la requête' },
        { status: 400 }
      )
    }

    // Analyser l'itinéraire avec OpenAI
    const analysis = await analyzeRouteWithAI(route)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'itinéraire:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'analyse de l\'itinéraire',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
} 