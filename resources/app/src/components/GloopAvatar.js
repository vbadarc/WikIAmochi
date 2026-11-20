/**
 * GloopAvatar.js - Renderizador 2.5D de alta gama para criatura gelatinosa (tipo Flubber)
 * Calidad gráfica de producción: iluminación volumétrica, translucidez, burbujas internas,
 * ojos con reflejos dinámicos, rubor en mejillas y física de deformación continua.
 */

import { SlimePhysics } from '../core/sensors/slimePhysics.js';

export class GloopAvatar {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.physics = new SlimePhysics();

        // Color del slime y paleta
        this.baseColor = options.color || '#00E676';
        this.secondaryColor = options.secondaryColor || '#00C853';
        this.lightColor = options.lightColor || '#A7FFEB';
        this.darkColor = options.darkColor || '#004D40';
        this.shadowColor = options.shadowColor || 'rgba(0, 230, 118, 0.55)';

        // Dimensiones del lienzo y radio de la mascota
        this.width = canvasElement.width;
        this.height = canvasElement.height;
        this.baseRadius = 90;

        // Optimización de RAM y GPU: limitar devicePixelRatio para evitar texturas gigantes en pantallas 1080p+
        this.setupCanvasDpi();

        // Mirada y pupilas
        this.lookAtX = 0;
        this.lookAtY = 0;
        this.targetLookX = 0;
        this.targetLookY = 0;

        // Estados faciales y animación
        this.isTalking = false;
        this.talkMouthOpen = 0;
        this.blinkProgress = 0; // 0 = abierto, 1 = cerrado
        this.lastBlinkTime = Date.now();
        this.expression = 'happy'; // 'happy', 'amazed', 'curious', 'sleepy'

        this.isRunning = false;
        this.isUserDragging = false;
        this.dragHistory = [];
        this.soundCtx = null;

        // Ajustar límites de rebote según el tamaño del canvas
        const boundX = Math.max(120, this.width * 0.42);
        const boundY = Math.max(140, this.height * 0.44);
        this.physics.setBounds(-boundX, boundX, -boundY, 0);

        // Conectar sonido orgánico de rebote con Web Audio API
        this.physics.onBounce = (speed) => this.playBounceSound(speed);

        this.canvas.style.cursor = 'grab';
        this.canvas.style.touchAction = 'none';

