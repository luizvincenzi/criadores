class ChatbotModal {
    constructor() {
        this.currentStep = 0;
        this.userData = {};
        this.modal = document.getElementById('chatbotModal');
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.inputArea = document.getElementById('chatbotInputArea');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.progressFill = document.getElementById('chatbotProgressFill');
        
        // Configuração do Supabase
        this.supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';
        
        this.steps = [
            {
                id: 'welcome',
                message: 'Olá! 👋 Seja bem-vindo(a) à crIAdores! Sou seu assistente virtual e estou aqui para te ajudar a descobrir como podemos potencializar seu negócio.',
                type: 'bot',
                nextStep: 'userType'
            },
            {
                id: 'userType',
                message: 'Para começarmos, você é:',
                type: 'options',
                field: 'userType',
                options: [
                    { text: '🏢 Empresa/Negócio', value: 'empresa' },
                    { text: '🎨 Criador de Conteúdo', value: 'criador' }
                ],
                nextStep: (value) => value === 'empresa' ? 'businessName' : 'creatorNiche'
            },
            {
                id: 'businessName',
                message: 'Perfeito! Qual é o nome da sua empresa?',
                type: 'input',
                field: 'businessName',
                validation: (value) => value.length >= 2,
                errorMessage: 'Por favor, digite o nome da empresa.',
                nextStep: 'businessSegment'
            },
            {
                id: 'businessSegment',
                message: 'Em qual segmento sua empresa atua?',
                type: 'options',
                field: 'businessSegment',
                options: [
                    { text: '🍕 Alimentação/Restaurantes', value: 'alimentacao' },
                    { text: '👗 Moda/Beleza', value: 'moda' },
                    { text: '🏥 Saúde/Bem-estar', value: 'saude' },
                    { text: '🏠 Casa/Decoração', value: 'casa' },
                    { text: '🚗 Automotivo', value: 'automotivo' },
                    { text: '📚 Educação/Cursos', value: 'educacao' },
                    { text: '🎯 Outros', value: 'outros' }
                ],
                nextStep: 'businessGoal'
            },
            {
                id: 'businessGoal',
                message: 'Qual é o principal objetivo da sua empresa com influenciadores?',
                type: 'options',
                field: 'businessGoal',
                options: [
                    { text: '📈 Aumentar vendas', value: 'vendas' },
                    { text: '👥 Ganhar mais clientes', value: 'clientes' },
                    { text: '🎯 Divulgar marca/produto', value: 'divulgacao' },
                    { text: '🌟 Melhorar presença digital', value: 'presenca' }
                ],
                nextStep: 'hasWorkedWithInfluencers'
            },
            {
                id: 'hasWorkedWithInfluencers',
                message: 'Sua empresa já contratou influenciadores antes?',
                type: 'options',
                field: 'hasWorkedWithInfluencers',
                options: [
                    { text: '✅ Sim, já contratamos', value: 'sim' },
                    { text: '❌ Não, seria a primeira vez', value: 'nao' }
                ],
                nextStep: 'investmentRange'
            },
            {
                id: 'investmentRange',
                message: 'Qual a faixa de investimento mensal em marketing da sua empresa?',
                type: 'options',
                field: 'investmentRange',
                options: [
                    { text: '💰 Até R$ 500', value: 'ate_500' },
                    { text: '💰💰 R$ 500 - R$ 2.000', value: '500_2000' },
                    { text: '💰💰💰 Acima de R$ 2.000', value: 'acima_2000' }
                ],
                nextStep: 'name'
            },
            {
                id: 'creatorNiche',
                message: 'Que legal! Em qual nicho você cria conteúdo?',
                type: 'options',
                field: 'creatorNiche',
                options: [
                    { text: '🍕 Gastronomia', value: 'gastronomia' },
                    { text: '👗 Moda/Lifestyle', value: 'moda' },
                    { text: '🏃‍♀️ Fitness/Saúde', value: 'fitness' },
                    { text: '🎮 Entretenimento', value: 'entretenimento' },
                    { text: '📚 Educação', value: 'educacao' },
                    { text: '🎨 Outros', value: 'outros' }
                ],
                nextStep: 'followersCount'
            },
            {
                id: 'followersCount',
                message: 'Quantos seguidores você tem no Instagram/TikTok?',
                type: 'options',
                field: 'followersCount',
                options: [
                    { text: '📱 Até 5k seguidores', value: 'ate_5k' },
                    { text: '📱📱 5k - 20k seguidores', value: '5k_20k' },
                    { text: '📱📱📱 Acima de 20k seguidores', value: 'acima_20k' }
                ],
                nextStep: 'hasWorkedWithBrands'
            },
            {
                id: 'hasWorkedWithBrands',
                message: 'Você já trabalhou com marcas antes?',
                type: 'options',
                field: 'hasWorkedWithBrands',
                options: [
                    { text: '✅ Sim, já trabalhei', value: 'sim' },
                    { text: '❌ Não, seria a primeira vez', value: 'nao' }
                ],
                nextStep: 'name'
            },
            {
                id: 'name',
                message: 'Agora preciso de alguns dados para contato. Qual é o seu nome completo?',
                type: 'input',
                field: 'name',
                validation: (value) => value.length >= 2,
                errorMessage: 'Por favor, digite um nome válido.',
                nextStep: 'email'
            },
            {
                id: 'email',
                message: 'Qual é o seu e-mail?',
                type: 'input',
                field: 'email',
                validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                errorMessage: 'Por favor, digite um e-mail válido.',
                nextStep: 'whatsapp'
            },
            {
                id: 'whatsapp',
                message: 'Qual é o seu WhatsApp? (formato: 11999999999)',
                type: 'input',
                field: 'whatsapp',
                validation: (value) => /^\d{10,11}$/.test(value.replace(/\D/g, '')),
                errorMessage: 'Por favor, digite um WhatsApp válido (apenas números).',
                nextStep: 'instagram'
            },
            {
                id: 'instagram',
                message: 'Qual é o seu Instagram? (apenas o @usuario)',
                type: 'input',
                field: 'instagram',
                validation: (value) => value.length >= 2,
                errorMessage: 'Por favor, digite seu Instagram.',
                nextStep: 'lgpdConsent'
            },
            {
                id: 'lgpdConsent',
                message: 'Para finalizar, você autoriza o uso dos seus dados para contato conforme nossa política de privacidade?',
                type: 'options',
                field: 'lgpdConsent',
                options: [
                    { text: '✅ Sim, autorizo', value: 'sim' },
                    { text: '❌ Não autorizo', value: 'nao' }
                ],
                nextStep: (value) => value === 'sim' ? 'final' : 'noConsent'
            },
            {
                id: 'noConsent',
                message: 'Entendo! Sem o consentimento não podemos prosseguir. Caso mude de ideia, estaremos aqui! 😊',
                type: 'bot',
                final: true
            },
            {
                id: 'final',
                message: (userData) => {
                    const leadId = this.generateLeadId();
                    if (userData.userType === 'empresa') {
                        return `Perfeito, ${userData.name}! 🎉\n\n📋 **Resumo dos seus dados:**\n• Empresa: ${userData.businessName}\n• Segmento: ${this.getSegmentText(userData.businessSegment)}\n• Objetivo: ${this.getGoalText(userData.businessGoal)}\n• WhatsApp: ${userData.whatsapp}\n• E-mail: ${userData.email}\n• Instagram: ${userData.instagram}\n\n🎯 **Próximos passos:**\nNossa equipe entrará em contato em até 24h para apresentar uma proposta personalizada!\n\n📱 **Protocolo:** ${leadId}`;
                    } else {
                        return `Obrigado, ${userData.name}! 🎉\n\n📋 **Resumo dos seus dados:**\n• Nicho: ${this.getNicheText(userData.creatorNiche)}\n• Seguidores: ${this.getFollowersText(userData.followersCount)}\n• WhatsApp: ${userData.whatsapp}\n• E-mail: ${userData.email}\n• Instagram: ${userData.instagram}\n\n🌟 **Próximos passos:**\nEm breve entraremos em contato para te incluir em nossas campanhas!\n\n📱 **Protocolo:** ${leadId}`;
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
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    open() {
        this.modal.classList.add('active');
        this.currentStep = 0;
        this.userData = {};
        this.messagesContainer.innerHTML = '';
        this.updateProgress();
        
        setTimeout(() => {
            this.processStep();
        }, 500);
    }

    close() {
        this.modal.classList.remove('active');
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
            messageDiv.className = 'chatbot-message';
            messageDiv.innerHTML = `
                <div class="chatbot-avatar bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-bubble bot">
                    ${message.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                </div>
            `;
            
            this.messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }, 1500);
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message user';
        messageDiv.innerHTML = `
            <div class="chatbot-avatar user">
                <i class="fas fa-user"></i>
            </div>
            <div class="chatbot-bubble user">
                ${message}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message typing-message';
        typingDiv.innerHTML = `
            <div class="chatbot-avatar bot">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = this.messagesContainer.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    enableInput() {
        this.inputArea.style.display = 'flex';
        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.focus();
    }

    disableInput() {
        this.inputArea.style.display = 'none';
        this.input.disabled = true;
        this.sendButton.disabled = true;
        this.input.value = '';
    }

    showOptions(options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'chatbot-options';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'chatbot-option';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                this.handleOptionSelect(option.value, option.text);
                optionsContainer.remove();
            });
            optionsContainer.appendChild(button);
        });
        
        this.messagesContainer.appendChild(optionsContainer);
        this.scrollToBottom();
    }

    handleSend() {
        const value = this.input.value.trim();
        if (!value) return;

        const step = this.steps[this.currentStep];
        
        if (step.validation && !step.validation(value)) {
            this.addUserMessage(value);
            setTimeout(() => {
                this.addBotMessage(step.errorMessage);
            }, 500);
            this.input.value = '';
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
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    generateLeadId() {
        return 'CRI' + Date.now().toString().slice(-6);
    }

    getSegmentText(segment) {
        const segments = {
            'alimentacao': 'Alimentação/Restaurantes',
            'moda': 'Moda/Beleza',
            'saude': 'Saúde/Bem-estar',
            'casa': 'Casa/Decoração',
            'automotivo': 'Automotivo',
            'educacao': 'Educação/Cursos',
            'outros': 'Outros'
        };
        return segments[segment] || segment;
    }

    getGoalText(goal) {
        const goals = {
            'vendas': 'Aumentar vendas',
            'clientes': 'Ganhar mais clientes',
            'divulgacao': 'Divulgar marca/produto',
            'presenca': 'Melhorar presença digital'
        };
        return goals[goal] || goal;
    }

    getNicheText(niche) {
        const niches = {
            'gastronomia': 'Gastronomia',
            'moda': 'Moda/Lifestyle',
            'fitness': 'Fitness/Saúde',
            'entretenimento': 'Entretenimento',
            'educacao': 'Educação',
            'outros': 'Outros'
        };
        return niches[niche] || niche;
    }

    getFollowersText(followers) {
        const ranges = {
            'ate_5k': 'Até 5k seguidores',
            '5k_20k': '5k - 20k seguidores',
            'acima_20k': 'Acima de 20k seguidores'
        };
        return ranges[followers] || followers;
    }

    async saveUserData() {
        try {
            console.log('Dados do usuário:', this.userData);

            // Preparar dados para a tabela businesses do Supabase
            const businessData = {
                organization_id: "00000000-0000-0000-0000-000000000001",
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
                    notes: `Lead gerado via chatbot - ${this.userData.userType === 'empresa' ? 'Empresa' : 'Criador'}`,
                    categoria: this.getCategoryFromData(),
                    comercial: "",
                    planoAtual: "",
                    responsavel: "Chatbot",
                    grupoWhatsappCriado: "Não",
                    tipoUsuario: this.userData.userType,
                    dadosCompletos: this.userData
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

    getCategoryFromData() {
        if (this.userData.userType === 'empresa') {
            return this.getSegmentText(this.userData.businessSegment);
        } else {
            return this.getNicheText(this.userData.creatorNiche);
        }
    }

    showFinalActions() {
        setTimeout(() => {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'chatbot-options';
            actionsDiv.innerHTML = `
                <button class="chatbot-option" onclick="window.open('https://wa.me/5542991159229?text=Olá! Vim através do site da crIAdores e gostaria de saber mais sobre os serviços.', '_blank')">
                    📱 Falar no WhatsApp
                </button>
                <button class="chatbot-option" onclick="chatbotInstance.close()">
                    🏠 Voltar ao Site
                </button>
            `;

            this.messagesContainer.appendChild(actionsDiv);
            this.scrollToBottom();
        }, 2000);
    }
}

// Instância global do chatbot
let chatbotInstance;

// Funções globais para controle do modal
function openChatbot() {
    if (!chatbotInstance) {
        chatbotInstance = new ChatbotModal();
    }
    chatbotInstance.open();
}

function closeChatbot() {
    if (chatbotInstance) {
        chatbotInstance.close();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // O chatbot será inicializado apenas quando aberto
    console.log('Chatbot modal pronto para uso!');
});
