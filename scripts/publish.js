const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Упрощённый скрипт публикации @kirill-kopylov/telegram
 * Публикует только Node.js версию (без browser bundle)
 */

console.log("📦 Starting publication process...\n");

// Шаг 1: Очистка старой сборки
console.log("🧹 Cleaning old build...");
fs.rmSync("dist", { recursive: true, force: true });

// Шаг 2: Компиляция TypeScript
console.log("🔨 Compiling TypeScript...");
const tsc = exec("tsc");

tsc.stdout.on("data", (data) => console.log(data.toString()));
tsc.stderr.on("data", (data) => console.error(data.toString()));

tsc.on("close", (code) => {
    if (code !== 0) {
        console.error("❌ TypeScript compilation failed!");
        process.exit(1);
    }

    console.log("✅ TypeScript compiled successfully\n");

    // Шаг 3: Копирование необходимых файлов в dist/
    console.log("📋 Copying files to dist/...");
    
    try {
        fs.copyFileSync("package.json", "dist/package.json");
        fs.copyFileSync("README.md", "dist/README.md");
        fs.copyFileSync("LICENSE", "dist/LICENSE");
        
        // Создание папки для TL схем если её нет
        fs.mkdirSync("dist/tl/static", { recursive: true });
        
        // Копирование TL файлов
        fs.copyFileSync("gramjs/tl/api.d.ts", "dist/tl/api.d.ts");
        fs.copyFileSync("gramjs/define.d.ts", "dist/define.d.ts");
        fs.copyFileSync("gramjs/tl/static/api.tl", "dist/tl/static/api.tl");
        fs.copyFileSync("gramjs/tl/static/schema.tl", "dist/tl/static/schema.tl");
        
        console.log("✅ Files copied successfully\n");
    } catch (err) {
        console.error("❌ Error copying files:", err.message);
        process.exit(1);
    }

    // Шаг 4: Удаление -BROWSER файлов из dist/
    console.log("🗑️  Removing browser-specific files from dist/...");
    deleteFilesRecursive("dist", "-BROWSER");
    console.log("✅ Browser files removed\n");

    // Шаг 5: Публикация
    console.log("📤 Publishing to npm...");
    console.log("Running: npm publish --access public\n");
    
    const publish = exec("npm publish --access public", { cwd: "dist" });
    
    publish.stdout.on("data", (data) => console.log(data.toString()));
    publish.stderr.on("data", (data) => console.error(data.toString()));
    
    publish.on("close", (code) => {
        if (code === 0) {
            console.log("\n✅ 🎉 Package published successfully!");
            console.log("\n📦 You can now install it with:");
            console.log("   npm install @kirill-kopylov/telegram\n");
        } else {
            console.error("\n❌ Publication failed!");
            console.log("\nTroubleshooting:");
            console.log("1. Make sure you're logged in: npm whoami");
            console.log("2. Check if version was updated in package.json");
            console.log("3. Verify the package name is available\n");
            process.exit(1);
        }
    });
});

/**
 * Рекурсивно удаляет файлы, содержащие указанную подстроку в имени
 */
function deleteFilesRecursive(dir, pattern) {
    if (!fs.existsSync(dir)) return;
    
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        
        if (fs.lstatSync(fullPath).isDirectory()) {
            deleteFilesRecursive(fullPath, pattern);
        } else {
            // Удаляем example файлы
            if (fullPath.includes("example")) {
                fs.unlinkSync(fullPath);
                console.log(`   Deleted: ${fullPath}`);
            }
            // Удаляем -BROWSER файлы
            if (fullPath.includes(pattern)) {
                fs.unlinkSync(fullPath);
                console.log(`   Deleted: ${fullPath}`);
            }
        }
    });
}