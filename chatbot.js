// Importação das dependências necessárias
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js'); // <-- MUDANÇA: Importar LocalAuth
const path = require('path');
const fetch = require('node-fetch');

// ===================================================================================
// MUDANÇA IMPORTANTE: Configuração do Cliente para o Render
// ===================================================================================
// Esta configuração é ESSENCIAL para rodar em servidores Linux como o Render.
const client = new Client({
    authStrategy: new LocalAuth(), // <-- MUDANÇA: Para salvar a sessão e não pedir QR Code toda hora
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- Descomente no Kinsta, pode ajudar no Render
            '--disable-gpu'
        ],
    }
});


// ===================================================================================
// ARQUIVO DE CONFIGURAÇÃO (Seu código original continua aqui)
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
    recurringReminders: [
        { number: '5511981395526', dueDay: 5, daysBefore: 4 },
        { number: '5511987905922', dueDay: 5, daysBefore: 4 },
        { number: '5511974529413', dueDay: 5, daysBefore: 4 },
        { number: '5511949271921', dueDay: 5, daysBefore: 4 },
        { number: '5511933136405', dueDay: 5, daysBefore: 4 },
        { number: '5511915173571', dueDay: 5, daysBefore: 4 },
        { number: '5511958762884', dueDay: 5, daysBefore: 4 },
        { number: '5511986949082', dueDay: 5, daysBefore: 4 },
        { number: '5511961681100', dueDay: 10, daysBefore: 5 },
        { number: '5511979603550', dueDay: 10, daysBefore: 5 },
        { number: '5511951332123', dueDay: 10, daysBefore: 5 },
        { number: '5511985080337', dueDay: 10, daysBefore: 5 },
        { number: '5511995371507', dueDay: 15, daysBefore: 5 },
        { number: '5511953138852', dueDay: 15, daysBefore: 5 },
        { number: '5511993813513', dueDay: 15, daysBefore: 5 },
        { number: '5511982197783', dueDay: 20, daysBefore: 5 },
        { number: '557598875079', dueDay: 20, daysBefore: 5 },
        { number: '5511998068713', dueDay: 20, daysBefore: 5 },
        { number: '5511941775855', dueDay: 20, daysBefore: 5 },
        { number: '5511958330620', dueDay: 20, daysBefore: 5 },
        { number: '5511954563867', dueDay: 20, daysBefore: 5 },
        { number: '5511949089244', dueDay: 20, daysBefore: 5 },
        { number: '557599918414', dueDay: 20, daysBefore: 5 },
        { number: '5511952281223', dueDay: 20, daysBefore: 5 },
        { number: '5511967865885', dueDay: 20, daysBefore: 5 },
        { number: '5513981543792', dueDay: 20, daysBefore: 5 },
        { number: '5511963159375', dueDay: 20, daysBefore: 5 },
        { number: '5511952328786', dueDay: 20, daysBefore: 5 },
    ],
    dailyScheduledMessages: [
        {
            number: '5511988472256',
            message: `🔔 *AVISO DE COBRANÇA* 🔔\n\nOlá! Detectamos que sua fatura do plano de internet ainda não foi paga. 🕒\n\n📅 *Vencimento:* 10/06/2025\n💳 Para evitar a *suspensão dos serviços*, regularize o pagamento o quanto antes.\n\nAcesse seu boleto de forma rápida e segura pelo link:\n🔗 https://rwfibra.sgp.tsmx.com.br/accounts/central/login\n👉 Basta digitar o *CPF do titular* para visualizar.\n\n⚠️ Este é um *aviso automático de cobrança*.\nCaso já tenha efetuado o pagamento, por favor, desconsidere esta mensagem.\n\nVisite nosso site: www.rwfibra.com.br\nEstamos à disposição para qualquer dúvida! 😊`,
            sendAtHour: 9,
            sendAtMinute: 0
        }
    ],
    messages: {
        welcome: (botName) => `Olá! 👋 Sou a ${botName}, sua assistente virtual da *RW Fibra*. Como posso te ajudar hoje?\n\n*Digite o número da opção desejada:*\n\n1 - 🚀 Contratação\n2 - 🛠 Suporte Técnico\n3 - 💰 Financeiro\n\nVisite nosso site:\nwww.rwfibra.com.br`,
        defaultReply: 'Opa, não entendi muito bem. Para facilitar, por favor, *digite o número* de uma das opções abaixo: 😊\n\n1 - 🚀 Contratação\n2 - 🛠 Suporte Técnico\n3 - 💰 Financeiro\n\nVisite nosso site:\nwww.rwfibra.com.br',
        botReactivated: 'Prontinho! Meu atendimento automático foi reativado. 😊 Se precisar de algo, é só chamar!',
        transferToHuman: 'Perfeito! Recebi seus dados. Um de nossos especialistas já foi notificado e entrará em contato com você em breve para finalizar a contratação. Por favor, aguarde um momento. 🧑‍💼',
        transferToSupport: 'Entendido. Nossa equipe técnica já foi notificada sobre o seu problema e entrará em contato em breve para agendar um reparo. Por favor, aguarde um momento. 🧑‍🔧',
        transferToHumanForTv: "Excelente! 🎉 Um de nossos especialistas em TV já recebeu sua solicitação e vai te chamar em instantes para explicar tudo. Fique de olho! 😉",
        thankYouReply: 'De nada! 😊 Se precisar de mais alguma coisa, é só chamar!',
        ourPlans: '📦 *Nossos Planos de Internet – RW Fibra:*\n\n' + '🚀 *200 Mega* – R$ 49,90/mês*\n✅ Ideal para navegação básica e streaming.\n\n' + '🚀 *300 Mega* – R$ 79,90/mês\n✅ Perfeito para quem usa vários dispositivos.\n\n' + '🚀 *400 Mega* – R$ 100,00/mês\n✅ Ótima opção para home office e gamers.\n\n' + '🚀 *500 Mega + TV* – R$ 120,00/mês\n✅ Inclui +200 canais de TV grátis!\n\n' + '📌 *Promoção:* Plano de 200 Mega por R$ 49,90 nos dois primeiros meses. Após, R$ 79,90/mês.\n\n' + 'Qual desses planos mais combina com você? Me diga qual a velocidade que te interessou! 😉',
        reminder: 'Olá! Vi que você está de olho nos nossos planos. 👀\n\nQual deles te interessou mais? Me diga a velocidade ou pode perguntar que eu te ajudo. 😊',
        planChoiceError: 'Desculpe, não identifiquei um plano. Por favor, me diga qual dos planos você prefere (*200, 300, 400 ou 500 Mega*) para continuarmos. 😊',
        askForName: "Ótima escolha! Para começarmos, por favor, digite seu *nome completo*.",
        askForCep: (name) => `Entendido, ${name}. Agora, por favor, digite seu *CEP* (apenas os números) para verificarmos a cobertura na sua área.`,
        tvOffer: "Gostaria de saber mais sobre o nosso plano de TV? 📺\n\nDigite *sim* para continuar ou *não* para encerrar.",
        cepNotFound: "Não consegui encontrar o endereço para este CEP. Por favor, verifique se o número está correto e tente novamente.",
        invalidCepFormat: "O CEP digitado parece inválido. Por favor, digite um CEP válido com 8 números.",
        askForAddressNumber: (street, neighborhood) => `Encontrei o endereço: *${street}, ${neighborhood}*.\n\nPara confirmar, por favor, digite apenas o *número da sua casa* e o complemento (se houver).`,
        supportMenu: '👩🏽‍💻 Me diga qual problema está enfrentando\n\n1 - ⛔ Sem Sinal\n2 - 🐢 Internet lenta',
        supportInstruction: 'Certo. Um procedimento que resolve a maioria dos casos é reiniciar o seu modem/roteador.\n\nPor favor, *desligue o equipamento da tomada, aguarde 30 segundos e ligue-o novamente*. Aguarde as luzes se estabilizarem.\n\nO problema foi resolvido? Responda com *sim* ou *não*.',
        supportResolved: 'Que ótimo! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só chamar! 😊',
        supportNotResolved: 'Poxa, que pena. Mas não se preocupe!',
        signalBoost: 'Perfeito! Como último passo, vou mandar um reforço de sinal para sua conexão... um momento, por favor.',
        signalBoostConfirmation: 'Prontinho! O reforço de sinal foi enviado. Por favor, verifique se sua conexão melhorou.\n\nO problema foi resolvido? Responda com *sim* ou *não*.',
        financialInfo: 'Para acessar a *2ª via do seu boleto* e outras informações financeiras, visite a *Central do Assinante* em nosso site! 💻\n\nÉ rápido, fácil e seguro.\n\nClique no link abaixo e acesse com seu CPF:\n🔗 www.rwfibra.com.br\n\nQualquer dúvida, é só chamar! 😊',
        outageMessage: "🚧 *AVISO IMPORTANTE – INTERRUPÇÃO TEMPORÁRIA* 🚧\nOlá! 💬\nTivemos um *rompimento na rede* que afetou o sinal em sua região.\n\nIsso pode acontecer por alguns motivos, como:\n🎈 Pipas\n🌳 Queda de árvores\n🚫 Atos de vandalismo\n\nMas fique tranquilo! 💪\n\n*Nossas equipes já estão no local* e trabalhando com agilidade para resolver o problema *o mais rápido possível*.\n⏱️ *Previsão de normalização: até 5 horas*\n\nVisite nosso site para mais informações:\nwww.rwfibra.com.br\n\nAgradecemos pela compreensão e estamos à disposição se precisar de algo! 🤝",
        outageModeOn: "✅ *Modo Rompimento ATIVADO*. Todos os clientes que entrarem em contato receberão a mensagem de aviso.",
        outageModeOff: "✅ *Modo Rompimento DESATIVADO*. O bot voltou a operar normalmente.",
        reminderMessage: (dueDate) => `🔔 *AVISO IMPORTANTE – FATURA DISPONÍVEL* 🔔\n\nOi! Passando aqui pra te lembrar que a *fatura* do seu plano de internet já está *disponível para pagamento*! 📡💳\n\n📅 *Vencimento:* ${dueDate}\n\n🧾 Para acessar seu *boleto* é simples e rápido:\n🔗 https://rwfibra.sgp.tsmx.com.br/accounts/central/login\n👉 É só digitar o *CPF do titular* e pronto!\n\n⚠️ Este é um *aviso automático* para te ajudar a manter tudo em dia, sem preocupações.\n\nVisite nosso site: www.rwfibra.com.br\nSe tiver qualquer dúvida, é só chamar. Estamos aqui pra te ajudar! 😊`,
        supportAskForRestart: "Entendido. Vamos tentar alguns passos. Primeiro, pode reiniciar o seu router, por favor? Desligue-o da tomada por 30 segundos e ligue novamente. Diga-me *pronto* quando tiver feito isso.",
        supportAskForLightStatus: "Ótimo. Agora, por favor, verifique se a luz 'Internet' ou com o símbolo '@' no seu aparelho está acesa e sem piscar. Está? Responda com *sim* ou *não*.",
        supportLightProblem: "Entendido. Se a luz de internet não está estável, pode ser um problema físico na sua conexão.",
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
    AWAITING_ROUTER_RESTART: 'AWAITING_ROUTER_RESTART',
    AWAITING_LIGHT_STATUS: 'AWAITING_LIGHT_STATUS',
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

function scheduleReminder(number, dateStr) {
    const dateParts = dateStr.split('/');
    if (dateParts.length !== 3 || dateStr.length !== 10) {
        return { success: false, message: `Formato de data inválido para ${number}: ${dateStr}. Use DD/MM/YYYY.` };
    }

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const year = parseInt(dateParts[2]);
    const dueDate = new Date(year, month, day);
    
    const reminderDate = new Date(dueDate.getTime());
    reminderDate.setDate(reminderDate.getDate() - 4);
    reminderDate.setHours(9, 0, 0, 0);

    const now = new Date();
    const delay = reminderDate.getTime() - now.getTime();

    if (isNaN(reminderDate.getTime()) || delay < 0) {
        return { success: false, message: `Data inválida ou passada para ${number}.` };
    }

    const targetId = `${number}@c.us`;
    console.log(`[LEMBRETE MANUAL] Agendado para ${targetId} em ${reminderDate.toLocaleString()}`);
    
    setTimeout(() => {
        console.log(`[LEMBRETE MANUAL] Enviando lembrete para ${targetId}`);
        sendBotMessage(targetId, config.messages.reminderMessage(dateStr));
    }, delay);

    return { success: true, message: `✅ Lembrete agendado para ${number}. Será enviado em ${reminderDate.toLocaleDateString()} às 09:00.` };
}

function scheduleRecurringReminder(number, dueDay, daysBefore) {
    const now = new Date();
    let dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

    if (now.getDate() >= dueDay) {
        dueDate.setMonth(dueDate.getMonth() + 1);
    }
    
    const reminderDate = new Date(dueDate.getTime());
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(9, 0, 0, 0);

    const delay = reminderDate.getTime() - now.getTime();

    if (delay > 0) {
        const targetId = `${number}@c.us`;
        const dueDateStr = dueDate.toLocaleDateString('pt-BR');
        console.log(`[LEMBRETE RECORRENTE] Agendado para ${targetId} em ${reminderDate.toLocaleString()}`);
        
        setTimeout(() => {
            console.log(`[LEMBRETE RECORRENTE] Enviando lembrete para ${targetId}`);
            sendBotMessage(targetId, config.messages.reminderMessage(dueDateStr));
        }, delay);
    } else {
         console.log(`[LEMBRETE RECORRENTE] Lembrete para ${number} este mês já passou. Será agendado no próximo ciclo.`);
    }
}

function scheduleDailyMessages() {
    const now = new Date();
    config.dailyScheduledMessages.forEach(task => {
        let sendTime = new Date();
        sendTime.setHours(task.sendAtHour, task.sendAtMinute, 0, 0);

        if (now > sendTime) {
            sendTime.setDate(sendTime.getDate() + 1);
        }

        const delay = sendTime.getTime() - now.getTime();
        const targetId = `${task.number}@c.us`;

        console.log(`[MENSAGEM DIÁRIA] Próximo envio para ${targetId} agendado para ${sendTime.toLocaleString()}`);

        setTimeout(() => {
            console.log(`[MENSAGEM DIÁRIA] Enviando mensagem diária para ${targetId}`);
            sendBotMessage(targetId, task.message);

            setInterval(() => {
                console.log(`[MENSAGEM DIÁRIA] Enviando mensagem diária para ${targetId}`);
                sendBotMessage(targetId, task.message);
            }, 24 * 60 * 60 * 1000);

        }, delay);
    });
}


// ===================================================================================
// INICIALIZAÇÃO DO CLIENTE WHATSAPP
// ===================================================================================
client.on('qr', qr => { 
    console.log('QR Code recebido! Escaneie com seu celular.');
    qrcode.generate(qr, { small: true }); 
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado com sucesso!');
    
    // --- MUDANÇA AQUI: Envio de mensagem de teste ---
    const testNumber = '5511953872843@c.us';
    const testDueDate = '10/08/2025'; // Data de exemplo
    const testMessage = config.messages.reminderMessage(testDueDate);
    console.log(`[SISTEMA] Enviando mensagem de teste de cobrança para ${testNumber}`);
    sendBotMessage(testNumber, testMessage);
    
    console.log('[SISTEMA] Agendando lembretes recorrentes...');
    config.recurringReminders.forEach(reminder => {
        scheduleRecurringReminder(reminder.number, reminder.dueDay, reminder.daysBefore);
    });

    console.log('[SISTEMA] Agendando mensagens diárias...');
    scheduleDailyMessages();
});

// O resto do seu código continua aqui, sem alterações...
// ...
// ===================================================================================
// LÓGICA DE ATENDIMENTO HUMANO E COMANDOS DO ATENDENTE
// ===================================================================================
client.on('message_create', async (msg) => {
    if (msg.fromMe) {
        if (msg.body.endsWith(BOT_MARKER) || msg.type !== 'chat') {
            return;
        }

        const text = msg.body?.toLowerCase()?.trim() || '';
        const chat = await msg.getChat();
        
        if (text.startsWith('#lembrete')) {
            const parts = msg.body.split(' ');
            if (parts.length !== 3) {
                return sendBotMessage(msg.from, `Formato incorreto. Use: #lembrete <número> <DD/MM/YYYY>`);
            }
            const result = scheduleReminder(parts[1], parts[2]);
            await sendBotMessage(msg.from, result.message);
            return;
        }

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
        try {
            const audioPath = path.join(__dirname, 'media', 'rompimento-audio.ogg');
            const audioMedia = MessageMedia.fromFilePath(audioPath);
            await client.sendMessage(userId, audioMedia, { sendMediaAsPtt: true });
        } catch (e) {
            console.error("Erro ao enviar o áudio de rompimento. Verifique se o ficheiro 'rompimento-audio.ogg' existe na pasta 'media'.", e);
        }
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
            case UserFlowState.AWAITING_ROUTER_RESTART: await handleRouterRestart(userId, text, chat); return;
            case UserFlowState.AWAITING_LIGHT_STATUS: await handleLightStatus(userId, text, chat); return;
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
        try {
            const audioPath = path.join(__dirname, 'media', 'sem-cobertura.ogg');
            const audioMedia = MessageMedia.fromFilePath(audioPath);
            await client.sendMessage(userId, audioMedia, { sendMediaAsPtt: true });
            await randomDelay();
            await sendBotMessage(userId, config.messages.tvOffer);
        } catch (e) {
            console.error("Erro ao enviar o áudio de sem cobertura. Verifique se o ficheiro 'sem-cobertura.ogg' existe.", e);
            await sendBotMessage(userId, config.messages.tvOffer);
        }
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
    if (text.includes('2')) { // Internet Lenta
        await sendBotMessage(userId, config.messages.supportAskForRestart);
        userStates.set(userId, UserFlowState.AWAITING_ROUTER_RESTART);
    } else if (text.includes('1')) { // Sem Conexão
        await sendBotMessage(userId, config.messages.supportInstruction);
        userStates.set(userId, UserFlowState.AWAITING_RESTART_CONFIRMATION);
    } else {
        await sendBotMessage(userId, 'Opção inválida. Por favor, escolha 1 ou 2.\n\n' + config.messages.supportMenu);
    }
}

async function handleRouterRestart(userId, text, chat) {
    if (text.includes('pronto')) {
        await chat.sendStateTyping(); await randomDelay();
        await sendBotMessage(userId, config.messages.supportAskForLightStatus);
        userStates.set(userId, UserFlowState.AWAITING_LIGHT_STATUS);
    } else {
        await sendBotMessage(userId, "Ok, estou a aguardar. Por favor, digite *pronto* assim que o router reiniciar.");
    }
}

async function handleLightStatus(userId, text, chat) {
    if (text === 'sim') {
        await chat.sendStateTyping(); await randomDelay();
        await sendBotMessage(userId, config.messages.signalBoost);
        await randomDelay(3000, 5000); 
        await chat.sendStateTyping();
        await sendBotMessage(userId, config.messages.signalBoostConfirmation);
        userStates.set(userId, UserFlowState.AWAITING_RESTART_CONFIRMATION);
    } else if (text === 'não' || text === 'nao') {
        await chat.sendStateTyping(); await randomDelay();
        await sendBotMessage(userId, config.messages.supportLightProblem);
        await randomDelay(800, 1500);
        await chat.sendStateTyping();
        await sendBotMessage(userId, config.messages.transferToSupport);
        console.log(`[SUPORTE] Cliente ${userId} precisa de atendimento humano (problema na luz do router).`);
        clearUserState(userId); 
        manualAttendances.add(userId);
    } else {
        await sendBotMessage(userId, 'Por favor, responda apenas com *sim* ou *não*.');
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

// Inicia o cliente
client.initialize();
