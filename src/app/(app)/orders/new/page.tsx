import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';
import { mockCustomers, mockProducts } from '@/lib/data';

export default function CreateOrderPage() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        {/* Customer Section */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>Select an existing customer or add a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rental Items</CardTitle>
            <CardDescription>Add utensils to the order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-6">
                <Label htmlFor="product">Product</Label>
                <Select>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="quantity">Qty</Label>
                <Input id="quantity" type="number" defaultValue="1" />
              </div>
              <div className="col-span-3">
                <Label htmlFor="rate">Rate</Label>
                <Input id="rate" type="text" defaultValue="$5.00 / day" disabled />
              </div>
              <div className="col-span-1">
                 <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rental Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Delivery Date</Label>
              <Input id="delivery-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-date">Return Date</Label>
              <Input id="return-date" type="date" />
            </div>
            <div className="md:col-span-2 space-y-2">
               <Label htmlFor="address">Delivery Address</Label>
              <Textarea id="address" placeholder="Enter delivery address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Number</Label>
              <Input id="vehicle" placeholder="e.g., MH 12 AB 1234" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input id="remarks" placeholder="Optional notes" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-primary">-$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>$2.00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>$7.00</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="initial-paid">Initial Paid</Label>
              <Input id="initial-paid" type="number" placeholder="0.00" />
            </div>
            <div className="flex justify-between font-semibold">
              <span>Remaining Amount</span>
              <span>$7.00</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">Place Order</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
