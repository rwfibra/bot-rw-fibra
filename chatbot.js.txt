// Importação das dependências necessárias
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const client = new Client();

// ===================================================================================
// ARQUIVO DE CONFIGURAÇÃO
// ===================================================================================
const config = {
    botName: "Daniele",
    delays: { min: 500, max: 1200 },
    reminderTimeout: 45000,
    messages: {
        welcome: (botName) => `Olá! 👋 Sou a ${botName}, sua assistente virtual da *RW Fibra*. Como posso te ajudar hoje?\n\n1️⃣ *Contratar um plano*\n2️⃣ *Suporte Técnico*\n3️⃣ *Financeiro / 2ª Via de Boleto*`,
        defaultReply: 'Opa, não entendi muito bem. Para facilitar, escolha uma das opções abaixo: 😊\n\n1️⃣ *Contratar um plano*\n2️⃣ *Suporte Técnico*\n3️⃣ *Financeiro / 2ª Via de Boleto*',
        botReactivated: 'Prontinho! Meu atendimento automático foi reativado. 😊 Se precisar de algo, é só chamar!',
        transferToHuman: 'Um de nossos especialistas já foi notificado e entrará em contato com você em breve. Por favor, aguarde um momento. 🧑‍💼',
        ourPlans: '📦 *Nossos Planos de Internet – RW Fibra:*\n\n' + '🚀 *200 Mega* – R$ 49,90/mês*\n✅ Ideal para navegação básica e streaming.\n\n' + '🚀 *300 Mega* – R$ 79,90/mês\n✅ Perfeito para quem usa vários dispositivos.\n\n' + '🚀 *400 Mega* – R$ 100,00/mês\n✅ Ótima opção para home office e gamers.\n\n' + '🚀 *500 Mega + TV* – R$ 120,00/mês\n✅ Inclui +200 canais de TV grátis!\n\n' + '📌 *Promoção:* Plano de 200 Mega por R$ 49,90 nos dois primeiros meses. Após, R$ 79,90/mês.\n\n' + 'Qual desses planos mais combina com você? Me diga qual a velocidade que te interessou! 😉',
        reminder: 'Olá! Vi que você está de olho nos nossos planos. 👀\n\nQual deles te interessou mais? Me diga a velocidade ou pode perguntar que eu te ajudo. 😊',
        planChoiceError: 'Desculpe, não identifiquei um plano. Por favor, me diga qual dos planos você prefere (*200, 300, 400 ou 500 Mega*) para continuarmos. 😊',
        askForName: "Excelente escolha! Para agilizar seu atendimento, por favor, digite seu *nome completo*.",
        askForAddress: "Obrigada! Agora, por favor, digite seu *endereço completo* (Rua, Número, Bairro, Cidade).",
        askForCpf: "Estamos quase lá! Por favor, digite o *CPF do titular*.",
        tvInfoPrompt: '💡 *Internet e TV Fibra Óptica*\nDeseja saber mais?\n👉 *Digite* `sim` ou `não`',
        tvInfoYes: '📡 *Internet e TV por apenas R$ 49,90!*',
        tvInfoNo: 'Tudo bem, obrigado pelo seu tempo! 😊',
        invalidTvInfoResponse: 'Por favor, responda apenas com *sim* ou *não* 😉',
        supportMenu: 'Entendido! Para agilizar, me diga qual o problema:\n\n1️⃣ *Internet Lenta ou caindo*\n2️⃣ *Sem conexão com a internet*',
        supportInstruction: 'Certo. Um procedimento que resolve a maioria dos casos é reiniciar o seu modem/roteador.\n\nPor favor, *desligue o equipamento da tomada, aguarde 30 segundos e ligue-o novamente*. Aguarde as luzes se estabilizarem.\n\nO problema foi resolvido? Responda com *sim* ou *não*.',
        supportResolved: 'Que ótimo! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só chamar! 😊',
        supportNotResolved: 'Poxa, que pena. Mas não se preocupe!',
        signalBoost: '✅ Entendido! Vou mandar um reforço de sinal para sua conexão... um momento, por favor.',
        signalBoostConfirmation: 'Prontinho! O reforço de sinal foi enviado. Por favor, verifique se sua conexão melhorou.\n\nO problema foi resolvido? Responda com *sim* ou *não*.',
        financialInfo: 'Você pode retirar seus boletos de forma rápida e segura pelo link abaixo 👇\n🔗 https://rwfibra.sgp.tsmx.com.br/accounts/central/login\n\nÉ só digitar o CPF do titular para acessar.\n\nQualquer dúvida, estou aqui pra te ajudar! 😊',
    },
    plans: ['200', '300', '400', '500']
};

