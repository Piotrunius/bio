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
            bio: 'Developer & tech enthusiast from Poland.',
            avatar: 'assets/pfp.png'
        },
        socials: [
            { label: 'GitHub', icon: 'github', url: 'https://cloud.umami.is/q/O3Fj6wLHk', color: '#ffffff' },
            { label: 'Instagram', icon: 'instagram', url: 'https://cloud.umami.is/q/b85eLVM8c', color: '#E1306C' },
            { label: 'Spotify', icon: 'spotify', url: 'https://cloud.umami.is/q/Z53FK7OkW', color: '#1DB954' },
            { label: 'Minecraft', icon: 'house-chimney', url: 'https://cloud.umami.is/q/C3JQxbvsd', color: '#d2d22cff' },
            { label: 'AniList', icon: 'circle-play', url: 'https://cloud.umami.is/q/UOWpL3Lis', color: '#1663ffff' },
            { label: 'Roblox', icon: 'cube', url: 'https://cloud.umami.is/q/fjiMxwjQJ', color: '#EF3340' }
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
        // Track social link clicks
        a.addEventListener('click', () => {
            if (window.umami) {
                window.umami.track('Social Link Clicked', { platform: s.label });
            }
        });
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
    
    // Animate counters for better visual effect
    if (projectsEl) {
        const targetProjects = summary.projects || 0;
        if (projectsEl.textContent === '0' || !projectsEl.dataset.animated) {
            animateCounter(projectsEl, targetProjects, 1500);
            projectsEl.dataset.animated = 'true';
        } else {
            projectsEl.textContent = targetProjects;
        }
    }
    
    if (starsEl) {
        const targetStars = summary.starredCount || 0;
        if (starsEl.textContent === '0' || !starsEl.dataset.animated) {
            animateCounter(starsEl, targetStars, 1500);
            starsEl.dataset.animated = 'true';
        } else {
            starsEl.textContent = targetStars;
        }
    }

    // Fetch all commits from GitHub API
    let allCommits = [];
    try {
        const userName = 'Piotrunius';
        const commitsResp = await fetch(`https://api.github.com/search/commits?q=author:${userName}&sort=committer-date&order=desc&per_page=100`);
        if (commitsResp.ok) {
            const commitsData = await commitsResp.json();
            allCommits = commitsData.items || [];
        }
    } catch (e) {
        console.warn('Error fetching commits from GitHub API:', e.message);
    }

    if (commitsEl) {
        const commitCount = allCommits.length || 0;
        if (commitsEl.textContent === '0' || !commitsEl.dataset.animated) {
            animateCounter(commitsEl, commitCount, 1500);
            commitsEl.dataset.animated = 'true';
        } else {
            commitsEl.textContent = commitCount;
        }
    }
    if (lastUpdateEl) {
        lastUpdateEl.textContent = `Last updated: ${formatPLDateTime(new Date().toISOString())}`;
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

    // Display all commits from GitHub API
    if (activityCommitsEl && allCommits.length > 0) {
        const fragment = document.createDocumentFragment();
        allCommits
            .slice(0, 50) // Show up to 50 commits
            .forEach((commit, index) => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.style.animationDelay = `${index * 0.05}s`;

                const message = commit.commit?.message?.split('\n')[0] || 'No message';
                const author = commit.commit?.author?.name || 'Unknown';
                const date = commit.commit?.author?.date || new Date().toISOString();
                const repoName = commit.repository?.name || 'Unknown';
                const repoUrl = commit.repository?.html_url || '#';
                const commitUrl = commit.html_url || '#';

                item.innerHTML = `
                    <div class="activity-header">
                        <a href="${commitUrl}" class="activity-link" target="_blank" rel="noreferrer">${message}</a>
                    </div>
                    <div class="activity-desc"><a href="${repoUrl}" target="_blank" rel="noreferrer" style="color: var(--primary); text-decoration: none;">${repoName}</a></div>
                    <div class="activity-meta-row">
                        <div class="meta-badge"><i class="fas fa-user-circle"></i> ${author}</div>
                        <span class="meta-date">${formatPLDateTime(date, true)}</span>
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
            gameInfo.style.color = '#43b581';
            gameInfo.style.display = 'block';
        }
    } else {
        if (gameInfo) gameInfo.style.display = 'none';
        // Map personastate values properly:
        // 0 = Offline, 1 = Online, 2 = Busy, 3 = Away, 4 = Snooze, 5 = Looking to trade, 6 = Looking to play
        switch (s.personastate) {
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

// --- DISCORD STATUS ---
async function refreshDiscordStatus() {
    const discordDot = document.getElementById('discord-dot');
    const discordStatus = document.getElementById('discord-status-text');
    const discordActivityInfo = document.getElementById('discord-activity-info');
    const discordPlaying = document.getElementById('discord-playing');
    const discordAvatarWrapper = document.querySelector('.discord-avatar-wrapper');
    const discordUsernameEl = document.querySelector('.discord-username');

    // Your Discord User ID
    const discordUserId = '1166309729371439104';

    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
        if (response.ok) {
            const data = await response.json();
            const user = data.data;

            // Update status
            const statusMap = {
                'online': 'Online',
                'idle': 'Idle',
                'dnd': 'Do Not Disturb',
                'offline': 'Offline'
            };

            const statusText = statusMap[user.discord_status] || user.discord_status;
            const statusClass = user.discord_status || 'offline';
            const username = (user.discord_user && user.discord_user.username) ? user.discord_user.username : 'Piotrunius';

            if (discordStatus) {
                discordStatus.textContent = statusText;
            }

            if (discordUsernameEl) {
                discordUsernameEl.textContent = username;
            }

            if (discordAvatarWrapper) {
                discordAvatarWrapper.className = `discord-avatar-wrapper ${statusClass}`;
            }

            if (discordDot) {
                discordDot.className = `status-dot`;
            }

            // Update activity info
            if (discordActivityInfo) {
                if (user.activities && user.activities.length > 0) {
                    const activity = user.activities.find(a => a.type !== 4); // Exclude custom status
                    if (activity) {
                        const activityTypeMap = {
                            0: 'Playing',
                            1: 'Streaming',
                            2: 'Listening',
                            3: 'Watching',
                            5: 'Competing'
                        };

                        const activityType = activityTypeMap[activity.type] || 'Activity';
                        discordActivityInfo.textContent = `${activityType}: ${activity.name}`;
                        discordActivityInfo.style.display = 'block';
                        discordPlaying.textContent = '';
                    } else {
                        discordActivityInfo.style.display = 'none';
                        discordPlaying.textContent = '';
                    }
                } else {
                    discordActivityInfo.style.display = 'none';
                    discordPlaying.textContent = '';
                }
            }
        }
    } catch (e) {
        console.warn('Error fetching Discord status from Lanyard:', e.message);
        // Fallback
        if (discordStatus) discordStatus.textContent = 'Offline';
        if (discordAvatarWrapper) discordAvatarWrapper.className = 'discord-avatar-wrapper offline';
        if (discordDot) discordDot.className = 'status-dot';
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

    // Adaptive particle count based on device
    const particleCount = deviceCapabilities.isLowEnd ? PARTICLE_COUNTS.LOW_END :
        deviceCapabilities.isMobile ? PARTICLE_COUNTS.MOBILE :
            PARTICLE_COUNTS.DESKTOP;

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

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
    if ('serviceWorker' in navigator && false) { // Disabled temporarily
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
    refreshDiscordStatus();
    updateSpotifyStatus();
    initControls();

    // Initialize particles only after capability detection
    initParticles();

    initScrollReveal();
    initTypingEffect();
    initMouseEffects();
    initVisibilityOptimization();
    initWipNotice();
    initThemeToggle();
    updateCopyrightYear();
    initBackToTop();
    
    // Initialize new features
    initKeyboardNavigation();
    initSmoothScroll();
    enhanceAccessibility();
    NotificationManager.init();

    // Auto-refresh stats with adaptive intervals
    const statsInterval = deviceCapabilities.isLowEnd ? 600000 : 300000; // 10 or 5 minutes
    const steamInterval = deviceCapabilities.isLowEnd ? 120000 : 60000;   // 2 or 1 minute
    const spotifyInterval = deviceCapabilities.isLowEnd ? 45000 : 30000;  // 45 or 30 seconds

    setInterval(refreshGitHubStats, statsInterval);
    setInterval(refreshSteamStatus, steamInterval);
    setInterval(refreshDiscordStatus, 15000); // Update Discord status every 15 seconds
    setInterval(updateSpotifyStatus, spotifyInterval);

    // Load projects
    loadProjects();
    
    // Log performance metrics after everything loads
    window.addEventListener('load', () => {
        setTimeout(logPerformanceMetrics, 100);
    });
});

// --- PROJECTS SECTION ---
async function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        // Fetch repositories
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100&type=owner`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();

        // Target specific repositories
        const targetNames = ['AutoClicker-AntiAFK'];
        let allRepos = repos.filter(r => targetNames.includes(r.name));

        // Add external project from aresysite
        try {
            const externalResponse = await fetch('https://api.github.com/repos/aresysite/Broadcast-generator', {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (externalResponse.ok) {
                const externalRepo = await externalResponse.json();
                allRepos.push(externalRepo);
            }
        } catch (e) {
            console.warn('Failed to fetch external project:', e);
        }

        if (allRepos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-code" style="font-size: 3rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
                    <p>No projects to display</p>
                </div>
            `;
            return;
        }

        console.log('Projects loaded:', allRepos.map(r => r.name));

        const fragment = document.createDocumentFragment();

        allRepos.forEach((repo, index) => {
            const card = document.createElement('div');
            card.className = 'project-card animate-slide-up';
            card.style.animationDelay = `${index * 0.1}s`;

            const description = repo.description || 'No description available';
            const language = repo.language || 'Unknown';
            const author = repo.owner?.login || 'Unknown';

            // Determine badge based on repo name
            let badge = '';
            let badgeClass = '';
            let projectLink = repo.html_url; // default link

            if (repo.name === 'Broadcast-generator') {
                badge = 'active';
                badgeClass = 'project-badge-active';
                projectLink = 'https://cloud.umami.is/q/2SQPbwqnb';
            } else if (repo.name === 'AutoClicker-AntiAFK') {
                badge = 'archive';
                badgeClass = 'project-badge-archive';
                projectLink = 'https://cloud.umami.is/q/aC6gpCW2H';
            }

            card.innerHTML = `
                <div class="project-header">
                    <div class="project-title">${escapeHtml(repo.name)}</div>
                    ${badge ? `<span class="project-badge ${badgeClass}">${badge}</span>` : ''}
                </div>
                <div class="project-description">${escapeHtml(description)}</div>
                <div class="project-footer">
                    <div class="project-stats">
                        <div class="project-stat" title="Author">
                            <i class="fas fa-user"></i>
                            <span>${escapeHtml(author)}</span>
                        </div>
                        <div class="project-stat" title="Language">
                            <i class="fas fa-code"></i>
                            <span>${escapeHtml(language)}</span>
                        </div>
                    </div>
                    <a href="${projectLink}" target="_blank" rel="noreferrer" class="project-link">
                        <span>View</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;

            fragment.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(fragment);

        // Add click tracking to project links
        document.querySelectorAll('.project-link').forEach(link => {
            link.addEventListener('click', () => {
                const projectName = link.closest('.project-card')?.querySelector('.project-title')?.textContent || 'Unknown';
                if (window.umami) {
                    window.umami.track('Project Viewed', { project: projectName });
                }
            });
        });

        // Observe project cards with IntersectionObserver (same logic as initScrollReveal)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.project-card').forEach(card => {
            observer.observe(card);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
                <p>Failed to load projects</p>
                <small style="opacity: 0.6;">Check back later or visit <a href="https://github.com/${githubUsername}" target="_blank" rel="noreferrer" style="color: var(--primary); text-decoration: none;">GitHub</a></small>
            </div>
        `;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

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

function updateCopyrightYear() {
    const copyrightEl = document.getElementById('copyright-year');
    if (!copyrightEl) return;
    const currentYear = new Date().getFullYear();
    copyrightEl.textContent = `© ${currentYear} Piotrunius - All Rights Reserved`;
}

// --- BACK TO TOP BUTTON ---
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- GITHUB ACTIVITY TIMELINE ---
async function loadGitHubTimeline() {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;

    try {
        const resp = await fetch(`data/github-stats.json?t=${Date.now()}`);
        if (!resp.ok) throw new Error('Failed to load stats');

        const stats = await resp.json();
        const activities = [];

        // Add commits
        if (stats.recentCommits) {
            stats.recentCommits
                .filter(c => {
                    const msg = (c.message || '').toLowerCase();
                    const author = (c.author || '').toLowerCase();
                    return !author.includes('bot') && !author.includes('action');
                })
                .slice(0, 10)
                .forEach(commit => {
                    activities.push({
                        type: 'commit',
                        icon: 'fa-code-commit',
                        action: commit.message || 'Commit',
                        repo: commit.repo,
                        time: commit.date,
                        url: commit.url
                    });
                });
        }

        // Add starred repos
        if (stats.starred) {
            stats.starred.slice(0, 5).forEach(star => {
                activities.push({
                    type: 'star',
                    icon: 'fa-star',
                    action: `Starred ${star.name}`,
                    details: star.description,
                    repo: star.owner,
                    time: star.starredAt,
                    url: star.url
                });
            });
        }

        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Render timeline
        const fragment = document.createDocumentFragment();
        activities.slice(0, 15).forEach((activity, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.animationDelay = `${index * 0.05}s`;

            const timeAgo = getTimeAgo(activity.time);

            item.innerHTML = `
                <div class="timeline-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-action">${escapeHtml(activity.action)}</div>
                        <div class="timeline-time">${timeAgo}</div>
                    </div>
                    ${activity.details ? `<div class="timeline-details">${escapeHtml(activity.details)}</div>` : ''}
                    ${activity.repo ? `<div class="timeline-repo"><i class="fas fa-code-branch"></i>${escapeHtml(activity.repo)}</div>` : ''}
                </div>
            `;

            if (activity.url) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.open(activity.url, '_blank', 'noreferrer');
                });
            }

            fragment.appendChild(item);
        });

        timeline.innerHTML = '';
        timeline.appendChild(fragment);
    } catch (error) {
        console.error('Error loading GitHub timeline:', error);
        timeline.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; opacity: 0.5;"></i>
                <p>Unable to load activity timeline</p>
            </div>
        `;
    }
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
}

// --- KEYBOARD NAVIGATION ---
// Adds keyboard shortcuts for better accessibility and power user experience
// Supports: Arrow keys for navigation, Escape to close modals, Space to play/pause audio
function initKeyboardNavigation() {
    let shortcutsEnabled = true;
    
    // Show keyboard shortcuts help on first visit
    const hasSeenShortcuts = localStorage.getItem('keyboard-shortcuts-seen');
    if (!hasSeenShortcuts) {
        setTimeout(() => {
            NotificationManager.info(
                'Keyboard shortcuts enabled! Press ? to see all shortcuts.',
                6000
            );
            localStorage.setItem('keyboard-shortcuts-seen', 'true');
        }, 2000);
    }
    
    document.addEventListener('keydown', (e) => {
        // ? or /: Show keyboard shortcuts help
        if ((e.key === '?' || e.key === '/') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            showKeyboardShortcutsModal();
            return;
        }
        
        // Space or K: Toggle audio playback
        if ((e.code === 'Space' || e.key === 'k') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            toggleAudio();
            return;
        }

        // Escape: Close WIP notice if visible
        if (e.key === 'Escape') {
            const wipNotice = document.getElementById('wip-notice');
            const closeBtn = document.getElementById('wip-close');
            if (wipNotice && !wipNotice.classList.contains('hidden') && wipNotice.style.display !== 'none') {
                closeBtn?.click();
            }
            // Also close shortcuts modal if open
            const modal = document.getElementById('shortcuts-modal');
            if (modal) {
                modal.remove();
            }
            return;
        }

        // T: Toggle theme
        if (e.key === 't' || e.key === 'T') {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.getElementById('theme-toggle')?.click();
                return;
            }
        }

        // Home: Scroll to top
        if (e.key === 'Home' && e.ctrlKey) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // End: Scroll to bottom
        if (e.key === 'End' && e.ctrlKey) {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            return;
        }
    });

    console.log('Keyboard shortcuts enabled: Space/K (play/pause), T (theme), Esc (close), Ctrl+Home/End (scroll), ? (help)');
}

// Show keyboard shortcuts modal
function showKeyboardShortcutsModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('shortcuts-modal');
    if (existingModal) {
        existingModal.remove();
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="shortcuts-modal-content glass-card">
            <div class="shortcuts-modal-header">
                <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                <button class="shortcuts-modal-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="shortcuts-list">
                <div class="shortcut-item">
                    <kbd>Space</kbd> or <kbd>K</kbd>
                    <span>Play/Pause audio</span>
                </div>
                <div class="shortcut-item">
                    <kbd>T</kbd>
                    <span>Toggle theme</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Close modals/notices</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Home</kbd>
                    <span>Scroll to top</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>End</kbd>
                    <span>Scroll to bottom</span>
                </div>
                <div class="shortcut-item">
                    <kbd>?</kbd>
                    <span>Show/hide this help</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    modal.querySelector('.shortcuts-modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 10);
}

// --- LOADING STATES ---
// Shows loading indicators while API data is being fetched
// Improves user experience by providing visual feedback
function showLoadingState(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const loadingHTML = `
        <div class="loading-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; gap: 1rem; color: var(--text-secondary);">
            <div class="spinner" style="width: 40px; height: 40px; border: 3px solid rgba(0, 255, 136, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <span style="font-size: 0.9rem;">${message}</span>
        </div>
    `;
    
    element.innerHTML = loadingHTML;
}

// --- SMOOTH SCROLL TO SECTIONS ---
// Enables smooth scrolling to specific sections when clicking on navigation links
function initSmoothScroll() {
    // Add scroll behavior to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// --- ANIMATED STATISTICS COUNTERS ---
// Animates numbers counting up to their final value for better visual impact
// Used for statistics like project count, commit count, etc.
function animateCounter(element, targetValue, duration = 1000) {
    if (!element) return;
    
    const startValue = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = progress * (2 - progress);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuad);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// --- ERROR BOUNDARY FOR API CALLS ---
// Provides user-friendly error messages when API calls fail
// Includes retry functionality for better resilience
function showErrorState(elementId, errorMessage = 'Failed to load data', retryCallback = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const retryButton = retryCallback ? `
        <button onclick="(${retryCallback.toString()})()" style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: var(--primary);
            color: var(--bg-primary);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fas fa-redo"></i> Retry
        </button>
    ` : '';

    element.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; gap: 0.5rem; color: var(--text-secondary);">
            <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #ff6b6b; opacity: 0.8;"></i>
            <span style="font-size: 0.95rem; text-align: center;">${errorMessage}</span>
            ${retryButton}
        </div>
    `;
}

// --- ACCESSIBILITY IMPROVEMENTS ---
// Adds focus indicators and ARIA labels for better screen reader support
function enhanceAccessibility() {
    // Add focus-visible class for better keyboard navigation visibility
    document.body.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.body.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Ensure all interactive elements have proper roles
    document.querySelectorAll('.skill-badge, .social-link, .project-card').forEach(el => {
        if (!el.getAttribute('role')) {
            el.setAttribute('role', 'link');
        }
    });

    // Add skip to main content link for screen readers
    const skipLink = document.createElement('a');
    skipLink.href = '#main-container';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add ID to main container if not present
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer && !mainContainer.id) {
        mainContainer.id = 'main-container';
    }
}

// --- NOTIFICATION SYSTEM ---
// Displays toast notifications for user feedback
// Types: success, error, info, warning
const NotificationManager = {
    container: null,
    
    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        this.container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }
        
        return notification;
    },
    
    hide(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// --- COPY TO CLIPBOARD UTILITY ---
// Copies text to clipboard with user feedback
async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            NotificationManager.success(successMessage);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'absolute';
            textArea.style.left = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                NotificationManager.success(successMessage);
                return true;
            } catch (e) {
                NotificationManager.error('Failed to copy to clipboard');
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (err) {
        console.error('Copy failed:', err);
        NotificationManager.error('Failed to copy to clipboard');
        return false;
    }
}

// --- WEB SHARE API ---
// Enables native sharing on supported devices
async function shareWebsite() {
    const shareData = {
        title: 'Piotrunius - Developer & Tech Enthusiast',
        text: 'Check out my portfolio! Interactive website with real-time integrations.',
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            NotificationManager.success('Thanks for sharing!');
        } else {
            // Fallback: copy URL to clipboard
            await copyToClipboard(window.location.href, 'Link copied to clipboard!');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            // Fallback: copy URL to clipboard
            await copyToClipboard(window.location.href, 'Link copied to clipboard!');
        }
    }
}

// --- PERFORMANCE METRICS DISPLAY ---
// Shows performance information in console for debugging
function logPerformanceMetrics() {
    if (!window.performance) return;
    
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
        const metrics = {
            'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
            'TCP Connection': perfData.connectEnd - perfData.connectStart,
            'Request Time': perfData.responseStart - perfData.requestStart,
            'Response Time': perfData.responseEnd - perfData.responseStart,
            'DOM Processing': perfData.domComplete - perfData.domInteractive,
            'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
            'Total Load Time': perfData.loadEventEnd - perfData.fetchStart
        };
        
        console.group('🚀 Performance Metrics');
        Object.entries(metrics).forEach(([key, value]) => {
            console.log(`${key}: ${value.toFixed(2)}ms`);
        });
        console.groupEnd();
    }
}
