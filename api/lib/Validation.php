<?php
/**
 * Field validators for public form input. Each returns a short user-facing message, or null when the
 * value is valid; input is trimmed first. Client mirror: src/lib/formValidation.ts (keep the rules
 * and messages identical). Email format stays with filter_var(FILTER_VALIDATE_EMAIL) at each caller.
 */

function validationNameError(string $value): ?string {
    $v = trim($value);
    if ($v === '') {
        return 'Name is required.';
    }
    $len = mb_strlen($v);
    if ($len < 2) {
        return 'Name must be at least 2 characters.';
    }
    if ($len > 100) {
        return 'Name must be 100 characters or fewer.';
    }
    if (preg_match("/^[\\p{L}\\p{M} .'\u{2019}-]+$/u", $v) !== 1) {
        return 'Name can only contain letters, spaces, periods, apostrophes and hyphens.';
    }
    if (preg_match_all('/\p{L}/u', $v) < 2) {
        return 'Name must contain at least 2 letters.';
    }
    return null;
}

function validationPhoneError(string $value, bool $required = true): ?string {
    $v = trim($value);
    if ($v === '') {
        return $required ? 'Phone number is required.' : null;
    }
    if (preg_match('/^[\d\s+().-]+$/', $v) !== 1) {
        return 'Phone number can only contain digits, spaces, +, (, ), - and periods.';
    }
    if (strrpos($v, '+') > 0) {
        return 'A + is only allowed at the start of the phone number.';
    }
    $digits = strlen(preg_replace('/\D/', '', $v));
    if ($digits < 7 || $digits > 15) {
        return 'Phone number must have 7 to 15 digits.';
    }
    return null;
}

function validationTextError(string $value, string $label, bool $required, int $min, int $max): ?string {
    $v = trim($value);
    if ($v === '') {
        return $required ? "{$label} is required." : null;
    }
    $len = mb_strlen($v);
    if ($len < $min) {
        return "{$label} must be at least {$min} characters.";
    }
    if ($len > $max) {
        return "{$label} must be {$max} characters or fewer.";
    }
    return null;
}

function validationUrlError(string $value, bool $required = false): ?string {
    $v = trim($value);
    if ($v === '') {
        return $required ? 'URL is required.' : null;
    }
    if (mb_strlen($v) > 500) {
        return 'URL must be 500 characters or fewer.';
    }
    $scheme = strtolower((string)parse_url($v, PHP_URL_SCHEME));
    $host = (string)parse_url($v, PHP_URL_HOST);
    if (!in_array($scheme, ['http', 'https'], true) || !str_contains($host, '.') || filter_var($v, FILTER_VALIDATE_URL) === false) {
        return 'Enter a valid URL starting with http:// or https://.';
    }
    return null;
}
