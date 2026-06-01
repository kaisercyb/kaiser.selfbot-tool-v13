require('dotenv').config(); 
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const { execSync } = require('child_process');

// ==================== TERMUX ÖZEL EKRAN TEMİZLEME ====================
function ekraniTemizle() {
    try {
        process.stdout.write('\x1Bc');
        execSync('clear', { stdio: 'inherit' });
    } catch (e) {
        console.clear();
    }
}

// ==================== RENK GEÇİŞ FONKSİYONLARI ====================
const RENKLER = ["\x1b[31m", "\x1b[33m", "\x1b[32m", "\x1b[36m", "\x1b[34m", "\x1b[35m"];
const RENK_SIFIRLA = "\x1b[0m";
const RENK_KIRMIZI = "\x1b[31m";
const RENK_YESIL = "\x1b[32m";
const RENK_SARI = "\x1b[33m";
const RENK_MAVI = "\x1b[34m";
const RENK_CAMGOBEGI = "\x1b[36m";

function gokkusanYaz(metin) {
    const satirlar = metin.split('\n');
    return satirlar.map((satir, indeks) => {
        const renk = RENKLER[indeks % RENKLER.length];
        return renk + satir + RENK_SIFIRLA;
    }).join('\n');
}

// Zaman Damgası Alıcı [SAAT:DAKİKA:SANİYE - GÜN/AY/YIL]
function zamanDamgasi() {
    const d = new Date();
    const saat = String(d.getHours()).padStart(2, '0');
    const dakika = String(d.getMinutes()).padStart(2, '0');
    const saniye = String(d.getSeconds()).padStart(2, '0');
    const gun = String(d.getDate()).padStart(2, '0');
    const ay = String(d.getMonth() + 1).padStart(2, '0');
    const yil = d.getFullYear();
    return `[\x1b[90m${saat}:${dakika}:${saniye}\x1b[0m | \x1b[90m${gun}/${ay}/${yil}\x1b[0m]`;
}

// ==================== YENİ ASCII SANATI (KAISER TOOL) ====================
const asciiArt = `
 ___   _  _______  ___   _______  _______  ______      _______  _______  _______  ___     
|   | | ||   _   ||   | |       ||       ||    _ |    |       ||       ||       ||   |    
|   |_| ||  |_|  ||   | |  _____||    ___||   | ||    |_     _||   _   ||   _   ||   |    
|      _||       ||   | | |_____ |   |___ |   |_||_     |   |  |  | |  ||  | |  ||   |    
|     |_ |       ||   | |_____  ||    ___||    __  |    |   |  |  |_|  ||  |_|  ||   |___ 
|    _  ||   _   ||   |  _____| ||   |___ |   |  | |    |   |  |       ||       ||       |
|___| |_||__| |__||___| |_______||_______||___|  |_|    |___|  |_______||_______||_______|
`;

// ==================== GLOBAL DEĞİŞKENLER ====================
let messageInterval = null;
let autoResponseEnabled = false;
let autoResponseText = "";
let aktifMod = "MENÜ"; 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const token = process.env.DISCORD_TOKEN;
const kendiAppId = process.env.DEVELOPER_PORTAL_ID || "1002341257404399657";

if (!token) {
    ekraniTemizle();
    console.log(gokkusanYaz(asciiArt));
    console.log(RENK_KIRMIZI + "⚠️ [HATA] .env dosyası bulunamadı veya içerisinde DISCORD_TOKEN tanımlanmadı!" + RENK_SIFIRLA);
    process.exit(1);
}

ekraniTemizle();
console.log(gokkusanYaz(asciiArt));
console.log("\x1b[35m[⏳] Discord hesabına bağlanılıyor, lütfen bekleyin...\x1b[0m");

const client = new Client({ checkUpdate: false });

// ==================== BOT BAĞLANDIĞINDA ====================
client.on('ready', () => {
    client.on('messageCreate', async (message) => {
        if (message.author.id === client.user.id) return;
        if (message.type === 'REPLY') return;

        if (message.mentions.has(client.user)) {
            console.log(`\n${zamanDamgasi()} ${RENK_SARI}🔔 [ETİKETLENDİN]${RENK_SIFIRLA} Kanal: #${message.channel.name} | Gönderen: ${message.author.tag} ➜ "${message.content}"`);
            
            if (autoResponseEnabled) {
                try { 
                    await message.reply(autoResponseText); 
                    console.log(`${zamanDamgasi()} ${RENK_YESIL}🤖 [Oto-Cevap]${RENK_SIFIRLA} Yanıt otomatik gönderildi.`);
                } catch (err) {}
            }
        }
    });

    ekraniGuncelle();
});

