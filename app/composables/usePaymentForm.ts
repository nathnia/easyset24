export const required = (message: string) => (v: string) =>
  v.trim() ? "" : message;

export const validEmail = (v: string) =>
  !v.trim()
    ? "Email is required"
    : /^\S+@\S+\.\S+$/.test(v)
      ? ""
      : "Enter a valid email";

export const validPhone = (v: string) =>
  /^\d{7,15}$/.test(v.replace(/[\s-]/g, ""))
    ? ""
    : "Enter a valid phone number";

interface Options<K extends string> {
  initial: Record<K, string>;
  rules: Partial<Record<K, (v: string) => string>>;
  cardKey?: K;
  expKey?: K;
  cvcKey?: K;
}

export const usePaymentForm = <K extends string>(options: Options<K>) => {
  const { rules } = options;
  const cardKey = (options.cardKey ?? "card") as K;
  const expKey = (options.expKey ?? "exp") as K;
  const cvcKey = (options.cvcKey ?? "cvc") as K;

  const form = reactive({ ...options.initial }) as Record<K, string>;
  const errors = reactive({}) as Partial<Record<K, string>>;

  function validateField(key: K) {
    errors[key] = rules[key]?.(form[key]) ?? "";
    return !errors[key];
  }

  function validateAll() {
    const results = (Object.keys(rules) as K[]).map(validateField);
    return results.every(Boolean);
  }

  function onInput(key: K) {
    if (errors[key]) validateField(key);
  }

  function formatCard() {
    form[cardKey] = form[cardKey]
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();
    onInput(cardKey);
  }
  function formatExp() {
    const d = form[expKey].replace(/\D/g, "").slice(0, 4);
    form[expKey] = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    onInput(expKey);
  }
  function formatCvc() {
    form[cvcKey] = form[cvcKey].replace(/\D/g, "").slice(0, 4);
    onInput(cvcKey);
  }

  async function scrollToFirstError() {
    await nextTick();
    document
      .querySelector("[data-error]")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return {
    form,
    errors,
    validateField,
    validateAll,
    onInput,
    formatCard,
    formatExp,
    formatCvc,
    scrollToFirstError,
  };
};
