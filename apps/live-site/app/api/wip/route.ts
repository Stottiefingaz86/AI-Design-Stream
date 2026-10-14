import { NextResponse } from 'next/server'

export interface WIPItem {
  id: string
  title: string
  area: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done'
  createdAt: string
  what: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const designer = searchParams.get('designer') || 'Lilly'
  
  // Mock WIP data for Lilly (Casino/Loyalty designer)
  const mockWIP: WIPItem[] = [
    {
      id: '1',
      title: 'Casino Tile Redesign',
      area: 'Casino',
      deadline: 'This week',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2024-01-10',
      what: 'Redesign casino tile cards with new animations',
    },
    {
      id: '2',
      title: 'Loyalty Points Display',
      area: 'Loyalty',
      deadline: 'Next week',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2024-01-12',
      what: 'Create new loyalty points display component',
    },
    {
      id: '3',
      title: 'Casino Icon Set',
      area: 'Casino',
      deadline: 'In 2 weeks',
      priority: 'low',
      status: 'todo',
      createdAt: '2024-01-14',
      what: 'Design new casino icon set for game types',
    },
    {
      id: '4',
      title: 'Loyalty Rewards Banner',
      area: 'Loyalty',
      deadline: 'Flexible',
      priority: 'low',
      status: 'todo',
      createdAt: '2024-01-13',
      what: 'Design promotional banner for loyalty rewards',
    },
  ]
  
  // Filter by designer (for now, all items are Lilly's)
  const filteredWIP = mockWIP.filter(item => {
    if (designer === 'Lilly') {
      return item.area === 'Casino' || item.area === 'Loyalty'
    }
    // Add other designers as needed
    return false
  })
  
  return NextResponse.json({ items: filteredWIP })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { itemId, newPriority, newStatus } = body
  
  // Mock update - in real implementation, this would update a database
  // For now, just return success
  return NextResponse.json({
    success: true,
    message: `Item ${itemId} updated: priority=${newPriority}, status=${newStatus}`,
  })
}
