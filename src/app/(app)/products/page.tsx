
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MoreVertical } from 'lucide-react';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import ProductFormDialog from './product-form-dialog';
import DeleteProductAlert from './delete-product-alert';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleSaveProduct = (productData: Omit<Product, 'id'>, id?: string) => {
    if (id) {
      setProducts(products.map(p => p.id === id ? { ...p, ...productData, id } : p));
    } else {
      const newProduct: Product = {
        ...productData,
        id: (products.length + 1).toString(),
      };
      setProducts([newProduct, ...products]);
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete));
      setProductToDelete(null);
    }
  };

  const handleOpenForm = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Products</h2>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <ProductFormDialog
        product={selectedProduct}
        onSave={handleSaveProduct}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <DeleteProductAlert
        onDelete={handleDeleteProduct}
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col">
            <CardHeader className="p-0 relative">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                data-ai-hint={product.imageHint}
              />
               <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 hover:bg-background/90">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenForm(product)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(product.id)} className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-semibold mb-2">{product.name}</CardTitle>
               <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">₹{product.rate.toFixed(2)}</span> / {product.rate_unit}
              </p>
               <p className="text-sm text-muted-foreground mt-1">
                Stock: <span className="font-bold text-foreground">{product.quantity}</span>
              </p>
            </CardContent>
             <CardFooter className="p-4 pt-0">
               <Button variant="outline" className="w-full" onClick={() => handleOpenForm(product)}>
                Edit Product
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
