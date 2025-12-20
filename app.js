let config = {};
let bgAnimationFrame = null;
let audioContext = null;
let analyser = null;
let audioPlaying = false;
const githubUsername = 'Piotrunius';

// Lightweight defaults (no external config.json)
function getDefaultConfig() {
    return {
        profile: {
            name: 'Piotrunius',
            bio: 'Tech enthusiast from Poland. I love tinkering with systems and building tools to simplify my digital life.',
            avatar: 'assets/pfp.png'
        },
        socials: [
            { label: 'GitHub', icon: 'github', url: 'https://github.com/Piotrunius', color: '#ffffff' },
            { label: 'Discord', icon: 'discord', url: 'https://discord.gg/wsQujjvk', color: '#5865F2' },
            { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/piotrunius0/', color: '#E1306C' },
            { label: 'Spotify', icon: 'spotify', url: 'https://stats.fm/piotrunius', color: '#1DB954' },
            { label: 'Steam', icon: 'steam', url: 'https://steamcommunity.com/id/Piotrunius/', color: '#00adee' },
            { label: 'Bio', icon: 'file', url: 'https://e-z.bio/piotrunius', color: '#9146FF' },
            { label: 'AniList', icon: 'circle-play', url: 'https://anilist.co/user/Piotrunius/', color: '#00A3FF' },
            { label: 'Roblox', icon: 'cubes', url: 'https://www.roblox.com/users/962249141/profile', color: '#FF4757' },
            { label: 'Minecraft', icon: 'gem', url: 'https://pl.namemc.com/profile/Piotrunius', color: '#3C873A' }
        ],
        music: {
            title: 'Smoking Alone',
            artist: 'BackDrop',
            url: 'https://pixabay.com/music/ambient-dark-ambient-background-music-smoking-alone-328352/'
        },
        audio: {
            src: 'assets/audio.mp3',
            volume: 0.4
        },
        setup: {
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
        }
    };
}

async function loadConfig() {
    // No file fetch; just defaults
    config = getDefaultConfig();
    return config;
}

function applyTheme() {
    // Theme is already defined in CSS variables; placeholder for future
}

function initProfile() {
    const avatar = document.getElementById('avatar');
    const nameEl = document.getElementById('profile-name');
    const bioEl = document.getElementById('profile-bio');
    if (avatar) avatar.src = config.profile?.avatar || 'assets/pfp.png';
    if (nameEl) nameEl.textContent = config.profile?.name || 'Piotrunius';
    if (bioEl) bioEl.textContent = config.profile?.bio || 'Minimalist designer & developer';
}

function initSocials() {
    const container = document.getElementById('socials-container');
    if (!container) return;
    container.innerHTML = '';
    const socials = Array.isArray(config.socials) ? config.socials : [];
    socials.forEach((s, index) => {
        const a = document.createElement('a');
        a.className = 'social-link';
        a.href = s.url || '#';
        a.target = '_blank';
        a.rel = 'noreferrer';
        a.style.setProperty('--social-color', s.color || '#00ff88');
        a.style.animationDelay = `${index * 0.08}s`;
        const isBrand = ['github', 'discord', 'instagram', 'spotify', 'steam', 'twitch'].includes((s.icon || '').toLowerCase());
        a.innerHTML = `
            <i class="${isBrand ? 'fa-brands' : 'fas'} fa-${s.icon || 'link'}"></i>
            <span>${s.label || 'Link'}</span>
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

async function updateGitHubStats() {
    const projectsEl = document.getElementById('stat-projects');
    const commitsEl = document.getElementById('stat-commits');
    const starsEl = document.getElementById('stat-stars');
    const lastUpdateEl = document.getElementById('stats-last-update');
    const activityStarsEl = document.getElementById('activity-stars');
    const activityCommitsEl = document.getElementById('activity-commits');

    try {
        // Fetch stats: prefer root file, fallback to assets/
        let response = await fetch('github-stats.json?t=' + Date.now());
        if (!response.ok) {
            response = await fetch('assets/github-stats.json?t=' + Date.now());
        }
        const stats = await response.json();
        const summary = stats.summary || {};

        // Display total statistics
        if (projectsEl) projectsEl.textContent = summary.projects || '—';
        if (starsEl) starsEl.textContent = summary.starredCount || '—';
        if (commitsEl) commitsEl.textContent = summary.commits || '—';

        // Recent Starred: data.starred (slice 0..5), name as title, description as desc
        if (activityStarsEl) {
            const recentStars = (stats.starred || []).slice(0, 5);
            activityStarsEl.innerHTML = '';
            recentStars.forEach((star) => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                const title = star.name || '';
                const desc = star.description || '';
                const owner = star.owner || 'Unknown';
                const starsCount = star.stars !== undefined ? star.stars : 0;
                
                item.innerHTML = `
                    <div class="activity-content">
                        <a class="activity-link" href="${star.url}" target="_blank" rel="noreferrer">${title}</a>
                        <div class="activity-meta">
                            <span class="meta-item"><i class="fas fa-user"></i> ${owner}</span>
                            <span class="meta-item"><i class="fas fa-star"></i> ${starsCount}</span>
                        </div>
                        <p class="activity-desc">${desc}</p>
                    </div>
                    <div class="activity-info">
                        <span class="activity-date">${formatPLDateTime(star.starredAt || Date.now())}</span>
                    </div>
                `;
                activityStarsEl.appendChild(item);
            });
        }

        // Recent Commits: data.recentCommits (slice 0..5), message as title, repo as desc
        if (activityCommitsEl) {
            const recentCommits = (stats.recentCommits || []).slice(0, 5);
            activityCommitsEl.innerHTML = '';
            recentCommits.forEach((commit) => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                const title = (commit.message || '').split('\n')[0] || 'Commit';
                const desc = commit.repo || '';
                item.innerHTML = `
                    <div class="activity-content">
                        <a class="activity-link" href="${commit.url}" target="_blank" rel="noreferrer">${title}</a>
                        <p class="activity-desc">${desc}</p>
                    </div>
                    <div class="activity-info">
                        <span class="activity-date">${formatPLDateTime(commit.date || Date.now())}</span>
                    </div>
                `;
                activityCommitsEl.appendChild(item);
            });
        }

        // Display last update timestamp
        if (lastUpdateEl && stats.lastUpdate) {
            const updateDate = new Date(stats.lastUpdate);
            const day = String(updateDate.getDate()).padStart(2, '0');
            const month = String(updateDate.getMonth() + 1).padStart(2, '0');
            const year = updateDate.getFullYear();
            const hours = String(updateDate.getHours()).padStart(2, '0');
            const minutes = String(updateDate.getMinutes()).padStart(2, '0');
            lastUpdateEl.textContent = `Last updated: ${day}/${month}/${year}, ${hours}:${minutes}`;
        }

        // Log stats to console for debugging
        console.log('GitHub Stats:', stats);
    } catch (e) {
        console.warn('Could not load GitHub stats:', e.message);
        // Keep placeholders on error; do not clear dynamic containers
        if (projectsEl) projectsEl.textContent = '—';
        if (starsEl) starsEl.textContent = '—';
        if (commitsEl) commitsEl.textContent = '—';
    }
}

function initSetup() {
    const pcSpecs = document.getElementById('pc-specs');
    const setupSpecs = document.getElementById('setup-specs');
    if (pcSpecs) {
        pcSpecs.innerHTML = '';
        (config.setup?.pc || []).forEach((spec, index) => {
            const specEl = document.createElement('a');
            specEl.className = 'spec-item';
            if (spec.urls && Array.isArray(spec.urls)) {
                specEl.href = '#';
                specEl.style.cursor = 'pointer';
                specEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    spec.urls.forEach(url => window.open(url, '_blank'));
                });
            } else {
                specEl.href = spec.url || '#';
                specEl.target = '_blank';
                specEl.rel = 'noreferrer';
            }
            specEl.style.animationDelay = `${index * 0.12}s`;
            specEl.innerHTML = `
                <i class="fas fa-${spec.icon}"></i>
                <span>${spec.label}${spec.value ? `<small> - ${spec.value}</small>` : ''}</span>
            `;
            pcSpecs.appendChild(specEl);
        });
    }
    if (setupSpecs) {
        setupSpecs.innerHTML = '';
        (config.setup?.gear || []).forEach((spec, index) => {
            const specEl = document.createElement('a');
            specEl.className = 'spec-item';
            if (spec.urls && Array.isArray(spec.urls)) {
                specEl.href = '#';
                specEl.style.cursor = 'pointer';
                specEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    spec.urls.forEach(url => window.open(url, '_blank'));
                });
            } else {
                specEl.href = spec.url || '#';
                specEl.target = '_blank';
                specEl.rel = 'noreferrer';
            }
            specEl.style.animationDelay = `${index * 0.12}s`;
            specEl.innerHTML = `
                <i class="fas fa-${spec.icon}"></i>
                <span>${spec.label}${spec.value ? `<small> - ${spec.value}</small>` : ''}</span>
            `;
            setupSpecs.appendChild(specEl);
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    applyTheme();
    initProfile();
    initSocials();
    initMusicMeta();
    updateGitHubStats();
    initSetup();
    initControls();
    initMouseEffects();
});

async function initActivityFeed() {
    const starsEl = document.getElementById('activity-stars');
    const commitsEl = document.getElementById('activity-commits');
    if (!starsEl || !commitsEl) return;

    starsEl.innerHTML = '';
    commitsEl.innerHTML = '';

    try {
        // Read from pre-generated stats file (GitHub Actions)
        const resp = await fetch('assets/github-stats.json?' + Date.now());
        const stats = await resp.json();

        const starred = Array.isArray(stats.starred) ? stats.starred.slice(0, 5) : [];
        const recentCommits = Array.isArray(stats.recentCommits) ? stats.recentCommits.slice(0, 5) : [];

        const stars = starred.map(r => ({
            icon: 'star',
            title: r.name,
            meta: `by ${r.owner} • ${Number(r.stars || 0).toLocaleString()} stars • ${formatPLDateTime(r.starredAt)}`
        }));

        const commits = recentCommits.map(c => {
            const msg = (c.message || '').split('\n')[0];
            const shortMsg = msg.length > 50 ? msg.slice(0, 50) + '…' : msg || 'Commit';
            return {
                icon: 'code',
                title: shortMsg,
                meta: `${c.repo || ''} · ${formatPLDateTime(c.date || Date.now())}`
            };
        });

        renderFeed(starsEl, stars.length ? stars : [{ icon: 'circle-exclamation', title: 'No recent stars', meta: '' }], 'fa-github');
        renderFeed(commitsEl, commits.length ? commits : [{ icon: 'circle-exclamation', title: 'No recent commits', meta: '' }], 'fa-github');
    } catch (error) {
        console.error('Activity feed error:', error);
        renderFeed(starsEl, [{ icon: 'circle-exclamation', title: 'Unable to load starred repos', meta: '' }], 'fa-github');
        renderFeed(commitsEl, [{ icon: 'circle-exclamation', title: 'Unable to load commits', meta: '' }], 'fa-github');
    }
}

// Formats date to Polish style dd/mm/yyyy, HH:MM (24h)
function formatPLDateTime(dateInput) {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${mins}`;
}

function renderFeed(container, items, fallbackIcon) {
    container.innerHTML = '';
    items.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'feed-item';
        el.innerHTML = `
            <div class="feed-icon"><i class="fas ${item.icon ? 'fa-' + item.icon : fallbackIcon}"></i></div>
            <div class="feed-content">
                <div class="feed-title">${item.title}</div>
                <div class="feed-meta">${item.meta || ''}</div>
            </div>
        `;
        container.appendChild(el);
    });
}

function initControls() {
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
        updateAudioButton();
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
    audio.volume = typeof config.audio?.volume === 'number' ? config.audio.volume : 0.4;

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
    btn.setAttribute('aria-pressed', audioPlaying ? 'true' : 'false');
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

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });

    function drawVisualizer() {
        if (!audioPlaying) return;

        requestAnimationFrame(drawVisualizer);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = Math.max(2, (canvas.width / bufferLength) * 1.6);
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(0.7, '#00cc88');
            gradient.addColorStop(1, 'rgba(0,255,136,0.1)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    drawVisualizer();
}

// Background has been fully removed per user request

function initMouseEffects() {
    // Card hover effects only; custom cursor removed.
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });

        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `translateY(-12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
    });
}

console.log('Bio page initialized.');
