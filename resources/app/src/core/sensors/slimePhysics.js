/**
 * slimePhysics.js - Motor de física elástica premium con colisión en los 4 bordes (rebotes)
 * y agarre/lanzamiento (Drag & Throw).
 * Permite agarrar a la criatura de gelatina, estirarla, lanzarla con inercia contra las paredes
 * y ver cómo rebota con deformación Squash & Stretch antes de volver a su plataforma.
 */

export class SlimePhysics {
    constructor(options = {}) {
        // Coordenadas locales respecto al centro de su base
        this.x = 0;
        this.y = 0;

        // Escalas de deformación volumétrica (Squash & Stretch)
        this.scaleX = 1.0;
        this.scaleY = 1.0;

        // Velocidades lineales y de deformación
        this.vx = 0;
        this.vy = 0;
        this.scaleVx = 0;
        this.scaleVy = 0;

        // Parámetros de resorte y masa viscosa
        this.stiffness = 0.18;   // Fuerza de retorno a la forma original
        this.damping = 0.82;     // Amortiguación elástica
        this.gravity = 0.65;     // Gravedad fluida
        this.groundY = 0;        // Límite del suelo

        // Límites dinámicos de las paredes del canvas (rebote en 4 bordes)
        this.minX = -160;
        this.maxX = 160;
        this.minY = -170;
        this.maxY = 0;
        this.bounciness = 0.85;  // Coeficiente de rebote elástico ágil

        // Estado de agarre con el ratón / táctil
        this.isDragging = false;
        this.lastDragX = 0;
        this.lastDragY = 0;

        // Estados emocionales y de sensores
        this.isDizzy = false;
        this.dizzyTimer = 0;
        this.isSleeping = false;
        this.shakeEnergy = 0;
        this.stillTime = 0;
        this.happiness = 85;     // Medidor de felicidad del Tamagotchi

        // Burbujas internas que flotan dentro de la gelatina
        this.bubbles = [
            { x: -25, y: 10, r: 8, vx: 0, vy: 0, phase: 0 },
            { x: 30, y: -15, r: 12, vx: 0, vy: 0, phase: 1.5 },
            { x: -5, y: -35, r: 6, vx: 0, vy: 0, phase: 3.0 },
            { x: 20, y: 25, r: 9, vx: 0, vy: 0, phase: 4.2 }
        ];
    }

