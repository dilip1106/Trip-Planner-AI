import ExpenseSheet from "@/components/expense-tracker/ExpenseSheet";
import { expenseCategories } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import DropDownActions from "@/components/expense-tracker/DropDownActions";

// Update interfaces to match the model
export interface ExpenseEntry {
  planId: string | undefined;
  purpose: string;
  amount: number;
  category: "food" | "commute" | "shopping" | "gifts" | "accomodations" | "others";
  date: string;
  whoSpent: string;
  _id: string;
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

export interface DropdownActionsProps {
  row: { original: Expense };
  onDataChange?: () => void;
}

export const getColumns = (currency: string): ColumnDef<ExpenseEntry, any>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "purpose",
      header: () => <div className="text-left">For</div>,
      cell: ({ row }) => {
        const expenseData: Expense = {
          _id: '',
          planId: row.original.planId || '',
          userId: '',
          expenses: [row.original],
          currency: currency
        };
        return (
          <ExpenseSheet
            planId={row.original.planId}
            edit
            data={expenseData}
            preferredCurrency={currency}
          />
        );
      },
    },
    {
      accessorKey: "whoSpent",
      header: () => <div className="text-left">Who Spent</div>,
      cell: ({ row }) => (
        <div className="text-left font-medium">
          {row.original.whoSpent}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase text-left flex gap-1 ml-4 items-center">
          {expenseCategories.find((e) => e.key === row.getValue("category"))?.icon}
          {row.getValue("category")}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency || "INR",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "date",
      header: () => <div className="text-right">Date</div>,
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        const formatted = new Date(date);
        return (
          <div className="text-right font-medium">
            {formatted.toLocaleDateString("en-us", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const expenseData = {
          _id: '',
          planId: row.original.planId || '',
          userId: '',
          expenses: [row.original],
          currency: currency
        };
        return (
          <div className="text-right">
            <DropDownActions row={{ original: expenseData }} />
          </div>
        );
      },
    },
  ];
};