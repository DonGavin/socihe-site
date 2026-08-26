# SCHE Cloudflare Pages site

This folder is ready to upload to a GitHub repository and connect to Cloudflare Pages.

## Structure

- `index.html` — deployment filename for the original `cannabisLanding_Current` home page
- `about.html` — about page
- `membership.html` — deployment filename for the original `membershipReworkCurrent(1).html` membership page and form
- `CannabisLogo.png` — site logo
- `functions/api/membership.js` — Cloudflare Pages Function for form email delivery

Keep the `functions/api/membership.js` path unchanged. It creates the `/api/membership` endpoint used by the form.

## Cloudflare Pages settings

- Framework preset: None
- Production branch: main
- Build command: leave blank
- Build output directory: `.`

Add these bindings under **Settings > Variables and Secrets** for the Production environment:

| Name | Type | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | Secret / encrypted | Your Resend API key |
| `RESEND_FROM_EMAIL` | Text | `SCHE Website <forms@mail.socihe.org>` |
| `MEMBERSHIP_INBOX` | Text | `gavinjdonlevy@gmail.com` |
| `SCHE_REPLY_TO` | Text | `gavinjdonlevy@gmail.com` |

Redeploy after adding or changing bindings.

Do not commit the Resend API key to GitHub and do not add it to any HTML or JavaScript file in the public site assets.
