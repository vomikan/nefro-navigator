// scripts/scrape-hpn-site.cjs
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const TurndownService = require('turndown');

const OUTPUT_DIR = path.join(__dirname, '../src/data/hpn-scraped');
const LINKS_FILE = path.join(__dirname, 'recipe-links-list.txt');

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-'
});

async function getRecipeLinksFromFile() {
  console.log('📂 [1] Чтение списка ссылок...');
  try {
    if (!fs.existsSync(LINKS_FILE)) {
      console.error(`❌ Файл ${LINKS_FILE} не найден! Проверьте путь.`);
      return [];
    }
    
    const content = fs.readFileSync(LINKS_FILE, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0 && line.startsWith('http'));
    
    console.log(`✅ Найдено ссылок: ${lines.length}`);
    
    return lines.map(url => {
      const slug = path.basename(url.replace(/\/$/, ''));
      const tempTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return { url: url, title: tempTitle };
    });
  } catch (error) {
    console.error('❌ Ошибка чтения файла:', error.message);
    return [];
  }
}

async function scrapeRecipe(url, tempTitle) {
  // console.log(`⬇️ Загрузка: ${url}`); // Можно раскомментировать для отладки каждого шага
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // 1. Заголовок
    const h1Title = $('h1.elementor-heading-title').first().text().trim();
    const finalTitle = h1Title || tempTitle;
    
    // 2. Категория из URL
    let categorySlug = 'mains'; 
    if (url.includes('/category/')) {
        const parts = url.split('/category/')[1];
        if (parts) {
            const catPart = parts.split('/')[0];
            const categoryMap = {
                'pervye-blyuda': 'soups',
                'vtorye-blyuda': 'mains',
                'deserty': 'desserts',
                'zakuski': 'snacks',
                'napitki': 'drinks',
                'vypechka': 'baking',
                'salaty': 'salads'
            };
            categorySlug = categoryMap[catPart] || 'mains';
        }
    }
    
    // 3. Контент
    let markdownParts = [];
    $('.elementor-widget-text-editor').each((i, el) => {
        const html = $(el).find('.elementor-widget-container').html() || $(el).html();
        if (html) {
            const md = turndownService.turndown(html);
            if (md.trim().length > 0) markdownParts.push(md);
        }
    });

    if (markdownParts.length === 0) {
        const contentHtml = $('.entry-content').html() || $('.post-content').html();
        if (contentHtml) {
             const temp$ = cheerio.load(contentHtml);
             temp$('script, style, .share-buttons, .ad-container').remove();
             markdownParts.push(turndownService.turndown(temp$.html()));
        }
    }

    const markdownContent = markdownParts.join('\n\n');

    // 4. Изображение
    const imageUrl = $('meta[property="og:image"]').attr('content') || 
                     $('.wp-post-image').attr('src') || 
                     $('.elementor img').first().attr('src') || '';

    // 5. Нутриенты
    let nutrientsRaw = "";
    $('.elementor-widget-text-editor').each((i, el) => {
        const text = $(el).text();
        if (text.match(/ккал|калорийность|белки|жиры|углеводы|фосфор|калий/i)) {
             $(el).find('p, ul').each((j, pEl) => {
                 const pText = $(pEl).text();
                 if (pText.match(/ккал|белки|жиры|углеводы|фосфор|калий/i)) {
                     nutrientsRaw += pText + "\n";
                 }
             });
        }
    });

    const slug = path.basename(url.replace(/\/$/, ''));

    return {
      original_title: finalTitle,
      slug: slug,
      source_url: url,
      author: "Игорь Петров / Дневник ХПНщика",
      source_name: "Сайт Дневник ХПНщика",
      image_url: imageUrl,
      content_md: markdownContent,
      nutrients_raw: nutrientsRaw.trim(),
      date_scraped: new Date().toISOString().split('T')[0],
      category_folder: categorySlug
    };
  } catch (error) {
    console.error(`❌ Ошибка ${url}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Старт парсера...');
  
  // Очищаем папку
  await fs.emptyDir(OUTPUT_DIR);
  await fs.ensureDir(OUTPUT_DIR);
  console.log('🗑 Папка очищена.');

  const links = await getRecipeLinksFromFile();
  
  if (links.length === 0) {
    console.log('⛔ Список пуст. Выход.');
    return;
  }

  // Для теста берем первые 3. Если всё ок, замените на links
  const testLinks = links; 
  console.log(`📥 Начинаем скачивание ${testLinks.length} рецептов...`);

  for (let i = 0; i < testLinks.length; i++) {
    const item = testLinks[i];
    console.log(`[${i+1}/${testLinks.length}] Обработка: ${item.title}`);
    
    const recipe = await scrapeRecipe(item.url, item.title);
    
    if (recipe) {
      const filename = `${recipe.slug}.json`;
      await fs.writeJson(path.join(OUTPUT_DIR, filename), recipe, { spaces: 2 });
      console.log(`   ✅ Сохранен: ${filename} (Категория: ${recipe.category_folder})`);
    } else {
      console.log(`   ❌ Пропущен из-за ошибки.`);
    }
    
    // Пауза 1.5 сек
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log('✨ Готово! Файлы в src/data/hpn-scraped/');
}

main().catch(err => {
    console.error('💥 Критическая ошибка:', err);
});
