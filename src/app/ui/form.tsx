"use client";

import { useCallback, useState } from "react";
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
  customizations: Record<string, string>;
}

type CondoType = "Estilo Golf" | "Park Golf";

export default function OrderForm({ receipts }: OrderFormProps) {
  const [condo, setCondo] = useState<CondoType | null>(null);
  const [block, setBlock] = useState("");
  const [apartment, setApartment] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [customizingIndex, setCustomizingIndex] = useState<{
    drinkIndex: number;
  } | null>(null);

  const addToCart = useCallback(
    (drinkIndex: number, customizations: Record<string, string>) => {
      setCart((prev) => [
        ...prev,
        { id: `cart-${Date.now()}`, drink: receipts[drinkIndex], customizations },
      ]);
      setCustomizingIndex(null);
    },
    [receipts],
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const calculateExtraValue = (item: CartItem): number => {
    let extra = 0;
    const drink = item.drink;
    for (const ingredient of drink.ingredients) {
      if ("options" in ingredient) {
        const selectedName = item.customizations[ingredient.name];
        if (selectedName) {
          const opt = ingredient.options.find((o) => o.name === selectedName);
          if (opt?.value) extra += Number(opt.value);
        }
      }
    }
    return extra;
  };

  const totalValue = cart.reduce(
    (sum, item) => sum + Number(item.drink.value) + calculateExtraValue(item),
    0,
  );

  const generateMessage = (): string => {
    if (!condo || cart.length === 0) return "";

    const lines: string[] = [
      "*Pedido Guaraná da Sasá*",
      "",
      `*Local:* ${condo}`,
      `*Bloco:* ${block}`,
      `*Apartamento:* ${apartment}`,
      "",
    ];

    cart.forEach((item, i) => {
      const total = Number(item.drink.value) + calculateExtraValue(item);
      const sizeLabel = item.drink.size ? `${item.drink.size}ml` : "";
      lines.push(
        `*Pedido ${i + 1}:* ${item.drink.name} (${sizeLabel}) - ${formatCurrency(total)}`,
      );

      const ingredientNames: string[] = [];
      for (const ingredient of item.drink.ingredients) {
        if ("options" in ingredient) {
          const selected = item.customizations[ingredient.name];
          if (selected) ingredientNames.push(selected);
        } else {
          ingredientNames.push((ingredient as OptionsSingle).name);
        }
      }
      lines.push(`  Ingredientes: ${ingredientNames.join(", ")}`);
    });

    lines.push("");
    lines.push(`*Total: ${formatCurrency(totalValue)}*`);

    if (deliveryTime) {
      const time = new Date(deliveryTime);
      lines.push(
        `*Horário de entrega:* ${time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      );
    }

    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = generateMessage();
    if (!message) return;

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";
    if (!phone) {
      alert(
        "WhatsApp number not configured. Set NEXT_PUBLIC_WHATSAPP_PHONE env variable.",
      );
      return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isValid = condo && block && apartment && cart.length > 0;

  return (
    <form className="max-w-xl mx-auto p-4 space-y-6" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-center">Faça seu Pedido!</h1>

      {/* Condo selector */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Condomínio</h2>
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

      {/* Block + Apartment */}
      <section className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="block-input" className="text-sm font-medium">Bloco</label>
          <input
            id="block-input"
            type="text"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Ex: 102"
            required
          />
        </div>
      </section>

      {/* Drink menu */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Escolha os Drinks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {receipts.map((drink, idx) => (
            <div
              key={drink.name}
              className="border rounded-lg p-3 space-y-2 hover:shadow-md transition"
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

      {/* Cart */}
      {cart.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-lg">
            Seu Pedido ({cart.length} {cart.length === 1 ? "item" : "itens"})
          </h2>
          <div className="space-y-2">
            {cart.map((item) => {
              const itemTotal =
                Number(item.drink.value) + calculateExtraValue(item);
              const selectedNames: string[] = [];
              for (const ing of item.drink.ingredients) {
                if ("options" in ing) {
                  const sel =
                    item.customizations[(ing as OptionsGroupReceipt).name];
                  if (sel) selectedNames.push(sel);
                }
              }
              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 text-sm space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {item.drink.name} ({item.drink.size}ml)
                      </p>
                      <p className="text-muted-foreground">
                        {selectedNames.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(itemTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-lg font-bold text-right">
            Total: {formatCurrency(totalValue)}
          </p>
        </section>
      )}

      {/* Delivery time */}
      <section className="space-y-1">
        <label htmlFor="delivery-time" className="text-sm font-medium">Horário de Entrega</label>
        <input
          id="delivery-time"
          type="time"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </section>

      {/* Submit */}
      <Button className="w-full py-6 text-lg" disabled={!isValid} type="submit">
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
  onConfirm: (customizations: Record<string, string>) => void;
  onCancel: () => void;
}

function DrinkCustomizer({ drink, onConfirm, onCancel }: DrinkCustomizerProps) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const ing of drink.ingredients) {
      if ("options" in ing) {
        const group = ing as OptionsGroupReceipt;
        const defaultOpt = group.options.find((o) => o.default);
        if (defaultOpt) init[group.name] = defaultOpt.name;
        else if (group.options.length > 0) init[group.name] = group.options[0].name;
      }
    }
    return init;
  });

  const handleSelect = (groupName: string, optionName: string) => {
    setSelections((prev) => ({ ...prev, [groupName]: optionName }));
  };

  const extra = drink.ingredients.reduce((sum, ing) => {
    if ("options" in ing && selections[(ing as OptionsGroupReceipt).name]) {
      const opt = (ing as OptionsGroupReceipt).options.find(
        (o) => o.name === selections[(ing as OptionsGroupReceipt).name],
      );
      if (opt?.value) return sum + Number(opt.value);
    }
    return sum;
  }, 0);

  const total = Number(drink.value) + extra;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">{drink.name}</h2>
        <p className="text-sm text-muted-foreground">
          {drink.size}ml — {formatCurrency(total)}
        </p>

        {drink.ingredients.map((ing) => {
          const keyName = ing.name;
          return (
            <div key={keyName} className="space-y-1">
              {"options" in ing ? (
                <>
                  <label
                    htmlFor={`select-${(ing as OptionsGroupReceipt).name}`}
                    className="text-sm font-medium"
                  >
                    {(ing as OptionsGroupReceipt).name}
                  </label>
                  <select
                    id={`select-${(ing as OptionsGroupReceipt).name}`}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selections[(ing as OptionsGroupReceipt).name] || ""}
                    onChange={(e) =>
                      handleSelect((ing as OptionsGroupReceipt).name, e.target.value)
                    }
                  >
                    {(ing as OptionsGroupReceipt).options.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.name}
                        {opt.value !== undefined
                          ? ` (+${formatCurrency(Number(opt.value))})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <p className="text-sm py-1 text-muted-foreground">
                  – {(ing as OptionsSingle).name}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex gap-2">
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
