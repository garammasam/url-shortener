import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/db'

const createUrlSchema = z.object({
  url: z.string().url(),
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    console.error('Error creating short URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 