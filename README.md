# Pass Forge

A client-side password generator built with React, TypeScript, and Tailwind CSS. All passwords are generated locally in the browser using the Web Crypto API — no data is ever sent to a server.

## Features

- **Cryptographically secure** — uses `crypto.getRandomValues()` for true randomness
- **Customizable length** — 8 to 32 characters via slider or mouse wheel
- **Character options** — toggle uppercase, lowercase, numbers, and symbols
- **Avoid similar characters** — excludes ambiguous characters like `1`, `l`, `I`, `0`, `O`
- **Memorable passwords** — generates word-based passwords that are easier to remember
- **One-click copy** — copy generated passwords to clipboard instantly
- **Fully offline** — works without an internet connection after initial load

## Tech Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Security

This generator never transmits passwords or entropy data over the network. The Web Crypto API (`crypto.getRandomValues`) provides cryptographically strong random values suitable for password generation.
