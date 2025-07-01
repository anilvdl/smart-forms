import React from 'react';
import styles from '../../../styles/table.module.css';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  renderCell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  pagination?: Pagination;
}

export function Table<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data to display',
  onSort,
  pagination,
}: TableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;
    const nextDir = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(col.key);
    setSortDir(nextDir);
    onSort(col.key, nextDir);
  };

  return (
    <div className={styles.tableWrapper}>
      {isLoading && <div className={styles.loading}>Loading…</div>}

      {!isLoading && data.length === 0 && (
        <div className={styles.empty}>{emptyMessage}</div>
      )}

      {!isLoading && data.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={col.sortable ? styles.sortable : undefined}
                  onClick={() => handleSort(col)}
                >
                  <span>{col.header}</span>
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? 
                      <ChevronUp size={14} className={styles.sortIcon} /> :
                      <ChevronDown size={14} className={styles.sortIcon} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={col.key}>{col.renderCell(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of{' '}
            {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <button
            disabled={pagination.page * pagination.pageSize >= pagination.total}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}