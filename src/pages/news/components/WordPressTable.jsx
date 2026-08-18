import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

const WordPressTable = ({ 
  tableData = [], 
  tableIndex = 0, 
  caption = '',
  className = '',
  showPagination = true,
  showSearch = true,
  pageSize = 10,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const columns = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    const headers = Object.keys(tableData[0]);
    
    return headers.map((header) => ({
      accessorKey: header,
      header: header,
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) {
          return <span className="table-cell empty">—</span>;
        }
        const stringValue = String(value);
        const numValue = parseFloat(stringValue.replace(/[^0-9.-]/g, ''));
        const isNumeric = !isNaN(numValue) && stringValue.trim() !== '';
        const isCurrency = stringValue.includes('KES') || stringValue.includes('KSh') || /^[\d,]+\.?\d*$/.test(stringValue);
        const isPercentage = stringValue.includes('%');
        const isSuccess = stringValue.includes('✅') || stringValue.toLowerCase().includes('on track');
        const isWarning = stringValue.includes('⚠️') || stringValue.toLowerCase().includes('pending');
        const isDanger = stringValue.includes('❌') || stringValue.toLowerCase().includes('failed');
        
        let className = 'table-cell';
        if (isNumeric) className += ' numeric';
        if (isCurrency) className += ' currency';
        if (isPercentage) className += ' percentage';
        if (isSuccess) className += ' status-success';
        if (isWarning) className += ' status-warning';
        if (isDanger) className += ' status-danger';
        
        return <span className={className}>{stringValue}</span>;
      },
    }));
  }, [tableData]);

  const data = useMemo(() => tableData || [], [tableData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: true,
    enableGlobalFilter: true,
  });

  if (data.length === 0) {
    return (
      <div className="table-empty-state">
        <div className="empty-icon">📊</div>
        <p>No data available in this table.</p>
      </div>
    );
  }

  return (
    <div className={`table-responsive-wrapper ${className}`}>
      {caption && <div className="table-caption">{caption}</div>}
      
      <div className="table-controls">
        {showSearch && (
          <div className="table-filter">
            <input
              type="text"
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="🔍 Search table..."
              className="table-search-input"
            />
          </div>
        )}
        <div className="table-info">
          <span className="row-count">{table.getPrePaginationRowModel().rows.length} rows</span>
          {showPagination && (
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="table-page-size"
            >
              {[5, 10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>Show {size}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="ppra-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`${header.column.getCanSort() ? 'sortable' : ''}`}
                  >
                    <div className="header-content">
                      <span className="header-text">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <span className="sort-indicator">
                        {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? <span className="sort-icon">↕</span>}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && table.getPageCount() > 1 && (
        <div className="table-pagination">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="pagination-btn">{'<<'}</button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="pagination-btn">{'<'}</button>
          <span className="pagination-info">
            Page <strong>{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</strong>
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="pagination-btn">{'>'}</button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="pagination-btn">{'>>'}</button>
        </div>
      )}

      {/* ── Table Styles with Column Borders ── */}
      <style jsx global>{`
        /* ── Responsive Wrapper ── */
        .table-responsive-wrapper {
          position: relative;
          width: 100%;
          margin: 2rem 0;
          border: 1px solid #d1d5db;
          background: white;
          overflow: hidden;
        }

        /* ── Table Controls ── */
        .table-controls {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          gap: 12px;
        }

        .table-filter {
          flex: 1;
          min-width: 200px;
        }

        .table-search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          font-size: 0.9rem;
          background: white;
          border-radius: 4px;
        }

        .table-search-input:focus {
          outline: none;
          border-color: #201444;
          box-shadow: 0 0 0 2px rgba(32, 20, 68, 0.1);
        }

        .table-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #64748b;
        }

        .table-page-size {
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* ── Table Caption ── */
        .table-caption {
          padding: 12px 16px;
          background: #f1f5f9;
          font-weight: 600;
          font-size: 0.95rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        /* ── Scroll Container ── */
        .table-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Base Table ── */
        .ppra-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
          min-width: 600px;
          background: white;
        }

        /* ── Table Header ── */
        .ppra-table thead {
          background: #201444;
          color: white;
        }

        .ppra-table thead th {
          padding: 14px 20px;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #3d2a7a;
          /* ── ADD COLUMN BORDERS ── */
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          position: sticky;
          top: 0;
          z-index: 10;
          white-space: nowrap;
        }

        /* ── Remove border from last header cell ── */
        .ppra-table thead th:last-child {
          border-right: none;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
          transition: background 0.2s;
        }

        .sortable:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sort-indicator {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
        }

        .sort-icon {
          opacity: 0.5;
        }

        /* ── Table Body ── */
        .ppra-table tbody td {
          padding: 12px 20px;
          border-bottom: 1px solid #e5e7eb;
          /* ── ADD COLUMN BORDERS ── */
          border-right: 1px solid #e5e7eb;
          vertical-align: middle;
        }

        /* ── Remove border from last cell in each row ── */
        .ppra-table tbody td:last-child {
          border-right: none;
        }

        .ppra-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .ppra-table tbody tr:hover {
          background-color: #f1f5f9;
        }

        /* ── Table Cells ── */
        .table-cell {
          display: inline-block;
        }

        .table-cell.empty {
          color: #94a3b8;
          font-style: italic;
        }

        .table-cell.numeric {
          font-variant-numeric: tabular-nums;
          text-align: right;
        }

        .table-cell.currency {
          color: #2563eb;
          font-weight: 600;
        }

        .table-cell.percentage {
          font-weight: 600;
        }

        .table-cell.status-success {
          color: #16a34a;
          font-weight: 600;
        }

        .table-cell.status-warning {
          color: #ca8a04;
          font-weight: 600;
        }

        .table-cell.status-danger {
          color: #dc2626;
          font-weight: 600;
        }

        /* ── Pagination ── */
        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          flex-wrap: wrap;
        }

        .pagination-btn {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          border-radius: 4px;
          color: #1e293b;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #201444;
          color: white;
          border-color: #201444;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          padding: 6px 12px;
          font-size: 0.85rem;
          color: #64748b;
        }

        /* ── Empty State ── */
        .table-empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #94a3b8;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .table-empty-state .empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }

        .table-empty-state p {
          margin: 0;
          font-size: 0.95rem;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .table-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .table-info {
            justify-content: space-between;
          }
          
          .table-pagination {
            gap: 4px;
          }

          .pagination-btn {
            padding: 4px 10px;
            font-size: 0.75rem;
          }

          .pagination-info {
            font-size: 0.75rem;
          }

          .ppra-table {
            font-size: 0.85rem;
            min-width: 100%;
          }

          .ppra-table thead th {
            padding: 10px 12px;
            font-size: 0.75rem;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
          }

          .ppra-table tbody td {
            padding: 8px 12px;
            border-right: 1px solid #e5e7eb;
          }

          .ppra-table thead th:last-child,
          .ppra-table tbody td:last-child {
            border-right: none;
          }
        }

        /* ── Print Styles ── */
        @media print {
          .table-controls,
          .table-pagination {
            display: none !important;
          }

          .table-responsive-wrapper {
            border: 1px solid #d1d5db !important;
            overflow: visible !important;
          }

          .ppra-table {
            min-width: 100%;
            font-size: 10pt;
          }

          .ppra-table thead {
            background: #f3f4f6 !important;
            color: black !important;
          }

          .ppra-table thead th {
            background: #f3f4f6 !important;
            color: black !important;
            border-bottom: 2px solid #000 !important;
            border-right: 1px solid #d1d5db !important;
          }

          .ppra-table thead th:last-child {
            border-right: none !important;
          }

          .ppra-table tbody td {
            border-right: 1px solid #d1d5db !important;
          }

          .ppra-table tbody td:last-child {
            border-right: none !important;
          }

          .ppra-table tbody tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default WordPressTable;