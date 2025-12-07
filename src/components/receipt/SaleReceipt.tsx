import { forwardRef } from 'react';
import { format } from 'date-fns';

interface SaleReceiptProps {
  sale: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    salespersonName: string;
    saleDate: Date;
    returnDate: Date;
    items: { productName: string; quantity: number }[];
  };
}

export const SaleReceipt = forwardRef<HTMLDivElement, SaleReceiptProps>(({ sale }, ref) => {
  const totalQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div ref={ref} className="bg-white text-black p-8 max-w-md mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold">DRUMTRACK</h1>
        <p className="text-sm">Drum Sales Receipt</p>
      </div>

      {/* Receipt Details */}
      <div className="space-y-4 text-sm">
        {/* Customer Info */}
        <div className="border-b border-gray-300 pb-3">
          <h2 className="font-bold text-base mb-2">Customer Information</h2>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Name:</span>
            <span>{sale.customerName}</span>
            <span className="font-medium">Phone:</span>
            <span>{sale.customerPhone}</span>
            {sale.customerAddress && (
              <>
                <span className="font-medium">Address:</span>
                <span>{sale.customerAddress}</span>
              </>
            )}
          </div>
        </div>

        {/* Items Sold */}
        <div className="border-b border-gray-300 pb-3">
          <h2 className="font-bold text-base mb-2">Items Sold</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1">Drum Type</th>
                <th className="text-right py-1">Qty</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-1">{item.productName}</td>
                  <td className="text-right py-1">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300 font-bold">
                <td className="py-2">Total</td>
                <td className="text-right py-2">{totalQuantity} drums</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Dates */}
        <div className="border-b border-gray-300 pb-3">
          <h2 className="font-bold text-base mb-2">Important Dates</h2>
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Sale Date:</span>
            <span>{format(sale.saleDate, 'MMMM d, yyyy')}</span>
            <span className="font-medium text-red-600">Return Deadline:</span>
            <span className="font-bold text-red-600">{format(sale.returnDate, 'MMMM d, yyyy')}</span>
          </div>
        </div>

        {/* Salesperson */}
        <div className="border-b border-gray-300 pb-3">
          <h2 className="font-bold text-base mb-2">Salesperson</h2>
          <p>{sale.salespersonName}</p>
          
          {/* Signature Line */}
          <div className="mt-8">
            <div className="border-b border-black w-48"></div>
            <p className="text-xs mt-1">Salesperson Signature</p>
          </div>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-600 pt-2">
          <p className="font-bold mb-1">Terms & Conditions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Drums must be returned within 30 days of sale.</li>
            <li>Late returns may incur additional charges.</li>
            <li>Please keep this receipt for your records.</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500">Thank you for your business!</p>
        <p className="text-xs text-gray-400 mt-1">Printed on {format(new Date(), 'MMM d, yyyy h:mm a')}</p>
      </div>
    </div>
  );
});

SaleReceipt.displayName = 'SaleReceipt';
