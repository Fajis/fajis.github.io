// Bug runner: the amber cursor jumps over code "bugs", ducks under flying
// ones and grabs coffee for points and a short shield.
// Markup: _includes/bug-runner.html. Uses $, $$ and storage from main.js.
//   Jump: Space, ↑, W or tap        Duck: hold ↓ or S, or swipe down

(function () {
    const GROUND_BUGS = ['{ }', 'null', '</>', 'NaN', '404', 'bug', 'err'];
    const FLYING_BUGS = ['0x0', '//', '***'];
    const HIGH_SCORE_KEY = 'bug-runner-high-score';

    const PHYSICS = {
        gravity: 2600,       // px/s²
        fastFall: 3,         // gravity multiplier while ducking in the air
        jumpSpeed: 760,      // px/s
        startSpeed: 330,     // px/s
        maxSpeed: 880,       // px/s
        acceleration: 11     // px/s gained every second
    };

    const PLAYER = { x: 48, width: 16, height: 26, duckHeight: 13 };
    const CHIP = { height: 24, padding: 8, fontSize: 14 };   // each bug is a small code chip
    const FLYING_LIFT = 18;          // flying bugs float this high: duck to pass under
    const FLYING_FROM_SCORE = 150;   // flying bugs start appearing after this score
    const COFFEE = { size: 14, lift: 70, points: 50, shield: 2 };
    const GROUND_OFFSET = 40;        // ground line distance from the bottom

    // Theme colours come from the CSS custom properties
    function readColors() {
        const css = getComputedStyle(document.documentElement);
        const get = name => css.getPropertyValue(name).trim();
        return {
            background: get('--bg-raised'),
            text: get('--fg'),
            muted: get('--muted'),
            subtle: get('--subtle'),
            line: get('--line-strong'),
            accent: get('--accent')
        };
    }

    // Phones and tablets get touch instructions instead of keyboard ones
    const touch = window.matchMedia('(hover: none)').matches;
    const TEXT = touch
        ? { ready: 'Tap Play to start', running: 'Tap to jump  /  Swipe down to duck', retry: 'tap Play again' }
        : { ready: 'Press Play, Space or tap to start', running: 'Jump: Space, ↑ or tap  /  Duck: hold ↓ or swipe down', retry: 'press Play again' };

    const pad = n => String(Math.floor(n)).padStart(5, '0');
    const random = (min, max) => min + Math.random() * (max - min);
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;

    function createGame(root) {
        const canvas = $('canvas', root);
        const ctx = canvas.getContext('2d');
        const scoreOutput = $('[data-score]', root);
        const status = $('[data-status]', root);
        const playButton = $('[data-play]', root);
        const shareButton = $('[data-share]', root);

        let width = 0;
        let height = 0;
        let colors = readColors();
        let state = 'ready'; // ready | running | over
        let player;
        let bugs;
        let coffee;
        let popups;
        let speed;
        let score;
        let shield;
        let groundOffset;
        let nextCoffeeAt;
        let newBest;
        let lastTime = 0;
        let inView = true;
        let duckHeld = false;
        let highScore = parseInt(storage.get(HIGH_SCORE_KEY), 10) || 0;

        const groundY = () => height - GROUND_OFFSET;
        const font = size => `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
        const playerHeight = () => (duckHeld ? PLAYER.duckHeight : PLAYER.height);

        // ---------- Setup ----------

        function reset() {
            player = { y: 0, velocity: 0 }; // y = height above the ground
            bugs = [];
            coffee = null;
            popups = [];
            speed = PHYSICS.startSpeed;
            score = 0;
            shield = 0;
            groundOffset = 0;
            nextCoffeeAt = 60;
            newBest = false;
        }

        function resize() {
            const ratio = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            draw();
        }

        function setStatus(text) {
            status.textContent = text;
        }

        // Buttons show before a game and after a crash, hidden while running
        function showButtons(playLabel, canShare) {
            playButton.textContent = playLabel;
            playButton.hidden = !playLabel;
            shareButton.hidden = !canShare;
        }

        function showScore() {
            scoreOutput.textContent = `HI ${pad(highScore)} · ${pad(score)}`;
        }

        // ---------- Game flow ----------

        function start() {
            reset();
            state = 'running';
            showButtons('', false);
            canvas.focus({ preventScroll: true });
            setStatus(TEXT.running);
            lastTime = performance.now();
            requestAnimationFrame(loop);
        }

        function jump() {
            if (state !== 'running') {
                start();
                return;
            }
            if (player.y === 0 && !duckHeld) player.velocity = PHYSICS.jumpSpeed;
        }

        function gameOver() {
            state = 'over';
            duckHeld = false;
            const final = Math.floor(score);
            newBest = final > highScore && final > 0;
            if (newBest) {
                highScore = final;
                storage.set(HIGH_SCORE_KEY, String(highScore));
            }
            if (navigator.vibrate) navigator.vibrate(newBest ? [60, 40, 60] : 120);
            showScore();
            setStatus(newBest ? `New best! Score ${final} · ${TEXT.retry}` : `Game over · score ${final} · ${TEXT.retry}`);
            showButtons('↻ Play again', true);
            draw();
        }

        async function share() {
            const final = Math.floor(score);
            const url = new URL('/play/', location.origin).href;
            const text = `I scored ${final} on Bug runner. Can you beat it?`;
            try {
                if (navigator.share) {
                    await navigator.share({ title: 'Bug runner', text, url });
                    return;
                }
                await navigator.clipboard.writeText(`${text} ${url}`);
                setStatus('Copied! Paste it anywhere to share.');
            } catch (error) {
                if (error.name !== 'AbortError') setStatus(`Share this link: ${url}`);
            }
        }

        // ---------- Spawning ----------

        function spawnBug() {
            const flying = score > FLYING_FROM_SCORE && Math.random() < 0.25;
            const text = pick(flying ? FLYING_BUGS : GROUND_BUGS);
            ctx.font = font(CHIP.fontSize);
            const bugWidth = ctx.measureText(text).width + CHIP.padding * 2;
            // Leave enough room to land between bugs at the current speed
            const airTime = (2 * PHYSICS.jumpSpeed) / PHYSICS.gravity;
            const lastBug = bugs[bugs.length - 1];
            const minGap = speed * airTime * 1.15 + bugWidth;
            const x = lastBug
                ? Math.max(width + 20, lastBug.x + lastBug.width + random(minGap, minGap + 320))
                : width + 40;
            bugs.push({ text, x, width: bugWidth, height: CHIP.height, lift: flying ? FLYING_LIFT : 0, flying });
        }

        function spawnCoffee() {
            coffee = { x: width + 60, lift: COFFEE.lift + random(-12, 12) };
            nextCoffeeAt = score + random(180, 320);
        }

        // ---------- Update ----------

        function hitbox(left, width, bottom, height) {
            return { left, right: left + width, bottom, top: bottom + height };
        }

        function update(seconds) {
            speed = Math.min(PHYSICS.maxSpeed, speed + PHYSICS.acceleration * seconds);
            score += speed * seconds / 10;
            shield = Math.max(0, shield - seconds);

            // Player physics: ducking in the air pulls you down faster
            const gravity = PHYSICS.gravity * (duckHeld && player.y > 0 ? PHYSICS.fastFall : 1);
            player.velocity -= gravity * seconds;
            player.y = Math.max(0, player.y + player.velocity * seconds);
            if (player.y === 0) player.velocity = 0;

            // Move everything left
            const step = speed * seconds;
            bugs.forEach(bug => { bug.x -= step; });
            bugs = bugs.filter(bug => bug.x + bug.width > -20);
            while (bugs.length < 3) spawnBug();

            if (coffee) {
                coffee.x -= step;
                if (coffee.x < -20) coffee = null;
            } else if (score > nextCoffeeAt) {
                spawnCoffee();
            }

            popups.forEach(p => { p.age += seconds; });
            popups = popups.filter(p => p.age < 0.8);

            groundOffset = (groundOffset + step) % 24;

            // Collisions, with a little forgiveness
            const margin = 4;
            const me = hitbox(PLAYER.x + margin, PLAYER.width - margin * 2, player.y, playerHeight() - margin);

            if (coffee && overlaps(me, hitbox(coffee.x, COFFEE.size, coffee.lift, COFFEE.size))) {
                score += COFFEE.points;
                shield = COFFEE.shield;
                popups.push({ text: `+${COFFEE.points}`, x: coffee.x, y: coffee.lift, age: 0 });
                coffee = null;
            }

            if (shield > 0) return;
            const hit = bugs.some(bug => overlaps(me, hitbox(bug.x + 2, bug.width - 4, bug.lift, bug.height - margin)));
            if (hit) gameOver();
        }

        // ---------- Draw ----------

        function drawCentered(text, y, size, color) {
            ctx.font = font(size);
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.fillText(text, width / 2, y);
            ctx.textAlign = 'left';
        }

        function drawBug(bug, ground) {
            const top = ground - bug.lift - bug.height;
            ctx.fillStyle = colors.background;
            ctx.fillRect(bug.x, top, bug.width, bug.height);
            ctx.strokeStyle = bug.flying ? colors.accent : colors.text;
            ctx.setLineDash(bug.flying ? [3, 3] : []);
            ctx.strokeRect(bug.x + 0.5, top + 0.5, bug.width - 1, bug.height - 1);
            ctx.setLineDash([]);
            ctx.fillStyle = colors.text;
            ctx.fillText(bug.text, bug.x + CHIP.padding, top + bug.height / 2 + 1);
        }

        // A small mug: cup, handle and two steam lines
        function drawCoffee(ground) {
            const s = COFFEE.size;
            const x = coffee.x;
            const y = ground - coffee.lift - s;
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y + 4, s - 4, s - 4);
            ctx.strokeRect(x + s - 4, y + 7, 3, 4);
            ctx.beginPath();
            ctx.moveTo(x + 3, y + 2);
            ctx.lineTo(x + 3, y - 2);
            ctx.moveTo(x + 7, y + 2);
            ctx.lineTo(x + 7, y - 2);
            ctx.stroke();
            ctx.lineWidth = 1;
        }

        function draw() {
            const ground = groundY();

            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, width, height);

            // Ground line with moving ticks
            ctx.fillStyle = colors.line;
            ctx.fillRect(0, ground, width, 1);
            ctx.fillStyle = colors.subtle;
            for (let x = -groundOffset; x < width; x += 24) {
                ctx.fillRect(x, ground + 8, 6, 1);
            }

            ctx.font = font(CHIP.fontSize);
            ctx.textBaseline = 'middle';
            bugs.forEach(bug => drawBug(bug, ground));
            ctx.textBaseline = 'alphabetic';

            if (coffee) drawCoffee(ground);

            // Player: the amber cursor block; outlined while the shield is on
            const h = playerHeight();
            const top = ground - h - player.y;
            ctx.fillStyle = colors.accent;
            if (shield > 0 && Math.floor(shield * 10) % 2 === 0) {
                ctx.strokeStyle = colors.accent;
                ctx.strokeRect(PLAYER.x + 0.5, top + 0.5, PLAYER.width - 1, h - 1);
            } else {
                ctx.fillRect(PLAYER.x, top, PLAYER.width, h);
            }

            // "+50" popups float up and fade
            ctx.font = font(13);
            popups.forEach(p => {
                ctx.globalAlpha = 1 - p.age / 0.8;
                ctx.fillStyle = colors.accent;
                ctx.fillText(p.text, p.x, ground - p.y - COFFEE.size - p.age * 30);
            });
            ctx.globalAlpha = 1;

            // Messages sit above the buttons (centred over the canvas by CSS)
            if (state === 'ready') {
                drawCentered('Jump over the bugs', height / 2 - 34, 16, colors.muted);
            } else if (state === 'over') {
                const title = newBest ? `New best! · ${Math.floor(score)}` : `Game over · ${Math.floor(score)}`;
                drawCentered(title, height / 2 - 34, 20, newBest ? colors.accent : colors.text);
            }
        }

        // ---------- Loop ----------

        function loop(now) {
            if (state !== 'running') return;
            // Clamp the step so a background tab doesn't teleport the bugs
            const seconds = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;
            update(seconds);
            if (state === 'running') {
                showScore();
                draw();
                requestAnimationFrame(loop);
            }
        }

        // ---------- Input ----------

        playButton.addEventListener('click', start);
        shareButton.addEventListener('click', share);

        // Tap to jump; swipe down to duck while the finger stays down
        let swipeStartY = null;
        canvas.addEventListener('pointerdown', e => {
            e.preventDefault();
            swipeStartY = e.clientY;
            if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
            jump();
        });
        canvas.addEventListener('pointermove', e => {
            if (swipeStartY !== null && e.clientY - swipeStartY > 24) duckHeld = true;
        });
        const endSwipe = () => {
            swipeStartY = null;
            duckHeld = false;
        };
        canvas.addEventListener('pointerup', endSwipe);
        canvas.addEventListener('pointercancel', endSwipe);

        // Keys work only when the game is on screen and nothing else has focus
        const keyFree = () => {
            const active = document.activeElement;
            return inView && (active === document.body || active === canvas);
        };

        document.addEventListener('keydown', e => {
            if (!keyFree()) return;
            if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
                e.preventDefault();
                jump();
            } else if (['ArrowDown', 'KeyS'].includes(e.code) && state === 'running') {
                e.preventDefault();
                duckHeld = true;
            }
        });
        document.addEventListener('keyup', e => {
            if (['ArrowDown', 'KeyS'].includes(e.code)) duckHeld = false;
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                inView = entry.isIntersecting;
            }).observe(canvas);
        }

        // Follow theme changes (toggle or device setting)
        const refreshColors = () => {
            colors = readColors();
            draw();
        };
        new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', refreshColors);

        if ('ResizeObserver' in window) {
            new ResizeObserver(resize).observe(canvas);
        } else {
            window.addEventListener('resize', resize);
        }

        reset();
        showScore();
        setStatus(TEXT.ready);
        resize();
        // Redraw once the mono font has loaded
        if (document.fonts) document.fonts.ready.then(draw);
    }

    $$('[data-bug-runner]').forEach(createGame);
})();