function ekraniGuncelle() {
    aktifMod = "MENÜ";
    ekraniTemizle(); 
    console.log(gokkusanYaz(asciiArt));
    console.log(RENK_YESIL + `🟢 Aktif Hesap: ${client.user.tag}\n` + RENK_SIFIRLA);
    mainMenu();
}

// ==================== MENÜ TASARIMI ====================
function mainMenu() {
    const menuMetni = 
`╔════════════════════════════════════════════╗
║ 0. Seçenek ➜ Token Ekle / Değiştir         ║
║ 1. Seçenek ➜ Flood Mod                     ║
║ 2. Seçenek ➜ Ses AFK Kalma                 ║
║ 3. Seçenek ➜ Oyun Durumu                   ║
║ 4. Seçenek ➜ Otomatik Cevap                ║
║ 5. Seçenek ➜ Çıkış                         ║
║ Made By: Kaiser                            ║
╚════════════════════════════════════════════╝`;

    console.log(gokkusanYaz(menuMetni));
    
    rl.question('\x1b[37m➔ Seçiminiz (0-5): \x1b[0m', async (choice) => {
        const secim = choice.trim();

        if (secim === '0') return menuTokenKilavuzu();
        if (secim === '5') {
            console.log(RENK_KIRMIZI + 'Sistem sonlandırıldı.' + RENK_SIFIRLA);
            client.destroy();
            process.exit(0);
        }

        switch(secim) {
            case '1': menuMessageLoop(); break;
            case '2': menuVoiceAFK(); break;
            case '3': menuGameStatus(); break;
            case '4': menuAutoResponse(); break;
            default:
                console.log(RENK_KIRMIZI + 'Geçersiz komut! 0-5 arası seçim yapın.\n' + RENK_SIFIRLA);
                setTimeout(ekraniGuncelle, 1500);
        }
    });
}

function menuTokenKilavuzu() {
    console.log(RENK_SARI + "\n╔═════════════════ [.env KILAVUZU] ═════════════════╗" + RENK_SIFIRLA);
    console.log(" 📝 Token değiştirmek için klasördeki .env dosyasını açıp");
    console.log(" DISCORD_TOKEN=yeni_token şeklinde güncelleyin ve botu yeniden başlatın.");
    console.log(RENK_SARI + "╚═══════════════════════════════════════════════════╝" + RENK_SIFIRLA);
    rl.question('\x1b[36m➔ Menüye dönmek için Enter\'a basın...\x1b[0m', () => ekraniGuncelle());
}

// ==================== [1] CANLI LOGLU FLOOD PANELİ ====================
function menuMessageLoop() {
    console.log("\n\x1b[34m--- [1] FLOOD MOD AYARLARI ---\x1b[0m");
    if (messageInterval) clearInterval(messageInterval);

    rl.question('1. Cümleyi girin: ', (cumle1) => {
        rl.question('2. Cümleyi girin: ', (cumle2) => {
            rl.question('Hedef Kanal ID girin: ', (channelId) => {
                rl.question('Saniye aralığı (Örn: 5): ', (seconds) => {
                    const channel = client.channels.cache.get(channelId);
                    if (!channel) {
                        console.log(RENK_KIRMIZI + "[❌] Kanal bulunamadı!" + RENK_SIFIRLA);
                        return setTimeout(ekraniGuncelle, 2000);
                    }

                    aktifMod = "FLOOD";
                    ekraniTemizle();
                    console.log(RENK_CAMGOBEGI + "===================================================================");
                    console.log(`🚀 FLOOD MODU AKTİF | Kanal: #${channel.name}`);
                    console.log(`ℹ️  Durdurup ana menüye dönmek için konsola 'x' yazıp Enter yapın.`);
                    console.log("===================================================================\n" + RENK_SIFIRLA);

                    let siraBirde = true;
                    messageInterval = setInterval(async () => {
                        try {
                            const mesaj = siraBirde ? cumle1 : cumle2;
                            await channel.send(mesaj);
                            console.log(`${zamanDamgasi()} ${RENK_YESIL}✏️ [Mesaj Gönderildi]${RENK_SIFIRLA} ➜ ${mesaj}`);
                            siraBirde = !siraBirde; 
                        } catch (err) {
                            console.log(`${zamanDamgasi()} ${RENK_KIRMIZI}[❌ Hata] Mesaj atılamadı:${RENK_SIFIRLA} ${err.message}`);
                        }
                    }, parseInt(seconds) * 1000);

                    durdurmaKontrolü();
                });
            });
        });
    });
}

