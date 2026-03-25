// Data storage
let socialData = {
    name: 'Your Name',
    bio: 'Digital creator',
    profileImage: 'https://picsum.photos/seed/profile/150/150.jpg',
    links: [
        { platform: 'twitter', url: '', label: 'Twitter' },
        { platform: 'instagram', url: '', label: 'Instagram' },
        { platform: 'linkedin', url: '', label: 'LinkedIn' },
        { platform: 'github', url: '', label: 'GitHub' },
        { platform: 'youtube', url: '', label: 'YouTube' },
        { platform: 'tiktok', url: '', label: 'TikTok' },
        { platform: 'facebook', url: '', label: 'Facebook' },
        { platform: 'discord', url: '', label: 'Discord' },
        { platform: 'telegram', url: '', label: 'Telegram' },
        { platform: 'website', url: '', label: 'Website' },
        { platform: 'email', url: '', label: 'Email' }
    ]
};

// Projects data
let projectsData = [
    {
        id: 1,
        title: 'Modern Portfolio',
        description: 'A beautiful, responsive portfolio website built with modern technologies.',
        category: 'web',
        tags: ['React', 'CSS', 'JavaScript'],
        icon: 'fas fa-briefcase'
    },
    {
        id: 2,
        title: 'Mobile App Design',
        description: 'Clean and intuitive mobile application interface design.',
        category: 'mobile',
        tags: ['UI/UX', 'Mobile', 'Design'],
        icon: 'fas fa-mobile-alt'
    },
    {
        id: 3,
        title: 'Brand Identity',
        description: 'Complete brand identity package including logo and guidelines.',
        category: 'design',
        tags: ['Branding', 'Logo', 'Design'],
        icon: 'fas fa-palette'
    },
    {
        id: 4,
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with payment integration.',
        category: 'web',
        tags: ['Node.js', 'MongoDB', 'React'],
        icon: 'fas fa-shopping-cart'
    }
];

// Current page state
let currentPage = 'home';
let animationsEnabled = true;

// Load data from localStorage on page load
function loadData() {
    const savedData = localStorage.getItem('socialLinksData');
    if (savedData) {
        socialData = JSON.parse(savedData);
    }
    
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        animationsEnabled = settings.animations !== false;
        applySettings();
    }
    
    updateDisplay();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('socialLinksData', JSON.stringify(socialData));
}

// Save settings
function saveSettings() {
    const settings = {
        animations: animationsEnabled
    };
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
}

// Apply settings
function applySettings() {
    if (!animationsEnabled) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }
}

// Video Ideas functionality with online database
let videoIdeas = [];
let adminVidIdeas = []; // Separate storage for admin-only vid ideas

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Load video ideas from online database
async function loadVideoIdeas() {
    try {
        const response = await fetch(`${API_BASE_URL}/video-ideas`);
        if (response.ok) {
            videoIdeas = await response.json();
            adminVidIdeas = [...videoIdeas]; // Copy to admin storage
            displayVideoIdeas();
            displayAdminVidIdeas();
        } else {
            console.error('Failed to load video ideas from API');
            // Fallback to localStorage if API is not available
            loadFromLocalStorage();
        }
    } catch (error) {
        console.error('Error loading video ideas:', error);
        // Fallback to localStorage if API is not available
        loadFromLocalStorage();
    }
}

// Fallback to localStorage
function loadFromLocalStorage() {
    const savedIdeas = localStorage.getItem('videoIdeas');
    if (savedIdeas) {
        videoIdeas = JSON.parse(savedIdeas);
    }
    
    const savedAdminIdeas = localStorage.getItem('adminVidIdeas');
    if (savedAdminIdeas) {
        adminVidIdeas = JSON.parse(savedAdminIdeas);
    }
    
    displayVideoIdeas();
    displayAdminVidIdeas();
}

// Save video ideas to online database
async function saveVideoIdeas() {
    try {
        // Save to localStorage as backup
        localStorage.setItem('videoIdeas', JSON.stringify(videoIdeas));
        localStorage.setItem('adminVidIdeas', JSON.stringify(adminVidIdeas));
        
        // Try to sync with API
        await syncWithAPI();
    } catch (error) {
        console.error('Error saving video ideas:', error);
    }
}

