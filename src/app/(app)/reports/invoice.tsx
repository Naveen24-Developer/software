
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Order } from '@/lib/types';
import { mockProducts } from '@/lib/data';
import { format } from 'date-fns';
import { ChefHat } from 'lucide-react';

interface InvoiceProps {
  order: Order;
}

const Invoice = React.forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black">
      <Card className="w-full max-w-4xl mx-auto border-black shadow-none">
        <CardHeader className="border-b border-black">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-black text-white">
                <ChefHat className="size-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-headline">RentSmart</h1>
                <p className="text-sm">Cooking Utensils Rental</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold">INVOICE</h2>
              <p className="text-sm"># {order.id}</p>
            </div>
          </div>
          <div className="flex justify-between items-end mt-6">
            <div>
              <p className="font-semibold">Billed To:</p>
              <p>{order.customer.name}</p>
              <p>{order.deliveryAddress}</p>
              <p>{order.customer.phone}</p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Date of Issue:</span> {format(new Date(order.createdAt), 'PPP')}</p>
              {/* Add due date if needed */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-black font-semibold">Item</TableHead>
                <TableHead className="text-center text-black font-semibold">Quantity</TableHead>
                <TableHead className="text-center text-black font-semibold">Days</TableHead>
                <TableHead className="text-right text-black font-semibold">Rate</TableHead>
                <TableHead className="text-right text-black font-semibold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map(item => {
                const product = mockProducts.find(p => p.id === item.productId);
                return (
                  <TableRow key={item.productId}>
                    <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.numberOfDays}</TableCell>
                    <TableCell className="text-right">₹{item.rentRate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{(item.quantity * item.rentRate * item.numberOfDays).toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-6">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span>₹{order.priceDetails.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Discount:</span>
                <span className="text-red-600">- ₹{order.priceDetails.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Delivery Charge:</span>
                <span>+ ₹{order.priceDetails.deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-b border-black py-2 my-2">
                <span>Total:</span>
                <span>₹{order.priceDetails.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Amount Paid:</span>
                <span>₹{(order.initialPaid || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Remaining Balance:</span>
                <span>₹{order.priceDetails.remainingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 border-t border-black p-6">
            <div>
                <p className="font-semibold">Terms & Conditions</p>
                <ul className="text-xs list-disc list-inside">
                    <li>All items must be returned in the same condition as received.</li>
                    <li>Any damages to the items will be charged separately.</li>
                    <li>Late returns will incur additional charges.</li>
                </ul>
            </div>
          <p className="text-center text-sm w-full">Thank you for your business!</p>
        </CardFooter>
      </Card>
    </div>
  );
});

Invoice.displayName = 'Invoice';
export default Invoice;
