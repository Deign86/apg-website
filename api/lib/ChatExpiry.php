<?php
/**
 * Live chats that nobody has touched for CHAT_IDLE_HOURS close themselves, so abandoned visitors
 * stop sitting in the admin queue as "Waiting". Run lazily (admin inbox load, visitor chat start)
 * instead of by cron: the queue is only ever looked at through those two paths.
 */
const CHAT_IDLE_HOURS = 24;

function expireIdleChats(PDO $pdo): void {
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('
            SELECT id FROM chat_sessions
            WHERE status <> "closed" AND updated_at < NOW() - INTERVAL ? HOUR
            FOR UPDATE
        ');
        $stmt->execute([CHAT_IDLE_HOURS]);
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if ($ids) {
            $note = $pdo->prepare('INSERT INTO chat_messages (session_id, sender, body) VALUES (?, "bot", ?)');
            $close = $pdo->prepare('UPDATE chat_sessions SET status = "closed", closed_at = NOW(), updated_at = NOW() WHERE id = ?');
            $body = 'This conversation was closed automatically after ' . CHAT_IDLE_HOURS . ' hours without activity.';
            foreach ($ids as $id) {
                $note->execute([(int)$id, $body]);
                $close->execute([(int)$id]);
            }
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log('Chat expiry failed: ' . $e->getMessage());
    }
}
