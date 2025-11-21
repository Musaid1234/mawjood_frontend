'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Trash2, MoreHorizontal, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onExportCSV: () => void;
  onBulkDelete?: () => void;
  onBulkStatusChange?: (status: string) => void;
  availableStatuses?: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  exportFileName?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onExportCSV,
  onBulkDelete,
  onBulkStatusChange,
  availableStatuses = [],
  exportFileName = 'export',
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>

        {availableStatuses.length > 0 && onBulkStatusChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableStatuses.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onBulkStatusChange(status.value)}
                  className="gap-2"
                >
                  {status.icon}
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