        this.initSensors();
        this.initInteractions();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.setupCanvasDpi(), { passive: true });
        }
    }

    setupCanvasDpi() {
        // En móviles y escritorios, adaptar el ancho y alto del canvas al tamaño real del contenedor (100% ancho de pantalla)
        // Limitar DPR a máx 1.5 para optimizar el rendimiento y memoria en pantallas 1080p+
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const rect = this.canvas.getBoundingClientRect();
        const displayW = rect.width > 0 ? rect.width : (typeof window !== 'undefined' ? window.innerWidth : 360);
        const displayH = rect.height > 0 ? rect.height : 220;

        const internalW = Math.round(displayW * dpr);
        const internalH = Math.round(displayH * dpr);
        if (internalW > 0 && internalH > 0 && (this.canvas.width !== internalW || this.canvas.height !== internalH)) {
            this.canvas.width = internalW;
            this.canvas.height = internalH;
            this.width = internalW;
            this.height = internalH;
            this.baseRadius = Math.round(Math.min(internalW * 0.25, internalH * 0.36));

            if (this.physics) {
                // Límites de rebote elásticos exactos hasta los bordes de la pantalla
                const boundX = Math.max(120, (this.width / 2) - this.baseRadius - 10);
                const boundY = Math.max(60, (this.height / 2) - this.baseRadius - 10);
                this.physics.setBounds(-boundX, boundX, -boundY, 0);
            }
        }
    }

    playBounceSound(speed = 6) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!this.soundCtx) this.soundCtx = new AudioCtx();
            if (this.soundCtx.state === 'suspended') this.soundCtx.resume();

            const ctx = this.soundCtx;
            const now = ctx.currentTime;

            // Oscilador elástico tipo "boing / ploop" de caricatura
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            const intensity = Math.min(1.0, Math.max(0.2, speed / 26));
            const baseFreq = 160 + Math.random() * 35;
            const peakFreq = 320 + intensity * 260;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.04);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.16);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900 + intensity * 1200, now);
            filter.Q.setValueAtTime(3.5, now);

            const volume = Math.min(0.35, 0.08 + intensity * 0.22);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.20);
        } catch (e) { }
    }

    playSquishSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!this.soundCtx) this.soundCtx = new AudioCtx();
            if (this.soundCtx.state === 'suspended') this.soundCtx.resume();

            const ctx = this.soundCtx;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) { }
    }

    initSensors() {
        if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                const acc = e.accelerationIncludingGravity;
                if (acc && acc.x !== null) {
                    this.physics.applyAccelerometer(acc.x, acc.y, acc.z);
                }
            });
        }
    }

    initInteractions() {
        const getLocalCoords = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width > 0 ? this.width / rect.width : 1;
            const scaleY = rect.height > 0 ? this.height / rect.height : 1;
            return {
                x: (clientX - rect.left) * scaleX - this.width / 2,
                y: (clientY - rect.top) * scaleY - (this.height / 2 + 10)
            };
        };

        this.canvas.addEventListener('pointerdown', (e) => {
            const coords = getLocalCoords(e.clientX, e.clientY);
            const distFromSlime = Math.hypot(coords.x - this.physics.x, coords.y - this.physics.y);
            const grabRadius = Math.max(90, this.baseRadius * 1.15);

            // Si el toque es sobre el cuerpo del slime, agarrarlo
            if (distFromSlime < grabRadius) {
                this.isUserDragging = true;
                this.canvas.style.cursor = 'grabbing';
                this.physics.startDrag(coords.x, coords.y);
                this.dragHistory = [{ x: coords.x, y: coords.y, t: performance.now() }];
                this.playSquishSound();
            } else {
                // Toque exterior: mirada hacia el toque y poke
                this.targetLookX = Math.max(-18, Math.min(18, coords.x * 0.12));
                this.targetLookY = Math.max(-14, Math.min(14, coords.y * 0.12));
                this.physics.poke(coords.x * 0.02, 0.38);
            }
        });

        window.addEventListener('pointermove', (e) => {
            const coords = getLocalCoords(e.clientX, e.clientY);

            if (this.isUserDragging) {
                this.physics.updateDrag(coords.x, coords.y);
                this.targetLookX = Math.max(-16, Math.min(16, (coords.x - this.physics.x) * 0.15));
                this.targetLookY = Math.max(-14, Math.min(14, (coords.y - this.physics.y) * 0.15));

                const now = performance.now();
                this.dragHistory.push({ x: coords.x, y: coords.y, t: now });
                // Mantener solo los últimos 120 ms para cálculo preciso de inercia
                while (this.dragHistory.length > 2 && now - this.dragHistory[0].t > 120) {
                    this.dragHistory.shift();
                }
            } else {
                // Mirada suave que sigue al cursor
                this.targetLookX = Math.max(-16, Math.min(16, coords.x * 0.05));
                this.targetLookY = Math.max(-12, Math.min(12, coords.y * 0.05));
            }
        });

        const handleRelease = (e) => {
            if (!this.isUserDragging) return;
            this.isUserDragging = false;
            this.canvas.style.cursor = 'grab';

            let throwVx = 0;
            let throwVy = 0;

            if (this.dragHistory.length >= 2) {
                const first = this.dragHistory[0];
                const last = this.dragHistory[this.dragHistory.length - 1];
                const dt = Math.max(10, last.t - first.t);
                // Velocidad en píxeles por fotograma (~16ms)
                throwVx = ((last.x - first.x) / dt) * 16;
                throwVy = ((last.y - first.y) / dt) * 16;
            }

            this.physics.releaseDrag(throwVx, throwVy);
            this.dragHistory = [];
        };

        window.addEventListener('pointerup', handleRelease);
        window.addEventListener('pointercancel', handleRelease);
    }

    /**
     * Cambia la paleta de colores del slime con rebote alegre
     */
    setColorTheme(theme) {
        if (!theme) return;
        this.baseColor = theme.base;
        this.secondaryColor = theme.secondary;
        this.lightColor = theme.light;
        this.darkColor = theme.dark;
        this.shadowColor = theme.shadow;
        // Pequeño rebote festivo al cambiar de color
        this.physics.poke(0, 0.35);
    }

    /**
     * Provoca una sacudida con mareo y bamboleo elástico
     */
    shake() {
        this.physics.shake();
    }

    start() {
        this.isRunning = true;
        let lastTime = performance.now();

        const loop = (currentTime) => {
            if (!this.isRunning) return;
            const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
            lastTime = currentTime;

            this.update(dt);
            this.draw();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    stop() {
        this.isRunning = false;
    }

    update(dt) {
        this.physics.update(dt);

        // Suavizado de la mirada (Interpolación LERP)
        this.lookAtX += (this.targetLookX - this.lookAtX) * 0.12;
        this.lookAtY += (this.targetLookY - this.lookAtY) * 0.12;

        // Ciclo de parpadeo natural
        const now = Date.now();
        if (now - this.lastBlinkTime > 3800) {
            this.blinkProgress = 1.0;
            this.lastBlinkTime = now;
        } else if (this.blinkProgress > 0) {
            this.blinkProgress -= dt * 6.5;
            if (this.blinkProgress < 0) this.blinkProgress = 0;
        }

        // Animación labial al hablar
        if (this.isTalking) {
            this.talkMouthOpen = Math.abs(Math.sin(now / 100)) * 22;
        } else {
            this.talkMouthOpen = 0;
        }
    }

    draw() {
        const ctx = this.ctx;
        const centerX = this.width / 2 + this.physics.x;
        // Posicionar el centro vertical ligeramente más abajo del centro para que la coronilla nunca se corte
        const centerY = this.height / 2 + 10 + this.physics.y;
        const r = this.baseRadius;

        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Sombra suave de contacto difusa (Ambient Occlusion)
        ctx.save();
        const shadowScale = this.physics.scaleX * (1 - Math.abs(this.physics.y) * 0.004);
        ctx.beginPath();
        ctx.ellipse(this.width / 2, this.height - 35, r * 0.95 * shadowScale, 16 * shadowScale, 0, 0, Math.PI * 2);
        const shadowGrad = ctx.createRadialGradient(this.width / 2, this.height - 35, 10, this.width / 2, this.height - 35, r * 0.95 * shadowScale);
        shadowGrad.addColorStop(0, 'rgba(0, 77, 64, 0.28)');
        shadowGrad.addColorStop(0.7, 'rgba(0, 77, 64, 0.10)');
        shadowGrad.addColorStop(1, 'rgba(0, 77, 64, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fill();
        ctx.restore();

        // 2. Sistema de coordenadas centrado en la criatura
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(this.physics.scaleX, this.physics.scaleY);

        // 3. Masa gelatinosa externa con iluminación volumétrica 2.5D
        this.drawJellyBody(ctx, r);

        // 4. Burbujas internas flotantes dentro de la gelatina
        this.drawInternalBubbles(ctx);

        // 5. Brillo cáustico y reflejos especulares curvos
        this.drawSpecularHighlights(ctx, r);

        // 6. Ojos expresivos de alta gama
        const eyeSpacing = 36;
        const eyeY = -18;
        const eyeRadius = 24;

        this.drawStylizedEye(ctx, -eyeSpacing, eyeY, eyeRadius);
        this.drawStylizedEye(ctx, eyeSpacing, eyeY, eyeRadius);

        // 7. Rubor en las mejillas (Chubby Cute Blush)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing - 14, eyeY + 28, 14, 8, -0.1, 0, Math.PI * 2);
        ctx.ellipse(eyeSpacing + 14, eyeY + 28, 14, 8, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 64, 129, 0.22)';
        ctx.fill();
        ctx.restore();

        // 8. Boca expresiva
        this.drawExpressiveMouth(ctx, 0, eyeY + 36);

        ctx.restore();
    }

    drawJellyBody(ctx, r) {
        // Silueta orgánica del Flubber
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.08);
        ctx.bezierCurveTo(r * 1.18, -r * 0.95, r * 1.28, r * 0.85, 0, r * 0.96);
        ctx.bezierCurveTo(-r * 1.28, r * 0.85, -r * 1.18, -r * 0.95, 0, -r * 1.08);
        ctx.closePath();

        // Degradado esférico tridimensional dinámico
        const bodyGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.05, 0, 10, r * 1.25);
        bodyGrad.addColorStop(0, this.lightColor);      // Reflejo central luminoso
        bodyGrad.addColorStop(0.2, this.baseColor);     // Color base vibrante
        bodyGrad.addColorStop(0.65, this.secondaryColor);// Tono medio profundo
        bodyGrad.addColorStop(0.92, this.darkColor);    // Contorno translúcido
        bodyGrad.addColorStop(1, this.darkColor);       // Borde sombreado

        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = 32;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Borde interior sutil (Fresnel Rim Lighting)
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.lightColor;
        ctx.stroke();
    }

    drawInternalBubbles(ctx) {
        ctx.save();
        for (const b of this.physics.bubbles) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
            ctx.fill();

            // Pequeño brillo en cada burbuja
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();
        }
        ctx.restore();
    }

    drawSpecularHighlights(ctx, r) {
        ctx.save();
        // Brillo principal superior curvo (Highlight esférico)
        ctx.beginPath();
        ctx.ellipse(-r * 0.32, -r * 0.52, r * 0.32, r * 0.16, -Math.PI / 3.8, 0, Math.PI * 2);
        const shineGrad = ctx.createLinearGradient(-r * 0.5, -r * 0.7, -r * 0.1, -r * 0.3);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        shineGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.35)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.fill();

        // Brillo secundario inferior (Luz reflejada)
        ctx.beginPath();
        ctx.ellipse(r * 0.42, r * 0.38, r * 0.22, r * 0.09, Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
        ctx.restore();
    }

    drawStylizedEye(ctx, x, y, radius) {
        ctx.save();
        ctx.translate(x, y);

        if (this.physics.isSleeping) {
            // Ojos dormidos: curvas suaves y serenas
            ctx.beginPath();
            ctx.arc(0, 4, radius * 0.7, 0.2, Math.PI - 0.2);
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = '#004D40';
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (this.physics.isDizzy) {
            // Ojos mareados en espiral animada
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#004D40';
            ctx.stroke();

            ctx.beginPath();
            for (let i = 0; i < 45; i++) {
                const angle = 0.38 * i;
                const dist = (radius * 0.75) * (i / 45);
                const px = Math.cos(angle + Date.now() / 90) * dist;
                const py = Math.sin(angle + Date.now() / 90) * dist;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.restore();
            return;
        }

        // 1. Esclerótica blanca con degradado tridimensional
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        const eyeGrad = ctx.createRadialGradient(-4, -6, 2, 0, 0, radius);
        eyeGrad.addColorStop(0, '#FFFFFF');
        eyeGrad.addColorStop(0.85, '#F1F8E9');
        eyeGrad.addColorStop(1, '#DCEDC8');
        ctx.fillStyle = eyeGrad;
        ctx.shadowColor = 'rgba(0, 77, 64, 0.2)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 2. Pupila grande y expresiva con seguimiento
        const maxPupilMove = radius * 0.38;
        const px = Math.max(-maxPupilMove, Math.min(maxPupilMove, this.lookAtX));
        const py = Math.max(-maxPupilMove, Math.min(maxPupilMove, this.lookAtY));

        ctx.beginPath();
        ctx.arc(px, py, radius * 0.58, 0, Math.PI * 2);
        const pupilGrad = ctx.createRadialGradient(px - 3, py - 4, 1, px, py, radius * 0.58);
        pupilGrad.addColorStop(0, '#00695C');
        pupilGrad.addColorStop(0.5, '#004D40');
        pupilGrad.addColorStop(1, '#00251A');
        ctx.fillStyle = pupilGrad;
        ctx.fill();

        // 3. Doble brillo especular kawaii en los ojos
        ctx.beginPath();
        ctx.arc(px - 5, py - 6, radius * 0.24, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px + 4, py + 4, radius * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // 4. Párpado orgánico al parpadear
        if (this.blinkProgress > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
            ctx.clip();

            ctx.fillStyle = this.secondaryColor;
            ctx.fillRect(-radius - 2, -radius - 2, (radius + 2) * 2, (radius + 2) * 2 * this.blinkProgress);
            ctx.restore();
        }

        ctx.restore();
    }

    drawExpressiveMouth(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        if (this.physics.isSleeping) {
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#004D40';
            ctx.fill();
        } else if (this.isTalking) {
            // Boca 3D con cavidad, lengua y dientecito
            const mouthH = Math.max(10, this.talkMouthOpen);
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, mouthH, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#AD1457';
            ctx.fill();

            // Lengua rosada
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, mouthH * 0.45, 12, mouthH * 0.55, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#FF4081';
            ctx.fill();
            ctx.restore();

            // Diente blanco simpático
            ctx.beginPath();
            ctx.rect(-6, -mouthH + 1, 12, 5);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        } else {
            // Sonrisa grande y alegre con curva Bezier
            ctx.beginPath();
            ctx.moveTo(-18, -4);
            ctx.quadraticCurveTo(0, 18, 18, -4);
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = '#004D40';
            ctx.lineCap = 'round';
            ctx.stroke();

            // Pequeños hoyuelos en la comisura
            ctx.beginPath();
            ctx.arc(-18, -4, 2, 0, Math.PI * 2);
            ctx.arc(18, -4, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#004D40';
            ctx.fill();
        }

        ctx.restore();
    }
}
