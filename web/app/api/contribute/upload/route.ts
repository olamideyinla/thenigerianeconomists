import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB
const ALLOWED_MIME = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return Response.json({ error: 'Sign in required' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'File exceeds 20 MB limit' }, { status: 400 })
  }

  const mime = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  const isDocx = name.endsWith('.docx') || name.endsWith('.doc')

  if (!ALLOWED_MIME.includes(mime) && !isDocx) {
    return Response.json({ error: 'Only .docx and .doc files are accepted' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = name.endsWith('.doc') ? 'doc' : 'docx'
  const stem = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase().slice(0, 60)
  const key = `submissions/${Date.now()}-${stem}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ContentDisposition: `attachment; filename="${file.name}"`,
  }))

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

  return Response.json({ url: publicUrl })
}