// Sync with online database
async function syncWithAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/video-ideas`);
        if (response.ok) {
            const apiIdeas = await response.json();
            videoIdeas = apiIdeas;
            adminVidIdeas = [...apiIdeas];
            localStorage.setItem('videoIdeas', JSON.stringify(videoIdeas));
            localStorage.setItem('adminVidIdeas', JSON.stringify(adminVidIdeas));
        }
    } catch (error) {
        console.error('Error syncing with API:', error);
    }
}

// Display submitted video ideas
function displayVideoIdeas() {
    const ideasList = document.getElementById('ideasList');
    if (!ideasList) return;
    
    if (videoIdeas.length === 0) {
        ideasList.innerHTML = '<div class="no-ideas">No video ideas submitted yet. Be the first to share your creative ideas!</div>';
        return;
    }
    
    ideasList.innerHTML = '';
    
    // Display most recent ideas first
    videoIdeas.slice().reverse().forEach(idea => {
        const ideaCard = createIdeaCard(idea);
        ideasList.appendChild(ideaCard);
    });
}

// Create an idea card element
function createIdeaCard(idea) {
    const card = document.createElement('div');
    card.className = 'idea-card';
    
    const displayName = idea.submitterName || 'Anonymous';
    const categoryLabel = idea.category.charAt(0).toUpperCase() + idea.category.slice(1);
    
    card.innerHTML = `
        <div class="idea-header">
            <div>
                <div class="idea-title">${escapeHtml(idea.title)}</div>
                <span class="idea-category">${categoryLabel}</span>
            </div>
        </div>
        <div class="idea-description">${escapeHtml(idea.description)}</div>
        <div class="idea-footer">
            <span class="idea-submitter">Submitted by: ${escapeHtml(displayName)}</span>
            <span class="idea-date">${formatDate(idea.timestamp)}</span>
        </div>
    `;
    
    return card;
}

// Send video idea to Discord webhook
async function sendToDiscordWebhook(idea) {
    const webhookUrl = 'https://discord.com/api/webhooks/1485733936238821530/J6380XtFt-rLswF1KGeS223OYJYaV5wOUi_tn_6WZEKMowpKHiowmHiXBGeKdGWjSSJ4';
    
    const categoryEmojis = {
        'gaming': '🎮',
        'vlog': '📹',
        'tutorial': '📚',
        'review': '⭐',
        'challenge': '🏆',
        'other': '💡'
    };
    
    const emoji = categoryEmojis[idea.category] || '💡';
    const categoryLabel = idea.category.charAt(0).toUpperCase() + idea.category.slice(1);
    
    // Check if user is logged in with Discord
    const discordUser = localStorage.getItem('discordUser');
    let submitterInfo;
    
    if (discordUser) {
        try {
            const userData = JSON.parse(discordUser);
            const avatarUrl = userData.avatar 
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=64`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png?size=64`;
            
            submitterInfo = {
                name: `${userData.username}#${userData.discriminator}`,
                icon_url: avatarUrl,
                id: userData.id
            };
        } catch (error) {
            console.error('Error parsing Discord user data:', error);
            submitterInfo = {
                name: idea.submitterName || 'Anonymous',
                icon_url: null
            };
        }
    } else {
        submitterInfo = {
            name: idea.submitterName || 'Anonymous',
            icon_url: null
        };
    }
    
    const embed = {
        title: `${emoji} New Video Idea Submitted!`,
        color: 0xFF69B4, // Pink color to match your site theme
        fields: [
            {
                name: '📝 Title',
                value: idea.title,
                inline: false
            },
            {
                name: '📋 Category',
                value: categoryLabel,
                inline: true
            },
            {
                name: '👤 Submitted By',
                value: submitterInfo.name,
                inline: true
            },
            {
                name: '📄 Description',
                value: idea.description,
                inline: false
            },
            {
                name: '🕐 Submitted At',
                value: new Date(idea.timestamp).toLocaleString(),
                inline: true
            }
        ],
        author: submitterInfo.icon_url ? {
            name: submitterInfo.name,
            icon_url: submitterInfo.icon_url
        } : null,
        footer: {
            text: 'SSneder\'s Hub - Video Ideas',
            icon_url: 'https://i.imgur.com/your-logo.png' // You can replace with your logo
        },
        timestamp: new Date().toISOString()
    };
    
    const payload = {
        embeds: [embed],
        username: 'SSneders video idea bot',
        avatar_url: 'https://cdn.discordapp.com/attachments/1485732637002694656/1486102203122061392/discord-bot-avatar.png.png?ex=69c44807&is=69c2f687&hm=fcbbae828d143308b54d6853eba5b45e14ae9af139b3a7b4b00bc37197fd73bb&'
    };
    
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
    }
    
    console.log('Video idea sent to Discord successfully');
}

