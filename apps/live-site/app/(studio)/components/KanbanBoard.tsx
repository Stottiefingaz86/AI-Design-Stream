'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

interface KanbanBoardProps {
  designer: string | null
  onItemClick?: (item: WIPItem) => void
  currentRequest?: {
    area: string
    what: string
    deadline: string
    priority: 'high' | 'medium' | 'low'
    status: 'todo' | 'in_progress' | 'done'
  }
}

const columns = [
  { id: 'todo', label: 'Todo', color: 'white/10' },
  { id: 'in_progress', label: 'In Progress', color: 'white/20' },
  { id: 'done', label: 'Done', color: 'white/5' },
]

export function KanbanBoard({ designer, onItemClick, currentRequest }: KanbanBoardProps) {
  const [items, setItems] = useState<WIPItem[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const fetchWIP = async () => {
    if (!designer) {
      setLoading(false)
      setItems([])
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch(`/api/wip?designer=${designer}`)
      const data = await response.json()
      let fetchedItems = data.items || []
      
      // Add current request to the items if provided
      if (currentRequest && currentRequest.what) {
        const currentItem: WIPItem = {
          id: 'current-request',
          title: currentRequest.what,
          area: currentRequest.area,
          deadline: currentRequest.deadline,
          priority: currentRequest.priority,
          status: currentRequest.status,
          createdAt: new Date().toISOString().split('T')[0],
          what: currentRequest.what,
        }
        // Add current request to the beginning of the list
        fetchedItems = [currentItem, ...fetchedItems]
      }
      
      setItems(fetchedItems)
    } catch (error) {
      console.error('Failed to fetch WIP:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch WIP when designer or currentRequest changes
  useEffect(() => {
    fetchWIP()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designer, currentRequest])

  const handlePriorityChange = async (itemId: string, newPriority: 'high' | 'medium' | 'low') => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    try {
      await fetch('/api/wip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          newPriority,
          newStatus: item.status,
        }),
      })
      
      setItems(items.map(i => 
        i.id === itemId ? { ...i, priority: newPriority } : i
      ))
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const handleStatusChange = async (itemId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      const item = items.find(i => i.id === itemId)
      await fetch('/api/wip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          newPriority: item?.priority || 'medium',
          newStatus,
        }),
      })
      
      setItems(items.map(i => 
        i.id === itemId ? { ...i, status: newStatus } : i
      ))
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-white/50 bg-white/5'
      case 'medium':
        return 'border-white/30 bg-white/2'
      case 'low':
        return 'border-white/10'
      default:
        return 'border-white/10'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High'
      case 'medium':
        return 'Med'
      case 'low':
        return 'Low'
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/30 text-sm">Loading work items...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/30 text-sm">No work in progress</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/80 text-sm font-medium">Current WIP</h3>
        <div className="text-white/40 text-xs">{items.length} items</div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {columns.map((column) => {
          const columnItems = items.filter(item => item.status === column.id)
          
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                {column.label} ({columnItems.length})
              </div>
              
              <div 
                className="min-h-[200px] rounded-lg border border-white/5 p-2 space-y-2"
                style={{ backgroundColor: `rgba(255, 255, 255, ${column.id === 'in_progress' ? '0.02' : column.id === 'done' ? '0.005' : '0.01'})` }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (draggedItem) {
                    handleStatusChange(draggedItem, column.id as 'todo' | 'in_progress' | 'done')
                    setDraggedItem(null)
                  }
                }}
              >
                {columnItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    draggable={item.id !== 'current-request'}
                    onDragStart={() => setDraggedItem(item.id)}
                    onDragEnd={() => setDraggedItem(null)}
                    onClick={() => onItemClick?.(item)}
                    className={`neu-soft rounded-lg p-3 ${item.id === 'current-request' ? 'cursor-default ring-2 ring-white/30' : 'cursor-move'} hover:neu-inset transition-all border ${getPriorityColor(item.priority)}`}
                  >
                    {item.id === 'current-request' && (
                      <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1 pb-1 border-b border-white/10">
                        This Request
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate mb-1">
                          {item.title}
                        </div>
                        <div className="text-white/40 text-xs truncate mb-2">
                          {item.what}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low']
                          const currentIndex = priorities.indexOf(item.priority)
                          const nextPriority = priorities[(currentIndex + 1) % priorities.length]
                          handlePriorityChange(item.id, nextPriority)
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${getPriorityColor(item.priority)} text-white/60 hover:text-white/90 transition-colors`}
                        title="Click to change priority"
                      >
                        {getPriorityLabel(item.priority)}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-white/30">
                      <span className="uppercase">{item.area}</span>
                      <span>{item.deadline}</span>
                    </div>
                  </motion.div>
                ))}
                
                {columnItems.length === 0 && (
                  <div className="text-white/10 text-xs text-center py-8">
                    Empty
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <div className="text-white/30 text-[10px] text-center pt-2">
        Drag items between columns or click priority to reprioritize
      </div>
    </div>
  )
}
