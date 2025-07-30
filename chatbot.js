// Importação das dependências necessárias
const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode'); // Nova ferramenta para gerar o link
const { Client, MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const fetch = require('node-fetch');
const client = new Client();

// ===================================================================================
// ARQUIVO DE CONFIGURAÇÃO
// ===================================================================================
const config = {
    botName: "Daniele",
    delays: { min: 500, max: 1200 },
    reminderTimeout: 45000,
    coverageCEPs: [
        '03374050', '03382070', '03382150', '03388000', '03388010',
        '03388020', '03388030', '03388040', '03388050', '03388060',
        '03388070', '03388080', '03388090', '03388100', '03388110',
        '03388120', '03388130', '03388140', '03388150', '03389000',
        '03389010', '03389020', '03389030', '03389040', '03389050',
        '03389060', '03389070', '03389080', '03389090', '03389100',
        '03389110', '03389120', '03390000', '03390001', '03390010',
        '03390020', '03390030', '03390040', '03390045', '03390050',
        '03390060', '03390070', '03390080', '03390090'
    ],
    messages: {
        welcome: (botName) => `Olá! 👋 Sou a ${botName}, sua assistente virtual da *RW Fibra*. Como posso te ajudar hoje?\n\n*Digite o número da opção desejada:*\n\n1️⃣ *Contratar um plano*\n2️⃣ *Suporte Técnico*\n3️⃣ *Financeiro / 2ª Via de Boleto*`,
        defaultReply: 'Opa, não entendi muito bem. Para facilitar, por favor, *digite o número* de uma das opções abaixo: 😊\n\n1️⃣ *Contratar um plano*\n2️⃣ *Suporte Técnico*\n3️⃣ *Financeiro / 2ª Via de Boleto*',
        botReactivated: 'Prontinho! Meu atendimento automático foi reativado. 😊 Se precisar de algo, é só chamar!',
        transferToHuman: 'Perfeito! Recebi seus dados. Um de nossos especialistas já foi notificado e entrará em contato com você em breve para finalizar a contratação. Por favor, aguarde um momento. 🧑‍💼',
        transferToSupport: 'Entendido. Nossa equipe técnica já foi notificada sobre o seu problema e entrará em contato em breve para agendar um reparo. Por favor, aguarde um momento. 🧑‍🔧',
        transferToHumanForTv: "Ótimo! Um de nossos especialistas já foi notificado sobre seu interesse no plano de TV e entrará em contato em breve. Por favor, aguarde um momento. 🧑‍💼",
        thankYouReply: 'De nada! 😊 Se precisar de mais alguma coisa, é só chamar!',
        ourPlans: '📦 *Nossos Planos de Internet – RW Fibra:*\n\n' + '🚀 *200 Mega* – R$ 49,90/mês*\n✅ Ideal para navegação básica e streaming.\n\n' + '🚀 *300 Mega* – R$ 79,90/mês\n✅ Perfeito para quem usa vários dispositivos.\n\n' + '🚀 *400 Mega* – R$ 100,00/mês\n✅ Ótima opção para home office e gamers.\n\n' + '🚀 *500 Mega + TV* – R$ 120,00/mês\n✅ Inclui +200 canais de TV grátis!\n\n' + '📌 *Promoção:* Plano de 200 Mega por R$ 49,90 nos dois primeiros meses. Após, R$ 79,90/mês.\n\n' + 'Qual desses planos mais combina com você? Me diga qual a velocidade que te interessou! 😉',
        reminder: 'Olá! Vi que você está de olho nos nossos planos. 👀\n\nQual deles te interessou mais? Me diga a velocidade ou pode perguntar que eu te ajudo. 😊',
        planChoiceError: 'Desculpe, não identifiquei um plano. Por favor, me diga qual dos planos você prefere (*200, 300, 400 ou 500 Mega*) para continuarmos. 😊',
        askForName: "Ótima escolha! Para começarmos, por favor, digite seu *nome completo*.",
        askForCep: (name) => `Entendido, ${name}. Agora, por favor, digite seu *CEP* (apenas os números) para verificarmos a cobertura na sua área.`,
        tvOffer: "Poxa, que pena! No momento, ainda não temos cobertura de *internet fibra* na sua região. 😔\n\nMas temos uma ótima notícia! Oferecemos um plano de *TV por assinatura* com mais de 200 canais. Teria interesse em saber mais?",
        cepNotFound: "Não consegui encontrar o endereço para este CEP. Por favor, verifique se o número está correto e tente novamente.",
        invalidCepFormat: "O CEP digitado parece inválido. Por favor, digite um CEP válido com 8 números.",
        askForAddressNumber: (street, neighborhood) => `Encontrei o endereço: *${street}, ${neighborhood}*.\n\nPara confirmar, por favor, digite apenas o *número da sua casa* e o complemento (se houver).`,
        supportMenu: 'Entendido! Para agilizar, me diga qual o problema:\n\n1️⃣ *Internet Lenta ou caindo*\n2️⃣ *Sem conexão com a internet*',
        supportInstruction: 'Certo. Um procedimento que resolve a maioria dos casos é reiniciar o seu modem/roteador.\n\nPor favor, *desligue o equipamento da tomada, aguarde 30 segundos e ligue-o novamente*. Aguarde as luzes se estabilizarem.\n\nO problema foi resolvido? Responda com *sim* ou *não*.',
        supportResolved: 'Que ótimo! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só chamar! 😊',
        supportNotResolved: 'Poxa, que pena. Mas não se preocupe!',
        signalBoost: '✅ Entendido! Vou mandar um reforço de sinal para sua conexão... um momento, por favor.',
        signalBoostConfirmation: 'Prontinho! O reforço de sinal foi enviado. Por favor, verifique se sua conexão melhorou.\n\nO problema foi resolvido? Responda com *sim* ou *não*.',
        financialInfo: 'Você pode retirar seus boletos de forma rápida e segura pelo link abaixo 👇\n🔗 https://rwfibra.sgp.tsmx.com.br/accounts/central/login\n\nÉ só digitar o CPF do titular para acessar.\n\nQualquer dúvida, estou aqui pra te ajudar! 😊',
        outageMessage: "🚧 *AVISO IMPORTANTE – INTERRUPÇÃO TEMPORÁRIA* 🚧\nOlá! 💬\nTivemos um *rompimento na rede* que afetou o sinal em sua região.\n\nIsso pode acontecer por alguns motivos, como:\n🎈 Pipas\n🌳 Queda de árvores\n🚫 Atos de vandalismo\n\nMas fique tranquilo! 💪\n\n*Nossas equipes já estão no local* e trabalhando com agilidade para resolver o problema *o mais rápido possível*.\n⏱️ *Previsão de normalização: até 5 horas*\n\nAgradecemos pela compreensão e estamos à disposição se precisar de algo! 🤝",
        outageModeOn: "✅ *Modo Rompimento ATIVADO*. Todos os clientes que entrarem em contato receberão a mensagem de aviso.",
        outageModeOff: "✅ *Modo Rompimento DESATIVADO*. O bot voltou a operar normalmente.",
    },
    plans: ['200', '300', '400', '500']
};

// ===================================================================================
// GERENCIAMENTO DE ESTADO E SESSÃO
// ===================================================================================
const UserFlowState = {
    AWAITING_PLAN_CHOICE: 'AWAITING_PLAN_CHOICE',
    AWAITING_NAME: 'AWAITING_NAME',
    AWAITING_CEP: 'AWAITING_CEP',
    AWAITING_ADDRESS_NUMBER: 'AWAITING_ADDRESS_NUMBER',
    AWAITING_TV_OFFER_CONFIRMATION: 'AWAITING_TV_OFFER_CONFIRMATION',
    AWAITING_SUPPORT_OPTION: 'AWAITING_SUPPORT_OPTION',
    AWAITING_RESTART_CONFIRMATION: 'AWAITING_RESTART_CONFIRMATION',
};
const userStates = new Map(); 
const userSessionData = new Map();
const manualAttendances = new Set(); 
const reminderTimeouts = new Map(); 
const BOT_MARKER = '\u200B';
let outageModeActive = false;

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
async function sendBotMessage(userId, message, mediaOptions = null) {
    const content = message + BOT_MARKER;
    if (mediaOptions && mediaOptions.media) {
        await client.sendMessage(userId, mediaOptions.media, { caption: content });
    } else {
        await client.sendMessage(userId, content);
    }
}

// ===================================================================================
// INICIALIZAÇÃO DO CLIENTE WHATSAPP
// ===================================================================================
client.on('qr', qr => {
    console.log('[QR CODE] Link para leitura abaixo:');
    qrcode.toDataURL(qr, (err, url) => {
        if(err) {
            console.error('[QR CODE] Erro ao gerar o link do QR Code. Tentando gerar no terminal...');
            qrcodeTerminal.generate(qr, { small: true });
        } else {
            console.log('############################################################');
            console.log('### COPIE O LINK ABAIXO E COLE NO SEU NAVEGADOR ###');
            console.log(url);
            console.log('############################################################');
        }
    });
});
client.on('ready', () => { console.log('✅ WhatsApp conectado com sucesso!'); });
client.initialize();

// ===================================================================================
// LÓGICA DE ATENDIMENTO HUMANO E COMANDOS DO ATENDENTE
// ===================================================================================
client.on('message_create', async (msg) => {
    if (msg.fromMe) {
        if (msg.body.endsWith(BOT_MARKER)) { return; }

        const text = msg.body?.toLowerCase()?.trim() || '';
        const chat = await msg.getChat();
        
        if (text === '#rompimento on') {
            outageModeActive = true;
            console.log(`[SISTEMA] Modo Rompimento ATIVADO pelo atendente.`);
            await sendBotMessage(msg.from, config.messages.outageModeOn);
            return;
        }
        if (text === '#rompimento off') {
            outageModeActive = false;
            console.log(`[SISTEMA] Modo Rompimento DESATIVADO pelo atendente.`);
            await sendBotMessage(msg.from, config.messages.outageModeOff);
            return;
        }

        const recipientId = msg.to;
        if (chat.isGroup || recipientId === msg.from) { return; }

        if (text === '#liberar') {
            if (manualAttendances.has(recipientId)) {
                manualAttendances.delete(recipientId);
                clearUserState(recipientId);
                await sendBotMessage(recipientId, config.messages.botReactivated);
                console.log(`[ATENDENTE] Atendimento para ${recipientId} foi liberado.`);
                try { await msg.delete(true); } catch (e) { console.error(`[ATENDENTE] Falha ao apagar a mensagem de comando:`, e); }
            }
        } else {
            if (!manualAttendances.has(recipientId)) {
                manualAttendances.add(recipientId);
                console.log(`[ATENDENTE] Você assumiu a conversa com ${recipientId}. Modo manual ativado.`);
            }
        }
    }
});

// ===================================================================================
// ROTEADOR DE MENSAGENS DE CLIENTES
// ===================================================================================
client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const userId = msg.from;
    const text = msg.body?.toLowerCase()?.trim() || '';

    if (chat.isGroup) { return; }

    if (outageModeActive) {
        console.log(`[BOT] Cliente ${userId} contatou durante o Modo Rompimento. Enviando aviso.`);
        await sendBotMessage(userId, config.messages.outageMessage);
        return;
    }

    if (manualAttendances.has(userId)) {
        console.log(`[BOT] Cliente ${userId} está em modo manual. Bot não responderá.`);
        return;
    }

    const currentState = userStates.get(userId);
    if (currentState) {
        switch (currentState) {
            case UserFlowState.AWAITING_PLAN_CHOICE: await handlePlanChoice(userId, text, chat); return;
            case UserFlowState.AWAITING_NAME: await handleNameInput(userId, text, chat, msg); return;
            case UserFlowState.AWAITING_CEP: await handleCepInput(userId, text, chat); return;
            case UserFlowState.AWAITING_ADDRESS_NUMBER: await handleAddressNumberInput(userId, text, chat, msg); return;
            case UserFlowState.AWAITING_TV_OFFER_CONFIRMATION: await handleTvOfferConfirmation(userId, text, chat); return;
            case UserFlowState.AWAITING_SUPPORT_OPTION: await handleSupportOption(userId, text, chat); return;
            case UserFlowState.AWAITING_RESTART_CONFIRMATION: await handleRestartConfirmation(userId, text, chat); return;
        }
    }

    if (text.match(/^(oi|olá|ola|bom dia|boa tarde|boa noite|menu|início)$/i)) {
        await handleGreeting(userId, chat);
    } else if (text.match(/^(1|plano|planos|contratar|assinar|ver os planos)/i)) {
        await handlePlanRequest(userId, chat);
    } else if (text.match(/^(2|suporte|ajuda|problema|não funciona|internet|conexão|caindo)/i)) {
        await handleSupportRequest(userId, chat);
    } else if (text.match(/^(3|financeiro|boleto|fatura|pagar|segunda via|2a via)/i)) {
        await handleFinancialRequest(userId, chat);
    } else if (text.match(/^(obrigado|obg|vlw|valeu|grato)/i)) {
        await sendBotMessage(userId, config.messages.thankYouReply);
    } else {
        await handleDefault(userId);
    }
});

