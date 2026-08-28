<?php
/**
 * Standalone SMTP Mailer for Alpha Premier Group
 * Supports Titan Email / Hostinger SMTP over SSL/TLS with file attachments.
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
     * Send email via SMTP socket or fallback to PHP mail()
     */
    public function send($to, $subject, $htmlBody, $replyToEmail = null, $replyToName = null, $attachments = []) {
        // If SMTP credentials are provided, attempt SMTP socket delivery
        if (!empty($this->host) && !empty($this->user) && !empty($this->pass)) {
            try {
                return $this->sendViaSmtp($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments);
            } catch (Exception $e) {
                error_log('SMTP Send failed: ' . $e->getMessage() . '. Falling back to native mail().');
            }
        }

        // Fallback to PHP native mail()
        return $this->sendViaNativeMail($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments);
    }

    private function sendViaSmtp($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments) {
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
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $this->sendCommand($socket, "EHLO {$clientHost}", 250);
        }

        // Authenticate
        $this->sendCommand($socket, "AUTH LOGIN", 334);
        $this->sendCommand($socket, base64_encode($this->user), 334);
        $this->sendCommand($socket, base64_encode($this->pass), 235);

        // Mail From / Rcpt To
        $this->sendCommand($socket, "MAIL FROM: <{$this->fromEmail}>", 250);
        $this->sendCommand($socket, "RCPT TO: <{$to}>", 250);

        // Data
        $this->sendCommand($socket, "DATA", 354);

        $boundary = "----=_APG_BOUNDARY_" . md5(uniqid(time()));
        $headers = [];
        $headers[] = "From: =?UTF-8?B?" . base64_encode($this->fromName) . "?= <{$this->fromEmail}>";
        $headers[] = "To: <{$to}>";
        if ($replyToEmail) {
            $rName = $replyToName ? "=?UTF-8?B?" . base64_encode($replyToName) . "?= " : '';
            $headers[] = "Reply-To: {$rName}<{$replyToEmail}>";
        }
        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . md5(uniqid(time())) . "@{$clientHost}>";

        if (empty($attachments)) {
            $headers[] = "Content-Type: text/html; charset=UTF-8";
            $headers[] = "Content-Transfer-Encoding: base64";
            $payload = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.\r\n";
        } else {
            $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";
            $payload = implode("\r\n", $headers) . "\r\n\r\n";
            $payload .= "--{$boundary}\r\n";
            $payload .= "Content-Type: text/html; charset=UTF-8\r\n";
            $payload .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $payload .= chunk_split(base64_encode($htmlBody)) . "\r\n";

            foreach ($attachments as $att) {
                if (!file_exists($att['path'])) continue;
                $fileName = !empty($att['name']) ? $att['name'] : basename($att['path']);
                $fileData = chunk_split(base64_encode(file_get_contents($att['path'])));
                $mimeType = !empty($att['type']) ? $att['type'] : 'application/octet-stream';

                $payload .= "--{$boundary}\r\n";
                $payload .= "Content-Type: {$mimeType}; name=\"=?UTF-8?B?" . base64_encode($fileName) . "?=\"\r\n";
                $payload .= "Content-Disposition: attachment; filename=\"=?UTF-8?B?" . base64_encode($fileName) . "?=\"\r\n";
                $payload .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $payload .= $fileData . "\r\n";
            }
            $payload .= "--{$boundary}--\r\n.\r\n";
        }

        fwrite($socket, $payload);
        $this->readResponse($socket, 250);

        $this->sendCommand($socket, "QUIT", 221);
        fclose($socket);
        return true;
    }

    private function sendViaNativeMail($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments) {
        $boundary = "----=_APG_BOUNDARY_" . md5(uniqid(time()));
        $headers = [];
        $headers[] = "From: =?UTF-8?B?" . base64_encode($this->fromName) . "?= <{$this->fromEmail}>";
        if ($replyToEmail) {
            $rName = $replyToName ? "=?UTF-8?B?" . base64_encode($replyToName) . "?= " : '';
            $headers[] = "Reply-To: {$rName}<{$replyToEmail}>";
        }
        $headers[] = "MIME-Version: 1.0";

        if (empty($attachments)) {
            $headers[] = "Content-Type: text/html; charset=UTF-8";
            $headers[] = "Content-Transfer-Encoding: 8bit";
            $message = $htmlBody;
        } else {
            $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";
            $message = "--{$boundary}\r\n";
            $message .= "Content-Type: text/html; charset=UTF-8\r\n";
            $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $message .= $htmlBody . "\r\n\r\n";

            foreach ($attachments as $att) {
                if (!file_exists($att['path'])) continue;
                $fileName = !empty($att['name']) ? $att['name'] : basename($att['path']);
                $fileData = chunk_split(base64_encode(file_get_contents($att['path'])));
                $mimeType = !empty($att['type']) ? $att['type'] : 'application/octet-stream';

                $message .= "--{$boundary}\r\n";
                $message .= "Content-Type: {$mimeType}; name=\"{$fileName}\"\r\n";
                $message .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $message .= $fileData . "\r\n\r\n";
            }
            $message .= "--{$boundary}--";
        }

        return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $message, implode("\r\n", $headers));
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
