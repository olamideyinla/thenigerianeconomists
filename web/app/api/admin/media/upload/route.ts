import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const MAX_BYTES = 10 * 1024 * 1024  // 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function mimeToEnum(mime: string): 'IMAGE_JPEG' | 'IMAGE_PNG' | 'IMAGE_WEBP' | 'IMAGE_AVIF' | null {
  const map: Record<string, 'IMAGE_JPEG' | 'IMAGE_PNG' | 'IMAGE_WEBP' | 'IMAGE_AVIF'> = {
    'image/jpeg': 'IMAGE_JPEG',
    'image/png': 'IMAGE_PNG',
    'image/webp': 'IMAGE_WEBP',
    'image/avif': 'IMAGE_AVIF',
  }
  return map[mime] ?? null
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate size
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })
  }

  // Validate MIME
  const mime = file.type.toLowerCase()
  if (!ALLOWED_MIME.includes(mime)) {
    return Response.json({ error: `Unsupported file type: ${mime}` }, { status: 400 })
  }

  const mimeEnum = mimeToEnum(mime)
  if (!mimeEnum) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Extract image metadata + blur placeholder via sharp
  const image = sharp(buffer)
  const meta = await image.metadata()
  const { width, height } = meta

  // Generate a tiny blur placeholder (20px wide, base64)
  const blurBuffer = await image.resize(20).webp({ quality: 20 }).toBuffer()
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`

  // Generate WebP variant
  const webpBuffer = await image.webp({ quality: 82 }).toBuffer()

  const bucket = process.env.R2_BUCKET_NAME!
  const publicBase = process.env.R2_PUBLIC_URL!
  const ts = Date.now()
  const stem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase()

  const originalKey = `media/${ts}-${stem}.${mime.split('/')[1]}`
  const webpKey = `media/${ts}-${stem}.webp`

  // Upload original
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: originalKey,
    Body: buffer,
    ContentType: mime,
  }))

  // Upload WebP
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: webpKey,
    Body: webpBuffer,
    ContentType: 'image/webp',
  }))

  const publicUrl = `${publicBase}/${originalKey}`

  const asset = await db.mediaAsset.create({
    data: {
      filename: `${ts}-${stem}.${mime.split('/')[1]}`,
      mimeType: mimeEnum,
      originalFilename: file.name,
      byteSize: file.size,
      width: width ?? null,
      height: height ?? null,
      storageKey: originalKey,
      publicUrl,
      blurDataUrl,
      uploadedBy: session.user.id!,
    },
  })

  return Response.json({ asset })
}