// ==================== [2] CANLI LOGLU SES AFK PANELİ ====================
function menuVoiceAFK() {
    console.log("\n\x1b[34m--- [2] SES AFK AYARLARI ---\x1b[0m");
    rl.question('Ses Kanal ID girin: ', async (channelId) => {
        const channel = client.channels.cache.get(channelId);
        if (!channel || !channel.isVoice()) {
            console.log(RENK_KIRMIZI + "[❌] Geçersiz Ses Kanalı!" + RENK_SIFIRLA);
            return setTimeout(ekraniGuncelle, 2000);
        }

        try {
            await client.voice.joinChannel(channel, { selfMute: true, selfDeaf: true });
            
            aktifMod = "SES_AFK";
            ekraniTemizle();
            console.log(RENK_MAVI + "===================================================================");
            console.log(`🎙️  SES AFK MODU AKTİF | Kanal: ${channel.name}`);
            console.log(`ℹ️  Kanaldan çıkıp menüye dönmek için 'x' yazıp Enter yapın.`);
            console.log("===================================================================\n" + RENK_SIFIRLA);

            console.log(`${zamanDamgasi()} ${RENK_YESIL}📥 [Bağlantı Kuruldu]${RENK_SIFIRLA} "${channel.name}" odasına giriş saati.`);

            durdurmaKontrolü();
        } catch (err) {
            console.log(RENK_KIRMIZI + "[❌] Bağlantı Hatası: " + err.message + RENK_SIFIRLA);
            setTimeout(ekraniGuncelle, 2000);
        }
    });
}

// ==================== ORTAK X İLE DURDURMA MEKANİZMASI ====================
function durdurmaKontrolü() {
    rl.question('', (input) => {
        if (input.trim().toLowerCase() === 'x') {
            if (messageInterval) {
                clearInterval(messageInterval);
                messageInterval = null;
            }
            if (aktifMod === "SES_AFK") {
                try {
                    client.voice.leaveChannel();
                    console.log(`\n${zamanDamgasi()} ${RENK_KIRMIZI}📤 [Bağlantı Kesildi]${RENK_SIFIRLA} Ses kanalından güvenli çıkış yapıldı.`);
                } catch(e){}
            }
            console.log(RENK_SARI + "\n🔄 İşlem durduruldu, ana menüye dönülüyor..." + RENK_SIFIRLA);
            setTimeout(ekraniGuncelle, 1500);
        } else {
            durdurmaKontrolü();
        }
    });
}

// ==================== [3] OYUN DURUMU ====================
function menuGameStatus() {
    console.log("\n\x1b[34m--- [3] OYUN DURUMU AYARLARI ---\x1b[0m");
    rl.question('Oynamak istediğiniz oyun adını yazın: ', (gameName) => {
        if (!gameName.trim()) return setTimeout(ekraniGuncelle, 1000);
        try {
            const oyun = gameName.toLowerCase().trim();
            let rpcText = "Oyunda"; let rpcState = "Lobi"; let rpcImage = "logo"; 

            if (oyun === "valorant") { rpcText = "Dereceli Maç"; rpcState = "Grupta (1/5)"; rpcImage = "valorant"; }
            else if (oyun === "standoff 2" || oyun === "standoff2") { rpcText = "Bomba İmha Modu"; rpcState = "Rekabetçi Maçta"; rpcImage = "standoff2"; }
            else if (oyun === "red dead redemption" || oyun === "rdr") { rpcText = "Hikaye Modu"; rpcState = "Vahşi Batıda"; rpcImage = "rdr"; }
            else if (oyun === "minecraft") { rpcText = "Hayatta Kalma"; rpcImage = "minecraft"; }

            client.user.setActivity(gameName, {
                type: 'PLAYING',
                applicationId: kendiAppId, 
                details: rpcText,
                state: rpcState,
                assets: { largeImage: rpcImage, largeText: gameName }
            });
            console.log(RENK_YESIL + `[+] Oyun durumu başarıyla yüklendi.` + RENK_SIFIRLA);
        } catch (err) {}
        setTimeout(ekraniGuncelle, 1500);
    });
}

// ==================== [4] OTOMATİK CEVAP ====================
function menuAutoResponse() {
    console.log("\n\x1b[34m--- [4] OTOMATİK CEVAP AYARLARI ---\x1b[0m");
    rl.question('Düz etiket yiyince atılacak mesajı yazın: ', (text) => {
        if (text.trim() === "") {
            autoResponseEnabled = false;
            console.log(RENK_KIRMIZI + "[!] Otomatik cevap kapatıldı." + RENK_SIFIRLA);
        } else {
            autoResponseText = text;
            autoResponseEnabled = true;
            console.log(RENK_YESIL + `[+] Otomatik Cevap kuruldu: "${autoResponseText}"` + RENK_SIFIRLA);
        }
        setTimeout(ekraniGuncelle, 2000);
    });
}

client.login(token).catch(err => {
    console.error(RENK_KIRMIZI + "[Giriş Hatası] Tokeniniz hatalı veya bota bağlanılamadı:" + RENK_SIFIRLA, err.message);
});