// Test function for Discord webhook
async function testDiscordWebhook() {
    const testIdea = {
        title: 'Test Video Idea - Bot Testing',
        category: 'gaming',
        description: 'This is a test video idea to verify the Discord webhook is working properly with the new bot name and avatar.',
        submitterName: 'Test User',
        timestamp: Date.now()
    };
    
    try {
        await sendToDiscordWebhook(testIdea);
        console.log('Test webhook sent successfully!');
    } catch (error) {
        console.error('Test webhook failed:', error);
    }
}
async function handleVideoIdeaForm(e) {
    e.preventDefault();
    console.log('Form submission started'); // Debug log
    
    // Prevent multiple submissions
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn.disabled) {
        console.log('Button already disabled, returning'); // Debug log
        return; // Already submitting
    }
    
    const formData = new FormData(e.target);
    let idea = {
        title: formData.get('ideaTitle').trim(),
        category: formData.get('ideaCategory'),
        description: formData.get('ideaDescription').trim(),
        submitterName: formData.get('submitterName').trim(),
        timestamp: Date.now()
    };
    
    console.log('Form data collected:', idea); // Debug log
    
    // Validate form data first
    if (!idea.title || !idea.description || !idea.category) {
        console.log('Validation failed'); // Debug log
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if user is logged in with Discord and override name field
    const discordUser = localStorage.getItem('discordUser');
    if (discordUser) {
        try {
            const userData = JSON.parse(discordUser);
            idea.submitterName = `${userData.username}#${userData.discriminator}`;
            console.log('Using Discord user:', idea.submitterName); // Debug log
        } catch (error) {
            console.error('Error parsing Discord user data:', error);
            // Keep manual name if Discord data is invalid
        }
    }
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        console.log('Attempting to submit to API...'); // Debug log
        // Save to online database
        const response = await fetch(`${API_BASE_URL}/video-ideas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(idea)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('API submission successful'); // Debug log
            
            // Send to Discord webhook
            await sendToDiscordWebhook(idea);
            
            // Reset form
            e.target.reset();
            
            // Show success message
            showNotification('Video idea submitted successfully! Thank you for your contribution!', 'success');
            
            // Automatically refresh video ideas list
            await refreshVideoIdeas();
            
        } else {
            throw new Error('Failed to save to database');
        }
    } catch (error) {
        console.error('Error submitting video idea:', error);
        
        // Fallback to localStorage if API fails
        videoIdeas.push(idea);
        adminVidIdeas.push({...idea});
        localStorage.setItem('videoIdeas', JSON.stringify(videoIdeas));
        localStorage.setItem('adminVidIdeas', JSON.stringify(adminVidIdeas));
        
        // Try to send to Discord webhook even if API fails
        try {
            await sendToDiscordWebhook(idea);
        } catch (discordError) {
            console.error('Discord webhook also failed:', discordError);
        }
        
        // Reset form
        e.target.reset();
        
        showNotification('Video idea submitted locally (offline mode)', 'success');
        
        // Automatically refresh video ideas list
        displayVideoIdeas();
        displayAdminVidIdeas();
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Idea';
        console.log('Form submission completed'); // Debug log
    }
}

// Refresh video ideas from server
async function refreshVideoIdeas() {
    try {
        const response = await fetch(`${API_BASE_URL}/video-ideas`);
        if (response.ok) {
            const freshIdeas = await response.json();
            videoIdeas = freshIdeas;
            adminVidIdeas = [...freshIdeas];
            
            // Update localStorage as backup
            localStorage.setItem('videoIdeas', JSON.stringify(videoIdeas));
            localStorage.setItem('adminVidIdeas', JSON.stringify(adminVidIdeas));
            
            // Update displays
            displayVideoIdeas();
            displayAdminVidIdeas();
            
            console.log('Video ideas refreshed automatically');
        }
    } catch (error) {
        console.error('Error refreshing video ideas:', error);
    }
}

// Display admin vid ideas
function displayAdminVidIdeas() {
    const adminIdeasList = document.getElementById('adminIdeasList');
    if (!adminIdeasList) return;
    
    if (adminVidIdeas.length === 0) {
        adminIdeasList.innerHTML = '<div class="no-ideas">No video ideas submitted yet.</div>';
        return;
    }
    
    adminIdeasList.innerHTML = '';
    
    // Display most recent ideas first
    adminVidIdeas.slice().reverse().forEach(idea => {
        const ideaCard = createAdminIdeaCard(idea);
        adminIdeasList.appendChild(ideaCard);
    });
}

// Create an admin idea card element
function createAdminIdeaCard(idea) {
    const card = document.createElement('div');
    card.className = 'idea-card admin-idea-card';
    
    const displayName = idea.submitterName || 'Anonymous';
    const categoryLabel = idea.category.charAt(0).toUpperCase() + idea.category.slice(1);
    
    card.innerHTML = `
        <div class="idea-header">
            <div>
                <div class="idea-title">${escapeHtml(idea.title)}</div>
                <span class="idea-category">${categoryLabel}</span>
            </div>
            <button class="delete-idea-btn" onclick="deleteVideoIdea('${idea.id || idea.timestamp}')" title="Delete this idea">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="idea-description">${escapeHtml(idea.description)}</div>
        <div class="idea-footer">
            <span class="idea-submitter">Submitted by: ${escapeHtml(displayName)}</span>
            <span class="idea-date">${formatDate(idea.timestamp)}</span>
        </div>
    `;
    
    return card;
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Admin functionality
const ADMIN_PASSCODE = "Mya45678"; // Your admin passcode
let isAdminLoggedIn = false;

// Handle admin login form
function handleAdminLogin(e) {
    e.preventDefault();
    
    const passcode = document.getElementById('adminPasscode').value;
    const adminStatus = document.getElementById('adminStatus');
    const adminPanel = document.getElementById('adminPanel');
    const vidIdeaNavItem = document.getElementById('vidIdeaNavItem');
    
    // Easter egg: SSnederIsCool takes you to YouTube Short
    if (passcode === "SSnederIsCool") {
        window.open('https://www.youtube.com/shorts/_6HzLIJPH2A', '_blank');
        showNotification('🎮 Easter Egg activated! Check out the YouTube Short!', 'success');
        e.target.reset();
        return;
    }
    
    if (passcode === ADMIN_PASSCODE) {
        isAdminLoggedIn = true;
        adminStatus.className = 'admin-status success';
        adminStatus.textContent = 'Login successful! Welcome to the admin panel.';
        adminPanel.style.display = 'block';
        vidIdeaNavItem.style.display = 'block'; // Show Vid Idea section
        e.target.reset();
        
        // Trigger confetti effect
        triggerConfetti();
    } else {
        isAdminLoggedIn = false;
        adminStatus.className = 'admin-status error';
        adminStatus.textContent = 'Incorrect passcode. Please try again.';
        adminPanel.style.display = 'none';
        vidIdeaNavItem.style.display = 'none'; // Keep Vid Idea section hidden
    }
}

// Confetti effect function
function triggerConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ff6b6b', '#4ade80', '#06b6d4', '#3b82f6'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        createConfettiPiece(colors[i % colors.length]);
    }
    
    // Clean up confetti after 2 seconds
    setTimeout(() => {
        const confettiElements = document.querySelectorAll('.confetti-piece');
        confettiElements.forEach(piece => piece.remove());
    }, 2000);
}

// Create individual confetti piece
function createConfettiPiece(color) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        left: ${Math.random() * 100}%;
        top: -10px;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
        transition: all 2s ease-out;
        z-index: 9999;
        pointer-events: none;
    `;
    
    document.body.appendChild(piece);
    
    // Animate falling
    setTimeout(() => {
        piece.style.top = '100%';
        piece.style.opacity = '0';
        piece.style.transform = `rotate(${Math.random() * 720}deg) scale(0)`;
    }, 100);
}

// Check admin login status on page load
function checkAdminStatus() {
    const adminPanel = document.getElementById('adminPanel');
    const vidIdeaNavItem = document.getElementById('vidIdeaNavItem');
    
    if (isAdminLoggedIn) {
        adminPanel.style.display = 'block';
        vidIdeaNavItem.style.display = 'block'; // Show Vid Idea section
    } else {
        vidIdeaNavItem.style.display = 'none'; // Keep Vid Idea section hidden
    }
}
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Update the display with current data
function updateDisplay() {
    // Update sidebar profile - only if elements exist
    const profileNameElement = document.querySelector('#profileName');
    if (profileNameElement) {
        profileNameElement.textContent = socialData.name;
    }
    
    const profileBioElement = document.querySelector('#profileBio');
    if (profileBioElement) {
        profileBioElement.textContent = socialData.bio;
    }
    
    const profileImgElement = document.querySelector('#profileImg');
    if (profileImgElement) {
        profileImgElement.src = socialData.profileImage;
    }
    
    // Update social links page (still dynamic for customization)
    updateSocialLinks();
    
    // Update settings page
    updateSettingsPage();
}

// Update social links
function updateSocialLinks() {
    const socialGrid = document.getElementById('socialGrid');
    if (!socialGrid) return;
    
    socialGrid.innerHTML = '';
    
    socialData.links.forEach(link => {
        if (link.url && link.url.trim() !== '') {
            const linkElement = createSocialLink(link);
            socialGrid.appendChild(linkElement);
        }
    });
    
    // Add animation to new links
    const links = socialGrid.querySelectorAll('.social-link');
    links.forEach((link, index) => {
        link.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
    });
}

// Create a social link element
function createSocialLink(link) {
    const a = document.createElement('a');
    a.href = link.url;
    a.className = 'social-link';
    a.setAttribute('data-platform', link.platform);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    
    // Handle email links
    if (link.platform === 'email') {
        a.href = `mailto:${link.url}`;
    }
    
    // Get icon class
    const iconClass = getIconClass(link.platform);
    
    a.innerHTML = `
        <div class="social-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="social-text">${link.label}</div>
        <div class="social-arrow">
            <i class="fas fa-arrow-right"></i>
        </div>
    `;
    
    return a;
}

// Get Font Awesome icon class for platform
function getIconClass(platform) {
    const iconMap = {
        'twitter': 'fab fa-twitter',
        'instagram': 'fab fa-instagram',
        'linkedin': 'fab fa-linkedin',
        'github': 'fab fa-github',
        'youtube': 'fab fa-youtube',
        'tiktok': 'fab fa-tiktok',
        'facebook': 'fab fa-facebook',
        'discord': 'fab fa-discord',
        'telegram': 'fab fa-telegram',
        'website': 'fas fa-globe',
        'email': 'fas fa-envelope'
    };
    return iconMap[platform] || 'fas fa-link';
}

// Page navigation
function navigateToPage(pageName) {
    // Hide current page
    const currentPageElement = document.getElementById(`${currentPage}-page`);
    if (currentPageElement) {
        currentPageElement.classList.remove('active');
    }
    
    // Show new page
    const newPageElement = document.getElementById(`${pageName}-page`);
    if (newPageElement) {
        newPageElement.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeNavLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    currentPage = pageName;
    
    // Load page-specific content
    loadPageContent(pageName);
}

// Load page-specific content
function loadPageContent(pageName) {
    switch(pageName) {
        case 'projects':
            loadProjects();
            break;
        case 'skills':
            animateSkillBars();
            break;
    }
}

// Load projects
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    
    projectsData.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
    
    // Add animations
    const cards = projectsGrid.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
    });
}

