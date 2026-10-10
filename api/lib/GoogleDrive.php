<?php
/**
 * Read-only Google Drive client authenticated as a service account.
 * GOOGLE_SA_KEY_B64 holds the service-account JSON key, base64-encoded on one line.
 * All functions return null on failure (and error_log why) so callers can skip a sync.
 */

function googleDriveToken(): ?string {
    $key = json_decode((string)base64_decode((string)getenv('GOOGLE_SA_KEY_B64'), true), true);
    if (!is_array($key) || empty($key['client_email']) || empty($key['private_key'])) {
        error_log('GoogleDrive: GOOGLE_SA_KEY_B64 missing or invalid');
        return null;
    }
    $b64url = static fn(string $s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    $tokenUri = $key['token_uri'] ?? 'https://oauth2.googleapis.com/token';
    $now = time();
    $unsigned = $b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.' . $b64url(json_encode([
        'iss' => $key['client_email'],
        'scope' => 'https://www.googleapis.com/auth/drive.readonly',
        'aud' => $tokenUri,
        'iat' => $now,
        'exp' => $now + 3600,
    ]));
    if (!openssl_sign($unsigned, $signature, $key['private_key'], OPENSSL_ALGO_SHA256)) {
        error_log('GoogleDrive: could not sign JWT');
        return null;
    }
    $response = googleDriveRequest($tokenUri, null, [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $unsigned . '.' . $b64url($signature),
    ]);
    $json = $response === null ? null : json_decode($response, true);
    return is_string($json['access_token'] ?? null) ? $json['access_token'] : null;
}

/** GET (or form POST when $form is given) with an optional bearer token; returns the body or null. */
function googleDriveRequest(string $url, ?string $token, ?array $form = null): ?string {
    $ch = curl_init($url);
    $headers = $token ? ['Authorization: Bearer ' . $token] : [];
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_HTTPHEADER => $headers]);
    if ($form !== null) {
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query($form)]);
    }
    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $status !== 200) {
        error_log('GoogleDrive: HTTP ' . $status . ' for ' . strtok($url, '?') . ' ' . substr((string)$body, 0, 200));
        return null;
    }
    return $body;
}

/** Children of a folder: [['id','name','mimeType','size','createdTime','modifiedTime'], ...] or null on error. */
function googleDriveChildren(string $token, string $folderId): ?array {
    $files = [];
    $pageToken = '';
    do {
        $query = http_build_query([
            'q' => "'" . str_replace("'", "\\'", $folderId) . "' in parents and trashed = false",
            'fields' => 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime)',
            'pageSize' => 1000,
            'supportsAllDrives' => 'true',
            'includeItemsFromAllDrives' => 'true',
            'pageToken' => $pageToken,
        ]);
        $body = googleDriveRequest('https://www.googleapis.com/drive/v3/files?' . $query, $token);
        $json = $body === null ? null : json_decode($body, true);
        if (!is_array($json)) {
            return null;
        }
        array_push($files, ...($json['files'] ?? []));
        $pageToken = (string)($json['nextPageToken'] ?? '');
    } while ($pageToken !== '');
    return $files;
}

/** Plain-text export of a Google Doc, or null. */
function googleDriveDocText(string $token, string $fileId): ?string {
    return googleDriveRequest(
        'https://www.googleapis.com/drive/v3/files/' . rawurlencode($fileId) . '/export?mimeType=text%2Fplain',
        $token
    );
}

/** Raw bytes of a binary file (e.g. a listing photo), or null. */
function googleDriveDownload(string $token, string $fileId): ?string {
    return googleDriveRequest(
        'https://www.googleapis.com/drive/v3/files/' . rawurlencode($fileId) . '?alt=media&supportsAllDrives=true',
        $token
    );
}
