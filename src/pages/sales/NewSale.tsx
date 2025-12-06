import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DrumProductType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Package, User, Phone, Hash } from 'lucide-react';
import { addDays, format } from 'date-fns';

const productTypes: DrumProductType[] = ['Love White', 'Mango White', 'King White', 'SOS White'];

export default function NewSale() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productType, setProductType] = useState<DrumProductType | ''>('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const expectedReturnDate = addDays(new Date(), 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Sale Recorded Successfully',
      description: `${quantity} drums of ${productType} sold to ${customerName}. Return due: ${format(expectedReturnDate, 'MMM d, yyyy')}`,
    });

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setProductType('');
    setQuantity('');
    setIsLoading(false);
  };

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

            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Drum Product Type
              </Label>
              <Select value={productType} onValueChange={(val) => setProductType(val as DrumProductType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Number of drums"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
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
            <Button type="submit" className="w-full" variant="drum" disabled={isLoading}>
              {isLoading ? 'Recording Sale...' : 'Record Sale'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
