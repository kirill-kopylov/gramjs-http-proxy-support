const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

// Настройки API из https://my.telegram.org
const apiId = 123456; // Замените на ваш API ID
const apiHash = "your_api_hash_here"; // Замените на ваш API Hash
const stringSession = ""; // Оставьте пустым при первом запуске

// Настройки HTTP прокси
const httpProxy = {
    ip: "proxy.example.com", // IP или hostname прокси сервера
    port: 8080, // Порт прокси сервера
    httpProxy: true, // Флаг для HTTP прокси
    // Опционально: аутентификация
    username: "proxy_user", // Если прокси требует авторизацию
    password: "proxy_pass",
    timeout: 10, // Таймаут в секундах (опционально, по умолчанию 5)
};

// Создание клиента с HTTP прокси
const client = new TelegramClient(
    new StringSession(stringSession),
    apiId,
    apiHash,
    {
        proxy: httpProxy,
        connectionRetries: 5,
    }
);

(async () => {
    console.log("Подключение через HTTP прокси...");
    await client.start({
        phoneNumber: async () => await input.text("Номер телефона: "),
        password: async () => await input.text("Пароль 2FA (если есть): "),
        phoneCode: async () => await input.text("Код из Telegram: "),
        onError: (err) => console.log(err),
    });

    console.log("Успешно подключено через HTTP прокси!");
    console.log("Сессия:", client.session.save());

    // Пример использования
    const me = await client.getMe();
    console.log("Вы вошли как:", me.username || me.firstName);
})();