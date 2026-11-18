import { NextResponse } from 'next/server'
import { BA_HANDOVER_PACK } from '@/lib/ba/artifact-bundle.generated'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function crc32(buf: Buffer): number {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
    }
  }
  return ~c >>> 0
}

function u16(n: number) {
  const b = Buffer.alloc(2)
  b.writeUInt16LE(n, 0)
  return b
}

function u32(n: number) {
  const b = Buffer.alloc(4)
  b.writeUInt32LE(n, 0)
  return b
}

/** Uncompressed ZIP (store) — no extra deps. */
function buildZip(files: { name: string; data: Buffer }[]): Buffer {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8')
    const crc = crc32(file.data)
    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBuf.length),
      u16(0),
      nameBuf,
      file.data,
    ])
    const central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBuf.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuf,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralDir = Buffer.concat(centrals)
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ])

  return Buffer.concat([...locals, centralDir, end])
}

export async function GET() {
  const entries: { name: string; data: Buffer }[] = BA_HANDOVER_PACK.map((file) => ({
    name: `activity-feed-handover/${file.zipPath}`,
    data: Buffer.from(file.text, 'utf8'),
  }))

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No handover files found' }, { status: 404 })
  }

  const zip = buildZip(entries)
  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="activity-feed-handover.zip"',
      'Cache-Control': 'no-store',
    },
  })
}