// ===================================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DIÁLOGO (HANDLERS)
// ===================================================================================

async function handleGreeting(userId, chat) {
    await sendBotMessage(userId, config.messages.welcome(config.botName));
}

async function handlePlanRequest(userId, chat) {
    await chat.sendStateTyping(); await randomDelay();
    try {
        const mediaPath = path.join(__dirname, 'media', 'planos.png');
        const media = MessageMedia.fromFilePath(mediaPath);
        await sendBotMessage(userId, config.messages.ourPlans, { media: media });
    } catch (error) {
        console.error("Erro ao carregar ou enviar o arquivo. Enviando apenas texto.", error);
        await sendBotMessage(userId, config.messages.ourPlans);
    }
    userStates.set(userId, UserFlowState.AWAITING_PLAN_CHOICE);
    const timeoutId = setTimeout(() => {
        if (userStates.get(userId) === UserFlowState.AWAITING_PLAN_CHOICE) {
            sendBotMessage(userId, config.messages.reminder);
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
        await sendBotMessage(userId, config.messages.askForName);
        userStates.set(userId, UserFlowState.AWAITING_NAME);
    } else {
        await chat.sendStateTyping(); await randomDelay();
        await sendBotMessage(userId, config.messages.planChoiceError);
    }
}

async function handleNameInput(userId, text, chat, msg) {
    const session = userSessionData.get(userId) || {};
    const name = msg.body.replace(BOT_MARKER, '');
    session.name = name;
    userSessionData.set(userId, session);
    await chat.sendStateTyping(); await randomDelay();
    await sendBotMessage(userId, config.messages.askForCep(name.split(' ')[0]));
    userStates.set(userId, UserFlowState.AWAITING_CEP);
}

async function handleCepInput(userId, text, chat) {
    const cleanedCep = text.replace(/[^\d]/g, '');

    if (cleanedCep.length !== 8) {
        await sendBotMessage(userId, config.messages.invalidCepFormat);
        return;
    }
    
    const session = userSessionData.get(userId) || {};
    session.cep = cleanedCep;
    userSessionData.set(userId, session);

    if (!config.coverageCEPs.includes(cleanedCep)) {
        await sendBotMessage(userId, config.messages.tvOffer);
        userStates.set(userId, UserFlowState.AWAITING_TV_OFFER_CONFIRMATION);
        return;
    }

    await chat.sendStateTyping(); await randomDelay();
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const addressData = await response.json();

        if (addressData.erro) {
            await sendBotMessage(userId, config.messages.cepNotFound);
            return;
        }

        session.street = addressData.logradouro;
        session.neighborhood = addressData.bairro;
        session.city = addressData.localidade;
        userSessionData.set(userId, session);

        await sendBotMessage(userId, config.messages.askForAddressNumber(session.street, session.neighborhood));
        userStates.set(userId, UserFlowState.AWAITING_ADDRESS_NUMBER);

    } catch (e) {
        console.error("Erro ao consultar a API de CEP:", e);
        await sendBotMessage(userId, "Desculpe, tive um problema ao consultar o CEP. Vamos tentar de novo.");
    }
}

async function handleAddressNumberInput(userId, text, chat, msg) {
    const session = userSessionData.get(userId) || {};
    const numberAndComplement = msg.body.replace(BOT_MARKER, '');
    session.fullAddress = `${session.street}, ${numberAndComplement}, ${session.neighborhood}, ${session.city}`;
    userSessionData.set(userId, session);

    console.log(`\n--- 🌟 NOVO LEAD (Fibra) CAPTURADO 🌟 ---\n- Cliente: ${userId}\n- Plano: ${session.plan} Mega\n- Nome: ${session.name}\n- Endereço Completo: ${session.fullAddress}\n----------------------------------\n`);
    
    await chat.sendStateTyping(); await randomDelay();
    await sendBotMessage(userId, config.messages.transferToHuman);
    
    clearUserState(userId);
    manualAttendances.add(userId);
}

async function handleTvOfferConfirmation(userId, text, chat) {
    if (text === 'sim') {
        const session = userSessionData.get(userId) || {};
        console.log(`\n--- 🌟 NOVO LEAD (TV) CAPTURADO 🌟 ---\n- Cliente: ${userId}\n- Nome: ${session.name || 'Não informado'}\n- CEP: ${session.cep}\n- Interesse: Plano de TV\n----------------------------------\n`);
        
        await chat.sendStateTyping(); await randomDelay();

        try {
            const mediaPath = path.join(__dirname, 'media', 'plano-tv.mp4');
            const media = MessageMedia.fromFilePath(mediaPath);
            await client.sendMessage(userId, media, { sendMediaAsDocument: true });
            console.log(`[VÍDEO] Vídeo do plano de TV enviado como documento para ${userId}.`);
        } catch(e) {
            console.error("Erro detalhado ao enviar o vídeo do plano de TV:", e.message);
            await sendBotMessage(userId, "Tive um problema para enviar o vídeo, mas já notifiquei um especialista.");
        }

        await chat.sendStateTyping(); await randomDelay();
        await sendBotMessage(userId, config.messages.transferToHumanForTv);
        
        clearUserState(userId);
        manualAttendances.add(userId);
    } else if (text === 'não' || text === 'nao') {
        await sendBotMessage(userId, config.messages.thankYouReply);
        clearUserState(userId);
    } else {
        await sendBotMessage(userId, 'Por favor, responda apenas com *sim* ou *não*.');
    }
}

async function handleDefault(userId) { 
    await sendBotMessage(userId, config.messages.defaultReply);
}

async function handleSupportRequest(userId, chat) {
    await chat.sendStateTyping(); await randomDelay();
    await sendBotMessage(userId, config.messages.supportMenu);
    userStates.set(userId, UserFlowState.AWAITING_SUPPORT_OPTION);
}

async function handleSupportOption(userId, text, chat) {
    await chat.sendStateTyping(); await randomDelay();
    if (text.includes('1')) {
        await sendBotMessage(userId, config.messages.signalBoost);
        await randomDelay(3000, 5000); 
        await chat.sendStateTyping();
        await sendBotMessage(userId, config.messages.signalBoostConfirmation);
        userStates.set(userId, UserFlowState.AWAITING_RESTART_CONFIRMATION);
    } else if (text.includes('2')) {
        await sendBotMessage(userId, config.messages.supportInstruction);
        userStates.set(userId, UserFlowState.AWAITING_RESTART_CONFIRMATION);
    } else {
        await sendBotMessage(userId, 'Opção inválida. Por favor, escolha 1 ou 2.\n\n' + config.messages.supportMenu);
    }
}

async function handleRestartConfirmation(userId, text, chat) {
    await chat.sendStateTyping(); await randomDelay();
    if (text === 'sim') { 
        await sendBotMessage(userId, config.messages.supportResolved); 
        clearUserState(userId); 
    } else if (text === 'não' || text === 'nao') {
        await sendBotMessage(userId, config.messages.supportNotResolved);
        await randomDelay(800, 1500);
        await chat.sendStateTyping();
        await sendBotMessage(userId, config.messages.transferToSupport);
        console.log(`[SUPORTE] Cliente ${userId} precisa de atendimento humano.`);
        clearUserState(userId); 
        manualAttendances.add(userId);
    } else {
        await sendBotMessage(userId, 'Por favor, responda apenas com *sim* ou *não* para eu saber se o problema foi resolvido. 😉');
    }
}

async function handleFinancialRequest(userId, chat) {
    await chat.sendStateTyping(); await randomDelay();
    await sendBotMessage(userId, config.messages.financialInfo);
}
