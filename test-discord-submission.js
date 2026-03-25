// Test webhook with Discord user submission
const testDiscordUserSubmission = async () => {
    const webhookUrl = 'https://discord.com/api/webhooks/1485733936238821530/J6380XtFt-rLswF1KGeS223OYJYaV5wOUi_tn_6WZEKMowpKHiowmHiXBGeKdGWjSSJ4';
    
    // Simulate a logged-in Discord user submitting a video idea
    const idea = {
        title: 'Minecraft Speedrun Challenge',
        category: 'gaming',
        description: 'Try to complete Minecraft in under 30 minutes with random seed!',
        timestamp: Date.now()
    };
    
    // Simulate Discord user data
    const userData = {
        id: '123456789012345678',
        username: 'TestUser',
        discriminator: '1234',
        avatar: 'a_abcdef123456789' // Animated avatar
    };
    
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
    
    const avatarUrl = userData.avatar.startsWith('a_') 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.gif?size=64`
        : `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=64`;
    
    const submitterInfo = {
        name: `${userData.username}#${userData.discriminator}`,
        icon_url: avatarUrl,
        id: userData.id
    };
    
    const embed = {
        title: `${emoji} New Video Idea Submitted!`,
        color: 0xFF69B4,
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
        author: {
            name: submitterInfo.name,
            icon_url: submitterInfo.icon_url
        },
        footer: {
            text: 'SSneder\'s Hub - Video Ideas',
            icon_url: 'https://i.imgur.com/your-logo.png'
        },
        timestamp: new Date().toISOString()
    };
    
    const payload = {
        embeds: [embed],
        username: 'SSneders video idea bot',
        avatar_url: 'https://cdn.discordapp.com/attachments/1485732637002694656/1486102203122061392/discord-bot-avatar.png.png?ex=69c44807&is=69c2f687&hm=fcbbae828d143308b54d6853eba5b45e14ae9af139b3a7b4b00bc37197fd73bb&'
    };
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Discord user submission test successful!');
            console.log('Status:', response.status);
            console.log('This shows how submissions look when users are logged in with Discord.');
        } else {
            console.log('❌ Discord user submission test failed!');
            console.log('Status:', response.status);
            console.log('Response:', await response.text());
        }
    } catch (error) {
        console.error('❌ Discord user submission test error:', error.message);
    }
};

testDiscordUserSubmission();
