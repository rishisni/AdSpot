import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const navItems = ["Dashboard", "Campaigns", "Create", "Live Screen", "Templates", "Analytics", "Inventory", "AI Engine", "History"];

const dummyBackendData = {
  stores: [
    { id: "store-1", name: "BrewNest Coffee", type: "Coffee shop", region: "Downtown" },
    { id: "store-2", name: "FreshMart Daily", type: "Grocery shop", region: "West End" },
    { id: "store-3", name: "Leaf & Spine", type: "Book shop", region: "Riverside" },
  ],
  inventory: [
    { id: "inv-1", storeId: "store-1", sku: "CF-001", productName: "Cold Brew Bottle", category: "Beverages", tags: ["fast", "featured"], stock: 180, demandScore: 84, price: 5.5 },
    { id: "inv-2", storeId: "store-1", sku: "CF-002", productName: "Almond Croissant", category: "Bakery", tags: ["grouped"], stock: 34, demandScore: 90, price: 4.2 },
    { id: "inv-3", storeId: "store-2", sku: "GR-001", productName: "Organic Rice 5kg", category: "Staples", tags: ["vehicle"], stock: 220, demandScore: 72, price: 12.5 },
    { id: "inv-4", storeId: "store-2", sku: "GR-002", productName: "Sparkling Water 500ml", category: "Beverages", tags: ["fast"], stock: 12, demandScore: 88, price: 1.4 },
    { id: "inv-5", storeId: "store-3", sku: "BK-001", productName: "Mystery Thriller Pack", category: "Fiction", tags: ["grouped", "featured"], stock: 48, demandScore: 78, price: 22 },
    { id: "inv-6", storeId: "store-3", sku: "BK-002", productName: "Children Story Bundle", category: "Kids", tags: ["fast"], stock: 120, demandScore: 67, price: 19 },
  ],
  templates: [
    { id: "tpl-1", storeType: "Coffee shop", name: "Morning Rush Combo", category: "Trending", recommendationType: "AI Recommended", discountType: "% discount", discountValue: 15, timeSlots: "7:00-10:00", logic: "High-demand beverages + bakery pairings", performanceScore: 92, usageCount: 120 },
    { id: "tpl-2", storeType: "Grocery shop", name: "Weekend Family Basket", category: "High-performing", recommendationType: "High-performing", discountType: "Flat discount", discountValue: 5, timeSlots: "16:00-21:00", logic: "Category staples + beverages", performanceScore: 89, usageCount: 97 },
    { id: "tpl-3", storeType: "Book shop", name: "Fiction Friday", category: "Seasonal", recommendationType: "Trending", discountType: "Buy X Get Y", discountValue: 1, timeSlots: "12:00-20:00", logic: "Top fiction + complementary bundles", performanceScore: 86, usageCount: 81 },
    { id: "tpl-4", storeType: "Coffee shop", name: "Late Night Sips", category: "Trending", recommendationType: "AI Recommended", discountType: "Coupons", discountValue: 10, timeSlots: "20:00-23:00", logic: "Low inventory balancing for cold drinks", performanceScore: 83, usageCount: 63 },
    { id: "tpl-5", storeType: "Grocery shop", name: "Clear Expiring Stock", category: "AI Recommended", recommendationType: "AI Recommended", discountType: "% discount", discountValue: 18, timeSlots: "10:00-14:00", logic: "Inventory-based product selection", performanceScore: 88, usageCount: 111 },
    { id: "tpl-6", storeType: "Book shop", name: "School Season Starter", category: "Seasonal", recommendationType: "Seasonal", discountType: "Flat discount", discountValue: 3, timeSlots: "09:00-18:00", logic: "Kids + stationery cross-sell", performanceScore: 84, usageCount: 72 },
  ],
  campaigns: [
    { id: "cmp-1", storeId: "store-1", templateId: "tpl-1", name: "Summer Coffee Blast", goal: "Increase sales", status: "Active", campaignType: "Discount", productIds: ["inv-1", "inv-2"], discountType: "% discount", discountValue: 15, dateStart: "2026-04-10", dateEnd: "2026-04-30", revenue: 14200, orders: 368, conversion: 6.4, roi: 3.2 },
    { id: "cmp-2", storeId: "store-2", templateId: "tpl-5", name: "Inventory Clearance West", goal: "Clear inventory", status: "Scheduled", campaignType: "Clearance", productIds: ["inv-3", "inv-4"], discountType: "% discount", discountValue: 20, dateStart: "2026-04-22", dateEnd: "2026-05-05", revenue: 9800, orders: 240, conversion: 4.8, roi: 2.1 },
    { id: "cmp-3", storeId: "store-3", templateId: "tpl-3", name: "Book Lovers Week", goal: "Boost visibility", status: "Completed", campaignType: "Visibility", productIds: ["inv-5", "inv-6"], discountType: "Buy X Get Y", discountValue: 1, dateStart: "2026-03-15", dateEnd: "2026-03-28", revenue: 12100, orders: 292, conversion: 5.7, roi: 2.9 },
  ],
};

