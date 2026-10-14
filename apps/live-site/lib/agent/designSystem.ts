/**
 * Design System Knowledge Base
 * 
 * Agnostic Design System with Multi-Brand Support
 * CH will use this to answer questions about components, patterns, colors, typography, etc.
 */

/**
 * Color Token Map: Maps token names to hex codes
 * Extracted from Figma variables
 */
export const colorTokenMap: { [tokenName: string]: { hex: string; description?: string } } = {
  // BetOnline colors (primary shades)
  'betRed': { hex: '#ee3536', description: 'BetOnline primary red (betRed/500)' },
  'betRed/50': { hex: '#ffebee', description: 'BetOnline red lightest' },
  'betRed/100': { hex: '#ffcdd3', description: 'BetOnline red very light' },
  'betRed/200': { hex: '#f49a9b', description: 'BetOnline red light' },
  'betRed/300': { hex: '#eb7274', description: 'BetOnline red medium-light' },
  'betRed/400': { hex: '#f75151', description: 'BetOnline red medium' },
  'betRed/500': { hex: '#ee3536', description: 'BetOnline red primary' },
  'betRed/600': { hex: '#ee3535', description: 'BetOnline red medium-dark' },
  'betRed/700': { hex: '#dc2a2f', description: 'BetOnline red dark' },
  'betRed/800': { hex: '#cf2228', description: 'BetOnline red darker' },
  'betRed/900': { hex: '#c0111b', description: 'BetOnline red darkest' },
  
  'betGreen': { hex: '#8ac500', description: 'BetOnline success green (betGreen/500)' },
  'betGreen/50': { hex: '#f2f8e5', description: 'BetOnline green lightest' },
  'betGreen/100': { hex: '#deedbe', description: 'BetOnline green very light' },
  'betGreen/200': { hex: '#c7e294', description: 'BetOnline green light' },
  'betGreen/300': { hex: '#b0d666', description: 'BetOnline green medium-light' },
  'betGreen/400': { hex: '#9cce3f', description: 'BetOnline green medium' },
  'betGreen/500': { hex: '#8ac500', description: 'BetOnline green primary' },
  'betGreen/600': { hex: '#7ab500', description: 'BetOnline green medium-dark' },
  'betGreen/700': { hex: '#63a100', description: 'BetOnline green dark' },
  'betGreen/800': { hex: '#4d8e00', description: 'BetOnline green darker' },
  'betGreen/900': { hex: '#1d6c00', description: 'BetOnline green darkest' },
  
  'betNavy': { hex: '#2d6f88', description: 'BetOnline navy blue (betNavy/500)' },
  'betNavy/50': { hex: '#d6f0ff', description: 'BetOnline navy lightest' },
  'betNavy/100': { hex: '#b2d6e5', description: 'BetOnline navy very light' },
  'betNavy/200': { hex: '#8eb8ca', description: 'BetOnline navy light' },
  'betNavy/300': { hex: '#699aaf', description: 'BetOnline navy medium-light' },
  'betNavy/400': { hex: '#4d849b', description: 'BetOnline navy medium' },
  'betNavy/500': { hex: '#2d6f88', description: 'BetOnline navy primary' },
  'betNavy/600': { hex: '#206177', description: 'BetOnline navy medium-dark' },
  'betNavy/700': { hex: '#104e62', description: 'BetOnline navy dark' },
  'betNavy/800': { hex: '#003b4d', description: 'BetOnline navy darker' },
  'betNavy/900': { hex: '#002736', description: 'BetOnline navy darkest' },
  
  // Tiger Gaming colors
  'TigerOrange': { hex: '#f48e1b', description: 'Tiger Gaming primary orange (TigerOrange/600)' },
  'TigerOrange/50': { hex: '#fef3e1', description: 'Tiger orange lightest' },
  'TigerOrange/100': { hex: '#fde0b4', description: 'Tiger orange very light' },
  'TigerOrange/200': { hex: '#fbcc84', description: 'Tiger orange light' },
  'TigerOrange/300': { hex: '#fab755', description: 'Tiger orange medium-light' },
  'TigerOrange/600': { hex: '#f48e1b', description: 'Tiger orange primary' },
  'TigerOrange/700': { hex: '#ed7e18', description: 'Tiger orange dark' },
  
  'TigerCharcoal': { hex: '#2d2e2c', description: 'Tiger Gaming charcoal (TigerCharcoal/900)' },
  'TigerCharcoal/50': { hex: '#fcfdfa', description: 'Tiger charcoal lightest' },
  'TigerCharcoal/100': { hex: '#f7f8f5', description: 'Tiger charcoal very light' },
  'TigerCharcoal/200': { hex: '#f2f3f0', description: 'Tiger charcoal light' },
  'TigerCharcoal/300': { hex: '#edeeeb', description: 'Tiger charcoal medium-light' },
  'TigerCharcoal/400': { hex: '#cccdca', description: 'Tiger charcoal medium' },
  'TigerCharcoal/500': { hex: '#aeafad', description: 'Tiger charcoal medium-dark' },
  'TigerCharcoal/600': { hex: '#848583', description: 'Tiger charcoal dark' },
  'TigerCharcoal/700': { hex: '#6f706e', description: 'Tiger charcoal darker' },
  'TigerCharcoal/800': { hex: '#4f504e', description: 'Tiger charcoal very dark' },
  'TigerCharcoal/900': { hex: '#2d2e2c', description: 'Tiger charcoal darkest' },
  
  // LowVig colors
  'LowCyan': { hex: '#00e4f2', description: 'LowVig cyan (LowCyan/500)' },
  'LowCyan/50': { hex: '#f0ffff', description: 'LowVig cyan lightest' },
  'LowCyan/100': { hex: '#ceffff', description: 'LowVig cyan very light' },
  'LowCyan/200': { hex: '#a7ffff', description: 'LowVig cyan light' },
  'LowCyan/300': { hex: '#79ffff', description: 'LowVig cyan medium-light' },
  'LowCyan/400': { hex: '#53faff', description: 'LowVig cyan medium' },
  'LowCyan/500': { hex: '#00e4f2', description: 'LowVig cyan primary' },
  'LowCyan/600': { hex: '#00d3df', description: 'LowVig cyan medium-dark' },
  'LowCyan/700': { hex: '#00bbc7', description: 'LowVig cyan dark' },
  'LowCyan/800': { hex: '#00a4b2', description: 'LowVig cyan darker' },
  'LowCyan/900': { hex: '#008c98', description: 'LowVig cyan darkest' },
  
  'LowBrightBlue': { hex: '#0075ff', description: 'LowVig bright blue (LowBrightBlue/500)' },
  'LowBrightBlue/50': { hex: '#c2dfff', description: 'LowVig bright blue lightest' },
  'LowBrightBlue/100': { hex: '#aed4ff', description: 'LowVig bright blue very light' },
  'LowBrightBlue/200': { hex: '#93c6ff', description: 'LowVig bright blue light' },
  'LowBrightBlue/300': { hex: '#70b3ff', description: 'LowVig bright blue medium-light' },
  'LowBrightBlue/400': { hex: '#4099ff', description: 'LowVig bright blue medium' },
  'LowBrightBlue/500': { hex: '#0075ff', description: 'LowVig bright blue primary' },
  'LowBrightBlue/600': { hex: '#0065d9', description: 'LowVig bright blue medium-dark' },
  'LowBrightBlue/700': { hex: '#0056b8', description: 'LowVig bright blue dark' },
  'LowBrightBlue/800': { hex: '#00499d', description: 'LowVig bright blue darker' },
  'LowBrightBlue/900': { hex: '#003e85', description: 'LowVig bright blue darkest' },
  
  'LowDeepBlue': { hex: '#01153d', description: 'LowVig deep blue (LowDeepBlue/500)' },
  'LowDeepBlue/50': { hex: '#7c7899', description: 'LowVig deep blue lightest' },
  'LowDeepBlue/100': { hex: '#5c6487', description: 'LowVig deep blue very light' },
  'LowDeepBlue/200': { hex: '#464b6f', description: 'LowVig deep blue light' },
  'LowDeepBlue/300': { hex: '#2c345b', description: 'LowVig deep blue medium-light' },
  'LowDeepBlue/400': { hex: '#1b254d', description: 'LowVig deep blue medium' },
  'LowDeepBlue/500': { hex: '#01153d', description: 'LowVig deep blue primary' },
  'LowDeepBlue/600': { hex: '#00032f', description: 'LowVig deep blue medium-dark' },
  'LowDeepBlue/700': { hex: '#00001d', description: 'LowVig deep blue dark' },
  'LowDeepBlue/800': { hex: '#000006', description: 'LowVig deep blue darker' },
  'LowDeepBlue/900': { hex: '#000102', description: 'LowVig deep blue darkest' },
  
  // Wild Casino colors
  'WildNeonGreen 2': { hex: '#6cea75', description: 'Wild Casino neon green (WildNeonGreen 2/500)' },
  'WildNeonGreen 2/50': { hex: '#ffffff', description: 'Wild Casino neon green lightest' },
  'WildNeonGreen 2/100': { hex: '#f1fff5', description: 'Wild Casino neon green very light' },
  'WildNeonGreen 2/200': { hex: '#caffd0', description: 'Wild Casino neon green light' },
  'WildNeonGreen 2/300': { hex: '#a3ffaa', description: 'Wild Casino neon green medium-light' },
  'WildNeonGreen 2/400': { hex: '#88f690', description: 'Wild Casino neon green medium' },
  'WildNeonGreen 2/500': { hex: '#6cea75', description: 'Wild Casino neon green primary' },
  'WildNeonGreen 2/600': { hex: '#63db6c', description: 'Wild Casino neon green medium-dark' },
  'WildNeonGreen 2/700': { hex: '#56c65f', description: 'Wild Casino neon green dark' },
  'WildNeonGreen 2/800': { hex: '#4ab454', description: 'Wild Casino neon green darker' },
  'WildNeonGreen 2/900': { hex: '#3a9443', description: 'Wild Casino neon green darkest' },
  
  // High Roller colors
  'HighDarkBlue': { hex: '#080f21', description: 'High Roller dark blue (HighDarkBlue/500)' },
  'HighDarkBlue/50': { hex: '#a5b9e9', description: 'High Roller dark blue lightest' },
  'HighDarkBlue/100': { hex: '#87a1e2', description: 'High Roller dark blue very light' },
  'HighDarkBlue/200': { hex: '#6082d8', description: 'High Roller dark blue light' },
  'HighDarkBlue/300': { hex: '#305bc6', description: 'High Roller dark blue medium-light' },
  'HighDarkBlue/400': { hex: '#1f3a7f', description: 'High Roller dark blue medium' },
  'HighDarkBlue/500': { hex: '#080f21', description: 'High Roller dark blue primary' },
  'HighDarkBlue/600': { hex: '#070d1c', description: 'High Roller dark blue medium-dark' },
  'HighDarkBlue/700': { hex: '#060b18', description: 'High Roller dark blue dark' },
  'HighDarkBlue/800': { hex: '#050914', description: 'High Roller dark blue darker' },
  'HighDarkBlue/900': { hex: '#040811', description: 'High Roller dark blue darkest' },
  
  // SuperSlot colors
  'SuperYellow': { hex: '#ffd020', description: 'SuperSlot yellow (SuperYellow/500)' },
  'SuperYellow/50': { hex: '#ffffee', description: 'SuperSlot yellow lightest' },
  'SuperYellow/100': { hex: '#fff8bf', description: 'SuperSlot yellow very light' },
  'SuperYellow/200': { hex: '#ffec8f', description: 'SuperSlot yellow light' },
  'SuperYellow/300': { hex: '#ffe35b', description: 'SuperSlot yellow medium-light' },
  'SuperYellow/400': { hex: '#fed836', description: 'SuperSlot yellow medium' },
  'SuperYellow/500': { hex: '#ffd020', description: 'SuperSlot yellow primary' },
  'SuperYellow/600': { hex: '#ffc316', description: 'SuperSlot yellow medium-dark' },
  'SuperYellow/700': { hex: '#ffaf10', description: 'SuperSlot yellow dark' },
  'SuperYellow/800': { hex: '#ffa10c', description: 'SuperSlot yellow darker' },
  'SuperYellow/900': { hex: '#ff7f00', description: 'SuperSlot yellow darkest' },
  
  'Supercyan': { hex: '#63fffb', description: 'SuperSlot cyan (Supercyan/500)' },
  'Supercyan/50': { hex: '#daffff', description: 'SuperSlot cyan lightest' },
  'Supercyan/100': { hex: '#bbffff', description: 'SuperSlot cyan very light' },
  'Supercyan/200': { hex: '#9fffff', description: 'SuperSlot cyan light' },
  'Supercyan/300': { hex: '#86ffff', description: 'SuperSlot cyan medium-light' },
  'Supercyan/400': { hex: '#71ffff', description: 'SuperSlot cyan medium' },
  'Supercyan/500': { hex: '#63fffb', description: 'SuperSlot cyan primary' },
  'Supercyan/600': { hex: '#47f4f0', description: 'SuperSlot cyan medium-dark' },
  'Supercyan/700': { hex: '#18e9e6', description: 'SuperSlot cyan dark' },
  'Supercyan/800': { hex: '#00dfdb', description: 'SuperSlot cyan darker' },
  'Supercyan/900': { hex: '#00d4d1', description: 'SuperSlot cyan darkest' },
  
  'SuperOrange': { hex: '#ff6200', description: 'SuperSlot orange (SuperOrange/500)' },
  'SuperOrange/50': { hex: '#ffb458', description: 'SuperSlot orange lightest' },
  'SuperOrange/100': { hex: '#ffa449', description: 'SuperSlot orange very light' },
  'SuperOrange/200': { hex: '#ff943a', description: 'SuperSlot orange light' },
  'SuperOrange/300': { hex: '#ff832a', description: 'SuperSlot orange medium-light' },
  'SuperOrange/400': { hex: '#ff7319', description: 'SuperSlot orange medium' },
  'SuperOrange/500': { hex: '#ff6200', description: 'SuperSlot orange primary' },
  'SuperOrange/600': { hex: '#ea5900', description: 'SuperSlot orange medium-dark' },
  'SuperOrange/700': { hex: '#d55000', description: 'SuperSlot orange dark' },
  'SuperOrange/800': { hex: '#c14700', description: 'SuperSlot orange darker' },
  'SuperOrange/900': { hex: '#ad3f00', description: 'SuperSlot orange darkest' },
  
  'SuperPurple': { hex: '#3d0061', description: 'SuperSlot purple (SuperPurple/500)' },
  'SuperPurple/50': { hex: '#8364c9', description: 'SuperSlot purple lightest' },
  'SuperPurple/100': { hex: '#7551b3', description: 'SuperSlot purple very light' },
  'SuperPurple/200': { hex: '#673f9e', description: 'SuperSlot purple light' },
  'SuperPurple/300': { hex: '#592c89', description: 'SuperSlot purple medium-light' },
  'SuperPurple/400': { hex: '#4b1875', description: 'SuperSlot purple medium' },
  'SuperPurple/500': { hex: '#3d0061', description: 'SuperSlot purple primary' },
  'SuperPurple/600': { hex: '#300054', description: 'SuperSlot purple medium-dark' },
  'SuperPurple/700': { hex: '#240047', description: 'SuperSlot purple dark' },
  'SuperPurple/800': { hex: '#1c003a', description: 'SuperSlot purple darker' },
  'SuperPurple/900': { hex: '#180039', description: 'SuperSlot purple darkest' },
  
  // Semantic colors
  'red': { hex: '#ee3536', description: 'Error/semantic red (red/500)' },
  'red/25': { hex: '#fff3f5', description: 'Red lightest' },
  'red/100': { hex: '#fecdd2', description: 'Red very light' },
  'red/200': { hex: '#ef9a9a', description: 'Red light' },
  'red/300': { hex: '#e57373', description: 'Red medium-light' },
  'red/400': { hex: '#ef5350', description: 'Red medium' },
  'red/500': { hex: '#ee3536', description: 'Red primary' },
  'red/600': { hex: '#e53935', description: 'Red medium-dark' },
  'red/700': { hex: '#d32f2f', description: 'Red dark' },
  'red/800': { hex: '#c62828', description: 'Red darker' },
  'red/900': { hex: '#b71c1c', description: 'Red darkest' },
  
  'orange': { hex: '#ff9800', description: 'Warning/semantic orange (orange/500)' },
  'orange/25': { hex: '#fff8ed', description: 'Orange lightest' },
  'orange/100': { hex: '#ffe0b2', description: 'Orange very light' },
  'orange/200': { hex: '#ffcc80', description: 'Orange light' },
  'orange/300': { hex: '#ffb74d', description: 'Orange medium-light' },
  'orange/400': { hex: '#ffa726', description: 'Orange medium' },
  'orange/500': { hex: '#ff9800', description: 'Orange primary' },
  'orange/600': { hex: '#fb8c00', description: 'Orange medium-dark' },
  'orange/700': { hex: '#f57c00', description: 'Orange dark' },
  'orange/800': { hex: '#ef6c00', description: 'Orange darker' },
  'orange/900': { hex: '#ef6c00', description: 'Orange darkest' },
  
  'green': { hex: '#4caf50', description: 'Success/semantic green (green/500)' },
  'green/25': { hex: '#f7fff7', description: 'Green lightest' },
  'green/100': { hex: '#c8e6c9', description: 'Green very light' },
  'green/200': { hex: '#a5d6a7', description: 'Green light' },
  'green/300': { hex: '#81c784', description: 'Green medium-light' },
  'green/400': { hex: '#66bb6a', description: 'Green medium' },
  'green/500': { hex: '#4caf50', description: 'Green primary' },
  'green/600': { hex: '#43a047', description: 'Green medium-dark' },
  'green/700': { hex: '#388e3c', description: 'Green dark' },
  'green/800': { hex: '#2e7d32', description: 'Green darker' },
  'green/900': { hex: '#1b5e20', description: 'Green darkest' },
  
  // Grey scale (from Figma)
  'grey/50': { hex: '#fafafa', description: 'Lightest grey' },
  'grey/100': { hex: '#f5f5f5', description: 'Very light grey' },
  'grey/200': { hex: '#eeeeee', description: 'Light grey' },
  'grey/300': { hex: '#e0e0e0', description: 'Medium-light grey' },
  'grey/400': { hex: '#bdbdbd', description: 'Medium grey' },
  'grey/500': { hex: '#9e9e9e', description: 'Standard grey' },
  'grey/600': { hex: '#757575', description: 'Medium-dark grey' },
  'grey/700': { hex: '#616161', description: 'Dark grey' },
  'grey/800': { hex: '#424242', description: 'Very dark grey' },
  'grey/900': { hex: '#2d2e2c', description: 'Darkest grey' },
  
  // Text colors
  'text/primary': { hex: '#171a1c', description: 'Primary text color' },
  'text/secondary': { hex: '#32383e', description: 'Secondary text color' },
  'text/tertiary': { hex: '#555e68', description: 'Tertiary text color' },
  'text/icon': { hex: '#636b74', description: 'Icon text color' },
  'text/disabled': { hex: '#00000073', description: 'Disabled text color' },
  
  // Common colors
  'common/white': { hex: '#ffffff', description: 'White' },
  'common/black': { hex: '#000000', description: 'Black' },
  
  // Additional tokens from Figma variables
  'Secondary/600': { hex: '#606f76', description: 'Secondary color 600' },
  'Secondary/400': { hex: '#8f9ca3', description: 'Secondary color 400' },
  'Tertiary/700': { hex: '#3a3e38', description: 'Tertiary color 700' },
  'Gray/700': { hex: '#344054', description: 'Gray color 700' },
  'Neutral/100': { hex: '#f9f9f9', description: 'Neutral color 100' },
  'divider': { hex: '#636b744d', description: 'Divider color (with alpha)' },
  'background/surface': { hex: '#fbfcfe', description: 'Background surface color' },
  
  // Theme text colors (alternative naming)
  'Theme/text/icon': { hex: '#636B74', description: 'Theme text icon color' },
  'Theme/text/primary': { hex: '#171A1C', description: 'Theme text primary color' },
  'Theme/text/secondary': { hex: '#32383E', description: 'Theme text secondary color' },
  'Theme/text/tertiary': { hex: '#555E68', description: 'Theme text tertiary color' },
  
  // Theme common colors (alternative naming)
  'Theme/common/white': { hex: '#FFFFFF', description: 'Theme common white' },
  'Theme/common/black': { hex: '#000000', description: 'Theme common black' },
  
  // Utility colors
  'Utility/BetWhite': { hex: '#FFFFFF', description: 'Utility BetWhite color' },
  'tertiary-bet-white': { hex: '#ffffff', description: 'Tertiary BetOnline white' },
  
  // BetOnline Brand Book - Additional tokens
  'primary/main': { hex: '#ee3536', description: 'BetOnline primary main color' },
  'primary/dark': { hex: '#cf2228', description: 'BetOnline primary dark variant' },
  'primary/contrast': { hex: '#ffffff', description: 'BetOnline primary contrast color (white)' },
  'secondary/main': { hex: '#8ac500', description: 'BetOnline secondary main color (green)' },
  'Terciary/main': { hex: '#104e62', description: 'BetOnline tertiary main color (navy)' },
  'Terciary/contrast': { hex: '#ffffff', description: 'BetOnline tertiary contrast color (white)' },
  
  // BetOnline Text Colors
  'text/white Primary': { hex: '#ffffffde', description: 'BetOnline white text primary (87% opacity)' },
  'text/white Secondary': { hex: '#ffffff91', description: 'BetOnline white text secondary (57% opacity)' },
  'text/white Disabled': { hex: '#ffffff73', description: 'BetOnline white text disabled (45% opacity)' },
  'text/white selected': { hex: '#ffffff14', description: 'BetOnline white text selected state (8% opacity)' },
  
  // BetOnline Background Colors
  'background/whiteTransparent-10': { hex: '#ffffff1a', description: 'BetOnline white transparent background 10% opacity' },
  'background/neutral-grey': { hex: '#f5f5f5', description: 'BetOnline neutral grey background' },
  
  // BetOnline Component Colors
  'components/divider/dividerWhite': { hex: '#ffffff1f', description: 'BetOnline white divider component (12% opacity)' },
  'components/divider/dividerBlack': { hex: '#0000001f', description: 'BetOnline black divider component (12% opacity)' },
  
  // BetOnline Additional Colors
  'White/400-38p': { hex: '#ffffff61', description: 'BetOnline white at 38% opacity' },
  'Neutral Colors/White': { hex: '#FFFFFF', description: 'BetOnline neutral white' },
  'Neutral Colors/800': { hex: '#211F54', description: 'BetOnline neutral color 800' },
  'grey/950': { hex: '#212121', description: 'BetOnline grey 950 (darkest)' },
  
  // BetOnline Toolkit - Product-focused colors
  'background/whiteTransparent-5': { hex: '#ffffff0d', description: 'BetOnline white transparent background 5% opacity' },
  'components/button/inherit white/main': { hex: '#bdbdbd', description: 'BetOnline button inherit white main' },
  'success/contrast': { hex: '#ffffff', description: 'BetOnline success contrast color' },
  'success/main': { hex: '#2e7d32', description: 'BetOnline success main color' },
  'error/main': { hex: '#D32F2F', description: 'BetOnline error main color' },
  'secondary/dark': { hex: '#7ab500', description: 'BetOnline secondary dark variant' },
  'Terciary/dark': { hex: '#003b4d', description: 'BetOnline tertiary dark variant' },
  'action/disabled': { hex: '#9e9e9e', description: 'BetOnline action disabled color' },
  'action/disabledBackground': { hex: '#e0e0e0', description: 'BetOnline action disabled background' },
  'action/active': { hex: '#0000008f', description: 'BetOnline action active state' },
  'primary/focusVisible': { hex: '#ee35364d', description: 'BetOnline primary focus visible (30% opacity)' },
  'secondary/outlinedBorder': { hex: '#8ac50080', description: 'BetOnline secondary outlined border (50% opacity)' },
  'Terciary/outlinedBorder': { hex: '#104e6280', description: 'BetOnline tertiary outlined border (50% opacity)' },
  'secondary/focusVisible': { hex: '#8ac5004d', description: 'BetOnline secondary focus visible (30% opacity)' },
  'Terciary/focusVisible': { hex: '#104e624d', description: 'BetOnline tertiary focus visible (30% opacity)' },
  'primary/hover': { hex: '#ee35360a', description: 'BetOnline primary hover state (4% opacity)' },
  'secondary/hover': { hex: '#8ac5000a', description: 'BetOnline secondary hover state (4% opacity)' },
  'Terciary/hover': { hex: '#104e620a', description: 'BetOnline tertiary hover state (4% opacity)' },
  'text/link-blue': { hex: '#2962ff', description: 'BetOnline text link blue' },
  'text/link': { hex: '#003b4d', description: 'BetOnline text link color' },
  'interactions-bet-red-hover': { hex: '#da2b2c', description: 'BetOnline bet red hover interaction' },
  'Interactions/BetRed Hover': { hex: '#DA2B2C', description: 'BetOnline bet red hover interaction' },
  
  // HomePage colors
  'HomePage/earliestline text': { hex: '#ffffffde', description: 'BetOnline homepage earliest line text' },
  'HomePage/earliestline': { hex: '#2d2e2c', description: 'BetOnline homepage earliest line background' },
  'HomePage/text': { hex: '#000000de', description: 'BetOnline homepage text' },
  'HomePage/cards': { hex: '#f5f5f5', description: 'BetOnline homepage cards background' },
  'HomePage/seo/Contrast': { hex: '#ffffff', description: 'BetOnline homepage SEO contrast' },
  'HomePage/footer/contrast': { hex: '#ffffff', description: 'BetOnline homepage footer contrast' },
  'HomePage/footer/background-transparent': { hex: '#ffffff14', description: 'BetOnline homepage footer background transparent' },
  'HomePage/footer/background': { hex: '#2d2e2c', description: 'BetOnline homepage footer background' },
  'HomePage/background': { hex: '#ffffff', description: 'BetOnline homepage background' },
  
  // VIP/Loyalty colors
  'vip colors/gold': { hex: '#c4af3e', description: 'BetOnline VIP gold color' },
  'secondary-loyalty-gold': { hex: '#c5a047', description: 'BetOnline secondary loyalty gold' },
  'Secondary/Loyalty Gold': { hex: '#C5A047', description: 'BetOnline secondary loyalty gold' },
  'vipLoyalty/gold': { hex: '#dbc448', description: 'BetOnline VIP loyalty gold' },
  'vip colors/bronze': { hex: '#ba701b', description: 'BetOnline VIP bronze color' },
  'vip colors/silver': { hex: '#b4b2b2', description: 'BetOnline VIP silver color' },
  'vip colors/platinum': { hex: '#95acce', description: 'BetOnline VIP platinum color' },
  'vip colors/diamond': { hex: '#71beab', description: 'BetOnline VIP diamond color' },
  'vip colors/elite': { hex: '#a15bc1', description: 'BetOnline VIP elite color' },
  'vip colors/black': { hex: '#7b7b7b', description: 'BetOnline VIP black color' },
  'black-vip/300': { hex: '#e5e5e5', description: 'BetOnline black VIP 300' },
  'black-vip/700': { hex: '#676767', description: 'BetOnline black VIP 700' },
  
  // Sportsbook colors
  'sportbook/live/main': { hex: '#e53935', description: 'BetOnline sportsbook live main' },
  'sportsbook/live/main': { hex: '#e53935', description: 'BetOnline sportsbook live main' },
  'live/main': { hex: '#e53935', description: 'BetOnline live main color' },
  'sports.betonline.ag/Sunglow': { hex: '#FFD72A', description: 'BetOnline sports sunglow color' },
  'sports.betonline.ag/Black': { hex: '#000000', description: 'BetOnline sports black' },
  'SbBlue/600': { hex: '#0087f6', description: 'BetOnline sportsbook blue 600' },
  'SbYellow/300': { hex: '#fcd54c', description: 'BetOnline sportsbook yellow 300' },
  
  // Cashier colors
  'Cashier/method-card/enabled/bkg': { hex: '#fafafa', description: 'BetOnline cashier method card enabled background' },
  'Cashier/method-card/enabled/border': { hex: '#eeeeee', description: 'BetOnline cashier method card enabled border' },
  'Cashier/containers/white-border/bkg': { hex: '#ffffff', description: 'BetOnline cashier containers white border background' },
  'Cashier/containers/white-border/border': { hex: '#eeeeee', description: 'BetOnline cashier containers white border' },
  
  // Component-specific colors
  'components/skeleton/contrast': { hex: '#0000000d', description: 'BetOnline skeleton component contrast' },
  'components/skeleton/white': { hex: '#ffffff17', description: 'BetOnline skeleton component white' },
  'components/skeleton/black': { hex: '#0000000d', description: 'BetOnline skeleton component black' },
  'components/input/outlined/enabledBorder': { hex: '#0000003b', description: 'BetOnline input outlined enabled border' },
  'components/table/contrast/header-bkg': { hex: '#fafafa', description: 'BetOnline table contrast header background' },
  'components/table/contrast/row-bkg': { hex: '#ffffff', description: 'BetOnline table contrast row background' },
  'components/table/white/header-bkg': { hex: '#fafafa', description: 'BetOnline table white header background' },
  'components/table/white/divider': { hex: '#0000000d', description: 'BetOnline table white divider' },
  'components/table/white/enabled/row-bkg': { hex: '#ffffff', description: 'BetOnline table white enabled row background' },
  'components/chip/light': { hex: '#ffffff', description: 'BetOnline chip light color' },
  'components/card/contrast-bkg': { hex: '#ffffff', description: 'BetOnline card contrast background' },
  'components/labels/light mode/main': { hex: '#424242', description: 'BetOnline labels light mode main' },
  'components/labels/light mode/background': { hex: '#f5f5f5', description: 'BetOnline labels light mode background' },
  'components/labels/light mode/light': { hex: '#bdbdbd', description: 'BetOnline labels light mode light' },
  'components/backdrop/fill': { hex: '#0000008f', description: 'BetOnline backdrop fill' },
  'components/arrows/banners/enabled/chevron': { hex: '#ffffff', description: 'BetOnline arrows banners enabled chevron' },
  'components/arrows/banners/enabled/bkg': { hex: '#00000099', description: 'BetOnline arrows banners enabled background' },
  'components/button/iconMenu/forLightMode/icon-bkg': { hex: '#0000008f', description: 'BetOnline button icon menu for light mode icon background' },
  'components/button/Inherit/main': { hex: '#000000', description: 'BetOnline button inherit main' },
  'components/divider/dividerContest': { hex: '#0000001f', description: 'BetOnline divider contest' },
  'Navigation/components-navigation/bkg-header': { hex: '#2d2e2c', description: 'BetOnline navigation header background' },
  'Navigation/components-navigation/bkg-sidemenu-desktop': { hex: '#2d2e2c', description: 'BetOnline navigation side menu desktop background' },
  'Navigation/hub/bkg-hub': { hex: '#212121', description: 'BetOnline navigation hub background' },
  
  // Background colors
  'background/paperElevation1': { hex: '#ffffff', description: 'BetOnline background paper elevation 1' },
  'background/brand': { hex: '#2d2e2c', description: 'BetOnline background brand' },
  'background/blackTransparent-5': { hex: '#0000000d', description: 'BetOnline background black transparent 5%' },
  'background/landing-bkg': { hex: '#f5f5f5', description: 'BetOnline background landing' },
  'background/Page default': { hex: '#ffffff', description: 'BetOnline background page default' },
  
  // Text colors
  'text/text-on-surface-primary': { hex: '#000000de', description: 'BetOnline text on surface primary' },
  'text/text-on-surface-secondary': { hex: '#00000091', description: 'BetOnline text on surface secondary' },
  'text/white': { hex: '#ffffff', description: 'BetOnline text white' },
  'text/white focusVisible': { hex: '#ffffff4d', description: 'BetOnline text white focus visible' },
  'text/footerText': { hex: '#ffffff', description: 'BetOnline text footer' },
  'dark text': { hex: '#212529', description: 'BetOnline dark text' },
  
  // Common/Utility colors
  'common/black/main': { hex: '#000000', description: 'BetOnline common black main' },
  'common/black/outlinedBorder': { hex: '#00000080', description: 'BetOnline common black outlined border' },
  'common/black/disabled': { hex: '#00000073', description: 'BetOnline common black disabled' },
  'common/black/focusVisible': { hex: '#0000004d', description: 'BetOnline common black focus visible' },
  'common/white/selected': { hex: '#ffffff14', description: 'BetOnline common white selected' },
  'common/white/outlinedBorder': { hex: '#ffffff80', description: 'BetOnline common white outlined border' },
  'accents/primary-surface': { hex: '#ffffff', description: 'BetOnline accents primary surface' },
  'color/primary': { hex: '#373742', description: 'BetOnline color primary' },
  'loader-primary': { hex: '#373742', description: 'BetOnline loader primary' },
  
  // Gray scale (additional)
  'gray/10': { hex: '#F5F5F4', description: 'BetOnline gray 10' },
  'gray/30': { hex: '#D8D8D8', description: 'BetOnline gray 30' },
  'gray/40': { hex: '#C1C1C1', description: 'BetOnline gray 40' },
  'gray/60': { hex: '#90918D', description: 'BetOnline gray 60' },
  'gray/70': { hex: '#5B5B5B', description: 'BetOnline gray 70' },
  'gray/80': { hex: '#2D2E2C', description: 'BetOnline gray 80' },
  'gray/90': { hex: '#1C1D1C', description: 'BetOnline gray 90' },
  'white/100%': { hex: '#FFFFFF', description: 'BetOnline white 100%' },
  'white/80%': { hex: '#FFFFFF', description: 'BetOnline white 80%' },
  'clear': { hex: '#FFFFFF', description: 'BetOnline clear' },
  
  // Opacity variants
  'White/50-5%': { hex: '#ffffff0d', description: 'BetOnline white 50 at 5% opacity' },
  'White/500-50p': { hex: '#ffffff80', description: 'BetOnline white 500 at 50% opacity' },
  'Black/50-5%': { hex: '#0000000d', description: 'BetOnline black 50 at 5% opacity' },
  'Black/100-9p': { hex: '#00000017', description: 'BetOnline black 100 at 9% opacity' },
  'Black/300-16p': { hex: '#00000029', description: 'BetOnline black 300 at 16% opacity' },
  'Black/500-50p': { hex: '#00000080', description: 'BetOnline black 500 at 50% opacity' },
  'Black/600-60p': { hex: '#00000099', description: 'BetOnline black 600 at 60% opacity' },
  'White/300-16p': { hex: '#ffffff29', description: 'BetOnline white 300 at 16% opacity' },
  'White/600-60p': { hex: '#ffffff99', description: 'BetOnline white 600 at 60% opacity' },
  
  // Semantic colors
  'success/bkg': { hex: '#f7fff7', description: 'BetOnline success background' },
  'success/light': { hex: '#4caf50', description: 'BetOnline success light' },
  'warning/dark': { hex: '#f57c00', description: 'BetOnline warning dark' },
  'warning/bkg': { hex: '#fff8ed', description: 'BetOnline warning background' },
  'warning/light': { hex: '#ffb74d', description: 'BetOnline warning light' },
  
  // Brand-specific colors
  'www.betonline.ag/Golden Tainoi': { hex: '#FECD55', description: 'BetOnline golden tainoi' },
  'www.betonline.ag/Tree Poppy': { hex: '#F7941E', description: 'BetOnline tree poppy' },
  'www.betonline.ag/Pomegranate': { hex: '#EE3536', description: 'BetOnline pomegranate' },
  'TigerOrange/500': { hex: '#f8991d', description: 'Tiger Gaming orange 500' },
  'Banner color 3': { hex: '#dac96d', description: 'BetOnline banner color 3' },
  'Banner color 4': { hex: '#554906', description: 'BetOnline banner color 4' },
  'Banner Color 2': { hex: '#c4af3e', description: 'BetOnline banner color 2' },
  'blueGrey/200': { hex: '#b0bec5', description: 'BetOnline blue grey 200' },
  'blueGrey/500': { hex: '#607d8b', description: 'BetOnline blue grey 500' },
  'deepPurple/A100': { hex: '#b388ff', description: 'BetOnline deep purple A100' },
  'yellow/600': { hex: '#fdd835', description: 'BetOnline yellow 600' },
  'complementary/80': { hex: '#004357', description: 'BetOnline complementary 80' },
  'secondary/50': { hex: '#8BC400', description: 'BetOnline secondary 50' },
  'primary/50': { hex: '#EE3536', description: 'BetOnline primary 50' },
  'Utility/Black': { hex: '#1C1D1C', description: 'BetOnline utility black' },
  'stake.com/White': { hex: '#FFFFFF', description: 'Stake.com white' },
  'black': { hex: '#000000', description: 'BetOnline black' },
}

