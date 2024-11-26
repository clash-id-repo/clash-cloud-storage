# JemPH Cloud Storage

![Image1](https://raw.githubusercontent.com/JemPH/jemph-cloud-storage/refs/heads/main/images/MmDIgUoyYo.png)
![Image2](https://raw.githubusercontent.com/JemPH/jemph-cloud-storage/refs/heads/main/images/BM7hsu6otf.png)
![Image3](https://raw.githubusercontent.com/JemPH/jemph-cloud-storage/refs/heads/main/images/oMzcuXF7bs.png)

A modern and elegant cloud storage solution built with Next.js 14, featuring a beautiful dark/light theme UI and seamless cloud storage integration with LinkToBox. Experience a user-friendly interface and efficient cloud management.

## Features

- 🌓 Beautiful Dark/Light Theme
- 💨 Built with Next.js 14 for optimal performance
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- 🔍 Fast file search functionality
- 📊 Storage usage monitoring
- ⚡ Real-time updates
- 🔄 Multiple cloud drive management
- 🔗 LinkToBox API integration

## Tech Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **UI Components:** Headless UI
- **Icons:** Heroicons, React Icons
- **Animations:** Framer Motion
- **Theme:** next-themes

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/JemPH/jemph-cloud-storage.git
```

2. Install dependencies
```bash
cd jemph-cloud-storage
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

To set up LinkToBox integration:
1. Navigate to `src/config/storage.json`
2. Add your LinkToBox credentials:
```json
{
  "LinkToBox": {
    "email": "your-linktobox-email@example.com",
    "password": "your-linktobox-password"
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Made with ❤️ by JemPH
