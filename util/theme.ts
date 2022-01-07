import { teal } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const appTheme = createTheme({
    palette: {
        primary: teal,
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                // The props to change the default for.
                disableRipple: true, // No more ripple!
            },
        },
    },
});

export default appTheme;
