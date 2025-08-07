"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type CustomerTableProps = {
  customers: Customer[];
};

export function CustomerTable({ customers }: CustomerTableProps) {
  const router = useRouter();

  const getStatusVariant = (
    status: "Active" | "Locked" | "Completed"
  ): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "Active":
        return "default";
      case "Locked":
        return "destructive";
      case "Completed":
        return "secondary";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden md:table-cell">Phone Model</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="font-medium">{customer.full_name}</div>
              <div className="text-sm text-muted-foreground">
                {customer.mobile_number}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {customer.phone_model}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(customer.status)}>
                {customer.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/customers/${customer.id}/emi/new`)
                    }
                  >
                    Add EMI
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
