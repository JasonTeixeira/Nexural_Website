import { useState, useCallback, useMemo } from 'react'

export interface UseBulkSelectionOptions {
  items: any[]
  idField?: string
}

export function useBulkSelection({ items, idField = 'id' }: UseBulkSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Get all item IDs
  const allIds = useMemo(() => 
    items.map(item => item[idField]),
    [items, idField]
  )

  // Check if all items are selected
  const isAllSelected = useMemo(() => 
    allIds.length > 0 && allIds.every(id => selectedIds.has(id)),
    [allIds, selectedIds]
  )

  // Check if some (but not all) items are selected
  const isSomeSelected = useMemo(() =>
    selectedIds.size > 0 && !isAllSelected,
    [selectedIds.size, isAllSelected]
  )

  // Toggle a single item
  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Toggle all items
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }, [isAllSelected, allIds])

  // Select multiple items
  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }, [])

  // Deselect multiple items
  const deselectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
  }, [])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Check if a specific item is selected
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  // Get selected items
  const selectedItems = useMemo(() =>
    items.filter(item => selectedIds.has(item[idField])),
    [items, selectedIds, idField]
  )

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectedCount: selectedIds.size,
    isAllSelected,
    isSomeSelected,
    isSelected,
    toggleItem,
    toggleAll,
    selectMultiple,
    deselectMultiple,
    clearSelection,
  }
}
