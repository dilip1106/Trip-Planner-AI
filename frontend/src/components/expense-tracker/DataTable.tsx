import { useState } from "react";
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
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// Define the Expense type to replace the Convex Doc type
interface ExpenseEntry {
  purpose: string;
  amount: number;
  category: "food" | "commute" | "shopping" | "gifts" | "accomodations" | "others";
  date: string;
  whoSpent: string;
  _id: string; // Add _id for individual expense entries
}

export interface Expense {
  _id: string;
  planId: string;
  userId: string;
  expenses: ExpenseEntry[];
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create a flattened structure for the table
interface FlattenedExpense {
  _id: string;
  expenseId: string; // To store the individual expense entry ID
  planId: string;
  userId: string;
  purpose: string;
  amount: number;
  category: string;
  date: string;
  whoSpent: string;
  currency: string;
}

export default function DataTable({
  data,
  preferredCurrency,
  onDataChange,
}: {
  preferredCurrency: string;
  data: Expense[];
  onDataChange?: () => void; // Callback to refresh data after operations
}) {
  const { getToken } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Flatten the expenses array for the table
  const flattenedData: FlattenedExpense[] = data.flatMap((expense) => 
    expense.expenses.map((entry) => ({
      _id: expense._id,
      expenseId: entry._id || '', // Use the nested expense ID
      planId: expense.planId,
      userId: expense.userId,
      purpose: entry.purpose,
      amount: entry.amount,
      category: entry.category,
      date: entry.date,
      whoSpent: entry.whoSpent,
      currency: expense.currency || preferredCurrency,
    }))
  );

  // Function to delete multiple expenses
  const deleteMultipleExpenses = async (ids: string[]) => {
    try {
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/batch`, {
        data: { ids },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Failed to delete expenses:", error);
    }
  };

  // Explicitly define columns for the flattened structure
  const columns: ColumnDef<FlattenedExpense, any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => <div>{row.getValue("purpose")}</div>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const currency = row.original.currency || preferredCurrency;
        
        // Format the amount as currency
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(amount);
        
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="capitalize">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "whoSpent",
      header: "Who Spent",
      cell: ({ row }) => <div>{row.getValue("whoSpent")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => deleteMultipleExpenses([row.original.expenseId])}
        >
          Delete
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: flattenedData,
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

  const deleteSelectedRows = async (rows: Row<FlattenedExpense>[]) => {
    if (rows.length <= 0) return;

    await deleteMultipleExpenses(rows.map((r) => r.original.expenseId));
    table.resetRowSelection();
  };

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