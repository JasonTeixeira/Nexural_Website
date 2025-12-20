'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  CheckCircle2,
  XCircle,
  Download,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface BulkActionsToolbarProps {
  selectedCount: number
  selectedItems: any[]
  onClose: () => void
  onBulkClose?: (items: any[]) => Promise<void>
  onBulkDelete?: (items: any[]) => Promise<void>
  onBulkExport?: (items: any[]) => void
  onRefresh?: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  selectedItems,
  onClose,
  onBulkClose,
  onBulkDelete,
  onBulkExport,
  onRefresh,
}: BulkActionsToolbarProps) {
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  // Handle bulk close
  const handleBulkClose = async () => {
    if (!onBulkClose) return

    setIsProcessing(true)
    try {
      await onBulkClose(selectedItems)
      toast({
        title: 'Success',
        description: `Successfully closed ${selectedCount} position${selectedCount > 1 ? 's' : ''}`,
      })
      setShowCloseDialog(false)
      onClose()
      onRefresh?.()
    } catch (error) {
      console.error('Error closing positions:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to close positions',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!onBulkDelete) return

    setIsProcessing(true)
    try {
      await onBulkDelete(selectedItems)
      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedCount} position${selectedCount > 1 ? 's' : ''}`,
      })
      setShowDeleteDialog(false)
      onClose()
      onRefresh?.()
    } catch (error) {
      console.error('Error deleting positions:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete positions',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle bulk export
  const handleBulkExport = () => {
    if (onBulkExport) {
      onBulkExport(selectedItems)
      toast({
        title: 'Exporting...',
        description: `Exporting ${selectedCount} position${selectedCount > 1 ? 's' : ''}`,
      })
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      {/* Fixed toolbar at bottom of screen */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Selection info */}
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-base px-3 py-1">
                {selectedCount} {selectedCount === 1 ? 'position' : 'positions'} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              {onBulkExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={isProcessing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export ({selectedCount})
                </Button>
              )}

              {onBulkClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCloseDialog(true)}
                  disabled={isProcessing}
                  className="border-green-500/30 hover:bg-green-500/10 hover:text-green-400"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Close All
                </Button>
              )}

              {onBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isProcessing}
                  className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Close {selectedCount} Position{selectedCount > 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to close the following positions:
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* List of positions */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-4">
            {selectedItems.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold">{position.ticker}</div>
                  <div className="text-sm text-muted-foreground">
                    {position.company_name || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Entry: ${position.entry_price?.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    Current: ${position.current_price?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AlertDialogDescription className="text-yellow-600 dark:text-yellow-500">
            <strong>Warning:</strong> This will mark all selected positions as closed.
            Current prices will be used as exit prices. This action cannot be undone.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkClose}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Closing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Close {selectedCount} Position{selectedCount > 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete {selectedCount} Position{selectedCount > 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete the following positions:
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* List of positions */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-4">
            {selectedItems.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold">{position.ticker}</div>
                  <div className="text-sm text-muted-foreground">
                    {position.company_name || 'N/A'}
                  </div>
                </div>
                <Badge variant={position.status === 'open' ? 'default' : 'secondary'}>
                  {position.status}
                </Badge>
              </div>
            ))}
          </div>

          <AlertDialogDescription className="text-destructive">
            <strong>Warning:</strong> This action is permanent and cannot be undone.
            All position data, including history and P&L, will be lost.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedCount} Position{selectedCount > 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
