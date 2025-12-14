# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## PDF -> Gemini extraction (example)

This project includes a small client flow in `app/(tabs)/reports.tsx` that lets you pick a PDF and send it to a processing proxy. The proxy is an example Node server at `scripts/openai-server.js` that extracts text from PDFs and calls OpenAI's Responses API using `gemini-2.5-flash` to produce structured JSON.

To run the example server locally:

1. Install dependencies for the server (run from project root):

```bash
npm install express body-parser node-fetch pdf-parse
```

2. Set your OpenAI API key in the environment and run the server:

Windows (cmd.exe):
```cmd
set OPENAI_API_KEY=your_key_here
node scripts\openai-server.js
```

macOS / Linux:
```bash
export OPENAI_API_KEY=your_key_here
node scripts/openai-server.js
```

3. In the app, open the Reports tab and use "Pick & Upload PDF". The app sends the PDF as base64 to `http://localhost:3000/process` by default. The server will call Gemini and return a JSON report which the app stores and displays.

Notes:
- This is an example; you should secure the server and add proper error handling for production.
- If you're testing on a physical device or emulator, adjust the proxy URL in `app/utils/reportService.ts` to reach your machine (e.g., use your machine IP or Android emulator host). 
