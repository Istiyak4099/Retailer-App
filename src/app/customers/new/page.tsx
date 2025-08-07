"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  mobile_number: z.string().regex(/^\d{10}$/, "Invalid 10-digit mobile number"),
  email_address: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone_model: z.string().min(2, "Phone model is required"),
  imei_1: z.string().min(15, "IMEI must be 15 digits").max(15, "IMEI must be 15 digits"),
  imei_2: z.string().min(15, "IMEI must be 15 digits").max(15, "IMEI must be 15 digits").optional().or(z.literal('')),
});

export default function NewCustomerPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      mobile_number: "",
      email_address: "",
      phone_model: "",
      imei_1: "",
      imei_2: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, you would save this data and get a customer ID.
    const newCustomerId = Math.random().toString(36).substring(7);
    router.push(`/customers/${newCustomerId}/emi/new`);
  }

  return (
    <AppLayout title="New Customer Onboarding">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Customer Details (Step 1/2)</CardTitle>
          <CardDescription>
            Enter the customer's personal and device information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Priya Patel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="phone_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Samsung Galaxy S24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imei_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMEI 1</FormLabel>
                      <FormControl>
                        <Input placeholder="15-digit IMEI number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="imei_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMEI 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="15-digit IMEI number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  Next: EMI Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
