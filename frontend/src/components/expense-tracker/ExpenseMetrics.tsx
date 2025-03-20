import React, { ReactNode, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DollarSignIcon } from "lucide-react";
import { expenseCategories } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Expense } from "@/components/expense-tracker/DataColumns";

interface ExpenseMetricsProps {
  preferredCurrency: string;
  expenses: Expense[];
}

interface MetricCardProps {
  title: string;
  amount: number;
  subtext: string | ReactNode;
  formatter: Intl.NumberFormat;
  bgColor: string;
}

type CategoryCounts = {
  [key in Expense["category"]]: number;
};

const ExpenseMetrics: React.FC<ExpenseMetricsProps> = ({
  expenses,
  preferredCurrency,
}) => {
  if (!expenses || expenses.length === 0) return null;

  const totalExpenses = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses]
  );

  const highestExpense = expenses.reduce((prev, curr) => {
    if (prev.amount > curr.amount) return prev;
    else return curr;
  });

  const categoryCounts: CategoryCounts = {
    food: 0,
    commute: 0,
    shopping: 0,
    gifts: 0,
    accomodations: 0,
    others: 0,
  };

  const mostCommonCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, categoryCounts);

  type CategoryKey = keyof typeof mostCommonCategory;

  const topCategory = (Object.keys(mostCommonCategory) as CategoryKey[]).reduce((a, b) =>
    mostCommonCategory[a] > mostCommonCategory[b] ? a : b
  );

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: preferredCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [expenses, preferredCurrency]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
      <MetricCard
        title="Total Expense"
        amount={totalExpenses}
        subtext="total spent on the plan"
        formatter={formatter}
        bgColor="bg-green-50"
      />
      <MetricCard
        title="Most Spent Category"
        amount={categoryCounts[topCategory]}
        subtext={
          <div className="flex gap-2 items-center">
            {expenseCategories.find((c) => c.key.includes(topCategory))?.icon}{" "}
            {topCategory.toUpperCase()}
          </div>
        }
        formatter={formatter}
        bgColor="bg-purple-50"
      />
      <MetricCard
        title="Highest Single Expense"
        amount={highestExpense.amount}
        subtext={
          <div className="flex gap-2 items-center">
            <span>spent on</span>
            {expenseCategories.find((c) => c.key.includes(highestExpense.category))?.icon}{" "}
            {topCategory.toUpperCase()}
          </div>
        }
        formatter={formatter}
        bgColor="bg-red-50"
      />
    </div>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtext,
  formatter,
  bgColor,
}) => {
  return (
    <Card className={cn("flex flex-col h-full justify-between", `dark:bg-card ${bgColor}`)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col gap-3">
        <div className="text-2xl font-bold tracking-wider">{formatter.format(amount)}</div>
        <div className="text-xs text-muted-foreground">{subtext}</div>
      </CardContent>
    </Card>
  );
};

export default ExpenseMetrics;