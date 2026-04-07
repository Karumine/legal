# Copilot Instructions for legal

## Project snapshot
- React + TypeScript + Vite SPA
- Central state in `src/App.tsx` (`AppData` in `src/types/app.ts`)
- Contracts are dynamic: `agreements: Agreement[]` with `ContractType` variants
- UI: left panel forms, right panel contract preview, output via `window.print()` and CSS `print:` utility classes

## Workflow commands
- `npm install`
- `npm run dev` (Vite with HMR)
- `npm run build` (`tsc -b` + `vite build`)
- `npm run preview` (static preview)
- `npm run lint` (ESLint on entire project)

## Architecture and data flow
- `src/App.tsx` owns all global contract state, updates, and computed preview tab list (`previewTabs`)
- Add/remove agreements: `addAgreement(type)` / `removeAgreement(id)`
- Form updates propagate with callbacks:
  - `CompanyInfoForm` triggers `updateAgileInfo`, `updateTkInfo`, `updateField`
  - `HirePurchaseForm` calls `updateAgreementData` for active `hirePurchase` contract
  - `GuarantorForm` uses selected agreement IDs and constructs guarantee data in `buildGuaranteeData`
- Preview components:
  - `HirePurchasePreview`, `BuybackPreview`, `GuaranteePreview`, `JointVenturePreview`, `ServiceAgreementPreview`, `FeePayment` uses `ContractPreview`

## Naming conventions
- Type names: `*Data` and `*Preview` in both `src/components/` and `src/types/`
- Contract ID string pattern: `agreement-<id>`, `buyback-<idx>`, `guarantee-<idx>`
- `CONTRACT_TYPE_LABELS` in `src/types/app.ts` maps `ContractType` to Thai labels

## Extension points (easy wins)
- New main contract type: add `ContractType`, label, default `Agreement` shape in `initialAppData`, form + preview components + `renderContractPreview`
- Add validation: currently minimal; target `src/components/*Form.tsx` (controlled inputs with `onChange` sync)
- Add print layout tweaks: `#preview-panel` currently has bug fix in `handlePrint` with forced reflow

## External integration notes
- No API backend in this repo; all data is in-memory state
- Uses Tailwind CSS v4 with `@tailwindcss/postcss` and `postcss.config.js`

## Agent behavior hints
- prefer modifying `src/App.tsx` for global state/flow updates
- preserve `AppData` shape in `src/types/app.ts` when adding fields
- keep `previewTabs` and `activePreview` logic consistent with UI tabs and print workflow

## Check after edits
- Run `npm run lint`
- Open `npm run dev` and confirm every form update reflects in preview and print CSS shows correctly
