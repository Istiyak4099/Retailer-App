
"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Customer } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function CustomerLocationPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const customerDocRef = doc(db, "Customers", id);
        const customerDoc = await getDoc(customerDocRef);

        if (customerDoc.exists()) {
          const customerData = { id: customerDoc.id, ...customerDoc.data() } as Customer;
          setCustomer(customerData);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching customer location data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch customer location." });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id, toast]);

  if (loading) {
    return (
      <AppLayout title="Tracking Location...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!customer || customer.latitude === undefined || customer.longitude === undefined) {
    return (
      <AppLayout title="Location Not Available">
        <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Location Not Available</CardTitle>
            <CardDescription>
              This customer does not have any location data recorded yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <MapPin className="mx-auto h-12 w-12" />
              <p className="mt-4">No coordinates found for {customer?.full_name || 'this customer'}.</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }
  
  const lastUpdated = customer.last_location_update?.toDate ? format(customer.last_location_update.toDate(), 'PPpp') : 'N/A';
  const mapSrc = `https://maps.google.com/maps?q=${customer.latitude},${customer.longitude}&hl=en&z=16&output=embed`;

  return (
    <AppLayout title={`Location for ${customer.full_name}`}>
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle>Device Location</CardTitle>
            <CardDescription>
              Last known location for {customer.full_name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="text-muted-foreground">Coordinates</p>
                        <p className="font-semibold">{customer.latitude}, {customer.longitude}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-semibold">{lastUpdated}</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
