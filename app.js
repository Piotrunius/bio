let config = {};
let bgAnimationFrame = null;
let visualizerAnimationFrame = null; // New variable to control visualizer loop
let particlesAnimationFrame = null; // New variable to control particle loop
let audioContext = null;
let analyser = null;
let audioPlaying = false;
let wasAudioPlaying = false; // Track audio state before tab switch
const githubUsername = 'Piotrunius';

// Performance detection and adaptive configuration
const deviceCapabilities = {
    isLowEnd: false,
    isMobile: false,
    supportsWebGL: false,
    memoryLimit: Infinity,
    connectionSpeed: 'fast'
};

// Particle count constants
const PARTICLE_COUNTS = {
    LOW_END: 40,
    MOBILE: 60,
    DESKTOP: 120
};

// Performance monitoring
function initPerformanceMonitoring() {
    if (!window.performance || !window.PerformanceObserver) return;
    
    try {
        // Monitor long tasks (tasks taking >50ms)
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Only check duration for measure entries
                if (entry.entryType === 'measure' && entry.duration > 50) {
                    console.warn('Long task detected:', entry.name, `${entry.duration.toFixed(2)}ms`);
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure'] });
        
        // Log initial load performance separately
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Performance Metrics:', {
                        'DOM Content Loaded': `${(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart).toFixed(2)}ms`,
                        'Load Complete': `${(perfData.loadEventEnd - perfData.loadEventStart).toFixed(2)}ms`,
                        'Total Load Time': `${(perfData.loadEventEnd - perfData.fetchStart).toFixed(2)}ms`
                    });
                }
            }, 0);
        });
    } catch (e) {
        console.warn('Performance monitoring not available:', e.message);
    }
}

function detectDeviceCapabilities() {
    // Detect mobile devices
    deviceCapabilities.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                                   window.innerWidth <= 768;
    
    // Detect hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;
    
    // Detect device memory (if available)
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
    deviceCapabilities.memoryLimit = memory;
    
    // Detect connection speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        const effectiveType = connection.effectiveType || '4g';
        deviceCapabilities.connectionSpeed = effectiveType;
    }
    
    // Detect WebGL support
    try {
        const canvas = document.createElement('canvas');
        deviceCapabilities.supportsWebGL = !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        deviceCapabilities.supportsWebGL = false;
    }
    
    // Determine if device is low-end based on multiple factors
    deviceCapabilities.isLowEnd = (
        cores <= 2 || 
        memory <= 2 || 
        (connection && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) ||
        (deviceCapabilities.isMobile && memory <= 4)
    );
    
    console.log('Device capabilities detected:', deviceCapabilities);
    return deviceCapabilities;
}

