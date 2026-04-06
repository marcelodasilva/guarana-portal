# Guaraná da Sasá

A modern, tropical-inspired delivery portal for ordering custom guarana drinks. Built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **Customizable Drinks** – Choose from multiple guarana drink options with various sizes and ingredient customizations
- **WhatsApp Integration** – Orders are sent directly via WhatsApp for seamless processing
- **Persistent Form** – Your information is saved locally and restored automatically
- **Responsive Design** – Optimized for mobile and desktop devices
- **Tropical Modern UI** – Vibrant colors, smooth animations, and refined typography

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS v4 + custom design system
- **Components**: Radix UI + shadcn/ui
- **Fonts**: Bricolage Grotesque (display), Outfit (body)

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles, design tokens, animations
│   ├── layout.tsx       # Root layout with fonts
│   ├── page.tsx         # Main entry point
│   └── ui/
│       └── form.tsx     # Order form and cart modal
├── components/
│   └── ui/
│       └── button.tsx   # Reusable button component
├── lib/
│   ├── drinks.ts        # Drink menu data
│   └── utils.ts         # Utility functions (cn)
└── types/
    └── receipt.ts       # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn, pnpm, bun)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Configuration

### WhatsApp Phone Number

Set your WhatsApp business number via environment variable:

```env
NEXT_PUBLIC_WHATSAPP_PHONE=5593991586639
```

If not set, the default number `+5593991586639` will be used.

## Design System

### Colors (Tropical Palette)

- **Primary** – Guarana Berry (`oklch(0.35 0.22 340)`)
- **Secondary** – Amazon Green (`oklch(0.62 0.14 150)`)
- **Accent** – Mango Gold (`oklch(0.72 0.16 80)`)
- **Background** – Cream (`oklch(0.97 0.015 105)`)

### Typography

- Display: `Bricolage Grotesque` (warm, characterful)
- Body: `Outfit` (clean, geometric)

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/guarana-delivery-portal)

Or build and deploy to any static hosting:

```bash
npm run build
npm start
```

## License

MIT © Guaraná da Sasá
