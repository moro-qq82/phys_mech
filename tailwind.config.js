/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // カスタムカラーがあれば追加
      },
      spacing: {
        // カスタムスペーシングがあれば追加
      },
      borderRadius: {
        // カスタム角丸があれば追加
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
