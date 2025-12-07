import { useState, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDrumCategories, useShops, useCreateSale } from '@/hooks/useSupabaseData';
import { useAuth } from '@/context/AuthContext';
import { SaleReceipt } from '@/components/receipt/SaleReceipt';
import { Package, User, Phone, MapPin, Printer, DollarSign } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

interface SelectedItem {
  quantity: number;
  unit_price: number;
}

export default function NewSale() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Record<string, SelectedItem>>({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: categories, isLoading: categoriesLoading } = useDrumCategories();
  const { data: shops, isLoading: shopsLoading } = useShops();
  const createSale = useCreateSale();

  const expectedReturnDate = addDays(new Date(), 30);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${customerName}-${format(new Date(), 'yyyy-MM-dd')}`,
  });

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => {
      if (checked) {
        return { ...prev, [categoryId]: { quantity: 1, unit_price: 0 } };
      } else {
        const { [categoryId]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleQuantityChange = (categoryId: string, quantity: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], quantity: Math.max(1, quantity) },
    }));
  };

  const handlePriceChange = (categoryId: string, price: number) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], unit_price: Math.max(0, price) },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const items = Object.entries(selectedCategories).map(([category_id, data]) => ({
      category_id,
      quantity: data.quantity,
      unit_price: data.unit_price,
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

      // Prepare receipt data
      const saleItems = items.map(item => {
        const category = categories?.find(c => c.id === item.category_id);
        return {
          productName: category?.name || 'Unknown',
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalAmount: item.quantity * item.unit_price,
        };
      });

      setReceiptData({
        customerName,
        customerPhone,
        customerAddress: customerAddress || undefined,
        salespersonName: profile?.name || 'Unknown',
        saleDate: new Date(),
        returnDate: expectedReturnDate,
        items: saleItems,
        grandTotal: saleItems.reduce((sum, item) => sum + item.totalAmount, 0),
      });

      setShowReceipt(true);

      toast({
        title: 'Sale Recorded Successfully',
        description: `${items.length} product type(s) sold to ${customerName}. Return due: ${format(expectedReturnDate, 'MMM d, yyyy')}`,
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record sale',
        variant: 'destructive',
      });
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedShop('');
    setSelectedCategories({});
  };

  const totalQuantity = Object.values(selectedCategories).reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = Object.values(selectedCategories).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

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

            {/* Product Types - Multiple Selection with Pricing */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Drum Product Types
              </Label>
              <div className="space-y-4 rounded-lg border p-4">
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading categories...</p>
                ) : (
                  categories?.map((category) => {
                    const isSelected = category.id in selectedCategories;
                    const item = selectedCategories[category.id];
                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            id={category.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleCategoryToggle(category.id, !!checked)}
                          />
                          <Label htmlFor={category.id} className="flex-1 cursor-pointer font-medium">
                            {category.name}
                          </Label>
                        </div>
                        {isSelected && (
                          <div className="ml-8 grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`qty-${category.id}`} className="text-xs text-muted-foreground">
                                Quantity
                              </Label>
                              <Input
                                id={`qty-${category.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(category.id, parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`price-${category.id}`} className="text-xs text-muted-foreground">
                                Unit Price (KES)
                              </Label>
                              <Input
                                id={`price-${category.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={item.unit_price || ''}
                                onChange={(e) => handlePriceChange(category.id, parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Total</Label>
                              <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                                KES {(item.quantity * item.unit_price).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {totalQuantity > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <span className="text-sm text-muted-foreground">
                    {totalQuantity} drums across {Object.keys(selectedCategories).length} product type(s)
                  </span>
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Total: KES {grandTotal.toLocaleString()}
                  </span>
                </div>
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

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sale Receipt</DialogTitle>
          </DialogHeader>
          
          {receiptData && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <SaleReceipt ref={receiptRef} sale={receiptData} />
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button onClick={handlePrint} className="flex-1" variant="drum">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button onClick={handleCloseReceipt} variant="outline" className="flex-1">
                  Close & New Sale
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}