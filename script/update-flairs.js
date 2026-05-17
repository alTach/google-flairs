/**
 * Скачивает данные для всех языков с Google Calendar API
 * @param {Object} options - Настройки
 * @param {string} options.outputDir - Имя папки для сохранения (по умолчанию 'flairs_data')
 * @param {number} options.concurrent - Количество параллельных запросов (по умолчанию 5)
 * @param {Function} options.onProgress - Колбэк прогресса (current, total, lang)
 * @returns {Promise<Object>} - Результаты загрузки
 */
async function downloadAllFlairs(options = {}) {
    const {
        outputDir = 'flairs_data',
        concurrent = 5,
        onProgress = null
    } = options;

    // Список всех языков
    const languages = [
        'af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'bs', 'ca', 'ceb', 'co', 'cs', 'cy', 'da', 'de', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'fy', 'ga', 'gd', 'gl', 'gu', 'ha', 'haw', 'hi', 'hmn', 'hr', 'ht', 'hu', 'hy', 'id', 'ig', 'is', 'it', 'iw', 'ja', 'jw', 'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'ky', 'la', 'lb', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'ny', 'or', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'rw', 'sd', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'tt', 'ug', 'uk', 'ur', 'uz', 'vi', 'xh', 'yi', 'yo', 'zh', 'zh-CN', 'zh-TW', 'zu'
    ];

    // Создаем папку (используя File System Access API если доступно)
    let directoryHandle = null;

    async function createDirectory() {
        try {
            // Пытаемся использовать File System Access API
            if ('showDirectoryPicker' in window) {
                directoryHandle = await window.showDirectoryPicker();
                console.log('Папка выбрана пользователем');
                return true;
            }
        } catch (err) {
            console.log('Не удалось выбрать папку, будет использовать загрузку через ссылки');
        }
        return false;
    }

    // Очистка ответа от мусора
    function cleanResponse(responseText) {
        // Ищем начало JSON массива после )] }'
        const match = responseText.match(/\)\]\}\'\n*(\[\[.*\]\])/s);

        if (match && match[1]) {
            return match[1];
        }

        // Альтернативный поиск
        const startIndex = responseText.indexOf('[["flairdataaction.rsr"');
        if (startIndex !== -1) {
            return responseText.substring(startIndex);
        }

        throw new Error('Не удалось извлечь JSON из ответа');
    }

    // Скачивание для одного языка
    async function fetchLanguage(lang) {
        const url = `https://calendar.google.com/calendar/u/0/flairdata?hl=${lang}`;

        try {
            console.log(`Загрузка: ${lang}...`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();
            const cleanJson = cleanResponse(text);

            // Проверяем валидность JSON
            JSON.parse(cleanJson);

            return { lang, data: cleanJson, success: true };

        } catch (error) {
            console.error(`✗ Ошибка для ${lang}: ${error.message}`);
            return { lang, success: false, error: error.message };
        }
    }

    // Сохранение файла через File System Access API
    async function saveFileWithFSAPI(lang, data) {
        if (!directoryHandle) return false;

        try {
            const fileHandle = await directoryHandle.getFileHandle(`${lang}.json`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(data);
            await writable.close();
            return true;
        } catch (err) {
            console.error(`Не удалось сохранить ${lang}.json через FS API:`, err);
            return false;
        }
    }

    // Сохранение файла через создание ссылки для скачивания (fallback)
    function saveFileWithBlob(lang, data) {
        try {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${lang}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (err) {
            console.error(`Не удалось сохранить ${lang}.json через Blob:`, err);
            return false;
        }
    }

    // Сохранение файла (выбирает метод автоматически)
    async function saveFile(lang, data) {
        if (directoryHandle) {
            return await saveFileWithFSAPI(lang, data);
        } else {
            return saveFileWithBlob(lang, data);
        }
    }

    // Загрузка с ограничением параллельности
    async function downloadAll() {
        const results = [];
        let completed = 0;

        for (let i = 0; i < languages.length; i += concurrent) {
            const batch = languages.slice(i, i + concurrent);
            console.log(`\n=== Загрузка пакета ${Math.floor(i / concurrent) + 1}/${Math.ceil(languages.length / concurrent)} ===`);

            const batchPromises = batch.map(async (lang) => {
                const result = await fetchLanguage(lang);

                if (result.success) {
                    const saved = await saveFile(lang, result.data);
                    if (saved) {
                        console.log(`✓ Сохранено: ${lang}.json`);
                    } else {
                        result.success = false;
                        result.error = 'Не удалось сохранить файл';
                    }
                }

                completed++;
                if (onProgress) {
                    onProgress(completed, languages.length, lang);
                }

                return result;
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Задержка между пакетами
            if (i + concurrent < languages.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return results;
    }

    // Создаем папку и начинаем загрузку
    const hasDirectory = await createDirectory();

    if (!hasDirectory && concurrent > 1) {
        console.warn('Внимание: без выбора папки файлы будут скачиваться по одному!');
        console.warn('Рекомендуется разрешить выбор папки для массовой загрузки.');

        // Если не выбрана папка, скачиваем по одному файлу
        for (const lang of languages) {
            const result = await fetchLanguage(lang);
            if (result.success) {
                saveFileWithBlob(lang, result.data);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            if (onProgress) {
                onProgress(languages.indexOf(lang) + 1, languages.length, lang);
            }
        }

        const successful = languages.filter(l => l).length;
        return {
            total: languages.length,
            successful,
            failed: 0
        };
    }

    const results = await downloadAll();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n=== СТАТИСТИКА ===`);
    console.log(`Всего языков: ${languages.length}`);
    console.log(`Успешно: ${successful}`);
    console.log(`Ошибок: ${failed}`);

    return {
        total: languages.length,
        successful,
        failed,
        results
    };
}

// Пример использования в браузере с прогрессом:
async function startDownload() {
    const button = document.createElement('button');
    button.textContent = 'Скачать все флайры';
    button.onclick = async () => {
        button.disabled = true;
        button.textContent = 'Загрузка...';

        const progressDiv = document.createElement('div');
        document.body.appendChild(progressDiv);

        const result = await downloadAllFlairs({
            outputDir: 'google_flairs',
            concurrent: 5,
            onProgress: (current, total, lang) => {
                progressDiv.textContent = `Прогресс: ${current}/${total} (${Math.round(current/total*100)}%) - Текущий язык: ${lang}`;
            }
        });

        button.textContent = `Готово! Загружено: ${result.successful}/${result.total}`;
        progressDiv.textContent = `Завершено! Успешно: ${result.successful}, Ошибок: ${result.failed}`;
    };

    document.body.appendChild(button);
}

// Автоматический запуск интерфейса
if (typeof window !== 'undefined') {
    startDownload();
}

// Экспорт для использования в консоли браузера
window.downloadAllFlairs = downloadAllFlairs;
