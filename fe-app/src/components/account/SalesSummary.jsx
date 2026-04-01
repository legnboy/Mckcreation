import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageCounter from '../PageCounter';

const PAGE_SIZE = 10;

/**
 * SalesSummary — Admin view for sales data with paginated orders and client-side page cache.
 *
 * Cache strategy: fetched pages are stored in pageCache (a Map held in a ref).
 * Re-visiting a page that's already cached skips the network call entirely.
 * Cache is invalidated when the component unmounts or the admin navigates away
 * (intentionally session-scoped — no persistence across refreshes).
 */
const SalesSummary = ({ jwt }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ── Sales summary ──────────────────────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // ── Paginated orders ───────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // ── Client-side page cache  ────────────────────────────────────────────────
  // Map<pageNumber, { orders: PlacedOrder[], totalPages: number }>
  const pageCache = useRef(new Map());

  // ── Fetch sales summary (once) ─────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    setSummaryLoading(true);
    setSummaryError(null);

    fetch(`${API_BASE_URL}/api/placed-orders/sales-summary`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setSummaryLoading(false);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          setSummaryError('Failed to load sales summary.');
          setSummaryLoading(false);
        }
      });

    return () => controller.abort();
  }, [API_BASE_URL, jwt]);

  // ── Fetch paginated orders (with cache) ────────────────────────────────────
  const fetchPage = useCallback(
    (targetPage) => {
      // Cache hit — no network call needed
      if (pageCache.current.has(targetPage)) {
        const cached = pageCache.current.get(targetPage);
        setOrders(cached.orders);
        setTotalPages(cached.totalPages);
        setOrdersLoading(false);
        return;
      }

      const controller = new AbortController();
      setOrdersLoading(true);
      setOrdersError(null);

      const url = new URL(`${API_BASE_URL}/api/placed-orders`);
      url.searchParams.set('page', targetPage);
      url.searchParams.set('size', PAGE_SIZE);

      fetch(url.toString(), {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${jwt}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // Spring Page response shape: { content, totalPages, totalElements, ... }
          const fetched = {
            orders: data.content ?? [],
            totalPages: data.totalPages ?? 1,
          };
          pageCache.current.set(targetPage, fetched);
          setOrders(fetched.orders);
          setTotalPages(fetched.totalPages);
          setOrdersLoading(false);
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') {
            setOrdersError('Failed to load orders.');
            setOrdersLoading(false);
          }
        });

      // We don't abort here since page changes are synchronous user actions;
      // the cache prevents double-fetching the same page.
    },
    [API_BASE_URL, jwt]
  );

  // ── Trigger fetch whenever page changes ───────────────────────────────────
  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt = (val) =>
    val != null
      ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '—';

  const formatDate = (raw) => {
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="text-center m-10">
      <h1 className="text-3xl font-bold mb-8">Sales Summary</h1>

      {/* ── Summary cards ── */}
      {summaryError && (
        <p className="text-red-500 mb-4">{summaryError}</p>
      )}

      <div className="flex flex-wrap w-full max-w-4xl m-auto items-center justify-around mb-12">
        {[
          { label: 'Daily Sales', key: 'dailySales' },
          { label: 'Monthly Sales', key: 'monthlySales' },
          { label: 'Yearly Sales', key: 'yearlySales' },
          { label: 'All Time Sales', key: 'allTimeSales' },
        ].map(({ label, key }) => (
          <div
            key={key}
            className="flex justify-center items-center border border-black flex-col w-72 h-56 bg-pink-400 mt-10 rounded-lg shadow"
          >
            <h2 className="text-2xl font-semibold">{label}</h2>
            <p className="text-3xl mt-5 font-bold">
              {summaryLoading ? '…' : fmt(summary?.[key])}
            </p>
          </div>
        ))}
      </div>

      {/* ── Orders table ── */}
      <h2 className="text-2xl font-semibold mb-4">All Orders</h2>

      {ordersError && <p className="text-red-500 mb-4">{ordersError}</p>}

      <div className="overflow-x-auto max-w-5xl mx-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-2 px-4 font-mono text-sm">{order.id}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {order.status ?? '—'}
                    </span>
                  </td>
                  <td className="py-2 px-4">{fmt(order.amount)}</td>
                  <td className="py-2 px-4">
                    {order.user
                      ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim() || order.user.email
                      : '—'}
                  </td>
                  <td className="py-2 px-4">{formatDate(order.orderDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="mt-6 mb-4">
        <PageCounter
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
};

export default SalesSummary;