// ===================================================================================
// GERENCIAMENTO DE ESTADO E SESSÃO
// ===================================================================================
const UserFlowState = {
    AWAITING_PLAN_CHOICE: 'AWAITING_PLAN_CHOICE', AWAITING_NAME: 'AWAITING_NAME', AWAITING_ADDRESS: 'AWAITING_ADDRESS', AWAITING_CPF: 'AWAITING_CPF',
    AWAITING_TV_INFO_CONFIRMATION: 'AWAITING_TV_INFO_CONFIRMATION', AWAITING_SUPPORT_OPTION: 'AWAITING_SUPPORT_OPTION', AWAITING_RESTART_CONFIRMATION: 'AWAITING_RESTART_CONFIRMATION',
};
const userStates = new Map(); 
const userSessionData = new Map();
const manualAttendances = new Set(); 
const reminderTimeouts = new Map(); 

// ===================================================================================
// FUNÇÕES AUXILIARES
// ===================================================================================
const randomDelay = (min = config.delays.min, max = config.delays.max) => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(res => setTimeout(res, ms));
};
function clearUserState(userId) {
    userStates.delete(userId); userSessionData.delete(userId);
    if (reminderTimeouts.has(userId)) { clearTimeout(reminderTimeouts.get(userId)); reminderTimeouts.delete(userId); }
    console.log(`[SESSÃO] Estados e dados do usuário ${userId} foram limpos.`);
}

// ===================================================================================
// INICIALIZAÇÃO DO CLIENTE WHATSAPP
// ===================================================================================
client.on('qr', qr => { qrcode.generate(qr, { small: true }); });
client.on('ready', () => { console.log('✅ WhatsApp conectado com sucesso!'); });
client.initialize();

// ===================================================================================
// ROTEADOR DE MENSAGENS E LÓGICA PRINCIPAL
// ===================================================================================
client.on('message', async msg => {
    const chat = await msg.getChat();
    if (chat.isGroup) { return; }
    const userId = msg.from;
    const text = msg.body?.toLowerCase()?.trim() || '';
    if (msg.fromMe && msg.to.endsWith('@c.us')) {
        const recipientId = msg.to;
        if (text === '#liberar') {
            manualAttendances.delete(recipientId); clearUserState(recipientId);
            await client.sendMessage(recipientId, config.messages.botReactivated);
            console.log(`✅ Atendimento para ${recipientId} foi liberado pelo atendente.`);
            return;
        }
        manualAttendances.add(recipientId);
        console.log(`🤝 Atendimento humano iniciado com ${recipientId}. Bot pausado.`);
        return;
    }
    if (manualAttendances.has(userId)) { return; }
    if (text === '#liberar') {
        manualAttendances.delete(userId); clearUserState(userId);
        await client.sendMessage(userId, config.messages.botReactivated);
        return;
    }
    const currentState = userStates.get(userId);
    if (currentState) {
        switch (currentState) {
            case UserFlowState.AWAITING_PLAN_CHOICE: await handlePlanChoice(userId, text, chat); return;
            case UserFlowState.AWAITING_NAME: await handleNameInput(userId, text, chat); return;
            case UserFlowState.AWAITING_ADDRESS: await handleAddressInput(userId, text, chat); return;
            case UserFlowState.AWAITING_CPF: await handleCpfInput(userId, text, chat); return;
            case UserFlowState.AWAITING_TV_INFO_CONFIRMATION: await handleTvInfoConfirmation(userId, text, chat); return;
            case UserFlowState.AWAITING_SUPPORT_OPTION: await handleSupportOption(userId, text, chat); return;
            case UserFlowState.AWAITING_RESTART_CONFIRMATION: await handleRestartConfirmation(userId, text, chat); return;
        }
    }
    if (text.match(/(oi|olá|ola|bom dia|boa tarde|boa noite|menu)/i)) { await handleGreeting(userId); }
    else if (text === '1' || text.includes('contratar') || text.includes('plano')) { await handlePlanRequest(userId, chat); }
    else if (text === '2' || text.includes('suporte')) { await handleSupportRequest(userId, chat); }
    else if (text === '3' || text.includes('financeiro') || text.includes('boleto')) { await handleFinancialRequest(userId, chat); }
    else if (text === 'tv') { await handleTvInfo(userId); }
    else { await handleDefault(userId); }
});

