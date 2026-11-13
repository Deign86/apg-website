<?php
/**
 * Standalone SMTP Mailer for Alpha Premier Group
 * Supports Titan Email / Hostinger SMTP over SSL/TLS with file attachments.
 * Every message is multipart/alternative (plain text derived from the HTML + HTML) with its own Date and
 * Message-ID, which spam filters expect, especially for confirmations sent to the public.
 */

class Mailer {
    private $host;
    private $port;
    private $user;
    private $pass;
    private $secure;
    private $fromEmail;
    private $fromName;

    public function __construct() {
        $this->host = SMTP_HOST;
        $this->port = (int)SMTP_PORT;
        $this->user = SMTP_USER;
        $this->pass = SMTP_PASS;
        $this->secure = SMTP_SECURE;
        $this->fromEmail = MAIL_FROM_EMAIL;
        $this->fromName = MAIL_FROM_NAME;
    }

    /**
     * Send email via SMTP socket or fallback to PHP mail().
     * $bcc (comma-separated string or array) gets a blind copy; see bccRecipients().
     */
    public function send($to, $subject, $htmlBody, $replyToEmail = null, $replyToName = null, $attachments = [], $bcc = []) {
        $bcc = self::bccRecipients($bcc, self::recipients($to));
        // If SMTP credentials are provided, attempt SMTP socket delivery
        if (!empty($this->host) && !empty($this->user) && !empty($this->pass)) {
            try {
                return $this->sendViaSmtp($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments, $bcc);
            } catch (Exception $e) {
                error_log('SMTP Send failed: ' . $e->getMessage() . '. Falling back to native mail().');
            }
        }

        // Fallback to PHP native mail()
        return $this->sendViaNativeMail($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments, $bcc);
    }

    private static function recipients($to): array {
        return is_array($to) ? $to : array_values(array_filter(array_map('trim', explode(',', (string)$to))));
    }

    /**
     * Valid Bcc addresses, each once, leaving out any already in $to (case-insensitive) so no inbox
     * gets the message twice. Invalid entries are logged and skipped.
     */
    public static function bccRecipients($bcc, array $to): array {
        $seen = array_map('strtolower', $to);
        $valid = [];
        foreach (self::recipients($bcc) as $address) {
            if (!filter_var($address, FILTER_VALIDATE_EMAIL)) {
                error_log("Mailer: skipping invalid Bcc address \"{$address}\"");
            } elseif (!in_array(strtolower($address), $seen, true)) {
                $seen[] = strtolower($address);
                $valid[] = $address;
            }
        }
        return $valid;
    }

