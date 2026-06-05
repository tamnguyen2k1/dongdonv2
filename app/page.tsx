"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import DashboardPage from "../components/DashboardPage";
import OrdersPage from "../components/OrdersPage";
import PickerPage from "../components/PickerPage";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import ModalDetail from "../components/ModalDetail";
import OverviewPage from "../components/OverviewPage";
import Toast, { type ToastItem } from "../components/Toast";
import ReadyPackRatePage from "../components/ready-pack/ReadyPackRatePage";

import { PAGE_SIZE } from "../constants/warehouse";
import { useMonthOverviewData } from "../hooks/useMonthOverviewData";

import {
  calcBlockChart,
  calcKpi,
  calcNvRows,
  calcProgressPct,
} from "../lib/dashboard-calc";


import {
  calcModalStatusTotal,
  filterModalOrders,
} from "../lib/modal-calc";

import {
  calcOrderStatusTotal,
  filterOrderRows,
  paginateOrders,
  calcStatusSummary,
} from "../lib/order-calc";

import { calcOverview } from "../lib/overview-calc";
import { useRealtimeOrders } from "../hooks/useRealtimeOrders";

import type { PageKey, StatusType, Order } from "../types/order";
import {
  calcPickerRows,
  calcPickerMonthRows,
} from "../lib/picker-calc";

const MAINTENANCE =
  process.env.NEXT_PUBLIC_MAINTENANCE === "true";

function stType(s?: string): StatusType {
  const v = (s || "").toLowerCase();

  if (v.includes("đóng")) return "dong";
  if (v.includes("dán")) return "dan";

  return "other";
}

export default function Page() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [page, setPage] = useState<PageKey>("dashboard");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [blockFilter, setBlockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [orderBlock, setOrderBlock] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderNV, setOrderNV] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);

  const [pickerBlock, setPickerBlock] = useState("");

  const [modalNV, setModalNV] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  const [sortKey, setSortKey] =
    useState<"nv" | "dong" | "dan" | "tong">("tong");

  const [sortAsc, setSortAsc] = useState(false);

  const [orderSortKey, setOrderSortKey] =
    useState<keyof Order | "">("");

  const [orderSortAsc, setOrderSortAsc] = useState(false);

  const notify = useCallback(
    (type: ToastItem["type"], message: string) => {
      const id = crypto.randomUUID();

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          message,
        },
      ]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const {
    month,
    setMonth,
    sheetName,
    months,
    orders,
    lastUpdate,
    isOk,
    sheetNames,
    changeSheet,
  } = useRealtimeOrders(notify);

