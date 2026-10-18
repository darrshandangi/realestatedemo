/**
 * ============================================================================
 * Dynamic Personalizer for Real Estate / Luxury Interior Demo Website
 * ============================================================================
 * Reads ?name=, ?city=, ?phone=, ?niche=, ?agency=, ?cal= from the URL.
 * Replaces brand names across the header, hero, about, testimonials, and footer.
 * Optionally displays a sleek preview pitch banner for cold outreach.
 * ============================================================================
 */

(function () {
    const DEFAULT_PLACEHOLDER = "Atelier Noir";
    const DEFAULT_CITY = "New York";

    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    const rawName = params.get('name') || params.get('biz') || params.get('business');
    const rawCity = params.get('city') || params.get('loc');
    const rawPhone = params.get('phone') || params.get('tel');
    const agencyName = params.get('agency') || "WebCraft Studio";
    const ctaLink = params.get('cal') || params.get('cta') || "https://cal.com/";
    const hideBanner = params.get('banner') === 'false' || params.get('banner') === '0';

    if (!rawName && !rawCity && !rawPhone) {
        return; // Leave default demo website intact
    }

    const businessName = rawName ? rawName.trim() : null;
    const city = rawCity ? rawCity.trim() : null;
    const phone = rawPhone ? rawPhone.trim() : null;

    function applyPersonalization() {
        // --- 1. Document Title & Meta ---
        if (businessName) {
            const locPart = city ? ` — ${city}` : ' — Luxury Interior Design & Real Estate';
            document.title = `${businessName}${locPart}`;
        }

        // --- 2. Nav Logo & Footer Logo ---
        if (businessName) {
            document.querySelectorAll('.nav-logo-name').forEach(el => {
                el.textContent = businessName;
            });
        }

        // --- 3. Hero Section (H1) ---
        if (businessName) {
            const heroH1 = document.querySelector('#hero-text-1 h1');
            if (heroH1) {
                // Format name: split into first word and remaining or two parts
                const parts = businessName.split(' ');
                if (parts.length > 1) {
                    const first = parts.slice(0, -1).join(' ');
                    const last = parts[parts.length - 1];
                    heroH1.innerHTML = `${escapeHtml(first)}<br><em>${escapeHtml(last)}</em>`;
                } else {
                    heroH1.innerHTML = `<em>${escapeHtml(businessName)}</em>`;
                }
            }
        }

        // --- 4. Hero Eyebrow / City ---
        if (city) {
            const heroEyebrow = document.querySelector('#hero-text-1 .hero-eyebrow');
            if (heroEyebrow) {
                heroEyebrow.textContent = `Bespoke Architectural Excellence · ${city}`;
            }
        }

        // --- 5. DOM Text Replacement (Replaces "Atelier Noir" and "Atelier Noir Interiors") ---
        if (businessName) {
            replaceTextInTree(document.body, "Atelier Noir Interiors", `${businessName} Interiors`);
            replaceTextInTree(document.body, "Atelier Noir", businessName);
        }

        if (city) {
            replaceTextInTree(document.body, "New York", city);
        }

        // --- 6. Phone Links ---
        if (phone) {
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                link.setAttribute('href', `tel:${phone.replace(/[^0-9+]/g, '')}`);
                link.textContent = phone;
            });
        }

        // --- 7. Floating Pitch Banner for Cold Outreach ---
        if (businessName && !hideBanner) {
            injectOutreachBanner(businessName, agencyName, ctaLink);
        }
    }

    function replaceTextInTree(root, searchStr, replaceStr) {
        if (!searchStr || !replaceStr || searchStr === replaceStr) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent) continue;
            const tag = parent.tagName;
            if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT'].includes(tag)) continue;
            if (parent.closest('#outreach-demo-banner')) continue;

            if (node.nodeValue.includes(searchStr)) {
                node.nodeValue = node.nodeValue.replaceAll(searchStr, replaceStr);
            }
        }
    }

    function injectOutreachBanner(name, agency, bookUrl) {
        if (document.getElementById('outreach-demo-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'outreach-demo-banner';
        banner.innerHTML = `
            <style>
                #outreach-demo-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 999999;
                    background: rgba(14, 14, 16, 0.95);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border-bottom: 1px solid rgba(197, 160, 89, 0.35);
                    color: #F5F3EF;
                    padding: 10px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 13.5px;
                    box-shadow: 0 4px 25px rgba(0,0,0,0.5);
                    animation: slideDownBanner 0.4s ease-out;
                }
                @keyframes slideDownBanner {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
                .odb-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .odb-tag {
                    background: linear-gradient(135deg, #c5a059, #e2c98a);
                    color: #0b0b0c;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding: 3px 9px;
                    border-radius: 999px;
                }
                .odb-text {
                    color: #d1cfc7;
                }
                .odb-text strong {
                    color: #f7ecd5;
                }
                .odb-actions {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .odb-btn {
                    background: #c5a059;
                    color: #0b0b0c;
                    padding: 6px 16px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    transition: all 0.2s ease;
                }
                .odb-btn:hover {
                    background: #e2c98a;
                    transform: translateY(-1px);
                    box-shadow: 0 3px 12px rgba(197, 160, 89, 0.4);
                }
                .odb-close {
                    background: transparent;
                    border: none;
                    color: #8c8980;
                    font-size: 22px;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0 4px;
                    transition: color 0.15s;
                }
                .odb-close:hover {
                    color: #fff;
                }
                @media (max-width: 768px) {
                    #outreach-demo-banner {
                        padding: 8px 14px;
                        font-size: 12px;
                    }
                    .odb-text span.hide-mobile {
                        display: none;
                    }
                    .odb-btn {
                        padding: 5px 10px;
                        font-size: 11px;
                    }
                }
            </style>
            <div class="odb-left">
                <span class="odb-tag">Private Preview</span>
                <span class="odb-text">
                    Custom concept designed for <strong>${escapeHtml(name)}</strong> <span class="hide-mobile">by ${escapeHtml(agency)}</span>
                </span>
            </div>
            <div class="odb-actions">
                <a href="${bookUrl}" target="_blank" class="odb-btn">Claim This Site &rarr;</a>
                <button type="button" class="odb-close" id="odb-close-btn">&times;</button>
            </div>
        `;

        document.body.prepend(banner);

        // Adjust navbar top position if needed
        const bannerHeight = banner.offsetHeight || 44;
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.style.top = `${bannerHeight}px`;
        }

        document.getElementById('odb-close-btn').addEventListener('click', () => {
            banner.remove();
            if (navbar) navbar.style.top = '0px';
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPersonalization);
    } else {
        applyPersonalization();
    }
})();
