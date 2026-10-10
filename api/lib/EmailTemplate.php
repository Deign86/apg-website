<?php
/**
 * Branded transactional email layout, one theme per enterprise (matching each enterprise website).
 *
 * Tokens, three layers: brand primitives (email-themes.php) -> semantic roles (page, surface, text,
 * muted, accent, border) -> component styles resolved inline below, because email clients ignore CSS
 * variables and most <style> rules. Layout is table-based for Outlook/Gmail; web fonts load where the
 * client supports them (Apple Mail, iOS) and fall back to the stacks elsewhere.
 *
 * Device dark/light mode:
 * - `color-scheme: only light|only dark` asks Apple Mail / Outlook to keep the design as is.
 * - The Gmail apps force-invert email colours in dark mode and offer no opt-out, so the brand header
 *   (logo on the enterprise's band, accent line) is one embedded PNG, which Gmail never recolours.
 *   The body stays real text: Gmail may invert it, but it inverts it consistently, so it stays
 *   readable (half-protecting backgrounds would leave inverted text on un-inverted cards).
 * - Images are embedded (cid:) so they never depend on an image proxy fetching them.
 */

const EMAIL_SITE = 'https://alphapremiergroup.com';
const EMAIL_LOGO_CID = 'brand-logo';
const EMAIL_HEADER_CID = 'brand-header';
const EMAIL_WIDTH = 600;

