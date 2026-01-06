## MorphStream Frontend
Small notes:
- Tailwind config is CJS (`tailwind.config.cjs`) for better Windows compatibility.
- PostCSS config is CJS (`postcss.config.cjs`).

### Setup

1. Install deps
```
cd vite-project
npm install
```

2. Configure environment

Create a `.env` file in `vite-project/` with:
```
VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
VITE_TARGET_CHAIN_ID=2810
```

3. Run
```
npm run dev
```

### Build
```
npm run build
npm run preview
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
