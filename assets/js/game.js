// Bug runner: the amber cursor jumps over code "bugs".
// Markup: _includes/bug-runner.html. Uses $, $$ and storage from main.js.

(function () {
    const BUGS = ['{ }', 'null', '</>', 'NaN', '404', 'bug', 'err'];
    const HIGH_SCORE_KEY = 'bug-runner-high-score';

    const PHYSICS = {
        gravity: 2600,      // px/s²
        jumpSpeed: 760,     // px/s
        startSpeed: 330,    // px/s
        maxSpeed: 880,      // px/s
        acceleration: 11    // px/s gained every second
    };

    const PLAYER = { x: 48, width: 16, height: 26 };
    const CHIP = { height: 24, padding: 8, fontSize: 14 }; // each bug is a small code chip
    const GROUND_OFFSET = 40; // ground line distance from the bottom

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

    const pad = n => String(Math.floor(n)).padStart(5, '0');
    const random = (min, max) => min + Math.random() * (max - min);

    function createGame(root) {
        const canvas = $('canvas', root);
        const ctx = canvas.getContext('2d');
        const scoreOutput = $('[data-score]', root);
        const status = $('[data-status]', root);
        const playButton = $('[data-play]', root);

        let width = 0;
        let height = 0;
        let colors = readColors();
        let state = 'ready'; // ready | running | over
        let player;
        let bugs;
        let speed;
        let score;
        let groundOffset;
        let lastTime = 0;
        let inView = true;
        let highScore = parseInt(storage.get(HIGH_SCORE_KEY), 10) || 0;

        const groundY = () => height - GROUND_OFFSET;
        const font = size => `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;

        // ---------- Setup ----------

        function reset() {
            player = { y: 0, velocity: 0 }; // y = height above the ground
            bugs = [];
            speed = PHYSICS.startSpeed;
            score = 0;
            groundOffset = 0;
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

        // The Play button shows before a game and after a crash, hidden while running
        function showPlayButton(label) {
            playButton.textContent = label;
            playButton.hidden = !label;
        }

        function showScore() {
            scoreOutput.textContent = `HI ${pad(highScore)} · ${pad(score)}`;
        }

        // ---------- Game flow ----------

        function start() {
            reset();
            state = 'running';
            showPlayButton('');
            canvas.focus({ preventScroll: true });
            setStatus('Jump: Space · ↑ · tap');
            lastTime = performance.now();
            requestAnimationFrame(loop);
        }

        function jump() {
            if (state !== 'running') {
                start();
                return;
            }
            if (player.y === 0) player.velocity = PHYSICS.jumpSpeed;
        }

        function gameOver() {
            state = 'over';
            if (score > highScore) {
                highScore = Math.floor(score);
                storage.set(HIGH_SCORE_KEY, String(highScore));
            }
            showScore();
            setStatus(`Game over · score ${Math.floor(score)} · press Play again`);
            showPlayButton('↻ Play again');
            draw();
        }

        // ---------- Update ----------

        function spawnBug() {
            ctx.font = font(CHIP.fontSize);
            const text = BUGS[Math.floor(Math.random() * BUGS.length)];
            const bugWidth = ctx.measureText(text).width + CHIP.padding * 2;
            // Leave enough room to land between bugs at the current speed
            const airTime = (2 * PHYSICS.jumpSpeed) / PHYSICS.gravity;
            const lastBug = bugs[bugs.length - 1];
            const minGap = speed * airTime * 1.15 + bugWidth;
            const x = lastBug ? Math.max(width + 20, lastBug.x + lastBug.width + random(minGap, minGap + 320)) : width + 40;
            bugs.push({ text, x, width: bugWidth, height: CHIP.height });
        }

        function update(seconds) {
            speed = Math.min(PHYSICS.maxSpeed, speed + PHYSICS.acceleration * seconds);
            score += speed * seconds / 10;

            // Player physics
            player.velocity -= PHYSICS.gravity * seconds;
            player.y = Math.max(0, player.y + player.velocity * seconds);
            if (player.y === 0) player.velocity = 0;

            // Move bugs, drop the ones that left, keep the stream going
            bugs.forEach(bug => { bug.x -= speed * seconds; });
            bugs = bugs.filter(bug => bug.x + bug.width > -20);
            while (bugs.length < 3) spawnBug();

            groundOffset = (groundOffset + speed * seconds) % 24;

            // Collision with a little forgiveness
            const margin = 4;
            const playerLeft = PLAYER.x + margin;
            const playerRight = PLAYER.x + PLAYER.width - margin;
            const playerBottom = player.y;
            const hit = bugs.some(bug =>
                bug.x < playerRight && bug.x + bug.width > playerLeft && playerBottom < bug.height - margin);
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

            // Bugs: outlined chips sitting on the ground (what you see is what you hit)
            ctx.font = font(CHIP.fontSize);
            ctx.textBaseline = 'middle';
            bugs.forEach(bug => {
                const top = ground - bug.height;
                ctx.fillStyle = colors.background;
                ctx.fillRect(bug.x, top, bug.width, bug.height);
                ctx.strokeStyle = colors.text;
                ctx.lineWidth = 1;
                ctx.strokeRect(bug.x + 0.5, top + 0.5, bug.width - 1, bug.height - 1);
                ctx.fillStyle = colors.text;
                ctx.fillText(bug.text, bug.x + CHIP.padding, top + bug.height / 2 + 1);
            });
            ctx.textBaseline = 'alphabetic';

            // Player: the amber cursor block
            ctx.fillStyle = colors.accent;
            ctx.fillRect(PLAYER.x, ground - PLAYER.height - player.y, PLAYER.width, PLAYER.height);

            // Messages sit above the Play button (centred over the canvas by CSS)
            if (state === 'ready') {
                drawCentered('Jump over the bugs', height / 2 - 34, 16, colors.muted);
            } else if (state === 'over') {
                drawCentered(`Game over · ${Math.floor(score)}`, height / 2 - 34, 20, colors.text);
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

        canvas.addEventListener('pointerdown', e => {
            e.preventDefault();
            jump();
        });

        document.addEventListener('keydown', e => {
            if (!['Space', 'ArrowUp', 'KeyW'].includes(e.code)) return;
            // Only when the game is on screen and the visitor isn't typing or on a control
            const active = document.activeElement;
            const free = active === document.body || active === canvas;
            if (!inView || !free) return;
            e.preventDefault();
            jump();
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
        resize();
        // Redraw once the mono font has loaded
        if (document.fonts) document.fonts.ready.then(draw);
    }

    $$('[data-bug-runner]').forEach(createGame);
})();
