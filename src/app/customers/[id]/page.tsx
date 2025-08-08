
"use client";

import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Customer, EmiDetails } from "@/lib/types";
import {
  Lock,
  Unlock,
  Trash2,
  BellRing,
  MapPin,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { format } from 'date-fns';

const InfoRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
  <div className="flex justify-between py-2">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-semibold text-right">{value || 'N/A'}</dd>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
);

export default function CustomerDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [emiDetails, setEmiDetails] = useState<EmiDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const customerDocRef = doc(db, "Customers", id);
        const customerDoc = await getDoc(customerDocRef);

        if (customerDoc.exists()) {
          setCustomer({ id: customerDoc.id, ...customerDoc.data() } as Customer);

          const q = query(collection(db, "EmiDetails"), where("customerId", "==", id));
          const emiQuerySnapshot = await getDocs(q);
          if (!emiQuerySnapshot.empty) {
            const emiDoc = emiQuerySnapshot.docs[0];
            const emiData = emiDoc.data();
            setEmiDetails({ 
              id: emiDoc.id, 
              ...emiData,
              created_time: emiData.created_time.toDate()
            } as EmiDetails);
          }
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id]);


  if (loading) {
    return (
      <AppLayout title="Customer Details">
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!customer) {
    return notFound();
  }
  
  const getStatusVariant = (
    status: Customer['status']
  ): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "Active":
      case "Unlocked":
        return "default";
      case "Locked":
        return "destructive";
      case "Completed":
      case "Pending":
      case "Removed":
        return "secondary";
      default:
        return "default";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <AppLayout title="Customer Details">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30 p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 text-xl">
                <AvatarImage src={emiDetails?.live_photo || `https://api.pravatar.cc/150?u=${customer.id}`} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(customer.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{customer.full_name}</CardTitle>
                    <Badge variant={getStatusVariant(customer.status)} className="ml-auto">
                      {customer.status}
                    </Badge>
                </div>
                <div className="flex items-center text-muted-foreground mt-1">
                    <Phone className="h-4 w-4 mr-2" />
                    <p>{customer.mobile_number}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-4">
            <dl className="divide-y">
              <SectionTitle>Device Information</SectionTitle>
              <InfoRow label="Device Model" value={customer.phone_model} />
              <InfoRow label="IMEI 1" value={customer.imei_1} />
              <InfoRow label="IMEI 2" value={customer.imei_2} />

              <SectionTitle>Loan Information</SectionTitle>
              <InfoRow label="Product Price" value={emiDetails?.price ? `₹${emiDetails.price.toLocaleString()}`: 'N/A'} />
              <InfoRow label="Processing Fee" value={emiDetails?.processing_fee ? `₹${emiDetails.processing_fee.toLocaleString()}` : 'N/A'} />
              <InfoRow label="Down Payment" value={emiDetails?.down_payment ? `₹${emiDetails.down_payment.toLocaleString()}` : 'N/A'} />
              <InfoRow label="Total EMI" value={emiDetails?.total_emi ? `₹${emiDetails.total_emi.toLocaleString()}` : 'N/A'} />
              <InfoRow label="Monthly EMI" value={emiDetails?.emi_monthly_amount ? `₹${emiDetails.emi_monthly_amount.toLocaleString()}` : 'N/A'} />
              <InfoRow label="Number of EMIs" value={emiDetails?.number_of_emi} />
              <InfoRow label="Loan ID" value={emiDetails?.id} />
              <InfoRow label="Activation Date" value={emiDetails?.created_time ? format(emiDetails.created_time, 'PP') : 'N/A'} />


              <SectionTitle>Personal Information</SectionTitle>
              <InfoRow label="Address" value={"N/A"} />
              <InfoRow label="Mobile Number" value={customer.mobile_number} />
              <InfoRow label="Email" value={customer.email_address} />
            </dl>

            <Separator />
            
            {emiDetails && (
              <>
                <SectionTitle>Uploaded Documents</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 text-center">
                        <Image src={emiDetails.nid_front} alt="NID Front" width={300} height={200} className="rounded-lg w-full object-contain h-40 border" data-ai-hint="document photo" />
                        <p className="text-sm text-muted-foreground">NID Front</p>
                    </div>
                    <div className="space-y-2 text-center">
                        <Image src={emiDetails.nid_back} alt="NID Back" width={300} height={200} className="rounded-lg w-full object-contain h-40 border" data-ai-hint="document photo" />
                        <p className="text-sm text-muted-foreground">NID Back</p>
                    </div>
                    <div className="space-y-2 text-center">
                        <Image src={emiDetails.live_photo} alt="Live Photo" width={300} height={200} className="rounded-lg w-full object-contain h-40 border" data-ai-hint="person selfie" />
                        <p className="text-sm text-muted-foreground">Live Photo</p>
                    </div>
                </div>
              </>
            )}
            
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-4">
            <Button variant="destructive" className="w-full"><Lock className="mr-2 h-4 w-4" />Lock</Button>
            <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white w-full"><Unlock className="mr-2 h-4 w-4" />Unlock</Button>
            <Button variant="outline" className="w-full col-span-2 lg:col-span-1"><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
            <Button variant="outline" className="w-full"><BellRing className="mr-2 h-4 w-4" />Send Reminder</Button>
            <Button variant="outline" className="w-full"><MapPin className="mr-2 h-4 w-4" />Track Location</Button>
        </div>
      </div>
    </AppLayout>
  );
}