const {
  overviewSheets,
  overviewLoading,
  overviewError,
} = useMonthOverviewData(
  month,
  page === "overview" || page === "picker",
  notify
);


  const overview = useMemo(
  () => calcOverview(overviewSheets),
  [overviewSheets]
);

  const statusSummary = useMemo(
    () => calcStatusSummary(orders),
    [orders]
  );

  const dashOrders = useMemo(() => {
    return orders.filter((o) => {
      if (blockFilter && o.block !== blockFilter) return false;
      if (statusFilter && stType(o.status) !== statusFilter) return false;

      if (
        searchInput &&
        !o.nv.toLowerCase().includes(searchInput.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [orders, blockFilter, statusFilter, searchInput]);

  const nvRows = useMemo(
    () => calcNvRows(dashOrders, sortKey, sortAsc),
    [dashOrders, sortKey, sortAsc]
  );

  const kpi = useMemo(() => calcKpi(dashOrders), [dashOrders]);

  const blockChart = useMemo(
    () => calcBlockChart(dashOrders),
    [dashOrders]
  );

  const orderRows = useMemo(
    () =>
      filterOrderRows({
        orders,
        orderBlock,
        orderStatus,
        orderNV,
        orderSearch,
        orderSortKey,
        orderSortAsc,
      }),
    [
      orders,
      orderBlock,
      orderStatus,
      orderNV,
      orderSearch,
      orderSortKey,
      orderSortAsc,
    ]
  );

  const pickerRows = useMemo(
    () => calcPickerRows(orders, pickerBlock),
    [orders, pickerBlock]
  );
const pickerMonthRows = useMemo(
  () => calcPickerMonthRows(overviewSheets, pickerBlock),
  [overviewSheets, pickerBlock]
);

  const modalOrders = useMemo(
    () =>
      filterModalOrders({
        modalNV,
        dashOrders,
        modalSearch,
      }),
    [modalNV, dashOrders, modalSearch]
  );

  const pageTitle =
    page === "overview"
      ? "Tổng Quan"
      : page === "dashboard"
      ? "Dashboard"
      : page === "orders"
      ? "Xem Đơn"
      : page === "picker"
      ? "Thống Kê Soạn"
      : page === "readyRate"
      ? "Tỷ Lệ Đóng Sẵn"
      : "";

  const oPageSize = PAGE_SIZE;

  const totalOrderPages = Math.max(
    1,
    Math.ceil(orderRows.length / oPageSize)
  );

  const pagedOrders = paginateOrders(orderRows, orderPage, oPageSize);

  const progressPct = calcProgressPct(dashOrders);

  const maxTong = nvRows[0]?.tong || 1;
  const maxBlock = Math.max(...Object.values(blockChart), 1);
  const maxPicker = pickerRows[0]?.total || 1;

  const orderStatusTotal = calcOrderStatusTotal(orderRows);
  const orderDong = orderStatusTotal.dong;
  const orderDan = orderStatusTotal.dan;

  const modalStatusTotal = calcModalStatusTotal(modalOrders);
  const modalDong = modalStatusTotal.dong;
  const modalDan = modalStatusTotal.dan;

  useEffect(() => {
    if (MAINTENANCE) {
      window.location.href = "/maintenance";
    }
  }, []);

  function handleSort(k: "nv" | "dong" | "dan" | "tong") {
    if (sortKey === k) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(k);
      setSortAsc(false);
    }
  }

  function handleOrderSort(k: keyof Order) {
    if (orderSortKey === k) {
      setOrderSortAsc((v) => !v);
    } else {
      setOrderSortKey(k);
      setOrderSortAsc(false);
    }

    setOrderPage(1);
  }

  function exportCSV(rows: Order[], name: string) {
    if (!rows.length) {
      alert("Không có dữ liệu!");
      return;
    }

    let csv =
      "\uFEFFNhân Viên,Block,Mã Đơn,Trạng Thái,Picker,Số Lượng\n";

    rows.forEach((o) => {
      csv += `"${o.nv}","${o.block}","${o.ma}","${o.status}","${
        o.picker || ""
      }",${o.so}\n`;
    });

    const a = document.createElement("a");

    a.href = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    a.download = `${name}_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}.csv`;

    a.click();
  }

  if (MAINTENANCE) {
    return null;
  }

  return (
    <div className={theme === "light" ? "theme-light" : "theme-dark"}>
      <Sidebar
        page={page}
        sidebarCollapsed={sidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        ordersLength={orders.length}
        blockFilter={blockFilter}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        onToggleMobile={() => setMobileMenuOpen((v) => !v)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onPageChange={setPage}
        onBlockFilter={setBlockFilter}
        onExport={() => exportCSV(dashOrders, "dong_don")}
      />

      <div className="main">
        <Topbar
          pageTitle={pageTitle}
          lastUpdate={lastUpdate}
          isOk={isOk}
          sheetName={sheetName}
          sheetNames={sheetNames}
          onSheetChange={changeSheet}
          theme={theme}
          onToggleTheme={() =>
            setTheme((v) => (v === "dark" ? "light" : "dark"))
          }
          notify={notify}
          month={month}
          months={months}
          onMonthChange={setMonth}
        />

        <div className="content">
          {page === "overview" && (
            <>
              {overviewLoading && (
                <div className="loading-card">
                  <span className="spin" />
                  <b>Đang tải tổng quan tháng...</b>
                  <small>Vui lòng chờ, hệ thống đang đọc toàn bộ dữ liệu tháng</small>
                </div>
              )}

              {!overviewLoading && overviewError && (
                <div className="empty">
                  {overviewError}
                </div>
              )}

              {!overviewLoading && !overviewError && (
                <OverviewPage
                  totalOrders={overview.totalOrders}
                  totalCodes={overview.totalCodes}
                  totalEmployees={overview.totalEmployees}
                  totalDone={overview.totalDone}
                  totalLabel={overview.totalLabel}
                  totalPending={overview.totalPending}
                  statusSummary={overview.statusSummary}
                  sheetSummary={overview.sheetSummary}
                  employeeSummary={overview.employeeSummary}
                />
              )}
            </>
          )}

          {page === "dashboard" && (
            <DashboardPage
              kpi={kpi}
              nvRows={nvRows}
              blockChart={blockChart}
              blockFilter={blockFilter}
              statusFilter={statusFilter}
              searchInput={searchInput}
              progressPct={progressPct}
              maxTong={maxTong}
              maxBlock={maxBlock}
              onBlockFilter={setBlockFilter}
              onStatusFilter={setStatusFilter}
              onSearch={setSearchInput}
              onSort={handleSort}
              onOpenModal={(nv) => {
                setModalNV(nv);
                setModalSearch("");
              }}
            />
          )}

          {page === "orders" && (
            <OrdersPage
              orderRows={orderRows}
              pagedOrders={pagedOrders}
              orderPage={orderPage}
              totalOrderPages={totalOrderPages}
              oPageSize={oPageSize}
              orderDong={orderDong}
              orderDan={orderDan}
              orderBlock={orderBlock}
              orderStatus={orderStatus}
              orderNV={orderNV}
              orderSearch={orderSearch}
              allOrders={orders}
              onBlockChange={(v) => {
                setOrderBlock(v);
                setOrderPage(1);
              }}
              onStatusChange={(v) => {
                setOrderStatus(v);
                setOrderPage(1);
              }}
              onNVChange={(v) => {
                setOrderNV(v);
                setOrderPage(1);
              }}
              onSearchChange={(v) => {
                setOrderSearch(v);
                setOrderPage(1);
              }}
              onPageChange={setOrderPage}
              onSort={handleOrderSort}
              onExport={() => exportCSV(orderRows, "xem_don")}
              statusSummary={statusSummary}
              onStatusClick={(status) => {
                setOrderStatus("");
                setOrderSearch(status);
                setOrderPage(1);
              }}
            />
          )}

          {page === "picker" && (
            <PickerPage
              pickerRows={pickerRows}
              pickerMonthRows={pickerMonthRows}
              pickerBlock={pickerBlock}
              maxPicker={maxPicker}
              onPickerBlockChange={setPickerBlock}
            />
          )}

          {page === "readyRate" && <ReadyPackRatePage />}
        </div>
      </div>

      <ModalDetail
        modalNV={modalNV}
        modalOrders={modalOrders}
        modalSearch={modalSearch}
        modalDong={modalDong}
        modalDan={modalDan}
        onClose={() => setModalNV(null)}
        onSearch={setModalSearch}
      />

      <Toast
        toasts={toasts}
        onRemove={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </div>
  );
}