// ===================================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DIÁLOGO (HANDLERS)
// ===================================================================================
async function handleGreeting(userId) { await client.sendMessage(userId, config.messages.welcome(config.botName)); }
async function handlePlanRequest(userId, chat) {
    await chat.sendStateTyping(); await randomDelay();
    try {
        const mediaPath = path.join(__dirname, 'media', 'planos.png');
        console.log(`Tentando carregar o arquivo de: ${mediaPath}`);
        const media = MessageMedia.fromFilePath(mediaPath);
        await client.sendMessage(userId, media, { caption: config.messages.ourPlans });
    } catch (error) {
        console.error("Erro ao carregar ou enviar o arquivo. Enviando apenas texto.", error);
        await client.sendMessage(userId, config.messages.ourPlans);
    }
    userStates.set(userId, UserFlowState.AWAITING_PLAN_CHOICE);
    const timeoutId = setTimeout(() => {
        if (userStates.get(userId) === UserFlowState.AWAITING_PLAN_CHOICE) {
            client.sendMessage(userId, config.messages.reminder);
            console.log(`[LEMBRETE] Lembrete enviado para ${userId}.`);
        }
        reminderTimeouts.delete(userId);
    }, config.reminderTimeout);
    reminderTimeouts.set(userId, timeoutId);
}
async function handlePlanChoice(userId, text, chat) {
    if (reminderTimeouts.has(userId)) { clearTimeout(reminderTimeouts.get(userId)); reminderTimeouts.delete(userId); }
    const numbersInText = text.match(/\d+/g) || [];
    const chosenPlan = numbersInText.find(num => config.plans.includes(num));
    if (chosenPlan) {
        userSessionData.set(userId, { plan: chosenPlan });
        await chat.sendStateTyping(); await randomDelay();
        await client.sendMessage(userId, config.messages.askForName);
        userStates.set(userId, UserFlowState.AWAITING_NAME);
    } else {
        await chat.sendStateTyping(); await randomDelay();
        await client.sendMessage(userId, config.messages.planChoiceError);
    }
}
async function handleNameInput(userId, text, chat) {
    const session = userSessionData.get(userId) || {}; session.name = text; userSessionData.set(userId, session);
    await chat.sendStateTyping(); await randomDelay();
    await client.sendMessage(userId, config.messages.askForAddress);
    userStates.set(userId, UserFlowState.AWAITING_ADDRESS);
}
async function handleAddressInput(userId, text, chat) {
    const session = userSessionData.get(userId) || {}; session.address = text; userSessionData.set(userId, session);
    await chat.sendStateTyping(); await randomDelay();
    await client.sendMessage(userId, config.messages.askForCpf);
    userStates.set(userId, UserFlowState.AWAITING_CPF);
}
async function handleCpfInput(userId, text, chat) {
    const session = userSessionData.get(userId) || {}; session.cpf = text; userSessionData.set(userId, session);
    console.log(`\n--- 🌟 NOVO LEAD CAPTURADO 🌟 ---\n- Cliente: ${userId}\n- Plano: ${session.plan} Mega\n- Nome: ${session.name}\n- Endereço: ${session.address}\n- CPF: ${session.cpf}\n----------------------------------\n`);
    await chat.sendStateTyping(); await randomDelay();
    await client.sendMessage(userId, config.messages.transferToHuman);
    clearUserState(userId); manualAttendances.add(userId);
}
async function handleTvInfo(userId) { await client.sendMessage(userId, config.messages.tvInfoPrompt); userStates.set(userId, UserFlowState.AWAITING_TV_INFO_CONFIRMATION); }
async function handleTvInfoConfirmation(userId, text, chat) {
    await chat.sendStateTyping(); await randomDelay();
    if (text === 'sim') { await client.sendMessage(userId, config.messages.tvInfoYes); }
    else if (text === 'não' || text === 'nao') { await client.sendMessage(userId, config.messages.tvInfoNo); }
    else { await client.sendMessage(userId, config.messages.invalidTvInfoResponse); return; }
    clearUserState(userId);
}
async function handleDefault(userId) { await client.sendMessage(userId, config.messages.defaultReply); }
async function handleSupportRequest(userId, chat) {
    await chat.sendStateTyping(); await randomDelay();
    await client.sendMessage(userId, config.messages.supportMenu);
    userStates.set(userId, UserFlowState.AWAITING_SUPPORT_OPTION);
}
async function handleSupportOption(userId, text, chat) {
    await chat.sendStateTyping(); await randomDelay();
    if (text === '1') {
        await client.sendMessage(userId, config.messages.signalBoost);
        await randomDelay(1500, 2500);
        await chat.sendStateTyping();
        await client.sendMessage(userId, config.messages.signalBoostConfirmation);
        userStates.set(userId, UserFlowState.AWAITING_RESTART_CONFIRMATION);
    } else if (text === '2') {
        await client.sendMessage(userId, config.messages.supportInstruction);
        userStates.set(userId, UserFlowState.AWAITING_RESTART_CONFIRMATION);
    } else {
        await client.sendMessage(userId, 'Opção inválida. Por favor, escolha 1 ou 2.\n\n' + config.messages.supportMenu);
    }
}
async function handleRestartConfirmation(userId, text, chat) {
    await chat.sendStateTyping(); await randomDelay();
    if (text === 'sim') { await client.sendMessage(userId, config.messages.supportResolved); clearUserState(userId); }
    else if (text === 'não' || text === 'nao') {
        await client.sendMessage(userId, config.messages.supportNotResolved);
        await randomDelay(800, 1500);
        await chat.sendStateTyping();
        await client.sendMessage(userId, config.messages.transferToHuman);
        console.log(`[SUPORTE] Cliente ${userId} precisa de atendimento humano.`);
        clearUserState(userId); manualAttendances.add(userId);
    } else {
        await client.sendMessage(userId, 'Por favor, responda apenas com *sim* ou *não* para eu saber se o problema foi resolvido. 😉');
    }
}
async function handleFinancialRequest(userId, chat) {
    await chat.sendStateTyping(); await randomDelay();
    await client.sendMessage(userId, config.messages.financialInfo);
}

