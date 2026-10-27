<?php
declare(strict_types=1);

function mailEscape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function mailLayout(string $eyebrow, string $title, string $intro, string $content): string
{
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>' .
        '<body style="margin:0;padding:0;background:#f2f5f1;color:#18372b;font-family:Arial,Helvetica,sans-serif;">' .
        '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f2f5f1;"><tr><td align="center" style="padding:32px 16px;">' .
        '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:#ffffff;border:1px solid #dbe4da;">' .
        '<tr><td style="padding:28px 32px;background:#12382b;border-bottom:4px solid #bc924b;">' .
        '<p style="margin:0;color:#d8b66f;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Nikki Advisory</p>' .
        '<p style="margin:16px 0 8px;color:#d8b66f;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">' . mailEscape($eyebrow) . '</p>' .
        '<h1 style="margin:0;color:#ffffff;font-size:27px;line-height:1.25;font-weight:600;">' . mailEscape($title) . '</h1></td></tr>' .
        '<tr><td style="padding:30px 32px 34px;">' .
        '<p style="margin:0 0 24px;color:#405549;font-size:15px;line-height:1.7;">' . mailEscape($intro) . '</p>' .
        $content . '</td></tr>' .
        '<tr><td style="padding:18px 32px;background:#f8faf7;border-top:1px solid #e0e7de;">' .
        '<p style="margin:0;color:#617268;font-size:12px;line-height:1.6;">Nikki Advisory &nbsp;·&nbsp; UAE, Saudi Arabia &amp; Bahrain<br>' .
        '<a href="https://nikkiadvisory.com/" style="color:#426d55;text-decoration:underline;">nikkiadvisory.com</a></p>' .
        '</td></tr></table></td></tr></table></body></html>';
}

function mailRows(array $rows): string
{
    $html = '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #dfe7dd;">';
    foreach ($rows as $label => $value) {
        $html .= '<tr><td style="padding:13px 0;border-bottom:1px solid #e8eee6;overflow-wrap:anywhere;">' .
            '<p style="margin:0 0 4px;color:#53675a;font-size:11px;font-weight:700;line-height:1.5;text-transform:uppercase;letter-spacing:.5px;">' . mailEscape((string) $label) . '</p>' .
            '<p style="margin:0;color:#17382b;font-size:14px;line-height:1.6;">' . nl2br(mailEscape((string) $value), false) . '</p>' .
            '</td></tr>';
    }
    return $html . '</table>';
}

function staffEmailHtml(string $formTitle, array $contact, array $details, array $source): string
{
    $content = '<h2 style="margin:0 0 10px;color:#17382b;font-size:17px;">Contact details</h2>' . mailRows($contact);
    if ($details !== []) {
        $content .= '<h2 style="margin:28px 0 10px;color:#17382b;font-size:17px;">Enquiry details</h2>' . mailRows($details);
    }
    $content .= '<h2 style="margin:28px 0 10px;color:#17382b;font-size:17px;">Submission details</h2>' . mailRows($source);
    $content .= '<p style="margin:24px 0 0;color:#405549;font-size:13px;line-height:1.6;">Use Reply to respond directly to the person who submitted this enquiry.</p>';
    return mailLayout('New website enquiry', $formTitle, 'A new enquiry has been submitted through the Nikki Advisory website.', $content);
}

function acknowledgementEmailHtml(): string
{
    $content = '<p style="margin:0 0 18px;color:#253f31;font-size:15px;line-height:1.75;">Thank you for getting in touch. Our team has received your enquiry and will review the details you shared.</p>' .
        '<p style="margin:0 0 26px;color:#253f31;font-size:15px;line-height:1.75;">We will reply to you as soon as we can. If you would like to add anything, simply reply to this email.</p>' .
        '<p style="margin:0;color:#17382b;font-size:14px;line-height:1.7;">Kind regards,<br><strong>Nikki Advisory</strong></p>';
    return mailLayout('Enquiry received', 'Thank you for contacting us', 'Hello,', $content);
}
