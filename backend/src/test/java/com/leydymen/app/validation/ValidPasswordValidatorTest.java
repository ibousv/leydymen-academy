package com.leydymen.app.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.validation.ConstraintValidatorContext;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ValidPasswordValidatorTest {
    @InjectMocks
    private ValidPasswordValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new ValidPasswordValidator();
    }

    @Test
    void testValidPassword_Success() {
        String validPassword = "ValidPass123!";

        boolean result = validator.isValid(validPassword, context);

        assertTrue(result);
    }

    @Test
    void testValidPassword_AllCriteria() {
        String validPassword = "MySecurePassword123!@#";

        boolean result = validator.isValid(validPassword, context);

        assertTrue(result);
    }

    @Test
    void testInvalidPassword_TooShort() {
        String shortPassword = "Short1!";

        boolean result = validator.isValid(shortPassword, context);

        assertFalse(result);
    }

    @Test
    void testInvalidPassword_NoUppercase() {
        String noUppercase = "validpass123!";

        boolean result = validator.isValid(noUppercase, context);

        assertFalse(result);
    }

    @Test
    void testInvalidPassword_NoLowercase() {
        String noLowercase = "VALIDPASS123!";

        boolean result = validator.isValid(noLowercase, context);

        assertFalse(result);
    }

    @Test
    void testInvalidPassword_NoDigit() {
        String noDigit = "ValidPass!";

        boolean result = validator.isValid(noDigit, context);

        assertFalse(result);
    }

    @Test
    void testInvalidPassword_NoSpecialChar() {
        String noSpecialChar = "ValidPass123";

        boolean result = validator.isValid(noSpecialChar, context);

        assertFalse(result);
    }

    @Test
    void testValidPassword_Null() {
        boolean result = validator.isValid(null, context);

        assertTrue(result);
    }

    @Test
    void testValidPassword_Empty() {
        String emptyPassword = "";

        boolean result = validator.isValid(emptyPassword, context);

        assertFalse(result);
    }

    @Test
    void testValidPassword_WithSymbols() {
        String passwordWithSymbols = "ValidPass123@#$%";

        boolean result = validator.isValid(passwordWithSymbols, context);

        assertTrue(result);
    }
}
