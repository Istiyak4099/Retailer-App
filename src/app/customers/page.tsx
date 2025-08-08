import { AppLayout } from "@/components/app-layout";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { mockCustomers } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CustomersPage() {
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
                 <CustomerTable customers={mockCustomers} />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