// Create project card
function createProjectCard(project) {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.setAttribute('data-category', project.category);
    
    div.innerHTML = `
        <div class="project-image">
            <i class="${project.icon}"></i>
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return div;
}

// Animate skill bars
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Update settings page
function updateSettingsPage() {
    const settingsName = document.getElementById('settingsName');
    const settingsBio = document.getElementById('settingsBio');
    const settingsProfileUrl = document.getElementById('settingsProfileUrl');
    
    if (settingsName) settingsName.value = socialData.name;
    if (settingsBio) settingsBio.value = socialData.bio;
    if (settingsProfileUrl) settingsProfileUrl.value = socialData.profileImage;
    
    // Update toggle switches
    const animationsToggle = document.getElementById('animationsToggle');
    
    if (animationsToggle) animationsToggle.checked = animationsEnabled;
}

// Modal functionality
const modal = document.getElementById('editModal');
const editBtn = document.getElementById('editSocialBtn');
const closeBtn = document.getElementById('closeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

// Event listeners for modal
if (editBtn) editBtn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (saveBtn) saveBtn.addEventListener('click', saveChanges);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function openModal() {
    modal.classList.add('active');
    populateEditForm();
}

function closeModal() {
    modal.classList.remove('active');
}

// Populate edit form with current data
function populateEditForm() {
    document.getElementById('name').value = socialData.name;
    document.getElementById('bio').value = socialData.bio;
    document.getElementById('profileUrl').value = socialData.profileImage;
    
    const linksContainer = document.getElementById('linksContainer');
    linksContainer.innerHTML = '';
    
    socialData.links.forEach((link, index) => {
        const linkGroup = createLinkInputGroup(link, index);
        linksContainer.appendChild(linkGroup);
    });
}

// Create input group for a link
function createLinkInputGroup(link, index) {
    const div = document.createElement('div');
    div.className = 'link-input-group';
    div.innerHTML = `
        <input type="text" 
               placeholder="${link.label}" 
               value="${link.url}" 
               data-index="${index}"
               class="link-input">
        <button type="button" onclick="removeLink(${index})" class="remove-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;
    return div;
}

