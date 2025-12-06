import { DrumProductType } from '@/types';

interface ProductBreakdownProps {
  data: Record<DrumProductType, number>;
}

const productColors: Record<DrumProductType, string> = {
  'Love White': 'bg-rose-500',
  'Mango White': 'bg-amber-500',
  'King White': 'bg-drum',
  'SOS White': 'bg-emerald-500',
};

export function ProductBreakdown({ data }: ProductBreakdownProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="rounded-xl border bg-card p-6 animate-slide-up opacity-0 stagger-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sales by Product</h3>
      <div className="mt-4 space-y-4">
        {(Object.entries(data) as [DrumProductType, number][]).map(([product, count]) => {
          const percentage = Math.round((count / total) * 100);
          return (
            <div key={product}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{product}</span>
                <span className="text-muted-foreground">{count} drums ({percentage}%)</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${productColors[product]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
