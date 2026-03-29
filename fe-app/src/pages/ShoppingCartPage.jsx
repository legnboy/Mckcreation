import React, { useEffect, useState } from "react";
import ShoppingCart from "../components/account/ShoppingCart";
import PageCounter from "../components/PageCounter";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const ShoppingCartPage = () => {
  const [orders, setOrders] = useState({ orderList: [], count: 0 }); // count = totalItems
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(0);

  const jwt = localStorage.getItem("jwt");
  const nav = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  console.log(API_BASE_URL)

  useEffect(() => {
    if (!jwt) {
      nav("/account/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/order/get-orders?page=${page}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        console.log(data)
        const totalItems = data.count ?? 0;
        const pages = Math.ceil(totalItems / PAGE_SIZE);

        setTotalPages(pages);

        // If you're on a page that no longer exists, jump back to last valid page
        if (pages > 0 && page > pages - 1) {
          setPage(pages - 1);
        }

        // If there are 0 items, force page back to 0
        if (pages === 0 && page !== 0) {
          setPage(0);
        }
      })
      .catch(console.log);
  }, [jwt, nav, page, API_BASE_URL]);

  console.log(totalPages)

  return (
    <>
      <ShoppingCart orders={orders.orderList} jwt={jwt} />

      <div className="mt-8">
        <PageCounter page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
};

export default ShoppingCartPage;
