<?php
define('IN_DCONLINE', true);
include_once 'inc/module.php';
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * Обработка групп
 */

$auth = new auth(); //~ Создаем новый объект класса

//~ Проверка авторизации
if (!$auth->check()){
    //Не авторизированы
    header('Location: login.php?'.htmlspecialchars(SID));
    exit;
}
    
if (!$auth->useMobile()){
    header('Location: index.php?'.htmlspecialchars(SID));
    exit;
}
    
require_once( 'libs/Smarty.class.php');

$smarty = new Smarty();
$smarty->assign('sid',htmlspecialchars(SID));
$user_id = $_SESSION['id_user'];

$smarty->assign('groups', $auth->loadCountedGroups($user_id));

$smarty->display('groupsmgr.tpl');


