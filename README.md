# SCHE Cloudflare Pages site


## Structure

- `index.html` — deployment filename for home page
- `about.html` — about page
- `membership.html` — deployment filename for membership page and form
- `CannabisLogo.png` — site logo
- `functions/api/membership.js` — Cloudflare Pages Function for form email delivery

## Cloudflare Pages settings

- Framework preset: None
- Production branch: main

Add bindings under **Settings > Variables and Secrets** for the Production environment:

| Name | Type | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret / encrypted | Your Resend API key |
| `RESEND_FROM_EMAIL` | Text | `SCHE Website <forms@mail.socihe.org>` |
| `MEMBERSHIP_INBOX` | Text | `gavinjdonlevy@gmail.com` |
| `SCHE_REPLY_TO` | Text | `gavinjdonlevy@gmail.com` |

Redeploy after adding or changing bindings.
