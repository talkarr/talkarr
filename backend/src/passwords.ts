export const validatePassword = (password: string): boolean => {
    // Check if password is at least 8 characters long
    if (password.length < 8) {
        return false;
    }

    // Check if password contains at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check if password contains at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check if password contains at least one digit
    if (!/\d/.test(password)) {
        return false;
    }

    // Check if password contains at least one special character
    const specialCharacters = /[!@#$%^&*(),.?":{}|<>\-_]/;
    if (!specialCharacters.test(password)) {
        return false;
    }

    return true;
};
