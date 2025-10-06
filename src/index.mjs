import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs/promises';
import path from 'path';

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
    // Если файла нет, создаем пустые данные
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

// Сбросить счетчик
async function resetCount(chatId) {
  const data = await loadData();
  data.counters[chatId] = 0;
  await saveData(data);
  return 0;
}

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const currentCount = await getCount(chatId);
  
  await bot.sendMessage(chatId, 
    `👋 Привет! Счет сохраняется! 📊\n` +
    `Текущий счет: ${currentCount}\n\n` +
    `Команды:\n` +
    `➕ /add - Добавить 1\n` +
    `➖ /minus - Уменьшить 1\n` +
    `📊 /count - Показать счет\n` +
    `🔄 /reset - Сбросить`
  );
});

// Остальные обработчики аналогично, но с await...
bot.onText(/\/add/, async (msg) => {
  const chatId = msg.chat.id;
  const newValue = await updateCount(chatId, 1);
  await bot.sendMessage(chatId, `✅ +1 = ${newValue}`);
});

bot.onText(/\/count/, async (msg) => {
  const chatId = msg.chat.id;
  const current = await getCount(chatId);
  await bot.sendMessage(chatId, `📊 Счет: ${current}`);
});