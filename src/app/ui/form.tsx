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

function calculateExtraValue(item: CartItem): number {
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
  const [cartOpen, setCartOpen] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
        setCondo((localStorage.getItem(`${STORAGE_PREFIX}condo`) ?? 'Estilo Golf') as CondoType);
        setBlock(localStorage.getItem(`${STORAGE_PREFIX}block`) ?? "");
        setApartment(localStorage.getItem(`${STORAGE_PREFIX}apartment`) ?? "");
        setCustomerName(localStorage.getItem(`${STORAGE_PREFIX}customerName`) ?? "");
        setCustomerPhone(localStorage.getItem(`${STORAGE_PREFIX}customerPhone`) ?? "");
      
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
      "*GUARANÁ DA SASÁ*",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      `*Local:* ${condo}`,
      `*Endereço:* Bloco ${block}, Apto ${apartment}`,
      `*Cliente:* ${customerName}`,
      `*WhatsApp:* ${customerPhone}`,
      "",
    ];

    cart.forEach((item) => {
      const total =
        Number(item.drink.value) * item.quantity + calculateExtraValue(item);
      const sizeLabel = item.drink.size ? `${item.drink.size}ml` : "";
      lines.push(`*${item.drink.name}* (${sizeLabel}) x${item.quantity}`);

      // Build a map of group name to options for lookup
      const groupMap = new Map<string, OptionsGroupReceipt>();
      for (const ing of item.drink.ingredients) {
        if ("options" in ing) {
          groupMap.set(ing.name, ing as OptionsGroupReceipt);
        }
      }

      // Build structured ingredients
      const staticIngredients: string[] = [];
      const groups: { name: string; options: string[] }[] = [];

      for (const ing of item.drink.ingredients) {
        if ("options" in ing) {
          const group = ing as OptionsGroupReceipt;
          const selected = item.customizations[group.name] || [];
          if (selected.length > 0) {
            groups.push({ name: group.name, options: selected });
          }
        } else {
          staticIngredients.push((ing as OptionsSingle).name);
        }
      }

      // Static ingredients list
      for (const name of staticIngredients) {
        lines.push(`• ${name}`);
      }

      // Grouped options with names
      for (const grp of groups) {
        lines.push(`• *${grp.name}:*`);
        for (const opt of grp.options) {
          const groupObj = groupMap.get(grp.name);
          const optObj = groupObj?.options.find(o => o.name === opt);
          const extra = optObj?.value ? ` (+${formatCurrency(Number(optObj.value))})` : "";
          lines.push(`    - ${opt}${extra}`);
        }
      }

      lines.push(`*Total:* ${formatCurrency(total)}`);
      lines.push("");
    });

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push(`*TOTAL:* ${formatCurrency(totalValue)}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━");

    return lines.join("\n");
  };

  const handleSubmit = () => {
    const message = generateMessage();
    if (!message) return;

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+5593991586639";
    if (!phone) {
      setToast({ message: "WhatsApp não configurado", type: "error" });
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setCartOpen(false);
  };

  const isValid =
    condo && block && apartment && customerName && customerPhone && cart.length > 0;

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

        <div className="mt-6 space-y-5">
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
            <div className="flex items-center gap-2">
              <span className="text-primary">
                <MenuIcon />
              </span>
              <h2 className="section-title inline-block mb-0">
                Cardápio
              </h2>
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

        </div>

      </main>

      {/* ── Floating Cart Button ───────────────────────── */}
      {cart.length > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full shadow-xl border-2 border-background bg-primary text-primary-foreground hover:bg-primary/90 transition-all animate-fade-up"
        >
          <CartIcon />
          <span className="font-semibold text-sm">
            {cart.length} {cart.length === 1 ? "Item" : "Itens"}
          </span>
        </button>
      )}

      {/* ── Cart Modal ───────────────────────────────────── */}
      {cartOpen && (
        <CartModal
          items={cart}
          total={totalValue}
          isValid={Boolean(isValid)}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onSubmit={handleSubmit}
          condo={condo || null}
          block={block}
          apartment={apartment}
          customerName={customerName}
          customerPhone={customerPhone}
        />
      )}

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

interface CartModalProps {
  items: CartItem[];
  total: number;
  isValid: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  condo: string | null;
  block: string;
  apartment: string;
  customerName: string;
  customerPhone: string;
}

function CartModal({
  items,
  total,
  isValid,
  onClose,
  onUpdateQuantity,
  onRemove,
  onSubmit,
  condo,
  block,
  apartment,
  customerName,
  customerPhone,
}: CartModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-primary">
              Seu Pedido
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors hover:bg-muted"
            aria-label="Fechar"
          >
            <XIcon />
          </button>
        </div>

        {/* Customer & location summary */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-muted-foreground text-xs">Local</span>
            <p className="font-medium">{condo || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Apartamento</span>
            <p className="font-medium">{block}-{apartment}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground text-xs">Cliente</span>
            <p className="font-medium">{customerName}</p>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
          {items.map((item) => {
            const itemTotal =
              Number(item.drink.value) * item.quantity + calculateExtraValue(item);
            const selectedNames: string[] = [];
            for (const ing of item.drink.ingredients) {
              if ("options" in ing) {
                const group = ing as OptionsGroupReceipt;
                selectedNames.push(...(item.customizations[group.name] || []));
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
                    <p className="font-bold text-primary text-sm">{formatCurrency(itemTotal)}</p>
                    <div className="flex items-center gap-0">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon />
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive"
                    >
                      <TrashIcon /> Remover
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3 mb-4">
          <span className="text-sm font-semibold text-muted-foreground">Total</span>
          <span className="font-display font-extrabold text-2xl text-primary">{formatCurrency(total)}</span>
        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={onSubmit}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all",
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
            !isValid && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
        >
          <SendIcon />
          Enviar pedido via WhatsApp
        </button>
      </div>
    </div>
  );
}

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
