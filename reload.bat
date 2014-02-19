@echo off

set IPADDR=127.0.0.1
set PROJECTDIR=C:/Users/Mark/Desktop/diathink
set TEMPDIR=C:/Users/Mark/temp
set APACHECONF=C:/wamp/bin/apache/apache2.2.22/conf/httpd.conf
set ESPRESSODIR=Espresso
set CHROME=C:/Users/Mark/AppData/Local/Google/Chrome/Application/chrome.exe
:: set APACHECONF=C:\Users\Mark\Desktop\diathink\test.out

cd %PROJECTDIR%

node "Espresso/bin/espresso.js" build

:: if we're running in ad-hoc network
:: set IPADDR=169.254.159.249
:: optional test to see if we're already running ad-hoc network
:: ipconfig /all | grep 169.254 | wc > "%TEMPDIR%/ipnum.txt"

ls -rt "%PROJECTDIR%/build/" | tail -1 > "%TEMPDIR%/buildnum.txt"

set /p BNUM=<"%TEMPDIR%/buildnum.txt"
set WEBPATH=%PROJECTDIR%/build/%BNUM%

echo Using web-root path: %WEBPATH%
echo USING IP Address %IPADDR%
echo USING apache config: %APACHECONF%

%CHROME% http://%IPADDR%/%BNUM%/

:: awk "{sub(\"{DIRECTORY}\",\"%WEBPATH%\",$0); sub(\"{IPADDRESS}\",\"%IPADDR%\"); print $0}" < "%PROJECTDIR%/httpd-template.conf"  > "%APACHECONF%"

:: C:\wamp\bin\apache\apache2.2.22\bin\httpd -n wampapache -k restart

:: C:/Users/Mark/Desktop/diathink/CPAU -u Administrator -p SbiJ4urT -ex "C:\wamp\bin\apache\apache2.2.22\bin\httpd -n wampapache -k restart" -lwp

