
'use client';

import { useState, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronDown, ChevronUp, FileDown, Printer, Calendar as CalendarIcon } from 'lucide-react';
import { mockOrders, mockProducts } from '@/lib/data';
import type { Order } from '@/lib/types';
import { format, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getPaymentStatus = (order: Order): { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
  if (order.status === 'Cancelled') return { text: 'Cancelled', variant: 'destructive' };
  if (order.priceDetails.remainingAmount <= 0) return { text: 'Paid', variant: 'outline' };
  if (order.initialPaid && order.initialPaid > 0) return { text: 'Partial', variant: 'outline' };
  return { text: 'Unpaid', variant: 'destructive' };
};

const Invoice = ({ order }: { order: Order | null }) => {
  if (!order) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-black">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">RentSmart</h1>
          <p className="text-gray-500">Cooking Utensils Rental</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">Invoice #{order.id}</h2>
          <p className="text-gray-500">Date: {format(new Date(order.createdAt), 'PPP')}</p>
        </div>
      </header>

      <section className="flex justify-between mb-10">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Billed To</h3>
          <p>{order.customer.name}</p>
          <p>{order.customer.address}</p>
          <p>{order.customer.phone}</p>
        </div>
        <div className="space-y-1 text-right">
          <h3 className="font-semibold text-lg">From</h3>
          <p>RentSmart Inc.</p>
          <p>123 Culinary Lane</p>
          <p>Foodville, FK 54321</p>
        </div>
      </section>

      <section>
        <Table className="text-base">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-1/2">Item Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Days</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map(item => {
              const product = mockProducts.find(p => p.id === item.productId);
              return (
                 <TableRow key={item.productId}>
                  <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.numberOfDays}</TableCell>
                  <TableCell className="text-right">₹{item.rentRate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{(item.quantity * item.rentRate * item.numberOfDays).toFixed(2)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </section>
      
      <section className="flex justify-end mt-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{order.priceDetails.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount</span>
            <span className="text-red-500">- ₹{order.priceDetails.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Charge</span>
            <span>₹{order.priceDetails.deliveryCharge.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{order.priceDetails.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid</span>
            <span>₹{(order.initialPaid || 0).toFixed(2)}</span>
          </div>
           <div className="flex justify-between font-bold text-xl bg-gray-100 p-3 rounded-lg">
            <span>Amount Due</span>
            <span>₹{order.priceDetails.remainingAmount.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <footer className="mt-20 text-center text-gray-500">
        <p>Thank you for your business!</p>
        <p>Questions? Contact us at support@rentsmart.com</p>
      </footer>
    </div>
  );
};


export default function ReportsPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    onAfterPrint: () => setOrderToPrint(null),
  });
  
  const triggerPrint = (order: Order) => {
    setOrderToPrint(order);
  }

  useMemo(() => {
    if (orderToPrint) {
      handlePrint();
    }
  }, [orderToPrint, handlePrint]);


  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (dateRange?.from) {
      const to = dateRange.to || dateRange.from;
      filtered = orders.filter(o => isWithinInterval(new Date(o.createdAt), { start: dateRange.from!, end: to }));
    }

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [orders, filter, dateRange, searchTerm]);
  
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const now = new Date();
    switch (newFilter) {
      case 'today':
        setDateRange({ from: now, to: now });
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        setDateRange({ from: startOfWeek, to: now });
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateRange({ from: startOfMonth, to: now });
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        setDateRange({ from: startOfYear, to: now });
        break;
      case 'all':
        setDateRange(undefined);
        break;
      default:
        break;
    }
  }

  const filterLabels: { [key: string]: string } = {
    all: 'All Time',
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    custom: 'Custom Range'
  };
  
  const handleExportPDF = () => {
    alert("Exporting as PDF...");
    // Future implementation of PDF export can go here.
    // For now, users can use the browser's "Save as PDF" in the print dialog.
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Order Reports</h2>
          <p className="text-muted-foreground">Review and manage all order details.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => { setDateRange(range); setFilter('custom'); }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(filterLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} disabled={key === 'custom' && !dateRange?.from}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>{filteredOrders.length} order(s) found.</CardDescription>
            </div>
             <div className="flex flex-wrap items-center gap-4">
              <Input 
                placeholder="Search by Order ID or Customer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 print-hidden"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="print-hidden">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF}>
                     <FileDown className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] print-hidden"></TableHead>
                <TableHead>S.No</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="print-hidden">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <Collapsible asChild key={order.id} open={openOrderId === order.id} onOpenChange={() => setOpenOrderId(prev => prev === order.id ? null : order.id)}>
                  <>
                    <TableRow className="cursor-pointer">
                      <TableCell className="print-hidden">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {openOrderId === order.id ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'PP')}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell className="text-right">₹{order.priceDetails.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{(order.initialPaid || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{order.priceDetails.remainingAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatus(order).variant}>{getPaymentStatus(order).text}</Badge>
                      </TableCell>
                      <TableCell className="print-hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Mark as Returned</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => triggerPrint(order)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                       <TableRow>
                        <TableCell colSpan={10} className="p-0 print-hidden">
                           <div className="p-4 bg-muted/50">
                            <h4 className="font-semibold mb-2">Order Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div><strong>Address:</strong> {order.deliveryAddress}</div>
                               <div><strong>Payment Method:</strong> {order.paymentMethod}</div>
                               {order.remarks && <div className="col-span-1 sm:col-span-2"><strong>Remarks:</strong> {order.remarks}</div>}
                            </div>
                            <h5 className="font-semibold mt-4 mb-2">Items Rented</h5>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Days</TableHead>
                                  <TableHead className="text-right">Rate</TableHead>
                                  <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items.map(item => {
                                  const product = mockProducts.find(p => p.id === item.productId);
                                  return (
                                     <TableRow key={item.productId}>
                                      <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{item.numberOfDays}</TableCell>
                                      <TableCell className="text-right">₹{item.rentRate.toFixed(2)}</TableCell>
                                      <TableCell className="text-right">₹{(item.quantity * item.rentRate * item.numberOfDays).toFixed(2)}</TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
           {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No orders found for the selected criteria.
            </div>
          )}
        </CardContent>
      </Card>
      <div className="print-only">
        <div ref={invoiceRef}>
          <Invoice order={orderToPrint} />
        </div>
      </div>
    </div>
  );
}

