class ChatBot {
    constructor() {
        this.currentStep = 0;
        this.userData = {};
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.progressFill = document.getElementById('progressFill');

        // Configuração do Supabase
        this.supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';
        
        this.steps = [
            {
                id: 'welcome',
                message: 'Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou seu assistente virtual e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio.',
                type: 'bot',
                nextStep: 'name'
            },
            {
                id: 'name',
                message: 'Para começarmos, qual é o seu nome?',
                type: 'input',
                field: 'name',
                validation: (value) => value.length >= 2,
                errorMessage: 'Por favor, digite um nome válido com pelo menos 2 caracteres.',
                nextStep: 'userType'
            },
            {
                id: 'userType',
                message: (name) => `Prazer em conhecê-lo(a), ${name}! 😊\n\nPara personalizar nossa conversa, você é:`,
                type: 'options',
                field: 'userType',
                options: [
                    { text: '🏢 Empresa/Negócio', value: 'empresa' },
                    { text: '🎨 Criador de Conteúdo', value: 'criador' }
                ],
                nextStep: (value) => value === 'empresa' ? 'businessName' : 'creatorInfo'
            },
            {
                id: 'businessName',
                message: 'Perfeito! Qual é o nome da sua empresa?',
                type: 'input',
                field: 'businessName',
                validation: (value) => value.length >= 2,
                errorMessage: 'Por favor, digite o nome da empresa.',
                nextStep: 'whatsapp'
            },
            {
                id: 'creatorInfo',
                message: 'Que legal! Como criador, você pode se cadastrar em nossa plataforma para participar de campanhas incríveis! 🎯',
                type: 'bot',
                nextStep: 'whatsapp'
            },
            {
                id: 'whatsapp',
                message: 'Qual é o seu WhatsApp? (formato: 11999999999)',
                type: 'input',
                field: 'whatsapp',
                validation: (value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
                errorMessage: 'Por favor, digite um WhatsApp válido (apenas números).',
                nextStep: 'email'
            },
            {
                id: 'email',
                message: 'E qual é o seu e-mail?',
                type: 'input',
                field: 'email',
                validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                errorMessage: 'Por favor, digite um e-mail válido.',
                nextStep: 'instagram'
            },
            {
                id: 'instagram',
                message: 'Qual é o seu Instagram? (apenas o @usuario)',
                type: 'input',
                field: 'instagram',
                validation: (value) => value.length >= 2,
                errorMessage: 'Por favor, digite seu Instagram.',
                nextStep: 'businessGoal'
            },
            {
                id: 'businessGoal',
                message: (userData) => {
                    if (userData.userType === 'empresa') {
                        return 'Qual é o principal objetivo da sua empresa com marketing digital?';
                    } else {
                        return 'Que tipo de conteúdo você cria?';
                    }
                },
                type: 'options',
                field: 'goal',
                options: (userData) => {
                    if (userData.userType === 'empresa') {
                        return [
                            { text: '📈 Aumentar vendas', value: 'vendas' },
                            { text: '👥 Ganhar mais clientes', value: 'clientes' },
                            { text: '🎯 Divulgar marca/produto', value: 'divulgacao' },
                            { text: '🌟 Melhorar presença digital', value: 'presenca' }
                        ];
                    } else {
                        return [
                            { text: '🍕 Gastronomia', value: 'gastronomia' },
                            { text: '👗 Moda/Lifestyle', value: 'moda' },
                            { text: '🏃‍♀️ Fitness/Saúde', value: 'fitness' },
                            { text: '🎮 Entretenimento', value: 'entretenimento' },
                            { text: '📚 Educação', value: 'educacao' },
                            { text: '🎨 Outros', value: 'outros' }
                        ];
                    }
                },
                nextStep: 'final'
            },
            {
                id: 'final',
                message: (userData) => {
                    if (userData.userType === 'empresa') {
                        return `Perfeito, ${userData.name}! 🎉\n\nRecebemos suas informações:\n• Empresa: ${userData.businessName}\n• WhatsApp: ${userData.whatsapp}\n• E-mail: ${userData.email}\n• Instagram: ${userData.instagram}\n• Objetivo: ${this.getGoalText(userData.goal)}\n\nNossa equipe entrará em contato em breve para apresentar como podemos ajudar sua empresa a crescer com influenciadores locais! 🚀`;
                    } else {
                        return `Obrigado, ${userData.name}! 🎉\n\nSuas informações foram registradas:\n• WhatsApp: ${userData.whatsapp}\n• E-mail: ${userData.email}\n• Instagram: ${userData.instagram}\n• Área: ${this.getGoalText(userData.goal)}\n\nEm breve entraremos em contato para te incluir em nossas campanhas! 🌟`;
                    }
                },
                type: 'bot',
                final: true
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startConversation();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    startConversation() {
        setTimeout(() => {
            this.processStep();
        }, 1000);
    }

    processStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;

        this.updateProgress();

        if (step.type === 'bot') {
            let message = typeof step.message === 'function' ? step.message(this.userData) : step.message;
            this.addBotMessage(message);
            
            if (step.final) {
                this.saveUserData();
                this.showFinalActions();
                return;
            }
            
            setTimeout(() => {
                this.currentStep++;
                this.processStep();
            }, 2000);
        } else if (step.type === 'input') {
            let message = typeof step.message === 'function' ? step.message(this.userData.name) : step.message;
            this.addBotMessage(message);
            this.enableInput();
        } else if (step.type === 'options') {
            let message = typeof step.message === 'function' ? step.message(this.userData.name) : step.message;
            this.addBotMessage(message);
            
            setTimeout(() => {
                let options = typeof step.options === 'function' ? step.options(this.userData) : step.options;
                this.showOptions(options);
            }, 1000);
        }
    }

    addBotMessage(message) {
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot';
            messageDiv.innerHTML = `
                <div class="message-avatar bot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content bot-message">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            `;
            
            this.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
        }, 1500);
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content user-message">
                ${message}
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = this.chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    enableInput() {
        this.chatInput.disabled = false;
        this.sendButton.disabled = false;
        this.chatInput.focus();
    }

    disableInput() {
        this.chatInput.disabled = true;
        this.sendButton.disabled = true;
        this.chatInput.value = '';
    }

    showOptions(options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                this.handleOptionSelect(option.value, option.text);
                optionsContainer.remove();
            });
            optionsContainer.appendChild(button);
        });
        
        this.chatMessages.appendChild(optionsContainer);
        this.scrollToBottom();
    }

    handleSend() {
        const value = this.chatInput.value.trim();
        if (!value) return;

        const step = this.steps[this.currentStep];
        
        if (step.validation && !step.validation(value)) {
            this.addUserMessage(value);
            setTimeout(() => {
                this.addBotMessage(step.errorMessage);
            }, 500);
            this.chatInput.value = '';
            return;
        }

        this.addUserMessage(value);
        this.userData[step.field] = value;
        this.disableInput();
        
        setTimeout(() => {
            this.currentStep++;
            this.processStep();
        }, 1000);
    }

    handleOptionSelect(value, text) {
        const step = this.steps[this.currentStep];
        this.addUserMessage(text);
        this.userData[step.field] = value;
        
        setTimeout(() => {
            this.currentStep++;
            this.processStep();
        }, 1000);
    }

    updateProgress() {
        const progress = (this.currentStep / (this.steps.length - 1)) * 100;
        this.progressFill.style.width = `${Math.min(progress, 100)}%`;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    getGoalText(goal) {
        const goals = {
            'vendas': 'Aumentar vendas',
            'clientes': 'Ganhar mais clientes',
            'divulgacao': 'Divulgar marca/produto',
            'presenca': 'Melhorar presença digital',
            'gastronomia': 'Gastronomia',
            'moda': 'Moda/Lifestyle',
            'fitness': 'Fitness/Saúde',
            'entretenimento': 'Entretenimento',
            'educacao': 'Educação',
            'outros': 'Outros'
        };
        return goals[goal] || goal;
    }

    async saveUserData() {
        try {
            console.log('Dados do usuário:', this.userData);

            // Preparar dados para a tabela businesses do Supabase
            const businessData = {
                organization_id: "00000000-0000-0000-0000-000000000001", // ID padrão da organização
                name: this.userData.userType === 'empresa' ? this.userData.businessName : this.userData.name,
                slug: this.generateSlug(this.userData.userType === 'empresa' ? this.userData.businessName : this.userData.name),
                contact_info: JSON.stringify({
                    email: this.userData.email,
                    phone: this.userData.whatsapp,
                    whatsapp: this.userData.whatsapp,
                    instagram: this.userData.instagram,
                    primary_contact: this.userData.name
                }),
                address: JSON.stringify({
                    city: "",
                    state: "",
                    street: "",
                    country: "Brasil",
                    zip_code: ""
                }),
                contract_info: JSON.stringify({
                    files: [],
                    terms: {},
                    signed: false,
                    valid_until: null,
                    signature_date: null
                }),
                status: "Lead - Primeiro contato",
                tags: [],
                custom_fields: JSON.stringify({
                    notes: `Lead gerado via chatbot - Objetivo: ${this.getGoalText(this.userData.goal)}`,
                    categoria: this.getCategoryFromGoal(this.userData.goal),
                    comercial: "",
                    planoAtual: "",
                    responsavel: "Chatbot",
                    grupoWhatsappCriado: "Não",
                    tipoUsuario: this.userData.userType
                }),
                metrics: JSON.stringify({
                    roi: 0,
                    total_spent: 0,
                    total_campaigns: 0,
                    active_campaigns: 0
                }),
                is_active: true,
                business_stage: "Lead qualificado",
                estimated_value: "0.00",
                contract_creators_count: 0,
                priority: "Média",
                current_stage_since: new Date().toISOString(),
                expected_close_date: null,
                actual_close_date: null,
                is_won: false,
                is_lost: false,
                lost_reason: null,
                apresentacao_empresa: ""
            };

            // Salvar no Supabase
            const response = await fetch(`${this.supabaseUrl}/rest/v1/businesses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(businessData)
            });

            if (response.ok) {
                console.log('Lead salvo com sucesso no Supabase!');
            } else {
                console.error('Erro ao salvar no Supabase:', await response.text());
            }

        } catch (error) {
            console.error('Erro ao salvar lead:', error);
        }
    }

    generateSlug(name) {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') + '-' + Math.random().toString(36).substr(2, 8);
    }

    getCategoryFromGoal(goal) {
        const categories = {
            'vendas': 'Vendas',
            'clientes': 'Marketing',
            'divulgacao': 'Marketing',
            'presenca': 'Marketing Digital',
            'gastronomia': 'Gastronomia',
            'moda': 'Moda',
            'fitness': 'Fitness',
            'entretenimento': 'Entretenimento',
            'educacao': 'Educação',
            'outros': 'Outros'
        };
        return categories[goal] || 'Outros';
    }

    showFinalActions() {
        setTimeout(() => {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'options-container';
            actionsDiv.innerHTML = `
                <button class="option-button" onclick="window.open('https://wa.me/5542991159229?text=Olá! Vim do site da crIAdores e gostaria de saber mais sobre os serviços.', '_blank')">
                    📱 Falar no WhatsApp
                </button>
                <button class="option-button" onclick="window.location.href='home.html'">
                    🏠 Voltar ao Site
                </button>
            `;
            
            this.chatMessages.appendChild(actionsDiv);
            this.scrollToBottom();
        }, 2000);
    }
}

// Inicializar o chatbot quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});
