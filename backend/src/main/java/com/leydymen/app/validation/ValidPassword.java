package com.leydymen.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordValidator.class)
@Documented
public @interface ValidPassword {
    String message() default "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character (@#$%^&+=) and be at least 8 characters long";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
