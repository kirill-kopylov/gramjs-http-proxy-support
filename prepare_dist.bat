@echo off
echo Compiling TypeScript...
call npx tsc
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Copying files to dist...
copy package.json dist\package.json
copy README.md dist\README.md
copy LICENSE dist\LICENSE

mkdir dist\tl\static 2>nul
copy gramjs\tl\static\api.tl dist\tl\static\
copy gramjs\tl\static\schema.tl dist\tl\static\
copy gramjs\tl\api.d.ts dist\tl\
copy gramjs\define.d.ts dist\

echo.
echo Build completed successfully!
echo dist folder is ready for publishing