"use client"
import {SessionProvider} from "next-auth/react"
import { ThemeProvider } from "@mui/material/styles"
import muiTheme from "@/lib/muiTheme"

const Provider = ({children, session})=>{
    return (
      <SessionProvider session={session}>
        <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
      </SessionProvider>
    )
}
export default Provider