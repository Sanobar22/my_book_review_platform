interface RatingData {
  rating: number;
  count: number;
}

interface RatingChartProps {
  data: RatingData[];
}

export function RatingChart({ data }: RatingChartProps) {
  const maxCount = Math.max(...data.map(d => d.count));
  const totalReviews = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-2">
      {data.reverse().map(({ rating, count }) => {
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
        
        return (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {rating}★
            </span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
              <div
                className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {count}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500 w-12 text-right">
              {percentage.toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
