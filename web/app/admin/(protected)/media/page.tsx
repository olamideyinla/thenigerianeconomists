import { db } from '@/lib/db'
import { format } from 'date-fns'
import { DeleteMediaButton } from './DeleteMediaButton'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Media' }

export default async function AdminMediaPage() {
  const assets = await db.mediaAsset.findMany({
    orderBy: { uploadedAt: 'desc' },
    take: 100,
    include: {
      _count: { select: { figures: true } },
      uploader: { select: { name: true, email: true } },
    },
  })

  function fmtBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Media</h1>
          <p className="admin-page-desc">{assets.length} asset{assets.length !== 1 ? 's' : ''}</p>
        </div>
        <a href="/admin/articles" className="text-sm text-blue-600 hover:underline">Upload via article editor ↗</a>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Filename</th>
              <th>Type</th>
              <th>Size</th>
              <th>Dimensions</th>
              <th>Used in</th>
              <th>Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.publicUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.publicUrl}
                      alt={a.originalFilename}
                      width={48}
                      height={32}
                      style={{ objectFit: 'cover', borderRadius: 3, background: '#f3f4f6' }}
                    />
                  )}
                </td>
                <td className="text-sm font-medium max-w-xs truncate">{a.originalFilename}</td>
                <td className="text-xs text-gray-500">{a.mimeType}</td>
                <td className="text-xs text-gray-500">{fmtBytes(a.byteSize)}</td>
                <td className="text-xs text-gray-500">
                  {a.width && a.height ? `${a.width}×${a.height}` : '—'}
                </td>
                <td className="text-xs text-gray-500">{a._count.figures} figure{a._count.figures !== 1 ? 's' : ''}</td>
                <td className="text-xs text-gray-500">{format(new Date(a.uploadedAt), 'd MMM yyyy')}</td>
                <td>
                  <DeleteMediaButton id={a.id} usageCount={a._count.figures} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No media assets yet.</div>
        )}
      </div>
    </div>
  )
}
