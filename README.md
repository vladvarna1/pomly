# Pomly 🐾 – приложение за Дарси

Лично приложение за Рени и нейния помераниан Дарси. Само на български, без акаунти, без сървър –
всички данни остават в телефона.

## Пускане локално

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # проверка + продукционен build в dist/
npm run icons    # прегенерира PNG иконите от public/icon.svg
```

## Публикуване в Cloudflare Pages (безплатно)

1. Качи проекта в нов GitHub репозиторий (напр. `pomly`).
2. Влез в https://dash.cloudflare.com → **Workers & Pages** → **Create** → таб **Pages** → **Connect to Git**.
3. Избери **GitHub**, разреши достъп и избери репото `pomly`.
4. Настройки на build:
   - **Framework preset:** Vite (или None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Save and Deploy**. След ~1 минута получаваш адрес от вида `https://pomly-xxx.pages.dev`.
6. Всеки `git push` към `main` публикува автоматично нова версия.

## Добавяне към началния екран

- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** менюто ⋮ → *Install app* / *Add to Home screen*.

След първото отваряне приложението работи и без интернет.
