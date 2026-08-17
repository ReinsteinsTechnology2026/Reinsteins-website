/* ==========================================================
REINSTEINS — VOICE ASSISTANT
Real microphone input (Web Speech API) + spoken responses
(SpeechSynthesis). Fully client-side — no external API, no
running cost. Understands a broad range of topics about
Reinsteins, scores multiple possible matches per message,
remembers the last topic for natural follow-ups ("tell me
more", "and pricing?"), can act on the page (scrolling to the
relevant section or navigating), and offers clickable
follow-up suggestions after each reply.
========================================================== */

(function () {

    const micBtn = document.getElementById("aiMicBtn");
    const textInput = document.getElementById("aiTextInput");
    const statusText = document.getElementById("aiStatusText");
    const note = document.getElementById("aiNote");
    const bubble = document.getElementById("aiResponseBubble");
    const waveform = document.getElementById("aiWaveform");
    const suggestions = document.getElementById("aiSuggestions");

    if (!micBtn || !textInput) return;

    window.aiVoiceState = "idle";

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    let recognition = null;
    let isListening = false;
    let lastTopic = null;

    /* ---------- Text normalization & matching ---------- */

    function normalize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function escapeRegex(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Word-boundary matching so short keywords ("hi", "ai") can't false-match
    // inside unrelated longer words ("hiring", "said"). Longer, less ambiguous
    // words additionally tolerate a common suffix so "startup" still matches
    // "startups" — short words skip this since e.g. "hi" + "s" would wrongly
    // match "his".
    function keywordRegex(keyword) {
        const pattern = keyword
            .split(" ")
            .map(word => {
                const escaped = escapeRegex(word);
                return word.length >= 3 ? escaped + "(?:s|es|ing|ed)?" : escaped;
            })
            .join("\\s+");
        return new RegExp("\\b" + pattern + "\\b", "i");
    }

    function scoreTopic(normalizedText, topic) {

        let score = 0;

        for (const keyword of topic.keywords) {

            if (keywordRegex(keyword).test(normalizedText)) {
                // multi-word keywords are more specific — weight them higher
                score += keyword.split(" ").length;
            }

        }

        return score;
    }

    function findBestTopic(userText) {

        const normalized = normalize(userText);
        let best = null;
        let bestScore = 0;

        for (const topic of knowledgeBase) {

            const score = scoreTopic(normalized, topic);

            if (score > bestScore) {
                bestScore = score;
                best = topic;
            }

        }

        return best;
    }

    const followUpPattern = /^(tell me more|more|and|what about (it|that)|go on|continue|really|why|elaborate|explain|details|detail)\b/;

    function looksLikeFollowUp(userText) {
        const normalized = normalize(userText);
        return followUpPattern.test(normalized) && normalized.split(" ").length <= 6;
    }

    /* ---------- Actions the assistant can take on the page ---------- */

    function scrollToSelector(selector) {
        const el = document.querySelector(selector);
        if (el) {
            setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 500);
        }
    }

    function navigateTo(url) {
        setTimeout(() => { window.location.href = url; }, 900);
    }

    /* ---------- Knowledge base ---------- */

    const knowledgeBase = [
        {
            id: "greeting",
            keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"],
            reply: "Hello! I'm the Reinsteins assistant. Ask me about our services, technologies, industries, or our work — or say \"contact\" and I'll take you to our team.",
            chips: [
                { label: "Our Services", query: "What services do you offer?" },
                { label: "Technologies", query: "What technologies do you use?" },
                { label: "Case Studies", query: "Tell me about your case studies" },
                { label: "Contact Us", query: "I'd like to contact you" }
            ]
        },
        {
            id: "how_are_you",
            keywords: ["how are you", "how s it going", "what s up"],
            reply: "I'm running smoothly, thanks for asking! What would you like to know about Reinsteins?"
        },
        {
            id: "identity",
            keywords: ["who are you", "what are you", "your name", "are you human", "are you real", "are you a bot", "are you ai"],
            reply: "I'm the Reinsteins Technologies & Solutions website assistant — a built-in guide to help you explore our services, technologies, and work."
        },
        {
            id: "capabilities",
            keywords: ["what can you do", "help me", "can you help", "what do you know"],
            reply: "I can walk you through our services, technology stack, industries we serve, our case study, careers, and how to reach our team — just ask, or tap a suggestion below.",
            chips: [
                { label: "Our Services", query: "What services do you offer?" },
                { label: "About Reinsteins", query: "Tell me about Reinsteins" },
                { label: "Contact Us", query: "I'd like to contact you" }
            ]
        },
        {
            id: "about",
            keywords: ["about reinsteins", "who is reinsteins", "what is reinsteins", "tell me about your company", "about your company", "about you"],
            reply: "Reinsteins Technologies & Solutions is a technology company based in Chennai, India, helping startups, SMEs, and enterprises with digital transformation across AI, cloud, cybersecurity, and software engineering.",
            more: "We're guided by four values — innovation, integrity, collaboration, and excellence — and our mission is to build long-term partnerships through reliable, scalable technology.",
            action: () => scrollToSelector("#about"),
            chips: [
                { label: "Our Mission", query: "What is your mission?" },
                { label: "Our Values", query: "What are your values?" },
                { label: "Our Services", query: "What services do you offer?" }
            ]
        },
        {
            id: "mission",
            keywords: ["mission", "vision", "purpose", "goal as a company"],
            reply: "Our mission is to build long-term partnerships by delivering reliable, scalable, and innovative technology solutions that solve real business challenges. Our vision is to become a globally respected technology company.",
            action: () => scrollToSelector(".mission")
        },
        {
            id: "values",
            keywords: ["values", "principles", "culture", "what do you believe"],
            reply: "Four values guide everything we build: innovation, integrity, collaboration, and excellence.",
            action: () => scrollToSelector(".values")
        },
        {
            id: "ai_service",
            keywords: ["artificial intelligence", "machine learning", "ai service", "generative ai", "ml", "predictive analytics"],
            reply: "We build AI-powered automation, machine learning applications, and predictive analytics that turn real business workflows into smarter, faster processes.",
            more: "That includes everything from automation platforms to generative AI applications, depending on what a client needs.",
            chips: [
                { label: "See Case Study", href: "case-studies/student-management-portal-arckenites.html" },
                { label: "Contact Us", query: "I'd like to contact you" }
            ]
        },
        {
            id: "cloud_service",
            keywords: ["cloud", "aws", "azure", "google cloud", "cloud migration", "cloud infrastructure"],
            reply: "We design, migrate, and manage cloud environments on AWS, Microsoft Azure, and Google Cloud — moving legacy infrastructure to secure, scalable systems.",
            more: "That covers everything from a full migration off legacy servers to ongoing cloud infrastructure management."
        },
        {
            id: "cybersecurity_service",
            keywords: ["security", "cyber", "cybersecurity", "hack", "secure", "firewall", "vulnerability", "soc", "threat"],
            reply: "Our cybersecurity work covers security assessments, vulnerability management, network protection, and compliance support to keep business systems safe.",
            more: "We also handle real-time threat monitoring and security operations for clients who need ongoing protection, not just a one-time audit."
        },
        {
            id: "data_service",
            keywords: ["data analytics", "business intelligence", "dashboard", "reporting", "visualization", "data science"],
            reply: "We turn business data into meaningful insight through analytics, dashboards, reporting, and visualization built for real decision-making."
        },
        {
            id: "devops_service",
            keywords: ["devops", "automation", "ci cd", "docker", "kubernetes", "pipeline", "infrastructure automation"],
            reply: "We accelerate software delivery with CI/CD pipelines, Docker, Kubernetes, and infrastructure automation — modern deployment practices end to end."
        },
        {
            id: "network_service",
            keywords: ["network", "routing", "switching", "wireless", "network infrastructure"],
            reply: "We design, implement, and maintain enterprise networks — secure routing, switching, wireless connectivity, and infrastructure management."
        },
        {
            id: "marketing_service",
            keywords: ["digital marketing", "seo", "social media", "branding", "content strategy", "marketing"],
            reply: "We help businesses grow their online presence through SEO, social media marketing, branding, and content strategy."
        },
        {
            id: "software_service",
            keywords: ["software development", "web app", "mobile app", "custom software", "api", "enterprise software", "build an app"],
            reply: "We develop secure, scalable web applications, mobile applications, enterprise software, and APIs tailored to a business's needs.",
            chips: [
                { label: "See Case Study", href: "case-studies/student-management-portal-arckenites.html" }
            ]
        },
        {
            id: "services_overview",
            keywords: ["service", "what do you do", "what do you offer", "offerings", "capabilities as a company"],
            reply: "We offer artificial intelligence, cloud infrastructure, cybersecurity, data analytics, DevOps, network infrastructure, digital marketing, and custom software development.",
            more: "Ask me about any one of those directly — for example, \"tell me about cloud\" or \"what about cybersecurity\" — and I'll go deeper.",
            action: () => scrollToSelector("#services"),
            chips: [
                { label: "Artificial Intelligence", query: "Tell me about your AI services" },
                { label: "Cloud", query: "Tell me about cloud services" },
                { label: "Cybersecurity", query: "Tell me about cybersecurity" },
                { label: "Custom Software", query: "Tell me about custom software development" }
            ]
        },
        {
            id: "technology_stack",
            keywords: ["technology", "technologies", "tech stack", "programming language", "framework", "what tools do you use"],
            reply: "Our stack spans Python, Java, JavaScript and TypeScript, React and Next dot js, Node dot js, the major cloud platforms, Docker and Kubernetes, and a dozen other modern technology domains.",
            more: "Scroll down and you'll find the full breakdown — languages, frontend, backend, cloud, AI, data, DevOps, databases, networking, and more.",
            action: () => scrollToSelector("#technology")
        },
        {
            id: "manufacturing_industry",
            keywords: ["manufacturing", "smart factory"],
            reply: "In manufacturing, we help improve efficiency through automation, cloud solutions, AI, and smart factory technologies."
        },
        {
            id: "healthcare_industry",
            keywords: ["healthcare", "health care", "hospital", "patient care"],
            reply: "In healthcare, we build secure applications, digital transformation, and analytics solutions that support better patient care."
        },
        {
            id: "banking_industry",
            keywords: ["bank", "financial services", "fintech"],
            reply: "In banking and financial services, we build secure digital banking solutions, cybersecurity frameworks, data analytics, and cloud infrastructure."
        },
        {
            id: "retail_industry",
            keywords: ["retail", "e commerce", "ecommerce", "online store"],
            reply: "In retail and e-commerce, we build scalable platforms, digital marketing strategies, inventory systems, and customer engagement solutions."
        },
        {
            id: "education_industry",
            keywords: ["education", "edtech", "school", "training institute", "learning platform"],
            reply: "In education, we develop learning platforms, student management systems, and AI-powered education tools — our Arckenites case study is a good example.",
            chips: [
                { label: "See Case Study", href: "case-studies/student-management-portal-arckenites.html" }
            ]
        },
        {
            id: "startup_industry",
            keywords: ["startup", "sme", "small business", "enterprise client"],
            reply: "We support startups and growing businesses with scalable software, cloud infrastructure, automation, and technology consulting."
        },
        {
            id: "industries_overview",
            keywords: ["industry", "industries", "sector", "who do you work with", "what clients"],
            reply: "We serve manufacturing, healthcare, banking and financial services, retail and e-commerce, education, and startups and enterprises.",
            action: () => scrollToSelector("#industries"),
            chips: [
                { label: "Education", query: "Do you work with education clients?" },
                { label: "Healthcare", query: "Do you work with healthcare clients?" },
                { label: "Startups", query: "Do you work with startups?" }
            ]
        },
        {
            id: "case_study",
            keywords: ["case study", "case studies", "arckenites", "portfolio", "example of your work", "sample project", "have you built"],
            reply: "One example is a Student Management Portal we built from scratch for Arckenites, an EdTech client — a centralized system for managing student information and groups, delivered in about two months.",
            more: "The full write-up, including the challenge, our approach, and the results, is under Case Studies on the site.",
            action: () => scrollToSelector("#case-studies"),
            chips: [
                { label: "View Full Case Study", href: "case-studies/student-management-portal-arckenites.html" },
                { label: "Contact Us", query: "I'd like to contact you" }
            ]
        },
        {
            id: "process",
            keywords: ["process", "methodology", "how do you work", "your approach", "workflow", "steps"],
            reply: "Our process is simple and transparent: discover your goals, design the right architecture, develop a secure and modern solution, then deploy and continuously improve it.",
            action: () => scrollToSelector(".process")
        },
        {
            id: "location",
            keywords: ["location", "where are you located", "office", "address", "based", "city"],
            reply: "We're based in Chennai, Tamil Nadu, India."
        },
        {
            id: "contact",
            keywords: ["contact", "talk to someone", "human", "consultation", "reach you", "email address", "phone number", "get in touch", "speak to your team"],
            reply: "Sure — let's get you to our team. Scrolling you to the contact form now.",
            action: () => scrollToSelector("#contact")
        },
        {
            id: "careers",
            keywords: ["career", "job", "hiring", "vacancy", "work with you", "join your team", "apply"],
            reply: "We're always glad to hear from talented people. Taking you to our careers page now, where you can send your resume.",
            action: () => navigateTo("careers.html")
        },
        {
            id: "pricing",
            keywords: ["price", "pricing", "cost", "how much", "quote", "budget", "rates"],
            reply: "Pricing depends on the scope of the project, so I can't quote a number here — but our team can put together a proposal once they understand what you need.",
            action: () => scrollToSelector("#contact"),
            chips: [
                { label: "Contact Us", query: "I'd like to contact you" }
            ]
        },
        {
            id: "thanks",
            keywords: ["thank", "appreciate it"],
            reply: "You're very welcome! Let me know if there's anything else you'd like to know."
        },
        {
            id: "bye",
            keywords: ["bye", "goodbye", "see you", "that s all", "exit"],
            reply: "Goodbye! Have a great day."
        }
    ];

    const fallbackReply = "I don't have a scripted answer for that yet, but I can tell you about our services, technologies, industries, or case study — or connect you with our team directly.";
    const fallbackChips = [
        { label: "Our Services", query: "What services do you offer?" },
        { label: "Contact Us", query: "I'd like to contact you" }
    ];

    function resolveReply(userText) {

        // A genuine topic match always wins over a generic continuation
        // phrase — e.g. "what about pricing" should hit the pricing topic,
        // not be treated as a vague "tell me more" about whatever came before.
        const topic = findBestTopic(userText);

        if (topic) {

            lastTopic = topic;

            return {
                topic: topic,
                reply: topic.reply,
                chips: topic.chips || null
            };

        }

        if (looksLikeFollowUp(userText) && lastTopic) {

            return {
                topic: lastTopic,
                reply: lastTopic.more || (lastTopic.reply + " Want me to connect you with our team for more detail?"),
                chips: lastTopic.chips || fallbackChips
            };

        }

        return {
            topic: null,
            reply: fallbackReply,
            chips: fallbackChips
        };
    }

    /* ---------- UI state helpers ---------- */

    function setIdle() {
        window.aiVoiceState = "idle";
        micBtn.classList.remove("listening", "speaking");
        waveform.classList.remove("active", "speaking");
        statusText.textContent = "Tap the mic and say hello";
    }

    function setListening() {
        window.aiVoiceState = "listening";
        micBtn.classList.add("listening");
        micBtn.classList.remove("speaking");
        waveform.classList.add("active");
        waveform.classList.remove("speaking");
        statusText.textContent = "Listening…";
    }

    function setSpeaking() {
        window.aiVoiceState = "speaking";
        micBtn.classList.remove("listening");
        micBtn.classList.add("speaking");
        waveform.classList.remove("active");
        waveform.classList.add("speaking");
        statusText.textContent = "Responding…";
    }

    function showBubble(text) {
        bubble.textContent = text;
        bubble.classList.add("show");
    }

    function showSuggestions(chips) {

        suggestions.innerHTML = "";

        if (!chips || !chips.length) {
            suggestions.classList.remove("show");
            return;
        }

        chips.forEach(chip => {

            const el = chip.href ? document.createElement("a") : document.createElement("button");

            el.className = "ai-suggestion-chip";
            el.textContent = chip.label;

            if (chip.href) {
                el.href = chip.href;
            } else {
                el.type = "button";
                el.addEventListener("click", () => {
                    textInput.value = "";
                    respond(chip.query);
                });
            }

            suggestions.appendChild(el);

        });

        suggestions.classList.add("show");
    }

    /* ---------- Core respond flow ---------- */

    function respond(userText) {

        if (!userText || !userText.trim()) return;

        const resolved = resolveReply(userText);

        setSpeaking();
        showBubble(resolved.reply);
        showSuggestions(resolved.chips);

        const action = resolved.topic && resolved.topic.action;

        if (synth) {

            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(resolved.reply);
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => {
                setIdle();
                if (action) action();
            };

            utterance.onerror = () => {
                setIdle();
                if (action) action();
            };

            synth.speak(utterance);

        } else {

            const readTime = Math.max(1600, resolved.reply.length * 45);
            setTimeout(() => {
                setIdle();
                if (action) action();
            }, readTime);

        }
    }

    /* ---------- Speech recognition (mic) ---------- */

    if (!SpeechRecognitionAPI) {

        micBtn.disabled = true;
        note.textContent = "Voice input isn't supported in this browser — try Chrome or Edge, or just type below.";

    } else {

        micBtn.addEventListener("click", () => {

            if (isListening) {
                recognition && recognition.stop();
                return;
            }

            recognition = new SpeechRecognitionAPI();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                isListening = true;
                setListening();
                note.textContent = "";
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                textInput.value = transcript;
                respond(transcript);
            };

            recognition.onerror = (event) => {
                isListening = false;
                setIdle();

                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    note.textContent = "Microphone access was blocked — allow it in your browser settings to try voice input.";
                } else if (event.error === "no-speech") {
                    note.textContent = "Didn't catch that — tap the mic and try again.";
                } else {
                    note.textContent = "Voice input hit a snag — you can type your message instead.";
                }
            };

            recognition.onend = () => {
                isListening = false;
                if (window.aiVoiceState === "listening") setIdle();
            };

            try {
                recognition.start();
            } catch (err) {
                isListening = false;
                setIdle();
                note.textContent = "Couldn't start the microphone — you can type your message instead.";
            }

        });

    }

    /* ---------- Text fallback ---------- */

    textInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {
            const value = textInput.value;
            textInput.value = "";
            respond(value);
        }

    });

})();
