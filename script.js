document.addEventListener("DOMContentLoaded", () => {
  // --- Existing Card Logic ---
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // If the user clicked on a link inside the card, let the link handle it.
      if (e.target.closest("a")) return;

      const url = card.getAttribute("data-href");
      if (url) {
        // Mimic target="_blank" behavior
        window.open(url, "_blank");
      }
    });
  });

  // --- Particle Background Logic ---
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");

  let width, height;
  let particles = [];

  // Configuration
  const particleCount = 300; // density
  const colors = ["#270434", "#ffffff"]; // violet, White
  const mouse = { x: -1000, y: -1000 };
  const interactionRadius = 100;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  class Particle {
    constructor() {
      this.init(true);
    }

    init(randomY = false) {
      this.x = Math.random() * width;
      this.y = randomY ? Math.random() * height : -10; // Start above screen if not random
      this.vx = (Math.random() - 0.5) * 0.5; // slight initial horizontal drift
      this.vy = Math.random() * 0.8 + 0.2; // falling speed (0.2 to 1.0)
      this.size = Math.random() * 1.5 + 1; // Size 1 to 2.5
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.3 + 0.1; // Opacity 0.1 to 0.4
      this.drift = Math.random() ; // Random offset for horizontal noise
    }

    update() {
      // Mouse Interaction
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < interactionRadius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (interactionRadius - distance) / interactionRadius;
        
        // Push much gentler (multiplier reduced from 5 to 1)
        const forceX = forceDirectionX * force * 0.5 ;
        const forceY = forceDirectionY * force * 0.5 ;

        this.vx += forceX;
        this.vy += forceY;
      }

      // // // // Add Snow-like Noise
      // this.vx += Math.sin(Date.now() * 0.001 + this.drift) * 0.02;
      // Simulate gusty wind
      const t = Date.now() * 0.001;

      const base = Math.sin(t * 0.3 + this.drift) * 0.02;
      const gust = Math.sin(t * 0.5 + this.drift) ** 5 * 0.02;

      this.vx += base + gust;
// // // // // // // // // //


      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Drag/Friction - Slightly higher to keep things calm
      this.vx *= 0.97;
      this.vy *= 0.97;

      // Ensure minimum falling speed (gravity simulation) - Reduced gravity
      if (this.vy < 1) {
        this.vy += 0.05;
      }

      // Reset if out of bounds
      if (this.y > height + 10 || this.x < -50 || this.x > width + 50) {
        this.init();
      }
    }

    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener("resize", resize);
  
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Handle touch interactions for mobile
  window.addEventListener("touchmove", (e) => {
    if(e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  // Reset mouse when leaving window
  document.addEventListener("mouseleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Start
  resize();
  animate();
});
