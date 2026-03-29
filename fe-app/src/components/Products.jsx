import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaBars } from "react-icons/fa";
import Product from "./Product";

const ALL_CATEGORY_ID = 1;

const Products = ({
  items = [],
  categories = [],
  user,
  jwt,
  categoryId = ALL_CATEGORY_ID,
  onCategoryChange,
  count = 0,
  page = 0,
  pageSize = 10,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const categoriesWithAll = useMemo(() => {
    // Ensure an "All" button exists with id=1
    const hasAll = categories.some((c) => c.id === ALL_CATEGORY_ID);
    return hasAll ? categories : [{ id: ALL_CATEGORY_ID, name: "All" }, ...categories];
  }, [categories]);

  const isAdmin = !!jwt && user?.role === "ROLE_ADMIN";

  const showingFrom = count === 0 ? 0 : page * pageSize + 1;
  const showingTo = Math.min((page + 1) * pageSize, count);

  return (
    <div className="flex flex-col items-center px-4">
      {/* Mobile Hamburger Toggle */}
      <div className="w-full flex justify-end md:hidden mt-4 mb-2">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-pink-600 bg-white border border-pink-300 p-2 rounded-full shadow hover:bg-pink-100 transition"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Category Submenu */}
      <div
        className={`flex flex-wrap justify-center gap-3 md:flex ${
          menuOpen ? "flex" : "hidden"
        } md:flex bg-pink-200 p-3 rounded-xl shadow-lg mb-4 transition-all duration-300`}
      >
        {categoriesWithAll.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full text-sm md:text-base font-semibold transition-all ${
              categoryId === category.id
                ? "bg-pink-500 text-white"
                : "bg-white text-pink-500 hover:bg-pink-300"
            }`}
            onClick={() => {
              onCategoryChange?.(category.id);
              setMenuOpen(false);
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Count line */}
      <div className="w-full max-w-6xl mb-6 text-sm text-gray-600">
        {count > 0 ? (
          <span>
            Showing <span className="font-semibold">{showingFrom}</span>–{" "}
            <span className="font-semibold">{showingTo}</span> of{" "}
            <span className="font-semibold">{count}</span>
          </span>
        ) : (
          <span></span>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.length > 0 ? (
          items.map((item) => <Product key={item.id} item={item} />)
        ) : (
          <p className="text-center col-span-full">No products available</p>
        )}
      </div>

      {/* Add Product Button (Admin Only) */}
      {isAdmin && (
        <Link to={"/shop/item/form"}>
          <button className="fixed bottom-8 right-8 bg-pink-500 text-white p-5 rounded-full shadow-lg hover:bg-pink-700 transition transform hover:scale-110">
            <FaPlus size={28} />
          </button>
        </Link>
      )}
    </div>
  );
};

export default Products;