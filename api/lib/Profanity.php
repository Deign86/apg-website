<?php
/**
 * Chat profanity censor: masks common English and Filipino swear words as "f***" (first letter kept,
 * same length). Whole words only, case-insensitive, and tolerant of leetspeak (sh1t, @ss) and
 * stretched letters (fuuuck), so ordinary words that contain one (class, assess, Scunthorpe,
 * putahe, leche flan) are left alone.
 */

/** English roots; they also match with common endings (fucking, bitches, shitty). */
const PROFANITY_EN = [
    'fuck', 'fck', 'fuk', 'motherfuck', 'shit', 'bullshit', 'bitch', 'bastard', 'asshole', 'ass', 'dick',
    'cunt', 'pussy', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard', 'wtf', 'stfu',
];

/** Filipino/Tagalog (and Bisaya); a space allows any spacing ("putang ina", "putangina"). */
const PROFANITY_FIL = [
    'putang ina', 'tang ina', 'tangna', 'kingina', 'inamo', 'puta', 'pota', 'gago', 'tanga', 'bobo',
    'ulol', 'ulul', 'leche', 'letse', 'punyeta', 'punyemas', 'tarantado', 'tarantada', 'kupal',
    'pakyu', 'pak yu', 'pakshet', 'kantot', 'jakol', 'burat', 'yawa',
];

/** Letter => characters that stand in for it. */
const PROFANITY_LEET = ['a' => 'a4@', 'e' => 'e3', 'i' => 'i1!', 'o' => 'o0', 's' => 's5$', 't' => 't7'];

function profanityPattern(): string {
    static $pattern = null;
    if ($pattern !== null) {
        return $pattern;
    }
    $word = static function (string $w): string {
        $out = '';
        foreach (str_split($w) as $ch) {
            $out .= $ch === ' ' ? '[\s._-]*' : '[' . preg_quote(PROFANITY_LEET[$ch] ?? $ch, '/') . ']+';
        }
        return $out;
    };
    $en = implode('|', array_map($word, PROFANITY_EN));
    $fil = implode('|', array_map($word, PROFANITY_FIL));
    // "leche flan" is a dessert, not a curse.
    $pattern = '/(?<![\p{L}\p{N}])(?:(?:' . $en . ')(?:e?s|ed|ers?|ing|in|y)?|(?:' . $fil . ')(?:ng)?)(?![\p{L}\p{N}])(?!\s*flan)/iu';
    return $pattern;
}

function censorProfanity(string $text): string {
    $result = preg_replace_callback(profanityPattern(), static function (array $m): string {
        $chars = preg_split('//u', $m[0], -1, PREG_SPLIT_NO_EMPTY);
        $first = array_shift($chars);
        return $first . implode('', array_map(static fn(string $c): string => preg_match('/\s/u', $c) ? $c : '*', $chars));
    }, $text);
    return $result ?? $text; // null only on invalid UTF-8, which callers reject anyway
}
