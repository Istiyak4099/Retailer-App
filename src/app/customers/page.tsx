"use client";

import { AppLayout } from "@/components/app-layout";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { Customer, SessionData } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const fetchSessionAndCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await res.json();
        setSession(sessionData);

        // Fetch only customers created by this user
        const q = query(collection(db, "Customers"), where('created_by_uid', '==', sessionData.userId));
        const querySnapshot = await getDocs(q);
        const fetchedCustomers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndCustomers();
  }, [router]);

  return (
    <AppLayout title="Total Customers">
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Customers</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your EMI customers.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/customers/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New EMI
              </Button>
            </Link>
          </div>
        </div>
        <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage your customers and view their EMI status.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                 ) : (
                    <CustomerTable customers={customers} />
                 )}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
