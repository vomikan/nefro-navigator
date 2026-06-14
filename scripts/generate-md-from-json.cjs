// scripts/generate-md-from-json.cjs
const fs = require('fs-extra');
const path = require('path');

const SCRAPED_DIR = path.join(__dirname, '../src/data/hpn-scraped');
const BASE_RECIPES_DIR = path.join(__dirname, '../src/content/recipes'); 

async function generateMDFiles() {
  const files = await fs.readdir(SCRAPED_DIR);
  
  if (files.length === 0) {
    console.log('⚠️ Нет JSON файлов.');
    return;
  }

  console.log(`🔄 Конвертация ${files.length} файлов...`);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const jsonPath = path.join(SCRAPED_DIR, file);
    const data = await fs.readJson(jsonPath);
    
    // Определяем папку для сохранения
    const categoryFolder = data.category_folder || 'mains';
    const targetDir = path.join(BASE_RECIPES_DIR, categoryFolder);
    
    // Создаем папку, если её нет
    await fs.ensureDir(targetDir);
    
    // Формируем Frontmatter
    const frontmatter = `---
title: "${data.original_title.replace(/"/g, '\\"')}"
author: "${data.author}"
source_link: "${data.source_url}"
source_name: "${data.source_name}"
date: "${data.date_scraped}"
stage: [1, 2, 3a, 3b, 4, 5] 
servings: "-"
prep_time: "-"
tags: ["low-protein", "from-hpn-site", "${categoryFolder}"]
---

`;

    const body = `> 📚 **Оригинал рецепта:** [Смотреть на сайте автора](${data.source_url})

${data.content_md}

${data.nutrients_raw ? `---
**📊 Нутриенты (из источника):**
${data.nutrients_raw}` : ''}
`;

    const fullContent = frontmatter + body;
    
    const mdFilename = `${data.slug}.md`;
    const outputPath = path.join(targetDir, mdFilename);
    
    await fs.writeFile(outputPath, fullContent, 'utf-8');
    console.log(`✅ Создан MD: ${categoryFolder}/${mdFilename}`);
  }
  
  console.log('✨ Все рецепты распределены по папкам!');
}

generateMDFiles();
