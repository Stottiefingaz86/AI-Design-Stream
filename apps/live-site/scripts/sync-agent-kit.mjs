/**
 * Copy project skills / taste / rules into apps/live-site/.agent-kit
 * so Vercel (live-site-only deploy) can list them.
 *
 * If monorepo `.cursor` is missing (Vercel build from apps/live-site only),
 * keep any existing `.agent-kit` — never wipe it empty.
 */
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const liveSite = path.resolve(__dirname, '..')
const repoRoot = path.resolve(liveSite, '../..')
const kit = path.join(liveSite, '.agent-kit')

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function copyDir(src, dest) {
  if (!(await exists(src))) return false
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.cp(src, dest, { recursive: true })
  return true
}

async function main() {
  const cursorSkills = path.join(repoRoot, '.cursor', 'skills')
  if (!(await exists(cursorSkills))) {
    if (await exists(path.join(kit, 'skills'))) {
      console.log(
        '[sync-agent-kit] No monorepo .cursor — keeping existing .agent-kit/',
      )
      return
    }
    console.warn(
      '[sync-agent-kit] No monorepo .cursor and no .agent-kit — Skills will be empty on this build.',
    )
    return
  }

  await fs.rm(kit, { recursive: true, force: true }).catch(() => {})
  await fs.mkdir(kit, { recursive: true })

  const copied = []
  if (await copyDir(cursorSkills, path.join(kit, 'skills'))) {
    copied.push('skills')
  }
  if (
    await copyDir(
      path.join(repoRoot, '.cursor', 'knowledge', 'product-strategy'),
      path.join(kit, 'knowledge', 'product-strategy'),
    )
  ) {
    copied.push('strategy')
  }
  if (
    await copyDir(
      path.join(repoRoot, '.cursor', 'knowledge', 'chris-taste'),
      path.join(kit, 'knowledge', 'chris-taste'),
    )
  ) {
    copied.push('taste')
  }
  if (await copyDir(path.join(repoRoot, '.cursor', 'rules'), path.join(kit, 'rules'))) {
    copied.push('rules')
  }

  const constitution = path.join(repoRoot, '.specify', 'memory', 'constitution.md')
  if (await exists(constitution)) {
    await fs.mkdir(path.join(kit, 'specify', 'memory'), { recursive: true })
    await fs.copyFile(
      constitution,
      path.join(kit, 'specify', 'memory', 'constitution.md'),
    )
    copied.push('constitution')
  }

  console.log(`[sync-agent-kit] Packed: ${copied.join(', ') || '(nothing)'} → .agent-kit/`)
}

main().catch((err) => {
  console.error('[sync-agent-kit]', err)
  process.exit(1)
})
