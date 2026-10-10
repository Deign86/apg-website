<?php
/**
 * Minimal Gemini REST client (generateContent) used by the chatbot and the ATS.
 * Reads GEMINI_API_KEY / GEMINI_MODEL from the environment loaded by config.php.
 * Returns null on any failure so callers can fall back to non-AI behaviour.
 */

function geminiEnabled(): bool {
    return (string)getenv('GEMINI_API_KEY') !== '';
}

/**
 * @param string $system       System instruction.
 * @param array  $parts        Gemini content parts for the single user turn, e.g.
 *                             [['text' => '...'], ['inline_data' => ['mime_type' => 'application/pdf', 'data' => base64]]].
 * @param array|null $schema   Optional JSON schema; when set the reply is decoded JSON (array).
 * @param array  $history      Prior turns: [['role' => 'user'|'model', 'text' => '...'], ...].
 * @return string|array|null  Reply text, decoded JSON when $schema is given, or null on failure.
 */
function geminiGenerate(string $system, array $parts, ?array $schema = null, array $history = [], int $timeout = 25) {
    if (!geminiEnabled()) {
        return null;
    }
    $contents = [];
    foreach ($history as $turn) {
        $contents[] = ['role' => $turn['role'] === 'model' ? 'model' : 'user', 'parts' => [['text' => (string)$turn['text']]]];
    }
    $contents[] = ['role' => 'user', 'parts' => $parts];

    $body = [
        'systemInstruction' => ['parts' => [['text' => $system]]],
        'contents' => $contents,
        'generationConfig' => ['temperature' => 0.3, 'maxOutputTokens' => 2048],
        // Strictest content filters: this client only serves public-facing business use.
        'safetySettings' => array_map(
            fn($category) => ['category' => $category, 'threshold' => 'BLOCK_LOW_AND_ABOVE'],
            ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT']
        ),
    ];
    if ($schema !== null) {
        $body['generationConfig']['responseMimeType'] = 'application/json';
        $body['generationConfig']['responseSchema'] = $schema;
    }

    // Each model has its own per-minute quota, so a rate-limited (429) or overloaded (503) call is
    // retried once on the fallback model before callers drop to their non-AI path.
    $models = array_unique([getenv('GEMINI_MODEL') ?: 'gemini-3.6-flash', getenv('GEMINI_FALLBACK_MODEL') ?: 'gemini-3.1-flash-lite']);
    foreach ($models as $model) {
        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-goog-api-key: ' . getenv('GEMINI_API_KEY')],
            CURLOPT_POSTFIELDS => json_encode($body),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $timeout,
        ]);
        $raw = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($raw !== false && $status === 200) {
            break;
        }
        // Quota errors carry the metric and limit far past the first 300 characters.
        preg_match_all('/"(?:quotaMetric|quotaId|quotaValue|retryDelay)": *"[^"]*"/', (string)$raw, $quota);
        error_log("Gemini request failed ($model): HTTP $status $err " . substr((string)$raw, 0, 300) . ' ' . implode(' ', $quota[0]));
        if ($status !== 429 && $status !== 503) {
            return null;
        }
    }
    if ($raw === false || $status !== 200) {
        return null;
    }
    $json = json_decode($raw, true);
    $text = '';
    foreach ($json['candidates'][0]['content']['parts'] ?? [] as $part) {
        $text .= $part['text'] ?? '';
    }
    if ($text === '') {
        error_log('Gemini returned no text: ' . substr($raw, 0, 300));
        return null;
    }
    if ($schema === null) {
        return trim($text);
    }
    $decoded = json_decode($text, true);
    return is_array($decoded) ? $decoded : null;
}
