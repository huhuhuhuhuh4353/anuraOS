/**
 * AI Assistant Widget - Floating chat interface
 * Matches AnuraOS Base-44 dark-mode branding
 */
class AIAssistant extends GenericApp {
	constructor() {
		super({
			name: 'AI Assistant',
			title: 'AI Assistant',
			icon: '✨',
			width: 420,
			height: 600,
			minWidth: 320,
			minHeight: 400,
			resizable: true,
			minimizable: true,
			maximizable: false,
			closable: true,
			transparency: 0.95,
		});

		this.messages = [];
		this.isLoading = false;
	}

	async init() {
		await super.init();
		this.setupUI();
		this.setupEventListeners();
		this.loadChatHistory();
	}

	setupUI() {
		this.window.content.innerHTML = `
			<div class="ai-assistant-container">
				<div class="ai-assistant-header">
					<div class="ai-assistant-title">
						<span class="ai-icon">✨</span>
						<span>AI Assistant</span>
					</div>
				</div>
				
				<div class="ai-assistant-messages" id="messagesContainer">
					<div class="ai-message welcome-message">
						<div class="message-content">
							<p>Welcome to AnuraOS AI Assistant! How can I help you today?</p>
						</div>
					</div>
				</div>
				
				<div class="ai-assistant-input-area">
					<div class="ai-input-wrapper">
						<input 
							type="text" 
							class="ai-input-field" 
							id="aiInput" 
							placeholder="Ask me anything..."
							autocomplete="off"
						/>
						<button class="ai-send-button" id="aiSendBtn" title="Send message">
							<span class="send-icon">→</span>
						</button>
					</div>
				</div>
			</div>
		`;

		this.applyStyles();
	}