function emailEsc($value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Theme for a canonical enterprise slug (resolveEnterpriseSlug()); unknown slugs get the corporate theme. */
function emailTheme(string $slug): array {
    $themes = require __DIR__ . '/email-themes.php';
    return ($themes[$slug] ?? $themes['corporate']) + ['slug' => isset($themes[$slug]) ? $slug : 'corporate'];
}

function emailBg(string $color): string {
    return "background-color:$color;";
}

/** A label/value row; $valueHtml must already be escaped (use emailEsc / emailLink). */
function emailRow(string $label, string $valueHtml): array {
    return [$label, $valueHtml];
}

function emailLink(string $href, string $text, array $t): string {
    return '<a href="' . emailEsc($href) . '" style="color:' . $t['link'] . ';text-decoration:underline;text-underline-offset:2px;">' . emailEsc($text) . '</a>';
}

/**
 * Renders a full email.
 * $o keys (all optional except title):
 *   preheader  inbox preview text
 *   eyebrow    small label above the title (e.g. "New property inquiry")
 *   title      main heading (plain text)
 *   subtitle   line under the title (plain text)
 *   badge      [text, 'good'|'warn'|'neutral'] pill next to the eyebrow (e.g. ATS score)
 *   intro      paragraph (plain text; blank lines become paragraphs)
 *   rows       list of emailRow()
 *   quote      [label, plain text] highlighted block (visitor message, cover note)
 *   sections   list of [heading, html] extra blocks (html already escaped)
 *   actions    list of [label, href, 'primary'|'secondary']
 *   note       small print under the actions (plain text)
 *   ref        reference / ticket id
 */
function emailRender(array $t, array $o): string {
    $r = $t['radius'];
    $font = $t['bodyFont'];
    $heading = $t['headingFont'];
    $scheme = $t['mode'] === 'dark' ? 'only dark' : 'only light';
    $headCase = $t['headingUpper'] ? 'text-transform:uppercase;letter-spacing:0.04em;' : 'letter-spacing:-0.01em;';
    $label = 'font-size:12px;line-height:1.3;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;';
    $p = 'margin:0 0 14px;font-size:15px;line-height:1.6;color:' . $t['text'] . ';';

    $html = '<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" style="color-scheme:' . $scheme . ';"><head>'
        . '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="color-scheme" content="' . $scheme . '">'
        . '<meta name="supported-color-schemes" content="' . $scheme . '">'
        . '<title>' . emailEsc($o['title']) . '</title>'
        . ($t['fontsUrl'] ? '<link href="' . emailEsc($t['fontsUrl']) . '" rel="stylesheet">' : '')
        . '<style>:root{color-scheme:' . $scheme . ';supported-color-schemes:' . $scheme . ';}'
        . 'body{margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}'
        . '@media (max-width:620px){.apg-pad{padding-left:22px!important;padding-right:22px!important;}'
        . '.apg-row td{display:block!important;width:auto!important;}.apg-row td+td{padding-top:0!important;}.apg-btn{display:block!important;margin:0 0 10px!important;}}</style>'
        . '</head><body style="margin:0;padding:0;' . emailBg($t['pageBg']) . '">';

    if (!empty($o['preheader'])) {
        $html .= '<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">'
            . emailEsc($o['preheader']) . str_repeat('&#8204;&nbsp;', 40) . '</span>';
    }

    $html .= '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="' . emailBg($t['pageBg']) . '">'
        . '<tr><td align="center" style="padding:32px 12px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:' . EMAIL_WIDTH . 'px;">';

    if (emailHeaderAttachment($t) !== null) {
        // Header as one image (logo + band + accent line): no client recolours it.
        $html .= '<tr><td style="padding:0;font-size:0;line-height:0;">'
            . '<a href="' . emailEsc($t['url']) . '" style="text-decoration:none;">'
            . '<img src="cid:' . EMAIL_HEADER_CID . '" width="' . EMAIL_WIDTH . '" alt="' . emailEsc($t['name']) . '"'
            . ' style="display:block;width:100%;max-width:' . EMAIL_WIDTH . 'px;height:auto;border:0;outline:none;font-family:' . $font . ';font-size:16px;font-weight:700;color:' . $t['text'] . ';"></a>'
            . '</td></tr>';
    } else {
        // Fallback (no GD on the server): HTML header with the embedded logo.
        $html .= '<tr><td style="' . emailBg($t['headerBg']) . 'border-radius:' . $r . 'px ' . $r . 'px 0 0;padding:26px 32px;" class="apg-pad" align="left">'
            . '<a href="' . emailEsc($t['url']) . '" style="text-decoration:none;">'
            . '<img src="cid:' . EMAIL_LOGO_CID . '" width="' . (int)$t['logoWidth'] . '" alt="' . emailEsc($t['name']) . '"'
            . ' style="display:block;border:0;outline:none;height:auto;max-width:' . (int)$t['logoWidth'] . 'px;font-family:' . $font . ';font-size:16px;font-weight:700;color:' . $t['headerText'] . ';"></a>'
            . '</td></tr>'
            . '<tr><td style="height:3px;line-height:3px;font-size:0;' . emailBg($t['accent']) . '">&nbsp;</td></tr>';
    }

    // Body card.
    $html .= '<tr><td class="apg-pad" style="' . emailBg($t['surface']) . 'border:1px solid ' . $t['border'] . ';border-top:0;border-radius:0 0 ' . $r . 'px ' . $r . 'px;padding:34px 36px 30px;font-family:' . $font . ';color:' . $t['text'] . ';">';

    if (!empty($o['eyebrow']) || !empty($o['badge'])) {
        $html .= '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;"><tr>';
        if (!empty($o['eyebrow'])) {
            $html .= '<td style="' . $label . 'color:' . $t['accentInk'] . ';padding-right:10px;white-space:nowrap;">' . emailEsc($o['eyebrow']) . '</td>';
        }
        if (!empty($o['badge'])) {
            [$text, $tone] = $o['badge'];
            $tones = ['good' => ['#DCFCE7', '#166534'], 'warn' => ['#FEF3C7', '#92400E'], 'neutral' => [$t['soft'], $t['muted']]];
            [$bg, $fg] = $tones[$tone] ?? $tones['neutral'];
            $html .= '<td><span style="display:inline-block;padding:3px 10px;border-radius:999px;' . emailBg($bg) . 'color:' . $fg
                . ';font-size:12px;line-height:1.4;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;">' . emailEsc($text) . '</span></td>';
        }
        $html .= '</tr></table>';
    }

    $html .= '<h1 style="margin:0;font-family:' . $heading . ';font-size:24px;line-height:1.25;font-weight:' . $t['headingWeight'] . ';color:' . $t['heading'] . ';' . $headCase . '">'
        . emailEsc($o['title']) . '</h1>';
    if (!empty($o['subtitle'])) {
        $html .= '<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:' . $t['muted'] . ';">' . emailEsc($o['subtitle']) . '</p>';
    }

    $html .= '<div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>';

    if (!empty($o['intro'])) {
        foreach (preg_split('/\n{2,}/', trim($o['intro'])) as $para) {
            $html .= '<p style="' . $p . '">' . nl2br(emailEsc($para)) . '</p>';
        }
    }

    if (!empty($o['rows'])) {
        $html .= '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px;border-top:1px solid ' . $t['border'] . ';">';
        foreach ($o['rows'] as [$rowLabel, $value]) {
            $html .= '<tr class="apg-row">'
                . '<td valign="top" style="width:34%;padding:11px 12px 11px 0;border-bottom:1px solid ' . $t['border'] . ';font-size:13px;line-height:1.5;color:' . $t['muted'] . ';">' . emailEsc($rowLabel) . '</td>'
                . '<td valign="top" style="padding:11px 0;border-bottom:1px solid ' . $t['border'] . ';font-size:15px;line-height:1.5;color:' . $t['text'] . ';overflow-wrap:anywhere;">' . $value . '</td>'
                . '</tr>';
        }
        $html .= '</table>';
    }

    if (!empty($o['quote'])) {
        [$quoteLabel, $quoteText] = $o['quote'];
        $html .= '<div style="' . $label . 'color:' . $t['muted'] . ';margin:0 0 8px;">' . emailEsc($quoteLabel) . '</div>'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr>'
            . '<td style="width:3px;' . emailBg($t['accent']) . 'border-radius:2px;"></td>'
            . '<td style="' . emailBg($t['soft']) . 'padding:14px 16px;font-size:15px;line-height:1.6;color:' . $t['text'] . ';overflow-wrap:anywhere;">'
            . nl2br(emailEsc($quoteText)) . '</td></tr></table>';
    }

    foreach ($o['sections'] ?? [] as [$sectionHeading, $sectionHtml]) {
        $html .= '<div style="' . $label . 'color:' . $t['muted'] . ';margin:0 0 8px;">' . emailEsc($sectionHeading) . '</div>'
            . '<div style="margin:0 0 22px;font-size:15px;line-height:1.6;color:' . $t['text'] . ';">' . $sectionHtml . '</div>';
    }

    if (!empty($o['actions'])) {
        $html .= '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px;"><tr><td>';
        foreach ($o['actions'] as [$actionLabel, $href, $kind]) {
            $primary = $kind === 'primary';
            $html .= '<a class="apg-btn" href="' . emailEsc($href) . '" style="display:inline-block;margin:0 10px 10px 0;padding:12px 22px;border-radius:' . $t['buttonRadius'] . 'px;'
                . 'font-family:' . $font . ';font-size:14px;line-height:1.2;font-weight:700;text-decoration:none;text-align:center;'
                . ($primary
                    ? emailBg($t['accent']) . 'color:' . $t['accentText'] . ';border:1px solid ' . $t['accent'] . ';'
                    : emailBg($t['surface']) . 'color:' . $t['accentInk'] . ';border:1px solid ' . $t['accentInk'] . ';')
                . ($t['buttonUpper'] ? 'text-transform:uppercase;letter-spacing:0.06em;font-size:13px;' : '')
                . '">' . emailEsc($actionLabel) . '</a>';
        }
        $html .= '</td></tr></table>';
    }

    if (!empty($o['note'])) {
        $html .= '<p style="margin:14px 0 0;font-size:13px;line-height:1.55;color:' . $t['muted'] . ';">' . nl2br(emailEsc($o['note'])) . '</p>';
    }
    $html .= '</td></tr>';

    // Footer.
    $html .= '<tr><td class="apg-pad" style="padding:22px 36px 0;font-family:' . $font . ';font-size:12px;line-height:1.6;color:' . $t['footerText'] . ';text-align:center;">'
        . '<strong style="color:' . $t['footerStrong'] . ';font-weight:600;">' . emailEsc($t['name']) . '</strong>'
        . ($t['tagline'] !== '' ? ' &middot; ' . emailEsc($t['tagline']) : '') . '<br>'
        . 'Unit 3104, PSE Centre Tektite East Tower, Exchange Road, Ortigas Center, Pasig City<br>'
        . '<a href="' . emailEsc($t['url']) . '" style="color:' . $t['footerText'] . ';text-decoration:underline;">' . emailEsc(preg_replace('#^https?://#', '', $t['url'])) . '</a>'
        . (!empty($o['ref']) ? ' &middot; <span style="font-variant-numeric:tabular-nums;">Ref ' . emailEsc($o['ref']) . '</span>' : '')
        . '</td></tr>';

    return $html . '</table></td></tr></table></body></html>';
}

/**
 * The theme logo as an inline (cid:) attachment, resized to 2x its display width so emails stay light.
 * Resized copies are cached in the temp dir; without GD the original file is embedded.
 */
function emailLogoAttachment(array $t): ?array {
    $root = function_exists('webRootDir') ? webRootDir() : dirname(__DIR__, 2);
    $source = $root . '/' . ltrim($t['logo'], '/');
    if (!is_file($source)) {
        return null;
    }
    $file = $source;
    $width = (int)$t['logoWidth'] * 2;
    if (function_exists('imagecreatefrompng') && str_ends_with(strtolower($source), '.png')) {
        $cached = sys_get_temp_dir() . '/apg-email-logo-' . md5($source . filemtime($source) . $width) . '.png';
        if (!is_file($cached)) {
            $img = @imagecreatefrompng($source);
            if ($img !== false && imagesx($img) > $width) {
                $scaled = imagescale($img, $width, -1, IMG_BICUBIC);
                if ($scaled !== false) {
                    imagealphablending($scaled, false);
                    imagesavealpha($scaled, true);
                    imagepng($scaled, $cached . '.tmp', 9) && rename($cached . '.tmp', $cached);
                    imagedestroy($scaled);
                }
            }
            if ($img !== false) {
                imagedestroy($img);
            }
        }
        if (is_file($cached)) {
            $file = $cached;
        }
    }
    return ['path' => $file, 'name' => $t['slug'] . '-logo.png', 'type' => 'image/png', 'cid' => EMAIL_LOGO_CID];
}

/**
 * The brand header as one PNG (cid:): logo on the header band with rounded top corners and the accent
 * line, drawn at 2x for sharp phone screens. Images are the one thing the Gmail apps' dark mode never
 * recolours. Cached per theme in the temp dir; null without GD (emailRender then uses the HTML header).
 */
function emailHeaderAttachment(array $t): ?array {
    static $memo = [];
    if (array_key_exists($t['slug'], $memo)) {
        return $memo[$t['slug']];
    }
    $root = function_exists('webRootDir') ? webRootDir() : dirname(__DIR__, 2);
    $logoPath = $root . '/' . ltrim($t['logo'], '/');
    if (!function_exists('imagecreatetruecolor') || !is_file($logoPath) || !str_ends_with(strtolower($logoPath), '.png')) {
        return $memo[$t['slug']] = null;
    }

    $scale = 2;
    $cache = sys_get_temp_dir() . '/apg-email-header-' . md5(json_encode([
        $t['slug'], $t['headerBg'], $t['accent'], $t['pageBg'], $t['radius'], $t['logoWidth'], $logoPath, filemtime($logoPath), 1,
    ])) . '.png';
    if (!is_file($cache)) {
        $logo = @imagecreatefrompng($logoPath);
        if ($logo === false) {
            return $memo[$t['slug']] = null;
        }
        $width = EMAIL_WIDTH * $scale;
        $padX = 32 * $scale;
        $padY = 26 * $scale;
        $logoW = (int)$t['logoWidth'] * $scale;
        $logoH = (int)round(imagesy($logo) * $logoW / imagesx($logo));
        $bar = 3 * $scale;
        $height = $padY * 2 + $logoH + $bar;
        $radius = (int)$t['radius'] * $scale;

        $img = imagecreatetruecolor($width, $height);
        $color = static function (string $hex) use ($img): int {
            [$r, $g, $b] = sscanf(ltrim($hex, '#'), '%02x%02x%02x');
            return imagecolorallocate($img, $r, $g, $b);
        };
        $band = $color($t['headerBg']);
        // Page colour outside the rounded corners, then the band, then the accent line.
        imagefilledrectangle($img, 0, 0, $width - 1, $height - 1, $color($t['pageBg']));
        if ($radius > 0) {
            imagefilledrectangle($img, $radius, 0, $width - $radius - 1, $height - 1, $band);
            imagefilledrectangle($img, 0, $radius, $width - 1, $height - 1, $band);
            imagefilledellipse($img, $radius, $radius, $radius * 2, $radius * 2, $band);
            imagefilledellipse($img, $width - $radius - 1, $radius, $radius * 2, $radius * 2, $band);
        } else {
            imagefilledrectangle($img, 0, 0, $width - 1, $height - 1, $band);
        }
        imagefilledrectangle($img, 0, $height - $bar, $width - 1, $height - 1, $color($t['accent']));
        imagealphablending($img, true);
        imagecopyresampled($img, $logo, $padX, $padY, 0, 0, $logoW, $logoH, imagesx($logo), imagesy($logo));
        imagedestroy($logo);
        $ok = imagepng($img, $cache . '.tmp', 9) && rename($cache . '.tmp', $cache);
        imagedestroy($img);
        if (!$ok) {
            return $memo[$t['slug']] = null;
        }
    }
    return $memo[$t['slug']] = ['path' => $cache, 'name' => $t['slug'] . '-header.png', 'type' => 'image/png', 'cid' => EMAIL_HEADER_CID];
}

/** Sends a rendered email with the brand header (or logo) embedded; $attachments are regular file attachments. */
function emailSend(array $t, $to, string $subject, string $html, ?string $replyTo = null, ?string $replyName = null, array $attachments = []): bool {
    $brand = emailHeaderAttachment($t) ?? emailLogoAttachment($t);
    try {
        return (bool)(new Mailer())->send($to, $subject, $html, $replyTo, $replyName, $brand ? array_merge([$brand], $attachments) : $attachments);
    } catch (Throwable $e) {
        error_log('Email send failed (' . $subject . '): ' . $e->getMessage());
        return false;
    }
}

/** First name only, never anything URL-like (confirmation emails go to an address anyone could type). */
function emailSafeFirstName(string $name): string {
    $first = trim(explode(' ', trim(preg_replace('/\s+/', ' ', $name)))[0] ?? '');
    if ($first === '' || mb_strlen($first) > 30 || preg_match('#[/:@.<>]|www|http#i', $first)) {
        return 'there';
    }
    return $first;
}

/**
 * Confirmation emails go to an address typed into a public form, so they repeat nothing the visitor
 * wrote (no message, no URLs) and are capped per recipient to stop the forms being used to spam.
 */
function emailConfirmationAllowed(string $email): bool {
    return rateLimit('confirm-' . strtolower($email), 3, 86400);
}
