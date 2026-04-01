> **TODO (Marco):** Before sending this document to Zé Luís Lucena, add the real CNAME value from the Resend dashboard: Domains → Add maredatum.pt → copy the CNAME record value and replace the placeholder on line 11.

# DNS Records for maredatum.pt — Resend Verification

**Para:** Zé Luís Lucena
**Assunto:** Registos DNS para activar envio de email via maredatum.pt

## Registos a adicionar

| Tipo | Nome | Valor |
|------|------|-------|
| TXT | maredatum.pt | v=spf1 include:amazonses.com ~all |
| CNAME | resend._domainkey.maredatum.pt | [obter do painel Resend → Domains → maredatum.pt] |

## Notas

- MX records não são necessários (apenas enviamos, não recebemos por este domínio)
- Após aplicar os registos, a propagação demora entre 15 minutos e 24 horas
- Confirmar com Marco quando estiver feito para verificar no painel Resend

## Após verificação

Marco irá actualizar o remetente de `onboarding@resend.dev` para `noreply@maredatum.pt`.
