import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { CalendarIcon } from 'lucide-react';
import { expenseCategories } from '@/lib/constants';
import UserDropdown from '@/components/expense-tracker/UserDropdown';
import currencies from '@/lib/currencies.json';

// UI Components 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Type for Expense
interface ExpenseEntry {
  purpose: string;
  amount: number;
  category: "food" | "commute" | "shopping" | "gifts" | "accomodations" | "others";
  date: string;
  whoSpent: string;
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

// Form schema using Zod
const formSchema = z.object({
  expenses: z.array(z.object({
    purpose: z.string().min(2, { message: "Purpose must be at least 2 characters" }).max(50),
    amount: z.coerce.number().min(0, { message: "Amount must be positive" }),
    category: z.enum(["food", "commute", "shopping", "gifts", "accomodations", "others"]),
    date: z.date(),
    whoSpent: z.string().min(1, { message: "Please select who spent the money" })
  })),
  currency: z.string().default('INR')
});

// Helper function for class names
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

interface ExpenseSheetProps {
  planId?: string;
  edit?: boolean;
  data?: Expense;
  preferredCurrency: string;
}

export default function ExpenseSheet({
  planId,
  data,
  edit,
  preferredCurrency,
}: ExpenseSheetProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const { user } = useUser();
  const { isSignedIn } = useUser();
  
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
  
  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenses: [{
        purpose: '',
        amount: 0,
        category: 'others',
        whoSpent: user?.id || '',
        date: new Date(),
      }],
      currency: preferredCurrency || 'INR'
    }
  });

  // Set initial user when component mounts
  useEffect(() => {
    if (user && user.id) {
      setSelectedUser(user.id);
      form.setValue("expenses.0.whoSpent", user.id);
    }
  }, [user, form]);

  // Handle setting the user
  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    form.setValue("expenses.0.whoSpent", userId);
  };

  // Populate form with existing data when editing
  useEffect(() => {
    if (!edit || !data) return;
    
    const expense = data.expenses[0]; // Assuming we're editing the first expense
    
    if (expense) {
      form.setValue("expenses.0.purpose", expense.purpose);
      form.setValue("expenses.0.amount", expense.amount);
      form.setValue("expenses.0.category", expense.category);
      form.setValue("expenses.0.whoSpent", expense.whoSpent);
      setSelectedUser(expense.whoSpent);
      form.setValue("expenses.0.date", new Date(expense.date));
    }
  }, [edit, data, form]);

  // Get currency symbol
  const currency = preferredCurrency
    ? currencies.find((c) => c.cc.includes(preferredCurrency))?.symbol
    : "₹";

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !user.id) return;
   
    const userData = getUserData();
      
    if (!userData) {
      return;
    }
    
    // Make sure the form has the latest selected user
    values.expenses[0].whoSpent = selectedUser;
    
    if (!values.expenses[0].whoSpent) {
      form.setError("expenses.0.whoSpent", {
        type: "manual",
        message: "Please select who spent the money"
      });
      return;
    }
    
    try {
      if (edit && data) {
        // Update existing expense
        await axios.put(`http://localhost:5000/api/expense/${data._id}`, {
          userData,
          expenses: values.expenses,
          currency: values.currency
        });
      } else {
        // Create new expense
        await axios.post('http://localhost:5000/api/expense/add', {
          planId,
          userData,
          expenses: values.expenses,
          currency: values.currency
        });
      }
      
      // Reset form and close sheet
      form.reset();
      setOpen(false);
      
      // Refresh the page or update the list
      window.location.reload();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {edit ? (
          <span className="hover:underline hover:underline-offset-2 text-blue-600 hover:font-medium cursor-pointer">
            {data?.expenses[0]?.purpose}
          </span>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="bg-blue-500 hover:bg-blue-700 text-white hover:bg-blue-700hover:text-white"
          >
            Add a New Expense
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{edit ? "Edit Expense" : "Add Expense"}</SheetTitle>
          <SheetDescription>
            {edit ? "Edit" : "Add"} your expenses during the travel to
            efficiently track it at the end.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pt-5"
          >
            <FormField
              control={form.control}
              name="expenses.0.purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>For</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What purpose did you spend for?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Custom User Selection Field */}
            <FormItem>
              <FormLabel>Who Spent</FormLabel>
              <Select 
                value={selectedUser} 
                onValueChange={handleUserSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a User" />
                </SelectTrigger>
                <SelectContent>
                  <UserDropdown 
                    userId={user?.id || ''} 
                    planId={planId} 
                    onSelect={handleUserSelect}
                  />
                </SelectContent>
              </Select>
              {form.formState.errors.expenses?.[0]?.whoSpent && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {form.formState.errors.expenses[0].whoSpent.message}
                </p>
              )}
            </FormItem>
            
            <FormField
              control={form.control}
              name="expenses.0.category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem value={category.key} key={category.key}>
                            <div className="flex gap-2 items-center">
                              {category.icon}
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expenses.0.amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount({currency})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={`e.g. ${currency} 1000`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expenses.0.date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>On</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value ? "text-muted-foreground" : ""
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-50 bg-background"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="outline"
              className={cn(
                "text-white hover:text-white",
                edit ? "bg-teal-500 hover:bg-teal-700" : "bg-blue-500 hover:bg-blue-700"
              )}
            >
              {edit ? "Update" : "Add"} Expense
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}