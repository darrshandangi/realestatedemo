/**
 * ═══════════════════════════════════════════════════════════════
 * REAL ESTATE BROKER CHATBOT
 * Dynamic branding, interactive quick chips, smart replies & lead capture
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
    let brandName = "Premier Realty";
    let isChatOpen = false;

    // Detect brand name from nav or page
    function getActiveBrandName() {
        const logoEl = document.querySelector('.nav-logo-name');
        if (logoEl && logoEl.textContent.trim()) {
            return logoEl.textContent.trim();
        }
        return brandName;
    }

    // Set brand name dynamically
    window.updateChatbotBrand = function (newName) {
        if (!newName) return;
        brandName = newName;
        const brandEl = document.getElementById('chatbot-brand-name');
        if (brandEl) {
            brandEl.textContent = newName;
        }
    };

    // Chat responses database
    const RESPONSES = {
        tour: {
            text: `We'd love to arrange a private walkthrough for you! Which listing caught your eye? You can share the address, your preferred day (e.g. this Saturday), or leave your phone number and we'll confirm your tour slot right away.`,
            chips: ["📍 Oakwood Heights ($485k)", "📍 Downtown Loft ($620k)", "📞 Leave My Number"]
        },
        valuation: {
            text: `Looking to sell or curious about your equity? We provide free, accurate Comparative Market Analyses (CMA) reflecting current neighborhood sales. What's your property address or ZIP code?`,
            chips: ["Austin, TX", "Denver, CO", "Portland, OR"]
        },
        budget: {
            text: `We have properties ranging from $350k modern apartments to $1.2M+ luxury estates. What price range and bedroom count are you targeting?`,
            chips: ["Under $500k", "$500k - $800k", "$800k+", "Show 3+ Bedrooms"]
        },
        agent: {
            text: `Our premier licensed brokers are on standby to help you. You can call us directly at <strong>(555) 123-4567</strong>, email <strong>hello@premierrealty.com</strong>, or type your phone/email here and an agent will text you within 5 minutes!`,
            chips: ["📅 Book a Call", "🏡 Browse Listings"]
        }
    };

    function initChatbot() {
        const activeName = getActiveBrandName();
        brandName = activeName;

        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const chatWindow = document.getElementById('chatbot-window');
        const closeBtn = document.getElementById('chatbot-close-btn');
        const chatForm = document.getElementById('chatbot-form');
        const chatInput = document.getElementById('chatbot-input');
        const messagesContainer = document.getElementById('chatbot-messages');
        const brandEl = document.getElementById('chatbot-brand-name');

        if (brandEl) {
            brandEl.textContent = brandName;
        }

        // Toggle open/close
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                toggleChat(!isChatOpen);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toggleChat(false);
            });
        }

        function toggleChat(open) {
            isChatOpen = open;
            if (chatWindow && toggleBtn) {
                if (open) {
                    chatWindow.classList.add('active');
                    toggleBtn.classList.add('active');
                    setTimeout(() => {
                        if (chatInput) chatInput.focus();
                    }, 250);
                } else {
                    chatWindow.classList.remove('active');
                    toggleBtn.classList.remove('active');
                }
            }
        }

        // Attach quick question chips
        document.querySelectorAll('.chatbot-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                const query = this.getAttribute('data-query');
                handleUserQuery(query, this.textContent.trim());
            });
        });

        // Form submit
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (!text) return;
                chatInput.value = '';
                handleUserQuery(null, text);
            });
        }

        function handleUserQuery(presetKey, userText) {
            // Add user message to UI
            appendMessage(userText, 'user');

            // Show typing indicator
            const typingEl = showTypingIndicator();

            setTimeout(() => {
                removeTypingIndicator(typingEl);
                generateBotResponse(presetKey, userText);
            }, 600);
        }

        function generateBotResponse(presetKey, text) {
            const lower = (text || '').toLowerCase();
            const currentBrand = getActiveBrandName();

            // 1. Check presets
            if (presetKey === 'tour' || lower.includes('tour') || lower.includes('visit') || lower.includes('view') || lower.includes('see')) {
                appendMessage(RESPONSES.tour.text.replace('Premier Realty', currentBrand), 'bot', RESPONSES.tour.chips);
                return;
            }

            if (presetKey === 'valuation' || lower.includes('valuation') || lower.includes('worth') || lower.includes('sell') || lower.includes('equity') || lower.includes('cma')) {
                appendMessage(RESPONSES.valuation.text.replace('Premier Realty', currentBrand), 'bot', RESPONSES.valuation.chips);
                return;
            }

            if (presetKey === 'budget' || lower.includes('budget') || lower.includes('price') || lower.includes('cost') || lower.includes('afford') || lower.includes('listing')) {
                appendMessage(RESPONSES.budget.text.replace('Premier Realty', currentBrand), 'bot', RESPONSES.budget.chips);
                return;
            }

            if (presetKey === 'agent' || lower.includes('agent') || lower.includes('call') || lower.includes('phone') || lower.includes('contact') || lower.includes('broker') || lower.includes('speak')) {
                appendMessage(RESPONSES.agent.text.replace('Premier Realty', currentBrand), 'bot', RESPONSES.agent.chips);
                return;
            }

            // 2. Email or Phone detection
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
            const phoneRegex = /\b(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/;

            if (emailRegex.test(text) || phoneRegex.test(text)) {
                appendMessage(`Thank you! I've logged your contact information. A licensed advisor from <strong>${escapeHtml(currentBrand)}</strong> will contact you shortly with personalized details.`, 'bot', ["📅 Schedule a Tour", "💰 Get Home Valuation"]);
                return;
            }

            // 3. Greeting
            if (/^(hi|hello|hey|good morning|good afternoon|howdy)/i.test(lower)) {
                appendMessage(`Hello! Welcome to <strong>${escapeHtml(currentBrand)}</strong>. How can I assist with your home search or property sale today?`, 'bot', ["📅 Schedule a Home Tour", "💰 Get a Free Home Valuation", "📞 Connect with an Agent"]);
                return;
            }

            // 4. Default intelligent fallback
            appendMessage(`Thanks for asking! At <strong>${escapeHtml(currentBrand)}</strong>, we specialize in seamless home buying, property listings, and local market guidance. Would you like to schedule a property tour, value your current home, or speak directly with an agent?`, 'bot', [
                "📅 Schedule a Home Tour",
                "💰 Get a Free Home Valuation",
                "📍 Find Homes by Budget & City",
                "📞 Connect with an Agent"
            ]);
        }

        function appendMessage(text, sender, chips) {
            if (!messagesContainer) return;

            const msgDiv = document.createElement('div');
            msgDiv.className = `chatbot-msg chatbot-msg-${sender}`;

            if (sender === 'bot') {
                msgDiv.innerHTML = `
                    <div class="chatbot-bubble bot-bubble">
                        <div class="bot-bubble-text">${text}</div>
                    </div>
                `;

                if (chips && chips.length > 0) {
                    const chipsContainer = document.createElement('div');
                    chipsContainer.className = 'chatbot-dynamic-chips';
                    chips.forEach(chipText => {
                        const chipBtn = document.createElement('button');
                        chipBtn.type = 'button';
                        chipBtn.className = 'chatbot-chip-btn';
                        chipBtn.textContent = chipText;
                        chipBtn.addEventListener('click', () => {
                            handleUserQuery(null, chipText);
                        });
                        chipsContainer.appendChild(chipBtn);
                    });
                    msgDiv.appendChild(chipsContainer);
                }
            } else {
                msgDiv.innerHTML = `
                    <div class="chatbot-bubble user-bubble">
                        <div class="user-bubble-text">${escapeHtml(text)}</div>
                    </div>
                `;
            }

            messagesContainer.appendChild(msgDiv);
            scrollToBottom();
        }

        function showTypingIndicator() {
            const typing = document.createElement('div');
            typing.className = 'chatbot-msg chatbot-msg-bot chatbot-typing-wrapper';
            typing.innerHTML = `
                <div class="chatbot-bubble bot-bubble typing-bubble">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            `;
            messagesContainer.appendChild(typing);
            scrollToBottom();
            return typing;
        }

        function removeTypingIndicator(el) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }

        function scrollToBottom() {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>"']/g, function (m) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[m];
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
