import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDrumCategories, useShops, useCreateSale } from '@/hooks/useSupabaseData';
import { Package, User, Phone, Hash, MapPin } from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function NewSale() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const { data: categories, isLoading: categoriesLoading } = useDrumCategories();
  const { data: shops, isLoading: shopsLoading } = useShops();
  const createSale = useCreateSale();

  const expectedReturnDate = addDays(new Date(), 30);

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => {
      if (checked) {
        return { ...prev, [categoryId]: 1 };
      } else {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleQuantityChange = (categoryId: string, quantity: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: Math.max(1, quantity),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const items = Object.entries(selectedCategories).map(([category_id, quantity]) => ({
      category_id,
      quantity,
    }));

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one product type',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSale.mutateAsync({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress || undefined,
        shop_id: selectedShop,
        items,
      });

      toast({
        title: 'Sale Recorded Successfully',
        description: `${items.length} product type(s) sold to ${customerName}. Return due: ${format(expectedReturnDate, 'MMM d, yyyy')}`,
      });

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSelectedShop('');
      setSelectedCategories({});
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record sale',
        variant: 'destructive',
      });
    }
  };

  const totalQuantity = Object.values(selectedCategories).reduce((sum, qty) => sum + qty, 0);

  return (
    <DashboardLayout title="New Sale" subtitle="Record a new drum sale">
      <div className="max-w-2xl">
        <div className="rounded-xl border bg-card p-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer Name
              </Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Customer Phone
              </Label>
              <Input
                id="customerPhone"
                placeholder="+254..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            {/* Customer Address */}
            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Customer Address (Optional)
              </Label>
              <Input
                id="customerAddress"
                placeholder="Enter address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>

            {/* Shop Selection */}
            <div className="space-y-2">
              <Label htmlFor="shop" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Shop
              </Label>
              <Select value={selectedShop} onValueChange={setSelectedShop} required>
                <SelectTrigger>
                  <SelectValue placeholder={shopsLoading ? "Loading..." : "Select shop"} />
                </SelectTrigger>
                <SelectContent>
                  {shops?.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Types - Multiple Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Drum Product Types
              </Label>
              <div className="space-y-3 rounded-lg border p-4">
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading categories...</p>
                ) : (
                  categories?.map((category) => {
                    const isSelected = category.id in selectedCategories;
                    return (
                      <div key={category.id} className="flex items-center gap-4">
                        <Checkbox
                          id={category.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCategoryToggle(category.id, !!checked)}
                        />
                        <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                          {category.name}
                        </Label>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`qty-${category.id}`} className="text-sm text-muted-foreground">
                              Qty:
                            </Label>
                            <Input
                              id={`qty-${category.id}`}
                              type="number"
                              min="1"
                              className="w-20"
                              value={selectedCategories[category.id]}
                              onChange={(e) => handleQuantityChange(category.id, parseInt(e.target.value) || 1)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {totalQuantity > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total: {totalQuantity} drums across {Object.keys(selectedCategories).length} product type(s)
                </p>
              )}
            </div>

            {/* Return Date Info */}
            <div className="rounded-lg bg-drum/10 border border-drum/20 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Expected Return Date:</strong>{' '}
                {format(expectedReturnDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drums must be returned within 30 days of sale
              </p>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              variant="drum" 
              disabled={createSale.isPending || !selectedShop || Object.keys(selectedCategories).length === 0}
            >
              {createSale.isPending ? 'Recording Sale...' : 'Record Sale'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