// Remove a link
function removeLink(index) {
    socialData.links[index].url = '';
    populateEditForm();
}

// Save changes from the form
function saveChanges() {
    // Update basic info
    socialData.name = document.getElementById('name').value.trim();
    socialData.bio = document.getElementById('bio').value.trim();
    socialData.profileImage = document.getElementById('profileUrl').value.trim();
    
    // Update links
    const linkInputs = document.querySelectorAll('.link-input');
    linkInputs.forEach((input, index) => {
        if (socialData.links[index]) {
            socialData.links[index].url = input.value.trim();
        }
    });
    
    // Save and update display
    saveData();
    updateDisplay();
    closeModal();
    
    // Show success notification
    showNotification('Changes saved successfully!', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        font-family: 'Inter', sans-serif;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Sidebar toggle removed - sidebar is now always visible

// Theme toggle removed - now using pink and white theme only

// Project filtering
function filterProjects(category) {
    const projectCards = document.querySelectorAll('.project-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === category) {
            btn.classList.add('active');
        }
    });
    
    // Filter projects
    projectCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Contact form submission removed - now using Discord

// Settings page handlers
function handleProfileSettings() {
    const name = document.getElementById('settingsName').value.trim();
    const bio = document.getElementById('settingsBio').value.trim();
    const profileUrl = document.getElementById('settingsProfileUrl').value.trim();
    
    socialData.name = name;
    socialData.bio = bio;
    socialData.profileImage = profileUrl;
    
    saveData();
    updateDisplay();
    showNotification('Profile updated successfully!', 'success');
}

function handleSettingsToggle(setting, value) {
    switch(setting) {
        case 'animations':
            animationsEnabled = value;
            break;
    }
    
    applySettings();
    saveSettings();
}

// Mobile sidebar functionality
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileSidebar() {
    sidebar.classList.toggle('mobile-open');
    sidebarOverlay.classList.toggle('active');
}

function closeMobileSidebar() {
    sidebar.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('active');
}

// Mobile menu event listeners
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileSidebar);
}

// Close sidebar when clicking on navigation links (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            closeMobileSidebar();
        }
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileSidebar();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadVideoIdeas();
    
    // Set up navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            navigateToPage(pageName);
        });
    });
    
    // Set up project filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            filterProjects(category);
        });
    });
    
    // Set up video ideas form
    const videoIdeaForm = document.getElementById('videoIdeaForm');
    if (videoIdeaForm) {
        videoIdeaForm.addEventListener('submit', handleVideoIdeaForm);
    }
    
    // Set up admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Set up settings page
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleProfileSettings);
    }
    
    const editLinksBtn = document.getElementById('editLinksBtn');
    if (editLinksBtn) {
        editLinksBtn.addEventListener('click', openModal);
    }
    
    // Set up settings toggles
    const animationsToggle = document.getElementById('animationsToggle');
    if (animationsToggle) {
        animationsToggle.addEventListener('change', function() {
            handleSettingsToggle('animations', this.checked);
        });
    }
    
    // Add some initial animations
    const elements = document.querySelectorAll('.page.active > *');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + E to open edit modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            openModal();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Add some Easter eggs
    let konamiCode = [];
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiPattern.join(',')) {
            // Easter egg activated!
            document.body.style.animation = 'rainbow 2s ease-in-out';
            showNotification('🎮 Konami Code Activated!', 'success');
            
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
        }
    });
});

