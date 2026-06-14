# SECURITY.md

## Security Policy

### Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly by opening a GitHub Issue tagged `[SECURITY]`.

### Architecture Security

CARBON·LEDGER is designed with a **zero-trust client-side architecture**:

1. **No Backend / No Server**: All computation happens in the user's browser. There is no server to attack.
2. **No API Keys**: The application does not store or transmit any authentication tokens, API keys, or secrets.
3. **No External Data Persistence**: All user data is stored exclusively in the browser's `localStorage`. No data is ever sent to any external server.
4. **Input Sanitization**: All numeric inputs are clamped to valid ranges on blur events using the `clamp()` utility to prevent injection of invalid values.
5. **Safe Math**: The `safeNumber()` function guards every arithmetic operation against NaN, null, and undefined values to prevent mathematical errors from cascading through the UI.

### HTTP Security Headers

The following security headers are configured in `next.config.mjs`:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing attacks |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframe embedding |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filtering |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer information leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unnecessary browser APIs |

### Dependencies

All dependencies are pinned via `pnpm-lock.yaml` to ensure deterministic builds and prevent supply-chain attacks.
