/* ==========================================================
REINSTEINS — ANIMATED AI HEAD
Rotating wireframe "AI head" with glowing eyes and a subtle
speaking pulse, rendered with Three.js. Falls back to a pure
CSS spinning ring if Three.js / WebGL isn't available, so the
section never breaks.
========================================================== */

(function () {

    const stage = document.getElementById("aiHeadStage");
    const canvas = document.getElementById("aiHeadCanvas");

    if (!stage || !canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showFallback() {
        canvas.remove();
        const fb = document.createElement("div");
        fb.className = "ai-head-fallback";
        stage.appendChild(fb);
    }

    if (typeof THREE === "undefined") {
        showFallback();
        return;
    }

    let renderer;

    try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (err) {
        showFallback();
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    function sizeRenderer() {
        const size = stage.clientWidth || 320;
        renderer.setSize(size, size, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }

    sizeRenderer();
    window.addEventListener("resize", sizeRenderer);

    const gold = 0xB19463;
    const cream = 0xEDE6D8;

    /* Head group */
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    /* Outer wireframe shell (the "head") */
    const shellGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const shellEdges = new THREE.EdgesGeometry(shellGeo);
    const shellMat = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.55 });
    const shell = new THREE.LineSegments(shellEdges, shellMat);
    headGroup.add(shell);

    /* Inner solid core for depth */
    const coreGeo = new THREE.IcosahedronGeometry(1.55, 1);
    const coreMat = new THREE.MeshPhongMaterial({
        color: 0x121212,
        transparent: true,
        opacity: 0.85,
        shininess: 40
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    headGroup.add(core);

    /* Eyes */
    const eyeGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: cream });

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.55, 0.25, 1.35);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat.clone());
    eyeR.position.set(0.55, 0.25, 1.35);
    headGroup.add(eyeR);

    /* Halo ring, tilted, rotates on its own axis for extra motion */
    const ringGeo = new THREE.TorusGeometry(2.3, 0.015, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
    ring2.scale.set(0.7, 0.7, 0.7);
    ring2.rotation.x = -Math.PI / 3;
    ring2.material.opacity = 0.22;
    scene.add(ring2);

    /* Lighting */
    const keyLight = new THREE.PointLight(cream, 1.1);
    keyLight.position.set(3, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(gold, 0.6);
    fillLight.position.set(-3, -2, 3);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0x404040, 1.2));

    /* Animation loop */
    const clock = new THREE.Clock();
    let frameId;

    function animate() {

        frameId = requestAnimationFrame(animate);

        const t = clock.getElapsedTime();
        const speed = reduceMotion ? 0.12 : 1;

        const voiceState = window.aiVoiceState || "idle";
        const rotSpeed = voiceState === "speaking" ? 0.9 : voiceState === "listening" ? 0.6 : 0.45;
        const pulseSpeed = voiceState === "speaking" ? 9 : voiceState === "listening" ? 7 : 4.2;

        headGroup.rotation.y = t * rotSpeed * speed;
        headGroup.position.y = Math.sin(t * 1.1) * 0.08;

        ring.rotation.z = t * 0.25 * speed;
        ring2.rotation.z = -t * 0.35 * speed;

        /* "speaking" pulse — eyes brighten/dim like they're talking */
        const pulse = 0.6 + Math.abs(Math.sin(t * pulseSpeed)) * 0.4;
        eyeL.scale.setScalar(pulse);
        eyeR.scale.setScalar(pulse);

        renderer.render(scene, camera);

    }

    animate();

    /* Pause rendering when the section is off-screen to save resources */
    const io = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                if (!frameId) animate();
            } else {
                cancelAnimationFrame(frameId);
                frameId = null;
            }

        });

    }, { threshold: 0.05 });

    io.observe(stage);

})();
