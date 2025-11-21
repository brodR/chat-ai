import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "<OPENROUTER_API_KEY>",
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3.1:free",
    messages: [
        {
          "role": "user",
          "content": "What is the meaning of life?"
        }
      ]
  });

  console.log(completion.choices[0].message);
}

main();



// DeepSeek: DeepSeek V3.1 (бесплатно)
// deepseek/deepseek-chat-v3.1:free

// Сравнивать
// Создано 21 августа 2025 года
// Контекст 163 800
// $Входные токены 0/M
// $Токены выхода 0/M
// DeepSeek-V3.1 — это крупная гибридная модель рассуждения (671B параметров, 37B активных), поддерживающая как режимы мышления, так и немыслящие через шаблоны подсказок. Он расширяет базу DeepSeek-V3 с помощью двухфазного процесса длительного контекстного обучения, охватывающего до 128 тысяч токенов, и использует микромасштабирование FP8 для эффективного вывода. Пользователи могут управлять поведением рассуждения с помощью булевой системы. reasoningenabledУзнайте больше в нашей документации

// Модель улучшает использование инструментов, генерацию кода и эффективность рассуждения, достигая производительности, сопоставимой с DeepSeek-R1 на сложных тестах, при этом отвечая быстрее. Он поддерживает структурированный вызов инструментов, агенты кода и поисковые агенты, что делает его подходящим для исследований, программирования и агентных рабочих процессов.

// Он преследует модель DeepSeek V3-0324 и хорошо справляется с различными задачами.





// import OpenAI from 'openai';

// const client = new OpenAI({
//   baseURL: 'https://openrouter.ai/api/v1',
//   apiKey: '<OPENROUTER_API_KEY>',
// });

// // First API call with reasoning
// const apiResponse = await client.chat.completions.create({
//   model: 'openai/gpt-oss-20b:free',
//   messages: [
//     {
//       role: 'user' as const,
//       content: "How many r's are in the word 'strawberry'?",
//     },
//   ],
//   reasoning: { enabled: true }
// });

// // Extract the assistant message with reasoning_details
// type ORChatMessage = (typeof apiResponse)['choices'][number]['message'] & {
//   reasoning_details?: unknown;
// };
// const response = apiResponse.choices[0].message as ORChatMessage;

// // Preserve the assistant message with reasoning_details
// const messages = [
//   {
//     role: 'user' as const,
//     content: "How many r's are in the word 'strawberry'?",
//   },
//   {
//     role: 'assistant' as const,
//     content: response.content,
//     reasoning_details: response.reasoning_details, // Pass back unmodified
//   },
//   {
//     role: 'user' as const,
//     content: "Are you sure? Think carefully.",
//   },
// ];

// // Second API call - model continues reasoning from where it left off
// const response2 = await client.chat.completions.create({
//   model: 'openai/gpt-oss-20b:free',
//   messages, // Includes preserved reasoning_details
// });



// OpenAI: gpt-oss-20b (бесплатно)
// OpenAI/GPT-OSS-20B:Free

// Сравнивать
// Создано 5 августа 2025 года
// Контекст 131 072
// $Входные токены 0/M
// $Токены выхода 0/M
// gpt-oss-20b — это открытая модель с параметрами 21B, выпущенная компанией OpenAI под лицензией Apache 2.0. Он использует архитектуру Mix-of-Experts (MoE) с 3,6 Б активных параметров на один проход прямо, оптимизированную для вывода и развертывания с меньшей задержкой на потребительском или однопроцессорном оборудовании. Модель обучена в формате ответов Harmony от OpenAI и поддерживает конфигурацию на уровне рассуждений, тонкую настройку и агентные возможности, включая вызов функций, использование инструментов и структурированные выходы.







// import OpenAI from 'openai';

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: "<OPENROUTER_API_KEY>",
//   defaultHeaders: {
//     "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//     "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//   },
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "qwen/qwen3-coder:free",
//     messages: [
//         {
//           "role": "user",
//           "content": "What is the meaning of life?"
//         }
//       ]
//   });

