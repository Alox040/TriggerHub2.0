import { useEffect, useState } from "react";

export const navigateTo = (path: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const replaceTo = (path: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const readNextPath = (): string => {
  if (typeof window === "undefined") {
    return "/";
  }

  const url = new URL(window.location.href);
  const next = url.searchParams.get("next");
  return next ?? "/";
};

export const usePathname = (): string => {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handler);
    window.addEventListener("pushstate", handler as EventListener);
    window.addEventListener("replacestate", handler as EventListener);

    return () => {
      window.removeEventListener("popstate", handler);
      window.removeEventListener("pushstate", handler as EventListener);
      window.removeEventListener("replacestate", handler as EventListener);
    };
  }, []);

  return pathname;
};

