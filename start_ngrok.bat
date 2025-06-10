@echo off
echo Starting ngrok tunnel for port 3000...
echo.
echo This will create a public URL for your realtime voice app
echo that you can access on your phone.
echo.
echo Keep this window open while testing!
echo.
ngrok http 3000 