//   console.log(completion.choices[0].message);
// }

// main();


// Qwen: Qwen3 Coder 480B A35B (бесплатно)
// qwen/qwen3-coder:free

// Сравнивать
// Создано 23 июля 2025 года
// Контекст 262 000
// $Входные токены 0/M
// $Токены выхода 0/M
// Qwen3-Coder-480B-A35B-Instruct — это модель генерации кода на основе смеси экспертов (MoE), разработанная командой Qwen. Он оптимизирован для задач агентного кодирования, таких как вызов функций, использование инструментов и логическое мышление в длинном контексте через репозитории. Модель включает 480 миллиардов параметров в общей сложности, из которых 35 миллиардов активны на один прямой проход (8 из 160 экспертов).

// Цены на конечные точки Alibaba варьируются в зависимости от длительности контекста. Если запрос превышает 128 тысяч входных токенов, используется более высокая цена.





// import OpenAI from 'openai';

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: "<OPENROUTER_API_KEY>",
//   defaultHeaders: {
//     "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//     "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//   },
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "moonshotai/kimi-k2:free",
//     messages: [
//         {
//           "role": "user",
//           "content": "What is the meaning of life?"
//         }
//       ]
//   });

//   console.log(completion.choices[0].message);
// }

// main();


// MoonshotAI: Kimi K2 0711 (бесплатно)
// moonshotai/kimi-k2:free

// Сравнивать
// Создано 11 июля 2025 года
// Контекст 32 768
// $Входные токены 0/M
// $Токены выхода 0/M
// Kimi K2 Instruct — это крупномасштабная языковая модель Mix-of-Experts (MoE), разработанная компанией Moonshot AI, с общим объемом 1 триллиона параметров и 32 миллиардами активных на один прямой проход. Он оптимизирован для агентных возможностей, включая продвинутое использование инструментов, рассуждение и синтез кода. Kimi K2 преуспевает в широком спектре бенчмарков, особенно в программировании (LiveCodeBench, SWE-bench), рассуждении (ZebraLogic, GPQA) и использовании инструментов (Tau2, AceBench). Он поддерживает длинный контекстный вывод до 128 тысяч токенов и разработан с использованием нового учебного стека, включающего оптимизатор MuonClip для стабильного крупномасштабного обучения MoE.







// import OpenAI from 'openai';

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: "<OPENROUTER_API_KEY>",
//   defaultHeaders: {
//     "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//     "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//   },
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "kwaipilot/kat-coder-pro:free",
//     messages: [
//         {
//           "role": "user",
//           "content": "What is the meaning of life?"
//         }
//       ]
//   });

//   console.log(completion.choices[0].message);
// }

// main();


// Kwaipilot: KAT-Coder-Pro V1 (бесплатно)
// kwaipilot/kat-coder-pro:free

// Сравнивать
// Создано 10 ноября 2025 года
// Контекст 256 000
// $Входные токены 0/M
// $Токены выхода 0/M
// KAT-Coder-Pro V1 — это самая продвинутая агентная модель кодирования KwaiKAT в серии KAT-Coder. Разработанный специально для задач агентного кодирования, он отлично справляется с реальными сценариями инженерии программного обеспечения, достигая 73,4% по результатам бенчмарка SWE-Bench Verified.

// Модель была оптимизирована для возможностей использования инструментов, многоходного взаимодействия, выполнения инструкций, обобщения и комплексных возможностей через многоступенчатый процесс обучения, включая промежуточное обучение, контролируемую тонкую настройку (SFT), подкреплённую тонкую настройку (RFT) и масштабируемую агентную RL.




// import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
});