	applyStyles() {
		if (!document.getElementById('ai-assistant-styles')) {
			const style = document.createElement('style');
			style.id = 'ai-assistant-styles';
			style.textContent = `
				.ai-assistant-container {
					display: flex;
					flex-direction: column;
					height: 100%;
					background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%);
					border-radius: 12px;
					overflow: hidden;
					border: 2px solid rgba(56, 189, 248, 0.4);
					box-shadow: 0 0 20px rgba(56, 189, 248, 0.1), inset 0 0 20px rgba(56, 189, 248, 0.05);
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
				}

				.ai-assistant-header {
					padding: 16px;
					border-bottom: 1px solid rgba(56, 189, 248, 0.2);
					background: linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%);
					display: flex;
					align-items: center;
					justify-content: space-between;
					flex-shrink: 0;
				}

				.ai-assistant-title {
					display: flex;
					align-items: center;
					gap: 8px;
					color: #38BDF8;
					font-weight: 600;
					font-size: 14px;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}

				.ai-icon {
					font-size: 18px;
					animation: pulse-glow 2s ease-in-out infinite;
				}

				@keyframes pulse-glow {
					0%, 100% { 
						text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
					}
					50% { 
						text-shadow: 0 0 16px rgba(56, 189, 248, 0.8);
					}
				}

				.ai-assistant-messages {
					flex: 1;
					overflow-y: auto;
					padding: 16px;
					display: flex;
					flex-direction: column;
					gap: 12px;
					scroll-behavior: smooth;
				}

				.ai-assistant-messages::-webkit-scrollbar {
					width: 6px;
				}

				.ai-assistant-messages::-webkit-scrollbar-track {
					background: rgba(56, 189, 248, 0.05);
					border-radius: 3px;
				}

				.ai-assistant-messages::-webkit-scrollbar-thumb {
					background: rgba(56, 189, 248, 0.3);
					border-radius: 3px;
				}

				.ai-assistant-messages::-webkit-scrollbar-thumb:hover {
					background: rgba(56, 189, 248, 0.5);
				}

				.ai-message,
				.user-message {
					display: flex;
					margin-bottom: 8px;
					animation: fadeInUp 0.3s ease-out;
				}

				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.ai-message {
					justify-content: flex-start;
				}

				.user-message {
					justify-content: flex-end;
				}

				.message-content {
					max-width: 85%;
					padding: 10px 14px;
					border-radius: 10px;
					font-size: 13px;
					line-height: 1.4;
					word-wrap: break-word;
				}

				.ai-message .message-content {
					background: rgba(56, 189, 248, 0.1);
					color: #E0F2FE;
					border: 1px solid rgba(56, 189, 248, 0.3);
					border-left: 3px solid #38BDF8;
				}

				.user-message .message-content {
					background: rgba(56, 189, 248, 0.25);
					color: #F8FAFC;
					border: 1px solid rgba(56, 189, 248, 0.5);
					border-right: 3px solid #38BDF8;
				}

				.welcome-message .message-content {
					background: rgba(56, 189, 248, 0.08);
					color: #CBD5E1;
					border: 1px solid rgba(56, 189, 248, 0.2);
					font-style: italic;
				}

				.welcome-message p {
					margin: 0;
				}

				.typing-indicator {
					display: flex;
					gap: 4px;
					padding: 10px 14px;
				}

				.typing-dot {
					width: 6px;
					height: 6px;
					border-radius: 50%;
					background: rgba(56, 189, 248, 0.6);
					animation: typing 1.4s infinite;
				}

				.typing-dot:nth-child(2) {
					animation-delay: 0.2s;
				}

				.typing-dot:nth-child(3) {
					animation-delay: 0.4s;
				}

				@keyframes typing {
					0%, 60%, 100% { 
						opacity: 0.5;
						transform: translateY(0);
					}
					30% { 
						opacity: 1;
						transform: translateY(-8px);
					}
				}

				.ai-assistant-input-area {
					padding: 12px;
					border-top: 1px solid rgba(56, 189, 248, 0.2);
					background: linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
					flex-shrink: 0;
				}

				.ai-input-wrapper {
					display: flex;
					gap: 8px;
					align-items: center;
				}

				.ai-input-field {
					flex: 1;
					background: rgba(15, 23, 42, 0.6);
					border: 1px solid rgba(56, 189, 248, 0.3);
					border-radius: 8px;
					padding: 10px 12px;
					color: #F8FAFC;
					font-size: 13px;
					font-family: inherit;
					transition: all 0.2s ease;
					outline: none;
				}

				.ai-input-field:focus {
					background: rgba(15, 23, 42, 0.8);
					border-color: #38BDF8;
					box-shadow: 0 0 12px rgba(56, 189, 248, 0.3), inset 0 0 8px rgba(56, 189, 248, 0.1);
				}

				.ai-input-field::placeholder {
					color: rgba(226, 232, 240, 0.5);
				}

				.ai-send-button {
					background: linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(56, 189, 248, 0.1) 100%);
					border: 1px solid rgba(56, 189, 248, 0.5);
					border-radius: 8px;
					padding: 10px 12px;
					color: #38BDF8;
					cursor: pointer;
					font-size: 16px;
					font-weight: 600;
					transition: all 0.2s ease;
					display: flex;
					align-items: center;
					justify-content: center;
					min-width: 40px;
					height: 40px;
					flex-shrink: 0;
				}

				.ai-send-button:hover {
					background: linear-gradient(135deg, rgba(56, 189, 248, 0.5) 0%, rgba(56, 189, 248, 0.3) 100%);
					border-color: #38BDF8;
					box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
					transform: translateY(-2px);
				}

				.ai-send-button:active {
					transform: translateY(0);
					box-shadow: 0 0 8px rgba(56, 189, 248, 0.2);
				}

				.ai-send-button:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}

				.send-icon {
					display: inline-block;
					font-weight: bold;
				}
			`;
			document.head.appendChild(style);
		}
	}

