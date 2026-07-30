/* ==========================================================
REINSTEINS — VOICE ASSISTANT DEMO
Real microphone input (Web Speech API) + spoken responses
(SpeechSynthesis), answering a small set of questions about
Reinsteins Technologies & Solutions. This is a lightweight,
fully client-side demo — not a connected LLM — but it genuinely
listens and genuinely talks back.
========================================================== */

(function () {

    const micBtn = document.getElementById("aiMicBtn");
    const textInput = document.getElementById("aiTextInput");
    const statusText = document.getElementById("aiStatusText");
    const note = document.getElementById("aiNote");
    const bubble = document.getElementById("aiResponseBubble");
    const waveform = document.getElementById("aiWaveform");

    if (!micBtn || !textInput) return;

    window.aiVoiceState = "idle";

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    let recognition = null;
    let isListening = false;

    /* ---------- Knowledge base ---------- */

    function escapeRegex(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function makeMatcher(keywords) {
        const pattern = keywords.map(k => "\\b" + escapeRegex(k.trim()) + "\\b").join("|");
        return new RegExp(pattern, "i");
    }

    const knowledgeBase = [
        {
            match: makeMatcher(["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]),
            reply: "Hello! I'm the Reinsteins voice assistant. Ask me about our services, technologies, or say \"contact\" and I'll take you to our team."
        },
        {
            match: makeMatcher(["service", "services", "what do you do", "what do you offer", "offer"]),
            reply: "We build AI platforms, cloud infrastructure, cybersecurity solutions, DevOps automation, data analytics, and custom software for startups and enterprises."
        },
        {
            match: makeMatcher(["artificial intelligence", "machine learning", "ai"]),
            reply: "We design and deploy AI-powered automation, machine learning models, and generative AI applications for real business workflows."
        },
        {
            match: makeMatcher(["cloud"]),
            reply: "We handle cloud migration and infrastructure on AWS, Microsoft Azure, and Google Cloud, moving legacy systems to secure, scalable environments."
        },
        {
            match: makeMatcher(["security", "cyber", "cybersecurity", "hack", "secure"]),
            reply: "Our cybersecurity team covers security operations, vulnerability assessments, firewalls, and real-time threat monitoring."
        },
        {
            match: makeMatcher(["technology", "technologies", "tech stack", "programming", "languages"]),
            reply: "Our stack spans Python, React, Node dot js, cloud platforms, DevOps tooling, and a dozen other modern technology domains — scroll down to see the full list."
        },
        {
            match: makeMatcher(["industry", "industries"]),
            reply: "We serve manufacturing, healthcare, banking, retail, education, and startups, among other industries."
        },
        {
            match: makeMatcher(["contact", "talk to someone", "human", "consultation", "reach you", "email", "phone number"]),
            reply: "Sure — let's get you to our team. Scrolling you to the contact form now."
        },
        {
            match: makeMatcher(["who are you", "what are you", "your name"]),
            reply: "I'm a small voice demo built by Reinsteins Technologies & Solutions to show the kind of conversational AI experiences we build for clients."
        },
        {
            match: makeMatcher(["thank", "thanks", "thank you"]),
            reply: "You're very welcome! Let me know if there's anything else you'd like to know."
        },
        {
            match: makeMatcher(["bye", "goodbye", "see you"]),
            reply: "Goodbye! Have a great day."
        }
    ];

    const fallbackReply = "I'm a lightweight demo, so I don't have a scripted answer for that yet — but our team would love to help directly. Want me to take you to the contact form?";

    function getReply(userText) {

        for (const entry of knowledgeBase) {
            if (entry.match.test(userText)) {
                return entry.reply;
            }
        }

        return fallbackReply;
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

    /* ---------- Core respond flow ---------- */

    function respond(userText) {

        if (!userText || !userText.trim()) return;

        const reply = getReply(userText);
        const wantsContact = /contact|talk to someone|human|consultation|reach you/i.test(userText);

        setSpeaking();
        showBubble(reply);

        if (synth) {

            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(reply);
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => {
                setIdle();
                if (wantsContact) scrollToContact();
            };

            utterance.onerror = () => {
                setIdle();
                if (wantsContact) scrollToContact();
            };

            synth.speak(utterance);

        } else {

            const readTime = Math.max(1600, reply.length * 45);
            setTimeout(() => {
                setIdle();
                if (wantsContact) scrollToContact();
            }, readTime);

        }
    }

    function scrollToContact() {
        const contact = document.querySelector("#contact");
        if (contact) {
            setTimeout(() => contact.scrollIntoView({ behavior: "smooth" }), 400);
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