    /**
     * Ajusta los límites de rebote según el tamaño real del canvas
     */
    setBounds(minX, maxX, minY, maxY) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this.groundY = maxY;
    }

    /**
     * Inicia el agarre interactivo del slime
     */
    startDrag(x, y) {
        this.isDragging = true;
        this.isSleeping = false;
        this.stillTime = 0;
        this.vx = 0;
        this.vy = 0;
        this.lastDragX = x;
        this.lastDragY = y;
    }

    /**
     * Actualiza la posición del slime durante el arrastre con deformación elástica
     */
    updateDrag(targetX, targetY) {
        if (!this.isDragging) return;

        const deltaX = targetX - this.lastDragX;
        const deltaY = targetY - this.lastDragY;
        this.lastDragX = targetX;
        this.lastDragY = targetY;

        // Restringir a los límites del escenario
        this.x = Math.max(this.minX, Math.min(this.maxX, targetX));
        this.y = Math.max(this.minY, Math.min(this.maxY, targetY));

        // Estirar en la dirección del movimiento del arrastre
        const speed = Math.hypot(deltaX, deltaY);
        if (speed > 2) {
            const stretch = Math.min(0.45, speed * 0.025);
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.scaleX = Math.min(1.45, 1.0 + stretch);
                this.scaleY = Math.max(0.65, 1.0 - stretch * 0.7);
            } else {
                this.scaleY = Math.min(1.45, 1.0 + stretch);
                this.scaleX = Math.max(0.65, 1.0 - stretch * 0.7);
            }
        }
    }

    /**
     * Suelta al slime con la velocidad del impulso (lanzamiento)
     */
    releaseDrag(throwVx = 0, throwVy = 0) {
        this.isDragging = false;
        // Permitir lanzamientos ágiles con inercia multiplicada
        this.vx = Math.max(-50, Math.min(50, throwVx * 1.45));
        this.vy = Math.max(-45, Math.min(30, throwVy * 1.45));

        const launchSpeed = Math.hypot(this.vx, this.vy);
        if (launchSpeed > 10) {
            this.isDizzy = true;
            this.dizzyTimer = 2.5;
            this.happiness = Math.min(100, this.happiness + 5);
        }
    }

    /**
     * Aplica la aceleración de los sensores del móvil
     */
    applyAccelerometer(ax, ay, az, dt = 0.016) {
        if (this.isDragging) return;
        const normX = ax / 9.81;
        const normY = ay / 9.81;
        const normZ = az / 9.81;

        this.vx += (-normX * 18 - this.x) * 0.08;

        const dynamicAccel = Math.abs(Math.sqrt(normX * normX + normY * normY + normZ * normZ) - 1.0);

        if (dynamicAccel > 1.8) {
            this.shakeEnergy += dynamicAccel * 2.5;
            this.stillTime = 0;
            if (this.shakeEnergy > 12) {
                this.isDizzy = true;
                this.dizzyTimer = 2.0;
            }
        } else {
            this.shakeEnergy *= 0.90;
            if (this.shakeEnergy < 1.5) this.isDizzy = false;

            if (dynamicAccel < 0.1) {
                this.stillTime += dt * 1000;
                if (this.stillTime > 15000 || normZ < -0.85) {
                    this.isSleeping = true;
                }
            } else {
                this.stillTime = 0;
                this.isSleeping = false;
            }
        }
    }

    /**
     * Sacudida explícita con bamboleo caótico, deformación y mareo
     */
    shake() {
        this.isSleeping = false;
        this.isDizzy = true;
        this.dizzyTimer = 3.0;
        this.shakeEnergy = 25;

        this.vx = (Math.random() > 0.5 ? 28 : -28);
        this.vy = -12;
        this.scaleX = 1.42;
        this.scaleY = 0.68;
        this.scaleVx = 0.25;

        for (const b of this.bubbles) {
            b.vx = (Math.random() - 0.5) * 24;
            b.vy = (Math.random() - 0.5) * 24;
        }
    }

    /**
     * Toque o golpe suave
     */
    poke(forceX = 0, forceIntensity = 0.35) {
        if (this.isDragging) return;
        this.isSleeping = false;
        this.stillTime = 0;
        this.happiness = Math.min(100, this.happiness + 2);

        this.scaleY = Math.max(0.55, this.scaleY - forceIntensity);
        this.scaleX = Math.min(1.45, this.scaleX + forceIntensity * 0.8);

        this.vy = -8 - (forceIntensity * 10);
        this.vx += (Math.random() - 0.5) * 8;

        for (const b of this.bubbles) {
            b.vy += (Math.random() - 0.5) * 8;
            b.vx += (Math.random() - 0.5) * 8;
        }
    }

    /**
     * Actualización física continua a 60 FPS
     */
    update(dt = 0.016) {
        if (!this.isDragging) {
            // 1. Simulación gravitatoria y rozamiento atmosférico
            this.vy += this.gravity;
            this.vx *= 0.985;
            this.vy *= 0.985;

            this.x += this.vx;
            this.y += this.vy;

            // 2. Colisión y rebote contra la PARED IZQUIERDA
            if (this.x < this.minX) {
                const impactSpeed = Math.abs(this.vx);
                this.x = this.minX;
                this.vx = Math.abs(this.vx) * this.bounciness;
                this.scaleX = Math.max(0.55, this.scaleX - 0.35);
                this.scaleY = Math.min(1.45, this.scaleY + 0.30);
                if (impactSpeed > 2 && this.onBounce) this.onBounce(impactSpeed);
            }

            // 3. Colisión y rebote contra la PARED DERECHA
            if (this.x > this.maxX) {
                const impactSpeed = Math.abs(this.vx);
                this.x = this.maxX;
                this.vx = -Math.abs(this.vx) * this.bounciness;
                this.scaleX = Math.max(0.55, this.scaleX - 0.35);
                this.scaleY = Math.min(1.45, this.scaleY + 0.30);
                if (impactSpeed > 2 && this.onBounce) this.onBounce(impactSpeed);
            }

            // 4. Colisión y rebote contra el TECHO
            if (this.y < this.minY) {
                const impactSpeed = Math.abs(this.vy);
                this.y = this.minY;
                this.vy = Math.abs(this.vy) * this.bounciness;
                this.scaleY = Math.max(0.60, this.scaleY - 0.30);
                this.scaleX = Math.min(1.40, this.scaleX + 0.25);
                if (impactSpeed > 2 && this.onBounce) this.onBounce(impactSpeed);
            }

            // 5. Colisión y rebote contra el SUELO / BASE
            if (this.y > this.groundY) {
                this.y = this.groundY;
                const impactSpeed = Math.abs(this.vy);
                if (impactSpeed > 1.2) {
                    const impactForce = Math.min(0.35, impactSpeed * 0.035);
                    this.scaleY = Math.max(0.62, this.scaleY - impactForce);
                    this.scaleX = Math.min(1.38, this.scaleX + impactForce * 0.8);
                    this.vy = -this.vy * this.bounciness;
                    if (impactSpeed > 2.5 && this.onBounce) this.onBounce(impactSpeed);
                } else {
                    this.vy = 0;
                    // Si aún tiene velocidad horizontal significativa, dejarlo rodar y rebotar libremente
                    if (Math.abs(this.vx) > 1.2) {
                        this.vx *= 0.988; // Deslizamiento suave de baja fricción
                    } else {
                        // Solo cuando se haya calmado, retorno elástico suave al centro del podio (0, 0)
                        this.vx += (0 - this.x) * 0.05;
                        this.vx *= 0.88;
                    }
                }
            }
        }

        // 6. Resorte elástico de retorno de forma (Squash & Stretch armónico)
        const fx = (1.0 - this.scaleX) * this.stiffness;
        const fy = (1.0 - this.scaleY) * this.stiffness;

        this.scaleVx = (this.scaleVx + fx) * this.damping;
        this.scaleVy = (this.scaleVy + fy) * this.damping;

        this.scaleX += this.scaleVx;
        this.scaleY += this.scaleVy;

        // Control del mareo
        if (this.isDizzy) {
            this.dizzyTimer -= dt;
            if (this.dizzyTimer <= 0) {
                this.isDizzy = false;
                this.shakeEnergy = 0;
            }
        }

        // Respiración / animación orgánica
        if (this.isSleeping) {
            const breath = Math.sin(Date.now() / 900) * 0.05;
            this.scaleX = 1.04 + breath;
            this.scaleY = 0.96 - breath;
        } else if (!this.isDragging && Math.abs(this.vx) < 0.5 && Math.abs(this.vy) < 0.5) {
            const idle = Math.sin(Date.now() / 450) * 0.018;
            this.scaleX += idle;
            this.scaleY -= idle;
        }

        // Física de las burbujas internas flotantes
        for (const b of this.bubbles) {
            b.phase += dt * 2;
            b.vx *= 0.88;
            b.vy *= 0.88;
            b.x += b.vx + Math.sin(b.phase) * 0.3;
            b.y += b.vy + Math.cos(b.phase) * 0.3;
        }

        return {
            x: this.x,
            y: this.y,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            isDizzy: this.isDizzy,
            isSleeping: this.isSleeping,
            happiness: this.happiness
        };
    }
}
