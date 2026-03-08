import { CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceChart({
  data = [],
  xKey = 'time',
  yKey = 'price',
  height = 220,
  color = '#10b981',
  currency = 'USD',
  showHorizontalGrid = false,
  standardizeYAxis = false,
}) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const priceValues = data
    .map((point) => Number(point?.[yKey]))
    .filter((value) => Number.isFinite(value));

  const buildStandardTicks = () => {
    if (!standardizeYAxis || priceValues.length === 0) {
      return { ticks: undefined, domain: undefined };
    }

    const minValue = Math.min(...priceValues);
    const maxValue = Math.max(...priceValues);
    const range = maxValue - minValue;

    let step = 1;
    if (range <= 1) step = 0.1;
    else if (range <= 2.5) step = 0.25;
    else if (range <= 5) step = 0.5;

    const safeMin = range === 0 ? minValue - step : minValue;
    const safeMax = range === 0 ? maxValue + step : maxValue;
    const start = Math.floor(safeMin / step) * step;
    const end = Math.ceil(safeMax / step) * step;
    const tickCount = Math.ceil((end - start) / step) + 1;
    const ticks = Array.from({ length: tickCount }, (_, index) =>
      Number((start + index * step).toFixed(2))
    );

    return { ticks, domain: [start, end] };
  };

  const { ticks, domain } = buildStandardTicks();

  const formatter = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {showHorizontalGrid && <CartesianGrid stroke="#d9d9d9" strokeWidth={0.6} vertical={false} />}
        <XAxis dataKey={xKey} />
        <YAxis tickFormatter={formatter} width={80} ticks={ticks} domain={domain} />
        <Tooltip formatter={formatter} />
        <Line type="monotone" dataKey={yKey} stroke={color} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
