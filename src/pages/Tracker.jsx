import { useState, useEffect } from "react";
import mockItems from "../data/mockItems";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


export default function Tracker() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePrice, setStorePrice] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [search, setSearch] = useState("");
  const [priceHistory, setPriceHistory] = useState({});

  useEffect(() => {
    setItems(mockItems);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prevItems => {
        return prevItems.map(item => {
          const newPrices = item.prices.map(priceEntry => {
            const change = priceEntry.price * (Math.random() * 0.1 - 0.05);
            const newPrice = +(priceEntry.price + change).toFixed(2);
            return { ...priceEntry, price: Math.max(newPrice, 1) };
          });

          const lowest = Math.min(...newPrices.map(p => p.price));
          const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });

          setPriceHistory(prev => ({
            ...prev,
            [item.id]: [
              ...(prev[item.id] || []),
              { time: timestamp, price: lowest }
            ]
          }));

          return { ...item, prices: newPrices };
        });
      });
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []); // ✅ Only run once on mount!





  const addItem = () => {
    if (!itemName.trim()) return;
    const newItem = {
      id: Date.now(),
      name: itemName,
      prices: [],
    };
    setItems([...items, newItem]);
    setItemName("");
  };

  const addPrice = () => {
    if (!storeName.trim() || !storePrice || selectedItemId === null) return;

    setItems(items.map(item => {
      if (item.id === selectedItemId) {
        return {
          ...item,
          prices: [
            ...item.prices,
            { store: storeName, price: parseFloat(storePrice) }
          ]
        };
      }
      return item;
    }));

    setStoreName("");
    setStorePrice("");
    setSelectedItemId(null);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">🧪 Vault Prices Test Environment</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search items..."
        className="border px-2 py-1 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Add New Item */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New item name"
          className="border px-2 py-1 w-full"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <button
          onClick={addItem}
          className="bg-emerald-500 text-white px-4 py-1 rounded"
        >
          Add Item
        </button>
      </div>

      {/* Add Price for Selected Item */}
      {items.length > 0 && (
        <div className="space-y-2">
          <select
            className="border px-2 py-1 w-full"
            value={selectedItemId || ""}
            onChange={(e) => setSelectedItemId(Number(e.target.value))}
          >
            <option value="" disabled>Select an item to add a price</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Store (e.g. eBay)"
              className="border px-2 py-1 w-full"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              className="border px-2 py-1 w-24"
              value={storePrice}
              onChange={(e) => setStorePrice(e.target.value)}
            />
            <button
              onClick={addPrice}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Add Price
            </button>
          </div>
        </div>
      )}

      {/* Display Items */}
      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} className="border p-3 rounded bg-white shadow-sm">
            <h3 className="font-semibold">{item.name}</h3>
            {item.prices.length > 0 ? (
              <div className="flex gap-4 items-center mt-2">
                {item.prices.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                    <img
                        src={`/logos/${entry.store.toLowerCase()}.png`}
                        alt={entry.store}
                        className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm font-medium">: ${entry.price.toFixed(2)}</span>
                    </div>
                ))}
                </div>

            ) : (
              <p className="text-sm text-gray-500">No prices yet</p>
            )}

            {priceHistory[item.id] && priceHistory[item.id].length > 1 && (
  <div className="mt-4">
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={priceHistory[item.id].slice(-6)}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#10b981" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}

          </div>
        ))}
      </div>
    </div>
  );
}