// First API call with reasoning
const apiResponse = await client.chat.completions.create({
  model: 'nvidia/nemotron-nano-12b-v2-vl:free',
  messages: [
    {
      role: 'user' as const,
      content: "How many r's are in the word 'strawberry'?",
    },
  ],
  // reasoning: { enabled: true }
});

// Extract the assistant message with reasoning_details
type ORChatMessage = (typeof apiResponse)['choices'][number]['message'] & {
  reasoning_details?: unknown;
};
const response = apiResponse.choices[0].message as ORChatMessage;

// Preserve the assistant message with reasoning_details
const messages = [
  {
    role: 'user' as const,
    content: "How many r's are in the word 'strawberry'?",
  },
  {
    role: 'assistant' as const,
    content: response.content,
    reasoning_details: response.reasoning_details, // Pass back unmodified
  },
  {
    role: 'user' as const,
    content: "Are you sure? Think carefully.",
  },
];

// Second API call - model continues reasoning from where it left off
const response2 = await client.chat.completions.create({
  model: 'nvidia/nemotron-nano-12b-v2-vl:free',
  messages, // Includes preserved reasoning_details
});


// NVIDIA: Nemotron Nano 12B 2 VL (бесплатно)
// nvidia/nemotron-nano-12b-v2-vl:free

// Сравнивать
// Создано 28 октября 2025 года
// Контекст 128 000
// $Входные токены 0/M
// $Токены выхода 0/M
// NVIDIA Nemotron Nano 2 VL — это открытая мультимодальная модель мышления с 12 миллиардами параметров, предназначенная для понимания видео и анализа документов. Он вводит гибридную архитектуру Transformer-Mamba, сочетающую точность на уровне трансформатора с эффективным по памяти моделированием последовательностей Mamba для значительно большей пропускной способности и меньшей задержки.

// Модель поддерживает ввод текста и многообразных документов, обеспечивая выходные данные на естественном языке. Он обучен на высококачественных синтетических наборах данных, курируемых NVIDIA, оптимизированных для распознавания оптических символов, рассуждения по графикам и мультимодального понимания.

// Nemotron Nano 2 VL достигает ведущих результатов на OCRBench v2 и набирает средний балл ≈ 74 по MMMU, MathVista, AI2D, OCRBench, OCR-Reasoning, ChartQA, DocVQA и Video-MME — превосходя предыдущие открытые базовые показатели VL. С помощью эффективного видеодискретирования (EVS) он обрабатывает длинные видео, снижая затраты на выводы.

// Открытые весы, обучающие данные и тонкие рецепты выпускаются под разрешённой открытой лицензией NVIDIA, с поддержкой развертывания в NeMo, NIM и основных условиях вывода.






// import OpenAI from 'openai';

// const client = new OpenAI({
//   baseURL: 'https://openrouter.ai/api/v1',
//   apiKey: '<OPENROUTER_API_KEY>',
// });

// // First API call with reasoning
// const apiResponse = await client.chat.completions.create({
//   model: 'alibaba/tongyi-deepresearch-30b-a3b:free',
//   messages: [
//     {
//       role: 'user' as const,
//       content: "How many r's are in the word 'strawberry'?",
//     },
//   ],
//   reasoning: { enabled: true }
// });

// // Extract the assistant message with reasoning_details
// type ORChatMessage = (typeof apiResponse)['choices'][number]['message'] & {
//   reasoning_details?: unknown;
// };
// const response = apiResponse.choices[0].message as ORChatMessage;

// // Preserve the assistant message with reasoning_details
// const messages = [
//   {
//     role: 'user' as const,
//     content: "How many r's are in the word 'strawberry'?",
//   },
//   {
//     role: 'assistant' as const,
//     content: response.content,
//     reasoning_details: response.reasoning_details, // Pass back unmodified
//   },
//   {
//     role: 'user' as const,
//     content: "Are you sure? Think carefully.",
//   },
// ];

// // Second API call - model continues reasoning from where it left off
// const response2 = await client.chat.completions.create({
//   model: 'alibaba/tongyi-deepresearch-30b-a3b:free',
//   messages, // Includes preserved reasoning_details
// });




