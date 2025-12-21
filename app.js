let config = {};
let bgAnimationFrame = null;
let visualizerAnimationFrame = null; // New variable to control visualizer loop
let particlesAnimationFrame = null; // New variable to control particle loop
let audioContext = null;
let analyser = null;
let audioPlaying = false;
let wasAudioPlaying = false; // Track audio state before tab switch
const githubUsername = 'Piotrunius';

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
            { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/piotrunius0/', color: '#E1306C' },
            { label: 'Spotify', icon: 'spotify', url: 'https://stats.fm/piotrunius', color: '#1DB954' },
            { label: 'Steam', icon: 'steam', url: 'https://steamcommunity.com/id/Piotrunius/', color: '#00adee' },
            { label: 'AniList', icon: 'circle-play', url: 'https://anilist.co/user/Piotrunius/', color: '#1663ffff' },
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

// --- CORE FUNCTION: Render Activity Feed (BOGATE DANE, SCROLL, 20 LIMIT) ---
async function updateGitHubStats() {
    const projectsEl = document.getElementById('stat-projects');
    const commitsEl = document.getElementById('stat-commits');
    const starsEl = document.getElementById('stat-stars');
    const lastUpdateEl = document.getElementById('stats-last-update');

    // Używamy nazw z poprzedniego prompta (activity-stars/commits)
    const activityStarsEl = document.getElementById('starred-list');
    const activityCommitsEl = document.getElementById('commits-list');

    // Fallback data to ensure UI works even if fetch fails (e.g. CORS on file://)
    const fallbackStats = {
        "steam": { "personastate": 0, "gameextrainfo": null },
        "summary": {
            "projects": 3,
            "starredCount": 21,
            "commits": 33
        },
        "repos": [],
        "recentCommits": [
            { "message": "refactor: rewrite updateGitHubStats...", "repo": "Bio", "author": "Piotrunius", "date": "2025-12-20T22:07:38Z", "url": "#" },
            { "message": "chore: update github stats", "repo": "Bio", "author": "GitHub Action", "date": "2025-12-20T22:01:22Z", "url": "#" }
        ],
        "starred": [
            { "name": "Graphs", "owner": "bloominstituteoftechnology", "stars": 77, "language": "Python", "description": "Graphs, BFS, DFS...", "starredAt": "2025-12-20T22:08:58.151Z", "url": "#" },
            { "name": "qwen-code", "owner": "QwenLM", "stars": 16590, "language": "TypeScript", "description": "Qwen Code is a coding agent...", "starredAt": "2025-12-20T22:08:58.151Z", "url": "#" }
        ],
        "lastUpdate": "2025-12-20T22:08:58.151Z"
    };

    let stats = fallbackStats;

    try {
        // Use cache busting to ensure we get fresh data from the server
        const cacheBuster = Date.now();
        let response = await fetch(`github-stats.json?t=${cacheBuster}`);
        if (!response.ok) {
            response = await fetch(`assets/github-stats.json?t=${cacheBuster}`);
        }
        
        if (response.ok) {
            stats = await response.json();
        }
    } catch (e) {
        console.warn('Error loading GitHub stats, using fallback:', e);
    }

    try {
        const summary = stats.summary || {};

        // 1. Render Summary Stats
        if (projectsEl) projectsEl.textContent = summary.projects || '0';
        if (starsEl) starsEl.textContent = summary.starredCount || '0';
        if (commitsEl) commitsEl.textContent = summary.commits || '0';

        // Fix: Ensure lastUpdate is handled safely
        if (lastUpdateEl) {
            const dateStr = stats.lastUpdate || new Date().toISOString();
            lastUpdateEl.textContent = `Last updated: ${formatPLDateTime(dateStr)}`;
        }

        // 2. Render Recent Starred (Top 20, RICH DATA)
        if (activityStarsEl && stats.starred) {
            activityStarsEl.innerHTML = '';
            const starsData = stats.starred.slice(0, 20); // LIMIT 20

            starsData.forEach((star, index) => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.style.animationDelay = `${index * 0.05}s`;

                const name = star.name || 'Unknown Repo';
                const owner = star.owner || 'Unknown';
                const starCount = star.stars || 0;
                const lang = star.language || 'Code';
                const desc = star.description || 'No description provided.';

                item.innerHTML = `
                    <div class="activity-header">
                        <a href="${star.url}" class="activity-link" target="_blank" rel="noreferrer">${name}</a>
                        <div class="meta-badge" title="Stars">
                            <i class="fas fa-star"></i> ${starCount}
                        </div>
                    </div>
                    <div class="activity-desc">${desc}</div>
                    <div class="activity-meta-row">
                        <div class="meta-badge"><i class="fas fa-user"></i> ${owner}</div>
                        <div class="meta-badge"><i class="fas fa-code"></i> ${lang}</div>
                        <span class="meta-date">${formatPLDateTime(star.starredAt, true)}</span>
                    </div>
                `;
                activityStarsEl.appendChild(item);
            });
        }

        // 3. Render Recent Commits (Top 20, RICH DATA)
        if (activityCommitsEl && stats.recentCommits) {
            activityCommitsEl.innerHTML = '';
            
            // Filter out automated commits (bots and chores)
            const filteredCommits = stats.recentCommits.filter(commit => {
                const author = (commit.author || '').toLowerCase();
                const msg = (commit.message || '').toLowerCase();
                const isBot = author === 'github-actions[bot]' || author === 'github action';
                const isChore = msg.includes('chore:');
                return !isBot && !isChore;
            });

            const commitsData = filteredCommits.slice(0, 20); // LIMIT 20

            commitsData.forEach((commit, index) => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.style.animationDelay = `${index * 0.05}s`;

                const msg = (commit.message || 'No message').split('\n')[0];
                const repo = commit.repo || 'Unknown';
                const author = commit.author || 'Piotrunius';

                item.innerHTML = `
                    <div class="activity-header">
                        <a href="${commit.url}" class="activity-link" target="_blank" rel="noreferrer">${msg}</a>
                    </div>
                    <div class="activity-desc">Repository: ${repo}</div>
                    <div class="activity-meta-row">
                        <div class="meta-badge"><i class="fas fa-user-circle"></i> ${author}</div>
                        <span class="meta-date">${formatPLDateTime(commit.date, true)}</span>
                    </div>
                `;
                activityCommitsEl.appendChild(item);
            });
        }
        
        console.log('GitHub Stats rendered successfully.');

        // 4. Render Steam Status
        const steamPanel = document.getElementById('steam-status-panel');
        if (steamPanel && stats.steam) {
            const s = stats.steam;
            const statusText = document.getElementById('steam-status-text');
            const gameInfo = document.getElementById('steam-game-info');
            const dotContainer = document.getElementById('steam-dot').parentElement; // The wrapper
            const steamPfp = document.getElementById('steam-pfp');
            
            // Update Avatar if available
            if (s.avatar && steamPfp) {
                steamPfp.src = s.avatar;
            }

            // Update Extra Info
            const memberSince = document.getElementById('steam-member-since');
            const gameCount = document.getElementById('steam-game-count');
            const playtime = document.getElementById('steam-total-playtime');
            const lastOnline = document.getElementById('steam-last-online');
            
            if (s.timecreated && memberSince) {
                const year = new Date(s.timecreated * 1000).getFullYear();
                memberSince.innerHTML = `<i class="fas fa-calendar-alt"></i> Since ${year}`;
            }

            if (s.game_count !== undefined && gameCount) {
                gameCount.innerHTML = `<i class="fas fa-gamepad"></i> ${s.game_count} Games`;
            }

            if (s.total_playtime !== undefined && playtime) {
                playtime.innerHTML = `<i class="fas fa-hourglass-half"></i> ${s.total_playtime} hrs`;
            }
            
            if (lastOnline && s.lastlogoff) {
                const date = new Date(s.lastlogoff * 1000);
                lastOnline.innerHTML = `<i class="fas fa-clock"></i> Seen ${date.toLocaleDateString()}`;
                lastOnline.style.display = 'flex';
            }
            
            // Reset wrapper classes for colors
            dotContainer.className = 'steam-avatar-wrapper';
            
            if (s.gameextrainfo) {
                dotContainer.classList.add('in-game');
                statusText.textContent = 'In-game';
                gameInfo.textContent = `Playing: ${s.gameextrainfo}`;
                gameInfo.style.color = '#90ff47';
            } else {
                gameInfo.style.color = ''; 
                gameInfo.textContent = 'Not playing anything right now';
                
                if (s.personastate > 0) {
                    dotContainer.classList.add('online');
                    statusText.textContent = 'Online';
                } else {
                    dotContainer.classList.add('offline');
                    statusText.textContent = 'Offline';
                }
            }
        }

    } catch (renderErr) {
        console.error('Error rendering stats:', renderErr);
        if (lastUpdateEl) lastUpdateEl.textContent = 'Data error';
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

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 3 + 2; // Increased size (2-5px)
            this.color = `rgba(0, 255, 136, ${Math.random() * 0.3})`; // Slightly more opaque
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle()); // More particles (120)

    // Store animate function globally (or in a wider scope) to access it for visibility change
    window.particlesAnimate = function () {
        if (document.hidden) {
            cancelAnimationFrame(particlesAnimationFrame);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        particlesAnimationFrame = requestAnimationFrame(window.particlesAnimate);
    };

    window.particlesAnimate();
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
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.01)');
        card.addEventListener('mouseleave', () => card.style.transform = '');
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
            updateGitHubStats();
        }
    });
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initProfile();
    initSocials();
    initMusicMeta();
    initSetup();          // Restore Setup Items
    updateGitHubStats();  // Restore Rich GitHub Feed
    initControls();
    initParticles();      // New Particle Effect
    initScrollReveal();   // New Scroll Animations
    initTypingEffect();   // New Typing Effect
    initMouseEffects();
    initVisibilityOptimization(); // New Performance Optimization
    
    // Auto-refresh stats every 2 minutes for "live" Steam status
    setInterval(updateGitHubStats, 120000);
    
});