export interface BrandColors {
  primary?: string[]
  secondary?: string[]
  accent?: string[]
  neutral?: string[]
  background?: string[]
  semantic?: {
    success?: string
    warning?: string
    error?: string
    info?: string
  }
}

export interface BrandInfo {
  name: string
  description?: string
  colors?: BrandColors
  // Brand-specific overrides for shared components
  componentOverrides?: {
    [componentName: string]: {
      description?: string
      usage?: string
      variants?: string[]
    }
  }
}

export interface DesignSystemInfo {
  // Shared/Base Design Tokens
  colors?: {
    primary?: string[]
    secondary?: string[]
    neutral?: string[]
    semantic?: {
      success?: string
      warning?: string
      error?: string
      info?: string
    }
  }
  
  // Typography
  typography?: {
    fontFamilies?: {
      primary?: string
      secondary?: string
      mono?: string
    }
    scales?: {
      heading?: string[]
      body?: string[]
    }
    weights?: {
      light?: number
      regular?: number
      medium?: number
      semibold?: number
      bold?: number
    }
    lineHeights?: {
      tight?: number
      normal?: number
      relaxed?: number
    }
    tokens?: {
      [tokenName: string]: {
        fontFamily: string
        fontWeight: string
        fontSize: string
        lineHeight: string
        letterSpacing: string
        textDecoration?: string
        textCase?: string
        description?: string
      }
    }
  }
  