function useLocalState(key, fallback) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  });
  const update = (next) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };
  return [value, update];
}

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-emerald-600">{detail}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const confettiPieces = [
  { left: "5%", bg: "bg-pink-400", delay: "0s" },
  { left: "12%", bg: "bg-indigo-400", delay: "0.5s" },
  { left: "18%", bg: "bg-amber-400", delay: "0.8s" },
  { left: "24%", bg: "bg-emerald-400", delay: "0.3s" },
  { left: "31%", bg: "bg-sky-400", delay: "1.2s" },
  { left: "38%", bg: "bg-fuchsia-400", delay: "0.1s" },
  { left: "45%", bg: "bg-rose-400", delay: "1.5s" },
  { left: "52%", bg: "bg-violet-400", delay: "0.4s" },
  { left: "58%", bg: "bg-lime-400", delay: "0.9s" },
  { left: "64%", bg: "bg-cyan-400", delay: "0.2s" },
  { left: "71%", bg: "bg-orange-400", delay: "1.1s" },
  { left: "79%", bg: "bg-yellow-400", delay: "0.6s" },
  { left: "87%", bg: "bg-red-400", delay: "1.4s" },
  { left: "94%", bg: "bg-blue-400", delay: "0.7s" },
];

function App() {
  const currentPath = window.location.pathname;
  const currentQuery = new URLSearchParams(window.location.search);
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState("password");
  const [activePage, setActivePage] = useState("Dashboard");
  const [backendData, setBackendData] = useLocalState("promoiq_backend_data", dummyBackendData);
  const [notifications, setNotifications] = useLocalState("promoiq_notifications", [
    { id: 1, message: "Campaign Summer Sale Blast is outperforming by 23%", read: false },
    { id: 2, message: "Low inventory detected for Sparkling Water 500ml", read: false },
  ]);
  const [draft, setDraft] = useLocalState("promoiq_draft", {
    name: "",
    storeId: "store-1",
    templateId: "tpl-1",
    goal: "Increase sales",
    discountType: "% discount",
    discountValue: 15,
    selectionMode: "Inventory-based",
    scheduleType: "Publish now",
    startDate: "2026-04-20",
    endDate: "2026-05-01",
    imageDataUrl: "",
    percentage: 15,
    flatAmount: 0,
    buyX: 0,
    buyY: 0,
    couponCode: "PROMOIQ20",
    selectedCategory: "",
    selectedTag: "",
    selectedProductId: "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const qrCanvasRef = useRef(null);
  const [dashboardFilter, setDashboardFilter] = useState({
    date: "",
    category: "All Categories",
    campaignType: "All Campaign Types",
  });

  const storesById = useMemo(
    () => Object.fromEntries(backendData.stores.map((s) => [s.id, s])),
    [backendData.stores],
  );
  const templatesById = useMemo(
    () => Object.fromEntries(backendData.templates.map((t) => [t.id, t])),
    [backendData.templates],
  );
  const inventoryById = useMemo(
    () => Object.fromEntries(backendData.inventory.map((i) => [i.id, i])),
    [backendData.inventory],
  );

  const metrics = useMemo(() => {
    const campaigns = backendData.campaigns;
    const active = campaigns.filter((c) => c.status === "Active").length;
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    const avgCv = campaigns.reduce((sum, c) => sum + c.conversion, 0) / (campaigns.length || 1);
    return { active, totalRevenue, avgCv: avgCv.toFixed(1) };
  }, [backendData.campaigns]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const selectedStoreInventory = backendData.inventory.filter((item) => item.storeId === draft.storeId);
  const lowStockItems = backendData.inventory.filter((item) => item.stock < 25);
  const categoryOptions = useMemo(() => {
    const categories = new Set(backendData.inventory.map((item) => item.category));
    return ["All Categories", ...categories];
  }, [backendData.inventory]);
  const campaignTypeOptions = useMemo(() => {
    const types = new Set(backendData.campaigns.map((c) => c.campaignType));
    return ["All Campaign Types", ...types];
  }, [backendData.campaigns]);
  const storeCategories = useMemo(() => [...new Set(selectedStoreInventory.map((item) => item.category))], [selectedStoreInventory]);
  const storeTags = useMemo(() => [...new Set(selectedStoreInventory.flatMap((item) => item.tags))], [selectedStoreInventory]);
  const previewProducts = selectedStoreInventory
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 3);
  const rawQrBaseUrl = String(import.meta.env.VITE_QR_REDIRECT_URL || "").trim();
  const normalizeQrBaseUrl = (urlValue) => {
    if (!urlValue || urlValue === "undefined" || urlValue === "null") return "";
    if (!/^https?:\/\//i.test(urlValue)) return "";
    try {
      const url = new URL(urlValue);
      // Auto-fix common ngrok typo: "ngrok-free" -> "ngrok-free.app"
      if (url.hostname.endsWith("ngrok-free")) {
        url.hostname = `${url.hostname}.app`;
      }
      return url.toString().replace(/\/$/, "");
    } catch {
      return "";
    }
  };
  const normalizedQrBaseUrl = normalizeQrBaseUrl(rawQrBaseUrl);
  const qrBaseUrl = normalizedQrBaseUrl || `${window.location.origin}/coupon-success`;
  const draftQrValue = `${qrBaseUrl}?campaign=${encodeURIComponent(draft.name || "PromoIQ Campaign")}&code=${encodeURIComponent("PROMOIQ20")}`;
  const activeStore = storesById[draft.storeId];
  const templateForDraft = templatesById[draft.templateId];
  const templateOptions = backendData.templates.filter((t) => t.storeType === activeStore?.type);
  const campaignsWithImages = useMemo(
    () =>
      backendData.campaigns
        .filter((c) => c.imageDataUrl)
        .sort((a, b) => {
          const aTime = a.dateStart ? new Date(a.dateStart).getTime() : Number.MAX_SAFE_INTEGER;
          const bTime = b.dateStart ? new Date(b.dateStart).getTime() : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        }),
    [backendData.campaigns],
  );
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fallbackStore = backendData.stores[0];
    const validStore = storesById[draft.storeId] ? draft.storeId : fallbackStore?.id || "";
    const validTemplates = backendData.templates.filter((t) => t.storeType === storesById[validStore]?.type);
    const validTemplate = validTemplates.some((t) => t.id === draft.templateId)
      ? draft.templateId
      : validTemplates[0]?.id || "";
    const validInventory = backendData.inventory.filter((item) => item.storeId === validStore);
    const validProduct = validInventory.some((item) => item.id === draft.selectedProductId)
      ? draft.selectedProductId
      : validInventory[0]?.id || "";

    if (
      validStore !== draft.storeId ||
      validTemplate !== draft.templateId ||
      validProduct !== (draft.selectedProductId || "")
    ) {
      setDraft((prev) => ({
        ...prev,
        storeId: validStore,
        templateId: validTemplate,
        selectedProductId: validProduct,
      }));
    }
  }, [
    backendData.inventory,
    backendData.stores,
    backendData.templates,
    draft.selectedProductId,
    draft.storeId,
    draft.templateId,
    setDraft,
    storesById,
  ]);

  useEffect(() => {
    if (!campaignsWithImages.length) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % campaignsWithImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [campaignsWithImages.length]);

  const updateDraftDiscountType = (discountType) => {
    setDraft((prev) => {
      const next = {
        ...prev,
        discountType,
        percentage: discountType === "% discount" ? prev.percentage ?? 15 : 0,
        flatAmount: discountType === "Flat discount" ? prev.flatAmount ?? 5 : 0,
        buyX: discountType === "Buy X Get Y" ? prev.buyX ?? 2 : 0,
        buyY: discountType === "Buy X Get Y" ? prev.buyY ?? 1 : 0,
        couponCode: discountType === "Coupons" ? prev.couponCode || "PROMOIQ20" : "",
      };
      return next;
    });
  };

  const getDiscountSummary = (targetDraft) => {
    switch (targetDraft.discountType) {
      case "% discount":
        return { value: Number(targetDraft.percentage || 0), label: `${targetDraft.percentage || 0}%` };
      case "Flat discount":
        return { value: Number(targetDraft.flatAmount || 0), label: `$${targetDraft.flatAmount || 0}` };
      case "Buy X Get Y":
        return { value: Number(targetDraft.buyY || 0), label: `Buy ${targetDraft.buyX || 0} Get ${targetDraft.buyY || 0}` };
      case "Coupons":
        return { value: Number(targetDraft.discountValue || 0), label: targetDraft.couponCode || "PROMOIQ20" };
      default:
        return { value: 0, label: "N/A" };
    }
  };

  const validateDraft = (targetDraft) => {
    if (!targetDraft.name.trim()) return "Campaign name is required.";
    if (targetDraft.startDate && targetDraft.endDate && targetDraft.startDate > targetDraft.endDate) return "Start date cannot be after end date.";
    if (targetDraft.discountType === "% discount" && (!targetDraft.percentage || targetDraft.percentage <= 0)) return "Percentage must be greater than 0.";
    if (targetDraft.discountType === "Flat discount" && (!targetDraft.flatAmount || targetDraft.flatAmount <= 0)) return "Flat amount must be greater than 0.";
    if (targetDraft.discountType === "Buy X Get Y" && ((!targetDraft.buyX || targetDraft.buyX <= 0) || (!targetDraft.buyY || targetDraft.buyY <= 0))) return "Buy X and Get Y must be greater than 0.";
    if (targetDraft.discountType === "Coupons" && !targetDraft.couponCode?.trim()) return "Coupon code is required.";
    return "";
  };

  const copyQrLink = async (qrUrl) => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setActionMessage("QR link copied.");
    } catch {
      setActionMessage("Failed to copy QR link.");
    }
  };

  const downloadQrPng = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) {
      setActionMessage("QR canvas not ready.");
      return;
    }
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "campaign-qr.png";
    link.click();
    setActionMessage("QR PNG downloaded.");
  };

  const publishCampaign = (scheduled = false) => {
    const error = validateDraft(draft);
    if (error) {
      setActionMessage(error);
      return;
    }
    const template = templatesById[draft.templateId];
    const productIds = previewProducts.map((p) => p.id);
    const discount = getDiscountSummary(draft);
    const today = new Date();
    const plusSeven = new Date();
    plusSeven.setDate(today.getDate() + 7);
    const fallbackStart = today.toISOString().slice(0, 10);
    const fallbackEnd = plusSeven.toISOString().slice(0, 10);
    const resolvedStartDate = draft.startDate || fallbackStart;
    const resolvedEndDate = draft.endDate || fallbackEnd;
    const nextCampaignId = `cmp-${backendData.campaigns.length + 1}`;
    const nextNotificationId = notifications.length + 1;
    const coupon = draft.couponCode || "PROMOIQ20";
    const next = {
      id: nextCampaignId,
      storeId: draft.storeId,
      templateId: draft.templateId,
      name: draft.name,
      goal: draft.goal,
      status: scheduled ? "Scheduled" : "Active",
      campaignType: draft.goal === "Clear inventory" ? "Clearance" : "Discount",
      productIds,
      discountType: draft.discountType || template?.discountType || "% discount",
      discountValue: discount.value || Number(draft.discountValue || template?.discountValue || 10),
      dateStart: resolvedStartDate,
      dateEnd: resolvedEndDate,
      imageDataUrl: draft.imageDataUrl || "",
      qrUrl: `${qrBaseUrl}?campaign=${encodeURIComponent(draft.name)}&code=${encodeURIComponent(coupon)}`,
      couponCode: coupon,
      selectionMode: draft.selectionMode,
      revenue: 0,
      orders: 0,
      conversion: 0,
      roi: 0,
    };
    setBackendData((prev) => ({ ...prev, campaigns: [next, ...prev.campaigns] }));
    setNotifications((prev) => [
      { id: nextNotificationId, message: `${next.name} ${scheduled ? "scheduled" : "published"} successfully`, read: false },
      ...prev,
    ]);
    setDraft((prev) => ({ ...prev, name: "", imageDataUrl: "", discountValue: template?.discountValue ?? 15 }));
    setPreviewOpen(false);
    setActionMessage(`Campaign ${scheduled ? "scheduled" : "published"} successfully.`);
    setActivePage("Campaigns");
  };

  const previewCampaign = selectedPreviewId
    ? backendData.campaigns.find((c) => c.id === selectedPreviewId)
    : null;

  if (currentPath === "/coupon-success") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 px-4 text-white">
        {confettiPieces.map((piece) => (
          <span
            key={`${piece.left}-${piece.delay}`}
            className={`absolute top-[-10%] h-3 w-3 rounded-sm ${piece.bg} animate-[fall_3s_linear_infinite]`}
            style={{ left: piece.left, animationDelay: piece.delay }}
          />
        ))}
        <div className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur">
          <p className="text-sm uppercase tracking-wider text-indigo-100">PromoIQ Coupon</p>
          <h1 className="mt-2 text-3xl font-bold">Coupon Applied!</h1>
          <p className="mt-3 text-indigo-100">
            {currentQuery.get("campaign") || "Your campaign"} has been applied successfully.
          </p>
          <p className="mt-1 text-indigo-100">
            Discount code: {currentQuery.get("code") || "PROMOIQ20"}
          </p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">PromoIQ</h1>
          <p className="mt-1 text-sm text-slate-500">Authentication & User Management</p>
          <div className="mt-4 flex gap-2 rounded-lg bg-slate-100 p-1">
            {["password", "otp"].map((mode) => (
              <button
                key={mode}
                className={`w-full rounded-md px-3 py-2 text-sm ${authMode === mode ? "bg-white font-medium shadow" : "text-slate-500"}`}
                onClick={() => setAuthMode(mode)}
              >
                {mode === "password" ? "Email + Password" : "Email OTP"}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-lg border p-2" placeholder="Email" />
            {authMode === "password" ? (
              <input className="w-full rounded-lg border p-2" type="password" placeholder="Password" />
            ) : (
              <input className="w-full rounded-lg border p-2" placeholder="Enter OTP" />
            )}
            <button className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white" onClick={() => setAuthed(true)}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-indigo-700">PromoIQ Insights Engine</h1>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => setShowNotifications((prev) => !prev)}>
              Notifications ({unreadCount})
            </button>
            <button
              className="rounded-lg border border-rose-200 px-3 py-1 text-sm text-rose-600"
              onClick={() => {
                setAuthed(false);
                setActivePage("Dashboard");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-4">
        <aside className="col-span-12 rounded-xl border bg-white p-3 shadow-sm lg:col-span-2">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <button
                key={item}
                className={`rounded-lg px-3 py-2 text-left text-sm ${activePage === item ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
                onClick={() => setActivePage(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="col-span-12 space-y-4 lg:col-span-10">
          {showNotifications && (
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Notifications</h2>
                <button
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                >
                  Mark all read
                </button>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {notifications.map((n) => (
                  <p key={n.id} className={`rounded border p-2 ${n.read ? "text-slate-500" : "bg-indigo-50 text-indigo-700"}`}>
                    {n.message}
                  </p>
                ))}
              </div>
            </div>
          )}
          {actionMessage && <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">{actionMessage}</p>}
          {activePage === "Dashboard" && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Active campaigns" value={metrics.active} detail="Running now" />
                <StatCard label="Total revenue" value={`$${metrics.totalRevenue.toLocaleString()}`} detail="+18.2% MoM" />
                <StatCard label="Conversion rate" value={`${metrics.avgCv}%`} detail="Cross-campaign average" />
                <StatCard label="Sales uplift" value="22%" detail="Compared to baseline" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-4">
                  <h2 className="font-semibold">Smart Insights</h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>Best type: Discount campaigns (+31% revenue).</li>
                    <li>Worst campaign: Inventory Clearance West.</li>
                    <li>{lowStockItems.length} products are low stock; avoid promoting them.</li>
                  </ul>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <h2 className="font-semibold">Filters</h2>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <input
                      className="rounded-lg border p-2 text-sm"
                      type="date"
                      value={dashboardFilter.date}
                      onChange={(e) => setDashboardFilter((prev) => ({ ...prev, date: e.target.value }))}
                    />
                    <select
                      className="rounded-lg border p-2 text-sm"
                      value={dashboardFilter.category}
                      onChange={(e) => setDashboardFilter((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <select
                      className="rounded-lg border p-2 text-sm"
                      value={dashboardFilter.campaignType}
                      onChange={(e) => setDashboardFilter((prev) => ({ ...prev, campaignType: e.target.value }))}
                    >
                      {campaignTypeOptions.map((campaignType) => (
                        <option key={campaignType} value={campaignType}>
                          {campaignType}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activePage === "Campaigns" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Campaign Management</h2>
              <div className="mt-3 space-y-2">
                {backendData.campaigns.map((c) => {
                  const store = storesById[c.storeId];
                  const template = templatesById[c.templateId];
                  return (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-slate-500">
                        {c.status} • {store?.name} • {template?.name} • {c.discountType}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="rounded border px-2 py-1"
                        onClick={() => {
                          setSelectedPreviewId(c.id);
                          setPreviewOpen(true);
                        }}
                      >
                        Preview
                      </button>
                      <button
                        className="rounded border px-2 py-1"
                        onClick={() =>
                          setBackendData((prev) => ({
                            ...prev,
                            campaigns: [{ ...c, id: `cmp-${prev.campaigns.length + 1}`, name: `${c.name} (copy)` }, ...prev.campaigns],
                          }))
                        }
                      >
                        Duplicate
                      </button>
                      <button
                        className="rounded border px-2 py-1"
                        onClick={() =>
                          setBackendData((prev) => ({
                            ...prev,
                            campaigns: prev.campaigns.map((x) =>
                              x.id === c.id ? { ...x, status: x.status === "Active" ? "Paused" : "Active" } : x,
                            ),
                          }))
                        }
                      >
                        Pause/Resume
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {activePage === "Live Screen" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Live Screen</h2>
              {campaignsWithImages.length ? (
                <div className="mt-3">
                  <div className="mx-auto w-[90%] overflow-hidden rounded-xl border bg-black/5">
                    <img
                      src={campaignsWithImages[carouselIndex].imageDataUrl}
                      alt={campaignsWithImages[carouselIndex].name}
                      className="h-[50vh] w-full object-cover"
                    />
                  </div>
                  <div className="mx-auto mt-3 w-[90%] rounded-lg border bg-slate-50 p-3 text-sm">
                    <p className="text-base font-semibold">{campaignsWithImages[carouselIndex].name}</p>
                    <p className="mt-1 text-slate-600">
                      Store: {storesById[campaignsWithImages[carouselIndex].storeId]?.name}
                    </p>
                    <p className="text-slate-600">
                      Dates: {campaignsWithImages[carouselIndex].dateStart || "Date not set"} to {campaignsWithImages[carouselIndex].dateEnd || "Date not set"}
                    </p>
                    <p className="text-slate-600">
                      Discount: {campaignsWithImages[carouselIndex].discountType} ({campaignsWithImages[carouselIndex].discountValue})
                    </p>
                    <p className="mt-2 text-slate-700">
                      Caption: {campaignsWithImages[carouselIndex].name} - {campaignsWithImages[carouselIndex].goal} campaign now live.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <QRCodeCanvas value={campaignsWithImages[carouselIndex].qrUrl || draftQrValue} size={90} />
                      <div>
                        <p className="font-medium text-slate-800">Campaign QR</p>
                        <a
                          className="text-xs text-indigo-600 underline"
                          href={campaignsWithImages[carouselIndex].qrUrl || draftQrValue}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open coupon page
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No uploaded campaign images found yet. Create and publish a campaign with an image.</p>
              )}
            </div>
          )}

          {activePage === "Create" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Create Campaign</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Field label="Campaign name">
                  <input className="rounded-lg border p-2" placeholder="Campaign name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </Field>
                <Field label="Store">
                  <select
                    className="rounded-lg border p-2"
                    value={draft.storeId}
                    onChange={(e) => {
                      const nextStoreId = e.target.value;
                      const nextStore = storesById[nextStoreId];
                      const firstTemplate = backendData.templates.find((t) => t.storeType === nextStore?.type);
                      setDraft((d) => ({
                        ...d,
                        storeId: nextStoreId,
                        templateId: firstTemplate?.id || d.templateId,
                        discountType: firstTemplate?.discountType || d.discountType,
                      }));
                    }}
                  >
                    {backendData.stores.map((store) => <option key={store.id} value={store.id}>{store.name} ({store.type})</option>)}
                  </select>
                </Field>
                <Field label="Template">
                  <select className="rounded-lg border p-2" value={draft.templateId} onChange={(e) => {
                    const selectedTemplate = templatesById[e.target.value];
                    setDraft((d) => ({
                      ...d,
                      templateId: e.target.value,
                      discountType: selectedTemplate.discountType,
                      discountValue: selectedTemplate.discountValue,
                      percentage: selectedTemplate.discountType === "% discount" ? selectedTemplate.discountValue : d.percentage,
                      flatAmount: selectedTemplate.discountType === "Flat discount" ? selectedTemplate.discountValue : d.flatAmount,
                      buyX: selectedTemplate.discountType === "Buy X Get Y" ? 2 : d.buyX,
                      buyY: selectedTemplate.discountType === "Buy X Get Y" ? selectedTemplate.discountValue : d.buyY,
                      couponCode: selectedTemplate.discountType === "Coupons" ? "PROMOIQ20" : d.couponCode,
                    }));
                  }}>
                    {templateOptions.length ? (
                      templateOptions.map((template) => (
                        <option key={template.id} value={template.id}>{template.name} ({template.storeType})</option>
                      ))
                    ) : (
                      <option value="">No templates available</option>
                    )}
                  </select>
                </Field>
                <Field label="Campaign goal">
                  <select className="rounded-lg border p-2" value={draft.goal} onChange={(e) => setDraft((d) => ({ ...d, goal: e.target.value }))}>
                    <option>Increase sales</option><option>Clear inventory</option><option>Boost visibility</option>
                  </select>
                </Field>
                <Field label="Discount type">
                  <select className="rounded-lg border p-2" value={draft.discountType} onChange={(e) => updateDraftDiscountType(e.target.value)}>
                    <option>% discount</option><option>Flat discount</option><option>Buy X Get Y</option><option>Coupons</option>
                  </select>
                </Field>
                {draft.discountType === "% discount" && (
                  <Field label="Percentage %">
                    <input className="rounded-lg border p-2" type="number" placeholder="Percentage %" value={draft.percentage || ""} onChange={(e) => setDraft((d) => ({ ...d, percentage: Number(e.target.value) }))} />
                  </Field>
                )}
                {draft.discountType === "Flat discount" && (
                  <Field label="Flat amount">
                    <input className="rounded-lg border p-2" type="number" placeholder="Flat amount" value={draft.flatAmount || ""} onChange={(e) => setDraft((d) => ({ ...d, flatAmount: Number(e.target.value) }))} />
                  </Field>
                )}
                {draft.discountType === "Buy X Get Y" && (
                  <>
                    <Field label="Buy quantity (X)">
                      <input className="rounded-lg border p-2" type="number" placeholder="Buy X" value={draft.buyX || ""} onChange={(e) => setDraft((d) => ({ ...d, buyX: Number(e.target.value) }))} />
                    </Field>
                    <Field label="Free quantity (Y)">
                      <input className="rounded-lg border p-2" type="number" placeholder="Get Y" value={draft.buyY || ""} onChange={(e) => setDraft((d) => ({ ...d, buyY: Number(e.target.value) }))} />
                    </Field>
                  </>
                )}
                {draft.discountType === "Coupons" && (
                  <>
                    <Field label="Coupon code">
                      <input className="rounded-lg border p-2" placeholder="Coupon code" value={draft.couponCode || ""} onChange={(e) => setDraft((d) => ({ ...d, couponCode: e.target.value }))} />
                    </Field>
                    <Field label="Coupon value">
                      <input className="rounded-lg border p-2" type="number" placeholder="Coupon value" value={draft.discountValue || ""} onChange={(e) => setDraft((d) => ({ ...d, discountValue: Number(e.target.value) }))} />
                    </Field>
                  </>
                )}
                <Field label="Product selection mode">
                  <select className="rounded-lg border p-2" value={draft.selectionMode} onChange={(e) => setDraft((d) => ({ ...d, selectionMode: e.target.value }))}>
                    <option>Manual</option><option>Category-based</option><option>Tag-based</option><option>Inventory-based</option>
                  </select>
                </Field>
                {draft.selectionMode === "Category-based" && (
                  <Field label="Category">
                    <select
                      className="rounded-lg border p-2"
                      value={draft.selectedCategory || storeCategories[0] || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, selectedCategory: e.target.value }))}
                    >
                      {storeCategories.length ? (
                        storeCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      ) : (
                        <option value="">No categories available</option>
                      )}
                    </select>
                  </Field>
                )}
                {draft.selectionMode === "Tag-based" && (
                  <Field label="Tag">
                    <select
                      className="rounded-lg border p-2"
                      value={draft.selectedTag || storeTags[0] || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, selectedTag: e.target.value }))}
                    >
                      {storeTags.length ? (
                        storeTags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))
                      ) : (
                        <option value="">No tags available</option>
                      )}
                    </select>
                  </Field>
                )}
                {draft.selectionMode === "Manual" && (
                  <Field label="Product">
                    <select
                      className="rounded-lg border p-2"
                      value={draft.selectedProductId || selectedStoreInventory[0]?.id || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, selectedProductId: e.target.value }))}
                    >
                      {selectedStoreInventory.length ? (
                        selectedStoreInventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.productName}
                          </option>
                        ))
                      ) : (
                        <option value="">No products available</option>
                      )}
                    </select>
                  </Field>
                )}
                <Field label="Publish mode">
                  <select className="rounded-lg border p-2" value={draft.scheduleType} onChange={(e) => setDraft((d) => ({ ...d, scheduleType: e.target.value }))}>
                    <option>Publish now</option><option>Schedule</option>
                  </select>
                </Field>
                <Field label="Start date">
                  <input className="rounded-lg border p-2" type="date" value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />
                </Field>
                <Field label="End date">
                  <input className="rounded-lg border p-2" type="date" value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />
                </Field>
                <Field label="Campaign image">
                  <input
                    className="rounded-lg border p-2 text-sm"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setDraft((d) => ({ ...d, imageDataUrl: String(reader.result || "") }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </Field>
              </div>
              <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
                AI Tip: {activeStore?.type} campaigns perform best between {templateForDraft?.timeSlots || "popular peak slots"}.
              </div>
              <div className="mt-3 rounded-lg border border-dashed p-3 text-sm">
                <p className="font-medium">Preview & Validation</p>
                <p className="text-slate-600">{draft.name ? "Configuration looks valid. No overlap detected." : "Missing required field: Campaign name."}</p>
                <p className="text-slate-600">{validateDraft(draft) || "All required fields are valid."}</p>
                <p className="text-slate-600">Forecasted uplift: +14% revenue, +9% conversion.</p>
              </div>
              {previewOpen && !selectedPreviewId && (
                <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-sm">
                  <p className="font-medium">Draft Campaign Preview</p>
                  <p className="text-slate-600">
                    {draft.name || "Untitled Campaign"} • {storesById[draft.storeId]?.name} • {draft.discountType} ({getDiscountSummary(draft).label})
                  </p>
                  <p className="mt-1 text-slate-600">Products: {previewProducts.map((p) => p.productName).join(", ") || "No products selected"}</p>
                  <p className="mt-1 text-slate-600">Dates: {draft.startDate} to {draft.endDate}</p>
                  {draft.imageDataUrl ? (
                    <img src={draft.imageDataUrl} alt="Campaign creative preview" className="mt-2 h-40 w-full rounded-lg object-cover" />
                  ) : (
                    <p className="mt-1 text-slate-500">No campaign image uploaded yet.</p>
                  )}
                  <div className="mt-3 flex items-center gap-4" ref={qrCanvasRef}>
                    <QRCodeCanvas value={draftQrValue} size={96} />
                    <div>
                      <p className="font-medium">Scan to redeem</p>
                      <a className="text-xs text-indigo-600 underline" href={draftQrValue} target="_blank" rel="noreferrer">
                        Open coupon page
                      </a>
                      <div className="mt-2 flex gap-2">
                        <button className="rounded border px-2 py-1 text-xs" onClick={() => copyQrLink(draftQrValue)}>Copy QR link</button>
                        <button className="rounded border px-2 py-1 text-xs" onClick={downloadQrPng}>Download QR PNG</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {previewOpen && selectedPreviewId && previewCampaign && (
                <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-sm">
                  <p className="font-medium">Published Campaign Preview</p>
                  <p className="text-slate-600">{previewCampaign.name} • {storesById[previewCampaign.storeId]?.name}</p>
                  <p className="mt-1 text-slate-600">
                    Discount: {previewCampaign.discountType} ({previewCampaign.discountValue}) • Status: {previewCampaign.status}
                  </p>
                  <p className="mt-1 text-slate-600">
                    Products: {previewCampaign.productIds.map((id) => inventoryById[id]?.productName).filter(Boolean).join(", ")}
                  </p>
                  {previewCampaign.imageDataUrl ? (
                    <img src={previewCampaign.imageDataUrl} alt="Published campaign creative" className="mt-2 h-40 w-full rounded-lg object-cover" />
                  ) : null}
                  <div className="mt-3 flex items-center gap-4" ref={qrCanvasRef}>
                    <QRCodeCanvas value={previewCampaign.qrUrl || draftQrValue} size={96} />
                    <div>
                      <a
                        className="text-xs text-indigo-600 underline"
                        href={previewCampaign.qrUrl || draftQrValue}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open coupon page
                      </a>
                      <div className="mt-2 flex gap-2">
                        <button className="rounded border px-2 py-1 text-xs" onClick={() => copyQrLink(previewCampaign.qrUrl || draftQrValue)}>Copy QR link</button>
                        <button className="rounded border px-2 py-1 text-xs" onClick={downloadQrPng}>Download QR PNG</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => { setPreviewOpen(true); setSelectedPreviewId(null); }}>
                  Preview campaign
                </button>
                <button
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  onClick={() => publishCampaign(false)}
                >
                  Publish campaign
                </button>
                <button
                  className="rounded-lg border px-4 py-2 text-sm"
                  onClick={() => publishCampaign(true)}
                >
                  Schedule campaign
                </button>
              </div>
            </div>
          )}

          {activePage === "Templates" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Template System</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {backendData.templates.map((t) => (
                  <div key={t.id} className="rounded-lg border p-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.storeType} • {t.category} • {t.recommendationType}</p>
                    <p className="mt-2 text-sm">Logic: {t.logic}</p>
                    <p className="mt-1 text-sm">Discount: {t.discountType} ({t.discountValue}) • Slot: {t.timeSlots}</p>
                    <p className="mt-1 text-sm">Performance score: {t.performanceScore} • Uses: {t.usageCount}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-600">Supports editable templates, custom upload, save-as-template, and template performance tracking.</div>
            </div>
          )}

          {activePage === "Analytics" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Campaign Analytics & Tracking</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {backendData.campaigns.map((c) => (
                  <div key={c.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{c.name}</p>
                    <p>Revenue: ${c.revenue.toLocaleString()}</p>
                    <p>Orders: {c.orders} • Conversion: {c.conversion}% • ROI: {c.roi}x</p>
                    <p className="text-slate-500">Store: {storesById[c.storeId]?.name} • Template: {templatesById[c.templateId]?.name}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-600">Includes by-product, by-category, by-time breakdowns, funnel tracking, and cohort analysis placeholders.</p>
            </div>
          )}

          {activePage === "Inventory" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Inventory Integration</h2>
              <div className="mt-3 space-y-2 text-sm">
                {backendData.inventory.map((item) => (
                  <p key={item.id}>
                    {item.productName} ({storesById[item.storeId]?.type}) • stock {item.stock} • demand {item.demandScore}
                  </p>
                ))}
                <p className="text-indigo-600">AI Suggestion: Prioritize clearance for high-stock / low-demand SKUs.</p>
              </div>
            </div>
          )}

          {activePage === "AI Engine" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">AI Suggestion Engine & Optimization Loop</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Pre-campaign ideas based on inventory and sales trends.</li>
                <li>Underperforming campaign detected: Inventory Clearance (recommend +5% discount).</li>
                <li>Automation: auto-extend high-performing campaigns and rebalance discount bands.</li>
                <li>Continuous learning enabled from campaign history, store profile, and user behavior.</li>
              </ul>
            </div>
          )}

          {activePage === "History" && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">Campaign History & Management</h2>
              <div className="mt-3 space-y-2">
                {backendData.campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <p>{c.name} — {c.status} — {storesById[c.storeId]?.name}</p>
                    <button
                      className="rounded border px-2 py-1"
                      onClick={() =>
                        setBackendData((prev) => ({ ...prev, campaigns: prev.campaigns.filter((x) => x.id !== c.id) }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
