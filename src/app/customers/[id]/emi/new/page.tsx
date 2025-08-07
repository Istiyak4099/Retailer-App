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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const formSchema = z.object({
  product_name: z.string().min(2, "Product name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  processing_fee: z.coerce.number().min(0, "Cannot be negative"),
  down_payment: z.coerce.number().min(0, "Cannot be negative"),
  number_of_emi: z.coerce.number().int().min(1, "At least 1 EMI"),
  emi_monthly_amount: z.coerce.number().positive("Amount must be positive"),
  nid_front: z.any().refine(file => file?.length == 1, "NID Front is required."),
  nid_back: z.any().refine(file => file?.length == 1, "NID Back is required."),
  live_photo: z.any().refine(file => file?.length == 1, "Live Photo is required."),
});

export default function NewEmiPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: "",
      price: 0,
      processing_fee: 0,
      down_payment: 0,
      number_of_emi: 6,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ customerId: params.id, ...values });
    toast({
      title: "EMI Created Successfully",
      description: "The new customer and EMI plan have been saved.",
    });
    router.push("/dashboard");
  }

  const nidFrontRef = form.register("nid_front");
  const nidBackRef = form.register("nid_back");
  const livePhotoRef = form.register("live_photo");

  return (
    <AppLayout title="New EMI Details">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>EMI Details (Step 2/2)</CardTitle>
          <CardDescription>
            Enter the financial details for the EMI plan and upload required documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPhone 15 Pro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processing_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Fee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="down_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="number_of_emi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of EMIs</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emi_monthly_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly EMI</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nid_front"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Front Side</FormLabel>
                      <FormControl>
                        <Input type="file" {...nidFrontRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nid_back"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID Back Side</FormLabel>
                      <FormControl>
                         <Input type="file" {...nidBackRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="live_photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer's Live Photo</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" capture="user" {...livePhotoRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  Create EMI Plan <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
