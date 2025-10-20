import puppeteer from 'puppeteer';
import * as fs from 'fs';

interface InstagramMetrics {
  url: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  error?: string;
}

class InstagramScraper {
  private browser: any;
  private page: any;

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getMetrics(url: string): Promise<InstagramMetrics> {
    const result: InstagramMetrics = { url };

    try {
      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Set viewport
      await this.page.setViewport({ width: 1280, height: 800 });

      console.log(`🔍 Acessando: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try to extract metrics
      const metrics = await this.page.evaluate(() => {
        const result: any = {};

        // Look for view count (for Reels)
        const viewElements = document.querySelectorAll('[role="button"]');
        for (const element of viewElements) {
          const text = element.textContent?.trim() || '';
          if (text.includes('views') || text.includes('visualizações')) {
            const match = text.match(/([\d,]+(?:\.\d+)?[KMB]?)/);
            if (match) {
              result.views = parseInt(match[1].replace(/[KMB,]/g, '')) || 0;
            }
          }
        }

        // Look for like count
        const likeElements = document.querySelectorAll('button[aria-label*="curtir"], button[aria-label*="like"]');
        for (const element of likeElements) {
          const ariaLabel = element.getAttribute('aria-label') || '';
          const match = ariaLabel.match(/([\d,]+(?:\.\d+)?[KMB]?)/);
          if (match) {
            result.likes = parseInt(match[1].replace(/[KMB,]/g, '')) || 0;
          }
        }

        // Alternative: look for spans with numbers
        const spans = document.querySelectorAll('span');
        for (const span of spans) {
          const text = span.textContent?.trim() || '';
          if (text.includes('likes') || text.includes('curtidas')) {
            const match = text.match(/([\d,]+(?:\.\d+)?[KMB]?)/);
            if (match && !result.likes) {
              result.likes = parseInt(match[1].replace(/[KMB,]/g, '')) || 0;
            }
          }
          if (text.includes('comments') || text.includes('comentários')) {
            const match = text.match(/([\d,]+(?:\.\d+)?[KMB]?)/);
            if (match) {
              result.comments = parseInt(match[1].replace(/[KMB,]/g, '')) || 0;
            }
          }
        }

        // Look for specific metric elements
        const metricElements = document.querySelectorAll('[data-testid*="count"], [role="button"] span');
        for (const element of metricElements) {
          const text = element.textContent?.trim() || '';
          const match = text.match(/([\d,]+(?:\.\d+)?[KMB]?)/);
          if (match) {
            const number = parseInt(match[1].replace(/[KMB,]/g, '')) || 0;
            if (text.toLowerCase().includes('view') && !result.views) {
              result.views = number;
            }
            if ((text.toLowerCase().includes('like') || text.toLowerCase().includes('curtir')) && !result.likes) {
              result.likes = number;
            }
          }
        }

        return result;
      });

      result.views = metrics.views;
      result.likes = metrics.likes;
      result.comments = metrics.comments;

      console.log(`✅ Métricas extraídas: ${JSON.stringify(metrics)}`);

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log(`❌ Erro ao extrair métricas: ${result.error}`);
    } finally {
      if (this.page) {
        await this.page.close();
      }
    }

    return result;
  }

  async scrapeMultiple(urls: string[]): Promise<InstagramMetrics[]> {
    const results: InstagramMetrics[] = [];

    for (const url of urls) {
      const metrics = await this.getMetrics(url);
      results.push(metrics);

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return results;
  }
}

// URLs dos vídeos do Instagram
const instagramUrls = [
  "https://www.instagram.com/reel/DNX79bkt1dg/?utm_source=ig_web_copy_link&igsh=bjBnZzZ4c3RyM2sw",
  "https://www.instagram.com/reel/DNiaGVjxk06/?utm_source=ig_web_copy_link&igsh=MW5xNTdnczRkamJ2bw==",
  "https://www.instagram.com/reel/DOBwANgDsZu/?utm_source=ig_web_copy_link&igsh=eDczODc0dzUzZ2N2",
  "https://www.instagram.com/reel/DNgJYVyOIpY/?utm_source=ig_web_copy_link&igsh=MWx5bjRreHNzbTM1aw==",
  "https://www.instagram.com/reel/DNBK-EHOw2P/?utm_source=ig_web_copy_link&igsh=MWFoN3I0M21wZXpmdw==",
  "https://www.instagram.com/reel/DNievgXOeBx/?utm_source=ig_web_copy_link&igsh=Mzl4dW5nYWZuYWQ1",
  "https://www.instagram.com/reel/DNqvO4bxwho/?utm_source=ig_web_copy_link&igsh=MXN5cGtyZ3R1Y3ppbw==",
  "https://www.instagram.com/reel/DMdwqfCPL7V/?igsh=ZnhiN3JhYndzaDdt",
  "https://www.instagram.com/reel/DNBK-EHOw2P/?utm_source=ig_web_copy_link&igsh=MWFoN3I0M21wZXpmdw==",
  "https://www.instagram.com/reel/DNWkykZN1Hc/?utm_source=ig_web_copy_link&igsh=MXRjNGtxMGZqMXN5Zw==",
  "https://www.instagram.com/p/DOuCdn_jzCo/",
  "https://www.instagram.com/reel/DNEohN3RXEh/?utm_source=ig_web_copy_link&igsh=ZTUwd3R1NTJ3N3J3",
  "https://www.instagram.com/reel/DNPDhH3x2Vc/?utm_source=ig_web_copy_link&igsh=NzB1MGxtc25pZDJ6",
  "https://www.instagram.com/reel/DMglxoOPvon/?utm_source=ig_web_copy_link&igsh=MWkxNXczNDA4eWVq",
  "https://www.instagram.com/p/DOwgXxlDjQa/",
  "https://www.instagram.com/p/DO3t67LjdFo/",
  "https://www.instagram.com/reel/DOdxIPKjVY1/?utm_source=ig_web_copy_link&igsh=YmwxenJ2ZDEzN2Vq",
  "https://www.instagram.com/reel/DO9ejszATeH/?utm_source=ig_web_copy_link&igsh=bHdpcXFmeDhqejlw",
  "https://www.instagram.com/p/DO1qRiyERLw/",
  "https://www.instagram.com/reel/DOhHsKvj99Z/?utm_source=ig_web_copy_link&igsh=MzQxcnM3MDFvcnFi",
  "https://www.instagram.com/p/DOzIl2PD0B_/"
];

async function main() {
  const scraper = new InstagramScraper();

  try {
    console.log('🚀 Iniciando scraping do Instagram...');
    await scraper.init();

    console.log(`📊 Processando ${instagramUrls.length} URLs...`);
    const results = await scraper.scrapeMultiple(instagramUrls);

    // Salvar resultados em JSON
    fs.writeFileSync('instagram-metrics-results.json', JSON.stringify(results, null, 2));

    // Gerar relatório
    console.log('\n📈 RELATÓRIO FINAL:');
    console.log('='.repeat(80));

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let successful = 0;
    let failed = 0;

    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.url.split('/').pop()?.split('?')[0]}`);
      if (result.error) {
        console.log(`   ❌ Erro: ${result.error}`);
        failed++;
      } else {
        console.log(`   👁️  Views: ${result.views || 'N/A'}`);
        console.log(`   ❤️  Likes: ${result.likes || 'N/A'}`);
        console.log(`   💬 Comments: ${result.comments || 'N/A'}`);

        if (result.views) totalViews += result.views;
        if (result.likes) totalLikes += result.likes;
        if (result.comments) totalComments += result.comments;
        successful++;
      }
    });

    console.log('\n📊 RESUMO GERAL:');
    console.log('='.repeat(40));
    console.log(`Total de URLs processadas: ${results.length}`);
    console.log(`Sucesso: ${successful}`);
    console.log(`Falhas: ${failed}`);
    console.log(`Total de views: ${totalViews.toLocaleString()}`);
    console.log(`Total de likes: ${totalLikes.toLocaleString()}`);
    console.log(`Total de comentários: ${totalComments.toLocaleString()}`);
    console.log(`Média de views: ${Math.round(totalViews / successful).toLocaleString()}`);
    console.log(`Média de likes: ${Math.round(totalLikes / successful).toLocaleString()}`);

    console.log('\n💾 Resultados salvos em: instagram-metrics-results.json');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await scraper.close();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { InstagramScraper };