// Add rainbow animation for Easter egg
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    .no-animations * {
        animation: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(rainbowStyle);

// Add page visibility API to pause animations when tab is not visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.querySelectorAll('.gradient-orb').forEach(orb => {
            orb.style.animationPlayState = 'paused';
        });
    } else {
        document.querySelectorAll('.gradient-orb').forEach(orb => {
            orb.style.animationPlayState = 'running';
        });
    }
});

// Add some performance optimizations
function optimizePerformance() {
    // Debounce resize events
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Handle resize if needed
        }, 250);
    });
    
    // Lazy load images if needed in the future
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

optimizePerformance();

// Delete video idea from database
async function deleteVideoIdea(ideaId) {
    console.log('Delete function called with ID:', ideaId);
    console.log('Admin logged in:', isAdminLoggedIn);
    
    if (!isAdminLoggedIn) {
        showNotification('You must be logged in as admin to delete ideas', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this video idea? This action cannot be undone.')) {
        return;
    }
    
    console.log('Attempting to delete idea:', ideaId);
    
    try {
        // Delete from online database
        const response = await fetch(`${API_BASE_URL}/video-ideas/${ideaId}`, {
            method: 'DELETE'
        });
        
        console.log('Server response status:', response.status);
        
        if (response.ok) {
            console.log('Server delete successful');
            
            // Remove from local arrays
            videoIdeas = videoIdeas.filter(idea => (idea.id || idea.timestamp) !== ideaId);
            adminVidIdeas = adminVidIdeas.filter(idea => (idea.id || idea.timestamp) !== ideaId);
            
            console.log('Local arrays updated. Remaining ideas:', videoIdeas.length);
            
            // Update localStorage as backup
            localStorage.setItem('videoIdeas', JSON.stringify(videoIdeas));
            localStorage.setItem('adminVidIdeas', JSON.stringify(adminVidIdeas));
            
            // Update displays
            displayVideoIdeas();
            displayAdminVidIdeas();
            
            showNotification('Video idea deleted successfully', 'success');
        } else {
            console.log('Server delete failed, trying local fallback');
            throw new Error('Failed to delete from database');
        }
    } catch (error) {
        console.error('Error deleting video idea:', error);
        
        // Fallback: just remove from local arrays if API fails
        console.log('Using local fallback deletion');
        videoIdeas = videoIdeas.filter(idea => (idea.id || idea.timestamp) !== ideaId);
        adminVidIdeas = adminVidIdeas.filter(idea => (idea.id || idea.timestamp) !== ideaId);
        localStorage.setItem('videoIdeas', JSON.stringify(videoIdeas));
        localStorage.setItem('adminVidIdeas', JSON.stringify(adminVidIdeas));
        displayVideoIdeas();
        displayAdminVidIdeas();
        
        showNotification('Video idea deleted locally (offline mode)', 'success');
    }
}

// Link Accounts functionality
function setupLinkAccountsPage() {
    // Add event listeners to all connect buttons
    const connectButtons = document.querySelectorAll('.account-item .btn-primary');
    
    connectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const accountItem = this.closest('.account-item');
            const accountName = accountItem.querySelector('h4').textContent;
            const accountIcon = accountItem.querySelector('.account-icon');
            
            // Check if already connected
            if (this.textContent === 'Disconnect') {
                // Disconnect account
                disconnectAccount(accountName, this, accountIcon);
            } else {
                // Connect account
                connectAccount(accountName, this, accountIcon);
            }
        });
    });
}

function connectAccount(accountName, button, icon) {
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Connecting...';
    button.disabled = true;
    
    // Simulate OAuth connection (replace with actual OAuth implementation)
    setTimeout(() => {
        // Update button state
        button.textContent = 'Disconnect';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        button.disabled = false;
        
        // Update icon to show connected state
        icon.style.border = '3px solid #4CAF50';
        icon.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        
        // Store connection in localStorage
        const connectedAccounts = JSON.parse(localStorage.getItem('connectedAccounts') || '{}');
        connectedAccounts[accountName] = {
            connected: true,
            connectedAt: new Date().toISOString()
        };
        localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
        
        showNotification(`${accountName} connected successfully!`, 'success');
        
        // Add connected class for styling
        button.closest('.account-item').classList.add('connected');
        
    }, 1500); // Simulate API call delay
}

function disconnectAccount(accountName, button, icon) {
    if (confirm(`Are you sure you want to disconnect ${accountName}?`)) {
        // Update button state
        button.textContent = 'Connect';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        
        // Remove connected styling
        icon.style.border = '';
        icon.style.boxShadow = '';
        button.closest('.account-item').classList.remove('connected');
        
        // Remove from localStorage
        const connectedAccounts = JSON.parse(localStorage.getItem('connectedAccounts') || '{}');
        delete connectedAccounts[accountName];
        localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
        
        showNotification(`${accountName} disconnected`, 'info');
    }
}