	setupEventListeners() {
		const input = this.window.content.querySelector('#aiInput');
		const sendBtn = this.window.content.querySelector('#aiSendBtn');

		sendBtn.addEventListener('click', () => this.sendMessage());
		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		});
	}

	async sendMessage() {
		const input = this.window.content.querySelector('#aiInput');
		const message = input.value.trim();

		if (!message || this.isLoading) return;

		this.addUserMessage(message);
		input.value = '';
		input.focus();

		this.isLoading = true;
		this.showTypingIndicator();

		// Simulate AI response (replace with actual API call)
		setTimeout(() => {
			this.removeTypingIndicator();
			const response = this.generateResponse(message);
			this.addAIMessage(response);
			this.isLoading = false;
		}, 800 + Math.random() * 400);
	}

	addUserMessage(text) {
		const container = this.window.content.querySelector('#messagesContainer');
		const messageEl = document.createElement('div');
		messageEl.className = 'user-message';
		messageEl.innerHTML = `<div class="message-content">${this.escapeHTML(text)}</div>`;
		container.appendChild(messageEl);
		this.scrollToBottom();
		this.messages.push({ role: 'user', content: text });
		this.saveChatHistory();
	}

	addAIMessage(text) {
		const container = this.window.content.querySelector('#messagesContainer');
		const messageEl = document.createElement('div');
		messageEl.className = 'ai-message';
		messageEl.innerHTML = `<div class="message-content">${this.escapeHTML(text)}</div>`;
		container.appendChild(messageEl);
		this.scrollToBottom();
		this.messages.push({ role: 'assistant', content: text });
		this.saveChatHistory();
	}

	showTypingIndicator() {
		const container = this.window.content.querySelector('#messagesContainer');
		const typingEl = document.createElement('div');
		typingEl.className = 'ai-message typing-indicator';
		typingEl.id = 'typingIndicator';
		typingEl.innerHTML = `
			<div class="typing-dot"></div>
			<div class="typing-dot"></div>
			<div class="typing-dot"></div>
		`;
		container.appendChild(typingEl);
		this.scrollToBottom();
	}

	removeTypingIndicator() {
		const typing = this.window.content.querySelector('#typingIndicator');
		if (typing) typing.remove();
	}

	scrollToBottom() {
		const container = this.window.content.querySelector('#messagesContainer');
		setTimeout(() => {
			container.scrollTop = container.scrollHeight;
		}, 0);
	}

	generateResponse(message) {
		const responses = {
			greeting: "Hello! I'm your AI assistant. How can I help you explore AnuraOS today?",
			help: "I can assist with app navigation, system information, file operations, and more. Feel free to ask me anything!",
			about: "AnuraOS is a webOS with v86 capabilities and a modular app system. It combines web technologies with powerful emulation features.",
			default: `I understand you said: "${message}". This is a demo response. In production, I would connect to a real AI service to provide meaningful assistance.`
		};

		const lower = message.toLowerCase();
		if (lower.includes('hello') || lower.includes('hi')) return responses.greeting;
		if (lower.includes('help')) return responses.help;
		if (lower.includes('about') || lower.includes('what is')) return responses.about;
		return responses.default;
	}

	escapeHTML(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	saveChatHistory() {
		idbKeyval.set('ai-assistant-chat', this.messages).catch(err => 
			console.warn('Failed to save chat history:', err)
		);
	}

	loadChatHistory() {
		idbKeyval.get('ai-assistant-chat').then(history => {
			if (history && Array.isArray(history)) {
				this.messages = history;
				const container = this.window.content.querySelector('#messagesContainer');
				container.innerHTML = '<div class="ai-message welcome-message"><div class="message-content"><p>Welcome back! Here\'s your chat history.</p></div></div>';
				history.forEach(msg => {
					const messageEl = document.createElement('div');
					messageEl.className = msg.role === 'user' ? 'user-message' : 'ai-message';
					messageEl.innerHTML = `<div class="message-content">${this.escapeHTML(msg.content)}</div>`;
					container.appendChild(messageEl);
				});
				this.scrollToBottom();
			}
		}).catch(err => console.warn('Failed to load chat history:', err));
	}

	onClose() {
		this.saveChatHistory();
		super.onClose();
	}
}
