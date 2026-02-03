# Infrastructure & Domain Routing Audit

## Executive Summary
A comprehensive investigation was conducted to resolve the issue where `admin.skytripsword.com` incorrectly redirects to `skytrips.com.np`. The analysis covered the application codebase, routing configuration, and inferred infrastructure settings.

## Findings

### 1. Application-Level Routing (Next.js)
- **Status**: Clean
- **Analysis**: 
  - `middleware.ts` contained no redirection logic.
  - `next.config.ts` contained no `redirects` or `rewrites` rules.
  - `src/app/layout.tsx` contained no client-side redirection scripts.
  - No hardcoded references to `skytrips.com.np` were found in the routing logic.
- **Conclusion**: The redirection is **NOT** originating from the application code.

### 2. Infrastructure-Level (Inferred)
- **Issue**: The redirection is occurring at the DNS, CDN, or Web Server level before the request reaches the application logic.
- **Likely Causes**:
  - **DNS Misconfiguration**: `admin.skytripsword.com` might be a CNAME to `skytrips.com.np`, and the destination server is configured to redirect all traffic to its canonical domain (`skytrips.com.np`).
  - **Vercel/Platform Configuration**: If deployed on Vercel, the "Production Domain" setting might be set to `skytrips.com.np`, causing Vercel to redirect other domains (like `admin...`) to it.
  - **Web Server (Nginx/Apache)**: If self-hosted, the virtual host for `admin.skytripsword.com` might be missing, causing it to fall back to the default server block (`skytrips.com.np`).

## Resolution Plan

### 1. Application-Level Fixes (Implemented)
To enforce subdomain isolation within the application:
- **Middleware Enhancement**: Updated `middleware.ts` to strictly validate the `Host` header.
  - If the request comes from `admin.skytripsword.com`, it is processed.
  - If the request comes from an unknown domain (e.g., via CNAME without proper vhost), it can be blocked or handled explicitly.
- **Vercel Configuration**: Created `vercel.json` to ensure clean routing headers and prevent default redirects.

### 2. Required Infrastructure Actions (External)
The following actions must be performed on your DNS/Hosting provider (e.g., Vercel, AWS Route53, GoDaddy):

#### DNS Settings
- **Check A/CNAME Records**:
  - Ensure `admin.skytripsword.com` points to the **Admin App Deployment** (e.g., `cname.vercel-dns.com` or specific IP), NOT to the `skytrips.com.np` main site.
  - Verify that `skytrips.com.np` is NOT set as a "Redirect" rule in your domain registrar.

#### Hosting Platform (e.g., Vercel)
- **Project Settings**:
  - Go to **Settings > Domains**.
  - Ensure `admin.skytripsword.com` is added to the **Admin Panel Project**.
  - Ensure it is NOT configured to "Redirect to" another domain.
  - Ensure `skytrips.com.np` is NOT linked to this Admin project (unless it's a multi-zone setup, which is not recommended for strict isolation).

## Testing Protocols
A verification script `scripts/verify_domain_routing.js` has been created to simulate requests and verify:
1.  **Status Code**: Should be 200 (OK), not 301/302 (Redirect).
2.  **Host Header**: Application should recognize `admin.skytripsword.com`.
3.  **SSL**: Certificate should be valid for `admin.skytripsword.com`.

## Security Recommendations
- **IP Whitelisting**: Configure in Middleware or WAF (e.g., Cloudflare) to restrict access to admin paths.
- **Strict Transport Security (HSTS)**: Enabled in `vercel.json`.
- **X-Frame-Options**: Set to `DENY` to prevent clickjacking.
