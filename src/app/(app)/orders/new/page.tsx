
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Search, Edit } from 'lucide-react';
import { mockCustomers, mockProducts, mockVehicles, mockOrders } from '@/lib/data';
import type { Customer, Product, Order } from '@/lib/types';
import CustomerFormDialog from '@/app/(app)/customers/customer-form-dialog';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  productRate: z.coerce.number(),
  rentRate: z.coerce.number().min(0, "Rent rate can't be negative"),
  numberOfDays: z.coerce.number().min(1, 'Number of days must be at least 1'),
});

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  pickupRequired: z.boolean(),
  vehicleId: z.string().optional(),
  remarks: z.string().optional(),
  discountType: z.enum(['fixed', 'percentage']).optional(),
  discountValue: z.coerce.number().optional(),
  deliveryCharge: z.coerce.number().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  initialPaid: z.coerce.number().optional(),
});

type OrderFormValues = z.infer<typeof formSchema>;

export default function CreateOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [products] = useState<Product[]>(mockProducts);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const router = useRouter();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      items: [],
      deliveryAddress: '',
      pickupRequired: true,
      vehicleId: '',
      remarks: '',
      discountType: 'fixed',
      discountValue: 0,
      deliveryCharge: 0,
      paymentMethod: '',
      initialPaid: 0,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchItems = form.watch('items');
  const watchDiscountType = form.watch('discountType');
  const watchDiscountValue = form.watch('discountValue');
  const watchDeliveryCharge = form.watch('deliveryCharge');
  const watchInitialPaid = form.watch('initialPaid');

  const priceDetails = useMemo(() => {
    const price = watchItems.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.rentRate || 0) * (item.numberOfDays || 0);
      return total + itemTotal;
    }, 0);

    let discountAmount = 0;
    const discountVal = Number(watchDiscountValue) || 0;
    if (watchDiscountType === 'fixed') {
      discountAmount = discountVal;
    } else if (watchDiscountType === 'percentage') {
      discountAmount = price * (discountVal / 100);
    }
    
    const deliveryCharge = Number(watchDeliveryCharge) || 0;
    const total = price - discountAmount + deliveryCharge;
    const remainingAmount = total - (Number(watchInitialPaid) || 0);

    return { price, discountAmount, deliveryCharge, total, remainingAmount };
  }, [watchItems, watchDiscountType, watchDiscountValue, watchDeliveryCharge, watchInitialPaid]);
  
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerId', selectedCustomer.id);
      form.setValue('deliveryAddress', selectedCustomer.address || '');
    }
  }, [selectedCustomer, form]);

  const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
      const newCustomer: Customer = {
        ...customerData,
        id: (customers.length + 1).toString(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers(prev => [newCustomer, ...prev]);
      setSelectedCustomer(newCustomer);
      setIsCustomerDialogOpen(false);
  };
  
  const handleAddNewItem = () => {
    append({
      productId: '',
      quantity: 1,
      productRate: 0,
      rentRate: 0,
      numberOfDays: 1,
    });
    setEditingIndex(fields.length);
  };
  
  const handleEditItem = (index: number) => {
    setEditingIndex(index);
  }

  const handleUpdateItem = (index: number) => {
    // Manually trigger validation for the specific item
    form.trigger(`items.${index}`).then(isValid => {
      if (isValid) {
        setEditingIndex(null);
      }
    });
  };

  async function onSubmit(values: OrderFormValues) {
    console.log(values);
    
    const newOrder: Order = {
      id: `ORD${(mockOrders.length + 1).toString().padStart(3, '0')}`,
      customerName: selectedCustomer?.name || 'Unknown',
      deliveryDate: format(new Date(), 'yyyy-MM-dd'), // This can be adjusted
      returnDate: format(new Date(), 'yyyy-MM-dd'), // This can be adjusted
      totalAmount: priceDetails.total,
      status: 'Active',
    };
    mockOrders.unshift(newOrder);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    router.push('/orders');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>Select an existing customer or add a new one.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-start gap-4">
            <div className="flex-grow">
              <Controller
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isCustomerPopoverOpen}
                        className="w-full justify-between"
                      >
                        {selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.phone}` : 'Select a customer'}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search customers..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.name} ${customer.phone}`}
                                onSelect={() => {
                                  setSelectedCustomer(customer);
                                  field.onChange(customer.id);
                                  setIsCustomerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === customer.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {customer.name} - {customer.phone}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.customerId && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.customerId.message}</p>}
            </div>
            
            <CustomerFormDialog 
              onSave={handleSaveCustomer}
              open={isCustomerDialogOpen}
              onOpenChange={setIsCustomerDialogOpen}
            >
              <Button size="icon" type="button" onClick={() => setIsCustomerDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Add Customer</span>
              </Button>
            </CustomerFormDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rental Items</CardTitle>
              <CardDescription>Add utensils to the order.</CardDescription>
            </div>
            <Button size="icon" type="button" onClick={handleAddNewItem}>
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Add Item</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                {editingIndex === index ? (
                  // EDITING VIEW
                   <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Product *</Label>
                            <Controller
                                control={form.control}
                                name={`items.${index}.productId`}
                                render={({ field: controllerField }) => (
                                    <Select 
                                    onValueChange={(value) => {
                                        const product = products.find(p => p.id === value);
                                        controllerField.onChange(value);
                                        form.setValue(`items.${index}.productRate`, product?.rate || 0);
                                        form.setValue(`items.${index}.rentRate`, product?.rate || 0);
                                    }} 
                                    defaultValue={controllerField.value}
                                    >
                                    <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.items?.[index]?.productId && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.productId?.message}</p>}
                        </div>
                        <div>
                            <Label>Quantity *</Label>
                            <Input type="number" {...form.register(`items.${index}.quantity`)} />
                            {form.formState.errors.items?.[index]?.quantity && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.quantity?.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Product Rate</Label>
                            <Input {...form.register(`items.${index}.productRate`)} disabled />
                        </div>
                        <div>
                            <Label>Rent Rate *</Label>
                            <Input type="number" step="0.01" {...form.register(`items.${index}.rentRate`)} />
                            {form.formState.errors.items?.[index]?.rentRate && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.rentRate?.message}</p>}
                        </div>
                        <div>
                            <Label>No. of Days *</Label>
                            <Input type="number" {...form.register(`items.${index}.numberOfDays`)} />
                            {form.formState.errors.items?.[index]?.numberOfDays && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.numberOfDays?.message}</p>}
                        </div>
                    </div>
                    <Button type="button" onClick={() => handleUpdateItem(index)}>Done</Button>
                  </div>
                ) : (
                  // READONLY VIEW
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{products.find(p => p.id === watchItems[index].productId)?.name || 'Item not selected'}</p>
                      <p className="text-sm text-muted-foreground">
                        {watchItems[index].quantity} units x {watchItems[index].numberOfDays} days @ ₹{watchItems[index].rentRate.toFixed(2)}/day
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">₹{((watchItems[index].quantity || 0) * (watchItems[index].rentRate || 0) * (watchItems[index].numberOfDays || 0)).toFixed(2)}</p>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleEditItem(index)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
             {form.formState.errors.items && !form.formState.errors.items.root && fields.length > 0 && editingIndex === null && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Delivery & Remarks</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div>
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea placeholder="Enter delivery address" {...form.register('deliveryAddress')} />
              {form.formState.errors.deliveryAddress && <p className="text-sm font-medium text-destructive">{form.formState.errors.deliveryAddress.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                control={form.control}
                name="pickupRequired"
                render={({ field }) => (
                   <Switch id="pickup-required" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="pickup-required">Pickup Required</Label>
            </div>
            {form.watch('pickupRequired') && (
              <div>
                <Label htmlFor="vehicle">Vehicle Number</Label>
                 <Controller
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
                      <SelectContent>
                        {mockVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.number}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" placeholder="Add any special instructions or notes here" {...form.register('remarks')}/>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Price</span>
              <span>₹{priceDetails.price.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Controller
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" placeholder="0" {...form.register('discountValue')} />
              </div>
            </div>
             <div className="flex justify-between text-muted-foreground">
              <span>Discount Amount</span>
              <span>-₹{priceDetails.discountAmount.toFixed(2)}</span>
            </div>
             <div className="space-y-2">
              <Label>Delivery Charge (₹)</Label>
              <Input type="number" placeholder="0.00" {...form.register('deliveryCharge')} />
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{priceDetails.total.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Payment Method *</Label>
               <Controller
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.paymentMethod && <p className="text-sm font-medium text-destructive">{form.formState.errors.paymentMethod.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Initial Amount (₹)</Label>
              <Input type="number" placeholder="0.00" {...form.register('initialPaid')}/>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Remaining Amount</span>
              <span>₹{priceDetails.remainingAmount.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting || editingIndex !== null}>
              {form.formState.isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}

    