// Apply performance optimizations based on device
function applyPerformanceOptimizations() {
    const caps = deviceCapabilities;
    
    if (caps.isLowEnd) {
        console.log('Low-end device detected - applying optimizations');
        
        // Reduce particle count
        document.body.classList.add('low-performance');
        
        // Disable heavy animations
        const style = document.createElement('style');
        style.id = 'perf-optimizations';
        style.textContent = `
            .low-performance .bg-layer::before,
            .low-performance .bg-layer::after {
                animation: none;
                opacity: 0.2;
            }
            .low-performance .glass-card {
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                will-change: auto;
            }
            .low-performance .avatar {
                animation: none;
            }
            .low-performance .avatar-ring {
                animation: none;
            }
            .low-performance .stat-card i {
                animation: none;
            }
            .low-performance .social-link i {
                animation: none;
            }
            .low-performance * {
                transition-duration: 0.15s;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Reduce quality for slow connections
    if (caps.connectionSpeed === 'slow-2g' || caps.connectionSpeed === '2g') {
        // Defer non-critical resource loading
        console.log('Slow connection detected - deferring heavy resources');
    }
}

// --- DATA: Setup & Gear (Hardcoded - FIX FOR INVISIBLE BUTTONS) ---
// Dane są tutaj, renderujemy je dynamicznie, aby mieć pełną kontrolę nad ich wyglądem i klasami.
const setupData = {
    pc: [
        { icon: 'microchip', label: 'CPU', value: 'Intel Core i5-13400F', url: 'https://www.google.com/search?q=Intel+Core+i5-13400F' },
        { icon: 'video', label: 'GPU', value: 'Nvidia GeForce RTX 4060 Ti (16GB)', url: 'https://www.google.com/search?q=Nvidia+GeForce+RTX+4060+Ti' },
        { icon: 'network-wired', label: 'Motherboard', value: 'Gigabyte B760 GAMING X DDR4', url: 'https://www.google.com/search?q=Gigabyte+B760+GAMING+X+DDR4' },
        { icon: 'memory', label: 'RAM', value: 'Kingston Fury Beast RGB (32GB DDR4)', url: 'https://www.google.com/search?q=Kingston+Fury+Beast+RGB+DDR4' },
        { icon: 'hard-drive', label: 'Storage', value: 'Samsung 980 NVMe (1TB) + Seagate (2TB HDD)', urls: ['https://www.google.com/search?q=Samsung+980+NVMe+SSD', 'https://www.google.com/search?q=Seagate+2TB+HDD'] },
        { icon: 'bolt', label: 'PSU', value: 'Endorfy Vero L5 Bronze (700W)', url: 'https://www.google.com/search?q=Endorfy+Vero+L5+Bronze+700W' }
    ],
    gear: [
        { icon: 'display', label: 'Displays', value: 'Lenovo L2251p (75Hz) + AOC 27G2G8 (240Hz)', urls: ['https://www.google.com/search?q=Lenovo+L2251p', 'https://www.google.com/search?q=AOC+27G2G8+240Hz'] },
        { icon: 'keyboard', label: 'Keyboard', value: 'Dark Project Terra Nova (Wireless)', url: 'https://www.google.com/search?q=Dark+Project+Terra+Nova+keyboard' },
        { icon: 'mouse', label: 'Mouse', value: 'Dark Project Novus (Wireless)', url: 'https://www.google.com/search?q=Dark+Project+Novus+mouse' },
        { icon: 'microphone', label: 'Microphone', value: 'Fifine AM8 RGB', url: 'https://www.google.com/search?q=Fifine+AM8+RGB+microphone' },
        { icon: 'headset', label: 'Headphones', value: 'SteelSeries Arctis 9 (Wireless)', url: 'https://www.google.com/search?q=SteelSeries+Arctis+9+wireless' },
        { icon: 'vr-cardboard', label: 'VR', value: 'Meta Quest 3 (128GB)', url: 'https://www.google.com/search?q=Meta+Quest+3+128GB' }
    ]
};

// --- CONFIG DEFAULTS ---
function getDefaultConfig() {
    return {
        profile: {
            name: 'Piotrunius',
            bio: 'Minimalist designer & developer. Linux enthusiast from Katowice.',
            avatar: 'assets/pfp.png'
        },
        socials: [
            { label: 'GitHub', icon: 'github', url: 'https://github.com/Piotrunius', color: '#ffffff' },
            { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/piotrunius0', color: '#E1306C' },
            { label: 'Spotify', icon: 'spotify', url: 'https://stats.fm/piotrunius', color: '#1DB954' },
            { label: 'Minecraft', icon: 'house-chimney', url: 'https://namemc.com/profile/Piotrunius', color: '#d2d22cff' },
            { label: 'AniList', icon: 'circle-play', url: 'https://anilist.co/user/Piotrunius', color: '#1663ffff' },
            { label: 'Roblox', icon: 'cube', url: 'https://www.roblox.com/users/962249141/profile', color: '#EF3340' }
        ],
        music: {
            title: 'Smoking Alone',
            artist: 'BackDrop',
            url: 'https://pixabay.com/music/ambient-dark-ambient-background-music-smoking-alone-328352/'
        },
        audio: {
            src: 'assets/audio.mp3',
            volume: 0.4
        }
    };
}

async function loadConfig() {
    config = getDefaultConfig();
    return config;
}

// --- INIT HELPERS ---
function initProfile() {
    const avatar = document.getElementById('avatar');
    const nameEl = document.getElementById('profile-name');
    const bioEl = document.getElementById('profile-bio');
    if (avatar) avatar.src = config.profile?.avatar || 'assets/pfp.png';
    if (nameEl) nameEl.textContent = config.profile?.name || 'Piotrunius';
    if (bioEl) bioEl.textContent = config.profile?.bio || 'Bio';
}

function initSocials() {
    const container = document.getElementById('socials-container');
    if (!container) return;
    container.innerHTML = '';
    const socials = config.socials || [];
    socials.forEach((s, index) => {
        const a = document.createElement('a');
        a.className = 'social-link';
        a.href = s.url || '#';
        a.target = '_blank';
        a.rel = 'noreferrer';
        a.style.setProperty('--social-color', s.color || '#00ff88');
        a.style.animationDelay = `${index * 0.05}s`;
        const isBrand = ['github', 'discord', 'instagram', 'spotify', 'steam', 'twitch'].includes((s.icon || '').toLowerCase());
        a.innerHTML = `
            <i class="${isBrand ? 'fa-brands' : 'fas'} fa-${s.icon || 'link'}"></i>
            <span>${s.label}</span>
        `;
        container.appendChild(a);
    });
}

function initMusicMeta() {
    const titleEl = document.getElementById('music-title');
    const artistEl = document.getElementById('music-artist');
    if (titleEl) {
        titleEl.textContent = config.music?.title || 'Unknown';
        titleEl.href = config.music?.url || '#';
    }
    if (artistEl) artistEl.textContent = config.music?.artist || '';
}

// --- CORE FUNCTION: Render GitHub Activity ---
async function refreshGitHubStats() {
    const projectsEl = document.getElementById('stat-projects');
    const commitsEl = document.getElementById('stat-commits');
    const starsEl = document.getElementById('stat-stars');
    const lastUpdateEl = document.getElementById('stats-last-update');
    const activityStarsEl = document.getElementById('starred-list');
    const activityCommitsEl = document.getElementById('commits-list');

    const fallback = {
        "summary": { "projects": 0, "starredCount": 0, "commits": 0 },
        "recentCommits": [],
        "starred": [],
        "lastUpdate": new Date().toISOString()
    };

    let stats = fallback;
    try {
        const resp = await fetch(`data/github-stats.json?t=${Date.now()}`);
        if (resp.ok) {
            stats = await resp.json();
        } else {
            console.warn('GitHub stats request failed:', resp.status);
        }
    } catch (e) {
        console.warn('Error loading GitHub stats:', e.message);
    }

    const summary = stats.summary || {};
    if (projectsEl) projectsEl.textContent = summary.projects || '0';
    if (starsEl) starsEl.textContent = summary.starredCount || '0';
    if (commitsEl) commitsEl.textContent = summary.commits || '0';
    if (lastUpdateEl) {
        lastUpdateEl.textContent = `Last updated: ${formatPLDateTime(stats.lastUpdate || new Date().toISOString())}`;
    }

    // Use DocumentFragment for better performance
    if (activityStarsEl && Array.isArray(stats.starred)) {
        const fragment = document.createDocumentFragment();
        stats.starred.slice(0, 20).forEach((star, index) => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.style.animationDelay = `${index * 0.05}s`;
            item.innerHTML = `
                <div class="activity-header">
                    <a href="${star.url || '#'}" class="activity-link" target="_blank" rel="noreferrer">${star.name || 'Unknown'}</a>
                    <div class="meta-badge" title="Stars"><i class="fas fa-star"></i> ${star.stars || 0}</div>
                </div>
                <div class="activity-desc">${star.description || 'No description.'}</div>
                <div class="activity-meta-row">
                    <div class="meta-badge"><i class="fas fa-user"></i> ${star.owner || 'Unknown'}</div>
                    <div class="meta-badge"><i class="fas fa-code"></i> ${star.language || 'Code'}</div>
                    <span class="meta-date">${formatPLDateTime(star.starredAt, true)}</span>
                </div>
            `;
            fragment.appendChild(item);
        });
        activityStarsEl.innerHTML = '';
        activityStarsEl.appendChild(fragment);
    }

    if (activityCommitsEl && Array.isArray(stats.recentCommits)) {
        const fragment = document.createDocumentFragment();
        stats.recentCommits
            .filter(c => {
                const msg = (c.message || '').toLowerCase();
                const author = (c.author || '').toLowerCase();
                // Filter out bot commits and automated chore commits
                return !author.includes('bot') && 
                       !author.includes('action') &&
                       !msg.startsWith('chore: automated');
            })
            .slice(0, 20)
            .forEach((commit, index) => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.style.animationDelay = `${index * 0.05}s`;
                item.innerHTML = `
                    <div class="activity-header">
                        <a href="${commit.url || '#'}" class="activity-link" target="_blank" rel="noreferrer">${commit.message || 'No message'}</a>
                    </div>
                    <div class="activity-desc">Repository: ${commit.repo || 'Unknown'}</div>
                    <div class="activity-meta-row">
                        <div class="meta-badge"><i class="fas fa-user-circle"></i> ${commit.author || 'Unknown'}</div>
                        <span class="meta-date">${formatPLDateTime(commit.date, true)}</span>
                    </div>
                `;
                fragment.appendChild(item);
            });
        activityCommitsEl.innerHTML = '';
        activityCommitsEl.appendChild(fragment);
    }
}



// --- CORE FUNCTION: Render Steam Status ---
async function refreshSteamStatus() {
    const steamPanel = document.getElementById('steam-status-panel');
    if (!steamPanel) return;

    let stats = { steam: { personastate: 0, gameextrainfo: null } };
    try {
        const resp = await fetch(`data/steam-status.json?t=${Date.now()}`);
        if (resp.ok) {
            stats = await resp.json();
        } else {
            console.warn('Steam status request failed:', resp.status);
        }
    } catch (e) {
        console.warn('Error loading Steam status:', e.message);
    }

    const s = stats.steam || {};
    const statusText = document.getElementById('steam-status-text');
    const gameInfo = document.getElementById('steam-game-info');
    const dotContainer = document.getElementById('steam-dot')?.parentElement;
    const steamPfp = document.getElementById('steam-pfp');

    // Validate and sanitize Steam avatar URL
    if (s.avatar && steamPfp) {
        const avatarUrl = s.avatar;
        // Validate that URL is from Steam CDN
        if (avatarUrl.startsWith('https://avatars.akamai.steamstatic.com/') || 
            avatarUrl.startsWith('https://steamcdn-a.akamaihd.net/')) {
            steamPfp.src = avatarUrl;
            steamPfp.onerror = () => { steamPfp.src = 'assets/pfp.png'; };
        } else {
            console.warn('Invalid Steam avatar URL detected:', avatarUrl);
            steamPfp.src = 'assets/pfp.png';
        }
    }

    const memberSince = document.getElementById('steam-member-since');
    const gameCount = document.getElementById('steam-game-count');

    if (s.timecreated && memberSince) {
        memberSince.innerHTML = `<i class="fas fa-calendar-alt"></i> Since ${new Date(s.timecreated * 1000).getFullYear()}`;
    }
    if (s.game_count !== undefined && gameCount) {
        gameCount.innerHTML = `<i class="fas fa-gamepad"></i> ${s.game_count} Games`;
    }

    if (!dotContainer) return;
    
    dotContainer.className = 'steam-avatar-wrapper';
    if (s.gameextrainfo) {
        dotContainer.classList.add('in-game');
        if (statusText) statusText.textContent = 'In-game';
        if (gameInfo) {
            gameInfo.textContent = `Playing: ${s.gameextrainfo}`;
            gameInfo.style.color = '#90ff47';
            gameInfo.style.display = 'block';
        }
    } else {
        if (gameInfo) gameInfo.style.display = 'none';
        // Map personastate values properly:
        // 0 = Offline, 1 = Online, 2 = Busy, 3 = Away, 4 = Snooze, 5 = Looking to trade, 6 = Looking to play
        switch(s.personastate) {
            case 1:
                dotContainer.classList.add('online');
                if (statusText) statusText.textContent = 'Online';
                break;
            case 2:
                dotContainer.classList.add('busy');
                if (statusText) statusText.textContent = 'Busy';
                break;
            case 3:
            case 4:
                dotContainer.classList.add('away');
                if (statusText) statusText.textContent = 'Away';
                break;
            case 5:
            case 6:
                dotContainer.classList.add('online');
                if (statusText) statusText.textContent = 'Online';
                break;
            default:
                dotContainer.classList.add('offline');
                if (statusText) statusText.textContent = 'Offline';
        }
    }
}

// --- CORE FUNCTION: Render Setup (Safe & Visible) ---
function initSetup() {
    const pcSpecs = document.getElementById('pc-specs');
    const setupSpecs = document.getElementById('setup-specs');

    // Helper to render lists
    const renderList = (container, items) => {
        if (!container) return;
        container.innerHTML = '';
        items.forEach((item, index) => {
            const el = document.createElement('a');
            el.className = 'spec-item'; // Ta klasa musi mieć opacity: 1 !important w CSS jeśli są problemy
            el.style.animationDelay = `${index * 0.05}s`;

            // Handle multiple URLs or single URL
            if (item.urls && Array.isArray(item.urls)) {
                el.href = '#';
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    item.urls.forEach(url => window.open(url, '_blank'));
                });
            } else {
                el.href = item.url || '#';
                el.target = '_blank';
                el.rel = 'noreferrer';
            }

            el.innerHTML = `
                <i class="fas fa-${item.icon}"></i>
                <span>${item.label}${item.value ? `<small> - ${item.value}</small>` : ''}</span>
            `;
            container.appendChild(el);
        });
    };

    renderList(pcSpecs, setupData.pc);
    renderList(setupSpecs, setupData.gear);
}

// --- UTILS ---
function formatPLDateTime(dateInput, short = false) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');

    if (short) return `${day}.${month}.${year} ${hours}:${mins}`;
    return `${day}.${month}.${year}, ${hours}:${mins}`;
}

// --- AUDIO & VISUALIZER ---
function initControls() {
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }
    const audio = document.getElementById('bg-audio');
    if (audio) {
        audio.addEventListener('play', () => { audioPlaying = true; updateAudioButton(); });
        audio.addEventListener('pause', () => { audioPlaying = false; updateAudioButton(); });
    }
}

function toggleAudio() {
    const audio = document.getElementById('bg-audio');
    if (!audio) return;
    if (config.audio?.src) audio.src = config.audio.src;
    audio.volume = config.audio?.volume || 0.4;

    if (!audioPlaying) {
        audio.play().then(() => {
            audioPlaying = true;
            initAudioVisualizer();
            updateAudioButton();
        }).catch(err => console.log('Audio play failed:', err));
    } else {
        audio.pause();
        audioPlaying = false;
        updateAudioButton();
    }
}

function updateAudioButton() {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    const label = btn.querySelector('span');
    if (icon) icon.className = audioPlaying ? 'fas fa-pause' : 'fas fa-play';
    if (label) label.textContent = audioPlaying ? 'Pause' : 'Play';
}

function initAudioVisualizer() {
    const audio = document.getElementById('bg-audio');
    const canvas = document.getElementById('visualizer');
    if (!audio || !canvas) return;

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
    }

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Resize handling
    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Store the animate function to reuse it when resuming
    window.visualizerAnimate = function () {
        if (!audioPlaying || document.hidden) {
            cancelAnimationFrame(visualizerAnimationFrame);
            return;
        }
        visualizerAnimationFrame = requestAnimationFrame(window.visualizerAnimate);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, 'rgba(0,255,136,0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    };

    // Start animation if not already running
    window.visualizerAnimate();
}

function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 3 + 2;
            this.baseSize = this.size;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = Math.random() > 0.5 ? 'rgba(0, 255, 136,' : 'rgba(0, 184, 255,';
        }
        update() {
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.vx -= Math.cos(angle) * force * 0.5;
                    this.vy -= Math.sin(angle) * force * 0.5;
                    this.size = this.baseSize * (1 + force * 0.5);
                } else {
                    this.size += (this.baseSize - this.size) * 0.1;
                }
            }

            // Add subtle drift back to center
            this.vx += (Math.random() - 0.5) * 0.02;
            this.vy += (Math.random() - 0.5) * 0.02;
            
            // Limit velocity
            const maxSpeed = 1;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }

            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            if (this.size > this.baseSize) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color + '0.5)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        // Connect nearby particles (optimized to avoid creating new arrays)
        connect(particles, startIndex) {
            // Limit connections to improve performance
            const maxConnections = 3;
            let connectionCount = 0;
            
            for (let i = startIndex + 1; i < particles.length && connectionCount < maxConnections; i++) {
                const particle = particles[i];
                const dx = this.x - particle.x;
                const dy = this.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 * (1 - distance / 120)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(particle.x, particle.y);
                    ctx.stroke();
                    connectionCount++;
                }
            }
        }
    }

    // Adaptive particle count based on device
    const particleCount = deviceCapabilities.isLowEnd ? PARTICLE_COUNTS.LOW_END : 
                         deviceCapabilities.isMobile ? PARTICLE_COUNTS.MOBILE : 
                         PARTICLE_COUNTS.DESKTOP;
    
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    // Store animate function globally
    window.particlesAnimate = function () {
        if (document.hidden) {
            cancelAnimationFrame(particlesAnimationFrame);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach((p, i) => {
            p.update();
            p.draw();
            // Only connect particles if not on mobile/low-end
            if (!deviceCapabilities.isMobile && !deviceCapabilities.isLowEnd) {
                p.connect(particles, i);
            }
        });
        
        particlesAnimationFrame = requestAnimationFrame(window.particlesAnimate);
    };

    // Only start particles if not low-end device
    if (!deviceCapabilities.isLowEnd) {
        window.particlesAnimate();
    } else {
        console.log('Particles disabled for low-end device');
    }
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-right, .animate-slide-left');
    animatedElements.forEach(el => observer.observe(el));
}

function initParallaxEffect() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const bgLayer = document.querySelector('.bg-layer');
                const bgCanvas = document.getElementById('bg-canvas');
                
                if (bgLayer) {
                    // Parallax effect on background blobs
                    bgLayer.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
                
                if (bgCanvas) {
                    // Slight parallax on particles
                    bgCanvas.style.transform = `translateY(${scrolled * 0.15}px)`;
                }
                
                // Add depth to cards based on scroll position
                const cards = document.querySelectorAll('.glass-card');
                cards.forEach((card, index) => {
                    const rect = card.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    
                    if (isVisible) {
                        const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;
                        const parallaxSpeed = 0.05 * (index % 2 === 0 ? 1 : -1);
                        card.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
                    }
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

function initTypingEffect() {
    const bioEl = document.getElementById('profile-bio');
    if (!bioEl) return;
    const text = config.profile?.bio || bioEl.textContent;
    bioEl.textContent = '';
    bioEl.classList.add('typing-cursor');

    let i = 0;
    const type = () => {
        if (i < text.length) {
            bioEl.textContent += text.charAt(i);
            i++;
            setTimeout(type, 30 + Math.random() * 50);
        } else {
            setTimeout(() => bioEl.classList.remove('typing-cursor'), 1000);
        }
    };
    setTimeout(type, 500); // Initial delay
}

function initMouseEffects() {
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach(card => {
        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });

        // 3D tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// --- VISIBILITY & PERFORMANCE OPTIMIZATION ---
function initVisibilityOptimization() {
    document.addEventListener('visibilitychange', () => {
        const audio = document.getElementById('bg-audio');

        if (document.hidden) {
            // PAGE HIDDEN: Freeze everything
            console.log('Page hidden: Freezing resources...');

            // 1. Pause Audio
            if (audioPlaying) {
                wasAudioPlaying = true;
                if (audio) audio.pause();
                // We keep audioPlaying = true logic visually, but pause underlying audio
                // to resume it correctly later without changing UI state
            } else {
                wasAudioPlaying = false;
            }

            // 2. Stop Visualizer Loop
            if (visualizerAnimationFrame) {
                cancelAnimationFrame(visualizerAnimationFrame);
            }

            // 3. Stop Particles Loop
            if (particlesAnimationFrame) {
                cancelAnimationFrame(particlesAnimationFrame);
            }

        } else {
            // PAGE VISIBLE: Resume
            console.log('Page visible: Resuming resources...');

            // 1. Resume Audio if it was playing
            if (wasAudioPlaying && audio) {
                audio.play().catch(e => console.log('Resume play failed:', e));
            }

            // 2. Resume Visualizer if audio is playing
            if (audioPlaying && window.visualizerAnimate) {
                window.visualizerAnimate();
            }

            // 3. Resume Particles
            if (window.particlesAnimate) {
                window.particlesAnimate();
            }

            // 4. Refresh stats immediately on return
            refreshGitHubStats();
            refreshSteamStatus();
        }
    });
}

// --- SPOTIFY HUB LOGIC (Lanyard API) ---
let lastSpotifyData = null;
let spotifyPredictorInterval = null;

async function updateSpotifyStatus() {
    const container = document.getElementById('spotify-content');
    const discordId = '1166309729371439104';

    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await response.json();

        if (data.success && data.data.spotify) {
            const spotify = data.data.spotify;

            // Render initial or updated state
            renderSpotifyActive(container, spotify);

            // Auto-stop local audio on new track
            if (!lastSpotifyData || lastSpotifyData.track_id !== spotify.track_id) {
                const audio = document.getElementById('bg-audio');
                if (audio && !audio.paused) {
                    audio.pause();
                    audioPlaying = false;
                    updateAudioButton();
                }
            }
            lastSpotifyData = spotify;

            // Start prediction loop if not running
            if (!spotifyPredictorInterval) {
                spotifyPredictorInterval = setInterval(predictSpotifyProgress, 1000);
            }
        } else {
            renderSpotifyEmpty(container);
            lastSpotifyData = null;
            if (spotifyPredictorInterval) {
                clearInterval(spotifyPredictorInterval);
                spotifyPredictorInterval = null;
            }
        }
    } catch (err) {
        console.error('Spotify status error:', err);
    }
}

function predictSpotifyProgress() {
    if (!lastSpotifyData) return;
    const container = document.getElementById('spotify-content');
    if (!container) return;
    renderSpotifyActive(container, lastSpotifyData);
}

function renderSpotifyActive(container, spotify) {
    const start = spotify.timestamps.start;
    const end = spotify.timestamps.end;
    const now = Date.now();
    const total = end - start;
    const elapsed = Math.min(Math.max(now - start, 0), total);
    const progress = (elapsed / total) * 100;

    const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return `${m}:${String(s % 60).padStart(2, '0')}`;
    };

    // Use a simplified render to avoid heavy DOM reconstruction every second
    const bar = container.querySelector('.spotify-progress-bar');
    const timeStart = container.querySelector('.spotify-time span:first-child');

    if (bar && timeStart && container.dataset.trackId === spotify.track_id) {
        bar.style.width = `${progress}%`;
        timeStart.textContent = formatTime(elapsed);
        return;
    }

    container.dataset.trackId = spotify.track_id;
    container.innerHTML = `
        <div class="spotify-active-layout">
            <div class="spotify-art-wrapper">
                <img src="${spotify.album_art_url}" alt="Album Art">
            </div>
            <div class="spotify-details">
                <div class="spotify-track-name">${spotify.song}</div>
                <div class="spotify-artist-name">${spotify.artist}</div>
                ${spotify.album && spotify.album !== spotify.song ? `<div class="spotify-album-name">${spotify.album}</div>` : ''}

                <div class="spotify-progress-container">
                    <div class="spotify-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="spotify-time">
                    <span>${formatTime(elapsed)}</span>
                    <span>${formatTime(total)}</span>
                </div>
            </div>
            <div class="music-controls">
                <a href="https://open.spotify.com/track/${spotify.track_id}" target="_blank" rel="noreferrer" class="music-btn spotify-btn">
                    <i class="fa-brands fa-spotify"></i>
                    <span>Open in Spotify</span>
                </a>
            </div>
        </div>
    `;
    container.className = 'spotify-content';
}

function renderSpotifyEmpty(container) {
    if (container.classList.contains('empty')) return;
    container.innerHTML = `
        <div class="spotify-placeholder">
            <i class="fas fa-headphones"></i>
            <span>Not listening right now</span>
        </div>
    `;
    container.className = 'spotify-content empty';
    delete container.dataset.trackId;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Register Service Worker for offline support
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New version available! Refresh to update.');
                    }
                });
            });
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
    
    // Detect device capabilities first
    detectDeviceCapabilities();
    applyPerformanceOptimizations();
    
    await loadConfig();
    initProfile();
    initSocials();
    initMusicMeta();
    initSetup();          
    refreshGitHubStats(); 
    refreshSteamStatus();
    updateSpotifyStatus();
    initControls();
    
    // Initialize particles only after capability detection
    initParticles();
    
    initScrollReveal();
    initParallaxEffect();   
    initTypingEffect();   
    initMouseEffects();
    initVisibilityOptimization();
    initWipNotice();
    initThemeToggle();

    // Auto-refresh stats with adaptive intervals
    const statsInterval = deviceCapabilities.isLowEnd ? 600000 : 300000; // 10 or 5 minutes
    const steamInterval = deviceCapabilities.isLowEnd ? 120000 : 60000;   // 2 or 1 minute
    const spotifyInterval = deviceCapabilities.isLowEnd ? 45000 : 30000;  // 45 or 30 seconds
    
    setInterval(refreshGitHubStats, statsInterval);
    setInterval(refreshSteamStatus, steamInterval);
    setInterval(updateSpotifyStatus, spotifyInterval);
});

// --- WIP Notice Handler ---
// Initializes the Work-in-Progress notice banner
// Shows a dismissible notice to users that the site is under development
// Uses localStorage to remember if the user has dismissed the notice
function initWipNotice() {
    const notice = document.getElementById('wip-notice');
    const closeBtn = document.getElementById('wip-close');
    
    if (!notice || !closeBtn) return;
    
    // Check if user has dismissed the notice before
    const dismissed = localStorage.getItem('wip-notice-dismissed');
    if (dismissed === 'true') {
        notice.style.display = 'none';
        return;
    }
    
    // Handle close button
    closeBtn.addEventListener('click', () => {
        notice.classList.add('hidden');
        localStorage.setItem('wip-notice-dismissed', 'true');
        setTimeout(() => {
            notice.style.display = 'none';
        }, 300);
    });
}

// --- Theme Toggle Handler ---
// Initializes the theme toggle button for switching between dark and light modes
// Uses localStorage to persist user's theme preference
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply saved theme
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon(themeToggle, 'light');
    }
    
    // Handle theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        const theme = isLight ? 'light' : 'dark';
        
        // Save preference
        localStorage.setItem('theme', theme);
        
        // Update icon
        updateThemeIcon(themeToggle, theme);
    });
}

function updateThemeIcon(button, theme) {
    const icon = button.querySelector('i');
    if (!icon) return;
    
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}
