(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/skytrips-admin/src/lib/env.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Environment Configuration and Validation
 * 
 * This module handles loading and validating environment variables.
 * It ensures that all required configuration is present before the application
 * attempts to use it, preventing runtime errors due to missing config.
 */ __turbopack_context__.s([
    "env",
    ()=>env,
    "validateConfig",
    ()=>validateConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const requiredClientVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];
const requiredServerVars = [
    'SUPABASE_SERVICE_ROLE_KEY'
];
function validateConfig() {
    const missing = [];
    const config = {
        supabase: {
            url: ("TURBOPACK compile-time value", "https://tjrmemmsieltajotxddk.supabase.co") || '',
            anonKey: ("TURBOPACK compile-time value", "sb_publishable_GxUlFYif0EEYIEYCEkqIGg_Xee1B4qZ") || '',
            serviceRoleKey: __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.SUPABASE_SERVICE_ROLE_KEY || ''
        }
    };
    // Check client-side vars explicitly to ensure they are inlined by Next.js
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Check server-side vars only if running on server
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (missing.length > 0) {
        const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
        console.error(`[Configuration Error] ${errorMsg}`);
        // In strict mode, you might want to throw an error
        // throw new Error(errorMsg);
        return {
            isValid: false,
            missing,
            config
        };
    }
    return {
        isValid: true,
        missing: [],
        config
    };
}
// Export a singleton instance of the validated config
const validationResult = validateConfig();
const env = {
    ...validationResult.config,
    isValid: validationResult.isValid,
    missing: validationResult.missing
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentSession",
    ()=>getCurrentSession,
    "getCurrentUser",
    ()=>getCurrentUser,
    "isUserAdmin",
    ()=>isUserAdmin,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/env.ts [app-client] (ecmascript)");
;
;
if (!__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].isValid) {
    console.error("Missing Supabase environment variables. Please check your .env.local file.");
}
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].supabase.url || "https://placeholder.supabase.co", __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["env"].supabase.anonKey || "placeholder");
async function isUserAdmin(userId) {
    try {
        const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
        if (error) {
            console.error("Error checking user role:", error);
            return false;
        }
        return data?.role === "admin";
    } catch (error) {
        console.error("Error in isUserAdmin:", error);
        return false;
    }
}
async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return null;
    }
    return session;
}
async function getCurrentUser() {
    const session = await getCurrentSession();
    if (!session?.user) {
        return {
            user: null,
            isAdmin: false
        };
    }
    const isAdmin = await isUserAdmin(session.user.id);
    return {
        user: session.user,
        isAdmin
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/AirportAutocomplete.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const AirportAutocomplete = ({ label, name, value, onChange, disabled, icon })=>{
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [filteredOptions, setFilteredOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeIndex, setActiveIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const listboxId = `${name}-listbox`;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AirportAutocomplete.useEffect": ()=>{
            const handleClickOutside = {
                "AirportAutocomplete.useEffect.handleClickOutside": (event)=>{
                    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["AirportAutocomplete.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "AirportAutocomplete.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["AirportAutocomplete.useEffect"];
        }
    }["AirportAutocomplete.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AirportAutocomplete.useEffect": ()=>{
            if (!isOpen) return;
            const runSearch = {
                "AirportAutocomplete.useEffect.runSearch": async ()=>{
                    try {
                        if (!value || value.trim().length < 1) {
                            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("airports").select("id,name,municipality,iata_code,iso_country,popularity").eq("published_status", true).not("iata_code", "is", null).order("popularity", {
                                ascending: false
                            }).limit(50);
                            if (error) throw error;
                            const options = (data || []).map({
                                "AirportAutocomplete.useEffect.runSearch.options": (row)=>({
                                        name: row.name || "",
                                        city: row.municipality || "",
                                        country: row.iso_country || undefined,
                                        IATA: row.iata_code || ""
                                    })
                            }["AirportAutocomplete.useEffect.runSearch.options"]);
                            setFilteredOptions(options);
                        } else {
                            const q = value.trim();
                            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("airports").select("id,name,municipality,iata_code,iso_country,popularity").or(`municipality.ilike.%${q}%,name.ilike.%${q}%,iata_code.ilike.%${q}%`).eq("published_status", true).limit(50);
                            if (error) throw error;
                            const options = (data || []).map({
                                "AirportAutocomplete.useEffect.runSearch.options": (row)=>({
                                        name: row.name || "",
                                        city: row.municipality || "",
                                        country: row.iso_country || undefined,
                                        IATA: row.iata_code || ""
                                    })
                            }["AirportAutocomplete.useEffect.runSearch.options"]);
                            setFilteredOptions(options);
                        }
                    } catch (e) {
                        console.error("Airport search failed:", e);
                        setFilteredOptions([]);
                    }
                }
            }["AirportAutocomplete.useEffect.runSearch"];
            const timer = setTimeout(runSearch, 200);
            return ({
                "AirportAutocomplete.useEffect": ()=>clearTimeout(timer)
            })["AirportAutocomplete.useEffect"];
        }
    }["AirportAutocomplete.useEffect"], [
        value,
        isOpen
    ]);
    const highlight = (text, query)=>{
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1 || !query) return text;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                text.slice(0, idx),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mark", {
                    className: "bg-yellow-100",
                    children: text.slice(idx, idx + query.length)
                }, void 0, false, {
                    fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                text.slice(idx + query.length)
            ]
        }, void 0, true);
    };
    const handleKeyDown = (e)=>{
        if (!isOpen || filteredOptions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev)=>(prev + 1) % filteredOptions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev)=>prev <= 0 ? filteredOptions.length - 1 : prev - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                const option = filteredOptions[activeIndex];
                onChange({
                    target: {
                        name,
                        value: `${option.name} (${option.IATA})`
                    }
                });
                setIsOpen(false);
                setActiveIndex(-1);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: wrapperRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                children: label
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-slate-400",
                            style: {
                                fontSize: "20px"
                            },
                            children: icon
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        role: "combobox",
                        "aria-expanded": isOpen,
                        "aria-controls": listboxId,
                        className: "block w-full h-12 pl-12 pr-10 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium",
                        name: name,
                        placeholder: "City or Airport",
                        type: "text",
                        value: value,
                        onChange: (e)=>{
                            onChange(e);
                            setIsOpen(true);
                            setActiveIndex(-1);
                        },
                        onFocus: ()=>setIsOpen(true),
                        onKeyDown: handleKeyDown,
                        disabled: disabled,
                        autoComplete: "off"
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": "Clear search",
                        className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600",
                        onClick: ()=>{
                            onChange({
                                target: {
                                    name,
                                    value: ""
                                }
                            });
                            setActiveIndex(-1);
                            setIsOpen(false);
                            setFilteredOptions([]);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                            lineNumber: 177,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                        lineNumber: 166,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && filteredOptions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                id: listboxId,
                role: "listbox",
                className: "absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto",
                children: filteredOptions.map((option, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        role: "option",
                        "aria-selected": activeIndex === index,
                        className: `px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none group ${activeIndex === index ? "bg-slate-50" : ""}`,
                        onClick: ()=>{
                            onChange({
                                target: {
                                    name,
                                    value: `${option.name} (${option.IATA})`
                                }
                            });
                            setIsOpen(false);
                            setActiveIndex(-1);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "min-w-0 pr-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-bold text-slate-700 text-sm group-hover:text-primary transition-colors break-words whitespace-normal",
                                            children: highlight(option.city || option.name, value)
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                                            lineNumber: 206,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-slate-500 mt-0.5 break-words whitespace-normal",
                                            children: highlight(option.name, value)
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                                            lineNumber: 209,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                                    lineNumber: 205,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors shrink-0",
                                    children: highlight(option.IATA, value)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                                    lineNumber: 213,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                            lineNumber: 204,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, `${option.IATA}-${index}`, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                        lineNumber: 188,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
                lineNumber: 182,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/AirportAutocomplete.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AirportAutocomplete, "GVmE1uCr3LEudSPQXRIexc934gk=");
_c = AirportAutocomplete;
const __TURBOPACK__default__export__ = AirportAutocomplete;
var _c;
__turbopack_context__.k.register(_c, "AirportAutocomplete");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$libs$2f$shared$2d$utils$2f$constants$2f$airline$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/skytrips-admin/libs/shared-utils/constants/airline.json (json)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const AirlineAutocomplete = ({ label, name, value, onChange, disabled, icon })=>{
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [filteredOptions, setFilteredOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeIndex, setActiveIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const listboxId = `${name}-listbox`;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AirlineAutocomplete.useEffect": ()=>{
            const handleClickOutside = {
                "AirlineAutocomplete.useEffect.handleClickOutside": (event)=>{
                    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["AirlineAutocomplete.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "AirlineAutocomplete.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["AirlineAutocomplete.useEffect"];
        }
    }["AirlineAutocomplete.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AirlineAutocomplete.useEffect": ()=>{
            if (isOpen) {
                const airlines = __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$libs$2f$shared$2d$utils$2f$constants$2f$airline$2e$json__$28$json$29$__["default"].airlinecodes;
                if (!value) {
                    setFilteredOptions(airlines.slice(0, 50));
                } else {
                    const lower = value.toLowerCase();
                    const filtered = airlines.filter({
                        "AirlineAutocomplete.useEffect.filtered": (a)=>a.name && a.name.toLowerCase().includes(lower) || a.iata && a.iata.toLowerCase().includes(lower)
                    }["AirlineAutocomplete.useEffect.filtered"]);
                    setFilteredOptions(filtered.slice(0, 50));
                }
            }
        }
    }["AirlineAutocomplete.useEffect"], [
        value,
        isOpen
    ]);
    const highlight = (text, query)=>{
        if (!text) return "";
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1 || !query) return text;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                text.slice(0, idx),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mark", {
                    className: "bg-yellow-100",
                    children: text.slice(idx, idx + query.length)
                }, void 0, false, {
                    fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                text.slice(idx + query.length)
            ]
        }, void 0, true);
    };
    const handleKeyDown = (e)=>{
        if (!isOpen || filteredOptions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev)=>(prev + 1) % filteredOptions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev)=>prev <= 0 ? filteredOptions.length - 1 : prev - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                const option = filteredOptions[activeIndex];
                onChange({
                    target: {
                        name,
                        value: `${option.name}`
                    }
                });
                setIsOpen(false);
                setActiveIndex(-1);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: wrapperRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                children: label
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-slate-400",
                            style: {
                                fontSize: "20px"
                            },
                            children: icon
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        role: "combobox",
                        "aria-expanded": isOpen,
                        "aria-controls": listboxId,
                        className: "block w-full h-12 pl-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium",
                        name: name,
                        placeholder: "Airline Name",
                        type: "text",
                        value: value,
                        onChange: (e)=>{
                            onChange(e);
                            setIsOpen(true);
                            setActiveIndex(-1);
                        },
                        onFocus: ()=>setIsOpen(true),
                        onKeyDown: handleKeyDown,
                        disabled: disabled,
                        autoComplete: "off"
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": "Clear search",
                        className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600",
                        onClick: ()=>{
                            onChange({
                                target: {
                                    name,
                                    value: ""
                                }
                            });
                            setActiveIndex(-1);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-[18px]",
                            children: "close"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                            lineNumber: 136,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && filteredOptions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                id: listboxId,
                role: "listbox",
                className: "absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto",
                children: filteredOptions.map((option, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        role: "option",
                        "aria-selected": activeIndex === index,
                        className: `px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none group ${activeIndex === index ? "bg-slate-50" : ""}`,
                        onClick: ()=>{
                            onChange({
                                target: {
                                    name,
                                    value: `${option.name}`
                                }
                            });
                            setIsOpen(false);
                            setActiveIndex(-1);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-bold text-slate-700 text-sm group-hover:text-primary transition-colors",
                                        children: highlight(option.name, value)
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                                        lineNumber: 165,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                                    lineNumber: 164,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                option.iata && option.iata !== '-' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors",
                                    children: highlight(option.iata, value)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                                    lineNumber: 170,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                            lineNumber: 163,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, index, false, {
                        fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                        lineNumber: 147,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
                lineNumber: 141,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AirlineAutocomplete, "GVmE1uCr3LEudSPQXRIexc934gk=");
_c = AirlineAutocomplete;
const __TURBOPACK__default__export__ = AirlineAutocomplete;
var _c;
__turbopack_context__.k.register(_c, "AirlineAutocomplete");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/CustomerSearch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomerSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function CustomerSearch({ onSelect, className = "" }) {
    _s();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomerSearch.useEffect": ()=>{
            const handleClickOutside = {
                "CustomerSearch.useEffect.handleClickOutside": (event)=>{
                    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["CustomerSearch.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "CustomerSearch.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["CustomerSearch.useEffect"];
        }
    }["CustomerSearch.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomerSearch.useEffect": ()=>{
            const searchCustomers = {
                "CustomerSearch.useEffect.searchCustomers": async ()=>{
                    if (query.trim().length < 2) {
                        setResults([]);
                        return;
                    }
                    setLoading(true);
                    try {
                        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("*").or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`).limit(5);
                        if (error) throw error;
                        setResults(data || []);
                    } catch (err) {
                        console.error("Error searching customers:", err);
                    } finally{
                        setLoading(false);
                    }
                }
            }["CustomerSearch.useEffect.searchCustomers"];
            const timer = setTimeout(searchCustomers, 300);
            return ({
                "CustomerSearch.useEffect": ()=>clearTimeout(timer)
            })["CustomerSearch.useEffect"];
        }
    }["CustomerSearch.useEffect"], [
        query
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative ${className}`,
        ref: wrapperRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-slate-400 text-[18px]",
                            children: "search"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        className: "block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm",
                        placeholder: "Search existing contact by name, email or phone...",
                        value: query,
                        onChange: (e)=>{
                            setQuery(e.target.value);
                            setIsOpen(true);
                        },
                        onFocus: ()=>setIsOpen(true)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            isOpen && results.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto",
                children: results.map((customer)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none transition-colors",
                        onClick: ()=>{
                            onSelect(customer);
                            setQuery(`${customer.firstName} ${customer.lastName}`);
                            setIsOpen(false);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-bold text-slate-900 text-sm",
                                            children: [
                                                customer.firstName,
                                                " ",
                                                customer.lastName
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                                            lineNumber: 95,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-slate-500 mt-0.5",
                                            children: customer.email
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                                            lineNumber: 98,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                                    lineNumber: 94,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded",
                                    children: customer.phone
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                                    lineNumber: 100,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                            lineNumber: 93,
                            columnNumber: 15
                        }, this)
                    }, customer.id, false, {
                        fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                        lineNumber: 84,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this),
            isOpen && query.length >= 2 && !loading && results.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-500",
                children: [
                    'No customers found matching "',
                    query,
                    '"'
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/CustomerSearch.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(CustomerSearch, "aM2epP8l5sXx6Gh70cwSzkGAplA=");
_c = CustomerSearch;
var _c;
__turbopack_context__.k.register(_c, "CustomerSearch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/TravellerSearch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TravellerSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function TravellerSearch({ onSelect, className = "" }) {
    _s();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TravellerSearch.useEffect": ()=>{
            const handleClickOutside = {
                "TravellerSearch.useEffect.handleClickOutside": (event)=>{
                    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                        setIsOpen(false);
                    }
                }
            }["TravellerSearch.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "TravellerSearch.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["TravellerSearch.useEffect"];
        }
    }["TravellerSearch.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TravellerSearch.useEffect": ()=>{
            const searchTravellers = {
                "TravellerSearch.useEffect.searchTravellers": async ()=>{
                    if (query.trim().length < 2) {
                        setResults([]);
                        return;
                    }
                    setLoading(true);
                    try {
                        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("travellers").select("*").or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,passport_number.ilike.%${query}%`).limit(5);
                        if (error) throw error;
                        setResults(data || []);
                    } catch (err) {
                        console.error("Error searching travellers:", err);
                    } finally{
                        setLoading(false);
                    }
                }
            }["TravellerSearch.useEffect.searchTravellers"];
            const timer = setTimeout(searchTravellers, 300);
            return ({
                "TravellerSearch.useEffect": ()=>clearTimeout(timer)
            })["TravellerSearch.useEffect"];
        }
    }["TravellerSearch.useEffect"], [
        query
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative ${className}`,
        ref: wrapperRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-slate-400 text-[18px]",
                            children: "search"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        className: "block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm",
                        placeholder: "Search traveller by name or passport...",
                        value: query,
                        onChange: (e)=>{
                            setQuery(e.target.value);
                            setIsOpen(true);
                        },
                        onFocus: ()=>setIsOpen(true)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            isOpen && results.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto",
                children: results.map((traveller)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none transition-colors",
                        onClick: ()=>{
                            onSelect(traveller);
                            setQuery(`${traveller.first_name} ${traveller.last_name}`);
                            setIsOpen(false);
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-start",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-bold text-slate-900 text-sm",
                                            children: [
                                                traveller.first_name,
                                                " ",
                                                traveller.last_name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                                            lineNumber: 95,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-slate-500 mt-0.5",
                                            children: traveller.nationality
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                                            lineNumber: 98,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                                    lineNumber: 94,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded",
                                    children: traveller.passport_number
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                                    lineNumber: 100,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                            lineNumber: 93,
                            columnNumber: 15
                        }, this)
                    }, traveller.id, false, {
                        fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                        lineNumber: 84,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this),
            isOpen && query.length >= 2 && !loading && results.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-500",
                children: [
                    'No travellers found matching "',
                    query,
                    '"'
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/TravellerSearch.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(TravellerSearch, "aM2epP8l5sXx6Gh70cwSzkGAplA=");
_c = TravellerSearch;
var _c;
__turbopack_context__.k.register(_c, "TravellerSearch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookingModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$AirportAutocomplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/AirportAutocomplete.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$AirlineAutocomplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/AirlineAutocomplete.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$CustomerSearch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/CustomerSearch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$TravellerSearch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/TravellerSearch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$libs$2f$shared$2d$utils$2f$constants$2f$country$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/skytrips-admin/libs/shared-utils/constants/country.json (json)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function BookingModal({ isOpen, onClose, onSave, onEdit, booking, isLoading, isReadOnly = false }) {
    _s();
    const [isMealModalOpen, setIsMealModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showStopover, setShowStopover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchingTravellerIndex, setSearchingTravellerIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedCustomer, setSelectedCustomer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [agencies, setAgencies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [agenciesLoading, setAgenciesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [usersLoading, setUsersLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        email: "sarita.p@example.com",
        phone: "+61 412 345 678",
        travellers: [],
        travellerFirstName: "",
        travellerLastName: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: "Nepalese",
        dob: "1985-03-15",
        tripType: "One Way",
        travelDate: "",
        returnDate: "",
        origin: "",
        destination: "",
        transit: "",
        airlines: "",
        flightNumber: "",
        flightClass: "Economy",
        frequentFlyer: "",
        pnr: "",
        ticketNumber: "",
        issueMonth: "",
        IssueDay: "",
        issueYear: "",
        agency: "SkyHigh Agency Ltd.",
        handledBy: "John Doe",
        status: "Confirmed",
        currency: "USD",
        paymentStatus: "Pending",
        paymentMethod: "",
        transactionId: "",
        paymentDate: "",
        buyingPrice: "0.00",
        costPrice: "0.00",
        sellingPrice: "0.00",
        payment: "Pending",
        addons: {
            meals: false,
            wheelchair: false,
            pickup: false,
            dropoff: false,
            luggage: false
        },
        prices: {
            meals: "0.00",
            wheelchair: "0.00",
            pickup: "0.00",
            dropoff: "0.00",
            luggage: "0.00"
        },
        customerType: "existing",
        contactType: "existing",
        itineraries: [
            {
                segments: []
            }
        ]
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingModal.useEffect": ()=>{
            const loadAgencies = {
                "BookingModal.useEffect.loadAgencies": async ()=>{
                    setAgenciesLoading(true);
                    try {
                        const params = new URLSearchParams({
                            page: "1",
                            pageSize: "100",
                            q: "",
                            status: "active",
                            sortKey: "agency_name",
                            sortDir: "asc"
                        });
                        const res = await fetch(`/api/agencies?${params.toString()}`);
                        const j = await res.json();
                        if (!res.ok) {
                            console.error("Failed to load agencies", j.error);
                            return;
                        }
                        setAgencies(j.data || []);
                    } catch (e) {
                        console.error("Failed to load agencies", e);
                    } finally{
                        setAgenciesLoading(false);
                    }
                }
            }["BookingModal.useEffect.loadAgencies"];
            const loadUsers = {
                "BookingModal.useEffect.loadUsers": async ()=>{
                    setUsersLoading(true);
                    try {
                        const { data: rows, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("users").select("*").order("created_at", {
                            ascending: false
                        });
                        if (error) throw error;
                        setUsers(rows || []);
                    } catch (e) {
                        console.error("Failed to load users", e);
                    } finally{
                        setUsersLoading(false);
                    }
                }
            }["BookingModal.useEffect.loadUsers"];
            loadAgencies();
            loadUsers();
        }
    }["BookingModal.useEffect"], []);
    const [travellerType, setTravellerType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("new");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingModal.useEffect": ()=>{
            if (booking) {
                let loadedTravellers = [];
                if (booking.travellers && Array.isArray(booking.travellers) && booking.travellers.length > 0) {
                    loadedTravellers = booking.travellers.map({
                        "BookingModal.useEffect": (t)=>({
                                id: t.id || Date.now().toString() + Math.random().toString(),
                                firstName: t.firstName || t.first_name || "",
                                lastName: t.lastName || t.last_name || "",
                                passportNumber: t.passportNumber || t.passport_number || "",
                                passportExpiry: t.passportExpiry || t.passport_expiry || "",
                                dob: t.dob || "",
                                nationality: t.nationality || "Nepalese",
                                customerId: t.customerId || t.customer_id,
                                saveToDatabase: t.saveToDatabase || false,
                                eticketNumber: t.eticketNumber || t.eticket_number || ""
                            })
                    }["BookingModal.useEffect"]);
                } else {
                // Fallback to flat fields
                // loadedTravellers = [
                //   {
                //     id: Date.now().toString(),
                //     firstName: booking.travellerFirstName || "",
                //     lastName: booking.travellerLastName || "",
                //     passportNumber: booking.passportNumber || "",
                //     passportExpiry: booking.passportExpiry || "",
                //     dob: booking.dob || "",
                //     nationality: booking.nationality || "Nepalese",
                //     eticketNumber: "",
                //   },
                // ];
                }
                setFormData({
                    "BookingModal.useEffect": (prev)=>({
                            ...prev,
                            ...booking,
                            travellers: loadedTravellers,
                            pnr: booking.PNR || prev.pnr,
                            // Ensure all fields are mapped
                            issueMonth: booking.issueMonth || "",
                            IssueDay: booking.IssueDay || "",
                            issueYear: booking.issueYear || "",
                            buyingPrice: booking.buyingPrice || "0.00",
                            payment: booking.payment || "Pending",
                            paymentDate: booking.dateofpayment || "",
                            customerType: booking.customerType || "existing",
                            contactType: booking.contactType || "existing",
                            addons: booking.addons || prev.addons,
                            prices: booking.prices || prev.prices,
                            stopoverLocation: booking.stopoverLocation || "",
                            agency: booking.issuedthroughagency || booking.agency || "N/A",
                            customerid: booking.customerid || booking.customerId || undefined,
                            returnDate: booking.returnDate || "",
                            itineraries: booking.itineraries || [
                                {
                                    segments: []
                                }
                            ]
                        })
                }["BookingModal.useEffect"]);
                if (booking.customer) {
                    setSelectedCustomer(booking.customer);
                }
                if (booking.stopoverLocation) {
                    setShowStopover(true);
                }
            } else {
                // Reset for new booking
                setFormData({
                    email: "",
                    phone: "",
                    travellers: [
                        {
                            id: Date.now().toString(),
                            firstName: "",
                            lastName: "",
                            passportNumber: "",
                            passportExpiry: "",
                            nationality: "Australian",
                            dob: "",
                            eticketNumber: ""
                        }
                    ],
                    travellerFirstName: "",
                    travellerLastName: "",
                    passportNumber: "",
                    passportExpiry: "",
                    nationality: "Australian",
                    dob: "",
                    tripType: "One Way",
                    travelDate: "",
                    returnDate: "",
                    origin: "",
                    destination: "",
                    transit: "",
                    airlines: "",
                    flightNumber: "",
                    flightClass: "Economy",
                    frequentFlyer: "",
                    pnr: "",
                    ticketNumber: "",
                    issueMonth: "",
                    IssueDay: "",
                    issueYear: "",
                    agency: "SkyHigh Agency Ltd.",
                    handledBy: "",
                    status: "Confirmed",
                    currency: "USD",
                    paymentStatus: "Pending",
                    paymentMethod: "",
                    transactionId: "",
                    paymentDate: "",
                    buyingPrice: "0.00",
                    costPrice: "0.00",
                    sellingPrice: "0.00",
                    payment: "Pending",
                    addons: {
                        meals: false,
                        wheelchair: false,
                        pickup: false,
                        dropoff: false,
                        luggage: false
                    },
                    prices: {
                        meals: "0.00",
                        wheelchair: "0.00",
                        pickup: "0.00",
                        dropoff: "0.00",
                        luggage: "0.00"
                    },
                    customerType: "existing",
                    contactType: "existing",
                    customerid: undefined,
                    itineraries: [
                        {
                            segments: []
                        }
                    ]
                });
                setShowStopover(false);
            }
        }
    }["BookingModal.useEffect"], [
        booking,
        isOpen
    ]);
    if (!isOpen) return null;
    const handleChange = (e)=>{
        if (isReadOnly) return;
        const { name, value, type, checked } = e.target;
        if (name === "tripType") {
            let newItineraries = [
                ...formData.itineraries
            ];
            if (value === "Round Trip" && newItineraries.length < 2) {
                newItineraries.push({
                    segments: []
                });
            } else if (value === "One Way" && newItineraries.length > 1) {
                newItineraries = [
                    newItineraries[0]
                ];
            }
            setFormData((prev)=>({
                    ...prev,
                    tripType: value,
                    itineraries: newItineraries
                }));
            return;
        }
        if (type === "checkbox" && name.startsWith("addon-")) {
            const addonName = name.replace("addon-", "");
            setFormData((prev)=>({
                    ...prev,
                    addons: {
                        ...prev.addons,
                        [addonName]: checked
                    }
                }));
        } else if (name.startsWith("price-")) {
            const priceName = name.replace("price-", "");
            setFormData((prev)=>({
                    ...prev,
                    prices: {
                        ...prev.prices,
                        [priceName]: value
                    }
                }));
        } else {
            setFormData((prev)=>({
                    ...prev,
                    [name]: value
                }));
        }
    };
    const calculateAddonsTotal = ()=>{
        return Object.values(formData.prices || {}).reduce((acc, price)=>acc + (parseFloat(price) || 0), 0).toFixed(2);
    };
    const calculateGrandTotal = ()=>{
        const sellingPrice = parseFloat(formData.sellingPrice) || 0;
        const addonsTotal = parseFloat(calculateAddonsTotal()) || 0;
        return (sellingPrice + addonsTotal).toFixed(2);
    };
    const handleCustomerSelect = (customer)=>{
        setSelectedCustomer(customer);
        if (searchingTravellerIndex !== null) {
            // Update specific traveller
            setFormData((prev)=>{
                const newTravellers = [
                    ...prev.travellers
                ];
                if (!newTravellers[searchingTravellerIndex]) {
                    newTravellers[searchingTravellerIndex] = {
                        id: Date.now().toString(),
                        firstName: "",
                        lastName: ""
                    };
                }
                newTravellers[searchingTravellerIndex] = {
                    ...newTravellers[searchingTravellerIndex],
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    passportNumber: customer.passport?.number || "",
                    passportExpiry: customer.passport?.expiryDate || "",
                    dob: customer.dateOfBirth || "",
                    nationality: customer.country || "Nepalese",
                    customerId: customer.id
                };
                const updates = {
                    travellers: newTravellers
                };
                // Sync primary if index 0
                if (searchingTravellerIndex === 0) {
                    updates.travellerFirstName = customer.firstName;
                    updates.travellerLastName = customer.lastName;
                    updates.passportNumber = customer.passport?.number || "";
                    updates.passportExpiry = customer.passport?.expiryDate || "";
                    updates.dob = customer.dateOfBirth || "";
                    updates.nationality = customer.country || "Nepalese";
                    // Also sync contact info if needed
                    updates.email = prev.email || customer.email;
                    updates.phone = prev.phone || customer.phone;
                    updates.customerid = customer.id?.toString();
                    updates.customerType = "existing";
                }
                return {
                    ...prev,
                    ...updates
                };
            });
            setSearchingTravellerIndex(null);
            return;
        }
        // Fallback for "Existing Customer" contact search (not traveller search)
        setFormData((prev)=>({
                ...prev,
                // Common fields
                email: customer.email || prev.email,
                phone: customer.phone || prev.phone,
                nationality: customer.country || prev.nationality,
                customerid: customer.id?.toString(),
                // Update traveller fields if we are in traveller selection mode OR if they match
                travellerFirstName: customer.firstName || prev.travellerFirstName,
                travellerLastName: customer.lastName || prev.travellerLastName,
                passportNumber: customer.passport?.number || prev.passportNumber,
                passportExpiry: customer.passport?.expiryDate || prev.passportExpiry,
                dob: customer.dateOfBirth || prev.dob,
                // Update first traveller in array too
                travellers: prev.travellers.map((t, i)=>i === 0 ? {
                        ...t,
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        passportNumber: customer.passport?.number || t.passportNumber,
                        passportExpiry: customer.passport?.expiryDate || t.passportExpiry,
                        dob: customer.dateOfBirth || t.dob,
                        nationality: customer.country || t.nationality,
                        customerId: customer.id
                    } : t)
            }));
    };
    const handleTravellerSelect = (traveller)=>{
        if (searchingTravellerIndex === null) return;
        setFormData((prev)=>{
            const newTravellers = [
                ...prev.travellers
            ];
            newTravellers[searchingTravellerIndex] = {
                ...newTravellers[searchingTravellerIndex],
                firstName: traveller.first_name,
                lastName: traveller.last_name,
                passportNumber: traveller.passport_number || "",
                passportExpiry: traveller.passport_expiry || "",
                dob: traveller.dob || "",
                nationality: traveller.nationality || "Nepalese",
                eticketNumber: ""
            };
            // Sync primary if index 0
            const updates = {
                travellers: newTravellers
            };
            if (searchingTravellerIndex === 0) {
                updates.travellerFirstName = traveller.first_name;
                updates.travellerLastName = traveller.last_name;
                updates.passportNumber = traveller.passport_number || "";
                updates.passportExpiry = traveller.passport_expiry || "";
                updates.dob = traveller.dob || "";
                updates.nationality = traveller.nationality || "Nepalese";
            }
            return {
                ...prev,
                ...updates
            };
        });
        setSearchingTravellerIndex(null);
    };
    const handleTravellerChange = (index, field, value)=>{
        setFormData((prev)=>{
            const newTravellers = [
                ...prev.travellers
            ];
            newTravellers[index] = {
                ...newTravellers[index],
                [field]: value
            };
            // Sync primary traveller (index 0) with flat fields
            if (index === 0) {
                const mapping = {
                    firstName: "travellerFirstName",
                    lastName: "travellerLastName",
                    passportNumber: "passportNumber",
                    passportExpiry: "passportExpiry",
                    dob: "dob",
                    nationality: "nationality"
                };
                if (mapping[field]) {
                    prev[mapping[field]] = value;
                }
            }
            return {
                ...prev,
                travellers: newTravellers
            };
        });
    };
    const addTraveller = ()=>{
        setFormData((prev)=>({
                ...prev,
                travellers: [
                    ...prev.travellers,
                    {
                        id: Date.now().toString(),
                        firstName: "",
                        lastName: "",
                        passportNumber: "",
                        passportExpiry: "",
                        dob: "",
                        nationality: "Nepalese",
                        eticketNumber: ""
                    }
                ]
            }));
    };
    const removeTraveller = (index)=>{
        setFormData((prev)=>{
            if (prev.travellers.length <= 1) return prev;
            const newTravellers = [
                ...prev.travellers
            ];
            newTravellers.splice(index, 1);
            return {
                ...prev,
                travellers: newTravellers
            };
        });
    };
    const addSegment = (itineraryIndex)=>{
        setFormData((prev)=>{
            const newItineraries = [
                ...prev.itineraries
            ];
            newItineraries[itineraryIndex].segments.push({
                departure: {
                    iataCode: "",
                    at: ""
                },
                arrival: {
                    iataCode: "",
                    at: ""
                },
                carrierCode: "",
                number: "",
                duration: ""
            });
            return {
                ...prev,
                itineraries: newItineraries
            };
        });
    };
    const removeSegment = (itineraryIndex, segmentIndex)=>{
        setFormData((prev)=>{
            const newItineraries = [
                ...prev.itineraries
            ];
            newItineraries[itineraryIndex].segments.splice(segmentIndex, 1);
            return {
                ...prev,
                itineraries: newItineraries
            };
        });
    };
    const handleSegmentChange = (itineraryIndex, segmentIndex, field, value, nestedField)=>{
        setFormData((prev)=>{
            const newItineraries = [
                ...prev.itineraries
            ];
            const segment = newItineraries[itineraryIndex].segments[segmentIndex];
            if (nestedField) {
                // Handle nested fields like departure.iataCode
                segment[field] = {
                    ...segment[field],
                    [nestedField]: value
                };
            } else {
                segment[field] = value;
            }
            return {
                ...prev,
                itineraries: newItineraries
            };
        });
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (isReadOnly) return;
        // Process new travellers to save to DB
        for (const t of formData.travellers){
            if (t.saveToDatabase && t.firstName && t.lastName) {
                try {
                    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("travellers").insert({
                        first_name: t.firstName,
                        last_name: t.lastName,
                        passport_number: t.passportNumber,
                        passport_expiry: t.passportExpiry || null,
                        dob: t.dob || null,
                        nationality: t.nationality
                    });
                    if (error) console.error("Error saving traveller:", error);
                } catch (err) {
                    console.error("Error processing traveller save:", err);
                }
            }
        }
        // Validation: Ensure customer is selected if "Existing" is chosen
        // if (formData.contactType === "existing" && !formData.customerid) {
        //   alert("Please select an existing customer from the search results.");
        //   return;
        // }
        // Helper to convert empty strings to null for date fields
        const toDateOrNull = (dateStr)=>{
            if (!dateStr || dateStr.trim() === "") return null;
            return dateStr;
        };
        // Map back to the Booking interface structure before saving
        const bookingToSave = {
            // Legacy flat fields removed to prevent usage
            // travellerFirstName: ... // REMOVED
            // travellerLastName: ...  // REMOVED
            // Core booking fields
            PNR: formData.pnr,
            // ticketNumber: ... // REMOVED
            airlines: formData.airlines,
            travelDate: toDateOrNull(formData.travelDate),
            departureDate: toDateOrNull(formData.travelDate),
            returnDate: toDateOrNull(formData.returnDate),
            itineraries: formData.itineraries,
            origin: formData.origin,
            transit: formData.transit,
            destination: formData.destination,
            tripType: formData.tripType,
            issueMonth: formData.issueMonth || new Date().getMonth() + 1 + "",
            IssueDay: formData.IssueDay || new Date().getDate() + "",
            issueYear: formData.issueYear || new Date().getFullYear() + "",
            buyingPrice: formData.costPrice,
            costprice: formData.costPrice,
            sellingPrice: formData.sellingPrice,
            payment: formData.paymentStatus,
            status: formData.status,
            // Re-enabled fields as columns are added to DB
            email: formData.email,
            phone: formData.phone,
            // Passport info - prefer travellers array but keep flat if needed for some legacy view
            passportNumber: formData.travellers[0]?.passportNumber || formData.passportNumber,
            passportExpiry: toDateOrNull(formData.travellers[0]?.passportExpiry || formData.passportExpiry),
            nationality: formData.travellers[0]?.nationality || formData.nationality,
            dob: toDateOrNull(formData.dob),
            flightNumber: formData.flightNumber,
            flightClass: formData.flightClass,
            frequentFlyer: formData.frequentFlyer,
            issuedthroughagency: formData.agency,
            handledBy: formData.handledBy,
            paymentStatus: formData.paymentStatus,
            paymentMethod: formData.paymentMethod,
            transactionId: formData.transactionId,
            dateofpayment: toDateOrNull(formData.paymentDate),
            stopoverLocation: formData.stopoverLocation,
            customerid: formData.customerid,
            travellers: formData.travellers,
            customer: selectedCustomer || undefined,
            // Custom fields
            customerType: formData.customerType,
            contactType: formData.contactType,
            addons: formData.addons,
            prices: formData.prices
        };
        onSave(bookingToSave);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                lineNumber: 730,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-white w-full max-w-6xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border border-gray-200 mx-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-lg font-semibold text-gray-900",
                                        children: booking ? "Edit Booking" : "New Booking"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 740,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-500",
                                        children: booking ? `Manage details for Booking #${booking.id}` : "Enter new booking details"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 743,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                lineNumber: 739,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "p-2 text-gray-400 hover:text-gray-500 transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-2xl",
                                        children: "close"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 754,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                    lineNumber: 750,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                lineNumber: 749,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                        lineNumber: 738,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto bg-gray-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                            className: "p-6 lg:p-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "lg:col-span-2 space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-lg font-bold text-slate-900 flex items-center tracking-tight",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-primary mr-3",
                                                                        children: "contact_mail"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 770,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    "Customer Contact Details"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 769,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 768,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mb-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-col sm:flex-row sm:items-center gap-6",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-4 w-full sm:w-auto",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center h-6",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                checked: formData.contactType === "existing",
                                                                                                onChange: ()=>setFormData((prev)=>({
                                                                                                            ...prev,
                                                                                                            contactType: "existing"
                                                                                                        })),
                                                                                                className: "focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer",
                                                                                                id: "existing-contact",
                                                                                                name: "contact-type",
                                                                                                type: "radio",
                                                                                                value: "existing"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 781,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 780,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900",
                                                                                            htmlFor: "existing-contact",
                                                                                            children: "Existing Customer"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 796,
                                                                                            columnNumber: 29
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 779,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-4 w-full sm:w-auto",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center h-6",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                checked: formData.contactType === "new",
                                                                                                onChange: ()=>setFormData((prev)=>({
                                                                                                            ...prev,
                                                                                                            contactType: "new"
                                                                                                        })),
                                                                                                className: "focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer",
                                                                                                id: "new-contact",
                                                                                                name: "contact-type",
                                                                                                type: "radio",
                                                                                                value: "new"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 805,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 804,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900",
                                                                                            htmlFor: "new-contact",
                                                                                            children: "New Customer"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 820,
                                                                                            columnNumber: 29
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 803,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 778,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        formData.contactType === "existing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-full mt-6 relative",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$CustomerSearch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                onSelect: handleCustomerSelect,
                                                                                className: "w-full"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 831,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 830,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 777,
                                                                    columnNumber: 23
                                                                }, this),
                                                                formData.contactType === "new" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-6",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-1 md:grid-cols-2 gap-8",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            htmlFor: "travellerFirstName",
                                                                                            children: "First Name"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 843,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "relative rounded-lg shadow-sm",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "material-symbols-outlined text-slate-400",
                                                                                                        style: {
                                                                                                            fontSize: "20px"
                                                                                                        },
                                                                                                        children: "person"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 851,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 850,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium uppercase",
                                                                                                    id: "travellerFirstName",
                                                                                                    name: "travellerFirstName",
                                                                                                    type: "text",
                                                                                                    value: formData.travellerFirstName,
                                                                                                    onChange: handleChange,
                                                                                                    placeholder: "Given Name",
                                                                                                    disabled: isReadOnly
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 858,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 849,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 842,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            htmlFor: "travellerLastName",
                                                                                            children: "Last Name"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 871,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "relative rounded-lg shadow-sm",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "material-symbols-outlined text-slate-400",
                                                                                                        style: {
                                                                                                            fontSize: "20px"
                                                                                                        },
                                                                                                        children: "person"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 879,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 878,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium uppercase",
                                                                                                    id: "travellerLastName",
                                                                                                    name: "travellerLastName",
                                                                                                    type: "text",
                                                                                                    value: formData.travellerLastName,
                                                                                                    onChange: handleChange,
                                                                                                    placeholder: "Surname",
                                                                                                    disabled: isReadOnly
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 886,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 877,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 870,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 841,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-1 md:grid-cols-2 gap-8",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            htmlFor: "email",
                                                                                            children: "Email Address"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 901,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "relative rounded-lg shadow-sm",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "material-symbols-outlined text-slate-400",
                                                                                                        style: {
                                                                                                            fontSize: "20px"
                                                                                                        },
                                                                                                        children: "email"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 909,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 908,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium",
                                                                                                    id: "email",
                                                                                                    name: "email",
                                                                                                    type: "email",
                                                                                                    value: formData.email,
                                                                                                    onChange: handleChange,
                                                                                                    placeholder: "customer@email.com",
                                                                                                    disabled: isReadOnly
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 916,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 907,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 900,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            htmlFor: "phone",
                                                                                            children: "Phone Number"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 929,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "relative rounded-lg shadow-sm",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "material-symbols-outlined text-slate-400",
                                                                                                        style: {
                                                                                                            fontSize: "20px"
                                                                                                        },
                                                                                                        children: "phone"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 937,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 936,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium",
                                                                                                    id: "phone",
                                                                                                    name: "phone",
                                                                                                    type: "tel",
                                                                                                    value: formData.phone,
                                                                                                    onChange: handleChange,
                                                                                                    placeholder: "+61 XXX XXX XXX",
                                                                                                    disabled: isReadOnly
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 944,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 935,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 928,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 899,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 840,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 776,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-lg font-bold text-slate-900 flex items-center tracking-tight",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-primary mr-3",
                                                                        children: "person"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 966,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    "Traveller Information"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 965,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 964,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-8",
                                                            children: [
                                                                formData.travellers.map((traveller, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "mb-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100 relative group",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex justify-between items-center mb-6",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "font-bold text-slate-800 text-lg flex items-center gap-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm",
                                                                                                children: index + 1
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 980,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            "Traveller Details"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 979,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex gap-2",
                                                                                        children: formData.travellers.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            type: "button",
                                                                                            onClick: ()=>removeTraveller(index),
                                                                                            className: "text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 flex items-center gap-1",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "material-symbols-outlined text-[16px]",
                                                                                                    children: "delete"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 992,
                                                                                                    columnNumber: 35
                                                                                                }, this),
                                                                                                "Remove"
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 987,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 985,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 978,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex flex-col sm:flex-row sm:items-center gap-6",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center gap-4 w-full sm:w-auto",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "flex items-center h-6",
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                        checked: travellerType === "existing",
                                                                                                        onChange: ()=>{
                                                                                                            setTravellerType("existing");
                                                                                                            setSearchingTravellerIndex(index);
                                                                                                        },
                                                                                                        className: "focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer",
                                                                                                        id: `existing-traveller-${index}`,
                                                                                                        name: `traveller-type-${index}`,
                                                                                                        type: "radio",
                                                                                                        value: "existing"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1005,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1004,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                    className: "font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900",
                                                                                                    htmlFor: `existing-traveller-${index}`,
                                                                                                    children: "Existing Traveller"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1018,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1003,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center gap-4 w-full sm:w-auto",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "flex items-center h-6",
                                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                        checked: travellerType === "new",
                                                                                                        onChange: ()=>{
                                                                                                            setTravellerType("new");
                                                                                                            setSearchingTravellerIndex(null);
                                                                                                        },
                                                                                                        className: "focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer",
                                                                                                        id: `new-traveller-${index}`,
                                                                                                        name: `traveller-type-${index}`,
                                                                                                        type: "radio",
                                                                                                        value: "new"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1027,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1026,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                    className: "font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900",
                                                                                                    htmlFor: `new-traveller-${index}`,
                                                                                                    children: "New Traveller"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1040,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1025,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1002,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1001,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            travellerType === "existing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "mb-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-white p-4 rounded-xl border border-blue-100 shadow-sm",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                                        children: "Search Existing Traveller"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1052,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$TravellerSearch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                        onSelect: (t)=>{
                                                                                            handleTravellerSelect(t);
                                                                                        }
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1055,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-slate-500 mt-2",
                                                                                        children: "Select a traveller to auto-fill their details."
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1060,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1051,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            (travellerType === "new" || travellerType === "existing" && traveller.firstName) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "grid grid-cols-1 md:grid-cols-2 gap-8",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "col-span-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                children: "First Name"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1071,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium pl-4 uppercase",
                                                                                                value: traveller.firstName,
                                                                                                onChange: (e)=>handleTravellerChange(index, "firstName", e.target.value),
                                                                                                disabled: isReadOnly,
                                                                                                placeholder: "Given Name"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1074,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1070,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "col-span-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                children: "Last Name"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1089,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium pl-4 uppercase",
                                                                                                value: traveller.lastName,
                                                                                                onChange: (e)=>handleTravellerChange(index, "lastName", e.target.value),
                                                                                                disabled: isReadOnly,
                                                                                                placeholder: "Surname"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1092,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1088,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                        className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                        children: "Passport Number"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1108,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "relative rounded-lg shadow-sm",
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                                    className: "material-symbols-outlined text-slate-400",
                                                                                                                    style: {
                                                                                                                        fontSize: "20px"
                                                                                                                    },
                                                                                                                    children: "badge"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                    lineNumber: 1113,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1112,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium uppercase",
                                                                                                                value: traveller.passportNumber || "",
                                                                                                                onChange: (e)=>handleTravellerChange(index, "passportNumber", e.target.value),
                                                                                                                disabled: isReadOnly,
                                                                                                                placeholder: "e.g. A1234567X"
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1120,
                                                                                                                columnNumber: 37
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1111,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1107,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                        className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                        children: "Passport Expiry Date"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1136,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                        className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                                        type: "date",
                                                                                                        value: traveller.passportExpiry || "",
                                                                                                        onChange: (e)=>handleTravellerChange(index, "passportExpiry", e.target.value),
                                                                                                        disabled: isReadOnly
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1139,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1135,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1106,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                        className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                        children: "Nationality"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1156,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                                        className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                                        value: traveller.nationality || "Nepalese",
                                                                                                        onChange: (e)=>handleTravellerChange(index, "nationality", e.target.value),
                                                                                                        disabled: isReadOnly,
                                                                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$libs$2f$shared$2d$utils$2f$constants$2f$country$2e$json__$28$json$29$__["default"].countries.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                                                value: c.label,
                                                                                                                children: c.label
                                                                                                            }, c.value, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1172,
                                                                                                                columnNumber: 39
                                                                                                            }, this))
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1159,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1155,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                        className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                        children: "Date of Birth"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1179,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                        className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                                        type: "date",
                                                                                                        value: traveller.dob || "",
                                                                                                        onChange: (e)=>handleTravellerChange(index, "dob", e.target.value),
                                                                                                        disabled: isReadOnly
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1182,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1178,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                        className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                                        children: "E-Ticket Number"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1197,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "relative rounded-lg shadow-sm",
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                                    className: "material-symbols-outlined text-slate-400",
                                                                                                                    style: {
                                                                                                                        fontSize: "20px"
                                                                                                                    },
                                                                                                                    children: "confirmation_number"
                                                                                                                }, void 0, false, {
                                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                    lineNumber: 1202,
                                                                                                                    columnNumber: 39
                                                                                                                }, this)
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1201,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium",
                                                                                                                value: traveller.eticketNumber || "",
                                                                                                                onChange: (e)=>handleTravellerChange(index, "eticketNumber", e.target.value),
                                                                                                                disabled: isReadOnly,
                                                                                                                placeholder: "E-Ticket No."
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1209,
                                                                                                                columnNumber: 37
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1200,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1196,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                className: "flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "flex items-center h-5 mt-0.5",
                                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                            type: "checkbox",
                                                                                                            className: "w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer",
                                                                                                            checked: traveller.saveToDatabase || false,
                                                                                                            onChange: (e)=>handleTravellerChange(index, "saveToDatabase", e.target.checked),
                                                                                                            disabled: isReadOnly
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                            lineNumber: 1226,
                                                                                                            columnNumber: 37
                                                                                                        }, this)
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1225,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                                className: "text-sm font-bold text-slate-700 group-hover:text-primary transition-colors",
                                                                                                                children: "Save to Travellers Database"
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1243,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                className: "text-xs text-slate-500 mt-0.5",
                                                                                                                children: "Add this person to your saved travellers list for future bookings."
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1246,
                                                                                                                columnNumber: 37
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1242,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1224,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1154,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1069,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, traveller.id || index, true, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 974,
                                                                        columnNumber: 25
                                                                    }, this)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: addTraveller,
                                                                    className: "w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "material-symbols-outlined",
                                                                            children: "person_add"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1263,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Add Another Traveller"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1258,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 972,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 963,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-lg font-bold text-slate-900 flex items-center tracking-tight",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-primary mr-3",
                                                                        children: "flight_takeoff"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 1275,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    "Route & Trip Details"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 1274,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1273,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-8",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                    children: "Trip Type"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1284,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                    className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                    name: "tripType",
                                                                                    value: formData.tripType,
                                                                                    onChange: handleChange,
                                                                                    disabled: isReadOnly,
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            children: "One Way"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1294,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            children: "Round Trip"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1295,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            children: "Multi City"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1296,
                                                                                            columnNumber: 29
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1287,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1283,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-2 gap-4",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            children: "Departure Date"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1301,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                            name: "travelDate",
                                                                                            type: "date",
                                                                                            value: formData.travelDate,
                                                                                            onChange: handleChange,
                                                                                            disabled: isReadOnly
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1304,
                                                                                            columnNumber: 29
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1300,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                formData.tripType === "Round Trip" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            children: "Return Date"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1315,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                            name: "returnDate",
                                                                                            type: "date",
                                                                                            value: formData.returnDate,
                                                                                            onChange: handleChange,
                                                                                            disabled: isReadOnly
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1318,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1314,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1299,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$AirportAutocomplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                label: "Origin (From)",
                                                                                name: "origin",
                                                                                value: formData.origin,
                                                                                onChange: handleChange,
                                                                                disabled: isReadOnly,
                                                                                icon: "flight_takeoff"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1330,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1329,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$AirportAutocomplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                label: "Destination (To)",
                                                                                name: "destination",
                                                                                value: formData.destination,
                                                                                onChange: handleChange,
                                                                                disabled: isReadOnly,
                                                                                icon: "flight_land"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1340,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1339,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1282,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-6",
                                                                    children: formData.itineraries?.map((itinerary, itinIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "bg-slate-50 border border-slate-200 rounded-xl p-6",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex justify-between items-center mb-4",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                        className: "text-sm font-bold text-slate-800 uppercase tracking-wider",
                                                                                        children: itinIndex === 0 ? "Outbound Flight Segments" : "Return Flight Segments"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1359,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1358,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "space-y-4",
                                                                                    children: [
                                                                                        itinerary.segments.map((segment, segIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                                        type: "button",
                                                                                                        onClick: ()=>removeSegment(itinIndex, segIndex),
                                                                                                        className: "absolute top-2 right-2 text-slate-400 hover:text-red-500",
                                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                            className: "material-symbols-outlined text-lg",
                                                                                                            children: "delete"
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                            lineNumber: 1379,
                                                                                                            columnNumber: 37
                                                                                                        }, this)
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1372,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4",
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                className: "col-span-1 md:col-span-2",
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                                        className: "text-xs font-bold text-slate-500 uppercase",
                                                                                                                        children: "Departure"
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1387,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this),
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                        className: "grid grid-cols-3 gap-2 mt-1",
                                                                                                                        children: [
                                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                                placeholder: "IATA",
                                                                                                                                className: "block w-full rounded-md border-slate-200 text-sm",
                                                                                                                                value: segment.departure?.iataCode,
                                                                                                                                onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "departure", e.target.value, "iataCode")
                                                                                                                            }, void 0, false, {
                                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                                lineNumber: 1391,
                                                                                                                                columnNumber: 41
                                                                                                                            }, this),
                                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                                placeholder: "Terminal",
                                                                                                                                className: "block w-full rounded-md border-slate-200 text-sm",
                                                                                                                                value: segment.departure?.terminal,
                                                                                                                                onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "departure", e.target.value, "terminal")
                                                                                                                            }, void 0, false, {
                                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                                lineNumber: 1405,
                                                                                                                                columnNumber: 41
                                                                                                                            }, this),
                                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                                type: "datetime-local",
                                                                                                                                className: "block w-full rounded-md border-slate-200 text-sm",
                                                                                                                                value: segment.departure?.at,
                                                                                                                                onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "departure", e.target.value, "at")
                                                                                                                            }, void 0, false, {
                                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                                lineNumber: 1419,
                                                                                                                                columnNumber: 41
                                                                                                                            }, this)
                                                                                                                        ]
                                                                                                                    }, void 0, true, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1390,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this)
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1386,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                className: "col-span-1 md:col-span-2",
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                                        className: "text-xs font-bold text-slate-500 uppercase",
                                                                                                                        children: "Arrival"
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1438,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this),
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                        className: "grid grid-cols-3 gap-2 mt-1",
                                                                                                                        children: [
                                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                                placeholder: "IATA",
                                                                                                                                className: "block w-full rounded-md border-slate-200 text-sm",
                                                                                                                                value: segment.arrival?.iataCode,
                                                                                                                                onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "arrival", e.target.value, "iataCode")
                                                                                                                            }, void 0, false, {
                                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                                lineNumber: 1442,
                                                                                                                                columnNumber: 41
                                                                                                                            }, this),
                                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                                placeholder: "Terminal",
                                                                                                                                className: "block w-full rounded-md border-slate-200 text-sm",
                                                                                                                                value: segment.arrival?.terminal,
                                                                                                                                onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "arrival", e.target.value, "terminal")
                                                                                                                            }, void 0, false, {
                                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                                lineNumber: 1456,
                                                                                                                                columnNumber: 41
                                                                                                                            }, this),
                                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                                type: "datetime-local",
                                                                                                                                className: "block w-full rounded-md border-slate-200 text-sm",
                                                                                                                                value: segment.arrival?.at,
                                                                                                                                onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "arrival", e.target.value, "at")
                                                                                                                            }, void 0, false, {
                                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                                lineNumber: 1470,
                                                                                                                                columnNumber: 41
                                                                                                                            }, this)
                                                                                                                        ]
                                                                                                                    }, void 0, true, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1441,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this)
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1437,
                                                                                                                columnNumber: 37
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1384,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                                        className: "text-xs font-bold text-slate-500 uppercase",
                                                                                                                        children: "Carrier"
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1490,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this),
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                        placeholder: "Code (e.g. QF)",
                                                                                                                        className: "block w-full mt-1 rounded-md border-slate-200 text-sm",
                                                                                                                        value: segment.carrierCode,
                                                                                                                        onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "carrierCode", e.target.value)
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1493,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this)
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1489,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                                        className: "text-xs font-bold text-slate-500 uppercase",
                                                                                                                        children: "Flight No."
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1508,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this),
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                        placeholder: "Number",
                                                                                                                        className: "block w-full mt-1 rounded-md border-slate-200 text-sm",
                                                                                                                        value: segment.number,
                                                                                                                        onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "number", e.target.value)
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1511,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this)
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1507,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                                        className: "text-xs font-bold text-slate-500 uppercase",
                                                                                                                        children: "Aircraft"
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1526,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this),
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                        placeholder: "Code",
                                                                                                                        className: "block w-full mt-1 rounded-md border-slate-200 text-sm",
                                                                                                                        value: segment.aircraft?.code,
                                                                                                                        onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "aircraft", e.target.value, "code")
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1529,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this)
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1525,
                                                                                                                columnNumber: 37
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                                children: [
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                                        className: "text-xs font-bold text-slate-500 uppercase",
                                                                                                                        children: "Duration"
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1545,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this),
                                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                                        placeholder: "PTxxHxxM",
                                                                                                                        className: "block w-full mt-1 rounded-md border-slate-200 text-sm",
                                                                                                                        value: segment.duration,
                                                                                                                        onChange: (e)=>handleSegmentChange(itinIndex, segIndex, "duration", e.target.value)
                                                                                                                    }, void 0, false, {
                                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                        lineNumber: 1548,
                                                                                                                        columnNumber: 39
                                                                                                                    }, this)
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                                lineNumber: 1544,
                                                                                                                columnNumber: 37
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1488,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, segIndex, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1368,
                                                                                                columnNumber: 33
                                                                                            }, this)),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            type: "button",
                                                                                            onClick: ()=>addSegment(itinIndex),
                                                                                            className: "w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-sm",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "material-symbols-outlined text-lg",
                                                                                                    children: "add"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1570,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                "Add Flight Segment"
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1565,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1366,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, itinIndex, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1354,
                                                                            columnNumber: 27
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1352,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mt-8 pt-6 border-t border-slate-100",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-center mb-6",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-xs font-black text-slate-400 uppercase tracking-[0.2em]",
                                                                                children: "Global Flight Details"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1582,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1581,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-1 md:grid-cols-3 gap-8",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "md:col-span-1",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$AirlineAutocomplete$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                        label: "Primary Airline",
                                                                                        name: "airlines",
                                                                                        value: formData.airlines,
                                                                                        onChange: handleChange,
                                                                                        disabled: isReadOnly,
                                                                                        icon: "airlines"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1588,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1587,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "md:col-span-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                            children: "Class"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1598,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                            className: "block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4",
                                                                                            name: "flightClass",
                                                                                            value: formData.flightClass,
                                                                                            onChange: handleChange,
                                                                                            disabled: isReadOnly,
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                                    children: "Economy"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1608,
                                                                                                    columnNumber: 31
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                                    children: "Premium Economy"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1609,
                                                                                                    columnNumber: 31
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                                    children: "Business"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1610,
                                                                                                    columnNumber: 31
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                                    children: "First Class"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1611,
                                                                                                    columnNumber: 31
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                            lineNumber: 1601,
                                                                                            columnNumber: 29
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1597,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1586,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1580,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mt-6",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "material-symbols-outlined text-blue-500 mt-0.5",
                                                                                children: "info"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1619,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-sm text-blue-800 font-medium",
                                                                                        children: "Itinerary Modification"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1623,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-blue-600 mt-0.5",
                                                                                        children: "Changing origin, destination, or dates may affect pricing. Ensure to re-calculate fares after modifying the itinerary."
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1626,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1622,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 1618,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1617,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1281,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 1272,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-8 py-5 border-b border-slate-100 bg-slate-50/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-lg font-bold text-slate-900 flex items-center tracking-tight",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-primary mr-3",
                                                                        children: "extension"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 1641,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    "Add-ons & Services"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 1640,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1639,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-8",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 md:grid-cols-2 gap-10",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-6",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6",
                                                                                children: "Ancillary Services"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1650,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                className: "flex items-center space-x-4 cursor-pointer group",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                        className: "h-5 w-5 text-primary border-slate-300 rounded focus:ring-primary transition-all cursor-pointer",
                                                                                                        type: "checkbox",
                                                                                                        name: "addon-meals",
                                                                                                        checked: formData.addons.meals,
                                                                                                        onChange: handleChange
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1656,
                                                                                                        columnNumber: 33
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-sm font-bold text-slate-700 group-hover:text-primary transition-colors",
                                                                                                        children: "Meals"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1663,
                                                                                                        columnNumber: 33
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1655,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                                type: "button",
                                                                                                onClick: ()=>setIsMealModalOpen(true),
                                                                                                className: "ml-4 text-xs font-bold text-primary hover:text-blue-700 cursor-pointer flex items-center gap-1.5 transition-colors px-2 py-1 bg-blue-50 rounded-md",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "material-symbols-outlined text-base",
                                                                                                        children: "tune"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                        lineNumber: 1672,
                                                                                                        columnNumber: 33
                                                                                                    }, this),
                                                                                                    "Options"
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1667,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1654,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "relative w-32",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-slate-400 font-bold sm:text-xs",
                                                                                                    children: "$"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1680,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1679,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                className: "block w-full h-10 rounded-lg border-slate-200 pl-7 text-right focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700",
                                                                                                name: "price-meals",
                                                                                                value: formData.prices?.meals || "",
                                                                                                onChange: handleChange,
                                                                                                placeholder: "0.00",
                                                                                                type: "number"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1684,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1678,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1653,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "flex items-center space-x-4 cursor-pointer group",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                className: "h-5 w-5 text-primary border-slate-300 rounded focus:ring-primary transition-all cursor-pointer",
                                                                                                type: "checkbox",
                                                                                                name: "addon-wheelchair",
                                                                                                checked: formData.addons.wheelchair,
                                                                                                onChange: handleChange
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1697,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-sm font-bold text-slate-700 group-hover:text-primary transition-colors",
                                                                                                children: "Wheelchair"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1704,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1696,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "relative w-32",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-slate-400 font-bold sm:text-xs",
                                                                                                    children: "$"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1710,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1709,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                className: "block w-full h-10 rounded-lg border-slate-200 pl-7 text-right focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700",
                                                                                                name: "price-wheelchair",
                                                                                                value: formData.prices?.wheelchair || "",
                                                                                                onChange: handleChange,
                                                                                                placeholder: "0.00",
                                                                                                type: "number"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1714,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1708,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1695,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "pt-6 mt-2 border-t border-slate-100 flex items-center justify-between",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-sm font-bold text-slate-500 uppercase tracking-wider",
                                                                                        children: "Add-ons Subtotal"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1725,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-xl font-black text-primary",
                                                                                        children: [
                                                                                            "$",
                                                                                            calculateAddonsTotal()
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1728,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1724,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 1649,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-8",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-sm font-bold text-slate-700 mb-2 tracking-tight",
                                                                                        htmlFor: "frequent-flyer",
                                                                                        children: "Frequent Flyer Number"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1735,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "relative rounded-lg shadow-sm",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "material-symbols-outlined text-slate-400",
                                                                                                    style: {
                                                                                                        fontSize: "20px"
                                                                                                    },
                                                                                                    children: "loyalty"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                    lineNumber: 1743,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1742,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                className: "block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium",
                                                                                                id: "frequent-flyer",
                                                                                                name: "frequentFlyer",
                                                                                                placeholder: "e.g. AA-12345678",
                                                                                                type: "text",
                                                                                                value: formData.frequentFlyer,
                                                                                                onChange: handleChange,
                                                                                                disabled: isReadOnly
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1750,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1741,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1734,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-sm font-bold text-slate-700 mb-3 tracking-tight",
                                                                                        children: "Seat Selection"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1763,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-primary/30 transition-all cursor-pointer group h-28",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "material-symbols-outlined text-slate-400 group-hover:text-primary mb-2 transition-colors",
                                                                                                style: {
                                                                                                    fontSize: "28px"
                                                                                                },
                                                                                                children: "event_seat"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1767,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-sm font-bold text-slate-600 group-hover:text-primary transition-colors tracking-tight",
                                                                                                children: "Select Premium Seat"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1773,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-xs text-primary mt-1 font-black bg-blue-50 px-2 py-0.5 rounded",
                                                                                                children: "FROM $25.00"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                                lineNumber: 1776,
                                                                                                columnNumber: 31
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1766,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                lineNumber: 1762,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                        lineNumber: 1733,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 1648,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1647,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 1638,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                            lineNumber: 765,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-6 py-4 border-b border-slate-100 bg-slate-50/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-base font-bold text-slate-900 tracking-tight",
                                                                children: "Booking Details"
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 1792,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1791,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-6 space-y-5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2",
                                                                            children: "ID Ref (Read Only)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1798,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            className: "block w-full h-11 rounded-lg border-slate-100 bg-slate-50 text-slate-400 shadow-none cursor-not-allowed sm:text-sm font-mono",
                                                                            readOnly: true,
                                                                            type: "text",
                                                                            value: booking?.id ? `#${booking.id}` : "NEW"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1801,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1797,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "pnr",
                                                                            children: "PNR Reference"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1809,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            className: "block w-full h-11 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 font-mono uppercase sm:text-sm font-bold text-slate-700 pl-4",
                                                                            name: "pnr",
                                                                            type: "text",
                                                                            value: formData.pnr,
                                                                            onChange: handleChange,
                                                                            disabled: isReadOnly
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1815,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1808,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "agency",
                                                                            children: "Issued through"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1825,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium",
                                                                            name: "agency",
                                                                            value: formData.agency,
                                                                            onChange: handleChange,
                                                                            disabled: isReadOnly,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "",
                                                                                    children: agenciesLoading ? "Loading agencies..." : "Select issuing agency"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1838,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                agencies.map((agency)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: agency.agency_name,
                                                                                        children: agency.agency_name
                                                                                    }, agency.uid, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1844,
                                                                                        columnNumber: 29
                                                                                    }, this))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1831,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1824,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "handledBy",
                                                                            children: "Issued By"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1851,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium",
                                                                            name: "handledBy",
                                                                            value: formData.handledBy,
                                                                            onChange: handleChange,
                                                                            disabled: isReadOnly,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "",
                                                                                    children: usersLoading ? "Loading users..." : "Select user"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1864,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                users.map((user)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username || user.email,
                                                                                        children: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username || user.email
                                                                                    }, user.id, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1868,
                                                                                        columnNumber: 29
                                                                                    }, this))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1857,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1850,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "status",
                                                                            children: "Booking Status"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1884,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "block w-full h-11 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700 px-4",
                                                                            name: "status",
                                                                            value: formData.status,
                                                                            onChange: handleChange,
                                                                            disabled: isReadOnly,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    children: "Confirmed"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1897,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    children: "Pending"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1898,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    children: "Cancelled"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1899,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1890,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1883,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1796,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 1790,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-6 py-4 border-b border-slate-100 bg-slate-50/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-base font-bold text-slate-900 tracking-tight",
                                                                children: "Financials Summary"
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                lineNumber: 1908,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1907,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-6 space-y-5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "payment-status",
                                                                            children: "Payment Status"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1914,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "block w-full h-11 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700 px-4",
                                                                            name: "paymentStatus",
                                                                            value: formData.paymentStatus,
                                                                            onChange: handleChange,
                                                                            disabled: isReadOnly,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    children: "Paid"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1927,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    children: "Pending"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1928,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    children: "Refunded"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1929,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1920,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1913,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "cost-price",
                                                                            children: "Cost Price ($)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1933,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "relative rounded-lg shadow-sm",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-slate-400 font-bold",
                                                                                        children: "$"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1941,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1940,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    className: "block w-full h-11 rounded-lg border-slate-200 pl-8 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700",
                                                                                    name: "costPrice",
                                                                                    type: "number",
                                                                                    step: "0.01",
                                                                                    value: formData.costPrice,
                                                                                    onChange: handleChange,
                                                                                    disabled: isReadOnly
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1943,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1939,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1932,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2",
                                                                            htmlFor: "selling-price",
                                                                            children: "Selling Price ($)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1955,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "relative rounded-lg shadow-sm",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-slate-400 font-bold",
                                                                                        children: "$"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                        lineNumber: 1963,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1962,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    className: "block w-full h-11 rounded-lg border-slate-200 pl-8 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-black text-primary",
                                                                                    name: "sellingPrice",
                                                                                    type: "number",
                                                                                    step: "0.01",
                                                                                    value: formData.sellingPrice,
                                                                                    onChange: handleChange,
                                                                                    disabled: isReadOnly
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1965,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1961,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1954,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-slate-50 rounded-xl p-5 mt-4 border border-slate-100",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-center mb-3",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-sm font-bold text-slate-500",
                                                                                    children: "Net Cost"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1979,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-sm font-black text-slate-900",
                                                                                    children: [
                                                                                        "$",
                                                                                        formData.costPrice
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1982,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1978,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-center pt-4 border-t border-slate-200",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-base font-black text-slate-900",
                                                                                    children: "Grand Total"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1987,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xl font-black text-primary tracking-tight",
                                                                                    children: [
                                                                                        "$",
                                                                                        calculateGrandTotal()
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                                    lineNumber: 1990,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                            lineNumber: 1986,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 1977,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 1912,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 1906,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "pt-4 flex flex-col gap-3 sticky bottom-0 bg-gray-50 p-2 -mx-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "w-full flex justify-center items-center h-14 border border-transparent shadow-lg text-base font-black rounded-xl text-white bg-primary hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-blue-500/20 disabled:opacity-50",
                                                            type: "submit",
                                                            disabled: isLoading,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "material-symbols-outlined text-2xl mr-3",
                                                                    children: "save"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                                    lineNumber: 2005,
                                                                    columnNumber: 23
                                                                }, this),
                                                                isLoading ? "SAVING..." : "SAVE CHANGES"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 2000,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "w-full flex justify-center items-center h-14 border-2 border-slate-100 shadow-sm text-base font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all",
                                                            type: "button",
                                                            onClick: onClose,
                                                            children: "CANCEL"
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                            lineNumber: 2010,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 1999,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                            lineNumber: 1788,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                    lineNumber: 763,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                lineNumber: 762,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                            lineNumber: 761,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                        lineNumber: 760,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                lineNumber: 736,
                columnNumber: 7
            }, this),
            isMealModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[60] flex justify-center items-center overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-gray-900/50 backdrop-blur-sm",
                        onClick: ()=>setIsMealModalOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                        lineNumber: 2028,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden ring-1 ring-slate-200 flex flex-col max-h-[90vh] transition-all transform scale-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-black text-slate-900 tracking-tight",
                                                children: "Select Meal Options"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                lineNumber: 2035,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest",
                                                children: "Premium Flight Services"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                lineNumber: 2038,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 2034,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsMealModalOpen(false),
                                        className: "text-slate-400 hover:text-slate-600 transition-all cursor-pointer p-2 rounded-xl hover:bg-slate-100",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined font-bold",
                                            children: "close"
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                            lineNumber: 2046,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 2042,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                lineNumber: 2033,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-8 space-y-6 overflow-y-auto",
                                children: [
                                    {
                                        id: "vml",
                                        name: "Vegetarian Hindu Meal",
                                        desc: "No beef, no pork, prepared with dairy."
                                    },
                                    {
                                        id: "moors",
                                        name: "Muslim Meal",
                                        desc: "No pork, no alcohol, Halal certified."
                                    },
                                    {
                                        id: "ksml",
                                        name: "Kosher Meal",
                                        desc: "Prepared under rabbinic supervision."
                                    },
                                    {
                                        id: "vgml",
                                        name: "Vegan Meal",
                                        desc: "No animal products, no honey or eggs."
                                    },
                                    {
                                        id: "gfml",
                                        name: "Gluten Free Meal",
                                        desc: "Prepared without wheat, barley or rye."
                                    }
                                ].map((meal)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center h-6 mt-1",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    name: "meal-selection",
                                                    type: "radio",
                                                    className: "w-5 h-5 text-primary border-slate-300 focus:ring-primary cursor-pointer"
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                    lineNumber: 2084,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                lineNumber: 2083,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-black text-slate-900 group-hover:text-primary transition-colors",
                                                        children: meal.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                        lineNumber: 2091,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500 font-medium mt-1 leading-relaxed",
                                                        children: meal.desc
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                        lineNumber: 2094,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                                lineNumber: 2090,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, meal.id, true, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 2079,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                lineNumber: 2051,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-8 py-5 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsMealModalOpen(false),
                                        className: "px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all",
                                        children: "CLOSE"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 2102,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsMealModalOpen(false),
                                        className: "px-8 py-2.5 text-sm font-black text-white bg-primary rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all",
                                        children: "CONFIRM SELECTION"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                        lineNumber: 2108,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                                lineNumber: 2101,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                        lineNumber: 2032,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
                lineNumber: 2027,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx",
        lineNumber: 728,
        columnNumber: 5
    }, this);
}
_s(BookingModal, "SB8ijb5ZxJsgyuIfBgufAJ+sxms=");
_c = BookingModal;
var _c;
__turbopack_context__.k.register(_c, "BookingModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/RefundConfirmModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RefundConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function RefundConfirmModal({ isOpen, bookingId, bookingDate, amount, travellers = [], onConfirm, onCancel, isProcessing = false, isAuthenticated = true, onRequireAuth, hideWarning = false }) {
    _s();
    const dialogRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const firstBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [selectedTravellerIds, setSelectedTravellerIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RefundConfirmModal.useEffect": ()=>{
            if (isOpen) {
                // Default to selecting all travellers when modal opens
                const allIds = travellers.map({
                    "RefundConfirmModal.useEffect.allIds": (t, index)=>t.id || `temp-${index}`
                }["RefundConfirmModal.useEffect.allIds"]);
                setSelectedTravellerIds(allIds);
            }
        }
    }["RefundConfirmModal.useEffect"], [
        isOpen,
        travellers
    ]);
    const toggleTraveller = (id)=>{
        setSelectedTravellerIds((prev)=>prev.includes(id) ? prev.filter((tid)=>tid !== id) : [
                ...prev,
                id
            ]);
    };
    const toggleAll = ()=>{
        const allIds = travellers.map((t, index)=>t.id || `temp-${index}`);
        if (selectedTravellerIds.length === allIds.length) {
            setSelectedTravellerIds([]);
        } else {
            setSelectedTravellerIds(allIds);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RefundConfirmModal.useEffect": ()=>{
            if (!isOpen) return;
            const onKey = {
                "RefundConfirmModal.useEffect.onKey": (e)=>{
                    if (e.key === "Escape") {
                        onCancel();
                    }
                    if (e.key === "Tab") {
                        if (!dialogRef.current) return;
                        const focusable = dialogRef.current.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
                        if (focusable.length === 0) return;
                        const first = focusable[0];
                        const last = focusable[focusable.length - 1];
                        if (e.shiftKey && document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        } else if (!e.shiftKey && document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }
                }
            }["RefundConfirmModal.useEffect.onKey"];
            document.addEventListener("keydown", onKey);
            return ({
                "RefundConfirmModal.useEffect": ()=>document.removeEventListener("keydown", onKey)
            })["RefundConfirmModal.useEffect"];
        }
    }["RefundConfirmModal.useEffect"], [
        isOpen,
        onCancel
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RefundConfirmModal.useEffect": ()=>{
            if (isOpen && firstBtnRef.current) {
                firstBtnRef.current.focus();
            }
        }
    }["RefundConfirmModal.useEffect"], [
        isOpen
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "refund-title",
        className: "fixed inset-0 z-50 flex items-center justify-center",
        onClick: (e)=>{
            if (e.target === e.currentTarget) onCancel();
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: dialogRef,
                className: "relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 border-b border-slate-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "refund-title",
                            className: "text-lg font-bold text-slate-900",
                            children: "Confirm Refund Request"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-slate-700",
                                children: [
                                    "Booking ID:",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-mono font-bold text-primary",
                                        children: [
                                            "#",
                                            bookingId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 119,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-slate-700",
                                children: [
                                    "Date: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: bookingDate || "-"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 124,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-slate-700",
                                children: [
                                    "Amount:",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: [
                                            "$",
                                            Number(amount).toFixed(2)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            travellers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 pt-4 border-t border-slate-100",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-sm font-bold text-slate-700",
                                                children: "Select Travellers"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                lineNumber: 134,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: toggleAll,
                                                className: "text-xs text-primary font-bold hover:underline",
                                                children: selectedTravellerIds.length === travellers.length ? "Deselect All" : "Select All"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                lineNumber: 137,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 133,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-h-40 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2",
                                        children: travellers.map((t, index)=>{
                                            const tId = t.id || `temp-${index}`;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: selectedTravellerIds.includes(tId),
                                                        onChange: ()=>toggleTraveller(tId),
                                                        className: "rounded border-slate-300 text-primary focus:ring-primary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                        lineNumber: 155,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-bold text-slate-800",
                                                                children: [
                                                                    t.firstName,
                                                                    " ",
                                                                    t.lastName
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                                lineNumber: 162,
                                                                columnNumber: 25
                                                            }, this),
                                                            t.eticketNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-slate-500 font-mono",
                                                                children: t.eticketNumber
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                                lineNumber: 166,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, tId, true, {
                                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                                lineNumber: 151,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this),
                                    selectedTravellerIds.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-red-500 mt-1",
                                        children: "Please select at least one traveller."
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 176,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            !hideWarning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-600 mt-2",
                                children: "This action cannot be undone. The booking will be marked for refund processing."
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative group",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    ref: firstBtnRef,
                                    onClick: onCancel,
                                    className: "px-4 py-2 rounded-lg bg_white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30",
                                    "aria-label": "Cancel refund",
                                    disabled: isProcessing,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                    lineNumber: 192,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 191,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: lastBtnRef,
                                onClick: ()=>{
                                    if (!isAuthenticated) {
                                        if (onRequireAuth) onRequireAuth();
                                        return;
                                    }
                                    if (travellers.length > 0 && selectedTravellerIds.length === 0) {
                                        return;
                                    }
                                    onConfirm(selectedTravellerIds);
                                },
                                className: "px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                                "aria-label": "Confirm refund",
                                disabled: isProcessing || !isAuthenticated || travellers.length > 0 && selectedTravellerIds.length === 0,
                                children: [
                                    isProcessing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 223,
                                        columnNumber: 15
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Confirm Refund"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                        lineNumber: 225,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this),
                            !isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                role: "tooltip",
                                className: "ml-2 text-xs text-slate-600",
                                children: "Sign in required"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                                lineNumber: 228,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/RefundConfirmModal.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
_s(RefundConfirmModal, "fPBUF3uOQ+E8M7mbwdmjVC7BpIU=");
_c = RefundConfirmModal;
var _c;
__turbopack_context__.k.register(_c, "RefundConfirmModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/SignInPromptModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SignInPromptModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function SignInPromptModal({ isOpen, onClose }) {
    _s();
    const dialogRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const firstBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SignInPromptModal.useEffect": ()=>{
            if (!isOpen) return;
            const onKey = {
                "SignInPromptModal.useEffect.onKey": (e)=>{
                    if (e.key === "Escape") onClose();
                    if (e.key === "Tab") {
                        if (!dialogRef.current) return;
                        const focusable = dialogRef.current.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
                        if (focusable.length === 0) return;
                        const first = focusable[0];
                        const last = focusable[focusable.length - 1];
                        if (e.shiftKey && document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        } else if (!e.shiftKey && document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }
                }
            }["SignInPromptModal.useEffect.onKey"];
            document.addEventListener("keydown", onKey);
            return ({
                "SignInPromptModal.useEffect": ()=>document.removeEventListener("keydown", onKey)
            })["SignInPromptModal.useEffect"];
        }
    }["SignInPromptModal.useEffect"], [
        isOpen,
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SignInPromptModal.useEffect": ()=>{
            if (isOpen && firstBtnRef.current) firstBtnRef.current.focus();
        }
    }["SignInPromptModal.useEffect"], [
        isOpen
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "signin-title",
        className: "fixed inset-0 z-50 flex items-center justify-center",
        onClick: (e)=>{
            if (e.target === e.currentTarget) onClose();
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: dialogRef,
                className: "relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 border-b border-slate-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "signin-title",
                            className: "text-lg font-bold text-slate-900",
                            children: "Sign In Required"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 space-y-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-700",
                            children: "You need to be authenticated to confirm refunds. Please sign in to continue."
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: firstBtnRef,
                                onClick: onClose,
                                className: "px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30",
                                "aria-label": "Cancel",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: lastBtnRef,
                                onClick: ()=>{
                                    router.push("/login");
                                },
                                className: "px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30",
                                "aria-label": "Go to sign in",
                                children: "Sign In"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/SignInPromptModal.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(SignInPromptModal, "c6SZRsy3y3/rZk/Dl4bFBLgOQrQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = SignInPromptModal;
var _c;
__turbopack_context__.k.register(_c, "SignInPromptModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/components/BookingRowMenu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookingRowMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$RefundConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/RefundConfirmModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$SignInPromptModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/SignInPromptModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function BookingRowMenu({ booking, onRefund, onReissue }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeIndex, setActiveIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const wrapperRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isRefundOpen, setIsRefundOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingUid, setPendingUid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSignInPromptOpen, setIsSignInPromptOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAuthorizedUser, setIsAuthorizedUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [localUser, setLocalUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingRowMenu.useEffect": ()=>{
            const checkUserAuthorization = {
                "BookingRowMenu.useEffect.checkUserAuthorization": async ()=>{
                    let emailToCheck = "";
                    let userId = "";
                    // 1. Try localStorage "sky_admin_user"
                    if ("TURBOPACK compile-time truthy", 1) {
                        const storedStr = localStorage.getItem("sky_admin_user");
                        if (storedStr) {
                            try {
                                const parsed = JSON.parse(storedStr);
                                if (parsed.email) {
                                    emailToCheck = parsed.email;
                                    userId = parsed.id;
                                }
                            } catch (e) {
                                console.error("Error parsing sky_admin_user", e);
                            }
                        }
                    }
                    // 2. Fallback to Supabase auth if not found in localStorage
                    if (!emailToCheck) {
                        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
                        if (user && user.email) {
                            emailToCheck = user.email;
                            userId = user.id;
                        }
                    }
                    if (emailToCheck) {
                        // Check if user exists in the 'users' list
                        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("users").select("email").eq("email", emailToCheck).maybeSingle();
                        if (data) {
                            setIsAuthorizedUser(true);
                            setLocalUser({
                                id: userId,
                                email: emailToCheck
                            });
                        }
                    }
                }
            }["BookingRowMenu.useEffect.checkUserAuthorization"];
            checkUserAuthorization();
        }
    }["BookingRowMenu.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingRowMenu.useEffect": ()=>{
            const handleClickOutside = {
                "BookingRowMenu.useEffect.handleClickOutside": (event)=>{
                    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                        setOpen(false);
                        setActiveIndex(-1);
                    }
                }
            }["BookingRowMenu.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "BookingRowMenu.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["BookingRowMenu.useEffect"];
        }
    }["BookingRowMenu.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingRowMenu.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then({
                "BookingRowMenu.useEffect": ({ data })=>{
                    setIsAuthenticated(!!data.session);
                }
            }["BookingRowMenu.useEffect"]);
            const { data: authSub } = __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "BookingRowMenu.useEffect": (_event, session)=>{
                    setIsAuthenticated(!!session);
                }
            }["BookingRowMenu.useEffect"]);
            return ({
                "BookingRowMenu.useEffect": ()=>{
                    authSub.subscription.unsubscribe();
                }
            })["BookingRowMenu.useEffect"];
        }
    }["BookingRowMenu.useEffect"], []);
    const options = [
        {
            label: "Refund",
            icon: "currency_exchange",
            action: async ()=>{
                const { data, error: preError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("manage_booking").select("uid").eq("booking_id", String(booking.id)).limit(1).maybeSingle();
                if (!preError && data && data.uid) {
                    setPendingUid(data.uid);
                } else {
                    setPendingUid(crypto.randomUUID());
                }
                setIsRefundOpen(true);
            }
        },
        {
            label: "Re-issue",
            icon: "sync",
            action: onReissue
        }
    ];
    const handleKeyDown = (e)=>{
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
            setActiveIndex(0);
            return;
        }
        if (open) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev)=>(prev + 1) % options.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev)=>prev <= 0 ? options.length - 1 : prev - 1);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0) {
                    options[activeIndex].action();
                    setOpen(false);
                    setActiveIndex(-1);
                }
            } else if (e.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: wrapperRef,
        className: "relative flex flex-col items-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                "aria-label": "Open actions menu",
                "aria-haspopup": "true",
                "aria-expanded": open,
                onClick: ()=>setOpen((o)=>!o),
                onKeyDown: handleKeyDown,
                tabIndex: 0,
                className: "size-10 min-w-10 min-h-10 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "material-symbols-outlined text-[18px]",
                    children: "more_vert"
                }, void 0, false, {
                    fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                    lineNumber: 174,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "menu",
                "aria-label": `Actions for booking ${booking.id}`,
                className: "absolute z-30 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in duration-300",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    className: "py-2",
                    children: options.map((opt, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                role: "menuitem",
                                tabIndex: 0,
                                "aria-label": opt.label,
                                onClick: ()=>{
                                    opt.action();
                                    setOpen(false);
                                    setActiveIndex(-1);
                                },
                                className: `w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 ${activeIndex === idx ? "bg-slate-50" : ""}`,
                                onMouseEnter: ()=>setActiveIndex(idx),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-105",
                                        children: opt.icon
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                                        lineNumber: 197,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: opt.label
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                                        lineNumber: 200,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                                lineNumber: 185,
                                columnNumber: 17
                            }, this)
                        }, opt.label, false, {
                            fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                            lineNumber: 184,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                    lineNumber: 182,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                lineNumber: 177,
                columnNumber: 9
            }, this),
            isRefundOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$RefundConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isRefundOpen,
                bookingId: booking.id,
                bookingDate: booking.travelDate || `${booking.IssueDay || ""} ${booking.issueMonth || ""} ${booking.issueYear || ""}`,
                amount: Number(booking.sellingPrice || booking.buyingPrice || 0),
                travellers: booking.travellers || [],
                isAuthenticated: isAuthenticated || !!localUser,
                onRequireAuth: ()=>setIsSignInPromptOpen(true),
                hideWarning: isAuthorizedUser,
                onConfirm: async (selectedTravellerIds)=>{
                    console.log("analytics:event", {
                        type: "refund_confirmed",
                        bookingId: booking.id,
                        amount: booking.sellingPrice || booking.buyingPrice || 0,
                        selectedTravellerIds
                    });
                    setIsSubmitting(true);
                    let finalUserId = "";
                    const { data: { session }, error: sessError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                    if (session) {
                        finalUserId = session.user.id;
                    } else if (localUser && localUser.id) {
                        finalUserId = localUser.id;
                    }
                    if (sessError && !finalUserId) {
                        alert("Authentication check failed");
                        setIsSubmitting(false);
                        return;
                    }
                    if (!finalUserId) {
                        alert("Sign in required");
                        setIsSubmitting(false);
                        return;
                    }
                    if (!booking.id) {
                        alert("Invalid booking ID");
                        setIsSubmitting(false);
                        return;
                    }
                    if (!pendingUid) {
                        alert("Unable to generate UID");
                        setIsSubmitting(false);
                        return;
                    }
                    try {
                        // Use API to create manage booking record with type and details
                        const res = await fetch("/api/manage-booking", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                uid: pendingUid,
                                booking: booking,
                                user_id: finalUserId,
                                type: "Refund",
                                selected_travellers: selectedTravellerIds
                            })
                        });
                        if (!res.ok) {
                            const j = await res.json();
                            throw new Error(j.error || "Failed to create manage booking record");
                        }
                    } catch (e) {
                        console.error("Insert exception:", e instanceof Error ? e.message : e);
                        alert("Network or server error while creating manage booking record");
                        setIsSubmitting(false);
                        return;
                    }
                    setIsRefundOpen(false);
                    setIsSubmitting(false);
                    onRefund();
                },
                onCancel: ()=>{
                    console.log("analytics:event", {
                        type: "refund_cancelled",
                        bookingId: booking.id
                    });
                    setIsRefundOpen(false);
                },
                isProcessing: isSubmitting
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                lineNumber: 208,
                columnNumber: 9
            }, this),
            isSignInPromptOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$SignInPromptModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isSignInPromptOpen,
                onClose: ()=>setIsSignInPromptOpen(false)
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
                lineNumber: 307,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/components/BookingRowMenu.tsx",
        lineNumber: 163,
        columnNumber: 5
    }, this);
}
_s(BookingRowMenu, "/haUtnzLYGChrCXs4fPXWgmR1i0=");
_c = BookingRowMenu;
var _c;
__turbopack_context__.k.register(_c, "BookingRowMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skytrips-admin/src/app/dashboard/booking/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$app$2f$dashboard$2f$booking$2f$BookingModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/app/dashboard/booking/BookingModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$BookingRowMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skytrips-admin/src/components/BookingRowMenu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function BookingPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [bookings, setBookings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingBooking, setEditingBooking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [actionLoading, setActionLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(10);
    const [totalCount, setTotalCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [debouncedSearch, setDebouncedSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: "id",
        direction: "desc"
    });
    const [isViewOnly, setIsViewOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingPage.useEffect": ()=>{
            fetchBookings();
        }
    }["BookingPage.useEffect"], [
        currentPage,
        pageSize,
        debouncedSearch,
        sortConfig
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingPage.useEffect": ()=>{
            const timer = setTimeout({
                "BookingPage.useEffect.timer": ()=>{
                    setDebouncedSearch(searchTerm);
                    setCurrentPage(1); // Reset to first page on search
                }
            }["BookingPage.useEffect.timer"], 500);
            return ({
                "BookingPage.useEffect": ()=>clearTimeout(timer)
            })["BookingPage.useEffect"];
        }
    }["BookingPage.useEffect"], [
        searchTerm
    ]);
    const fetchBookings = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            console.log("Fetching bookings with Supabase SDK", {
                from,
                to,
                search: debouncedSearch
            });
            console.log("Supabase URL:", ("TURBOPACK compile-time value", "https://tjrmemmsieltajotxddk.supabase.co"));
            console.log("Has Anon Key:", !!("TURBOPACK compile-time value", "sb_publishable_GxUlFYif0EEYIEYCEkqIGg_Xee1B4qZ"));
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("bookings").select("*", {
                count: "exact"
            });
            // Handle Sorting
            if (sortConfig.key === "travelDate") {
                // travelDate doesn't exist in DB, it's computed from IssueDay, issueMonth, issueYear
                // For now, let's sort by issueYear, then issueMonth (string sort), then IssueDay
                // Note: issueMonth is string (e.g., 'Oct '), so this won't be perfectly chronological
                // without complex logic or a real travelDate column.
                // We'll sort by issueYear first.
                query = query.order("issueYear", {
                    ascending: sortConfig.direction === "asc"
                }).order("issueMonth", {
                    ascending: sortConfig.direction === "asc"
                }).order("IssueDay", {
                    ascending: sortConfig.direction === "asc"
                });
            } else if (sortConfig.key === "sellingPrice") {
                // Fallback to buyingPrice if sellingPrice is null
                query = query.order("sellingPrice", {
                    ascending: sortConfig.direction === "asc",
                    nullsFirst: false
                });
            } else {
                query = query.order(sortConfig.key, {
                    ascending: sortConfig.direction === "asc"
                });
            }
            query = query.range(from, to);
            if (debouncedSearch) {
                const isNumeric = /^\d+$/.test(debouncedSearch);
                // Deprecated fields removed from search filter
                let orFilter = `origin.eq.${debouncedSearch},destination.eq.${debouncedSearch},PNR.eq.${debouncedSearch}`;
                if (isNumeric) {
                    orFilter += `,id.eq.${debouncedSearch}`;
                }
                query = query.or(orFilter);
            }
            const { data, count, error: fetchError } = await query;
            console.log("Query result:", {
                data,
                count,
                error: fetchError
            });
            if (fetchError) {
                console.error("Supabase error details:", {
                    message: fetchError.message,
                    details: fetchError.details,
                    hint: fetchError.hint,
                    code: fetchError.code
                });
                throw fetchError;
            }
            setBookings(data || []);
            setTotalCount(count || 0);
            console.log("Successfully loaded bookings:", data?.length || 0);
        } catch (err) {
            console.error("Fetch error:", err);
            const errorMessage = err.message || "Failed to fetch bookings";
            const errorDetails = err.details ? ` - ${err.details}` : "";
            const errorHint = err.hint ? ` (Hint: ${err.hint})` : "";
            setError(errorMessage + errorDetails + errorHint);
        } finally{
            setLoading(false);
        }
    };
    const totalPages = Math.ceil(totalCount / pageSize);
    const handlePrevPage = ()=>{
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = ()=>{
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handleSort = (key)=>{
        setSortConfig((current)=>({
                key,
                direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
            }));
    };
    const renderSortIcon = (key)=>{
        if (sortConfig.key !== key) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "material-symbols-outlined text-[16px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity",
                children: "unfold_more"
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 150,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "material-symbols-outlined text-[16px] text-primary font-bold",
            children: sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
            lineNumber: 156,
            columnNumber: 7
        }, this);
    };
    const handleCreate = ()=>{
        setEditingBooking(null);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };
    const handleView = (booking)=>{
        // Navigate to booking details page
        router.push(`/dashboard/booking/${booking.id}`);
    };
    const handleEdit = (booking)=>{
        setEditingBooking(booking);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };
    const handleDelete = async (id)=>{
        if (!confirm("Are you sure you want to delete this booking?")) {
            return;
        }
        setActionLoading(id);
        try {
            const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("bookings").delete().eq("id", id);
            if (deleteError) throw deleteError;
            await fetchBookings();
        } catch (err) {
            alert(err.message || "Failed to delete booking");
        } finally{
            setActionLoading(null);
        }
    };
    const handleSave = async (booking)=>{
        setActionLoading(-1);
        try {
            let bookingToSave = {
                ...booking
            };
            // Handle New Customer Creation logic
            if (booking.contactType === "new" && booking.email) {
                console.log("Processing new customer creation for:", booking.email);
                // 1. Check if customer already exists
                const { data: existingCustomer, error: searchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id").eq("email", booking.email).single();
                if (searchError && searchError.code !== "PGRST116") {
                    // PGRST116 is "Row not found" - ignore that, but log others
                    console.error("Error searching for existing customer:", searchError);
                }
                let customerIdToUse = existingCustomer?.id;
                if (!customerIdToUse) {
                    // 2. Create new customer
                    const firstName = booking.travellers?.[0]?.firstName || "Unknown";
                    const lastName = booking.travellers?.[0]?.lastName || "Traveller";
                    const newCustomer = {
                        firstName,
                        lastName,
                        email: booking.email,
                        phone: booking.phone || "",
                        country: booking.nationality || "Nepalese",
                        isActive: "true",
                        isVerified: "false",
                        userType: "Traveler",
                        isDisabled: "false",
                        phoneCountryCode: "+977",
                        dateOfBirth: booking.travellers?.[0]?.dob || booking.dob || "",
                        gender: "N/A",
                        address: {},
                        passport: {
                            number: booking.passportNumber || booking.travellers?.[0]?.passportNumber || "",
                            expiryDate: booking.passportExpiry || booking.travellers?.[0]?.passportExpiry || "",
                            issueCountry: booking.nationality || "Nepalese"
                        }
                    };
                    const { data: createdCustomer, error: createError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("customers").insert([
                        newCustomer
                    ]).select("id").single();
                    if (createError) {
                        console.error("Failed to create new customer:", createError);
                        throw new Error(`Failed to create customer profile: ${createError.message}`);
                    }
                    console.log("New customer created successfully:", createdCustomer.id);
                    customerIdToUse = createdCustomer.id;
                } else {
                    console.log("Customer already exists, linking to ID:", customerIdToUse);
                }
                // Update booking with the customer ID
                bookingToSave.customerid = customerIdToUse;
            // Also update the 'customer' object in the booking to reflect the link immediately in UI if needed
            // bookingToSave.customer = { id: customerIdToUse, ... } as any;
            }
            if (editingBooking?.id) {
                // Update
                const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("bookings").update(bookingToSave).eq("id", editingBooking.id);
                if (updateError) throw updateError;
            } else {
                // Create
                const { error: createError } = await __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("bookings").insert([
                    bookingToSave
                ]);
                if (createError) throw createError;
                // Send confirmation email
                if (booking.email) {
                    try {
                        await fetch("/api/send-email", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                to: booking.email,
                                subject: `Booking Confirmation - PNR: ${booking.PNR}`,
                                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Booking Confirmation</h2>
                    <p>Dear ${booking.travellers?.[0]?.firstName || "Customer"},</p>
                    <p>Your booking has been successfully created.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 5px 0;"><strong>PNR:</strong> ${booking.PNR}</p>
                      <p style="margin: 5px 0;"><strong>Route:</strong> ${booking.origin} ✈ ${booking.destination}</p>
                      <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${booking.travelDate || "N/A"}</p>
                    </div>
                    <p>Thank you for choosing SkyTrips.</p>
                  </div>
                `
                            })
                        });
                    } catch (emailError) {
                        console.error("Failed to send confirmation email", emailError);
                    }
                }
            }
            setIsModalOpen(false);
            await fetchBookings();
        } catch (err) {
            alert(err.message || "Failed to save booking");
            console.error(err);
        } finally{
            setActionLoading(null);
        }
    };
    const getStatusColor = (status)=>{
        switch(status.toLowerCase()){
            case "confirmed":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "pending":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };
    const getStatusDotColor = (status)=>{
        switch(status.toLowerCase()){
            case "confirmed":
                return "bg-emerald-500";
            case "pending":
                return "bg-amber-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-slate-500";
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-96 bg-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 380,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-500",
                        children: "Loading bookings..."
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 381,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 379,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
            lineNumber: 378,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto w-full font-display",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex mb-4 text-sm text-slate-500",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: "Dashboard"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 392,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: "chevron_right"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 394,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 393,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "font-medium text-primary",
                            children: "Bookings"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 398,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                    lineNumber: 391,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 390,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold tracking-tight text-slate-900",
                                children: "Bookings"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 405,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-slate-500",
                                children: "Manage and track all customer flight reservations."
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 408,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 404,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleCreate,
                        className: "flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[20px]",
                                children: "add"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 416,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "New Booking"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 417,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 412,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 403,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex flex-col sm:flex-row gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex-1 min-w-[200px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
                                children: "search"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 424,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                className: "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary",
                                placeholder: "Search by Name, PNR or Route (Origin/Destination)",
                                type: "text",
                                value: searchTerm,
                                onChange: (e)=>setSearchTerm(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 427,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 423,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "w-full sm:w-48 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "All Statuses"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "confirmed",
                                        children: "Confirmed"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 438,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "pending",
                                        children: "Pending"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 439,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "cancelled",
                                        children: "Cancelled"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 440,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 436,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[20px]",
                                        children: "filter_list"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 443,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline",
                                        children: "More Filters"
                                    }, void 0, false, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 446,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 442,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 435,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 422,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 bg-red-50 border border-red-200 rounded-lg p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-red-600 mt-0.5",
                            children: "error"
                        }, void 0, false, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 455,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-red-800 font-semibold mb-1",
                                    children: "Error Loading Bookings"
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 459,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-red-700 text-sm",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 462,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3 flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: fetchBookings,
                                            className: "text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors",
                                            children: "Retry"
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                            lineNumber: 464,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "/dashboard/test-api",
                                            className: "text-sm bg-white text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50 transition-colors",
                                            children: "Run Diagnostics"
                                        }, void 0, false, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                            lineNumber: 470,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 463,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 458,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                    lineNumber: 454,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 453,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[400px]",
                children: [
                    bookings.length === 0 && !error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 p-12 text-center flex flex-col items-center justify-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 text-lg mb-4 font-display",
                                children: "No bookings found"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 486,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleCreate,
                                className: "bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors",
                                children: "Create Your First Booking"
                            }, void 0, false, {
                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                lineNumber: 489,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 485,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-left text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("id"),
                                                "aria-sort": sortConfig.key === "id" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "Booking ID",
                                                        renderSortIcon("id")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 513,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 501,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("travellerLastName"),
                                                "aria-sort": sortConfig.key === "travellerLastName" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "T. last name",
                                                        renderSortIcon("travellerLastName")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 530,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 518,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("travellerFirstName"),
                                                "aria-sort": sortConfig.key === "travellerFirstName" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "T. First Name",
                                                        renderSortIcon("travellerFirstName")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 547,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 535,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("airlines"),
                                                "aria-sort": sortConfig.key === "airlines" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "Airline",
                                                        renderSortIcon("airlines")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 564,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 552,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("sellingPrice"),
                                                "aria-sort": sortConfig.key === "sellingPrice" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "S.P",
                                                        renderSortIcon("sellingPrice")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 581,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 569,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("tripType"),
                                                "aria-sort": sortConfig.key === "tripType" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "Trip Type",
                                                        renderSortIcon("tripType")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 586,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("PNR"),
                                                "aria-sort": sortConfig.key === "PNR" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "PNR",
                                                        renderSortIcon("PNR")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 615,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 603,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("travelDate"),
                                                "aria-sort": sortConfig.key === "travelDate" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "Travel Date",
                                                        renderSortIcon("travelDate")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 632,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 620,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                scope: "col",
                                                className: "px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors",
                                                onClick: ()=>handleSort("origin"),
                                                "aria-sort": sortConfig.key === "origin" ? sortConfig.direction === "asc" ? "ascending" : "descending" : "none",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        "Route",
                                                        renderSortIcon("origin")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 649,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 637,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-6 py-4 text-right",
                                                children: "Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 654,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 500,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 499,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "divide-y divide-slate-100",
                                    children: bookings.map((booking)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "group hover:bg-slate-50/50 transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 font-medium text-slate-900",
                                                    children: booking.id
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 663,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-900 font-medium text-sm",
                                                        children: booking.travellers?.[0]?.lastName || // booking.travellerLastName || // REMOVED
                                                        "N/A"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 667,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 666,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "size-9 rounded-full bg-cover bg-center",
                                                                style: {
                                                                    backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(`${booking.travellers?.[0]?.firstName || // booking.travellerFirstName || // REMOVED
                                                                    ""} ${booking.travellers?.[0]?.lastName || // booking.travellerLastName || // REMOVED
                                                                    ""}`)}&background=random")`
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 675,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-900 font-medium text-sm",
                                                                children: booking.travellers?.[0]?.firstName || "N/A"
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 691,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 674,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 673,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: booking.airlines
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 697,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 696,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-900 font-semibold",
                                                        children: booking.sellingPrice || booking.buyingPrice || "0.00"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 700,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 699,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-600",
                                                        children: booking.tripType
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 705,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 704,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold",
                                                        children: booking.PNR
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 708,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 707,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col gap-1",
                                                        children: booking.travellers && booking.travellers.length > 0 ? booking.travellers.map((t, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-900 font-medium text-sm",
                                                                children: t.eticketNumber || "N/A"
                                                            }, idx, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 716,
                                                                columnNumber: 29
                                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {}, void 0, false)
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 713,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 712,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-900 font-medium",
                                                                children: booking.departureDate || booking.travelDate || `${booking.IssueDay || ""} ${booking.issueMonth || ""} ${booking.issueYear || ""}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 730,
                                                                columnNumber: 25
                                                            }, this),
                                                            booking.returnDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-slate-500",
                                                                children: [
                                                                    "to ",
                                                                    booking.returnDate
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 738,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 729,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 728,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-sm font-medium text-slate-900",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-600 font-bold",
                                                                children: booking.origin
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 746,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-xs text-slate-400",
                                                                children: "arrow_forward"
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 749,
                                                                columnNumber: 25
                                                            }, this),
                                                            booking.transit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-slate-600 font-bold",
                                                                        children: booking.transit
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                        lineNumber: 754,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "material-symbols-outlined text-xs text-slate-400",
                                                                        children: "arrow_forward"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                        lineNumber: 757,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-600 font-bold",
                                                                children: booking.destination
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 762,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 745,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 744,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 text-right align-top",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "inline-flex flex-col items-end gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-end gap-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleView(booking),
                                                                        className: "rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30",
                                                                        "aria-label": "View booking",
                                                                        tabIndex: 0,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "material-symbols-outlined text-[18px] transition-transform duration-200 hover:scale-105",
                                                                            children: "visibility"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                            lineNumber: 776,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                        lineNumber: 770,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>router.push(`/dashboard/booking/edit/${booking.id}`),
                                                                        className: "rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30",
                                                                        "aria-label": "Edit booking",
                                                                        tabIndex: 0,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "material-symbols-outlined text-[18px] transition-transform duration-200 hover:scale-105",
                                                                            children: "edit"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                            lineNumber: 790,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                        lineNumber: 780,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 769,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$components$2f$BookingRowMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                booking: booking,
                                                                onRefund: ()=>router.push(`/dashboard/manage-booking`),
                                                                onReissue: ()=>router.push(`/dashboard/booking/`)
                                                            }, void 0, false, {
                                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                                lineNumber: 795,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 768,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, booking.id, true, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                            lineNumber: 659,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 657,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 498,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 497,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-white",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-slate-500 font-display",
                                            children: [
                                                "Showing",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-slate-900",
                                                    children: totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 817,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                "to",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-slate-900",
                                                    children: Math.min(currentPage * pageSize, totalCount)
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 821,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                "of",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium text-slate-900",
                                                    children: totalCount
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 825,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                "results"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                            lineNumber: 815,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "hidden sm:flex items-center gap-2 ml-4 border-l border-slate-100 pl-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-slate-500",
                                                    children: "Rows per page:"
                                                }, void 0, false, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 829,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: pageSize,
                                                    onChange: (e)=>{
                                                        setPageSize(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    },
                                                    className: "bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: 10,
                                                            children: "10"
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                            lineNumber: 838,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: 20,
                                                            children: "20"
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                            lineNumber: 839,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: 50,
                                                            children: "50"
                                                        }, void 0, false, {
                                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                            lineNumber: 840,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                    lineNumber: 830,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                            lineNumber: 828,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 814,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                        "aria-label": "Pagination",
                                        className: "isolate inline-flex -space-x-px rounded-md shadow-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handlePrevPage,
                                                disabled: currentPage === 1 || loading,
                                                className: "relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-100 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "sr-only",
                                                        children: "Previous"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 855,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[20px]",
                                                        children: "chevron_left"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 856,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 850,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-100",
                                                children: [
                                                    "Page",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mx-1 font-bold text-primary",
                                                        children: currentPage
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 863,
                                                        columnNumber: 19
                                                    }, this),
                                                    " ",
                                                    "of ",
                                                    totalPages || 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 861,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleNextPage,
                                                disabled: currentPage === totalPages || totalPages === 0 || loading,
                                                className: "relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-100 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "sr-only",
                                                        children: "Next"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 876,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[20px]",
                                                        children: "chevron_right"
                                                    }, void 0, false, {
                                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                        lineNumber: 877,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                                lineNumber: 869,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                        lineNumber: 846,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                                    lineNumber: 845,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                            lineNumber: 813,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                        lineNumber: 812,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 483,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$src$2f$app$2f$dashboard$2f$booking$2f$BookingModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isModalOpen,
                onClose: ()=>setIsModalOpen(false),
                onSave: handleSave,
                onEdit: ()=>setIsViewOnly(false),
                booking: editingBooking,
                isLoading: actionLoading === -1,
                isReadOnly: isViewOnly
            }, void 0, false, {
                fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
                lineNumber: 887,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skytrips-admin/src/app/dashboard/booking/page.tsx",
        lineNumber: 388,
        columnNumber: 5
    }, this);
}
_s(BookingPage, "EcW0bgKxF0BhAk92Xw378rqy/mY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$skytrips$2d$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = BookingPage;
var _c;
__turbopack_context__.k.register(_c, "BookingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=skytrips-admin_src_06ad841b._.js.map