"use client";

import { useCallback, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
  customizations: Record<string, string[]>; // group name -> array of selected option names
  quantity: number;
}

type CondoType = "Estilo Golf" | "Park Golf";

type Toast = { message: string; type: "success" | "error" } | null;

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
      setToast({ message: `${receipts[drinkIndex].name} adicionado!`, type: "success" });
      setTimeout(() => setToast(null), 2500);
    },
    [receipts],
  );

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setToast({ message: "Item removido do carrinho", type: "success" });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const calculateExtraValue = (item: CartItem): number => {
    let extra = 0;
    const drink = item.drink;
    for (const ingredient of drink.ingredients) {
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
    (sum, item) => sum + Number(item.drink.value) * item.quantity + calculateExtraValue(item),
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
      const total = Number(item.drink.value) * item.quantity + calculateExtraValue(item);
      const sizeLabel = item.drink.size ? `${item.drink.size}ml` : "";
      lines.push(`🍹 *Pedido ${i + 1}:* ${item.drink.name} (${sizeLabel}) x${item.quantity}`);
      lines.push(`   💰 *Valor unitário:* ${formatCurrency(Number(item.drink.value))}`);
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

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";
    if (!phone) {
      setToast({ message: "Configure o número do WhatsApp no servidor", type: "error" });
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isValid =
    condo &&
    block &&
    apartment &&
    customerName &&
    customerPhone &&
    cart.length > 0;

  return (
    <form className="max-w-xl mx-auto p-4 space-y-6" onSubmit={handleSubmit}>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition",
            toast.type === "success" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
          )}
        >
          {toast.message}
        </div>
      )}

      <header className="text-center space-y-2 py-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">🍋</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Guaraná da Sasá
          </h1>
          <span className="text-4xl">🥤</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Faça seu pedido e receba no seu apartamento
        </p>
      </header>

      {/* Condomínio */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg text-primary">Condomínio</h2>
        <div className="flex gap-2">
          {(["Estilo Golf", "Park Golf"] as CondoType[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondo(c)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border text-center transition",
                condo === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Localização */}
      <section className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="block-input" className="text-sm font-medium">Bloco</label>
          <input
            id="block-input"
            type="text"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1"
            placeholder="Ex: 03"
            required
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="apartment-input" className="text-sm font-medium">Apartamento</label>
          <input
            id="apartment-input"
            type="text"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1"
            placeholder="Ex: 102"
            required
          />
        </div>
      </section>

      {/* Cliente */}
      <section className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="customer-name" className="text-sm font-medium">Seu Nome</label>
          <input
            id="customer-name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1"
            placeholder="Ex: João Silva"
            required
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="customer-phone" className="text-sm font-medium">WhatsApp</label>
          <input
            id="customer-phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-1"
            placeholder="Ex: 11999999999"
            required
          />
        </div>
      </section>

      {/* Menu */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg text-primary">Escolha os Drinks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {receipts.map((drink, idx) => (
            <div
              key={`${drink.name}-${drink.size}`}
              className="border rounded-xl p-4 space-y-3 hover:shadow-lg hover:border-accent transition bg-card"
            >
              <div>
                <p className="font-medium">{drink.name}</p>
                <p className="text-sm text-muted-foreground">
                  {drink.size}ml — {formatCurrency(Number(drink.value))}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCustomizingIndex({ drinkIndex: idx })}
              >
                Adicionar
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Carrinho */}
      {cart.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-semibold text-lg text-primary">
            <span>🛒</span> Seu Pedido ({cart.length} {cart.length === 1 ? "item" : "itens"})
          </h2>
          <div className="space-y-2">
            {cart.map((item) => {
              const itemTotal = Number(item.drink.value) * item.quantity + calculateExtraValue(item);
              const selectedNames: string[] = [];
              for (const ing of item.drink.ingredients) {
                if ("options" in ing) {
                  const group = ing as OptionsGroupReceipt;
                  const selArray = item.customizations[group.name] || [];
                  selectedNames.push(...selArray);
                } else {
                  selectedNames.push((ing as OptionsSingle).name);
                }
              }
              return (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 text-sm space-y-2 bg-secondary/20"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-medium">
                        {item.drink.name} ({item.drink.size}ml)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedNames.join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {formatCurrency(itemTotal)}
                        </span>
                        <div className="flex items-center border rounded-md">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 py-0.5 text-sm font-bold hover:bg-muted"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 py-0.5 text-sm font-bold hover:bg-muted"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-2">
            <p className="text-xl font-bold text-right text-primary">
              Total: {formatCurrency(totalValue)}
            </p>
          </div>
        </section>
      ) : (
        <div className="text-center py-8 bg-secondary/10 rounded-lg border border-dashed">
          <p className="text-muted-foreground">Seu carrinho está vazio.</p>
          <p className="text-sm text-muted-foreground">
            Adicione alguns drinks acima para continuar.
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        className="w-full py-6 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/80"
        disabled={!isValid}
        type="submit"
      >
        Enviar Pedido via WhatsApp
      </Button>

      {/* Customization Modal */}
      {customizingIndex && (
        <DrinkCustomizer
          drink={receipts[customizingIndex.drinkIndex]}
          onConfirm={(customizations) =>
            addToCart(customizingIndex.drinkIndex, customizations)
          }
          onCancel={() => setCustomizingIndex(null)}
        />
      )}
    </form>
  );
}

function formatCurrency(val: number): string {
  return val.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

interface DrinkCustomizerProps {
  drink: ReceiptShape;
  onConfirm: (customizations: Record<string, string[]>) => void;
  onCancel: () => void;
}

function DrinkCustomizer({ drink, onConfirm, onCancel }: DrinkCustomizerProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
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
  });

  // Build group map and determine if group is exclusive (all options have no value)
  const groupInfo = useMemo(() => {
    const map = new Map<string, { group: OptionsGroupReceipt; exclusive: boolean }>();
    for (const ing of drink.ingredients) {
      if ("options" in ing) {
        const group = ing as OptionsGroupReceipt;
        const exclusive = group.options.every((opt) => opt.value === undefined);
        map.set(group.name, { group, exclusive });
      }
    }
    return map;
  }, [drink.ingredients]);

  const handleToggle = (groupName: string, optionName: string) => {
    const info = groupInfo.get(groupName);
    if (!info) return;
    const { exclusive } = info;
    setSelections((prev) => {
      const current = prev[groupName] || [];
      if (exclusive) {
        // Single selection: replace with this option
        return { ...prev, [groupName]: [optionName] };
      } else {
        // Multiple selection: toggle
        const exists = current.includes(optionName);
        const updated = exists ? current.filter((n) => n !== optionName) : [...current, optionName];
        return { ...prev, [groupName]: updated };
      }
    });
  };

  const extra = drink.ingredients.reduce((sum, ing) => {
    if ("options" in ing) {
      const group = ing as OptionsGroupReceipt;
      const selectedArray = selections[group.name] || [];
      for (const selectedName of selectedArray) {
        const opt = group.options.find((o) => o.name === selectedName);
        if (opt?.value) sum += Number(opt.value);
      }
    }
    return sum;
  }, 0);

  const total = Number(drink.value) + extra;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-background rounded-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{drink.name}</h2>
            <p className="text-sm text-muted-foreground">
              {drink.size}ml — {formatCurrency(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {drink.ingredients.map((ing) => {
          const keyName = typeof ing === 'object' && 'name' in ing ? ing.name : String(ing);
          if ("options" in ing) {
            const group = ing as OptionsGroupReceipt;
            const info = groupInfo.get(group.name);
            const isExclusive = info?.exclusive ?? false;
            return (
              <div key={keyName} className="space-y-1">
                <label className="text-sm font-medium">{group.name}</label>
                <div className="space-y-1">
                  {group.options.map((opt) => {
                    const selectedArray = selections[group.name] || [];
                    const isChecked = selectedArray.includes(opt.name);
                    const InputComponent = isExclusive ? "radio" : "checkbox";
                    return (
                      <label
                        key={opt.name}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type={isExclusive ? "radio" : "checkbox"}
                          name={isExclusive ? group.name : undefined}
                          checked={isChecked}
                          onChange={() => handleToggle(group.name, opt.name)}
                          className="rounded border-input"
                        />
                        <span>
                          {opt.name}
                          {opt.value !== undefined && (
                            <span className="text-muted-foreground"> (+{formatCurrency(Number(opt.value))})</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            return (
              <p key={keyName} className="text-sm py-1 text-muted-foreground">
                – {(ing as OptionsSingle).name}
              </p>
            );
          }
        })}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={() => onConfirm(selections)}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