    private static function encodeHeader(string $value): string {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    /** Readable plain-text version of an HTML email (links kept as "text (url)"). */
    public static function htmlToText(string $html): string {
        $html = preg_replace('#<(head|style|script)\b[^>]*>.*?</\1>#is', '', $html);
        $html = preg_replace('#<span[^>]*display:\s*none[^>]*>.*?</span>#is', '', $html); // preheader
        $html = preg_replace_callback('#<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>#is', static function ($m) {
            $text = trim(strip_tags($m[2]));
            $href = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            return ($text === '' || $text === $href || str_starts_with($href, 'mailto:')) ? $text : "$text ($href)";
        }, $html);
        $html = preg_replace('#<br\s*/?>#i', "\n", $html);
        $html = preg_replace('#</(p|div|tr|h[1-6]|li|table)>#i', "\n", $html);
        $html = preg_replace('#</td>#i', '  ', $html);
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace("/[ \t\x{00A0}]+/u", ' ', $text);
        $text = preg_replace("/ *\n */", "\n", $text);
        return trim(preg_replace("/\n{3,}/", "\n\n", $text));
    }

    /** One base64 MIME part for a file; inline when it has a Content-ID (referenced as cid: in the HTML). */
    private static function filePart(array $att): string {
        $fileName = self::encodeHeader(!empty($att['name']) ? $att['name'] : basename($att['path']));
        $mimeType = !empty($att['type']) ? $att['type'] : 'application/octet-stream';
        $part = "Content-Type: {$mimeType}; name=\"{$fileName}\"\r\n";
        $part .= !empty($att['cid'])
            ? "Content-ID: <{$att['cid']}>\r\nContent-Disposition: inline; filename=\"{$fileName}\"\r\n"
            : "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n";
        return $part . "Content-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode(file_get_contents($att['path'])));
    }

    /**
     * MIME body (after the top-level headers):
     *   mixed (only with attachments)
     *   └ related (only with inline cid images) → alternative (text, html) + inline images
     *   └ attachments
     */
    private function buildBody(string $htmlBody, array $attachments, array &$headers): string {
        $files = array_filter($attachments, static fn($att) => !empty($att['path']) && is_file($att['path']));
        $inline = array_filter($files, static fn($att) => !empty($att['cid']));
        $regular = array_filter($files, static fn($att) => empty($att['cid']));

        $alt = '=_APG_ALT_' . bin2hex(random_bytes(8));
        $type = "multipart/alternative; boundary=\"{$alt}\"";
        $body = "--{$alt}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode(self::htmlToText($htmlBody)))
            . "--{$alt}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($htmlBody))
            . "--{$alt}--\r\n";

        if ($inline) {
            $rel = '=_APG_REL_' . bin2hex(random_bytes(8));
            $related = "--{$rel}\r\nContent-Type: {$type}\r\n\r\n" . $body;
            foreach ($inline as $att) {
                $related .= "--{$rel}\r\n" . self::filePart($att);
            }
            $body = $related . "--{$rel}--\r\n";
            $type = "multipart/related; type=\"multipart/alternative\"; boundary=\"{$rel}\"";
        }

        if ($regular) {
            $mixed = '=_APG_MIX_' . bin2hex(random_bytes(8));
            $withFiles = "--{$mixed}\r\nContent-Type: {$type}\r\n\r\n" . $body;
            foreach ($regular as $att) {
                $withFiles .= "--{$mixed}\r\n" . self::filePart($att);
            }
            $body = $withFiles . "--{$mixed}--\r\n";
            $type = "multipart/mixed; boundary=\"{$mixed}\"";
        }

        $headers[] = "Content-Type: {$type}";
        return $body;
    }

    /** From, Reply-To, MIME-Version, Date and Message-ID; each transport adds To and Subject its own way. */
    private function commonHeaders(?string $replyToEmail, ?string $replyToName): array {
        $headers = ["From: " . self::encodeHeader($this->fromName) . " <{$this->fromEmail}>"];
        if ($replyToEmail) {
            $rName = $replyToName ? self::encodeHeader($replyToName) . ' ' : '';
            $headers[] = "Reply-To: {$rName}<{$replyToEmail}>";
        }
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . bin2hex(random_bytes(12)) . '@' . substr(strrchr($this->fromEmail, '@') ?: '@localhost', 1) . ">";
        return $headers;
    }

    private function sendViaSmtp($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments, array $bcc) {
        $recipients = self::recipients($to);
        if (empty($recipients)) {
            throw new Exception("No recipient email specified");
        }

        $hostPrefix = ($this->secure === 'ssl' || $this->port === 465) ? 'ssl://' : '';
        $timeout = 15;
        $socket = @fsockopen($hostPrefix . $this->host, $this->port, $errno, $errstr, $timeout);

        if (!$socket) {
            throw new Exception("Could not connect to SMTP server {$this->host}:{$this->port} ($errstr)");
        }

        $this->readResponse($socket, 220);

        $clientHost = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
        $this->sendCommand($socket, "EHLO {$clientHost}", 250);

        if ($this->secure === 'tls' && $this->port !== 465) {
            $this->sendCommand($socket, "STARTTLS", 220);
            if (@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) !== true) {
                fclose($socket);
                throw new Exception('STARTTLS negotiation failed; not sending credentials in cleartext');
            }
            $this->sendCommand($socket, "EHLO {$clientHost}", 250);
        } elseif ($hostPrefix !== 'ssl://') {
            fclose($socket);
            throw new Exception('SMTP_SECURE must be ssl or tls; refusing unencrypted AUTH');
        }

        // Authenticate
        $this->sendCommand($socket, "AUTH LOGIN", 334);
        $this->sendCommand($socket, base64_encode($this->user), 334);
        $this->sendCommand($socket, base64_encode($this->pass), 235);

        // Mail From / Rcpt To
        $this->sendCommand($socket, "MAIL FROM: <{$this->fromEmail}>", 250);
        foreach ($recipients as $rcpt) {
            $this->sendCommand($socket, "RCPT TO: <{$rcpt}>", 250);
        }
        // Bcc goes in the envelope only. A refused copy is logged and skipped; the To delivery goes ahead.
        foreach ($bcc as $rcpt) {
            try {
                $this->sendCommand($socket, "RCPT TO: <{$rcpt}>", 250);
            } catch (Exception $e) {
                error_log("SMTP Bcc <{$rcpt}> refused: " . trim($e->getMessage()));
            }
        }

        // Data
        $this->sendCommand($socket, "DATA", 354);

        $headers = [
            "To: " . implode(', ', array_map(fn($r) => "<{$r}>", $recipients)),
            "Subject: " . self::encodeHeader($subject),
            ...$this->commonHeaders($replyToEmail, $replyToName),
        ];
        $body = $this->buildBody($htmlBody, $attachments, $headers);

        // Base64 parts never start a line with "." so no dot-stuffing is needed.
        fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
        $this->readResponse($socket, 250);

        $this->sendCommand($socket, "QUIT", 221);
        fclose($socket);
        return true;
    }

    private function sendViaNativeMail($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments, array $bcc) {
        $recipients = self::recipients($to);
        if (empty($recipients)) return false;

        $headers = $this->commonHeaders($replyToEmail, $replyToName);
        if ($bcc) {
            $headers[] = 'Bcc: ' . implode(', ', $bcc); // sendmail delivers to it and strips the header
        }
        $body = $this->buildBody($htmlBody, $attachments, $headers);

        return @mail(implode(', ', $recipients), self::encodeHeader($subject), $body, implode("\r\n", $headers));
    }

    private function sendCommand($socket, $cmd, $expectedCode) {
        fwrite($socket, $cmd . "\r\n");
        return $this->readResponse($socket, $expectedCode);
    }

    private function readResponse($socket, $expectedCode) {
        $response = '';
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        $code = (int)substr($response, 0, 3);
        if ($code !== $expectedCode) {
            throw new Exception("SMTP Error [$code]: $response");
        }
        return $response;
    }
}
