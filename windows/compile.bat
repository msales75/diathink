@echo off

cd C:/Users/Mark/Desktop/diathink/app
dir /s /b *.ts | gawk "BEGIN{x=\"\"}{x = x substr($0, 36) \" \"}END{print x}" > temp.txt
set /p FILELIST= < temp.txt
:: echo %FILELIST%
del temp.txt
C:/Users/Mark/AppData/Roaming/npm/tsc --sourcemap %FILELIST%
