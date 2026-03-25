// Test Discord webhook
const testWebhook = async () => {
    const webhookUrl = 'https://discord.com/api/webhooks/1485733936238821530/J6380XtFt-rLswF1KGeS223OYJYaV5wOUi_tn_6WZEKMowpKHiowmHiXBGeKdGWjSSJ4';
    
    const embed = {
        title: '🧪 Webhook Test',
        color: 0x00FF00,
        description: 'Testing the Discord webhook integration for video ideas submission.',
        fields: [
            {
                name: '🔧 Test Type',
                value: 'Webhook Connectivity Test',
                inline: true
            },
            {
                name: '🕐 Test Time',
                value: new Date().toLocaleString(),
                inline: true
            },
            {
                name: '✅ Status',
                value: 'Webhook is working correctly!',
                inline: false
            }
        ],
        footer: {
            text: 'SSneder\'s Hub - Webhook Test'
        },
        timestamp: new Date().toISOString()
    };
    
    const payload = {
        embeds: [embed],
        username: 'SSneders webhook test bot',
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
            console.log('✅ Webhook test successful!');
            console.log('Status:', response.status);
            console.log('Message should appear in your Discord channel now.');
        } else {
            console.log('❌ Webhook test failed!');
            console.log('Status:', response.status);
            console.log('Response:', await response.text());
        }
    } catch (error) {
        console.error('❌ Webhook test error:', error.message);
    }
};

testWebhook();
