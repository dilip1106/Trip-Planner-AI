"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { MessageCircleCode } from "lucide-react";
import { FEEDBACK_LABELS } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";
import { TooltipContainer } from "@/components/shared/Toolip";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  message: z.string().min(2),
  label: z.union([
    z.literal("issue"),
    z.literal("idea"),
    z.literal("question"),
    z.literal("complaint"),
    z.literal("featurerequest"),
    z.literal("other"),
  ]),
});

export default function FeedbackSheet() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { planId } = useParams<{ planId: string }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    form.reset();
    setOpen(false);

    const { label, message } = values;

    try {
      // Sending feedback to your backend
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: planId ? planId : undefined,
          label,
          message,
        }),
      });

      if (response.ok) {
        toast({
          description: "Feedback submitted!",
        });
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast({
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipContainer text="Feedback">
        <SheetTrigger asChild>
          <Button size="sm" variant="ghost">
            <MessageCircleCode className="w-4 h-4" />
          </Button>
        </SheetTrigger>
      </TooltipContainer>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>We Value Your Feedback!</SheetTitle>
          <SheetDescription>
            Please take a moment to share your thoughts and help us improve.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-5">
          <div className="space-y-6">
            <div>
              <label htmlFor="label" className="block font-medium">
                Label
              </label>
              <Select
                {...form.register("label")}
                defaultValue=""
                aria-labelledby="label"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Label" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_LABELS.map((label) => (
                    <SelectItem value={label.id} key={label.id}>
                      {label.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="message" className="block font-medium">
                Message
              </label>
              <Textarea
                {...form.register("message")}
                id="message"
                placeholder="Tell us more about your feedback"
                rows={5}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="bg-blue-500 hover:bg-blue-700 text-white hover:text-white"
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
