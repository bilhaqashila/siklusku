"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Context-driven Tabs that support both controlled (value/onValueChange)
 * and uncontrolled (defaultValue) usage.
 * Works with: <Tabs value|defaultValue> <TabsList> <TabsTrigger value> <TabsContent value>
 */

const TabsCtx = createContext(null);

function Tabs({ value, defaultValue = "dashboard", onValueChange, children, className }) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const active = controlled ? value : inner;

  const setActive = (v) => {
    if (!controlled) setInner(v);
    onValueChange?.(v);
  };

  // if defaultValue changes (rare), resync when uncontrolled
  useEffect(() => {
    if (!controlled) setInner(defaultValue);
  }, [defaultValue, controlled]);

  const ctx = useMemo(() => ({ value: active, setValue: setActive }), [active]);

  return (
    <TabsCtx.Provider value={ctx}>
      <div data-slot="tabs" className={`flex w-full flex-col gap-4 ${className || ""}`}>
        {children}
      </div>
    </TabsCtx.Provider>
  );
}
export default Tabs;
export { Tabs };

export function TabsList({ children, className, ...props }) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`mx-auto mb-6 flex max-w-md items-center justify-center rounded-full bg-pink-50 p-1 dark:bg-slate-800 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, ...props }) {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("TabsTrigger must be used inside <Tabs>.");
  const isActive = ctx.value === value;

  return (
    <button
      role="tab"
      type="button"
      value={value}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-white text-pink-600 shadow-sm"
          : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      } ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className, ...props }) {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("TabsContent must be used inside <Tabs>.");

  const hidden = ctx.value !== value;
  return (
    <div
      role="tabpanel"
      aria-hidden={hidden}
      style={{ display: hidden ? "none" : "block" }}
      className={`w-full ${className || ""}`}
      {...props}
    >
      {!hidden ? children : null}
    </div>
  );
}