// Tongyi DeepResearch 30B A3B (бесплатно)
// alibaba/tongyi-deepresearch-30b-a3b:бесплатно

// Сравнивать
// Создано 18 сентября 2025 года
// Контекст 131 072
// $Входные токены 0/M
// $Токены выхода 0/M
// Tongyi DeepResearch — это агентная большая языковая модель, разработанная Tongyi Lab, с 30 миллиардами параметров, активирующих только 3 миллиарда на токен. Он оптимизирован для долгосрочных, глубоких задач поиска информации и обеспечивает передовые результаты на таких тестах, как Humanity's Last Exam, BrowserComp, BrowserComp-ZH, WebWalkerQA, GAIA, xbench-DeepSearch и FRAMES. Это делает её лучшей для сложных агентных поисков, рассуждений и многошагового решения задач по сравнению с предыдущими моделями.

// Модель включает полностью автоматизированный синтетический конвейер данных для масштабируемого предварительного обучения, тонкой настройки и обучения с подкреплением. Он использует масштабное постоянное предварительное обучение на различных агентных данных для улучшения мышления и поддержания актуальности. Он также включает сквозную систему RL на политике с индивидуальной оптимизацией групповой относительной политики, включая градиенты на уровне токенов и отрицательную фильтрацию выборок для стабильного обучения. Модель поддерживает ReAct для проверки основных способностей и режим 'Heavy' на базе IterResearch для максимальной производительности за счёт масштабирования времени тестирования. Он идеально подходит для продвинутых исследовательских агентов, использования инструментов и сложных рабочих процессов выводов.





// import OpenAI from 'openai';

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: "<OPENROUTER_API_KEY>",
//   defaultHeaders: {
//     "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//     "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//   },
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "meituan/longcat-flash-chat:free",
//     messages: [
//         {
//           "role": "user",
//           "content": "What is the meaning of life?"
//         }
//       ]
//   });

//   console.log(completion.choices[0].message);
// }

// main();




// Meituan: Flash Chat LongCat (бесплатно)
// meituan/longcat-flash-chat:бесплатно

// Сравнивать
// Создано 9 сентября 2025 года
// Контекст 131 072
// $Входные токены 0/M
// $Токены выхода 0/M
// LongCat-Flash-Chat — это крупномасштабная модель Mix-of-Experts (MoE) с общим объемом 560B параметров, из которых 18,6B–31,3B (в среднем ≈27B) активируются динамически на вход. Он вводит дизайн MoE, связанный с ярлыками, чтобы снизить накладные расходы на связь и достичь высокой пропускной способности, сохраняя при этом стабильность обучения с помощью продвинутых стратегий масштабирования, таких как передача гиперпараметров, детерминированные вычисления и многоступенчатая оптимизация.

// Этот релиз, LongCat-Flash-Chat, представляет собой базовую модель без мышления, оптимизированную для разговорных и агентных задач. Он поддерживает длинные контекстные окна до 128K токенов и демонстрирует конкурентоспособную производительность в анализе, программировании, выполнении инструкций и доменных тестах, с особыми преимуществами в использовании инструментов и сложных многоступенчатых взаимодействиях.












// Статус Приложения "Чат Окно"
// Текущее Состояние
// Приложение успешно запущено и работает. Сервер разработки активен и доступен по следующим адресам:

// Локальный доступ: http://localhost:8080
// Сетевой доступ: http://192.168.0.108:8080
// Что Было Сделано
// 1. Диагностика Проблемы
// После проверки было обнаружено, что приложение не было активно запущено. Предыдущая сессия завершилась, и сервер разработки нуждался в перезапуске.

// 2. Запуск Сервера Разработки
// Сервер был успешно запущен командой , которая:npm run dev

