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
import { mockSales } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, User, Hash, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmitReturn() {
  const [selectedSale, setSelectedSale] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get pending sales (not yet fully returned)
  const pendingSales = mockSales.filter((s) => s.status !== 'returned');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Return Submitted',
      description: 'Your return has been submitted for admin approval.',
    });

    // Reset form
    setSelectedSale('');
    setQuantity('');
    setIsLoading(false);
  };

  const sale = pendingSales.find((s) => s.id === selectedSale);

  return (
    <DashboardLayout title="Submit Return" subtitle="Submit empty drum returns for approval">
      <div className="max-w-2xl">
        {/* Info Banner */}
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Approval Required</p>
            <p className="text-sm text-muted-foreground">
              All returns must be approved by an admin before the drums are marked as returned.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Customer/Sale */}
            <div className="space-y-2">
              <Label htmlFor="sale" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Select Customer & Sale
              </Label>
              <Select value={selectedSale} onValueChange={setSelectedSale}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pending sale" />
                </SelectTrigger>
                <SelectContent>
                  {pendingSales.map((sale) => (
                    <SelectItem key={sale.id} value={sale.id}>
                      {sale.customerName} - {sale.productType} ({sale.quantity} drums)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show selected sale details */}
            {sale && (
              <div className="rounded-lg bg-secondary p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{sale.productType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Quantity:</span>
                  <span className="font-medium">{sale.quantity} drums</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sale Date:</span>
                  <span className="font-medium">{format(sale.saleDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Return Due:</span>
                  <span className="font-medium">{format(sale.expectedReturnDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Quantity Returned
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={sale?.quantity || 999}
                placeholder="Number of drums returned"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {/* Return Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Return Date
              </Label>
              <Input value={format(new Date(), 'MMMM d, yyyy')} disabled />
              <p className="text-xs text-muted-foreground">Today's date will be recorded</p>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading || !selectedSale}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
