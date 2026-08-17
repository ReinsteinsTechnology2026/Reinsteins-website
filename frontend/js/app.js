/* ==========================================
REINSTEINS TECHNOLOGY V2
========================================== */

/* Loader */

window.addEventListener("load", function () {

    const preloader = document.getElementById("preloader");

    preloader.classList.add("hide");

});

/* Scroll Progress Bar */

const scrollProgress = document.getElementById("scrollProgress");

if (scrollProgress) {

    window.addEventListener("scroll", () => {

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        scrollProgress.style.width = pct + "%";

    });

}

/* Sticky Navbar */

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.boxShadow = "0 15px 35px rgba(0,0,0,.08)";
        header.style.background = "rgba(247,244,237,.95)";

    } else {

        header.style.boxShadow = "none";
        header.style.background = "rgba(247,244,237,.88)";

    }

});

/* Mobile Menu */

const menuBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

if(menuBtn){

menuBtn.addEventListener("click",()=>{

navMenu.classList.toggle("mobile-menu");

});

}

/* Smooth Scroll */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

const target=document.querySelector(this.getAttribute("href"));

if(target){

e.preventDefault();

target.scrollIntoView({

behavior:"smooth"

});

if(navMenu){

navMenu.classList.remove("mobile-menu");

}

}

});

});

/* Scroll Reveal (staggered per-card) */

const revealSelectors = ".service-card, .project-card, .tech-item, .value-card, .process-card, .stat-card, .mission-card, .faq-card, .team-photo-card, .about-card, .contact-feature";

document.querySelectorAll(revealSelectors).forEach((card) => {

    card.classList.add("reveal-up");

    const siblings = Array.from(card.parentElement.children).filter(el => el.classList.contains(card.classList[0]) || el.matches(revealSelectors));
    const index = siblings.indexOf(card);
    card.style.transitionDelay = Math.min(index, 6) * 0.09 + "s";

});

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
        }

    });

}, { threshold: .15 });

document.querySelectorAll(".reveal-up").forEach(el => revealObserver.observe(el));

/* Section fade-in (broad container motion, works alongside card-level reveal) */

const sectionObserver = new IntersectionObserver((entries) => {

entries.forEach(entry => {

if (entry.isIntersecting) {

entry.target.style.opacity = "1";
entry.target.style.transform = "translateY(0)";

}

});

}, { threshold: .1 });

document.querySelectorAll("section").forEach(section => {

section.style.opacity = "0";
section.style.transform = "translateY(40px)";
section.style.transition = "opacity .8s ease, transform .8s ease";

sectionObserver.observe(section);

});

/* Subtle 3D tilt on hover (desktop only) */

if (window.matchMedia("(pointer: fine)").matches) {

    document.querySelectorAll(".service-card, .project-card, .tech-item, .stat-card").forEach(card => {

        card.style.transformStyle = "preserve-3d";

        card.addEventListener("mousemove", (e) => {

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -8;
            const rotateY = ((x / rect.width) - 0.5) * 8;

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "";

        });

    });

}

/* Counter */

const stats=document.querySelectorAll(".stat-card h1");

let counterStarted=false;

window.addEventListener("scroll",()=>{

const statistics=document.querySelector(".statistics");

if(!statistics)return;

const position=statistics.getBoundingClientRect().top;

if(position<window.innerHeight && !counterStarted){

counterStarted=true;

stats.forEach(counter=>{

const finalText=counter.innerText;

const finalNumber=parseInt(finalText.replace(/\D/g,""));

const suffix=finalText.replace(/[0-9]/g,"");

let count=0;

const speed=Math.max(15,2000/finalNumber);

const update=()=>{

count++;

counter.innerText=count+suffix;

if(count<finalNumber){

setTimeout(update,speed);

}else{

counter.innerText=finalText;

}

};

update();

});

}

});

/* Back To Top */

const btn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 300);
});

btn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* Newsletter */

const newsletter=document.querySelector(".newsletter-form");

if(newsletter){

newsletter.addEventListener("submit",(e)=>{

e.preventDefault();

alert("Successfully subscribed!");

newsletter.reset();

});

}
/* ==========================================================
LOGIN PAGE
========================================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.querySelector('#loginForm input[type="email"]').value.trim();
        const password = document.querySelector('#loginForm input[type="password"]').value;

        if (email === "" || password === "") {

            alert("Please enter email and password.");
            return;

        }

        alert("Login Successful!");

        window.location.href = "index.html";

    });

}

/* =================================================

feedback message

====================================================*/

const successPopup = document.getElementById("successPopup");
const closePopup = document.getElementById("closePopup");

if (closePopup) {

    closePopup.addEventListener("click", () => {

        successPopup.classList.remove("show");

    });

}

