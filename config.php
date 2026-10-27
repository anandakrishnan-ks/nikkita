<?php
declare(strict_types=1);

// Keep credentials in hosting environment variables or in a PHP file outside the web root.
// Set NIKKI_PRIVATE_CONFIG to the absolute path of that file if your host cannot set env vars.
$privateConfig = getenv('NIKKI_PRIVATE_CONFIG') ?: dirname(__DIR__) . '/nikki-mail-config.php';
$overrides = is_file($privateConfig) ? require $privateConfig : [];
if (!is_array($overrides)) {
    $overrides = [];
}

return array_replace([
    'smtp_host' => getenv('NIKKI_SMTP_HOST') ?: 'smtpout.secureserver.net',
    'smtp_port' => (int) (getenv('NIKKI_SMTP_PORT') ?: 465),
    'smtp_encryption' => getenv('NIKKI_SMTP_ENCRYPTION') ?: 'ssl',
    'smtp_user' => getenv('NIKKI_SMTP_USER') ?: 'info@nikkiadvisory.com',
    'smtp_password' => getenv('NIKKI_SMTP_PASSWORD') ?: '',
    'mail_to' => getenv('NIKKI_MAIL_TO') ?: 'info@nikkiadvisory.com',
    'recaptcha_secret' => getenv('NIKKI_RECAPTCHA_SECRET') ?: '',
    'recaptcha_min_score' => 0.5,
    'allowed_host' => 'nikkiadvisory.com',
], $overrides);
