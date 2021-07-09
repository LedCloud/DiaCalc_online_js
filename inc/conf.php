<?php
if (!defined('IN_DCONLINE'))
{
    exit;
}

//~ Параметры подключения к бд
$db_host = 'localhost';
$db_login = 'diacalc'; //~ логин для подключения
$db_passwd = 'diacalctest'; //~ пароль для подключения
$db_name = 'diacalc_backup'; //~ Имя таблицы

// подключаемся к бд
//$db = new mysql($db_host, $db_login, $db_passwd, $db_name); //~ Создаем новый объект класса

$base = new mysqli($db_host, $db_login, $db_passwd, $db_name );
if ($base->connect_error) {
    die('Ошибка подключения (' . $base->connect_errno . ') '
           . $base->connect_error);
}
$base->set_charset("utf8");

