# 📦 Инструкция по публикации @kirill-kopylov/telegram

## Первая публикация (делаем один раз)

### 1. Регистрация на npmjs.com
Если ещё не зарегистрирован:
```bash
npm adduser
```
Введи: username, password, email

### 2. Проверка авторизации
```bash
npm whoami
```
Должно показать твой username.

### 3. Коммит всех изменений
```bash
git add .
git commit -m "feat: add HTTP proxy support"
git push origin master
```

### 4. Публикация пакета

#### Простой способ (через готовый скрипт):
```bash
npm run publish:npm
```

Скрипт автоматически:
- Скомпилирует TypeScript → JavaScript
- Скопирует нужные файлы в `dist/`
- Удалит browser-specific файлы
- Опубликует пакет в npm

#### Альтернативный способ (вручную):
```bash
# 1. Собрать проект
npm run prepare:dist

# 2. Перейти в dist и опубликовать
cd dist
npm publish --access public
cd ..
```

**ВАЖНО:** Флаг `--access public` обязателен для scoped пакетов (@kirill-kopylov/telegram), иначе npm попытается создать приватный пакет (платная функция).

## Обновление пакета

### 1. Внеси изменения в код

### 2. Обнови версию

Используй npm команды (они автоматически обновят package.json и создадут git tag):

```bash
# Для bug fixes (2.26.9 → 2.26.10)
npm run version:patch

# Для новых фич (2.26.9 → 2.27.0)
npm run version:minor

# Для breaking changes (2.26.9 → 3.0.0)
npm run version:major
```

Или вручную отредактируй версию в [`package.json`](package.json:3).

### 3. Коммит и пуш (если использовал npm version, тег уже создан)
```bash
git push origin master
git push --tags
```

### 4. Опубликуй новую версию
```bash
npm run publish:npm
```

## Использование в других проектах

### Установка
```bash
# Удали старый gramjs (если был)
npm uninstall telegram

# Установи форк
npm install @kirill-kopylov/telegram
```

### Импорт
Всё работает точно так же, как оригинальный gramjs:

```javascript
// Вместо: import { TelegramClient } from "telegram";
import { TelegramClient } from "@kirill-kopylov/telegram";
import { StringSession } from "@kirill-kopylov/telegram/sessions";

// Всё остальное без изменений + дополнительная поддержка HTTP прокси
```

### Пример с HTTP прокси
```javascript
const client = new TelegramClient(stringSession, apiId, apiHash, {
  proxy: {
    ip: "proxy.example.com",
    port: 8080,
    httpProxy: true,
    username: "user",  // опционально
    password: "pass",  // опционально
    timeout: 10,
  },
});
```

## Проверка перед публикацией

### 1. Прогнать тесты
```bash
npm test
```

### 2. Проверить что собирается без ошибок
```bash
npm run build
```

### 3. Посмотреть что будет в пакете
```bash
npm run prepare:dist
cd dist
npm pack --dry-run
```

## Синхронизация с оригинальным gramjs

### Один раз: добавь upstream remote
```bash
git remote add upstream https://github.com/gram-js/gramjs.git
git fetch upstream
```

### Получить обновления из оригинала
```bash
git fetch upstream
git checkout master
git merge upstream/master
```

### Если есть конфликты:
```bash
# Разреши конфликты в редакторе
git add .
git commit -m "merge: sync with upstream gramjs"
```

### После мерджа:
```bash
# Обнови версию
npm run version:minor

# Пуш
git push origin master
git push --tags

# Опубликуй
npm run publish:npm
```

## Полезные команды npm

```bash
# Информация о пакете
npm view @kirill-kopylov/telegram

# Все версии пакета
npm view @kirill-kopylov/telegram versions

# Последняя версия
npm view @kirill-kopylov/telegram version

# Удалить версию (только в течение 72 часов!)
npm unpublish @kirill-kopylov/telegram@2.26.9

# Пометить как deprecated
npm deprecate @kirill-kopylov/telegram@2.26.9 "Use 2.27.0 instead"

# Добавить dist-tag (например beta)
npm dist-tag add @kirill-kopylov/telegram@2.27.0 beta
```

## Структура проекта после сборки

```
gramjs-http-proxy-support/
├── gramjs/              # Исходники TypeScript
├── dist/                # Скомпилированный код для публикации
│   ├── package.json
│   ├── README.md
│   ├── index.js
│   └── ...
├── scripts/
│   └── publish.js       # Скрипт публикации
└── package.json
```

**Важно:** В npm публикуется только содержимое `dist/`, исходники TypeScript не попадают в пакет.

## Troubleshooting

### Error: 403 Forbidden
- Убедись что залогинен: `npm whoami`
- Проверь права доступа к scoped пакету
- Добавь `--access public`

### Error: Version X already exists
- Обнови версию в package.json
- Используй `npm version patch/minor/major`

### Build errors
- Проверь что установлены все devDependencies: `npm install`
- Проверь версию Node.js (рекомендуется 14+)

### Import errors в проектах
- Убедись что установил `@kirill-kopylov/telegram`, а не `telegram`
- Проверь что импорты используют правильное имя пакета