const mockGroceries = [
  {
    id: 1,
    name: 'Whole Milk',
    unit: '1 gal',
    currentPrices: [
      { store: 'Walmart', price: 3.48 },
      { store: 'Target', price: 3.69 },
      { store: 'Kroger', price: 3.59 },
    ],
    history: [
      { label: 'Feb 1', price: 3.29 },
      { label: 'Feb 8', price: 3.39 },
      { label: 'Feb 15', price: 3.49 },
      { label: 'Feb 22', price: 3.59 },
      { label: 'Mar 1', price: 3.48 },
    ],
  },
  {
    id: 2,
    name: 'Large Eggs',
    unit: '12 ct',
    currentPrices: [
      { store: 'Walmart', price: 2.89 },
      { store: 'Target', price: 3.19 },
      { store: 'Kroger', price: 2.99 },
    ],
    history: [
      { label: 'Feb 1', price: 2.69 },
      { label: 'Feb 8', price: 2.79 },
      { label: 'Feb 15', price: 2.99 },
      { label: 'Feb 22', price: 3.09 },
      { label: 'Mar 1', price: 2.89 },
    ],
  },
  {
    id: 3,
    name: 'Bananas',
    unit: 'per lb',
    currentPrices: [
      { store: 'Walmart', price: 0.62 },
      { store: 'Target', price: 0.65 },
      { store: 'Kroger', price: 0.59 },
    ],
    history: [
      { label: 'Feb 1', price: 0.58 },
      { label: 'Feb 8', price: 0.6 },
      { label: 'Feb 15', price: 0.62 },
      { label: 'Feb 22', price: 0.64 },
      { label: 'Mar 1', price: 0.62 },
    ],
  },
  {
    id: 4,
    name: 'Chicken Breast',
    unit: 'per lb',
    currentPrices: [
      { store: 'Walmart', price: 3.98 },
      { store: 'Target', price: 4.29 },
      { store: 'Kroger', price: 4.19 },
    ],
    history: [
      { label: 'Feb 1', price: 3.79 },
      { label: 'Feb 8', price: 3.89 },
      { label: 'Feb 15', price: 4.05 },
      { label: 'Feb 22', price: 4.15 },
      { label: 'Mar 1', price: 3.98 },
    ],
  },
  {
    id: 5,
    name: 'White Bread',
    unit: '20 oz loaf',
    currentPrices: [
      { store: 'Walmart', price: 2.49 },
      { store: 'Target', price: 2.69 },
      { store: 'Kroger', price: 2.59 },
    ],
    history: [
      { label: 'Feb 1', price: 2.29 },
      { label: 'Feb 8', price: 2.39 },
      { label: 'Feb 15', price: 2.49 },
      { label: 'Feb 22', price: 2.59 },
      { label: 'Mar 1', price: 2.49 },
    ],
  },
];

export default mockGroceries;
