<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => $status === 200, 'message' => $message]);
    exit;
}

function field(string $key, int $max = 500): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        respond(400, 'Please check your form details and try again.');
    }
    $value = trim(preg_replace('/[\x00-\x1F\x7F]/u', ' ', $value) ?? '');
    if (strlen($value) > $max) {
        respond(400, 'Please shorten your response and try again.');
    }
    return $value;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, 'This endpoint accepts form submissions only.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    respond(413, 'Your enquiry is too long. Please shorten it and try again.');
}

$config = require dirname(__DIR__, 2) . '/config.php';
if (!$config['smtp_password'] || !$config['recaptcha_secret']) {
    error_log('Nikki enquiry mailer is missing its private configuration.');
    respond(503, 'The enquiry service is temporarily unavailable. Please email us directly.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array(parse_url($origin, PHP_URL_HOST), [$config['allowed_host'], 'www.' . $config['allowed_host']], true)) {
    respond(403, 'This submission could not be verified.');
}

// A filled honeypot is treated as an accepted submission so bots get no feedback.
if (field('company_site', 200) !== '' || field('website', 200) !== '') {
    respond(200, 'Thank you. Your enquiry has been received.');
}

$name = field('name', 120);
$email = field('email', 254);
$phone = field('phone', 32);
$dialCode = field('dial_code', 8);
$formId = field('form_id', 80);
$token = field('g-recaptcha-response', 3000);
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $phone === '' || !preg_match('/^[a-z0-9-]{2,80}$/', $formId) || $token === '') {
    respond(400, 'Please complete the required fields and try again.');
}
if (!preg_match('/^\+[1-9][0-9]{0,5}$/', $dialCode)) {
    respond(400, 'Please choose a valid country code.');
}
$normalizedPhone = preg_replace('/[\s().-]+/', '', $phone);
if ($dialCode !== '' && str_starts_with($normalizedPhone, $dialCode)) {
    $normalizedPhone = substr($normalizedPhone, strlen($dialCode));
}
if (!preg_match('/^[0-9]{6,15}$/', $normalizedPhone)) {
    respond(400, 'Please enter a valid phone number.');
}
$fullPhone = trim(($dialCode ?: '') . ' ' . $normalizedPhone);

$verifyRequest = http_build_query([
    'secret' => $config['recaptcha_secret'],
    'response' => $token,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
]);
if (!function_exists('curl_init')) {
    error_log('Nikki enquiry mailer requires the PHP cURL extension.');
    respond(503, 'Verification is temporarily unavailable. Please try again.');
}
$curl = curl_init('https://www.google.com/recaptcha/api/siteverify');
if ($curl === false) {
    respond(503, 'Verification is temporarily unavailable. Please try again.');
}
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $verifyRequest,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$verifyBody = curl_exec($curl);
$verifyCode = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);
$verification = is_string($verifyBody) ? json_decode($verifyBody, true) : null;
if ($verifyCode !== 200 || !is_array($verification)) {
    respond(503, 'Verification is temporarily unavailable. Please try again.');
}
if (empty($verification['success']) || ($verification['action'] ?? '') !== 'enquiry' ||
    !in_array($verification['hostname'] ?? '', [$config['allowed_host'], 'www.' . $config['allowed_host']], true) ||
    (float) ($verification['score'] ?? 0) < (float) $config['recaptcha_min_score']) {
    respond(403, 'We could not verify your submission. Please refresh the page and try again.');
}

$labels = [
    'interest' => 'Market of interest', 'message' => 'Message', 'jurisdiction' => 'Jurisdiction',
    'country' => 'Country', 'business_activity' => 'Business activity',
    'proposed_activity' => 'Proposed activity', 'business_interest' => 'Business interest',
    'service_required' => 'Service required', 'requirement' => 'Requirement',
    'preferred_licence' => 'Preferred licence', 'facility_requirement' => 'Facility requirement',
    'activity_type' => 'Activity type', 'route' => 'Route', 'lead_source' => 'Traffic source',
    'landing_page' => 'Landing page', 'consent' => 'Consent',
];
$formTitle = ucwords(str_replace('-', ' ', $formId));
$contact = ['Name' => $name, 'Email' => $email, 'Phone' => $fullPhone];
$details = [];
$source = ['Form' => $formTitle];
foreach ($labels as $key => $label) {
    $value = field($key, $key === 'requirement' || $key === 'message' ? 4000 : 500);
    if ($value !== '') {
        if ($key === 'lead_source' || $key === 'landing_page') {
            $source[$label] = $value;
        } else {
            $details[$label] = $value;
        }
    }
}
$lines = ['New website enquiry', '', 'Form: ' . $formTitle, '', 'Contact details', 'Name: ' . $name, 'Email: ' . $email, 'Phone: ' . $fullPhone];
if ($details !== []) {
    $lines[] = '';
    $lines[] = 'Enquiry details';
    foreach ($details as $label => $value) {
        $lines[] = $label . ': ' . $value;
    }
}
$lines[] = '';
$lines[] = 'Submission details';
foreach ($source as $label => $value) {
    $lines[] = $label . ': ' . $value;
}

require __DIR__ . '/email-templates.php';
require __DIR__ . '/vendor/phpmailer/Exception.php';
require __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/SMTP.php';

function configuredMailer(array $config): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = (string) $config['smtp_host'];
    $mail->Port = (int) $config['smtp_port'];
    $mail->SMTPAuth = true;
    $mail->Timeout = 15;
    $mail->Username = (string) $config['smtp_user'];
    $mail->Password = (string) $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_encryption'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mail->CharSet = 'UTF-8';
    $mail->isHTML(true);
    return $mail;
}

try {
    $mail = configuredMailer($config);
    $mail->setFrom((string) $config['smtp_user'], 'Nikki Advisory Website');
    $mail->addAddress((string) $config['mail_to']);
    $mail->addReplyTo($email, $name);
    $mail->Subject = 'New website enquiry | ' . $formTitle;
    $mail->Body = staffEmailHtml($formTitle, $contact, $details, $source);
    $mail->AltBody = implode("\n", $lines);
    $mail->send();
} catch (Throwable $error) {
    error_log('Nikki enquiry delivery failed: ' . $error->getMessage());
    respond(502, 'We could not send your enquiry. Please try again or email us directly.');
}

try {
    $reply = configuredMailer($config);
    $reply->setFrom((string) $config['smtp_user'], 'Nikki Advisory');
    $reply->addAddress($email, $name);
    $reply->addReplyTo((string) $config['mail_to'], 'Nikki Advisory');
    $reply->addCustomHeader('Auto-Submitted', 'auto-replied');
    $reply->addCustomHeader('X-Auto-Response-Suppress', 'All');
    $reply->Subject = 'We received your enquiry | Nikki Advisory';
    $reply->Body = acknowledgementEmailHtml();
    $reply->AltBody = "Hello,\n\nThank you for getting in touch. Our team has received your enquiry and will review the details you shared.\n\nWe will reply to you as soon as we can. If you would like to add anything, simply reply to this email.\n\nKind regards,\nNikki Advisory\nhttps://nikkiadvisory.com/";
    $reply->send();
} catch (Throwable $error) {
    error_log('Nikki enquiry acknowledgement failed: ' . $error->getMessage());
}

respond(200, 'Thank you. Your enquiry has been sent. We will get back to you shortly.');
