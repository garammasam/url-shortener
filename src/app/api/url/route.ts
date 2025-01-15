import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/db'

const createUrlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url } = createUrlSchema.parse(body)
    
    const shortId = nanoid(8)
    const shortUrl = await prisma.shortUrl.create({
      data: {
        url,
        shortId,
      },
    })

    return NextResponse.json({
      shortId: shortUrl.shortId,
      url: shortUrl.url,
    })
  } catch (error) {
    console.error('Error details:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      error.message.includes('Can\'t reach database server')
    ) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      )
    }

    // Check for duplicate shortId
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: 'This short URL already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 