// Запускает Express сервер на порту 8080
// Интегрирует Vite для разработки React приложения с горячей перезагрузкой (HMR)
// Обслуживает как API endpoints, так и клиентское приложение на одном порту
// 3. Проверка Работоспособности
// Тестирование подтвердило:

// ✅ HTTP сервер отвечает (статус 200 OK)
// ✅ HTML страница загружается корректно
// ✅ Заголовок страницы: "Чат Окно - Современный AI чат с мультимедиа"
// ✅ API endpoints работают (например, /api/user)
// ✅ Vite middleware активен для замены горячих модулей
// Как Работает Это Приложение на Node.js
// Это приложение имеет интегрированную архитектуру, где Express и React работают вместе:

// Режим Разработки (Development)
// npm run dev
// Как это работает:

// Express сервер запускается на порту 8080 через TypeScript (tsx)
// Vite middleware интегрируется в Express для обслуживания React приложения
// Всё работает на одном порту (8080) - не нужно запускать две отдельные консоли
// Изменения в коде автоматически обновляются в браузере (Hot Module Replacement)
// Режим Продакшн (Production)
// npm run build  # Собирает клиент и сервер
// npm start      # Запускает продакшн сервер
// Как это работает:

// npm run build компилирует:
// React приложение в статические файлы (в dist/public)
// Express сервер в JavaScript (в dist)
// npm start запускает скомпилированный сервер
// Express обслуживает статические файлы из и API endpointsdist/public
// Почему Не Нужны Две Консоли?
// В отличие от традиционной разработки (где клиент и сервер запускаются отдельно), это приложение использует интегрированный подход:

// Традиционный способ:

// Консоль 1: (порт 5173)cd client && npm run dev
// Консоль 2: (порт 3000)cd server && npm start
// Нужны CORS настройки и прокси
// Этот проект:

// Одна команда: (порт 8080)npm run dev
// Express интегрирует Vite как middleware
// Нет необходимости в CORS между клиентом и сервером
// Всё работает на одном порту
// Архитектура Приложения
// Технологический Стек
// Фронтенд (клиент):

// React 18 с TypeScript
// Vite для быстрой разработки
// TailwindCSS для стилизации
// Radix UI для компонентов
// React Hook Form для форм
// Wouter для роутинга
// Бэкенд (сервер):

// Express.js (веб-сервер)
// Машинописный текст
// Express Session (управление сессиями)
// Multer (загрузка файлов)
// WebSocket (ws) для реального времени
// OpenAI API интеграция
// База Данных:

// Файловая система (MemStorage) для разработки
// Drizzle ORM для продакшн (PostgreSQL/Neon)
// Структура Проекта
// ******/
// ├── client/           # React приложение
// │   ├── src/         # Исходный код React
// │   ├── public/      # Статические файлы
// │   └── index.html   # Главная HTML страница
// ├── server/          # Express сервер
// │   ├── index.ts     # Точка входа сервера
// │   ├── routes.ts    # API маршруты
// │   ├── auth.ts      # Аутентификация
// │   └── storage.ts   # Хранилище данных
// ├── shared/          # Общий код (типы, схемы)
// ├── data/           # Файловое хранилище
// ├── package.json    # Зависимости проекта
// ├── vite.config.ts  # Конфигурация Vite
// ├── netlify.toml    # Конфигурация Netlify
// └── tsconfig.json   # Конфигурация TypeScript
// Настройка Портов
// В коде настроены следующие порты:

// Официант/index.ts: const port = parseInt(process.env.PORT || '8080', 10);

// По умолчанию использует порт 8080
// Можно переопределить через переменную окружения PORT
// netlify.toml:

// [dev]
//   port = 8888
//   targetPort = 8888
// Настроен на порт 8888 для Netlify Dev (но текущий сервер работает на 8080)
// vite.config.ts: Vite интегрирован в Express, не запускается отдельно

