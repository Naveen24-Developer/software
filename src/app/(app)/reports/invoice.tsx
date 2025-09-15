
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { mockProducts } from '@/lib/data';

interface InvoiceProps {
  order: Order;
}

const Invoice = React.forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="print-only p-8 bg-white text-black">
      <Card className="w-full max-w-4xl mx-auto border-none shadow-none">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold font-headline text-primary">RentSmart</h1>
              <p>123 Culinary Lane, Foodie City, 10101</p>
              <p>contact@rentsmart.example.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p><strong>Invoice #:</strong> {order.id}</p>
              <p><strong>Date:</strong> {format(new Date(order.createdAt), 'PPP')}</p>
            </div>
          </div>
          <Separator className="my-4" />
           <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Bill To:</h3>
                <p>{order.customer.name}</p>
                <p>{order.deliveryAddress}</p>
                <p>{order.customer.phone}</p>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted'>
                <TableHead>Item Description</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => {
                 const product = mockProducts.find(p => p.id === item.productId);
                 const subtotal = item.quantity * item.rentRate * item.numberOfDays;
                 return (
                    <TableRow key={index}>
                        <TableCell>{product?.name || 'Unknown Item'}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">{item.numberOfDays}</TableCell>
                        <TableCell className="text-right">₹{item.rentRate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                 )
              })}
            </TableBody>
          </Table>
           <div className="flex justify-end mt-4">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.priceDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-destructive">- ₹{order.priceDetails.discountAmount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>₹{order.priceDetails.deliveryCharge.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.priceDetails.total.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Amount Paid</span>
                    <span>₹{(order.initialPaid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg bg-secondary/50 p-2 rounded-md">
                    <span>Remaining Amount</span>
                    <span>₹{order.priceDetails.remainingAmount.toFixed(2)}</span>
                </div>
              </div>
           </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground">Terms & Conditions</h3>
            <p>1. All items must be returned in the same condition as rented.</p>
            <p>2. Late returns will be subject to additional charges.</p>
            <p>3. Payment is due upon receipt of invoice.</p>
            <p className="text-center w-full mt-8">Thank you for your business!</p>
        </CardFooter>
      </Card>
    </div>
  );
});

Invoice.displayName = 'Invoice';
export default Invoice;
