let config = {};
let bgAnimationFrame = null;
let audioContext = null;
let analyser = null;
let audioPlaying = false;
const githubUsername = 'Piotrunius';

// --- DATA: Profile & Socials ---
function getDefaultConfig() {
    return {
        profile: {
            name: 'Piotrunius',
            bio: 'Minimalist designer & developer. Linux enthusiast from Katowice.',
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
        }
    };
}

async function loadConfig() {
    config = getDefaultConfig();
    return config;
}

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

// --- CORE FUNCTION: Render Activity Feed (User's Requested Logic) ---
async function updateGitHubActivity() {
    try {
        let response = await fetch('github-stats.json?t=' + Date.now());
        if (!response.ok) {
            response = await fetch('assets/github-stats.json?t=' + Date.now());
        }
        const data = await response.json();

        // Update Summary Stats if elements exist
        const projectsEl = document.getElementById('stat-projects');
        const commitsEl = document.getElementById('stat-commits');
        const starsEl = document.getElementById('stat-stars');
        const lastUpdateEl = document.getElementById('stats-last-update');
        
        if (data.summary) {
            if (projectsEl) projectsEl.textContent = data.summary.projects || '0';
            if (starsEl) starsEl.textContent = data.summary.starredCount || '0';
            if (commitsEl) commitsEl.textContent = data.summary.commits || '0';
        }

        if (lastUpdateEl && data.lastUpdate) {
            lastUpdateEl.textContent = `Last updated: ${new Date(data.lastUpdate).toLocaleString('pl-PL')}`;
        }

        // Renderowanie Commitów (ostatnie 20)
        const commitBox = document.getElementById('commits-list');
        if (commitBox) {
            commitBox.innerHTML = ''; 
            (data.recentCommits || []).slice(0, 20).forEach((commit, index) => {
                const date = new Date(commit.date).toLocaleDateString('pl-PL');
                commitBox.innerHTML += `
                    <div class="activity-item item-animate" style="animation-delay: ${index * 0.03}s">
                        <div style="color: #00ff99; font-size: 0.95rem; font-weight: bold; margin-bottom: 2px;">${commit.repo || 'Repo'}</div>
                        <div style="font-size: 0.85rem; margin: 2px 0;">${(commit.message || 'No message').split('\n')[0]}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">${date} • ${commit.author || 'User'}</div>
                    </div>
                `;
            });
        }

        // Renderowanie Starred (ostatnie 20)
        const starredBox = document.getElementById('starred-list');
        if (starredBox) {
            starredBox.innerHTML = '';
            (data.starred || []).slice(0, 20).forEach((repo, index) => {
                starredBox.innerHTML += `
                    <a href="${repo.url}" target="_blank" class="activity-item item-animate" style="animation-delay: ${index * 0.03}s; text-decoration: none; color: inherit; display: block;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #00ff99; font-weight: bold; font-size: 0.95rem;">${repo.name}</span>
                            <span style="color: #ffcc00; font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">⭐ ${repo.stars}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8); margin: 3px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${repo.description || 'Brak opisu'}</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 4px;">${repo.language || 'Code'} • ${repo.owner}</div>
                    </a>
                `;
            });
        }

        console.log('GitHub Stats updated successfully (User Logic).');

    } catch (e) {
        console.error("Błąd ładowania statsów:", e);
    }
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

    function drawVisualizer() {
        if (!audioPlaying) return;
        requestAnimationFrame(drawVisualizer);
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
    }
    drawVisualizer();
}

function initMouseEffects() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.01)');
        card.addEventListener('mouseleave', () => card.style.transform = '');
    });
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initProfile();
    initSocials();
    initMusicMeta();
    updateGitHubActivity(); // Using the requested logic
    initControls();
    initMouseEffects();
    console.log('Bio initialized.');
});
