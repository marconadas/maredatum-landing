# DNS — maredatum.pt

**Para:** Diogo Lucena
**De:** Marco
**Domínio:** maredatum.pt
**Objectivo:** (1) apontar `maredatum.pt` para a landing page no Vercel; (2) activar envio de emails via Resend a partir do domínio.

Adicionar os **5 registos** abaixo no painel DNS de `maredatum.pt`. **Não mexer** nos registos MX existentes que tratam da recepção de email no domínio principal — todos os novos registos são para sub-hosts (`send`, `resend._domainkey`) ou para o apex.

---

## Parte 1 — Apontar o domínio para a landing page (Vercel)

### Registo 1: A (apex)

| Campo | Valor |
|-------|-------|
| **Tipo** | `A` |
| **Nome / Host** | `@` (ou deixar em branco — significa `maredatum.pt`) |
| **Valor / Destino** | `76.76.21.21` |
| **TTL** | Auto (ou 3600) |

### Registo 2: A (www)

| Campo | Valor |
|-------|-------|
| **Tipo** | `A` |
| **Nome / Host** | `www` |
| **Valor / Destino** | `76.76.21.21` |
| **TTL** | Auto (ou 3600) |

> Após estes 2 registos propagarem, `https://maredatum.pt` e `https://www.maredatum.pt` passam a servir a landing page. O Vercel emite automaticamente o certificado SSL.

---

## Parte 2 — Activar envio de email (Resend)

### Registo 3: DKIM (TXT)

| Campo | Valor |
|-------|-------|
| **Tipo** | `TXT` |
| **Nome / Host** | `resend._domainkey` |
| **Valor** | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIDFcKM8R47X8X3Zp/1Np2Q+CDd48XnhEb9vi8700Vifqa7X/rO4jC+YP62wLtGnJz3/OuEMvvTJjCNbC8aB1JbWKBvYSuQZ8DsjuBEGbZ1dV6m4OUAOpufmb0tga9UXqtdI578NEzObDti+ZxqQO1o/6i8GJohST8a6pwiw+7VQIDAQAB` |
| **TTL** | Auto (ou 3600) |

### Registo 4: MX para bounces (sub-host `send`)

| Campo | Valor |
|-------|-------|
| **Tipo** | `MX` |
| **Nome / Host** | `send` |
| **Valor / Destino** | `feedback-smtp.eu-west-1.amazonses.com` |
| **Prioridade** | `10` |
| **TTL** | Auto (ou 3600) |

> Atenção: este MX é no sub-host `send.maredatum.pt`, **não** no apex. Não substitui nem afecta o MX do domínio principal.

### Registo 5: SPF (TXT, sub-host `send`)

| Campo | Valor |
|-------|-------|
| **Tipo** | `TXT` |
| **Nome / Host** | `send` |
| **Valor** | `v=spf1 include:amazonses.com ~all` |
| **TTL** | Auto (ou 3600) |

---

## Resumo rápido

| # | Tipo | Host | Valor | Prio |
|---|------|------|-------|------|
| 1 | A    | @ (apex) | `76.76.21.21` | — |
| 2 | A    | www | `76.76.21.21` | — |
| 3 | TXT  | resend._domainkey | `p=MIGfMA0G...VQIDAQAB` (chave DKIM completa acima) | — |
| 4 | MX   | send | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
| 5 | TXT  | send | `v=spf1 include:amazonses.com ~all` | — |

## Notas

- Propagação típica: 15 min a 24 h.
- Quando estiverem aplicados, avisar Marco para verificar o domínio no painel Resend (clicar **Verify**) e confirmar que o site responde em `https://maredatum.pt`.
- Não tocar nos MX existentes do domínio principal (recepção `@maredatum.pt`).

## Estado actual

- **Site provisório** (já live, antes do domínio apontar): https://maredatum-landing.vercel.app
- **Resend domain status:** `pending` (passa a `verified` após os registos 3–5 propagarem)
- **Vercel project:** `mil1s-projects/maredatum-landing`