// Load connected accounts on page load
function loadConnectedAccounts() {
    const connectedAccounts = JSON.parse(localStorage.getItem('connectedAccounts') || '{}');
    
    Object.keys(connectedAccounts).forEach(accountName => {
        const accountItem = Array.from(document.querySelectorAll('.account-item h4'))
            .find(h4 => h4.textContent === accountName)?.closest('.account-item');
        
        if (accountItem) {
            const button = accountItem.querySelector('.btn-primary, .btn-secondary');
            const icon = accountItem.querySelector('.account-icon');
            
            if (button && icon) {
                button.textContent = 'Disconnect';
                button.classList.remove('btn-primary');
                button.classList.add('btn-secondary');
                icon.style.border = '3px solid #4CAF50';
                icon.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
                accountItem.classList.add('connected');
            }
        }
    });
}

// Initialize Link Accounts page when it's shown
document.addEventListener('DOMContentLoaded', function() {
    // Set up Link Accounts page when navigation happens
    const originalNavigateToPage = window.navigateToPage;
    
    window.navigateToPage = function(pageName) {
        // Call original function
        if (originalNavigateToPage) {
            originalNavigateToPage(pageName);
        }
        
        // Setup Link Accounts page if navigating to it
        if (pageName === 'link-accounts') {
            setTimeout(() => {
                setupLinkAccountsPage();
                loadConnectedAccounts();
            }, 100);
        }
    };
    
    // Also setup if Link Accounts is the initial page
    if (window.currentPage === 'link-accounts') {
        setTimeout(() => {
            setupLinkAccountsPage();
            loadConnectedAccounts();
        }, 100);
    }
});

// Discord OAuth Functions
function signInWithDiscord() {
    const clientId = '1486105329090429120';
    const redirectUri = encodeURIComponent('https://asjunk2012-afk.github.io/SSneders-hub/');
    const scope = 'identify email';
    const responseType = 'token'; // Use implicit grant for frontend-only
    
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    // Store the auth state to check when user returns
    sessionStorage.setItem('discordAuthState', 'pending');
    window.location.href = authUrl; // Redirect instead of popup
}

function checkDiscordAuth() {
    // Check URL hash for access token (implicit grant)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');
    
    if (error) {
        console.error('Discord auth error:', error);
        sessionStorage.removeItem('discordAuthState');
        return;
    }
    
    if (accessToken) {
        // Get user data with the access token
        getDiscordUser(accessToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (sessionStorage.getItem('discordAuthState') === 'pending') {
        // Keep checking
        setTimeout(checkDiscordAuth, 1000);
    }
}

async function getDiscordUser(accessToken) {
    try {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const userData = await userResponse.json();
        
        // Store user data
        localStorage.setItem('discordUser', JSON.stringify(userData));
        
        // Update UI
        showDiscordProfile(userData);
        
        // Clear auth state
        sessionStorage.removeItem('discordAuthState');
        
    } catch (error) {
        console.error('Discord user fetch error:', error);
        // Fallback to demo data
        const fallbackData = await simulateDiscordAuth();
        localStorage.setItem('discordUser', JSON.stringify(fallbackData));
        showDiscordProfile(fallbackData);
        sessionStorage.removeItem('discordAuthState');
    }
}

async function simulateDiscordAuth() {
    // Simulate Discord API response with better demo data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: '123456789012345678',
                username: 'DemoUser',
                discriminator: '1234',
                avatar: null, // No custom avatar, will use default
                email: 'demo@example.com',
                verified: true
            });
        }, 500);
    });
}

// Update video ideas form based on Discord login status
function updateVideoIdeasForm() {
    const discordUser = localStorage.getItem('discordUser');
    const nameFieldGroup = document.getElementById('nameFieldGroup');
    const nameInput = document.getElementById('submitterName');
    const nameHint = document.getElementById('nameFieldHint');
    
    if (discordUser) {
        try {
            const userData = JSON.parse(discordUser);
            // User is logged in with Discord
            nameFieldGroup.classList.add('disabled');
            nameInput.disabled = true;
            nameInput.value = ''; // Clear any manual input
            nameHint.textContent = `Using Discord profile: ${userData.username}#${userData.discriminator}`;
            nameHint.style.color = '#48bb78';
        } catch (error) {
            console.error('Error parsing Discord user data:', error);
            resetVideoIdeasForm();
        }
    } else {
        resetVideoIdeasForm();
    }
}

function resetVideoIdeasForm() {
    const nameFieldGroup = document.getElementById('nameFieldGroup');
    const nameInput = document.getElementById('submitterName');
    const nameHint = document.getElementById('nameFieldHint');
    
    nameFieldGroup.classList.remove('disabled');
    nameInput.disabled = false;
    nameHint.textContent = '';
}

