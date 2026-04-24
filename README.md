# LogLens - Security Log Analysis Dashboard

A SIEM-lite web application that helps SysAdmins analyze Apache/Nginx server logs, detect attacks, and visualize threats in a clean dashboard.

## Live Demo
https://loglensdashborad.netlify.app

## Backend API
https://loglens-api-57cj.onrender.com

## Features

- Secure Login System
- Upload .log files
- Parse Apache/Nginx Logs
- SQL Injection Detection
- XSS Detection
- Directory Traversal Detection
- Brute Force Detection
- Async Queue Processing
- Dashboard Analytics
- GeoIP World Map
- Export CSV
- Export PDF
- Demo Log Loader

## Tech Stack

Frontend:
- React.js
- Axios
- Recharts

Backend:
- Flask
- Python
- Regex

Deployment:
- Netlify
- Render

## Performance Note

Large files are processed in backend async jobs instead of browser memory, improving speed and preventing crashes.

## Run Locally

npm install
npm start

## Author

Suhas Pawar
