import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Button } from "@/components/ui/button";
  import { DotsHorizontalIcon } from "@radix-ui/react-icons";
  import { Row } from "@tanstack/react-table";
  import { Trash2Icon } from "lucide-react";
  import axios from "axios";
  import { useAuth } from "@clerk/clerk-react";
  import { Expense } from "./DataColumns"; // Import from where your Expense interface is defined
  
  export interface DropdownActionsProps {
    row: { original: Expense };
    onDataChange?: () => void; // Optional callback to refresh data after deletion
  }
  
  const DropdownActions = ({ row, onDataChange }: DropdownActionsProps) => {
    const { getToken } = useAuth();
  
    // Function to delete an expense
    const deleteExpense = async (id: string) => {
      try {
        const token = await getToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Call the callback function to refresh data if provided
        if (onDataChange) {
          onDataChange();
        }
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    };
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => deleteExpense(row.original._id)}>
            <Trash2Icon className="w-4 h-4 text-red-500 mr-2" />
            <span>Delete Expense</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  export default DropdownActions;