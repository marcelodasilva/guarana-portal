"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  OptionsGroupReceipt,
  OptionsSingle,
  ReceiptShape,
} from "@/types/receipt";

interface OrderFormProps {
  receipts: ReceiptShape[];
}

interface CartItem {
  id: string;
  drink: ReceiptShape;
  customizations: Record<string, string[]>;
  quantity: number;
}

type CondoType = "Estilo Golf" | "Park Golf";

type Toast = { message: string; type: "success" | "error" } | null;

const STORAGE_PREFIX = "@guaranadasasa/";

/* ------------------------------------------------------------------ */
/* Icons (inline, zero-dependency)                                    */
/* ------------------------------------------------------------------ */

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 4.99-8 10-8 10s-8-5.01-8-10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2 2h3l1.68 8.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L22 6H5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12l6 6L20 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1.1 21.2l.4-11.2 10-10 11.5 11.4-8.1 8.1h.1l-3.9 1.7z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(val: number): string {
  return val.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* ------------------------------------------------------------------ */
/* Progress Steps                                                     */
/* ------------------------------------------------------------------ */

function ProgressSteps({
  steps,
  active,
}: {
  steps: string[];
  active: number;
}) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center" style={{ flex: 1 }}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                i < active
                  ? "bg-primary text-primary-foreground"
                  : i === active
                    ? "bg-primary/20 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < active ? <CheckIcon /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                i <= active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-1 rounded-full transition-all min-w-[8px] mt-[-8px]",
                i < active ? "bg-primary" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Form                                                          */
/* ------------------------------------------------------------------ */

export default function OrderForm({ receipts }: OrderFormProps) {
  const [condo, setCondo] = useState<CondoType | null>(null);
  const [block, setBlock] = useState("");
  const [apartment, setApartment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customizingIndex, setCustomizingIndex] = useState<{
    drinkIndex: number;
  } | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [ready, setReady] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedCondo = localStorage.getItem(`${STORAGE_PREFIX}condo`);
      const savedBlock = localStorage.getItem(`${STORAGE_PREFIX}block`) ?? "";
      const savedApartment =
        localStorage.getItem(`${STORAGE_PREFIX}apartment`) ?? "";
      const savedName =
        localStorage.getItem(`${STORAGE_PREFIX}customerName`) ?? "";
      const savedPhone =
        localStorage.getItem(`${STORAGE_PREFIX}customerPhone`) ?? "";

      let loaded = false;
      if (savedCondo) {
        setCondo(savedCondo as CondoType);
        loaded = true;
      }
      if (savedBlock) {
        setBlock(savedBlock);
        loaded = true;
      }
      if (savedApartment) {
        setApartment(savedApartment);
        loaded = true;
      }
      if (savedName) {
        setCustomerName(savedName);
        loaded = true;
      }
      if (savedPhone) {
        setCustomerPhone(savedPhone);
        loaded = true;
      }

      if (loaded) {
        setToast({ message: "Dados recuperados!", type: "success" });
        setTimeout(() => setToast(null), 2500);
      }
    } catch (_e) {
      console.warn("Failed to load from localStorage", _e);
    }
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}condo`, condo ?? "");
    } catch {}
  }, [condo]);
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}block`, block);
    } catch {}
  }, [block]);
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}apartment`, apartment);
    } catch {}
  }, [apartment]);
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}customerName`, customerName);
    } catch {}
  }, [customerName]);
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}customerPhone`, customerPhone);
    } catch {}
  }, [customerPhone]);

  const addToCart = useCallback(
    (drinkIndex: number, customizations: Record<string, string[]>) => {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        drink: receipts[drinkIndex],
        customizations,
        quantity: 1,
      };
      setCart((prev) => [...prev, newItem]);
      setCustomizingIndex(null);
      setToast({
        message: `${receipts[drinkIndex].name} adicionado!`,
        type: "success",
      });
      setTimeout(() => setToast(null), 2500);
    },
    [receipts],
  );

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setToast({ message: "Item removido", type: "success" });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const calculateExtraValue = (item: CartItem): number => {
    let extra = 0;
    for (const ingredient of item.drink.ingredients) {
      if ("options" in ingredient) {
        const group = ingredient as OptionsGroupReceipt;
        const selectedNames = item.customizations[group.name] || [];
        for (const selectedName of selectedNames) {
          const opt = group.options.find((o) => o.name === selectedName);
          if (opt?.value) extra += Number(opt.value);
        }
      }
    }
    return extra * item.quantity;
  };

  const totalValue = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.drink.value) * item.quantity +
      calculateExtraValue(item),
    0,
  );

  const generateMessage = (): string => {
    if (!condo || cart.length === 0) return "";

    const lines: string[] = [
      "🏃‍♂️ *PEDIDO - GUARANÁ DA SASÁ* 🏃‍♂️",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `📍 *Local:* _${condo}_`,
      `🏢 *Bloco:* _${block}_`,
      `🏠 *Apartamento:* _${apartment}_`,
      `👤 *Cliente:* ${customerName}`,
      `📱 *WhatsApp:* ${customerPhone}`,
      "",
    ];

    cart.forEach((item, i) => {
      const total =
        Number(item.drink.value) * item.quantity + calculateExtraValue(item);
      const sizeLabel = item.drink.size ? `${item.drink.size}ml` : "";
      lines.push(
        `🍹 *Pedido ${i + 1}:* ${item.drink.name} (${sizeLabel}) x${item.quantity}`,
      );
      lines.push(
        `   💰 *Valor unitário:* ${formatCurrency(Number(item.drink.value))}`,
      );
      lines.push(`   💰 *Total do item:* ${formatCurrency(total)}`);

      const ingredientNames: string[] = [];
      for (const ingredient of item.drink.ingredients) {
        if ("options" in ingredient) {
          const group = ingredient as OptionsGroupReceipt;
          const selectedArray = item.customizations[group.name] || [];
          if (selectedArray.length > 0) {
            ingredientNames.push(...selectedArray);
          }
        } else {
          ingredientNames.push((ingredient as OptionsSingle).name);
        }
      }
      if (ingredientNames.length > 0) {
        lines.push(`   🥤 *Ingredientes:* ${ingredientNames.join(", ")}`);
      }
      lines.push("");
    });

    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push(`💰 *TOTAL DO PEDIDO:* ${formatCurrency(totalValue)}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("_Obrigado por pedir! Em breve entraremos em contato._ ✨");

    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = generateMessage();
    if (!message) return;

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+5593991586639";
    if (!phone) {
      setToast({ message: "WhatsApp não configurado", type: "error" });
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isValid =
    condo && block && apartment && customerName && customerPhone && cart.length > 0;

  // Progress steps
  const steps = ["Local", "Nome", "Drinks", "Pedido"];
  const activeStep = useMemo(() => {
    if (!condo) return 0;
    if (customerName && customerPhone) return cart.length > 0 ? 3 : 1;
    return 1;
  }, [condo, customerName, customerPhone, cart.length]);

  return (
    <>
      {/* Animated background blobs */}
      <div className="blob-primary w-96 h-96 bg-primary top-0 -left-20" />
      <div className="blob-secondary w-80 h-80 bg-accent bottom-0 right-0" />
      <div className="noise-overlay" />

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "toast-box",
            toast.type === "success"
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground",
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <main
        className={cn(
          "relative z-10 mx-auto max-w-xl px-4 pb-32 pt-6 opacity-0 transition-all duration-500 ease-out",
          ready && "opacity-100",
        )}
        style={{ transitionDelay: "50ms" }}
      >
        {/* ── Hero Header ─────────────────────────────── */}
        <header className="mb-6 text-center">
          <h1
            className={cn(
              "animate-fade-up opacity-0 font-display text-4xl font-black tracking-tight text-primary",
              ready && "opacity-100",
            )}
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="inline-block animate-float">🍋</span>{" "}
            Guaraná da Sasá
          </h1>
          <p
            className={cn(
              "animate-fade-up opacity-0 mt-1 text-sm font-medium text-muted-foreground",
              ready && "opacity-100 stagger-2",
            )}
          >
            Delícias de guaraná direto no seu apartamento
          </p>
        </header>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* ── Location ────────────────────────────── */}
          <section className="section-card animate-fade-up opacity-0 p-5 space-y-4 stagger-1">
            <div className="flex items-center gap-2">
              <span className="text-primary">
                <MapPinIcon />
              </span>
              <h2 className="section-title inline-block mb-0">Condomínio</h2>
            </div>

            <div className="flex gap-2.5">
              {(["Estilo Golf", "Park Golf"] as CondoType[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-selected={condo === c}
                  onClick={() => setCondo(c)}
                  className="condo-btn"
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="block-input" className="label-hint block">
                  Bloco
                </label>
                <input
                  id="block-input"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]{1,2}"
                  max={99}
                  value={block}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setBlock(val);
                  }}
                  className="input-field"
                  placeholder="03"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="apartment-input" className="label-hint block">
                  Apartamento
                </label>
                <input
                  id="apartment-input"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]{1,3}"
                  max={999}
                  value={apartment}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setApartment(val);
                  }}
                  className="input-field"
                  placeholder="102"
                  required
                />
              </div>
            </div>
          </section>

          {/* ── Customer ────────────────────────────── */}
          <section className="section-card animate-fade-up opacity-0 p-5 space-y-4 stagger-2">
            <div className="flex items-center gap-2">
              <span className="text-primary">
                <UserIcon />
              </span>
              <h2 className="section-title inline-block mb-0">
                Seus dados
              </h2>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="customer-name" className="label-hint block">
                  Nome
                </label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  placeholder="João Silva"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="customer-phone" className="label-hint block">
                  WhatsApp
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                    let formatted = "";
                    if (digits.length === 0) formatted = "";
                    else if (digits.length <= 2) formatted = `(${digits}`;
                    else if (digits.length <= 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                    else formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
                    setCustomerPhone(formatted);
                  }}
                  className="input-field"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>
          </section>

          {/* ── Menu ──────────────────────────────────── */}
          <section className="section-card animate-fade-up opacity-0 p-5 space-y-4 stagger-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-primary">
                  <MenuIcon />
                </span>
                <h2 className="section-title inline-block mb-0">
                  Cardápio
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {receipts.map((drink, idx) => (
                <div key={`${drink.name}-${drink.size}`} className="menu-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-display text-lg font-bold tracking-tight">
                        {drink.name}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {drink.size}ml
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-extrabold text-primary">
                        {formatCurrency(Number(drink.value))}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomizingIndex({ drinkIndex: idx })
                    }
                    className={cn(
                      "mt-3 w-full flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-semibold",
                      "bg-primary/10 text-primary hover:bg-primary/18 transition-all",
                    )}
                  >
                    <PlusIcon />
                    Adicionar ao pedido
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Cart ──────────────────────────────────── */}
          {cart.length > 0 && (
            <section className="section-card animate-fade-up opacity-0 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-primary">
                  <CartIcon />
                </span>
                <h2 className="section-title inline-block mb-0">
                  Seu Pedido
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    ({cart.length} {cart.length === 1 ? "item" : "itens"})
                  </span>
                </h2>
              </div>

              <div className="space-y-2.5">
                {cart.map((item) => {
                  const itemTotal =
                    Number(item.drink.value) * item.quantity +
                    calculateExtraValue(item);
                  const selectedNames: string[] = [];
                  for (const ing of item.drink.ingredients) {
                    if ("options" in ing) {
                      const group = ing as OptionsGroupReceipt;
                      selectedNames.push(
                        ...(item.customizations[group.name] || []),
                      );
                    } else {
                      selectedNames.push((ing as OptionsSingle).name);
                    }
                  }
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-sm">
                            {item.drink.name}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.drink.size}ml)
                            </span>
                          </p>
                          {selectedNames.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedNames.map((name) => (
                                <span
                                  key={name}
                                  className="inline-flex px-1.5 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <p className="font-bold text-primary text-base">
                            {formatCurrency(itemTotal)}
                          </p>
                          <div className="flex items-center gap-0">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon />
                            </button>
                            <span className="px-3 text-sm font-semibold tabular-nums min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <PlusIcon />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive transition-colors"
                          >
                            <TrashIcon /> Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Total
                </span>
                <span
                  className="font-display font-extrabold text-2xl text-primary"
                >
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </section>
          )}

          {/* Empty cart placeholder */}
          {cart.length === 0 && ready && (
            <div className="text-center py-10 section-card animate-fade-up stagger-4 opacity-0" style={{ border: "1px dashed var(--border)", background: "none", boxShadow: "none" }}>
              <p className="text-sm font-medium text-muted-foreground">
                Escolha um drink no cardápio para começar
              </p>
            </div>
          )}

          {/* ── Submit (inline, visible on mobile) ──── */}
          {cart.length > 0 && (
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={!isValid}
                className={cn(
                  "cta-button",
                  !isValid && "opacity-50 cursor-not-allowed pointer-events-none",
                )}
              >
                <SendIcon />
                Enviar pedido via WhatsApp
              </button>
            </div>
          )}
        </form>

        {/* ── Floating cart total ─────────────────────── */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
            <div className="submit-bar rounded-full px-5 py-3 flex items-center gap-4 shadow-xl border">
              <span className="text-sm font-semibold text-muted-foreground">
                Total:
              </span>
              <span className="font-display font-extrabold text-xl text-primary">
                {formatCurrency(totalValue)}
              </span>
              <button
                type="submit"
                disabled={!isValid}
                onClick={(e: React.MouseEvent) => {
                  if (isValid) handleSubmit(e as unknown as React.FormEvent);
                }}
                className={cn(
                  "cta-button py-2.5 px-5 text-sm rounded-full",
                  !isValid && "opacity-50 cursor-not-allowed pointer-events-none",
                )}
              >
                <SendIcon />
                Enviar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Customization Modal ───────────────────────── */}
      {customizingIndex && (
        <DrinkCustomizer
          drink={receipts[customizingIndex.drinkIndex]}
          onConfirm={(customizations) =>
            addToCart(customizingIndex.drinkIndex, customizations)
          }
          onCancel={() => setCustomizingIndex(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Drink Customizer Modal                                             */
/* ------------------------------------------------------------------ */

interface DrinkCustomizerProps {
  drink: ReceiptShape;
  onConfirm: (customizations: Record<string, string[]>) => void;
  onCancel: () => void;
}

function DrinkCustomizer({
  drink,
  onConfirm,
  onCancel,
}: DrinkCustomizerProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>(
    () => {
      const init: Record<string, string[]> = {};
      for (const ing of drink.ingredients) {
        if ("options" in ing) {
          const group = ing as OptionsGroupReceipt;
          const defaultOpt = group.options.find((o) => o.default);
          if (defaultOpt) init[group.name] = [defaultOpt.name];
          else if (group.options.length > 0) init[group.name] = [];
        }
      }
      return init;
    },
  );

  // Group info map
  const groupInfo = useMemo(() => {
    const map = new Map<
      string,
      { group: OptionsGroupReceipt; isExclusive: boolean }
    >();
    for (const ing of drink.ingredients) {
      if ("options" in ing) {
        const group = ing as OptionsGroupReceipt;
        const isEx = group.options.every((opt) => opt.value === undefined);
        map.set(group.name, { group, isExclusive: isEx });
      }
    }
    return map;
  }, [drink.ingredients]);

  const handleToggle = (groupName: string, optionName: string) => {
    const info = groupInfo.get(groupName);
    if (!info) return;
    const { isExclusive } = info;
    setSelections((prev) => {
      const current = prev[groupName] || [];
      if (isExclusive) {
        return { ...prev, [groupName]: [optionName] };
      }
      const exists = current.includes(optionName);
      return {
        ...prev,
        [groupName]: exists
          ? current.filter((n) => n !== optionName)
          : [...current, optionName],
      };
    });
  };

  const extra = drink.ingredients.reduce((sum, ing) => {
    if ("options" in ing) {
      const group = ing as OptionsGroupReceipt;
      for (const selectedName of selections[group.name] || []) {
        const opt = group.options.find((o) => o.name === selectedName);
        if (opt?.value) sum += Number(opt.value);
      }
    }
    return sum;
  }, 0);

  const total = Number(drink.value) + extra;

  // Separar ingredients por tipo para renderização
  const optionGroups = drink.ingredients.filter(
    (ing) => "options" in ing,
  ) as OptionsGroupReceipt[];

  const staticIngredients = drink.ingredients.filter(
    (ing) => !("options" in ing),
  ) as OptionsSingle[];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              {drink.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {drink.size}ml — {formatCurrency(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors hover:bg-muted"
            aria-label="Fechar"
          >
            <XIcon />
          </button>
        </div>

        {/* Static ingredients */}
        {staticIngredients.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Base
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {staticIngredients.map((ing) => (
                <span
                  key={ing.name}
                  className="inline-flex px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium"
                >
                  {ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Option groups */}
        {optionGroups.map((group) => {
          const info = groupInfo.get(group.name);
          const isExclusive = info?.isExclusive ?? false;
          return (
            <div key={group.name} className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                {group.name}
              </h3>
              <div className="flex flex-col gap-2">
                {group.options.map((opt) => {
                  const selected = (selections[group.name] || []).includes(opt.name);
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => handleToggle(group.name, opt.name)}
                      className={cn(
                        "opt-chip",
                        selected && "active",
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                          !isExclusive && selected && "rounded-sm",
                        )}
                      >
                        {selected && isExclusive && (
                          <span className="size-1.5 bg-primary-foreground rounded-full" />
                        )}
                        {selected && !isExclusive && (
                          <span className="text-[10px]">✓</span>
                        )}
                      </span>
                      <span className="font-medium text-sm flex-1 text-left">
                        {opt.name}
                      </span>
                      {opt.value !== undefined && (
                        <span
                          className={cn(
                            "text-xs font-medium",
                            selected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          +{formatCurrency(Number(opt.value))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex gap-2.5 mt-6 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm",
              "border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
            )}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selections)}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm",
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-all",
              "shadow-md shadow-primary/20",
            )}
          >
            Adicionar — {formatCurrency(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
