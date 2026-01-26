(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/skytrips-admin/src/components/ThemeToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ThemeToggle() {
    _s();
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Avoid hydration mismatch by only rendering after mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeToggle.useEffect": ()=>{
            setMounted(true);
        }
    }["ThemeToggle.useEffect"], []);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "flex items-center justify-center size-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors",
            "aria-label": "Toggle theme",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "size-5"
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/ThemeToggle.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/components/ThemeToggle.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: ()=>setTheme(theme === "dark" ? "light" : "dark"),
        className: "flex items-center justify-center size-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors",
        "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        children: theme === "dark" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "material-symbols-outlined text-[20px]",
            children: "light_mode"
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/components/ThemeToggle.tsx",
            lineNumber: 34,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "material-symbols-outlined text-[20px]",
            children: "dark_mode"
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/components/ThemeToggle.tsx",
            lineNumber: 36,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/skytrips-admin/src/components/ThemeToggle.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(ThemeToggle, "uGU5l7ciDSfqFDe6wS7vfMb29jQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/app/dashboard/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/ThemeToggle.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function DashboardLayout({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [userEmail, setUserEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sidebarCollapsed, setSidebarCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardLayout.useEffect": ()=>{
            checkAuth();
        }
    }["DashboardLayout.useEffect"], [
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardLayout.useEffect": ()=>{
            try {
                const persisted = localStorage.getItem("sidebarCollapsed");
                if (persisted) {
                    setSidebarCollapsed(persisted === "true");
                }
            } catch  {}
        }
    }["DashboardLayout.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardLayout.useEffect": ()=>{
            if (!isLoading && !isAuthenticated) {
                router.replace("/");
            }
        }
    }["DashboardLayout.useEffect"], [
        isLoading,
        isAuthenticated,
        router
    ]);
    const toggleSidebar = ()=>{
        setSidebarCollapsed((prev)=>{
            const next = !prev;
            try {
                localStorage.setItem("sidebarCollapsed", String(next));
            } catch  {}
            return next;
        });
    };
    const checkAuth = async ()=>{
        try {
            const token = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("sky_admin_session") : "TURBOPACK unreachable";
            const userStr = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("sky_admin_user") : "TURBOPACK unreachable";
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserEmail(user?.email || "");
                } catch  {
                    setUserEmail("");
                }
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth check error:", error);
            setIsAuthenticated(false);
        } finally{
            setIsLoading(false);
        }
    };
    const handleLogout = async ()=>{
        try {
            try {
                localStorage.removeItem("sky_admin_session");
                localStorage.removeItem("sky_admin_user");
            } catch  {}
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-600",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
            lineNumber: 93,
            columnNumber: 7
        }, this);
    }
    if (!isAuthenticated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-600",
                children: "Redirecting…"
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
            lineNumber: 101,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-background font-display text-foreground h-screen overflow-hidden flex w-full transition-colors duration-300",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `${sidebarCollapsed ? "w-20" : "w-64"} bg-sidebar border-r border-sidebar-border flex-col hidden md:flex h-full flex-shrink-0 z-20 transition-[width,background,color] duration-300 ease-in-out`,
                "aria-label": "Sidebar navigation",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `p-6 pb-2 ${sidebarCollapsed ? "px-4" : ""}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 cursor-pointer",
                            onClick: ()=>router.push("/dashboard"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative rounded-xl size-10 shadow-sm border border-primary/20 bg-primary/5 overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: "https://tjrmemmsieltajotxddk.supabase.co/storage/v1/object/public/media/2026/01/1768379811331_o7lm8v.svg",
                                        alt: "SkyTrips Logo",
                                        fill: true,
                                        className: "object-cover",
                                        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 122,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: `text-primary text-xl font-black leading-normal tracking-tight ${sidebarCollapsed ? "sr-only" : ""}`,
                                    children: "admin panel"
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: toggleSidebar,
                                    className: "ml-auto p-2 rounded-lg hover:bg-muted text-sidebar-foreground transition-colors",
                                    "aria-label": sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar",
                                    "aria-expanded": !sidebarCollapsed,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined",
                                        children: sidebarCollapsed ? "chevron_right" : "chevron_left"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: `flex flex-col gap-2 ${sidebarCollapsed ? "px-2" : "px-4"} mt-6 flex-1 overflow-y-auto`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Dashboard",
                                title: "Dashboard",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 167,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 176,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/flights",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/flights" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Flights",
                                title: "Flights",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/flights" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "flight"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 194,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Flights"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 203,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "#",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg hover:bg-muted text-sidebar-foreground hover:text-foreground transition-colors group`,
                                "aria-label": "Hotels",
                                title: "Hotels",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined group-hover:text-primary transition-colors",
                                        children: "hotel"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Hotels"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 220,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 211,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/customers",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/customers" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Customers",
                                title: "Customers",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/customers" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "group"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 238,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Customers"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/travellers",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/travellers" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Travellers",
                                title: "Travellers",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/travellers" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "person_pin_circle"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 265,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Travellers"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 274,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 255,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/booking",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/booking" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Bookings",
                                title: "Bookings",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/booking" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "confirmation_number"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 292,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Bookings"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 301,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 282,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/payments",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/payments" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Payments",
                                title: "Payments",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/payments" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "payments"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 319,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Payments"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 328,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 309,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/manage-booking",
                                prefetch: false,
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/manage-booking" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Manage Booking",
                                title: "Manage Booking",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/manage-booking" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "edit_calendar"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 347,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Manage Booking"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 356,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 336,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/media",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/media" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Media Management",
                                title: "Media Management",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/media" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "perm_media"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 374,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Media"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 383,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 364,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/agencies",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname.startsWith("/dashboard/agencies") ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Agency",
                                title: "Agency",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname.startsWith("/dashboard/agencies") ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "domain"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 401,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Agency"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 410,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 391,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/users",
                                prefetch: false,
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname.startsWith("/dashboard/users") ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Users",
                                title: "Users",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname.startsWith("/dashboard/users") ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "group"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 429,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Users"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 438,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 418,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/services",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname.startsWith("/dashboard/services") ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Services",
                                title: "Services",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname.startsWith("/dashboard/services") ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "room_service"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 456,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Services"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 465,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 446,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard/settings",
                                className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${pathname === "/dashboard/settings" ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none" : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"}`,
                                "aria-label": "Settings",
                                title: "Settings",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `material-symbols-outlined ${pathname === "/dashboard/settings" ? "active-icon" : "group-hover:text-primary transition-colors"}`,
                                        children: "settings"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 483,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                        children: "Setting"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 492,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 473,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `p-4 mt-auto ${sidebarCollapsed ? "px-2" : ""}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            onClick: handleLogout,
                            className: `flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg hover:bg-destructive/10 text-sidebar-foreground hover:text-destructive cursor-pointer transition-colors`,
                            "aria-label": "Sign Out",
                            title: "Sign Out",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "material-symbols-outlined",
                                    children: "logout"
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                    lineNumber: 507,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: `text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`,
                                    children: "Sign Out"
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                    lineNumber: 508,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                            lineNumber: 501,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                        lineNumber: 500,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col flex-1 h-full min-w-0 bg-background overflow-hidden relative transition-colors duration-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "flex items-center justify-between whitespace-nowrap bg-background border-b border-border px-6 py-4 flex-shrink-0 z-10 shadow-sm transition-colors duration-300 print:hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "md:hidden p-2 text-muted-foreground",
                                        "aria-label": "Open menu",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined",
                                            children: "menu"
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                            lineNumber: 527,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 523,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-foreground text-lg font-bold leading-tight",
                                                children: "Dashboard Overview"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                                lineNumber: 530,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground font-medium",
                                                children: "Welcome back, Admin"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                                lineNumber: 533,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                        lineNumber: 529,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 521,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$ThemeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                            lineNumber: 542,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "flex items-center justify-center size-10 rounded-full hover:bg-muted text-foreground transition-colors relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined",
                                                    children: "notifications"
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                                    lineNumber: 544,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-background"
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                                    lineNumber: 545,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                            lineNumber: 543,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            onClick: ()=>router.push("/dashboard/profile"),
                                            className: "bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-background shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
                                            style: {
                                                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDtdUFJhCY23zRHICCmdcqLphWmvNrGwS4fcKPbXSW5jX8KWpfe5nuooOqBEsvDtEahEUHfI_is0F8NU-gYv2iA-gmKGGPg7K0T0lawDA5xEtl3B8jhCzh681V3xVwHpkvOOXSXzj7GFDu5AP3ixiwPYzT4VUTd7fWIFEKSztODrf3nFh5bITRQG4zAn7kdaJ82gHHxViATaKOD7AIn6Ghks-sXo0-1fv1T9jE8Vfpq_nCg_Zc5lfs6jBTvMCIHcjvadlicEr9mXT4")'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                            lineNumber: 547,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                    lineNumber: 541,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                                lineNumber: 539,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                        lineNumber: 520,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-background transition-colors duration-300",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                        lineNumber: 560,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
                lineNumber: 518,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/app/dashboard/layout.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(DashboardLayout, "+YjlcsQWwVqs/Lm25OwiEC385RA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = DashboardLayout;
var _c;
__turbopack_context__.k.register(_c, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=skytrips-admin_src_1506c1ae._.js.map