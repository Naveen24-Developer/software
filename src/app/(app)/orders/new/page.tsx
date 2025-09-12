'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays, format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Search } from 'lucide-react';
import { mockCustomers, mockProducts, mockVehicles } from '@/lib/data';
import type { Customer, Product } from '@/lib/types';
import CustomerFormDialog from '@/app/(app)/customers/customer-form-dialog';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  rate: z.coerce.number(),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
});

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  useHomeDelivery: z.boolean(),
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

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      items: [],
      deliveryAddress: '',
      useHomeDelivery: false,
      vehicleId: '',
      remarks: '',
      discountType: 'fixed',
      discountValue: 0,
      deliveryCharge: 0,
      paymentMethod: '',
      initialPaid: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchItems = form.watch('items');
  const watchDiscountType = form.watch('discountType');
  const watchDiscountValue = form.watch('discountValue');
  const watchDeliveryCharge = form.watch('deliveryCharge');
  const watchInitialPaid = form.watch('initialPaid');
  const watchUseHomeDelivery = form.watch('useHomeDelivery');

  const priceDetails = useMemo(() => {
    const price = watchItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product || !item.deliveryDate || !item.returnDate) return total;
      
      const days = differenceInDays(new Date(item.returnDate), new Date(item.deliveryDate)) + 1;
      const itemTotal = item.quantity * product.rate * (days > 0 ? days : 1);
      return total + itemTotal;
    }, 0);

    let discountAmount = 0;
    if (watchDiscountType === 'fixed') {
      discountAmount = watchDiscountValue || 0;
    } else if (watchDiscountType === 'percentage') {
      discountAmount = price * ((watchDiscountValue || 0) / 100);
    }
    
    const deliveryCharge = watchUseHomeDelivery ? (watchDeliveryCharge || 0) : 0;
    const total = price - discountAmount + deliveryCharge;
    const remainingAmount = total - (watchInitialPaid || 0);

    return { price, discountAmount, deliveryCharge, total, remainingAmount };
  }, [watchItems, products, watchDiscountType, watchDiscountValue, watchDeliveryCharge, watchInitialPaid, watchUseHomeDelivery]);
  
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerId', selectedCustomer.id);
      form.setValue('deliveryAddress', selectedCustomer.address);
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
      rate: 0,
      deliveryDate: format(new Date(), 'yyyy-MM-dd'),
      returnDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  function onSubmit(values: OrderFormValues) {
    console.log(values);
    // Here you would typically send the data to your backend
    alert('Order placed successfully! (Check console for data)');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
            <CardDescription>Select an existing customer or add a new one.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
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
            {form.formState.errors.customerId && <p className="text-sm font-medium text-destructive">{form.formState.errors.customerId.message}</p>}
            
            <CustomerFormDialog 
              onSave={handleSaveCustomer}
              open={isCustomerDialogOpen}
              onOpenChange={setIsCustomerDialogOpen}
            >
              <Button variant="outline" type="button" onClick={() => setIsCustomerDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </CustomerFormDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental Items</CardTitle>
            <CardDescription>Add utensils to the order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Product *</Label>
                     <Controller
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field: controllerField }) => (
                        <Select 
                          onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            controllerField.onChange(value);
                            form.setValue(`items.${index}.rate`, product?.rate || 0);
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
                    <Label>Qty *</Label>
                    <Input type="number" {...form.register(`items.${index}.quantity`)} />
                     {form.formState.errors.items?.[index]?.quantity && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.quantity?.message}</p>}
                  </div>
                  <div>
                    <Label>Rate</Label>
                    <Input {...form.register(`items.${index}.rate`)} disabled />
                  </div>
                  <div>
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="w-full">
                       <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Delivery Date *</Label>
                    <Input type="date" {...form.register(`items.${index}.deliveryDate`)} />
                    {form.formState.errors.items?.[index]?.deliveryDate && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.deliveryDate?.message}</p>}
                  </div>
                  <div>
                    <Label>Return Date *</Label>
                    <Input type="date" {...form.register(`items.${index}.returnDate`)} />
                    {form.formState.errors.items?.[index]?.returnDate && <p className="text-sm font-medium text-destructive">{form.formState.errors.items?.[index]?.returnDate?.message}</p>}
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={handleAddNewItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
             {form.formState.errors.items && !form.formState.errors.items.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>}
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
                name="useHomeDelivery"
                render={({ field }) => (
                   <Switch id="home-delivery" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="home-delivery">Home Delivery</Label>
            </div>
            {watchUseHomeDelivery && (
              <div>
                <Label htmlFor="vehicle">Vehicle Number *</Label>
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
            {watchUseHomeDelivery && (
              <div className="space-y-2">
                <Label>Delivery Charge (₹)</Label>
                <Input type="number" placeholder="0.00" {...form.register('deliveryCharge')} />
              </div>
            )}
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
            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