// Update the showDiscordProfile function to also update the form
function showDiscordProfile(userData) {
    const signInBtn = document.getElementById('discordSignInBtn');
    const userProfile = document.getElementById('discordUserProfile');
    const avatar = document.getElementById('discordAvatar');
    const username = document.getElementById('discordUsername');
    
    // Also update account page elements
    const accountAvatar = document.getElementById('accountAvatar');
    const accountName = document.getElementById('accountName');
    const accountStatus = document.getElementById('accountStatus');
    const connectBtn = document.getElementById('connectDiscordBtn');
    const disconnectBtn = document.getElementById('disconnectDiscordBtn');
    const connectionBadge = document.getElementById('connectionStatus');
    
    // Update detail elements
    const detailUsername = document.getElementById('detailUsername');
    const detailUserId = document.getElementById('detailUserId');
    const detailEmail = document.getElementById('detailEmail');
    const detailStatus = document.getElementById('detailStatus');
    
    if (userData) {
        // Construct avatar URL with fallback
        let avatarUrl;
        if (userData.avatar && userData.avatar !== 'default_avatar') {
            // User has a custom avatar
            avatarUrl = userData.avatar.startsWith('a_') 
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.gif?size=64`
                : `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=64`;
        } else {
            // Use default avatar
            const defaultAvatarIndex = parseInt(userData.discriminator) % 5;
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png?size=64`;
        }
        
        // Set avatar with error handling
        avatar.src = avatarUrl;
        avatar.onerror = function() {
            // Fallback to a default image if Discord avatar fails
            this.src = 'https://picsum.photos/seed/discord-avatar/64/64.jpg';
        };
        
        // Update account page avatar (larger size)
        const accountAvatarUrl = avatarUrl.replace('size=64', 'size=120');
        accountAvatar.src = accountAvatarUrl;
        accountAvatar.onerror = function() {
            this.src = 'https://picsum.photos/seed/discord-avatar/120/120.jpg';
        };
        
        // Set username
        const fullUsername = `${userData.username}#${userData.discriminator}`;
        username.textContent = fullUsername;
        accountName.textContent = userData.username;
        detailUsername.textContent = fullUsername;
        
        // Update status
        accountStatus.textContent = 'Connected to Discord';
        detailStatus.textContent = 'Discord User';
        connectionBadge.classList.remove('disconnected');
        
        // Update other details
        detailUserId.textContent = userData.id;
        detailEmail.textContent = userData.email || 'Not available';
        
        // Show profile, hide sign-in button (sidebar)
        signInBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        
        // Update account page buttons
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'flex';
        
        // Enable privacy settings
        document.getElementById('publicProfile').disabled = false;
        document.getElementById('allowDMs').disabled = false;
        document.getElementById('showStatus').disabled = false;
        
        // Update video ideas form
        updateVideoIdeasForm();
        
        console.log('Discord profile displayed:', userData);
    }
}

function signOutDiscord() {
    localStorage.removeItem('discordUser');
    
    // Update sidebar
    const signInBtn = document.getElementById('discordSignInBtn');
    const userProfile = document.getElementById('discordUserProfile');
    signInBtn.style.display = 'flex';
    userProfile.style.display = 'none';
    
    // Reset account page
    const accountAvatar = document.getElementById('accountAvatar');
    const accountName = document.getElementById('accountName');
    const accountStatus = document.getElementById('accountStatus');
    const connectBtn = document.getElementById('connectDiscordBtn');
    const disconnectBtn = document.getElementById('disconnectDiscordBtn');
    const connectionBadge = document.getElementById('connectionStatus');
    
    accountAvatar.src = 'https://picsum.photos/seed/default-avatar/120/120.jpg';
    accountName.textContent = 'Guest User';
    accountStatus.textContent = 'Not connected to Discord';
    connectBtn.style.display = 'flex';
    disconnectBtn.style.display = 'none';
    connectionBadge.classList.add('disconnected');
    
    // Reset detail elements
    document.getElementById('detailUsername').textContent = 'Not connected';
    document.getElementById('detailUserId').textContent = 'Not available';
    document.getElementById('detailEmail').textContent = 'Not available';
    document.getElementById('detailStatus').textContent = 'Guest';
    
    // Disable privacy settings
    document.getElementById('publicProfile').disabled = true;
    document.getElementById('allowDMs').disabled = true;
    document.getElementById('showStatus').disabled = true;
    
    // Update video ideas form
    resetVideoIdeasForm();
}

// Account page utility functions
function exportAccountData() {
    const userData = localStorage.getItem('discordUser');
    if (userData) {
        const dataStr = JSON.stringify(JSON.parse(userData), null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'discord-account-data.json';
        link.click();
        URL.revokeObjectURL(url);
    } else {
        alert('No account data to export. Please connect your Discord account first.');
    }
}

function clearAccountData() {
    if (confirm('Are you sure you want to clear all local account data? This will sign you out.')) {
        signOutDiscord();
        alert('Account data cleared successfully.');
    }
}

function refreshAccountData() {
    const userData = localStorage.getItem('discordUser');
    if (userData) {
        try {
            const data = JSON.parse(userData);
            showDiscordProfile(data);
            alert('Account data refreshed successfully.');
        } catch (error) {
            console.error('Error refreshing account data:', error);
            alert('Error refreshing account data. Please try signing in again.');
        }
    } else {
        alert('No account data to refresh. Please connect your Discord account first.');
    }
}

// Check for existing Discord session on page load
document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('discordUser');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            showDiscordProfile(userData);
        } catch (error) {
            console.error('Error parsing stored Discord user:', error);
        }
    }
    
    // Check for Discord auth callback on page load
    checkDiscordAuth();
    
    // Initialize video ideas form
    updateVideoIdeasForm();
});
