
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const fileSchema = typeof window === 'undefined'
  ? z.any()
  : z.instanceof(FileList).refine(files => files?.length === 1, "File is required.");

const formSchema = z.object({
  product_name: z.string().min(2, "Product name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  processing_fee: z.coerce.number().min(0, "Cannot be negative"),
  down_payment: z.coerce.number().min(0, "Cannot be negative"),
  number_of_emi: z.coerce.number().int().min(1, "At least 1 EMI"),
  emi_monthly_amount: z.coerce.number().positive("Amount must be positive"),
  nid_front: fileSchema.refine(files => files?.length === 1, "NID Front is required."),
  nid_back: fileSchema.refine(files => files?.length === 1, "NID Back is required."),
  live_photo: fileSchema.refine(files => files?.length === 1, "Live Photo is required."),
});

export default function NewEmiPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
  const [nidBackPreview, setNidBackPreview] = useState<string | null>(null);
  const [livePhotoPreview, setLivePhotoPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: "",
      price: 0,
      processing_fee: 0,
      down_payment: 0,
      number_of_emi: 6,
      emi_monthly_amount: 0,
    },
  });

  const uploadFile = async (file: File) => {
    const storageRef = ref(storage, `images/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const [nidFrontUrl, nidBackUrl, livePhotoUrl] = await Promise.all([
        uploadFile(values.nid_front[0]),
        uploadFile(values.nid_back[0]),
        uploadFile(values.live_photo[0])
      ]);

      const total_emi = values.price - values.down_payment + values.processing_fee;

      await addDoc(collection(db, "EmiDetails"), {
        customerId: params.id,
        product_name: values.product_name,
        price: values.price,
        processing_fee: values.processing_fee,
        down_payment: values.down_payment,
        number_of_emi: values.number_of_emi,
        emi_monthly_amount: values.emi_monthly_amount,
        total_emi: total_emi,
        nid_front: nidFrontUrl,
        nid_back: nidBackUrl,
        live_photo: livePhotoUrl,
        created_time: serverTimestamp(),
      });
      
      const customerDocRef = doc(db, "Customers", params.id);
      await updateDoc(customerDocRef, {
        status: "Active"
      });

      toast({
        title: "EMI Created Successfully",
        description: "The new EMI plan has been saved.",
      });
      router.push(`/customers/${params.id}`);
    } catch (error) {
        console.error("Error creating EMI:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to create EMI plan." });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setter(null);
    }
  };

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
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>NID Front Side</FormLabel>
                      {nidFrontPreview && (
                         <Image src={nidFrontPreview} alt="NID Front Preview" width={300} height={200} className="rounded-lg w-full object-contain h-48" />
                      )}
                      <FormControl>
                        <Input type="file" {...rest} onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e, setNidFrontPreview);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nid_back"
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>NID Back Side</FormLabel>
                      {nidBackPreview && (
                         <Image src={nidBackPreview} alt="NID Back Preview" width={300} height={200} className="rounded-lg w-full object-contain h-48" />
                      )}
                      <FormControl>
                         <Input type="file" {...rest} onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e, setNidBackPreview);
                         }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="live_photo"
                  render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Customer's Live Photo</FormLabel>
                      {livePhotoPreview && (
                         <Image src={livePhotoPreview} alt="Live Photo Preview" width={300} height={200} className="rounded-lg w-full object-contain h-48" />
                      )}
                      <FormControl>
                        <Input type="file" accept="image/*" capture="user" {...rest} onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e, setLivePhotoPreview);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
