import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  plugins: [react(), tailwindcss()],
});


// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "tailwindcss";

// // https://vite.dev/config/
// export default defineConfig({
//   server: {
//     host: "0.0.0.0",  // Allows access from other devices on the network
//   },
//   plugins: [react()],
//   css: {
//     postcss: {
//       plugins: [tailwindcss],
//     },
//   },
// });
