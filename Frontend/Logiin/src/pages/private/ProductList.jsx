import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("https://localhost:9444/api/products")
      .then((res) => setProducts(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Productos</h2>
      {products.map((p) => (
        <div key={p.id} className="border p-3 mb-2 rounded">
          <h3 className="font-semibold">{p.name}</h3>
          <p>{p.description}</p>
          <p>💲{p.price}</p>
          <p className="text-gray-500">{p.comments?.length || 0} comentarios</p>
        </div>
      ))}
    </div>
  );
}
