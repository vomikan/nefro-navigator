# 🤝 Руководство по внесению контента

## 📐 Правила добавления рецептов
1. **Только сырой вес** ингредиентов. Уварка/набухание учитывается отдельно.
2. **Обязательные поля** в YAML: `stage`, `nutrients_per_serving`, `author`, `date_added`
3. **Источники данных**: справочник Скурихина (2002), USDA FoodData Central, лабораторные замеры
4. **Проверка**: перед PR сверьте расчёты минимум в 2 калькуляторах

## 🩺 Медицинская валидация
- Рецепты с `stage: [5-hd]` требуют пометки `[HD-APPROVED]` от диетолога/нефролога
- Запрещены формулировки "лечит", "снижает креатинин", "заменяет терапию"

## 📁 Структура PR
[TYPE] Title
[RECIPE] Добавлен: Борщ адаптивный
[FIX] Исправлен расчёт К в рецепте X
[DOCS] Обновлены лимиты фосфора для 3b стадии


## 🔍 Review процесс
1. Автоматическая проверка YAML-синтаксиса
2. Перекрёстная проверка нутриентов мейнтейнерами
3. Публикация в `main` + обновление GitHub Pages

🚀 Быстрый старт (команды)

# 1. Создать локально
mkdir ckd-diet-system && cd ckd-diet-system
git init
mkdir -p docs recipes/{soups,main-dishes,bakery,snacks-sauces} tools/calculator tools/data assets/icons .github/workflows

# 2. Создать файлы (вставьте содержимое выше)
touch README.md LICENSE DISCLAIMER.md CONTRIBUTING.md
touch recipes/_template.md docs/stages.md docs/nutrients-calc.md docs/cooking-techniques.md
touch tools/calculator/README.md tools/data/nutrients_base.json

# 3. Коммит и пуш
git add .
git commit -m "Initial commit: CKD diet knowledge base"
git branch -M main
git remote add origin https://github.com/your-username/ckd-diet-system.git
git push -u origin main

