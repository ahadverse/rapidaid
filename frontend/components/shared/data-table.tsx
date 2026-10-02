import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type SortOrder = 'asc' | 'desc';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortKey?: string;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSortChange?: (sortBy: string, sortOrder: SortOrder) => void;
  emptyState: ReactNode;
};

function ariaSort(active: boolean, order?: SortOrder) {
  if (!active) {
    return 'none';
  }

  return order === 'asc' ? 'ascending' : 'descending';
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  sortBy,
  sortOrder,
  onSortChange,
  emptyState,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const { sortKey } = column;
              const active = sortKey !== undefined && sortKey === sortBy;
              const SortIcon = !active ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;

              return (
                <TableHead
                  key={column.key}
                  scope="col"
                  aria-sort={sortKey && onSortChange ? ariaSort(active, sortOrder) : undefined}
                  className={column.className}
                >
                  {sortKey && onSortChange ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2.5"
                      onClick={() =>
                        onSortChange(sortKey, active && sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                    >
                      {column.header}
                      <SortIcon className={cn(!active && 'opacity-50')} aria-hidden="true" />
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
