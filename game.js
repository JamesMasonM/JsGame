const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0
};

const bullets = [];
const enemies = [];
const peacfuls = [];
let gameOver = false;
let score = 0;
let lastShotTime = 0; // Time of the last shot
const fireRate = 200; // Fire rate in milliseconds

function drawPlayer() {
    const gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.radius);
    gradient.addColorStop(0, 'rgba(106, 90, 205, 1)'); // Center color
    gradient.addColorStop(1, 'rgba(63, 136, 143, 1)'); // Edge color
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        const gradient = ctx.createRadialGradient(bullet.x, bullet.y, 0, bullet.x, bullet.y, bullet.radius);
        gradient.addColorStop(0, 'rgba(227, 38, 54, 1)'); // Center color
        gradient.addColorStop(1, 'rgba(193, 135, 107, 1)'); // Edge color
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Remove bullet if it goes off-screen
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        const gradient = ctx.createRadialGradient(enemy.x, enemy.y, 0, enemy.x, enemy.y, enemy.radius);
        gradient.addColorStop(0, 'rgba(189, 236, 182, 1)'); // Center color
        gradient.addColorStop(1, 'rgba(30, 89, 69, 1)'); // Edge color
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;

        // Check for collision with player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - player.radius - enemy.radius < 1) {
            gameOver = true;
        }

        // Check for collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            const bulletDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (bulletDist - bullet.radius - enemy.radius < 1) {
                enemies.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score += 1; // Increase score when an enemy is hit
                document.getElementById('scoreDisplay').innerText = 'Score: ' + score; // Update score display
            }
        });
    });
}

function drawPeaceful() {
    peacfuls.forEach((dude, index) => {
        const gradient = ctx.createRadialGradient(dude.x, dude.y, 0, dude.x, dude.y, dude.radius);
        gradient.addColorStop(0, 'rgba(175, 238, 238, 1)'); // Center color
        gradient.addColorStop(1, 'rgba(138, 127, 142, 1)'); // Edge color
        ctx.beginPath();
        ctx.arc(dude.x, dude.y, dude.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        dude.x += dude.dx;
        dude.y += dude.dy;

        // Check for collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            const bulletDist = Math.hypot(bullet.x - dude.x, bullet.y - dude.y);
            if (bulletDist - bullet.radius - dude.radius < 1) {
                peacfuls.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score -= 2; // Decrease score when an dude is hit
                if (score<=0)
                {
                    score=0
                }
                document.getElementById('scoreDisplay').innerText = 'Score: ' + score; // Update score display
            }
        });
    });
}

function update() {
    if (gameOver) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPeaceful();
    // Update player position
    player.x += player.dx;
    player.y += player.dy;
    if (player.x - player.radius < 0 || player.x + player.radius > canvas.width ||
        player.y - player.radius < 0 || player.y + player.radius > canvas.height) {
        gameOver = true; // Set game over flag
    }
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.key === 'w') {
        player.dy = -player.speed;
    } else if (event.key === 's') {
        player.dy = player.speed;
    } else if (event.key === 'a') {
        player.dx = -player.speed;
    } else if (event.key === 'd') {
        player.dx = player.speed;
    }
});

document.addEventListener('keyup', event => {
    if (event.key === 'w' || event.key === 's') {
        player.dy = 0;
    } else if (event.key === 'a' || event.key === 'd') {
        player.dx = 0;
    }
});

canvas.addEventListener('click', event => {
    const currentTime = Date.now();
    if (currentTime - lastShotTime >= fireRate) {
        const angle = Math.atan2(event.clientY - canvas.offsetTop - player.y, event.clientX - canvas.offsetLeft - player.x);
        let bulletSpeed = 1+(Math.floor(score / 10)); // Calculate bullet speed based on score
        if (bulletSpeed >=3)
        {
            bulletSpeed=3
        }
        bullets.push({
            x: player.x,
            y: player.y,
            radius: 5,
            dx: Math.cos(angle) * bulletSpeed,
            dy: Math.sin(angle) * bulletSpeed
        });
        lastShotTime = currentTime; // Update the last shot time
    }
});

function spawnEnemies() {
    setInterval(() => {
        if (gameOver) {
            return;
        }
        const radius = 10;
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.hypot(x - player.x, y - player.y) < 100);

        const angle = Math.atan2(player.y - y, player.x - x);
        const speed = 2;
        enemies.push({ x, y, radius, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed });
    }, 2000);
}

function spawnPeacefuls() {
    setInterval(() => {
        if (gameOver) {
            return;
        }
        const radius = 10;
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (Math.hypot(x - player.x, y - player.y) < 100);

        const angle = Math.atan2(player.y - y, player.x - x);
        const speed = 2;
        peacfuls.push({ x, y, radius, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed });
    }, 4000);
}

update();
spawnEnemies();
spawnPeacefuls();