// Что Нужно Для Полноценной Работы
// Обязательные Требования (Уже Выполнены)
// ✅ Node.js v22.x установлен
// ✅ Зависимости установлены (npm install)
// ✅ Директория созданаdata/
// Опциональные Настройки
// Для полноценной работы AI функционала нужны переменные окружения:

// # Создайте файл .env в корне проекта:
// SESSION_SECRET=your-random-secret-key
// OPENAI_API_KEY=your-openai-api-key  # Для использования OpenAI
// Для Деплоя на Netlify
// Для деплоя в продакшн на Netlify потребуется:

// Переменные окружения (установить в Netlify Dashboard):

// SESSION_SECRET - секретный ключ для сессий
// OPENAI_API_KEY - ключ API OpenAI (если используется)
// Другие API ключи для AI провайдеров (при необходимости)
// База данных:

// Текущая файловая система не подходит для serverless
// Рекомендуется PostgreSQL (например, Neon Database)
// Настроить DATABASE_URL в переменных окружения
// Миграция на функции Netlify:

// Express сервер нужно адаптировать под serverless функции
// Создать функцию в netlify/functions/server.ts
// Обновить маршрутизацию и хранилище данных
// Проблемы и Их Решения
// ❌ Проблема: "Приложение не появилось"
// Причина: Сервер разработки не был запущен после предыдущей сессии.

// Решение: Запущен сервер командой . Теперь приложение доступно по адресу http://localhost:8080.npm run dev

// ⚠️ Предупреждение: Предупреждение о плагинах PostCSS
// В логах видно предупреждение:

// A PostCSS plugin did not pass the `from` option to `postcss.parse`
// Влияние: Это не критично и не мешает работе приложения. Это предупреждение от одного из PostCSS плагинов.

// Можно исправить: Обновить конфигурацию PostCSS плагинов, но это не обязательно для текущей работы.

// ⚠️ Расхождение в Портах
// Ситуация:

// server/index.ts использует порт 8080
// netlify.toml настроен на порт 8888
// Рекомендация: Для согласованности лучше использовать один и тот же порт. Можно:

// Изменить порт в на 8888, илиserver/index.ts
// Обновить на порт 8080netlify.toml
// Рекомендации по Доработке
// Для Локальной Разработки
// ✅ Приложение готово к использованию
// Добавить файл с необходимыми API ключами.env
// При необходимости согласовать порты в конфигурации
// Для Деплоя на Netlify
// Serverless адаптация:

// Конвертировать Express сервер в Netlify Functions
// Использовать для обработки запросов@netlify/functions
// Статические файлы будут обслуживаться через Netlify CDN
// База данных:

// Настроить PostgreSQL (рекомендуется Neon)
// Мигрировать с файловой системы на Drizzle ORM
// Запустить для создания схемыnpm run db:push
// Переменные окружения:

// Установить в Netlify Dashboard все необходимые ключи
// Проверить безопасность секретных ключей
// Хранилище файлов:

// Для загружаемых файлов использовать Netlify Blobs или S3
// Обновить middleware для загрузки файлов
// Как Запустить Приложение Сейчас
// Приложение уже запущено и работает по адресу:

// http://localhost:8080

// Откройте этот адрес в браузере, и вы увидите интерфейс "Чат Окно".

// Если в будущем потребуется перезапустить:

// # Перейти в директорию проекта
// cd ******

// # Запустить сервер разработки
// npm run dev
// Сервер будет доступен на http://localhost:8080 и останется активным до тех пор, пока не будет остановлен (Ctrl+C).

// Заключение
// Приложение "Чат Окно" - это современное полнофункциональное React + Express приложение, которое использует интегрированный подход к разработке. Сервер успешно запущен на порту 8080 и готов к использованию. Архитектура приложения позволяет работать с одной командой в одной консоли, что упрощает разработку.

// Для продакшн деплоя на Netlify потребуется адаптация под serverless архитектуру и настройка базы данных, но для локальной разработки всё готово и работает.











