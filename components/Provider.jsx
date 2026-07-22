"use client"
import {SessionProvider} from "next-auth/react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import { ThemeModeProvider, useThemeMode } from "@/lib/ThemeContext"
import { getMuiTheme } from "@/lib/muiTheme"

function MuiThemeBridge({ children }) {
    const { theme } = useThemeMode()
    return <MuiThemeProvider theme={getMuiTheme(theme)}>{children}</MuiThemeProvider>
}

const Provider = ({children, session})=>{
    return (
      <SessionProvider session={session}>
        <ThemeModeProvider>
          <MuiThemeBridge>{children}</MuiThemeBridge>
        </ThemeModeProvider>
      </SessionProvider>
    )
}
export default Provider