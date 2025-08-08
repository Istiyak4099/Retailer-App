
"use client";

import { useSearchParams } from 'next/navigation'
import { AppLayout } from "@/components/app-layout";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { mockCustomers } from "@/lib/data";
import { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from 'react';

function-title-case(str: string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export default function CustomersListPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const filteredCustomers = useMemo(() => {
    if (!status) {
      return mockCustomers;
    }
    if (status === 'today') {
        // Add logic for 'today's activation' if needed. For now, returning empty.
        return [];
    }
    return mockCustomers.filter(customer => customer.status.toLowerCase() === status.toLowerCase());
  }, [status]);

  const pageTitle = status ? `${function-title-case(status)} Customers` : "All Customers";
  const pageDescription = status ? `A list of your customers with status: ${function-title-case(status)}` : "Here's a list of all your EMI customers.";

  if (status === 'today') {
    pageTitle = "Today's Activations";
    pageDescription = "A list of customers activated today.";
  }

  return (
    <AppLayout title={pageTitle}>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
            <p className="text-muted-foreground">
              {pageDescription}
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
                 <CustomerTable customers={filteredCustomers} />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