  // Spacing
  spacing?: {
    scale?: number[]
    unit?: 'px' | 'rem' | 'em'
    grid?: {
      columns?: number
      gutter?: number
      margin?: number
    }
  }
  
  // Border Radius
  borderRadius?: {
    none?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
    full?: string
  }
  
  // Shadows
  shadows?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    tokens?: {
      [tokenName: string]: {
        value: string
        type: string
        description?: string
      }
    }
  }
  
  // Components (Shared across brands)
  components?: {
    [key: string]: {
      description?: string
      usage?: string
      variants?: string[]
      props?: string[]
      examples?: string[]
    }
  }
  
  // Patterns
  patterns?: {
    [key: string]: {
      description?: string
      whenToUse?: string
      examples?: string[]
      brandSpecific?: {
        [brandName: string]: {
          description?: string
          examples?: string[]
        }
      }
    }
  }
  
  // Brands
  brands?: {
    [brandName: string]: BrandInfo
  }
  
  // Principles
  principles?: string[]
  
  // Goals & Vision
  goals?: string[]
  vision?: string
  
  // Areas/Products
  areas?: {
    [areaName: string]: {
      description?: string
      commonComponents?: string[]
      designPatterns?: string[]
      brand?: string
    }
  }
}

// Agnostic Design System with Multi-Brand Support
// Based on MUI v5.15.0 - v5.14.12
// This is a comprehensive structure that supports multiple brands (Casino, Sports, Loyalty, etc.)
// while maintaining shared design tokens and components
export const designSystem: DesignSystemInfo = {
  // Shared color system (base tokens)
  colors: {
    primary: [
      // Common primary colors used across brands
      'betRed', 'betGreen', 'betNavy',
      'TigerOrange', 'TigerCharcoal',
      'LowCyan', 'LowBrightBlue', 'LowDeepBlue',
      'WildNeonGreen 2',
      'HighDarkBlue',
      'SuperYellow', 'Supercyan', 'SuperOrange', 'SuperPurple'
    ],
    secondary: [
      // Secondary brand colors
      'betGreen', 'betNavy'
    ],
    neutral: [
      // Grey scale colors
      'grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400',
      'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'
    ],
    semantic: {
      success: 'betGreen',
      warning: 'orange',
      error: 'red',
      info: 'LowBrightBlue',
    },
  },
  
  // Typography system
  typography: {
    fontFamilies: {
      primary: 'Inter',
      secondary: 'Open Sans',
      mono: 'monospace',
    },
    scales: {
      heading: [
        'Display xs',
        'Material UI/typography/h5',
        'Text xl',
        'Text lg'
      ],
      body: [
        'Body/Bold/Body 4',
        'Material UI/typography/body2',
        'Material UI/typography/caption',
        'Material UI/button/large',
        'Material UI/button/medium',
        'Material UI/button/small'
      ],
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
    // Typography tokens extracted from Figma variables
    tokens: {
      'Display xs/Regular': {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: '24px',
        lineHeight: '32px',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Display extra small, regular weight',
      },
      'Display xs/Medium': {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: '24px',
        lineHeight: '32px',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Display extra small, medium weight',
      },
      'Text xl/Regular': {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: '20px',
        lineHeight: '30px',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Text extra large, regular weight',
      },
      'Text lg / Medium underlined': {
        fontFamily: 'Inter',
        fontWeight: '500',
        fontSize: '18px',
        lineHeight: '28px',
        letterSpacing: '0',
        textDecoration: 'underline',
        textCase: 'none',
        description: 'Text large, medium weight, underlined',
      },
      'typography/xl3/600 | 1.5': {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: '30px',
        lineHeight: '1.5',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Typography extra large 3, semi bold, line height 1.5',
      },
      'body-xs': {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: '12px',
        lineHeight: '1.66',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Body extra small, semi bold',
      },
      'body-sm': {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '1.42',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Body small, regular weight',
      },
      // BetOnline Brand Book typography tokens
      'Special Headings/Display 5': {
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: '110px',
        lineHeight: '120px',
        letterSpacing: '-3px',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline special heading display 5 - large display text',
      },
      'Desktop/Heading/Bold/H1 40px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '40px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop heading H1, bold, 40px',
      },
      'Text Single/100/Regular': {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: '16px',
        lineHeight: '18px',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline text single, regular weight, 16px',
      },
      'Text Single/100/Bold': {
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: '16px',
        lineHeight: '18px',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline text single, bold weight, 16px',
      },
      // BetOnline Toolkit - Desktop Typography (Product-focused)
      'Desktop/Heading/Bold/H2 36px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '36px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H2, bold, 36px',
      },
      'Desktop/Heading/Bold/H3 32px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '32px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H3, bold, 32px',
      },
      'Desktop/Heading/Bold/H4 24px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '24px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H4, bold, 24px',
      },
      'Desktop/Heading/Bold/H5 20px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '20px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H5, bold, 20px',
      },
      'Desktop/Heading/Bold/H6 18px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '18px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H6, bold, 18px',
      },
      'Desktop/Heading/Bold/H7 16px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '16px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H7, bold, 16px',
      },
      'Desktop/Heading/SemiBold/H1 40px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '40px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H1, semi-bold, 40px',
      },
      'Desktop/Heading/SemiBold/H2 36px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '36px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H2, semi-bold, 36px',
      },
      'Desktop/Heading/SemiBold/H3 32px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '32px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H3, semi-bold, 32px',
      },
      'Desktop/Heading/SemiBold/H4 24px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '24px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H4, semi-bold, 24px',
      },
      'Desktop/Heading/SemiBold/H5 20px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '20px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H5, semi-bold, 20px',
      },
      'Desktop/Heading/SemiBold/H6 18px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '18px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H6, semi-bold, 18px',
      },
      'Desktop/Heading/SemiBold/H7 16px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H7, semi-bold, 16px',
      },
      'Desktop/Heading/Regular/H1 40px': {
        fontFamily: 'Open Sans',
        fontWeight: '400',
        fontSize: '40px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H1, regular, 40px',
      },
      'Desktop/Heading/Regular/H2 36px': {
        fontFamily: 'Open Sans',
        fontWeight: '400',
        fontSize: '36px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop H2, regular, 36px',
      },
      'Desktop/Body/SemiBold/B2 16px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '1.47',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop body, semi-bold, 16px',
      },
      'Desktop/Body/Regular/B3 14px': {
        fontFamily: 'Open Sans',
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '1.47',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop body, regular, 14px',
      },
      'Desktop/Body/Regular/B2 16px': {
        fontFamily: 'Open Sans',
        fontWeight: '400',
        fontSize: '16px',
        lineHeight: '1.47',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline desktop body, regular, 16px',
      },
      // BetOnline Toolkit - Mobile Typography (Product-focused)
      'Mobile/Heading/Bold/H1 32px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '32px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H1, bold, 32px',
      },
      'Mobile/Heading/Bold/H2 28px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '28px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H2, bold, 28px',
      },
      'Mobile/Heading/Bold/H3 24px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '24px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H3, bold, 24px',
      },
      'Mobile/Heading/Bold/H4 20px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '20px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H4, bold, 20px',
      },
      'Mobile/Heading/Bold/H5 18px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '18px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H5, bold, 18px',
      },
      'Mobile/Heading/Bold/H6 16px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '16px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H6, bold, 16px',
      },
      'Mobile/Heading/Bold/H7 14px': {
        fontFamily: 'Open Sans',
        fontWeight: '700',
        fontSize: '14px',
        lineHeight: '1.32',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile H7, bold, 14px',
      },
      'Mobile/Body/SemiBold/B2 16px': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '1.47',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile body, semi-bold, 16px',
      },
      'Mobile/Body/Regular/B3 14px': {
        fontFamily: 'Open Sans',
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '1.47',
        letterSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
        description: 'BetOnline mobile body, regular, 14px',
      },
      // Material UI component typography
      'Material UI/datePicker/currentMonth': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '1.5',
        letterSpacing: '0.15',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Material UI date picker current month',
      },
      'Material UI/alert/title': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '16px',
        lineHeight: '1.5',
        letterSpacing: '0.15',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Material UI alert title',
      },
      'Material UI/alert/description': {
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: '14px',
        lineHeight: '1.43',
        letterSpacing: '0.15',
        textDecoration: 'none',
        textCase: 'none',
        description: 'Material UI alert description',
      },
    },
  },
  
  // Spacing system
  spacing: {
    scale: [2, 4, 7, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96], // Includes BetOnline brand book and toolkit tokens
    unit: 'px',
    grid: {
      columns: 12,
      gutter: 16,
      margin: 24,
    },
  },
  
  // Border radius tokens
  borderRadius: {
    none: '0',
    sm: '4px', // borderRadius-1
    md: '8px', // borderRadius-2, BetOnline brand book token
    lg: '12px', // borderRadius-3, Sportsbook-26
    xl: '16px', // borderRadius-4, Sportsbook-26
    '2xl': '40px', // borderRadius-9, Sportsbook-26
    full: '9999px',
  },
  
  // Shadow tokens (Elevation system)
  shadows: {
    sm: 'elevation/1, --joy-shadow-xs',
    md: 'elevation/2, elevation/4, --joy-shadow-sm, --joy-shadow-md',
    lg: 'elevation/8, elevation/16, --joy-shadow-lg',
    xl: 'elevation/24, --joy-shadow-xl',
    // Shadow tokens extracted from Figma variables
    tokens: {
      'elevation/3': {
        value: 'DROP_SHADOW: #00000033 (0,3) r3 s-2; DROP_SHADOW: #00000024 (0,3) r4; DROP_SHADOW: #0000001F (0,1) r8',
        type: 'multi-layer',
        description: 'Sportsbook-26 elevation token with three shadow layers',
      },
      '--joy-shadow-xs': {
        value: '0px 1px 2px 0px rgba(21, 21, 21, 0.08)',
        type: 'dropShadow',
        description: 'Extra small shadow for Joy UI components',
      },
      '--joy-shadow-sm': {
        value: '0px 2px 4px 0px rgba(21, 21, 21, 0.08), 0px 1px 2px 0px rgba(21, 21, 21, 0.08)',
        type: 'dropShadow',
        description: 'Small shadow for Joy UI components',
      },
      '--joy-shadow-md': {
        value: '0px 6px 12px -2px rgba(21, 21, 21, 0.08), 0px 2px 8px -2px rgba(21, 21, 21, 0.08)',
        type: 'dropShadow',
        description: 'Medium shadow for Joy UI components',
      },
      '--joy-shadow-lg': {
        value: '0px 12px 16px -4px rgba(21, 21, 21, 0.08), 0px 2px 8px -2px rgba(21, 21, 21, 0.08)',
        type: 'dropShadow',
        description: 'Large shadow for Joy UI components',
      },
      '--joy-shadow-xl': {
        value: '0px 20px 24px -4px rgba(21, 21, 21, 0.08), 0px 2px 8px -2px rgba(21, 21, 21, 0.08)',
        type: 'dropShadow',
        description: 'Extra large shadow for Joy UI components',
      },
      'elevation/5': {
        value: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)',
        type: 'dropShadow',
        description: 'Elevation level 5 shadow',
      },
    },
  },
  
  // Shared components (work across all brands)
  components: {
    Button: {
      description: 'Primary action component with multiple variants',
      usage: 'Use for primary actions, navigation, and user interactions',
      variants: ['large', 'medium', 'small'],
      props: ['variant', 'size', 'color', 'disabled', 'fullWidth'],
      examples: ['Material UI/button/large', 'Material UI/button/medium', 'Material UI/button/small'],
    },
    Alert: {
      description: 'Alert component for notifications and messages',
      usage: 'Display important information, warnings, or errors',
      variants: ['title small', 'description'],
      props: ['severity', 'title', 'description', 'action'],
      examples: ['Material UI/alert/title small', 'Material UI/alert/description'],
    },
    Table: {
      description: 'Data table component for structured data display',
      usage: 'Display tabular data with sorting and filtering',
      variants: ['header', 'row', 'cell'],
      props: ['columns', 'rows', 'sortable', 'filterable'],
      examples: ['Material UI/table/header'],
    },
    Navigation: {
      description: 'Navigation component for site navigation, headers, and side menus',
      usage: 'Use for main site navigation, header navigation, side menu navigation, and navigation hubs',
      variants: ['header', 'side menu', 'desktop', 'mobile', 'hub'],
      props: ['variant', 'items', 'activeItem', 'collapsed', 'theme'],
      examples: [
        'Navigation/components-navigation/bkg-header',
        'Navigation/components-navigation/bkg-sidemenu-desktop',
        'Navigation/hub/bkg-hub'
      ],
    },
    Typography: {
      description: 'Text component with semantic variants',
      usage: 'Display text content with consistent styling',
      variants: ['h5', 'body2', 'caption'],
      props: ['variant', 'component', 'color', 'align'],
      examples: ['Material UI/typography/h5', 'Material UI/typography/body2', 'Material UI/typography/caption'],
    },
    'Betting Slip': {
      description: 'Sportsbook betting slip component for managing bets',
      usage: 'Display and manage user bets, odds, and bet totals',
      variants: ['standard', 'quick bet', 'bet builder'],
      props: ['bets', 'odds', 'total', 'stake', 'potentialWin'],
      examples: ['Sportsbook betting slip', 'Quick bet slip', 'Bet builder slip'],
    },
    'Odds Display': {
      description: 'Component for displaying betting odds',
      usage: 'Show odds for sports events, markets, and selections',
      variants: ['decimal', 'fractional', 'american', 'live'],
      props: ['odds', 'format', 'isLive', 'change'],
      examples: ['Decimal odds', 'Fractional odds', 'American odds', 'Live odds'],
    },
    'Sports Event Card': {
      description: 'Card component for displaying sports events',
      usage: 'Show sports event information, teams, odds, and betting options',
      variants: ['compact', 'detailed', 'live'],
      props: ['event', 'teams', 'odds', 'isLive', 'markets'],
      examples: ['Event card compact', 'Event card detailed', 'Live event card'],
    },
    'Bet Builder': {
      description: 'Component for building custom multi-selection bets',
      usage: 'Allow users to combine multiple selections into a single bet',
      variants: ['standard', 'quick'],
      props: ['selections', 'odds', 'stake', 'potentialWin'],
      examples: ['Bet builder standard', 'Bet builder quick'],
    },
    'Live Betting': {
      description: 'Component for live/in-play betting features',
      usage: 'Display live betting options, in-play odds, and live event updates',
      variants: ['live odds', 'live event', 'cash out'],
      props: ['isLive', 'odds', 'event', 'cashOutValue'],
      examples: ['Live odds display', 'Live event view', 'Cash out component'],
    },
  },
  
  // Design patterns
  patterns: {
    'Action States': {
      description: 'Interactive states for components (hover, active, selected, disabled, focus)',
      whenToUse: 'Apply to all interactive components for consistent user feedback',
      examples: ['action/active', 'action/hover', 'action/selected', 'action/disabled', 'action/focus'],
    },
    'Text Hierarchy': {
      description: 'Text color system for content hierarchy',
      whenToUse: 'Use to establish visual hierarchy in text content',
      examples: ['text/primary', 'text/secondary', 'text/tertiary', 'text/icon', 'text/disabled', 'text/white Primary'],
    },
    'Background Elevation': {
      description: 'Background colors for different elevation levels',
      whenToUse: 'Use to create depth and hierarchy in layouts',
      examples: [
        'background/surface',
        'background/Page default',
        'background/paperElevation0',
        'background/paperElevation2',
        'background/paperElevation16',
        'background/paperElevation24'
      ],
    },
  },
  
  // Brand-specific configurations
  brands: {
    Casino: {
      name: 'Casino',
      description: 'Casino brand design system with vibrant colors and gaming-focused components',
      colors: {
        primary: ['betRed', 'betGreen', 'betNavy'],
        secondary: ['betGreen', 'betNavy'],
        accent: ['betRed'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    Sports: {
      name: 'Sports',
      description: 'Sports betting brand design system',
      colors: {
        primary: ['betRed', 'betGreen', 'betNavy'],
        secondary: ['betGreen'],
        accent: ['betRed'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    Loyalty: {
      name: 'Loyalty',
      description: 'Loyalty and rewards brand design system with VIP tier colors',
      colors: {
        primary: ['betRed', 'betGreen', 'betNavy'],
        secondary: ['betGreen'],
        accent: ['betRed'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
      componentOverrides: {
        Button: {
          description: 'Loyalty brand uses VIP tier colors for special actions',
          usage: 'VIP tier buttons use brand-specific color palettes',
          variants: ['black vip', 'bronze vip', 'diamond vip', 'elite vip', 'gold vip', 'platinum vip', 'silver vip'],
        },
      },
    },
    Authentication: {
      name: 'Authentication',
      description: 'Authentication and account management brand design system',
      colors: {
        primary: ['betRed', 'betGreen', 'betNavy'],
        secondary: ['betGreen'],
        accent: ['betRed'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    Poker: {
      name: 'Poker',
      description: 'Poker gaming brand design system',
      colors: {
        primary: ['betRed', 'betGreen', 'betNavy'],
        secondary: ['betGreen'],
        accent: ['betRed'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    // Additional brands from Figma
    BetOnline: {
      name: 'BetOnline',
      description: 'BetOnline brand with red, green, and navy color palette',
      colors: {
        primary: ['betRed', 'betGreen', 'betNavy'],
        secondary: ['betGreen', 'betNavy'],
        accent: ['betRed'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    Tigergaming: {
      name: 'Tigergaming',
      description: 'Tiger Gaming brand with orange and charcoal colors',
      colors: {
        primary: ['TigerOrange', 'TigerCharcoal'],
        secondary: ['TigerCharcoal'],
        accent: ['TigerOrange'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    LowVig: {
      name: 'LowVig',
      description: 'LowVig brand with cyan and blue color palette',
      colors: {
        primary: ['LowCyan', 'LowBrightBlue', 'LowDeepBlue'],
        secondary: ['LowBrightBlue', 'LowDeepBlue'],
        accent: ['LowCyan'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    'Wild Casino': {
      name: 'Wild Casino',
      description: 'Wild Casino brand with neon green accent',
      colors: {
        primary: ['WildNeonGreen 2'],
        secondary: ['betGreen'],
        accent: ['WildNeonGreen 2'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
        background: ['grey-900', 'grey-800', 'common/black'], // Dark backgrounds for Wild Casino
      },
    },
    'High Roller': {
      name: 'High Roller',
      description: 'High Roller brand with dark blue color palette',
      colors: {
        primary: ['HighDarkBlue'],
        secondary: ['betNavy'],
        accent: ['HighDarkBlue'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
    SuperSlot: {
      name: 'SuperSlot',
      description: 'SuperSlot brand with vibrant yellow, cyan, orange, and purple colors',
      colors: {
        primary: ['SuperYellow', 'Supercyan', 'SuperOrange', 'SuperPurple'],
        secondary: ['Supercyan', 'SuperOrange'],
        accent: ['SuperYellow', 'SuperPurple'],
        neutral: ['grey-50', 'grey-100', 'grey-200', 'grey-300', 'grey-400', 'grey-500', 'grey-600', 'grey-700', 'grey-800', 'grey-900'],
      },
    },
  },
  
  // Product areas
  areas: {
    Sports: {
      description: 'Sports betting area with live odds, betting slips, and sports-specific components',
      commonComponents: ['Button', 'Table', 'Alert', 'Typography'],
      designPatterns: ['Action States', 'Text Hierarchy', 'Background Elevation'],
      brand: 'Sports',
    },
    Casino: {
      description: 'Casino gaming area with game tiles, slots, table games, and casino-specific components',
      commonComponents: ['Button', 'Alert', 'Typography'],
      designPatterns: ['Action States', 'Text Hierarchy', 'Background Elevation'],
      brand: 'Casino',
    },
    Loyalty: {
      description: 'Loyalty and rewards area with VIP tiers, points, rewards, and loyalty-specific components',
      commonComponents: ['Button', 'Alert', 'Typography'],
      designPatterns: ['Action States', 'Text Hierarchy', 'Background Elevation'],
      brand: 'Loyalty',
    },
    Authentication: {
      description: 'Authentication and account management area with login, registration, and profile components',
      commonComponents: ['Button', 'Alert', 'Typography'],
      designPatterns: ['Action States', 'Text Hierarchy', 'Background Elevation'],
      brand: 'Authentication',
    },
    Poker: {
      description: 'Poker gaming area with poker tables, hand displays, and poker-specific components',
      commonComponents: ['Button', 'Table', 'Alert', 'Typography'],
      designPatterns: ['Action States', 'Text Hierarchy', 'Background Elevation'],
      brand: 'Poker',
    },
  },
  
  // Design principles
  principles: [
    'Agnostic design system that works across multiple brands',
    'Shared design tokens with brand-specific customizations',
    'Consistent elevation and shadow system',
    'Accessible color contrast and text hierarchy',
    'Component-based architecture with MUI v5.15.0',
    'Responsive design patterns',
    'Action state consistency across all interactive elements',
  ],
  
  // Goals & Vision
  goals: [
    'Create a unified design system that supports multiple brands',
    'Maintain consistency while allowing brand-specific customization',
    'Enable rapid development with reusable components',
    'Ensure accessibility and usability across all brands',
    'Support scalable design token system',
  ],
  vision: 'An agnostic design system that empowers multiple brands to maintain their unique identity while sharing core design principles, components, and patterns. Built on MUI v5.15.0, our system provides flexibility and consistency across all product areas.',
}

/**
 * Get response based on design system knowledge
 * Handles agnostic design system with multi-brand support
 */
export function getDesignSystemResponse(query: string, system: DesignSystemInfo = designSystem): string {
  const lowerQuery = query.toLowerCase()
  
  // Brand-specific queries
  const brandNames = [
    'casino', 'sports', 'loyalty', 'authentication', 'poker', 'auth',
    'betonline', 'tigergaming', 'lowvig', 'wild casino', 'high roller', 'superslot',
    'vip', 'black vip', 'bronze vip', 'diamond vip', 'elite vip', 'gold vip', 'platinum vip', 'silver vip'
  ]
  const mentionedBrand = brandNames.find(brand => lowerQuery.includes(brand))
  
  // Normalize brand name for lookup
  const normalizeBrandName = (brand: string | undefined): string | undefined => {
    if (!brand) return undefined
    const brandMap: { [key: string]: string } = {
      'casino': 'Casino',
      'sports': 'Sports',
      'loyalty': 'Loyalty',
      'authentication': 'Authentication',
      'auth': 'Authentication',
      'poker': 'Poker',
      'betonline': 'BetOnline',
      'tigergaming': 'Tigergaming',
      'lowvig': 'LowVig',
      'wild casino': 'Wild Casino',
      'high roller': 'High Roller',
      'superslot': 'SuperSlot',
    }
    return brandMap[brand.toLowerCase()] || brand.charAt(0).toUpperCase() + brand.slice(1)
  }
  
  // Area-specific queries
  const areaNames = ['sports', 'casino', 'loyalty', 'authentication', 'poker', 'auth']
  const mentionedArea = areaNames.find(area => lowerQuery.includes(area))
  
  // Color queries (including British spelling "colour" and "pallete" typo)
  if (lowerQuery.includes('color') || lowerQuery.includes('colour') || lowerQuery.includes('palette') || lowerQuery.includes('pallete') || lowerQuery.includes('primary') || lowerQuery.includes('secondary')) {
    // Check for specific color token queries (e.g., "what's betRed", "betRed color")
    const colorTokenMatch = Object.keys(colorTokenMap).find(token => 
      lowerQuery.includes(token.toLowerCase().replace(/\s+/g, '').replace(/\//g, ''))
    )
    
    if (colorTokenMatch) {
      const colorInfo = colorTokenMap[colorTokenMatch]
      const figmaLink = 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh'
      return `The color token \`${colorTokenMatch}\` has hex code ${colorInfo.hex}. ${colorInfo.description || ''}\n\nCOLOR_SWATCH:${colorTokenMatch}:${colorInfo.hex}:${colorInfo.description || ''}:${figmaLink}`
    }
    
    // Brand-specific color query - check for brand names in query
    const brandInQuery = mentionedBrand || 
      (lowerQuery.includes('wild casino') || lowerQuery.includes('wildcasino') ? 'Wild Casino' : null) ||
      (lowerQuery.includes('betonline') || lowerQuery.includes('bol') ? 'BetOnline' : null) ||
      (lowerQuery.includes('tiger') ? 'Tiger Gaming' : null) ||
      (lowerQuery.includes('lowvig') ? 'LowVig' : null) ||
      (lowerQuery.includes('high roller') ? 'High Roller' : null) ||
      (lowerQuery.includes('superslot') ? 'SuperSlot' : null)
    
    if (brandInQuery) {
      const normalizedBrand = normalizeBrandName(brandInQuery)
      if (normalizedBrand && system.brands?.[normalizedBrand]?.colors) {
        const brand = system.brands[normalizedBrand]
        const colors = brand.colors
        let response = `${brand.name} brand colors:\n\n`
        
        const figmaLink = 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh'
        
        if (colors?.primary?.length) {
          response += `**Primary Colors:**\n`
          colors.primary.forEach(token => {
            const displayToken = token.includes('/') ? token : `${token}/500`
            const colorInfo = colorTokenMap[displayToken] || colorTokenMap[token] || colorTokenMap[token.split('/')[0]] || { hex: 'N/A', description: '' }
            response += `• Token: \`${displayToken}\` | Hex: \`${colorInfo.hex}\` | ${colorInfo.description || 'Primary color'}\n`
            response += `COLOR_SWATCH:${displayToken}:${colorInfo.hex}:${colorInfo.description || brand.name + ' primary color'}:${figmaLink}\n`
          })
        }
        
        if (colors?.secondary?.length) {
          response += `\n**Secondary Colors:**\n`
          colors.secondary.forEach(token => {
            const displayToken = token.includes('/') ? token : `${token}/500`
            const colorInfo = colorTokenMap[displayToken] || colorTokenMap[token] || colorTokenMap[token.split('/')[0]] || { hex: 'N/A', description: '' }
            response += `• Token: \`${displayToken}\` | Hex: \`${colorInfo.hex}\` | ${colorInfo.description || 'Secondary color'}\n`
            response += `COLOR_SWATCH:${displayToken}:${colorInfo.hex}:${colorInfo.description || brand.name + ' secondary color'}:${figmaLink}\n`
          })
        }
        
        if (colors?.accent?.length) {
          response += `\n**Accent Colors:**\n`
          colors.accent.forEach(token => {
            const colorInfo = colorTokenMap[token] || { hex: 'N/A', description: '' }
            response += `• Token: \`${token}\` | Hex: \`${colorInfo.hex}\` | ${colorInfo.description || 'Accent color'}\n`
            response += `COLOR_SWATCH:${token}:${colorInfo.hex}:${colorInfo.description || ''}\n`
          })
        }
        
        return response.trim()
      }
    }
    
    // Primary color query (general) - when asking specifically about "primary color"
    if (lowerQuery.includes('primary') && !mentionedBrand) {
      // Default to shared primary or first brand's primary
      const defaultPrimary = system.colors?.primary?.[0] || system.brands?.Casino?.colors?.primary?.[0] || 'betRed'
      const colorInfo = colorTokenMap[defaultPrimary] || { hex: '#DC143C', description: 'Primary brand color' }
      return `**Primary Color:**\n\n• **Token:** \`${defaultPrimary}\`\n• **Hex:** \`${colorInfo.hex}\`\n• **Description:** ${colorInfo.description || 'Primary brand color'}\n\nCOLOR_SWATCH:${defaultPrimary}:${colorInfo.hex}:${colorInfo.description || 'Primary brand color'}`
    }
    
    // Shared/base colors
    if (system.colors?.primary?.length) {
      let response = `**Shared Primary Colors:**\n\n`
      system.colors.primary.slice(0, 5).forEach(token => {
        const colorInfo = colorTokenMap[token] || { hex: 'N/A', description: '' }
        response += `• Token: \`${token}\` | Hex: \`${colorInfo.hex}\` | ${colorInfo.description || 'Primary color'}\n`
        response += `COLOR_SWATCH:${token}:${colorInfo.hex}:${colorInfo.description || ''}\n`
      })
      if (system.colors.primary.length > 5) {
        response += `\n...and ${system.colors.primary.length - 5} more primary colors.`
      }
      return response.trim()
    }
    return "I can help you with colors! Our design system supports shared base colors and brand-specific color palettes. What specific color question do you have?"
  }
  
  // Typography queries
  if (lowerQuery.includes('font') || lowerQuery.includes('typography') || lowerQuery.includes('text') || lowerQuery.includes('type')) {
    if (system.typography?.fontFamilies?.primary) {
      let response = `We use ${system.typography.fontFamilies.primary} as our primary font. `
      if (system.typography.fontFamilies.secondary) response += `Secondary font: ${system.typography.fontFamilies.secondary}. `
      if (system.typography.fontFamilies.mono) response += `Monospace: ${system.typography.fontFamilies.mono}. `
      if (system.typography.scales?.heading?.length) {
        response += `Heading styles: ${system.typography.scales.heading.join(', ')}. `
      }
      if (system.typography.scales?.body?.length) {
        response += `Body styles: ${system.typography.scales.body.join(', ')}. `
      }
      if (system.typography.weights) {
        response += `Font weights: Light (${system.typography.weights.light}), Regular (${system.typography.weights.regular}), Medium (${system.typography.weights.medium}), SemiBold (${system.typography.weights.semibold}), Bold (${system.typography.weights.bold}). `
      }
      return response.trim()
    }
    return "Typography is important! Our agnostic design system uses shared typography tokens that work across all brands. What do you need to know about our type system?"
  }
  
  // Component queries
  if (lowerQuery.includes('component') || lowerQuery.includes('button') || lowerQuery.includes('input') || lowerQuery.includes('card') || lowerQuery.includes('form')) {
    const componentName = Object.keys(system.components || {}).find(key => 
      lowerQuery.includes(key.toLowerCase())
    )
    
    if (componentName && system.components?.[componentName]) {
      const comp = system.components[componentName]
      let response = `${componentName}: ${comp.description || 'Available component'}. `
      if (comp.usage) response += `Usage: ${comp.usage}. `
      if (comp.variants?.length) response += `Variants: ${comp.variants.join(', ')}. `
      
      // Check for brand-specific overrides
      if (mentionedBrand) {
        const normalizedBrand = normalizeBrandName(mentionedBrand)
        if (normalizedBrand && system.brands?.[normalizedBrand]?.componentOverrides?.[componentName]) {
          const override = system.brands[normalizedBrand].componentOverrides?.[componentName]
          if (override?.description) response += `${normalizedBrand} override: ${override.description}. `
        }
      }
      
      return response.trim()
    }
    
    // Generic component response
    const componentCount = Object.keys(system.components || {}).length
    if (componentCount > 0) {
      return `I can help with components! We have ${componentCount} shared components that work across all brands. Which component are you looking for? ${Object.keys(system.components || {}).slice(0, 5).join(', ')}${componentCount > 5 ? '...' : ''}`
    }
    return "I can help with components! Our agnostic design system includes shared components that work across all brands (Casino, Sports, Loyalty, etc.). Which component are you looking for?"
  }
  
  // Spacing queries
  if (lowerQuery.includes('spacing') || lowerQuery.includes('margin') || lowerQuery.includes('padding') || lowerQuery.includes('gap')) {
    if (system.spacing?.scale?.length) {
      let response = `Our spacing scale uses a base unit of 4px: ${system.spacing.scale.join('px, ')}px. `
      if (system.spacing.grid) {
        response += `Grid system: ${system.spacing.grid.columns || 12} columns, ${system.spacing.grid.gutter || 16}px gutter, ${system.spacing.grid.margin || 24}px margin. `
      }
      return response.trim()
    }
    return "We follow a consistent spacing system across all brands with a base unit of 4px. What spacing question do you have?"
  }
  
  // Border radius queries
  if (lowerQuery.includes('radius') || lowerQuery.includes('rounded') || lowerQuery.includes('corner')) {
    if (system.borderRadius) {
      const radii = Object.entries(system.borderRadius)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      return `Border radius tokens: ${radii}.`
    }
    return "We use consistent border radius tokens across all components. What do you need to know?"
  }
  
  // Shadow queries
  if (lowerQuery.includes('shadow') || lowerQuery.includes('elevation')) {
    if (system.shadows) {
      let response = "We use a comprehensive elevation system: "
      response += `Small: ${system.shadows.sm}. `
      response += `Medium: ${system.shadows.md}. `
      response += `Large: ${system.shadows.lg}. `
      response += `Extra Large: ${system.shadows.xl}. `
      response += "Elevation levels range from elevation/1 to elevation/24, with Material UI shadow tokens (--joy-shadow-xs to --joy-shadow-xl). These provide consistent depth and hierarchy across all brands."
      return response.trim()
    }
    return "We use a consistent shadow system for elevation. What shadow question do you have?"
  }
  
  // Pattern queries
  if (lowerQuery.includes('pattern') || lowerQuery.includes('layout')) {
    const patternName = Object.keys(system.patterns || {}).find(key => 
      lowerQuery.includes(key.toLowerCase())
    )
    if (patternName && system.patterns?.[patternName]) {
      const pattern = system.patterns[patternName]
      let response = `${patternName}: ${pattern.description || 'Available pattern'}. `
      if (pattern.whenToUse) response += `Use when: ${pattern.whenToUse}. `
      
      // Brand-specific pattern info
      if (mentionedBrand) {
        const normalizedBrand = normalizeBrandName(mentionedBrand)
        if (normalizedBrand && pattern.brandSpecific?.[normalizedBrand]) {
          const brandPattern = pattern.brandSpecific[normalizedBrand]
          if (brandPattern.description) response += `${normalizedBrand} specific: ${brandPattern.description}. `
        }
      }
      
      return response.trim()
    }
    
    const patternCount = Object.keys(system.patterns || {}).length
    if (patternCount > 0) {
      return `I can help with design patterns! We have ${patternCount} patterns. ${Object.keys(system.patterns || {}).slice(0, 5).join(', ')}${patternCount > 5 ? '...' : ''}`
    }
    return "I can help with design patterns! Our patterns work across all brands with brand-specific adaptations. What pattern are you looking for?"
  }
  
  // Area/Product queries
  if (mentionedArea && system.areas?.[mentionedArea.charAt(0).toUpperCase() + mentionedArea.slice(1)]) {
    const area = system.areas[mentionedArea.charAt(0).toUpperCase() + mentionedArea.slice(1)]
    let response = `${area.description || mentionedArea} area. `
    if (area.brand) response += `Uses ${area.brand} brand. `
    if (area.commonComponents?.length) response += `Common components: ${area.commonComponents.join(', ')}. `
    if (area.designPatterns?.length) response += `Design patterns: ${area.designPatterns.join(', ')}. `
    return response.trim()
  }
  
  // Brand queries
  if (mentionedBrand) {
    const normalizedBrand = normalizeBrandName(mentionedBrand)
    if (normalizedBrand && system.brands?.[normalizedBrand]) {
      const brand = system.brands[normalizedBrand]
      let response = `${brand.name} brand: ${brand.description || 'Brand-specific design system'}. `
      if (brand.colors?.primary?.length) response += `Primary colors: ${brand.colors.primary.join(', ')}. `
      if (brand.colors?.secondary?.length) response += `Secondary colors: ${brand.colors.secondary.join(', ')}. `
      if (brand.colors?.accent?.length) response += `Accent colors: ${brand.colors.accent.join(', ')}. `
      return response.trim()
    }
  }
  
  // VIP tier queries
  if (lowerQuery.includes('vip')) {
    return "VIP tiers use special color palettes: black vip, bronze vip, diamond vip, elite vip, gold vip, platinum vip, silver vip. These are used in the Loyalty brand for VIP-specific components and buttons."
  }
  
  // Agnostic/system queries
  if (lowerQuery.includes('agnostic') || lowerQuery.includes('system') || lowerQuery.includes('how does') || lowerQuery.includes('how do')) {
    let response = "Our design system is agnostic and supports multiple brands (Casino, Sports, Loyalty, Authentication, Poker). "
    response += "We use shared design tokens (colors, typography, spacing) as a base, with brand-specific overrides where needed. "
    response += "Components and patterns work across all brands with brand-specific customizations. "
    if (system.brands && Object.keys(system.brands).length > 0) {
      response += `Supported brands: ${Object.keys(system.brands).join(', ')}. `
    }
    return response.trim()
  }
  
  // Goals/Vision queries
  if (lowerQuery.includes('goal') || lowerQuery.includes('vision') || lowerQuery.includes('principle')) {
    if (system.goals?.length) {
      return `Our goals: ${system.goals.join(', ')}. ${system.vision ? `Vision: ${system.vision}` : ''}`
    }
    if (system.principles?.length) {
      return `Our design principles: ${system.principles.join(', ')}.`
    }
    return "I can help explain our design goals, vision, and principles. What would you like to know?"
  }
  
  // List all brands
  if (lowerQuery.includes('brand') && (lowerQuery.includes('list') || lowerQuery.includes('what') || lowerQuery.includes('which'))) {
    if (system.brands && Object.keys(system.brands).length > 0) {
      const brandList = Object.values(system.brands).map(b => b.name).join(', ')
      return `Our design system supports these brands: ${brandList}. Each brand can have its own color palette and component overrides while sharing the base design tokens. Built on MUI v5.15.0.`
    }
    return "We support multiple brands: Casino, Sports, Loyalty, Authentication, Poker, BetOnline, Tigergaming, LowVig, Wild Casino, High Roller, and SuperSlot. Each brand can customize colors and components while using shared design tokens."
  }
  
  // MUI queries
  if (lowerQuery.includes('mui') || lowerQuery.includes('material ui')) {
    return "Our design system is built on Material UI (MUI) v5.15.0 - v5.14.12. We use MUI components as a base and extend them with our agnostic design tokens and brand-specific customizations. Components include Button, Alert, Table, Typography, and more."
  }
  
  // Default response
  return "I'm here to help with our agnostic design system! Ask me about colors, typography, components, spacing, patterns, brands (Casino, Sports, Loyalty, etc.), areas, or our design principles. Our system works across multiple brands with shared tokens and brand-specific customizations."
}
