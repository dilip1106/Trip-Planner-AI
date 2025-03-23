"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getColumns } from "@/components/expense-tracker/DataColumns";
import { useUser } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";

// Define interface for Expense based on the structure in ExpenseSection
export interface ExpenseEntry {
  purpose: string;
  amount: number;
  category: "food" | "commute" | "shopping" | "gifts" | "accomodations" | "others";
  date: string;
  whoSpent: string;
  _id: string;
}

interface Expense {
  _id: string;
  planId: string;
  userId: string;
  expenses: ExpenseEntry[];
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DataTable({
  data,
  preferredCurrency,
}: {
  data: Expense[];
  preferredCurrency: string;
}) {
  const [tableData, setTableData] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { isSignedIn, user } = useUser();
  const {planId} = useParams();
  const getUserData = () => {
    if (!isSignedIn || !user) return null;
    
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    return {
      clerkId: user.id,
      email: primaryEmail || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      image: user.imageUrl
    };
  };
  // Process the expenses data to flatten it for the table
  useEffect(() => {
    if (data && data.length > 0) {
      // Flatten the nested expenses array from all expense documents
      const flattenedExpenses = data.flatMap(expenseDoc => 
        expenseDoc.expenses.map(expense => ({
          ...expense,
          expenseDocId: expenseDoc._id // Keep track of parent document
        }))
      );
      setTableData(flattenedExpenses);
    } else {
      setTableData([]);
    }
  }, [data]);

  // Delete expense functionality (modified to work with your data structure)
 

  // Delete multiple expenses
  const deleteMultipleExpenses = async (ids: { expenseId: string, expenseDocId: string }[]) => {
    try {
      setLoading(true);
      const userData = getUserData();
        
        if (!userData) {
          return;
        }
      // Placeholder for bulk delete API call
      await axios.post(`http://localhost:5000/api/expense/${planId}/delete-multiple`, { ids,userData });
      
      // Update local state
      setTableData(prevData => 
        prevData.filter(expense => !ids.some(id => id.expenseId === expense._id))
      );
      
      return true;
    } catch (err) {
      setError("Failed to delete expenses");
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // const columns = getColumns(preferredCurrency);
  const columns = getColumns(preferredCurrency) as ColumnDef<ExpenseEntry, any>[];
  const table = useReactTable<ExpenseEntry>({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;

  const deleteSelectedRows = async (rows: Row<ExpenseEntry>[]) => {
    if (rows.length <= 0) return;

    const idsToDelete = rows.map((r) => ({
      expenseId: r.original._id,
      expenseDocId: (r.original as any).expenseDocId // Access the added expenseDocId
    }));

    const success = await deleteMultipleExpenses(idsToDelete);
    if (success) {
      table.resetRowSelection();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading expenses...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter Expenses..."
          value={(table.getColumn("purpose")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("purpose")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedRows && selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteSelectedRows(selectedRows)}
            >
              Delete Selected
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}