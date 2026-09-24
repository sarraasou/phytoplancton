import { createVuetify } from 'vuetify'
import * as components   from 'vuetify/components'
import * as directives   from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary:   '#0077b6',
          secondary: '#00b4d8',
          success:   '#67c23a',
          warning:   '#e6a817',
          error:     '#f56c6c',
        }
      }
    }
  }
})