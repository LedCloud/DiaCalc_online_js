<?php
define('IN_DCONLINE', true);
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

include_once 'inc/module.php';

$auth = new auth(); //~ Создаем новый объект класса

//~ Проверка авторизации
if (!$auth->check()){
    header('Location: login.php?'.htmlspecialchars(SID));
    exit();
}

require_once( 'libs/Smarty.class.php');
include_once 'inc/functions.php';

$smarty = new Smarty();

$user_id = $_SESSION['id_user'];

$settings = $auth->getSettings($user_id);

$smarty->assign('settings',$settings);
$smarty->assign('sid',htmlspecialchars(SID));

if ($auth->useMobile()){
    $smarty->display('coefs.tpl');
}else{
    $smarty->display('coefs_d.tpl');
}