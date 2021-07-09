<?php
if (!defined('IN_DCONLINE'))
{
    exit;
}

$one_year = 365 * 24 * 60 * 60;
$one_month = 30 * 24 * 60 * 60;
$one_day = 24*60*60;

function mail_utf8($to, $subject = '(No subject)', $message = '', $from='') {
    $header = "MIME-Version: 1.0\n".
        "Content-type: text/plain; charset=UTF-8\n".
        "Date: ".date("r (T)")."\n".
        "From: ".$from." <" . $from . ">\n".
        "Reply-To: ". $from;
    $params = "-f".$from;
    return mail($to, '=?UTF-8?B?'.base64_encode($subject).'?=', $message, $header, $params);
}

function convertSugarToView($sugar,$whole,$mmol){
    return $sugar*($whole?1:1.12)*($mmol?1:18);
}
function convertViewToSugar($sugar,$whole,$mmol){
    return $sugar/(($whole?1:1.12)*($mmol?1:18));
}

function dieDB($error){
    if (defined('DEBUG') && DEBUG==true){
        die('DB error '.$error);
    }else{
        die('DB error');
    }
}