/* ==========================================================
CONTACT FORM
========================================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const submitButton = contactForm.querySelector("button");
        submitButton.disabled = true;
        submitButton.innerText = "Sending...";

        const data = {

            full_name: document.getElementById("full_name").value.trim(),

            email: document.getElementById("email").value.trim(),

            phone: document.getElementById("phone").value.trim(),

            company: document.getElementById("company").value.trim(),

            message: document.getElementById("message").value.trim()

        };

        try {

            const response = await fetch("https://reinsteins-website.vercel.app/contact", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });

            const result = await response.json();

            console.log("API Response:", result);

            if (response.ok) {

                contactForm.reset();

                successPopup.classList.add("show");

            } else {

                console.log(result);
                alert(JSON.stringify(result, null, 2));

            }

        } catch (error) {

            console.error("Fetch Error:", error);

            alert("Unable to connect to the server.\n\n" + error);

        } finally {

            submitButton.disabled = false;
            submitButton.innerText = "Request a Consultation";

        }

    });

}

/* ==========================================================
RESUME SUBMISSION MODAL
========================================================== */

const resumeModal = document.getElementById("resumeModal");
const openResumeModalBtn = document.getElementById("openResumeModalBtn");
const closeResumeModal = document.getElementById("closeResumeModal");
const resumeForm = document.getElementById("resumeForm");
const resumeFormView = document.getElementById("resumeFormView");
const resumeSuccessView = document.getElementById("resumeSuccessView");
const resumeFileInput = document.getElementById("resumeFile");
const resumeUploadLabel = document.getElementById("resumeUploadLabel");
const resumeFileNameText = document.getElementById("resumeFileName");
const resumeError = document.getElementById("resumeError");

const MAX_RESUME_SIZE = 2 * 1024 * 1024; // 2MB
const DEFAULT_RESUME_LABEL = "Upload Your Resume (PDF or Word, max 2MB)";

function resetResumeModal() {

    if (resumeForm) resumeForm.reset();

    if (resumeError) resumeError.textContent = "";

    if (resumeUploadLabel) resumeUploadLabel.classList.remove("has-file");

    if (resumeFileNameText) resumeFileNameText.textContent = DEFAULT_RESUME_LABEL;

    if (resumeFormView) resumeFormView.style.display = "";

    if (resumeSuccessView) resumeSuccessView.classList.remove("show");

}

if (openResumeModalBtn && resumeModal) {

    openResumeModalBtn.addEventListener("click", () => {
        resumeModal.classList.add("show");
    });

}

if (closeResumeModal && resumeModal) {

    closeResumeModal.addEventListener("click", () => {
        resumeModal.classList.remove("show");
        resetResumeModal();
    });

    resumeModal.addEventListener("click", (e) => {

        if (e.target === resumeModal) {
            resumeModal.classList.remove("show");
            resetResumeModal();
        }

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape" && resumeModal.classList.contains("show")) {
            resumeModal.classList.remove("show");
            resetResumeModal();
        }

    });

}

if (resumeFileInput) {

    resumeFileInput.addEventListener("change", () => {

        const file = resumeFileInput.files[0];

        resumeError.textContent = "";

        if (file) {

            if (file.size > MAX_RESUME_SIZE) {

                resumeError.textContent = "File size must not exceed 2MB. Please choose a smaller file.";
                resumeFileInput.value = "";
                resumeUploadLabel.classList.remove("has-file");
                resumeFileNameText.textContent = DEFAULT_RESUME_LABEL;
                return;

            }

            resumeUploadLabel.classList.add("has-file");
            resumeFileNameText.textContent = file.name;

        }

    });

}

if (resumeForm) {

    resumeForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const file = resumeFileInput.files[0];

        if (!file) {
            resumeError.textContent = "Please attach your resume.";
            return;
        }

        if (file.size > MAX_RESUME_SIZE) {
            resumeError.textContent = "File size must not exceed 2MB.";
            return;
        }

        resumeError.textContent = "";

        const submitButton = document.getElementById("resumeSubmitBtn");
        submitButton.disabled = true;
        submitButton.innerText = "Submitting...";

        const formData = new FormData();
        formData.append("subject", document.getElementById("resumeSubject").value.trim());
        formData.append("name", document.getElementById("resumeName").value.trim());
        formData.append("description", document.getElementById("resumeDescription").value.trim());
        formData.append("resume", file);

        try {

            const response = await fetch("https://reinsteins-website.vercel.app/careers/apply", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok) {

                resumeFormView.style.display = "none";
                resumeSuccessView.classList.add("show");

            } else {

                resumeError.textContent = result.detail || "Something went wrong. Please try again.";

            }

        } catch (error) {

            console.error("Resume Submission Error:", error);
            resumeError.textContent = "Unable to connect to the server. Please try again later.";

        } finally {

            submitButton.disabled = false;
            submitButton.innerText = "Submit Application";

        }

    });

}