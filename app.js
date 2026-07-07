document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. STICKY NAVBAR & MOBILE MENU
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Sticky Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        mobileToggle.classList.toggle('active');
        
        // Accessibility toggle
        const isOpen = navMenu.classList.contains('open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking navigation link (mobile)
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            mobileToggle.classList.remove('active');
        });
    });

    // Handle Dropdowns on Mobile Click
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = dropdown.parentElement;
                parent.classList.toggle('mobile-open');
            }
        });
    });


    /* ==========================================================================
       2. LANGUAGE SWITCHER (TR / EN)
       ========================================================================== */
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const htmlElem = document.documentElement;

    langToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('lang-tr')) {
            document.body.classList.remove('lang-tr');
            document.body.classList.add('lang-en');
            htmlElem.setAttribute('lang', 'en');
            localStorage.setItem('preferred-lang', 'en');
        } else {
            document.body.classList.remove('lang-en');
            document.body.classList.add('lang-tr');
            htmlElem.setAttribute('lang', 'tr');
            localStorage.setItem('preferred-lang', 'tr');
        }
    });

    // Load user language preference if saved
    const savedLang = localStorage.getItem('preferred-lang');
    if (savedLang) {
        document.body.className = `lang-${savedLang}`;
        htmlElem.setAttribute('lang', savedLang);
    }


    /* ==========================================================================
       3. INTERACTIVE MUSIC PLAYER MOCKUP & YOUTUBE API INTEGRATION
       ========================================================================== */
    const isHome = document.querySelector('.player-mockup') !== null;
    if (isHome) {
        const playlist = [
            { title: 'Chill Lofi Beats', artist: 'Vice Music Studio', duration: '03:30', durationSec: 210 },
            { title: 'Synthwave Sunrise', artist: 'RetroVibe Records', duration: '04:12', durationSec: 252 },
            { title: 'Acoustic Sunset', artist: 'Nature Acoustic', duration: '02:45', durationSec: 165 }
        ];

        let currentTrackIndex = 0;
        let isPlaying = true;
        let trackCurrentSeconds = 105; // starts in middle of first track (01:45)
        let playbackInterval = null;
        let isYoutubeActive = false;

        const playerMockup = document.querySelector('.player-mockup');
        const trackTitle = document.getElementById('track-name');
        const trackArtist = document.querySelector('.track-artist');
        const timeCurrent = document.getElementById('time-current');
        const timeTotal = document.querySelector('.time-duration');
        const timelineSlider = document.getElementById('timeline-slider');
        const timelineProgress = document.querySelector('.timeline-progress');
        const timelineHandle = document.querySelector('.timeline-handle');
        
        const playPauseBtn = document.getElementById('btn-play-pause');
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        const repeatBtn = document.getElementById('btn-repeat');
        const shuffleBtn = document.getElementById('btn-shuffle');
        const playSvg = playPauseBtn.querySelector('.play-svg');
        const pauseSvg = playPauseBtn.querySelector('.pause-svg');

        const ytUrlInput = document.getElementById('yt-url-input');
        const ytPlayBtn = document.getElementById('yt-play-btn');
        const ytVideoContainer = document.getElementById('yt-video-container');
        const albumArt = document.querySelector('.album-art');
        const customTimeline = document.getElementById('custom-timeline');
        const ytTimelineMsg = document.getElementById('yt-timeline-msg');

        // Extract YouTube Video ID from URL
        function getYouTubeId(url) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        // Load track information (Mock Mode)
        function loadTrack(index) {
            const track = playlist[index];
            trackTitle.textContent = track.title;
            trackArtist.textContent = track.artist;
            timeTotal.textContent = track.duration;
            trackCurrentSeconds = 0;
            updateTimeline();
        }

        // Format seconds to MM:SS
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Update timeline width & handle position
        function updateTimeline() {
            const track = playlist[currentTrackIndex];
            const progressPercentage = (trackCurrentSeconds / track.durationSec) * 100;
            
            timelineProgress.style.width = `${progressPercentage}%`;
            timelineHandle.style.left = `${progressPercentage}%`;
            timeCurrent.textContent = formatTime(trackCurrentSeconds);
        }

        // Start playback timer (Mock Mode)
        function startTimer() {
            if (playbackInterval) clearInterval(playbackInterval);
            
            playbackInterval = setInterval(() => {
                const track = playlist[currentTrackIndex];
                if (trackCurrentSeconds < track.durationSec) {
                    trackCurrentSeconds++;
                    updateTimeline();
                } else {
                    if (repeatBtn.classList.contains('active')) {
                        trackCurrentSeconds = 0;
                        updateTimeline();
                    } else {
                        nextTrack();
                    }
                }
            }, 1000);
        }

        // Pause playback timer (Mock Mode)
        function stopTimer() {
            clearInterval(playbackInterval);
        }

        // Play & Pause toggle
        function togglePlay() {
            if (isYoutubeActive) {
                isPlaying = !isPlaying;
                if (isPlaying) {
                    playerMockup.classList.remove('paused');
                    playSvg.style.display = 'none';
                    pauseSvg.style.display = 'block';
                } else {
                    playerMockup.classList.add('paused');
                    playSvg.style.display = 'block';
                    pauseSvg.style.display = 'none';
                }
            } else {
                if (isPlaying) {
                    isPlaying = false;
                    playerMockup.classList.add('paused');
                    playSvg.style.display = 'block';
                    pauseSvg.style.display = 'none';
                    stopTimer();
                } else {
                    isPlaying = true;
                    playerMockup.classList.remove('paused');
                    playSvg.style.display = 'none';
                    pauseSvg.style.display = 'block';
                    startTimer();
                }
            }
        }

        function nextTrack() {
            if (isYoutubeActive) {
                isYoutubeActive = false;
                ytVideoContainer.style.display = 'none';
                ytVideoContainer.innerHTML = '';
                albumArt.style.display = 'block';
                ytTimelineMsg.style.display = 'none';
                customTimeline.style.display = 'flex';
            }
            
            if (shuffleBtn.classList.contains('active')) {
                currentTrackIndex = Math.floor(Math.random() * playlist.length);
            } else {
                currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            }
            loadTrack(currentTrackIndex);
            
            isPlaying = true;
            playerMockup.classList.remove('paused');
            playSvg.style.display = 'none';
            pauseSvg.style.display = 'block';
            startTimer();
        }

        function prevTrack() {
            if (isYoutubeActive) {
                isYoutubeActive = false;
                ytVideoContainer.style.display = 'none';
                ytVideoContainer.innerHTML = '';
                albumArt.style.display = 'block';
                ytTimelineMsg.style.display = 'none';
                customTimeline.style.display = 'flex';
            }
            
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadTrack(currentTrackIndex);
            
            isPlaying = true;
            playerMockup.classList.remove('paused');
            playSvg.style.display = 'none';
            pauseSvg.style.display = 'block';
            startTimer();
        }

        // Play YouTube link input
        function playYoutubeLink() {
            const url = ytUrlInput.value.trim();
            if (!url) return;

            const videoId = getYouTubeId(url);
            if (videoId) {
                isPlaying = false;
                stopTimer();

                isYoutubeActive = true;
                trackTitle.textContent = "YouTube Müzik Yükleniyor...";
                trackArtist.textContent = "YouTube";

                albumArt.style.display = 'none';
                ytVideoContainer.style.display = 'block';
                
                ytVideoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; border-radius: 12px;"></iframe>`;

                customTimeline.style.display = 'none';
                ytTimelineMsg.style.display = 'block';

                isPlaying = true;
                playerMockup.classList.remove('paused');
                playSvg.style.display = 'none';
                pauseSvg.style.display = 'block';

                fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.title) {
                            trackTitle.textContent = data.title;
                            trackArtist.textContent = data.author_name || "YouTube";
                        }
                    })
                    .catch(() => {
                        trackTitle.textContent = "YouTube Müzik";
                        trackArtist.textContent = "YouTube";
                    });

                ytUrlInput.value = "";
            } else {
                alert("Lütfen geçerli bir YouTube linki yapıştırın!");
            }
        }

        // Controls listeners
        playPauseBtn.addEventListener('click', togglePlay);
        nextBtn.addEventListener('click', nextTrack);
        prevBtn.addEventListener('click', prevTrack);

        repeatBtn.addEventListener('click', () => {
            repeatBtn.classList.toggle('active');
        });

        shuffleBtn.addEventListener('click', () => {
            shuffleBtn.classList.toggle('active');
        });

        // Timeline Click to Seek
        timelineSlider.addEventListener('click', (e) => {
            if (isYoutubeActive) return;
            
            const rect = timelineSlider.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const clickPercentage = clickX / width;
            
            const track = playlist[currentTrackIndex];
            trackCurrentSeconds = Math.floor(clickPercentage * track.durationSec);
            updateTimeline();
        });

        // YouTube Input Listeners
        ytPlayBtn.addEventListener('click', playYoutubeLink);
        ytUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                playYoutubeLink();
            }
        });

        // Initialize mock first track state
        loadTrack(currentTrackIndex);
        trackCurrentSeconds = 105;
        updateTimeline();
        startTimer();
    }


    /* ==========================================================================
       4. COMMAND TABS ETKİLEŞİMİ (TABS)
       ========================================================================== */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding tab content
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


    /* ==========================================================================
       5. FAQ ACCORDION (SSS)
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });


    /* ==========================================================================
       6. INTERSECTION OBSERVER FOR COUNTERS & ANIMATIONS
       ========================================================================== */
    // Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    let counted = false;

    function startCounters() {
        if (counted) return;
        counted = true;
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-val'));
            if (isNaN(target)) return; // Skip non-numeric values like '99.9%'
            
            let count = 0;
            const speed = 2000 / target; // complete in 2 seconds
            
            const counter = setInterval(() => {
                count += Math.ceil(target / 100);
                if (count >= target) {
                    count = target;
                    clearInterval(counter);
                }
                
                // Format with thousand separator
                stat.textContent = count.toLocaleString('tr-TR');
            }, 20);
        });
    }

    // Scroll Animations Observer
    const animatedElements = document.querySelectorAll('.animate-up, .animate-view');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger stats count if stats card is visible
                if (entry.target.classList.contains('stats-row') || entry.target.contains(document.getElementById('stat-users'))) {
                    startCounters();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(elem => {
        observer.observe(elem);
    });

    // Extra trigger for elements already in viewport on load
    setTimeout(() => {
        animatedElements.forEach(elem => {
            const rect = elem.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                elem.classList.add('active');
                if (elem.classList.contains('stats-row')) {
                    startCounters();
                }
            }
        });
    }, 100);

    /* ==========================================================================
       7. ACTIVE COMMUNITIES SECTION (API & guilds.json BINDING)
       ========================================================================== */
    function renderCommunities(list) {
        const container = document.getElementById('communities-container');
        if (!container) return;

        const isTr = document.body.classList.contains('lang-tr');

        container.innerHTML = list.map(item => {
            let memberCountText = item.members >= 1000 ? `${(item.members / 1000).toFixed(1)}K` : item.members;
            let memberLabel = isTr ? 'Üye' : 'Members';
            let activeLabel = isTr ? 'Şu an aktif' : 'Active now';

            // If a real Discord icon URL is provided, display the image; otherwise, show the color avatar with letter
            let avatarHtml = '';
            if (item.iconUrl) {
                avatarHtml = `<img src="${item.iconUrl}" alt="${item.name}" class="community-avatar" style="object-fit: cover;">`;
            } else {
                avatarHtml = `
                    <div class="community-avatar" style="background: ${item.grad || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}">
                        ${item.letter || item.name.charAt(0).toUpperCase()}
                    </div>
                `;
            }

            return `
                <div class="community-card">
                    ${avatarHtml}
                    <div class="community-info">
                        <div class="community-name" title="${item.name}">${item.name}</div>
                        <div class="community-status-row">
                            <div class="community-status-badge">
                                <span class="status-dot-pulse"></span>
                                <span>${activeLabel}</span>
                            </div>
                            <div class="community-members">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span>${memberCountText} ${memberLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Fixed 12 servers for home page active communities grid (sorted by member count, Vice pinned to 1st)
    function loadActiveCommunities() {
        const data = window.activeCommunities;
        const container = document.getElementById('communities-container');
        if (!container) return;

        if (data && Array.isArray(data) && data.length > 0) {
            const sortedData = [...data].sort((a, b) => {
                const nameA = a.name;
                const nameB = b.name;
                const isViceA = nameA === '\uD835\uDE51\uD835\uDE5E\uD835\uDE58\uD835\uDE5A' || nameA === '𝙑𝙞𝙘𝙚' || nameA.toLowerCase() === 'vice';
                const isViceB = nameB === '\uD835\uDE51\uD835\uDE5E\uD835\uDE58\uD835\uDE5A' || nameB === '𝙑𝙞𝙘𝙚' || nameB.toLowerCase() === 'vice';
                
                if (isViceA) return -1;
                if (isViceB) return 1;
                
                return b.members - a.members;
            });
            // Show only first 12 servers on home grid
            renderCommunities(sortedData.slice(0, 12));
        } else {
            container.innerHTML = `
                <div class="no-guilds-msg" style="grid-column: 1 / -1; text-align: center; color: var(--color-text-muted); padding: 40px; font-weight: 500;">
                    <span class="tr-text">Henüz aktif bir sunucu bulunmuyor.</span>
                    <span class="en-text">No active servers at the moment.</span>
                </div>
            `;
        }
    }

    /* ==========================================================================
       8. STANDALONE LEADERBOARD PAGE LOGIC (INTERACTIVE)
       ========================================================================== */
    const isLeaderboardPage = document.querySelector('.leaderboard-page-container') !== null;

    const searchInput = document.getElementById('leaderboard-search');
    const leaderboardTabBtns = document.querySelectorAll('.leaderboard-tab-btn');

    let currentPeriod = '7'; // '7', '30', 'all'
    let searchQuery = '';
    let leaderboardCurrentPage = 1;
    const leaderboardPageSize = 10;
    let currentSortMetric = 'listeningTime';

    // Use REAL data from guilds.js - plays and listenHours are actual usage stats
    function getProcessedLeaderboardData(period) {
        let rawData = [...(window.activeCommunities || [])];
        const isTr = document.body.classList.contains('lang-tr');

        // Period multiplier - shows proportional usage per time window
        const periodMultiplier = period === '7' ? 1 : (period === '30' ? 4.3 : 13);

        return rawData.map((item) => {
            // Use real values from guilds.js, scaled by period
            const basePlays = item.plays || 0;
            const baseListenHours = item.listenHours || 0;

            const plays = Math.round(basePlays * periodMultiplier);
            const listenHours = Math.round(baseListenHours * periodMultiplier);

            // Format listen hours into days or hours
            let listeningTimeText = '';
            if (listenHours >= 24) {
                const days = Math.floor(listenHours / 24);
                listeningTimeText = isTr ? `${days} Gün` : `${days} Days`;
            } else {
                listeningTimeText = isTr ? `${listenHours} Saat` : `${listenHours} Hours`;
            }

            return {
                ...item,
                plays: plays,
                listeningTimeText: listeningTimeText,
                listenHours: listenHours
            };
        
        }).sort((a, b) => {
            // Force user's main server "𝙑𝙞𝙘e" to be 1st place always
            const nameA = a.name;
            const nameB = b.name;
            const isViceA = nameA === '\uD835\uDE51\uD835\uDE5E\uD835\uDE58\uD835\uDE5A' || nameA === '𝙑𝙞𝙘𝙚' || nameA.toLowerCase() === 'vice';
            const isViceB = nameB === '\uD835\uDE51\uD835\uDE5E\uD835\uDE58\uD835\uDE5A' || nameB === '𝙑𝙞𝙘𝙚' || nameB.toLowerCase() === 'vice';
            
            if (isViceA) return -1;
            if (isViceB) return 1;
            
            if (currentSortMetric === 'plays') {
                return b.plays - a.plays;
            } else if (currentSortMetric === 'members') {
                return b.members - a.members;
            } else {
                return b.listenHours - a.listenHours; // Sort by listening time / bot usage
            }
        });
    }

    function renderLeaderboard() {
        const sortedData = getProcessedLeaderboardData(currentPeriod);
        
        // Filter by search query
        const filteredData = sortedData.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const isTr = document.body.classList.contains('lang-tr');
        const playLabel = isTr ? 'Çalma' : 'Plays';

        // ── 1. Render Top 3 Podium ────────────────────────────────
        const podiumContainer = document.getElementById('leaderboard-podium');
        if (podiumContainer) {
            const top3 = filteredData.slice(0, 3);
            podiumContainer.innerHTML = top3.map((item, index) => {
                const rank = index + 1;
                
                let avatarHtml = '';
                if (item.iconUrl) {
                    avatarHtml = `<img src="${item.iconUrl}" alt="${item.name}" class="podium-avatar" style="object-fit: cover;">`;
                } else {
                    const initials = item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    avatarHtml = `
                        <div class="podium-avatar" style="background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: var(--color-primary); border-radius: 18px;">
                            ${initials || item.name.charAt(0).toUpperCase()}
                        </div>
                    `;
                }

                // Dynamic SVG based on Rank to match Beatra exactly
                let rankIconSvg = '';
                if (rank === 1) {
                    // Trophy Cup SVG (Outline matching user screenshot)
                    rankIconSvg = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a7 7 0 0 0-7 7c0 2.65 1.5 4.5 3 5h8c1.5-.5 3-2.35 3-5a7 7 0 0 0-7-7z" />
                        </svg>
                    `;
                } else if (rank === 2) {
                    // Ribbon Medal (Outline style matching user screenshot)
                    rankIconSvg = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;">
                            <circle cx="12" cy="8" r="6" />
                            <path d="m15.47 14 1.53 7-5-3-5 3 1.53-7" />
                        </svg>
                    `;
                } else {
                    // Star Award Medal (Outline style matching user screenshot)
                    rankIconSvg = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;">
                            <path d="M12 2L15 9H22L17 14L19 21L12 17L5 21L7 14L2 9H9L12 2Z" />
                        </svg>
                    `;
                }

                return `
                    <div class="podium-item rank-${rank}">
                        <div class="podium-badge">
                            ${rankIconSvg}
                            <span>${rank}</span>
                        </div>
                        <div class="podium-avatar-wrapper">
                            ${avatarHtml}
                        </div>
                        <div class="podium-name" title="${item.name}">${item.name}</div>
                        <div class="podium-stats">
                            ${(() => {
                                if (currentSortMetric === 'plays') {
                                    const playsText = item.plays >= 1000 ? `${(item.plays / 1000).toFixed(1)}K` : item.plays;
                                    return `<div class="podium-stat-val">${playsText} ${isTr ? 'Çalma' : 'Plays'}</div>`;
                                } else if (currentSortMetric === 'members') {
                                    return `<div class="podium-stat-val">${item.members.toLocaleString(isTr ? 'tr-TR' : 'en-US')} ${isTr ? 'Üye' : 'Members'}</div>`;
                                } else {
                                    return `<div class="podium-stat-val">${item.listeningTimeText}</div>`;
                                }
                            })()}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // ── 2. Render List Table (#4+) ────────────────────────────
        const tableBody = document.getElementById('leaderboard-table-body');
        if (tableBody) {
            const tableData = filteredData.slice(3);
            if (tableData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 40px;">
                            ${isTr ? 'Aramayla eşleşen sunucu bulunamadı.' : 'No matching servers found.'}
                        </td>
                    </tr>
                `;
                renderPagination(0);
            } else {
                // Paginate the table data
                const totalItems = tableData.length;
                const totalPages = Math.ceil(totalItems / leaderboardPageSize);
                
                if (leaderboardCurrentPage > totalPages) {
                    leaderboardCurrentPage = Math.max(1, totalPages);
                }
                
                const startIndex = (leaderboardCurrentPage - 1) * leaderboardPageSize;
                const endIndex = startIndex + leaderboardPageSize;
                const pageData = tableData.slice(startIndex, endIndex);

                tableBody.innerHTML = pageData.map((item, index) => {
                    const rank = 4 + startIndex + index;
                    const playsText = item.plays >= 1000 ? `${(item.plays / 1000).toFixed(1)}K` : item.plays;
                    
                    let avatarHtml = '';
                    if (item.iconUrl) {
                        avatarHtml = `<img src="${item.iconUrl}" alt="${item.name}" class="leaderboard-server-avatar" style="object-fit: cover;">`;
                    } else {
                        const initial = item.name.charAt(0).toUpperCase();
                        avatarHtml = `
                            <div class="leaderboard-server-avatar" style="background: linear-gradient(135deg, #1e293b, #0f172a); display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 700; color: var(--color-primary);">
                                ${initial}
                            </div>
                        `;
                    }

                    return `
                        <tr>
                            <td><span class="leaderboard-rank-num">#${rank}</span></td>
                            <td>
                                <div class="leaderboard-server-cell">
                                    ${avatarHtml}
                                    <div>
                                        <span class="leaderboard-server-name">${item.name}</span>
                                        <span class="leaderboard-server-members">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                                            ${item.members.toLocaleString(isTr ? 'tr-TR' : 'en-US')} ${isTr ? 'Üye' : 'Members'}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="leaderboard-stat-cell-val">${playsText}</span>
                                <span class="leaderboard-stat-cell-lbl">${isTr ? '7g' : '7d'}</span>
                            </td>
                            <td>
                                <span class="leaderboard-stat-cell-val">${item.listeningTimeText}</span>
                                <span class="leaderboard-stat-cell-lbl">${isTr ? '7g' : '7d'}</span>
                            </td>
                            <td class="leaderboard-chevron-cell">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                // Render pagination
                renderPagination(totalItems);
            }
        }
    }

    // ── 3. Render Pagination Controls ─────────────────────────
    function renderPagination(totalItems) {
        const container = document.getElementById('leaderboard-pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(totalItems / leaderboardPageSize);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        const isTr = document.body.classList.contains('lang-tr');
        const prevText = isTr ? 'Önceki' : 'Previous';
        const nextText = isTr ? 'Sonraki' : 'Next';
        
        // Previous Button
        if (leaderboardCurrentPage === 1) {
            html += `<button class="pagination-btn nav-btn disabled" disabled>${prevText}</button>`;
        } else {
            html += `<button class="pagination-btn nav-btn" data-page="${leaderboardCurrentPage - 1}">${prevText}</button>`;
        }
        
        // Page Numbers
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                const activeClass = i === leaderboardCurrentPage ? 'active' : '';
                html += `<button class="pagination-btn page-num ${activeClass}" data-page="${i}">${i}</button>`;
            }
        } else {
            // We have many pages
            if (leaderboardCurrentPage <= 2) {
                // Show 1, 2, 3, ..., totalPages
                for (let i = 1; i <= 3; i++) {
                    const activeClass = i === leaderboardCurrentPage ? 'active' : '';
                    html += `<button class="pagination-btn page-num ${activeClass}" data-page="${i}">${i}</button>`;
                }
                html += `<span class="pagination-ellipsis">...</span>`;
                html += `<button class="pagination-btn page-num" data-page="${totalPages}">${totalPages}</button>`;
            } else if (leaderboardCurrentPage >= totalPages - 1) {
                // Show 1, ..., totalPages-2, totalPages-1, totalPages
                html += `<button class="pagination-btn page-num" data-page="1">1</button>`;
                html += `<span class="pagination-ellipsis">...</span>`;
                for (let i = totalPages - 2; i <= totalPages; i++) {
                    const activeClass = i === leaderboardCurrentPage ? 'active' : '';
                    html += `<button class="pagination-btn page-num ${activeClass}" data-page="${i}">${i}</button>`;
                }
            } else {
                // Show 1, ..., current-1, current, current+1, ..., totalPages
                html += `<button class="pagination-btn page-num" data-page="1">1</button>`;
                html += `<span class="pagination-ellipsis">...</span>`;
                html += `<button class="pagination-btn page-num" data-page="${leaderboardCurrentPage - 1}">${leaderboardCurrentPage - 1}</button>`;
                html += `<button class="pagination-btn page-num active" data-page="${leaderboardCurrentPage}">${leaderboardCurrentPage}</button>`;
                html += `<button class="pagination-btn page-num" data-page="${leaderboardCurrentPage + 1}">${leaderboardCurrentPage + 1}</button>`;
                html += `<span class="pagination-ellipsis">...</span>`;
                html += `<button class="pagination-btn page-num" data-page="${totalPages}">${totalPages}</button>`;
            }
        }
        
        // Next Button
        if (leaderboardCurrentPage === totalPages) {
            html += `<button class="pagination-btn nav-btn disabled" disabled>${nextText}</button>`;
        } else {
            html += `<button class="pagination-btn nav-btn" data-page="${leaderboardCurrentPage + 1}">${nextText}</button>`;
        }
        
        container.innerHTML = html;
        
        // Bind page clicks
        container.querySelectorAll('.pagination-btn:not(.disabled):not(.active)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = parseInt(btn.getAttribute('data-page'));
                if (!isNaN(targetPage)) {
                    leaderboardCurrentPage = targetPage;
                    renderLeaderboard();
                    // Scroll smoothly to list wrapper top
                    const listWrapper = document.querySelector('.leaderboard-list-wrapper');
                    if (listWrapper) {
                        listWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // Search query binding
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            leaderboardCurrentPage = 1; // Reset to page 1
            renderLeaderboard();
        });
    }

    // Tab buttons period toggle bindings
    leaderboardTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            leaderboardTabBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = e.target.closest('.leaderboard-tab-btn');
            if (targetBtn) {
                targetBtn.classList.add('active');
                currentPeriod = targetBtn.getAttribute('data-period');
                leaderboardCurrentPage = 1; // Reset to page 1
                renderLeaderboard();
            }
        });
    });
    // Sort dropdown change listener
    const sortSelect = document.getElementById('leaderboard-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortMetric = e.target.value;
            leaderboardCurrentPage = 1; // Reset to page 1
            renderLeaderboard();
        });
    }

    // Run initial loads depending on page
    if (isLeaderboardPage) {
        renderLeaderboard();
    } else {
        loadActiveCommunities();
    }

    // Listen for language toggles to update member/active badges
    document.addEventListener('click', (e) => {
        if (e.target.closest('#lang-toggle-btn') || e.target.closest('.lang-btn') || e.target.closest('#lang-btn')) {
            setTimeout(() => {
                if (isLeaderboardPage) {
                    renderLeaderboard();
                } else {
                    loadActiveCommunities();
                }
            }, 50);
        }
    });
});
