const SDK_URL =
  "https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1";

export function loadSdk() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).LiteAPIPayment) return resolve();
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Payment form failed to load"));
    document.head.appendChild(s);
  });
}

export function styleSdkPayButton(root: HTMLElement) {
  const apply = () => {
    root
      .querySelectorAll<HTMLElement>('button, [role="button"]')
      .forEach((el) => {
        if (el.textContent?.trim().toLowerCase() !== "pay") return;
        el.style.cssText =
          "display:block;width:100%;margin-top:16px;padding:12px;border-radius:4px;" +
          "background:var(--color-primary-500,#07689f);color:#fff;font-weight:600;font-size:16px;" +
          "text-align:center;cursor:pointer;border:0;";
      });
  };
  apply();
  new MutationObserver(apply).observe(root, { childList: true, subtree: true });
}
