"use client";

import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";

// Generic admin data table, reused for listings/leads/users. Replaces the old
// components/ListingTable.jsx (fixed pixel columns, react-paginate, no mobile
// fallback). `page` is zero-based to match MUI's TablePagination directly.
function DataTable({
  columns,
  rows = [],
  getRowId = (row) => row._id || row.id,
  page = 0,
  pageSize = 10,
  total,
  onPageChange,
  onPageSizeChange,
  renderMobileCard,
  emptyMessage = "No records found.",
}) {
  const hasPagination = typeof total === "number" && typeof onPageChange === "function";

  return (
    <div className="w-full">
      {/* Desktop / tablet: real table, horizontally scrollable so it never overflows the viewport. */}
      <div className="hidden sm:block">
        <TableContainer component={Paper} className="overflow-x-auto">
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align || "left"} sx={{ fontWeight: 700 }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={getRowId(row)} hover>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align || "left"}>
                        {col.render ? col.render(row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Mobile: stacked label/value cards instead of a cramped table. */}
      <div className="sm:hidden space-y-3">
        {rows.length === 0 ? (
          <p className="text-center text-ink-500 dark:text-surface-400 py-6">{emptyMessage}</p>
        ) : (
          rows.map((row) =>
            renderMobileCard ? (
              <div key={getRowId(row)}>{renderMobileCard(row)}</div>
            ) : (
              <div
                key={getRowId(row)}
                className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-1"
              >
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink-500 dark:text-surface-400">{col.label}</span>
                    <span className="text-right text-ink-900 dark:text-white">
                      {col.render ? col.render(row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>

      {hasPagination && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={
            onPageSizeChange ? (e) => onPageSizeChange(Number(e.target.value)) : undefined
          }
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{
            ".MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              justifyContent: "center",
              rowGap: 1,
            },
            ".MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
          }}
        />
      )}
    </div>
  );
}

export default DataTable;
