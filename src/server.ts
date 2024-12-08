import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const PORT = 5100;

app.use(cors());

const WORLDOMETER_URL = 'https://www.worldometers.info/';

const fetchPopulation = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(WORLDOMETER_URL);

        await page.waitForSelector('.rts-counter[rel="current_population"]');

        const population = await page.$eval('.rts-counter[rel="current_population"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        const birthsYear = await page.$eval('.rts-counter[rel="births_this_year"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        const birthsToday = await page.$eval('.rts-counter[rel="births_today"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        const deathsYear = await page.$eval('.rts-counter[rel="dth1s_this_year"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        const deathsToday = await page.$eval('.rts-counter[rel="dth1s_today"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        const netPopulationGrowthYear = await page.$eval('.rts-counter[rel="absolute_growth_year"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        const netPopulationGrowthToday = await page.$eval('.rts-counter[rel="absolute_growth"]', (element) => {
            const parts = Array.from(element.querySelectorAll('.rts-nr-int')).map((el) => el.textContent?.trim());
            return parts.join('');
        });

        await browser.close();

        return {
            population,
            birthsYear,
            birthsToday,
            deathsYear,
            deathsToday,
            netPopulationGrowthYear,
            netPopulationGrowthToday
        };
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        return null;
    }
};

app.get('/population', async (req: Request, res: Response) => {
    const population = await fetchPopulation();

    if (population) {
        res.json(population);
    } else {
        res.status(500).json({ error: 'Не удалось получить данные о населении' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен: http://0.0.0.0:${PORT}`);
});

