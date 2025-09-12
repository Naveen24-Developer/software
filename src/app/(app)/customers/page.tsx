
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { mockCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import CustomerFormDialog from './customer-form-dialog';
import DeleteCustomerAlert from './delete-customer-alert';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      // Update existing customer
      setCustomers(customers.map(c => c.id === id ? { ...c, ...customerData } : c));
    } else {
      // Add new customer
      const newCustomer: Customer = {
        ...customerData,
        id: (customers.length + 1).toString(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers([newCustomer, ...customers]);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  const handleOpenDialog = (customer: Customer | null = null) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Customers</h2>
          <CardDescription>
            Manage your customers here.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search customers..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>
      
      <CustomerFormDialog 
        customer={selectedCustomer} 
        onSave={handleSaveCustomer}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        {/* The trigger is now external */}
        <span />
      </CustomerFormDialog>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Aadhar</TableHead>
                <TableHead>Referred By</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.aadhar || 'N/A'}</TableCell>
                  <TableCell>{customer.referredBy || 'N/A'}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                          Edit
                        </DropdownMenuItem>
                        <DeleteCustomerAlert onDelete={() => handleDeleteCustomer(customer.id)} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
