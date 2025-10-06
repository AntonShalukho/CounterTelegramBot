import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs/promises';

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// Файл для хранения данных
const DATA_FILE = './bot-data.json';

// Загрузка данных
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { counters: {} };
  }
}

// Сохранение данных
async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Получить счетчик
async function getCount(chatId) {
  const data = await loadData();
  return data.counters[chatId] || 0;
}

// Обновить счетчик
async function updateCount(chatId, change) {
  const data = await loadData();
  const current = data.counters[chatId] || 0;
  const newValue = current + change;
  data.counters[chatId] = newValue;
  await saveData(data);
  return newValue;
}

// Установить конкретное значение
async function setCount(chatId, value) {
  const data = await loadData();
  data.counters[chatId] = value;
  await saveData(data);
  return value;
}

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const currentCount = await getCount(chatId);
  
  await bot.sendMessage(chatId, 
    `👋 Привет! Я бот на GitHub Actions! 🚀\n` +
    `📊 Текущий счет: ${currentCount}\n\n` +
    `Доступные команды:\n` +
    `➕ /add - Добавить 1\n` +
    `➕ /add5 - Добавить 5\n` +
    `➖ /minus - Уменьшить 1\n` +
    `➖ /minus5 - Уменьшить 5\n` +
    `🎯 /set N - Установить число\n` +
    `📊 /count - Показать счет\n` +
    `🔄 /reset - Сбросить на 0\n` +
    `ℹ️ /info - Информация`
  );
});

// Команда /add
bot.onText(/\/add/, async (msg) => {
  const chatId = msg.chat.id;
  const newValue = await updateCount(chatId, 1);
  await bot.sendMessage(chatId, `✅ +1 = ${newValue}`);
});

// Команда /add5
bot.onText(/\/add5/, async (msg) => {
  const chatId = msg.chat.id;
  const newValue = await updateCount(chatId, 5);
  await bot.sendMessage(chatId, `✅ +5 = ${newValue}`);
});

// Команда /minus
bot.onText(/\/minus/, async (msg) => {
  const chatId = msg.chat.id;
  const newValue = await updateCount(chatId, -1);
  await bot.sendMessage(chatId, `✅ -1 = ${newValue}`);
});

// Команда /minus5
bot.onText(/\/minus5/, async (msg) => {
  const chatId = msg.chat.id;
  const newValue = await updateCount(chatId, -5);
  await bot.sendMessage(chatId, `✅ -5 = ${newValue}`);
});

// Команда /set - установить конкретное число
bot.onText(/\/set (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const inputValue = match[1]; // Получаем число после команды
  
  // Проверяем, что введено число
  const number = parseInt(inputValue);
  
  if (isNaN(number)) {
    await bot.sendMessage(
      chatId, 
      `❌ Неверный формат! Используйте:\n/set 15\n/set 100\n/set -5`
    );
    return;
  }
  
  const newValue = await setCount(chatId, number);
  
  await bot.sendMessage(
    chatId, 
    `🎯 Установлено новое значение: ${newValue}`
  );
});

// Команда /count
bot.onText(/\/count/, async (msg) => {
  const chatId = msg.chat.id;
  const current = await getCount(chatId);
  await bot.sendMessage(chatId, `📊 Счет: ${current}`);
});

// Команда /reset
bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  await setCount(chatId, 0);
  await bot.sendMessage(chatId, `🔄 Сброшено! Счет: 0`);
});

// Команда /info
bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 
    `🤖 GitHub Actions Bot\n` +
    `📍 Запущен через GitHub Actions\n` +
    `⏰ Время: ${new Date().toLocaleString('ru-RU')}\n` +
    `💾 Данные сохраняются в репозитории\n\n` +
    `🎯 Новая команда: /set N - установить любое число`
  );
});

// Обработка неправильного использования /set без числа
bot.onText(/\/set$/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `❌ Укажите число после команды!\n\n` +
    `Примеры:\n` +
    `/set 15 - установить 15\n` +
    `/set 0 - сбросить\n` +
    `/set 100 - установить 100\n` +
    `/set -5 - установить отрицательное значение`
  );
});

// Логирование
bot.on('message', (msg) => {
  console.log(`📨 ${msg.from.first_name}: ${msg.text}`);
});

bot.on('polling_error', (error) => {
  console.log('❌ Polling error:', error.message);
});

console.log('🚀 Бот запущен через GitHub Actions...');
console.log('✅ Команда /set добавлена!');

// Авто-остановка через 55 минут
setTimeout(() => {
  console.log('⏰ Авто-остановка...');
  bot.stopPolling();
  process.exit(0);
}, 55 * 60 * 1000);