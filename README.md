# FlowNet website

A static site (HTML, CSS, JS). No build step and no dependencies.

## Files
- `index.html`, `services.html`, `industries.html`, `pricing.html`, `about.html`, `contact.html`, `privacy.html`
- `css/styles.css` holds the design system (colour tokens are at the top)
- `js/config.js` holds the two settings you need to fill in
- `js/main.js` holds the mobile menu, booking link and form logic
- `assets/` has the logo for dark and light backgrounds

## Before you go live
1. **Form destination.** Open `js/config.js` and set `webhookUrl`. The form sends a JSON `POST`. Until it is set, visitors see an error and nothing is sent.
   - Suggested n8n flow: Webhook node (POST) → Google Sheets "Append row" → email or Slack notification to you → optional auto-reply to the visitor.
   - Payload fields: fullName, businessName, email, website, industry, employees, challenge, tools, budget, notes, consent, submittedAt, sourcePage.
   - Add the n8n webhook's CORS setting for your domain if the browser blocks the request.
2. **Booking link.** Set `bookingUrl` in `js/config.js` (Calendly, Cal.com and so on). The "Book a call" card on the contact page appears only when it is set.
3. **Contact email, company details and hosting.** None are shown on the site yet. Add them to the footer and to `privacy.html` once you have them. Add your legal name and registration details if you trade as a company.
4. **Privacy notice.** It is a sensible starting point, not legal advice. Have it checked against how you actually store enquiries.
5. **Domain extras.** After you choose a domain, add a `sitemap.xml` and set `<link rel="canonical">` on each page.

## Deploy
Upload this whole folder to Vercel, Netlify or Cloudflare Pages (drag and drop works), then connect your domain.

## Notes
- The integrations section lists tools by name with generic icons. Add official logos only if you follow each brand's usage rules.
- No testimonials, client logos, statistics or partnerships are shown, by design.
