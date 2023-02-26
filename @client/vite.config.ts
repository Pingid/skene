import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
const is_docker = !!process.env.IS_DOCKER
console.log(process.env.ENDPOINT_WS)
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.ENDPOINT_WS': `'${process.env.ENDPOINT_WS || 'ws://localhost:3001'}'`,
  },
  server: {
    port: 3000,
    proxy: {
      // '/api': {
      //   target: `http://${is_docker ? 'host.docker.internal' : 'localhost'}:3002`,
      //   changeOrigin: true,
      // },
      '/api': {
        target: 'https://2m70v06vh3.execute-api.eu-west-2.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
