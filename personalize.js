/**
 * ============================================================================
 * Dynamic Personalizer for Real Estate / Luxury Interior Demo Website
 * ============================================================================
 * Reads ?name=, ?city=, ?phone=, ?created= from the URL.
 * Replaces brand names across the header, hero, about, testimonials, and footer.
 * Injects a 7-day countdown urgency banner: "Concept designed for [Name] by Darrshan Dangi · Site deletes in 6d 23h 59m"
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
    const agencyName = params.get('agency') || "Darrshan Dangi";
    const ctaLink = params.get('cal') || params.get('cta') || "#contact";
    const hideBanner = params.get('banner') === 'false' || params.get('banner') === '0';
    const createdAtParam = params.get('created'); // Optional ISO or timestamp

    const businessName = rawName ? rawName.trim() : "Premier Realty";
    const city = rawCity ? rawCity.trim() : null;
    const phone = rawPhone ? rawPhone.trim() : null;

    function applyPersonalization() {
        // --- 1. Document Title & Meta ---
        if (rawName) {
            const locPart = city ? ` — ${city}` : ' — Premier Real Estate Broker';
            document.title = `${businessName}${locPart}`;
        }

        // --- 2. Nav Logo & Footer Logo ---
        if (rawName) {
            document.querySelectorAll('.nav-logo-name').forEach(el => {
                el.textContent = businessName;
            });
        }

        // --- 2.5 Update Chatbot Name Dynamically ---
        if (window.updateChatbotBrand) {
            window.updateChatbotBrand(businessName);
        }

        // --- 3. Hero Section (H1) ---
        if (businessName) {
            const heroH1 = document.querySelector('#hero-text-1 h1');
            if (heroH1) {
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
                heroEyebrow.textContent = `Your Trusted Real Estate Partner · ${city}`;
            }
        }

        // --- 5. DOM Text Replacement ---
        if (rawName) {
            replaceTextInTree(document.body, "Premier Realty", businessName);
            replaceTextInTree(document.body, "Atelier Noir", businessName);
        }

        if (city) {
            replaceTextInTree(document.body, "Austin, TX", city);
            replaceTextInTree(document.body, "Austin", city);
        }

        // --- 6. Phone Links ---
        if (phone) {
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                link.setAttribute('href', `tel:${phone.replace(/[^0-9+]/g, '')}`);
                link.textContent = phone;
            });
        }

        // --- 7. Floating Pitch Banner with 7-Day Countdown Urgency ---
        if (!hideBanner) {
            injectOutreachBanner(businessName, agencyName, ctaLink, createdAtParam);
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

    /**
     * Determines the 7-day expiration deadline.
     * Persists in localStorage for each specific business name so refreshing doesn't reset it!
     */
    function getExpirationDeadline(clientName, createdParam) {
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const storageKey = `demo_timer_${encodeURIComponent(clientName.toLowerCase())}`;

        // 1. If explicitly passed in the URL (e.g. ?created=1713430000000)
        if (createdParam) {
            const parsedTime = Number(createdParam) || Date.parse(createdParam);
            if (!isNaN(parsedTime)) {
                return parsedTime + SEVEN_DAYS_MS;
            }
        }

        // 2. Check if first visit timestamp already stored in user's browser
        try {
            const savedStart = localStorage.getItem(storageKey);
            if (savedStart) {
                const startTime = parseInt(savedStart, 10);
                if (!isNaN(startTime)) {
                    return startTime + SEVEN_DAYS_MS;
                }
            }
            // First time this business link is opened: save current timestamp
            const now = Date.now();
            localStorage.setItem(storageKey, now.toString());
            return now + SEVEN_DAYS_MS;
        } catch (e) {
            return Date.now() + SEVEN_DAYS_MS;
        }
    }

    function injectOutreachBanner(name, agency, bookUrl, createdParam) {
        if (document.getElementById('outreach-demo-banner')) return;

        const deadline = getExpirationDeadline(name, createdParam);

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
                    background: rgba(14, 14, 16, 0.96);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(197, 160, 89, 0.35);
                    color: #F5F3EF;
                    padding: 9px 22px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 13px;
                    box-shadow: 0 4px 25px rgba(0,0,0,0.55);
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
                    flex-wrap: wrap;
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
                .odb-timer-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(239, 68, 68, 0.14);
                    border: 1px solid rgba(239, 68, 68, 0.35);
                    color: #fca5a5;
                    padding: 2px 9px;
                    border-radius: 999px;
                    font-size: 11.5px;
                    font-weight: 600;
                    font-variant-numeric: tabular-nums;
                }
                .odb-pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: #ef4444;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #ef4444;
                    animation: odbPulse 1.5s infinite;
                }
                @keyframes odbPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.85); }
                }
                .odb-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-shrink: 0;
                }
                .odb-btn {
                    background: #c5a059;
                    color: #0b0b0c;
                    padding: 6px 15px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 11.5px;
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
                    font-size: 20px;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0 4px;
                    transition: color 0.15s;
                }
                .odb-close:hover {
                    color: #fff;
                }
                @media (max-width: 820px) {
                    #outreach-demo-banner {
                        padding: 8px 12px;
                        font-size: 11.5px;
                    }
                    .odb-text span.hide-mobile {
                        display: none;
                    }
                    .odb-timer-pill {
                        font-size: 10.5px;
                        padding: 1px 7px;
                    }
                    .odb-btn {
                        padding: 5px 9px;
                        font-size: 10.5px;
                    }
                }
            </style>
            <div class="odb-left">
                <span class="odb-tag">Private Preview</span>
                <span class="odb-text">
                    Custom concept designed for <strong>${escapeHtml(name)}</strong> by <strong>${escapeHtml(agency)}</strong>
                </span>
                <span class="odb-timer-pill" title="This temporary preview link automatically expires after 7 days">
                    <span class="odb-pulse-dot"></span>
                    <span>Deletes in: <strong id="odb-countdown" style="color: #fee2e2;">7d 00h 00m 00s</strong></span>
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

        // Start real-time countdown timer
        const timerEl = document.getElementById('odb-countdown');
        function updateTimer() {
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                if (timerEl) timerEl.textContent = "Expired";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            const pad = (n) => String(n).padStart(2, '0');
            if (timerEl) {
                timerEl.textContent = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
            }
        }

        updateTimer();
        setInterval(updateTimer, 1000);
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
